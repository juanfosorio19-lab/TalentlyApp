// Pestaña Actividad (/actividad?seg=agenda|postulaciones|publicaciones):
// AppBar large con la campana y el SegmentedControl con los segmentos que
// aplican al actor (spec §5.2). Cada segmento es su pantalla: ACT-01 Agenda,
// ACT-02 Postulaciones y ACT-03 Publicaciones. El segmento va en la URL
// (replace): la memoria de la pestaña y atrás vuelven al mismo.
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Stack } from '../../../ui/Layout';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import type { ActivitySegment } from '../../../app/paths';
import { useManagedSessionOf } from '../../demo/manageHooks';
import { useDemoSession } from '../../demo/session';
import { NotificationsButton } from '../components/NotificationsButton';
import { copy } from '../copy';
import { publicationsFor, resolveSegment } from '../selectors';
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
    const [params, setParams] = useSearchParams();
    const { actor, recienRegistrado } = useDemoSession();
    const scrolled = useScrolled();

    // ACT-03: el estado y las métricas de GES-01 (una pausada pasa a «Pausadas»).
    const sessionOf = useManagedSessionOf();
    const publications = useMemo(
        () => publicationsFor(actor, { recienRegistrado }, sessionOf),
        [actor, recienRegistrado, sessionOf],
    );
    const requested = params.get('seg');
    // Sin ?seg, o con uno que no aplica al actor (enlace viejo, cambio de actor), abre el de por defecto.
    const { seg, segments } = resolveSegment(actor, publications.length > 0, requested);
    const current = segments.find((s) => s.value === seg);
    const withTabs = segments.length > 1;

    // Cambia el segmento sin perder lo demás de la URL (la vista y el día de la Agenda siguen ahí al volver).
    const showSegment = useCallback(
        (next: ActivitySegment) =>
            setParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set('seg', next);
                    return p;
                },
                { replace: true, preventScrollReset: true },
            ),
        [setParams],
    );

    // Un ?seg que no aplica se corrige en la URL: la memoria de la pestaña no guarda un segmento falso.
    useEffect(() => {
        if (requested && requested !== seg) showSegment(seg);
    }, [requested, seg, showSegment]);

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
                                onChange={showSegment}
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
