// CFG-01 · Configuración (flujo 8): solo ajustes de la cuenta, con «Cerrar
// sesión» (único lugar de la app) y «Eliminar cuenta» al final, y la versión
// al pie una sola vez. Nada de acciones de producto ni gestión de perfiles.
// Apariencia y «¿Cerrar sesión?» viven en la URL (`?sheet=apariencia`,
// `?sheet=cerrar-sesion`): el atrás las cierra.
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
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useSheet } from '../../../app/sheets';
import { getProfile } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { AppearanceSheet, THEME_LABEL } from '../components/AppearanceSheet';
import { APP_VERSION, COPY } from '../copy';
import '../profile.css';

export const screenId = 'CFG-01';

/** Cuántas entradas de la app hay antes de esta en el historial (el índice que guarda React Router). */
function historyDepth(): number {
    const idx = (window.history.state as { idx?: unknown } | null)?.idx;
    return typeof idx === 'number' && idx > 0 ? idx : 0;
}

const C = COPY.config;

export function SettingsScreen() {
    const goBack = useGoBack();
    const navigate = useNavigate();
    const scrolled = useScrolled();
    const { show } = useSnackbar();
    const { open, linkProps, soon } = useOpenPath();
    const { preference } = useTheme();
    const { actor } = useDemoSession();
    // La cuenta es de la persona (auth.users, spec §2.1): con una organización activa, la de quien la administra.
    const { configuracion } = getProfile(actor.owner ?? actor.id);
    const appearance = useSheet('apariencia');
    const logout = useSheet('cerrar-sesion');

    // Flujo 8: AUTH-01 Bienvenida, sin dejar atrás las pantallas de la sesión (el atrás no vuelve a ellas).
    const confirmLogout = () => {
        const toWelcome = () => open(paths.bienvenida(), { replace: true });
        const depth = historyDepth();
        if (depth === 0) {
            toWelcome();
            return;
        }
        window.addEventListener('popstate', toWelcome, { once: true });
        navigate(-depth);
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={C.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <List>
                            {/* CFG-02 a CFG-04 aún no tienen ruta en paths.ts: «Disponible pronto». */}
                            <ListItem icon={IconPerson} title={C.cuenta} sub={configuracion.cuenta} chevron onClick={soon} />
                            <ListItem
                                icon={IconBell}
                                title={C.notificaciones}
                                sub={configuracion.notificaciones}
                                chevron
                                onClick={soon}
                            />
                            <ListItem icon={IconLock} title={C.privacidad} sub={C.privacidadSub} chevron onClick={soon} />
                            <ListItem
                                icon={IconEye}
                                title={C.apariencia}
                                sub={COPY.tema.sub(THEME_LABEL[preference])}
                                chevron
                                aria-haspopup="dialog"
                                onClick={() => appearance.show()}
                            />
                        </List>
                        <List>
                            <ListItem icon={IconHelp} title={C.ayuda} sub={C.ayudaSub} chevron {...linkProps(paths.ayuda())} />
                            <ListItem
                                icon={IconDocument}
                                title={C.legal}
                                sub={C.legalSub}
                                chevron
                                {...linkProps(paths.terminos())}
                            />
                        </List>
                        <List>
                            <ListItem
                                icon={IconLogout}
                                title={C.cerrarSesion}
                                danger
                                chevron={false}
                                aria-haspopup="dialog"
                                onClick={() => logout.show()}
                            />
                            <ListItem
                                icon={IconTrash}
                                title={C.eliminarCuenta}
                                sub={C.eliminarCuentaSub}
                                danger
                                chevron
                                // CFG-06 no existe en la demostración: lo dice tal cual.
                                onClick={() => show({ message: C.snackEliminarDemo })}
                            />
                        </List>
                        {/* Como en CFG-01: «Talently 3.0.0». El commit del build lo registra errorLogger, no se muestra. */}
                        <p className="caption prf-version">{`Talently ${APP_VERSION}`}</p>
                    </Stack>
                </div>
            </main>
            <AppearanceSheet open={appearance.open} onClose={appearance.hide} />
            <Dialog
                open={logout.open}
                onClose={logout.hide}
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
