// PRF-02 · Perfil de mi organización (actor organización): vista previa «Así
// te ven», edición por secciones, Verificación de la organización, Equipo y
// Trabajadores favoritos (spec §5.2). El AppBar large de la pestaña lo pone
// routes.tsx, el mismo para PRF-01 y PRF-02.
import { Button } from '../../../ui/Button';
import { IconEye } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useDemoSession } from '../../demo/session';
import { AsiTeVen } from '../components/AsiTeVen';
import { ProfileLinks } from '../components/ProfileLinks';
import { ProfileTabContent } from '../components/ProfileTabContent';
import { COPY } from '../copy';
import { ORG_EXTRA_LINKS } from '../mock';
import { useProfile } from '../useProfile';
import { useSheetGuard } from '../useSheetGuard';
import '../profile.css';

export const screenId = 'PRF-02';

export function OrgProfileScreen() {
    const { actor, switchable } = useDemoSession();
    const { profile, verificationDetails, saveTab } = useProfile();
    const { open } = useOpenPath();
    const tab = profile.perfiles[0];
    useSheetGuard({ canSwitch: switchable.length > 1, tab, verificaciones: profile.asiTeVen.verificaciones.length });

    return (
        <main className="tl-app-screen__body">
            <div className="tl-app-screen__content prf-content">
                <Stack gap={4}>
                    <AsiTeVen asiTeVen={profile.asiTeVen} details={verificationDetails} kind="org">
                        {/* PRF-11, lo que ve un tercero. */}
                        <Button variant="ghost" size="sm" icon={IconEye} onClick={() => open(paths.organizacion(actor.id))}>
                            {COPY.perfil.verComoMeVen}
                        </Button>
                    </AsiTeVen>
                    {tab && <ProfileTabContent key={tab.id} tab={tab} comuna={profile.asiTeVen.comuna} onChange={saveTab} />}
                    <ProfileLinks links={[...profile.enlaces, ...ORG_EXTRA_LINKS]} />
                </Stack>
            </div>
        </main>
    );
}
