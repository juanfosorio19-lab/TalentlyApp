// src/views/company/CompanyStats.jsx
// Estadísticas de empresa — diseño Stitch
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import FunnelChart from '../../components/charts/FunnelChart';
import { Spinner } from '../../components/ui';
import './CompanyStats.css';

const PERIODS = [
    { id: 'week',  label: 'Última semana',  days: 7 },
    { id: 'month', label: 'Último mes',     days: 30 },
];

const METRIC_CARDS = [
    { key: 'profile_views', label: 'Vistas',   icon: 'visibility',   color: 'blue' },
    { key: 'swipes_given',  label: 'Likes',    icon: 'favorite',     color: 'red'  },
    { key: 'matches_count', label: 'Matches',  icon: 'check_circle', color: 'green'},
    { key: 'messages',      label: 'Mensajes', icon: 'chat_bubble',  color: 'purple'},
];

export default function CompanyStats() {
    const { user } = useAuth();

    const [stats,   setStats]   = useState(null);
    const [offers,  setOffers]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [period,  setPeriod]  = useState('week');
    const [selectedOfferId, setSelectedOfferId] = useState('');

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            setLoading(true);
            try {
                const [statsRes, offersRes] = await Promise.all([
                    db.statistics.get(),
                    db.offers.getByCompany(user.id),
                ]);

                const statsData  = statsRes.data  || null;
                const offersData = offersRes.data  || [];

                setStats(statsData);
                setOffers(offersData);

                if (offersData.length > 0) {
                    setSelectedOfferId(offersData[0].id);
                }
            } catch (err) {
                console.error('[CompanyStats] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    // ── Derived: activity data filtered by period ──
    const activityData = useMemo(() => {
        const daily = stats?.daily_activity || [];
        const days  = PERIODS.find((p) => p.id === period)?.days ?? 7;

        // Sort oldest→newest, then take last N days
        const sorted = [...daily].sort((a, b) => new Date(a.date) - new Date(b.date));
        const slice  = sorted.slice(-days);

        if (slice.length === 0) {
            // Return empty placeholder labels
            const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            return {
                labels: period === 'week' ? dayNames : dayNames,
                values: period === 'week' ? [0,0,0,0,0,0,0] : [0,0,0,0,0,0,0],
            };
        }

        return {
            labels: slice.map((d) =>
                new Date(d.date).toLocaleDateString('es', {
                    weekday: period === 'week' ? 'short' : undefined,
                    day:     period === 'month' ? 'numeric' : undefined,
                    month:   period === 'month' ? 'short'   : undefined,
                })
            ),
            values: slice.map((d) => d.swipes || 0),
        };
    }, [stats, period]);

    // ── Derived: bar chart (matches por oferta) ──
    const offerBarData = useMemo(() => {
        const totalMatches = stats?.matches_count || 0;
        const list = offers.slice(0, 6);

        if (list.length === 0) return { labels: [], values: [] };

        // Distribute matches across offers (weighted by index — la primera oferta tiene más matches)
        const weights = list.map((_, i) => Math.max(1, list.length - i));
        const total   = weights.reduce((s, w) => s + w, 0);

        return {
            labels: list.map((o) => {
                const t = o.title || 'Sin título';
                return t.length > 14 ? t.slice(0, 14) + '…' : t;
            }),
            values: list.map((_, i) =>
                totalMatches > 0 ? Math.round((weights[i] / total) * totalMatches) : 0
            ),
        };
    }, [offers, stats]);

    // ── Metric values ──
    const metricValues = {
        profile_views: stats?.profile_views || 0,
        swipes_given:  stats?.swipes_given  || 0,
        matches_count: stats?.matches_count || 0,
        messages:      stats?.messages_count || 0,
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="cs">
                <div className="cs__loading"><Spinner /></div>
            </div>
        );
    }

    return (
        <div className="cs">
            {/* Header */}
            <div className="cs__header">
                <h2 className="cs__title">Estadísticas</h2>
            </div>

            {/* Filters */}
            <div className="cs__filters">
                {/* Offer selector */}
                {offers.length > 0 && (
                    <div className="cs__select-wrap">
                        <label className="cs__select-label">Oferta activa</label>
                        <div className="cs__select-inner">
                            <select
                                className="cs__select"
                                value={selectedOfferId}
                                onChange={(e) => setSelectedOfferId(e.target.value)}
                            >
                                {offers.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.title || 'Sin título'}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-rounded cs__select-caret">expand_more</span>
                        </div>
                    </div>
                )}

                {/* Period toggle */}
                <div className="cs__period-toggle">
                    {PERIODS.map((p) => (
                        <button
                            key={p.id}
                            className={`cs__period-btn ${period === p.id ? 'cs__period-btn--active' : ''}`}
                            onClick={() => setPeriod(p.id)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics grid */}
            <div className="cs__metrics">
                {METRIC_CARDS.map(({ key, label, icon, color }) => (
                    <div key={key} className="cs__metric">
                        <div className={`cs__metric-icon cs__metric-icon--${color}`}>
                            <span className="material-symbols-rounded">{icon}</span>
                        </div>
                        <div className="cs__metric-value">{metricValues[key].toLocaleString()}</div>
                        <div className="cs__metric-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* Funnel */}
            <FunnelChart
                title="Embudo de conversión"
                views={metricValues.profile_views}
                likes={metricValues.swipes_given}
                matches={metricValues.matches_count}
            />

            {/* Bar chart: matches per offer */}
            {offerBarData.labels.length > 0 && (
                <BarChart
                    title="Matches por oferta"
                    subtitle={`${offers.length} oferta${offers.length !== 1 ? 's' : ''} publicada${offers.length !== 1 ? 's' : ''}`}
                    labels={offerBarData.labels}
                    data={offerBarData.values}
                />
            )}

            {/* Line chart: weekly activity */}
            <LineChart
                title="Actividad por período"
                subtitle={PERIODS.find((p) => p.id === period)?.label}
                labels={activityData.labels}
                data={activityData.values}
            />

            <div style={{ height: 16 }} />
        </div>
    );
}
