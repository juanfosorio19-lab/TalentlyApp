// PRF-01 · Mi perfil (persona): «Así te ven», Mis perfiles con su contenido
// editable y, al final, los accesos (Agregar un perfil, Verificación, Mis
// perfiles, Impulsa tu perfil). El AppBar large de la pestaña (con el
// engranaje a Configuración) lo pone routes.tsx, el mismo para PRF-01 y PRF-02.
// El perfil elegido en «Mis perfiles» vive en la URL (`?perfil=hogar`): sigue
// elegido al volver de una pantalla apilada o de otra pestaña.
import { useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../../ui/EmptyState';
import { IconAdd } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useDemoSession } from '../../demo/session';
import type { DemoProfileTab } from '../../demo/types';
import { AsiTeVen } from '../components/AsiTeVen';
import { ProfileLinks } from '../components/ProfileLinks';
import { ProfileTabContent } from '../components/ProfileTabContent';
import { ProfileTabs } from '../components/ProfileTabs';
import { resolveTab, visibleLinks } from '../model';
import { useProfile } from '../useProfile';
import { useSheetGuard } from '../useSheetGuard';
import '../profile.css';

export const screenId = 'PRF-01';

export function ProfileScreen() {
    const { actor, switchable } = useDemoSession();
    const { profile, verificationDetails, saveTab } = useProfile();
    const { open, soon } = useOpenPath();
    const [params, setParams] = useSearchParams();
    const tab = resolveTab(profile.perfiles, params.get('perfil'));
    useSheetGuard({ canSwitch: switchable.length > 1, tab, verificaciones: profile.asiTeVen.verificaciones.length });

    // RootLayout guarda el scroll de /perfil por ruta y búsqueda: `?perfil=hogar` y `?perfil=trabajo`
    // tienen cada uno el suyo y ScrollRestoration movía la página al cambiar de chip. Se queda donde
    // se tocó (como useStillSheet con las hojas; pedido en «requests» que la clave ignore `perfil`).
    const chipScroll = useRef<number | null>(null);
    useLayoutEffect(() => {
        const y = chipScroll.current;
        if (y === null) return;
        chipScroll.current = null;
        // ScrollRestoration corre después en este mismo commit: se corrige antes del próximo cuadro.
        requestAnimationFrame(() => {
            if (window.scrollY !== y) window.scrollTo(0, y);
        });
    }, [tab?.id]);

    const chooseTab = (id: DemoProfileTab['id']) => {
        if (id === tab?.id) return;
        chipScroll.current = window.scrollY;
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set('perfil', id);
                return next;
            },
            { replace: true, preventScrollReset: true },
        );
    };

    return (
        <main className="tl-app-screen__body">
            <div className="tl-app-screen__content prf-content">
                <Stack gap={4}>
                    <AsiTeVen asiTeVen={profile.asiTeVen} details={verificationDetails} kind="person" />
                    {tab ? (
                        <>
                            <ProfileTabs
                                tabs={profile.perfiles}
                                value={tab.id}
                                onChange={chooseTab}
                                onPreview={() => open(paths.perfilPublico(actor.id, tab.id === 'trabajo' ? 'trabajo' : undefined))}
                            />
                            <ProfileTabContent key={tab.id} tab={tab} comuna={profile.asiTeVen.comuna} onChange={saveTab} />
                        </>
                    ) : (
                        profile.vacio && (
                            <EmptyState
                                icon={IconAdd}
                                title={profile.vacio.titulo}
                                text={profile.vacio.texto}
                                // PRF-04 (/perfil/agregar) aún no tiene ruta: «Disponible pronto».
                                action={profile.vacio.accion ? { label: profile.vacio.accion, onClick: soon } : undefined}
                            />
                        )
                    )}
                    <ProfileLinks links={visibleLinks(profile, actor)} />
                </Stack>
            </div>
        </main>
    );
}
