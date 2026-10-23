// CFG-01 · Configuración (flujo 8): solo ajustes de la cuenta, con «Cerrar
// sesión» (único lugar de la app) y «Eliminar cuenta» al final, y la versión
// al pie una sola vez. Nada de acciones de producto ni gestión de perfiles.
// Apariencia y «¿Cerrar sesión?» viven en la URL (`?sheet=apariencia`,
// `?sheet=cerrar-sesion`): el atrás las cierra.
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
import { useLeaveSession } from '../../../app/navigation/history';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useSheet } from '../../../app/sheets';
import { getProfile } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import type { DemoOnboardingResult } from '../../demo/types';
import { AppearanceSheet, THEME_LABEL } from '../components/AppearanceSheet';
import { APP_VERSION, COPY } from '../copy';
import '../profile.css';

export const screenId = 'CFG-01';

const C = COPY.config;

/**
 * El correo con que se creó la cuenta en el registro (AUTH-02, el mismo que
 * AUTH-03 mostró). Lo deja onboarding/model.resultadoOnboarding junto al
 * resultado mientras DemoOnboardingResult no tenga el campo (pedido a demo/).
 */
function correoDelRegistro(onboarding: DemoOnboardingResult | undefined): string | undefined {
    if (!onboarding || !('correo' in onboarding) || typeof onboarding.correo !== 'string') return undefined;
    return onboarding.correo || undefined;
}

export function SettingsScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { show } = useSnackbar();
    const { canOpen, linkProps, soon } = useOpenPath();
    const { preference } = useTheme();
    const { actor, onboarding } = useDemoSession();
    // La cuenta es de la persona (auth.users, spec §2.1): con una organización activa, la de quien la administra.
    const { configuracion } = getProfile(actor.owner ?? actor.id);
    // Recién registrada: el correo que escribió en el registro, no el de los datos.
    const cuenta = correoDelRegistro(onboarding) ?? configuracion.cuenta;
    const appearance = useSheet('apariencia');
    const logout = useSheet('cerrar-sesion');

    // Flujo 8: AUTH-01 Bienvenida, sin dejar las pantallas de la sesión en el historial (ni atrás ni
    // adelante): useLeaveSession vuelve a la primera entrada y la reemplaza.
    const leaveSession = useLeaveSession();
    const confirmLogout = () => {
        const welcome = paths.bienvenida();
        if (!canOpen(welcome)) {
            soon();
            return;
        }
        leaveSession(welcome);
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={C.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <List>
                            {/* CFG-02 a CFG-04 aún no tienen pantalla: «Disponible pronto» hasta que el router las tenga. */}
                            <ListItem
                                icon={IconPerson}
                                title={C.cuenta}
                                sub={cuenta}
                                chevron
                                {...linkProps(paths.configuracionCuenta())}
                            />
                            <ListItem
                                icon={IconBell}
                                title={C.notificaciones}
                                sub={configuracion.notificaciones}
                                chevron
                                {...linkProps(paths.configuracionNotificaciones())}
                            />
                            <ListItem
                                icon={IconLock}
                                title={C.privacidad}
                                sub={C.privacidadSub}
                                chevron
                                {...linkProps(paths.configuracionPrivacidad())}
                            />
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
