// PRF-02 · Perfil de mi organización (actor organización): vista previa «Así
// te ven», edición por secciones, Verificación de la organización, Equipo y
// Trabajadores favoritos (spec §5.2).
import { Button } from '../../../ui/Button';
import { IconEye } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import type { DemoProfileTab } from '../../demo/types';
import { AsiTeVen } from '../components/AsiTeVen';
import { ProfileAppBar } from '../components/ProfileAppBar';
import { ProfileLinks } from '../components/ProfileLinks';
import { ProfileTabContent } from '../components/ProfileTabContent';
import { COPY } from '../copy';
import { ORG_EXTRA_LINKS } from '../mock';
import { useEditableProfile } from '../store';
import { useOpenRoute } from '../useOpenRoute';
import '../profile.css';

export const screenId = 'PRF-02';

export function OrgProfileScreen() {
    const { actor } = useDemoSession();
    const [profile, save] = useEditableProfile(actor.id);
    const openRoute = useOpenRoute();
    const tab = profile.perfiles[0];

    const changeTab = (next: DemoProfileTab) =>
        save({ ...profile, perfiles: profile.perfiles.map((t) => (t.id === next.id ? next : t)) });

    return (
        <>
            <ProfileAppBar />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content prf-content">
                    <Stack gap={4}>
                        <AsiTeVen actorId={actor.id} asiTeVen={profile.asiTeVen} kind="org">
                            <Button variant="ghost" size="sm" icon={IconEye} onClick={() => openRoute(paths.organizacion(actor.id))}>
                                {COPY.perfil.verComoMeVen}
                            </Button>
                        </AsiTeVen>
                        {tab && <ProfileTabContent tab={tab} onChange={changeTab} />}
                        <ProfileLinks links={[...profile.enlaces, ...ORG_EXTRA_LINKS]} />
                    </Stack>
                </div>
            </main>
        </>
    );
}
