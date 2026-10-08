import type { ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { BrandLogo } from '../BrandLogo';
import { Button } from '../Button/Button';
import { CtaBar } from '../CtaBar';
import { cx } from '../cx';
import {
    IconCalendar,
    IconChat,
    IconHome,
    IconOffers,
    IconPeople,
    IconPerson,
    IconReport,
    IconSearch,
    IconShield,
} from '../icons';
import { Snackbar } from './Snackbar';
import { SnackbarOutlet, SnackbarProvider, useSnackbar } from './SnackbarProvider';

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

// Marcado mínimo del WebShell con la SideNav en riel (lo construye otro grupo):
// a 1024, donde se verifica el backoffice, la SideNav es el riel de 104.
const SECTIONS = [
    ['Verificaciones', IconShield],
    ['Organizaciones', IconPeople],
    ['Publicaciones', IconOffers],
    ['Reportes', IconReport],
    ['Usuarios y auditoría', IconPerson],
] as const;

function WebShell({ children }: { children: ReactNode }) {
    return (
        <div className="dev-frame" style={{ width: 1024 }}>
            <div className="tl-web tl-web--rail">
                <nav className="tl-sidenav tl-sidenav--rail" aria-label="Backoffice">
                    <div className="tl-sidenav__brand">
                        <BrandLogo size="sm" />
                        <span className="tl-sidenav__brand-text">
                            <span className="tl-sidenav__brand-name">Talently</span>
                        </span>
                    </div>
                    <ul className="tl-sidenav__list">
                        {SECTIONS.map(([label, Icon]) => (
                            <li key={label}>
                                <a
                                    className="tl-sidenav__item"
                                    href="#Snackbar"
                                    aria-current={label === 'Verificaciones' ? 'page' : undefined}
                                >
                                    <span className="tl-sidenav__icon">
                                        <Icon />
                                    </span>
                                    <span className="tl-sidenav__label">{label}</span>
                                    <span className="tl-sidenav__short">{label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="tl-web__main">
                    <div className="tl-web__body">
                        <ScreenBehind count={2} />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

/** Un paso con CTA fijo: el aviso va en el `SnackbarOutlet` de la CtaBar, justo encima del botón. */
function LiveCtaStep() {
    const { show } = useSnackbar();
    const fail = () =>
        show({
            message: 'No pudimos guardar este paso.',
            tone: 'error',
            action: { label: 'Reintentar', onAction: () => show({ message: 'Guardamos tus cambios', tone: 'success' }) },
        });
    return (
        <>
            <ScreenBehind count={2} />
            <CtaBar>
                <SnackbarOutlet />
                <Button size="lg" block onClick={fail}>
                    Continuar
                </Button>
            </CtaBar>
        </>
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
                <WebShell>
                    <Snackbar
                        message="Aprobaste la credencial SPD de Andrés Carrasco"
                        tone="success"
                        placement="web"
                        action={{ label: 'Deshacer', onAction: noop }}
                    />
                </WebShell>
                <DemoLabel>
                    Escritorio a 1024 con la SideNav en riel: el aviso es hijo directo de .tl-web y se alinea con el contenido, nunca
                    sobre la SideNav. Con claro y oscuro lado a lado el marco se ajusta al panel; desmárcalo para verlo a tamaño real.
                </DemoLabel>
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
            <DemoSection title="Probar: con CTA fijo va estático encima del botón (SnackbarOutlet)">
                <DemoFrame height={420}>
                    <SnackbarProvider portal={false}>
                        <LiveCtaStep />
                    </SnackbarProvider>
                </DemoFrame>
                <DemoLabel>
                    «Continuar» simula que guardar falla. Una hoja con pie (BottomSheet) trae su propio SnackbarOutlet sobre el pie.
                </DemoLabel>
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
