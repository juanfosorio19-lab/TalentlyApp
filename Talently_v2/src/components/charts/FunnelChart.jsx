// src/components/charts/FunnelChart.jsx
// Embudo de conversión — diseño Stitch con clip-path trapezoid
import './Charts.css';

export default function FunnelChart({ views = 0, likes = 0, matches = 0, title }) {
    const maxVal = Math.max(views, 1);

    const stages = [
        { label: 'Vistas',   value: views,   variant: 'views',   pct: 100 },
        { label: 'Likes',    value: likes,   variant: 'likes',   pct: (likes   / maxVal) * 100 },
        { label: 'Matches',  value: matches, variant: 'matches', pct: (matches / maxVal) * 100 },
    ];

    const convRates = [
        views  > 0 ? ((likes   / views)  * 100).toFixed(1) + '%' : '—',
        likes  > 0 ? ((matches / likes)  * 100).toFixed(1) + '%' : '—',
    ];

    return (
        <div className="fc">
            {title && <h4 className="fc__title">{title}</h4>}

            <div className="fc__funnel">
                {stages.map((stage, i) => (
                    <div key={stage.variant} className="fc__layer-wrap">
                        <div className={`fc__layer fc__layer--${stage.variant}`}>
                            <span className="fc__layer-label">{stage.label}</span>
                            <span className="fc__layer-value">
                                {stage.value.toLocaleString()}
                            </span>
                        </div>
                        {i < stages.length - 1 && (
                            <div className="fc__conv">
                                <span className="fc__conv-rate">{convRates[i]} conversión</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Totals row */}
            <div className="fc__totals">
                {stages.map((stage) => (
                    <div key={stage.variant} className="fc__total-item">
                        <span className={`fc__total-dot fc__total-dot--${stage.variant}`} />
                        <span className="fc__total-label">{stage.label}</span>
                        <span className="fc__total-value">{stage.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
