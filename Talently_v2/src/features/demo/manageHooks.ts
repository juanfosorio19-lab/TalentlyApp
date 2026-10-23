// Hooks de React sobre el estado de gestión (./manageState) y las
// postulaciones de la sesión (./sessionStore), ya pasados por los selectores
// puros de ./manageSelectors. Inicio, Actividad y Explorar usan estos hooks
// (o useManageState + el selector que necesiten) para decir lo mismo que
// GES-01, GES-02 y GES-04.
import { useMemo } from 'react';
import { getOrgDashboard } from './data';
import { managedSessionOf, orgDashboardView, type ManagedSession, type SessionApplications } from './manageSelectors';
import { useManageState, type ManageState } from './manageState';
import { useSessionState } from './sessionStore';
import type { DemoOrgDashboard } from './types';

/** Lo que una pantalla necesita para derivar cifras de gestión: el estado de gestión y las postulaciones de la sesión. */
export function useManageSession(): { manage: ManageState; applications: SessionApplications } {
    const manage = useManageState();
    const { applications } = useSessionState();
    return useMemo(() => ({ manage, applications }), [manage, applications]);
}

/** ACT-01 (Agenda de la organización) y ACT-03: estado, métricas y confirmados de cada publicación en la sesión. */
export function useManagedSessionOf(): (publicationId: string) => ManagedSession | undefined {
    const { manage, applications } = useManageSession();
    return useMemo(() => managedSessionOf(manage, applications), [manage, applications]);
}

/**
 * INI-02: el panel de la organización con sus KPIs y «Requiere tu atención»
 * al día. `overrides` reemplaza el valor de un KPI que sale de otro estado
 * (por ejemplo «Conversaciones sin responder», de Mensajes).
 */
export function useOrgDashboard(orgId: string, overrides?: Partial<Record<string, string>>): DemoOrgDashboard | undefined {
    const { manage, applications } = useManageSession();
    return useMemo(() => {
        const panel = getOrgDashboard(orgId);
        return panel ? orgDashboardView(panel, manage, applications, overrides) : undefined;
    }, [orgId, manage, applications, overrides]);
}
