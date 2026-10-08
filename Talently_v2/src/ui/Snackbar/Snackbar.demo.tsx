import type { ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoRow, DemoSection } from '../catalog/demo';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { IconCalendar, IconChat, IconHome, IconPerson, IconSearch } from '../icons';
import { Snackbar } from './Snackbar';
import { SnackbarProvider, useSnackbar } from './SnackbarProvider';

const noop = () => {};

function ScreenBehind({ count = 3, children }: { count?: number; children?: ReactNode }) {
    const cards = [
        ['Garzón para matrimonio', 'sáb 12 dic · 19:00 · Vitacura'],
        ['Bartender para evento de empresa', 'vie 11 dic · 20:00 · Providencia'],
        ['Anfitrión o anfitriona', 'dom 13 dic · 12:00 · Las Condes'],
    ].slice(0, count);
    return (
        <div className="tl-app-screen__body">
            <div className="tl-app-screen__content">
                {children}
                {cards.map(([title, meta]) => (
                    <div key={title} className="tl-card">
                        <div className="body-l">{title}</div>
                        <div className="body">{meta}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Marcado mínimo de BottomTabBar (el componente lo construye otro grupo).
const TABS = [
    ['Inicio', IconHome],
    ['Explorar', IconSearch],
    ['Actividad', IconCalendar],
    ['Mensajes', IconChat],
    ['Perfil', IconPerson],
] as const;

function TabBar() {
    return (
        <nav className="tl-tabbar" aria-label="Navegación principal">
            {TABS.map(([label, Icon]) => (
                <a
                    key={label}
                    className={cx('tl-tab', label === 'Explorar' && 'is-active')}
                    href="#Snackbar"
                    aria-current={label === 'Explorar' ? 'page' : undefined}
                >
                    <span className="tl-tab__pill">
                        <Icon />
                    </span>
                    <span className="tab-label">{label}</span>
                </a>
            ))}
        </nav>
    );
}

/** Botones que piden avisos de verdad con `useSnackbar()`: de a uno, 4 s sin acción y 8 s con acción. */
function LiveButtons() {
    const { show } = useSnackbar();
    return (
        <DemoRow>
            <Button size="sm" variant="tonal" onClick={() => show({ message: 'Guardamos tus cambios', tone: 'success' })}>
                Toast
            </Button>
            <Button
                size="sm"
                variant="tonal"
                onClick={() =>
                    show({
                        message: 'Publicación pausada',
                        tone: 'success',
                        action: { label: 'Deshacer', onAction: () => show({ message: 'Publicación activa de nuevo' }) },
                    })
                }
            >
                Con «Deshacer»
            </Button>
            <Button
                size="sm"
                variant="tonal"
                onClick={() =>
                    show({
                        message: 'No pudimos guardar. Revisa tu conexión e intenta de nuevo.',
                        tone: 'error',
                        action: { label: 'Reintentar', onAction: () => show({ message: 'Guardamos tus cambios', tone: 'success' }) },
                    })
                }
            >
                Error
            </Button>
        </DemoRow>
    );
}

/** Un estado, como en preview.html: su nombre arriba y la muestra o el motivo de «No aplica». */
function State({ name, na, children }: { name: string; na?: boolean; children: ReactNode }) {
    return (
        <DemoSection title={name}>
            {na ? (
                <div className="body">
                    <span className="tl-badge">No aplica</span> {children}
                </div>
            ) : (
                children
            )}
        </DemoSection>
    );
}

const demo: DemoModule = {
    name: 'Snackbar',
    group: 'Capas',
    summary:
        'Toast y Snackbar: respuesta temporal a una acción, de a uno, sobre la TabBar. Toast sin acción (4 s); Snackbar con «Deshacer» o «Reintentar» (8 s). Se pide con useSnackbar().',
    Demo: () => (
        <>
            <DemoSection title="Snackbar sobre la TabBar · capa z-toast">
                <DemoFrame height={420}>
                    <ScreenBehind />
                    <Snackbar message="Publicación pausada" tone="success" action={{ label: 'Deshacer', onAction: noop }} />
                    <TabBar />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="En una pantalla apilada, sin TabBar ni CTA fijo">
                <DemoFrame height={280}>
                    <ScreenBehind count={2} />
                    <Snackbar message="Marcaste todas como leídas" tone="success" placement="no-tabbar" />
                </DemoFrame>
                <span className="caption dev-label">
                    Con placement «no-tabbar» (tl-snackbar--no-tabbar) baja al borde inferior, a 8 px sobre la barra de gestos.
                </span>
            </DemoSection>
            <DemoSection title="Tonos · con y sin acción">
                <DemoRow column>
                    <Snackbar message="Publicación pausada" tone="success" placement="static" action={{ label: 'Deshacer', onAction: noop }} />
                    <Snackbar message="Invitaste a Jorge a postular" placement="static" action={{ label: 'Deshacer', onAction: noop }} />
                    <Snackbar
                        message="No pudimos guardar. Revisa tu conexión e intenta de nuevo."
                        tone="error"
                        placement="static"
                        action={{ label: 'Reintentar', onAction: noop }}
                    />
                    <Snackbar message="Guardamos tus cambios" tone="success" placement="static" />
                </DemoRow>
                <span className="caption dev-label">
                    Toast = sin acción, se va a los 4 s. Snackbar = con acción, se queda 8 s o hasta que se toque.
                </span>
            </DemoSection>
            <DemoSection title="Web (backoffice, M11) · abajo a la izquierda del contenido">
                <DemoFrame width={412} height={200}>
                    <ScreenBehind count={1} />
                    <Snackbar message="Verificaste Eventos del Valle SpA" tone="success" placement="web" />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Probar: useSnackbar() · el nuevo reemplaza al anterior">
                <DemoFrame height={420}>
                    <SnackbarProvider portal={false}>
                        <ScreenBehind count={2}>
                            <LiveButtons />
                        </ScreenBehind>
                        <TabBar />
                    </SnackbarProvider>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <State name="Default">
                    <div className="body">Mostrado arriba.</div>
                </State>
                <State name="Presionado · lo tiene su acción">
                    <Snackbar
                        message="Publicación pausada"
                        tone="success"
                        placement="static"
                        action={{ label: 'Deshacer', onAction: noop, className: 'is-pressed' }}
                    />
                </State>
                <State name="Foco · lo tiene su acción; el mensaje se anuncia sin mover el foco">
                    <Snackbar
                        message="Publicación pausada"
                        tone="success"
                        placement="static"
                        action={{ label: 'Deshacer', onAction: noop, className: 'is-focus' }}
                    />
                </State>
                <State name="Seleccionado" na>
                    No se marca.
                </State>
                <State name="Deshabilitado" na>
                    Si la acción ya no aplica, el Snackbar no la muestra.
                </State>
                <State name="Error">
                    <Snackbar
                        message="No pudimos guardar. Revisa tu conexión e intenta de nuevo."
                        tone="error"
                        placement="static"
                        action={{ label: 'Reintentar', onAction: noop }}
                    />
                </State>
                <State name="Cargando" na>
                    Responde a una acción terminada; mientras algo carga, lo indica el control que espera.
                </State>
            </DemoSection>
        </>
    ),
};

export default demo;
