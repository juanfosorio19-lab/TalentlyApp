// CFG-01 · Configuración (flujo 8): solo ajustes de la cuenta, con «Cerrar
// sesión» (único lugar de la app) y «Eliminar cuenta» al final, y la versión
// al pie una sola vez. Nada de acciones de producto ni gestión de perfiles.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Dialog } from '../../../ui/Dialog';
import {
    IconBell,
    IconDocument,
    IconEye,
    IconHelp,
    IconLock,
    IconLogout,
    IconPerson,
    IconTrash,
} from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { getProfile } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { AppearanceSheet, THEME_LABEL } from '../components/AppearanceSheet';
import { APP_VERSION, COPY } from '../copy';
import { useOpenRoute, useSoon } from '../useOpenRoute';
import '../profile.css';

export const screenId = 'CFG-01';

const C = COPY.config;

export function SettingsScreen() {
    const goBack = useGoBack();
    const navigate = useNavigate();
    const scrolled = useScrolled();
    const { show } = useSnackbar();
    const openRoute = useOpenRoute();
    const soon = useSoon();
    const { preference } = useTheme();
    const { actor } = useDemoSession();
    const { configuracion } = getProfile(actor.id);
    const [appearance, setAppearance] = useState(false);
    const [logout, setLogout] = useState(false);

    const confirmLogout = () => {
        setLogout(false);
        // Demostración: no hay sesión real. Vuelve a Inicio y lo dice.
        navigate(paths.inicio(), { replace: true });
        show({ message: C.snackSesionDemo });
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={C.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <List>
                            <ListItem icon={IconPerson} title={C.cuenta} sub={configuracion.cuenta} chevron onClick={() => soon()} />
                            <ListItem
                                icon={IconBell}
                                title={C.notificaciones}
                                sub={configuracion.notificaciones}
                                chevron
                                onClick={() => soon()}
                            />
                            <ListItem icon={IconLock} title={C.privacidad} sub={C.privacidadSub} chevron onClick={() => soon()} />
                            <ListItem
                                icon={IconEye}
                                title={C.apariencia}
                                sub={COPY.tema.sub(THEME_LABEL[preference])}
                                chevron
                                aria-haspopup="dialog"
                                onClick={() => setAppearance(true)}
                            />
                        </List>
                        <List>
                            <ListItem icon={IconHelp} title={C.ayuda} sub={C.ayudaSub} chevron onClick={() => openRoute(paths.ayuda())} />
                            <ListItem
                                icon={IconDocument}
                                title={C.legal}
                                sub={C.legalSub}
                                chevron
                                onClick={() => openRoute(paths.terminos())}
                            />
                        </List>
                        <List>
                            <ListItem
                                icon={IconLogout}
                                title={C.cerrarSesion}
                                danger
                                chevron={false}
                                aria-haspopup="dialog"
                                onClick={() => setLogout(true)}
                            />
                            <ListItem
                                icon={IconTrash}
                                title={C.eliminarCuenta}
                                sub={C.eliminarCuentaSub}
                                danger
                                chevron
                                onClick={() => soon(C.snackEliminarDemo)}
                            />
                        </List>
                        <p className="caption prf-version">{`Talently ${APP_VERSION} · ${__BUILD_COMMIT__}`}</p>
                    </Stack>
                </div>
            </main>
            <AppearanceSheet open={appearance} onClose={() => setAppearance(false)} />
            <Dialog
                open={logout}
                onClose={() => setLogout(false)}
                title={C.dialogTitulo}
                cancelLabel={C.cancelar}
                confirmLabel={C.cerrarSesion}
                onConfirm={confirmLogout}
            >
                {C.dialogTexto}
            </Dialog>
        </div>
    );
}
