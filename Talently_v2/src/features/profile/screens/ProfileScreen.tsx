// PRF-01 · Mi perfil (persona): «Así te ven», Mis perfiles con su contenido
// editable y, al final, los accesos (Agregar un perfil, Verificación, Mis
// perfiles, Impulsa tu perfil). El engranaje lleva a Configuración.
import { useState } from 'react';
import { EmptyState } from '../../../ui/EmptyState';
import { IconAdd } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import type { DemoProfileTab } from '../../demo/types';
import { AsiTeVen } from '../components/AsiTeVen';
import { ProfileAppBar } from '../components/ProfileAppBar';
import { ProfileLinks } from '../components/ProfileLinks';
import { ProfileTabContent } from '../components/ProfileTabContent';
import { ProfileTabs } from '../components/ProfileTabs';
import { useEditableProfile } from '../store';
import { useOpenRoute, useSoon } from '../useOpenRoute';
import '../profile.css';

export const screenId = 'PRF-01';

export function ProfileScreen() {
    const { actor } = useDemoSession();
    const [profile, save] = useEditableProfile(actor.id);
    const openRoute = useOpenRoute();
    const soon = useSoon();
    const [tabId, setTabId] = useState<DemoProfileTab['id'] | undefined>(profile.perfiles[0]?.id);
    const tab = profile.perfiles.find((t) => t.id === tabId) ?? profile.perfiles[0];

    const changeTab = (next: DemoProfileTab) =>
        save({ ...profile, perfiles: profile.perfiles.map((t) => (t.id === next.id ? next : t)) });

    return (
        <>
            <ProfileAppBar />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content prf-content">
                    <Stack gap={4}>
                        <AsiTeVen actorId={actor.id} asiTeVen={profile.asiTeVen} kind="person" />
                        {tab ? (
                            <>
                                <ProfileTabs
                                    tabs={profile.perfiles}
                                    value={tab.id}
                                    onChange={setTabId}
                                    onPreview={() =>
                                        openRoute(paths.perfilPublico(actor.id, tab.id === 'trabajo' ? 'trabajo' : undefined))
                                    }
                                />
                                <ProfileTabContent key={tab.id} tab={tab} onChange={changeTab} />
                            </>
                        ) : (
                            profile.vacio && (
                                <EmptyState
                                    icon={IconAdd}
                                    title={profile.vacio.titulo}
                                    text={profile.vacio.texto}
                                    action={profile.vacio.accion ? { label: profile.vacio.accion, onClick: () => soon() } : undefined}
                                />
                            )
                        )}
                        <ProfileLinks links={profile.enlaces} />
                    </Stack>
                </div>
            </main>
        </>
    );
}
