// Pestaña Actividad (/actividad?seg=agenda|postulaciones|publicaciones):
// AppBar large con la campana y el SegmentedControl con los segmentos que
// aplican al actor (spec §5.2). Cada segmento es su pantalla: ACT-01 Agenda,
// ACT-02 Postulaciones y ACT-03 Publicaciones. El segmento va en la URL
// (replace): la memoria de la pestaña y atrás vuelven al mismo.
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Stack } from '../../../ui/Layout';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { paths, type ActivitySegment } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { NotificationsButton } from '../components/NotificationsButton';
import { copy } from '../copy';
import { defaultSegmentFor, publicationsFor, segmentsFor } from '../selectors';
import { useRecienRegistrado } from '../session';
import { AgendaScreen } from './AgendaScreen';
import { ApplicationsScreen } from './ApplicationsScreen';
import { MyPublicationsScreen } from './MyPublicationsScreen';
import '../activity.css';

/**
 * La pestaña abre en ACT-02 (persona que busca trabajo), ACT-03 (persona con
 * publicaciones) o ACT-01 (organización y el resto); cada segmento tiene su id.
 */
export const screenId = 'ACT-02';
export const segmentScreenIds: Record<ActivitySegment, string> = {
    agenda: 'ACT-01',
    postulaciones: 'ACT-02',
    publicaciones: 'ACT-03',
};

const panelId = (seg: ActivitySegment) => `act-panel-${seg}`;

export function ActivityScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { actor } = useDemoSession();
    const recienRegistrado = useRecienRegistrado(actor.id);
    const scrolled = useScrolled();

    const publications = useMemo(() => publicationsFor(actor, { recienRegistrado }), [actor, recienRegistrado]);
    const hasPublications = publications.length > 0;
    const segments = segmentsFor(actor, hasPublications);
    const requested = params.get('seg');
    // Sin ?seg, o con uno que no aplica al actor (enlace viejo, cambio de actor), abre el de por defecto.
    const fallback = defaultSegmentFor(actor, hasPublications);
    const current =
        segments.find((s) => s.value === requested) ?? segments.find((s) => s.value === fallback) ?? segments[0];
    const seg: ActivitySegment = current?.value ?? 'agenda';
    const withTabs = segments.length > 1;

    // Un ?seg que no aplica se corrige en la URL: la memoria de la pestaña no guarda un segmento falso.
    useEffect(() => {
        if (requested && requested !== seg) navigate(paths.actividad(seg), { replace: true });
    }, [requested, seg, navigate]);

    // Solo el segmento elegido tiene panel: las demás pestañas no apuntan a un id que no existe.
    const options = segments.map((s) => (s.value === seg ? { ...s, controls: panelId(seg) } : s));

    return (
        <>
            <AppBar title={copy.tab.title} scrolled={scrolled} actions={<NotificationsButton />} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content act-tab">
                    <Stack gap={4}>
                        {withTabs && (
                            <SegmentedControl
                                options={options}
                                value={seg}
                                onChange={(next) => navigate(paths.actividad(next), { replace: true })}
                                aria-label={copy.tab.segmentsLabel}
                            />
                        )}
                        <div
                            id={panelId(seg)}
                            role={withTabs ? 'tabpanel' : undefined}
                            aria-label={withTabs ? current?.label : undefined}
                            data-screen-id={segmentScreenIds[seg]}
                        >
                            {seg === 'agenda' ? (
                                <AgendaScreen />
                            ) : seg === 'postulaciones' ? (
                                <ApplicationsScreen />
                            ) : (
                                <MyPublicationsScreen publications={publications} />
                            )}
                        </div>
                    </Stack>
                </div>
            </main>
        </>
    );
}
