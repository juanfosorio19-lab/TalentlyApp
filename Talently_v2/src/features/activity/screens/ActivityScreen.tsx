// Pestaña Actividad (/actividad?seg=agenda|postulaciones|publicaciones):
// AppBar large con la campana y el SegmentedControl con los segmentos que
// aplican al actor (spec §5.2). Cada segmento es su pantalla: ACT-01 Agenda,
// ACT-02 Postulaciones y ACT-03 Publicaciones. El segmento va en la URL
// (replace): la memoria de la pestaña y atrás vuelven al mismo.
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Stack } from '../../../ui/Layout';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { paths, type ActivitySegment } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { NotificationsButton } from '../components/NotificationsButton';
import { copy } from '../copy';
import { publicationsFor, segmentsFor } from '../selectors';
import { AgendaScreen } from './AgendaScreen';
import { ApplicationsScreen } from './ApplicationsScreen';
import { MyPublicationsScreen } from './MyPublicationsScreen';

/** La pestaña abre en ACT-01 (persona) o ACT-03 (organización); cada segmento tiene su id. */
export const screenId = 'ACT-01';
export const segmentScreenIds: Record<ActivitySegment, string> = {
    agenda: 'ACT-01',
    postulaciones: 'ACT-02',
    publicaciones: 'ACT-03',
};

export function ActivityScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { actor } = useDemoSession();
    const scrolled = useScrolled();

    const publications = useMemo(() => publicationsFor(actor), [actor]);
    const segments = segmentsFor(actor, publications.length > 0);
    const requested = params.get('seg');
    // Un segmento que no aplica al actor (enlace viejo, cambio de actor) cae en el primero.
    const current = segments.find((s) => s.value === requested) ?? segments[0];
    const seg: ActivitySegment = current?.value ?? 'agenda';
    const withTabs = segments.length > 1;

    return (
        <>
            <AppBar title={copy.tab.title} scrolled={scrolled} actions={<NotificationsButton />} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        {withTabs && (
                            <SegmentedControl
                                options={segments}
                                value={seg}
                                onChange={(next) => navigate(paths.actividad(next), { replace: true })}
                                aria-label={copy.tab.segmentsLabel}
                            />
                        )}
                        <div
                            id={`act-panel-${seg}`}
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
