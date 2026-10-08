import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoRow, DemoSection } from '../catalog/demo';
import { ChipGroup } from '../ChipGroup';
import { IconBell, IconFilter } from '../icons';
import { IconButton } from '../IconButton/IconButton';
import { Banner } from './Banner';

const noop = () => {};

const OFFLINE = 'Sin conexión. Mostramos lo último que cargaste.';

// Marcado mínimo de AppBar large (el componente AppBar lo construye otro grupo).
function ExploreAppBar() {
    return (
        <header className="tl-appbar">
            <div className="tl-appbar__row">
                <h1 className="tl-appbar__title h1">Explorar</h1>
                <div className="tl-appbar__actions">
                    <IconButton icon={IconFilter} label="Filtros" />
                    <IconButton icon={IconBell} label="Notificaciones" />
                </div>
            </div>
        </header>
    );
}

const CONTRACTS = ['Plazo fijo', 'Por obra', 'Part time', 'Boleta de honorarios', 'Boleta de terceros'].map((c) => ({
    value: c,
    label: c,
}));

/** «Forma de contratación»: se elige una; el Banner educativo explica la elegida. */
function ContractChips() {
    const [value, setValue] = useState<string[]>(['Boleta de honorarios']);
    return (
        <ChipGroup
            label="Forma de contratación"
            options={CONTRACTS}
            value={value}
            onChange={(next) => setValue(next.filter((v) => !value.includes(v)))}
        />
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
    name: 'Banner',
    group: 'Avisos y estados',
    summary:
        'El único componente para todo aviso que se queda en pantalla (info, éxito, warning, danger; fijo bajo el AppBar). No se cierra solo; lo temporal es un Snackbar.',
    Demo: () => (
        <>
            <DemoSection title="Cuatro tonos · fondo -subtle · ícono de 20 · texto Body 14">
                <DemoRow column>
                    <Banner tone="warning">Por tu seguridad, mantén la conversación en Talently.</Banner>
                    <Banner tone="success">Tu teléfono quedó verificado.</Banner>
                    <Banner action={{ label: 'Reintentar', onAction: noop }}>{OFFLINE}</Banner>
                    <Banner tone="danger" action={{ label: 'Subir', onAction: noop }}>
                        Tu certificado de manipulación de alimentos venció. Súbelo de nuevo para tomar turnos de garzón.
                    </Banner>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Aviso fijo · bajo el AppBar, de borde a borde">
                <DemoFrame>
                    <ExploreAppBar />
                    <Banner fixed action={{ label: 'Reintentar', onAction: noop }}>
                        {OFFLINE}
                    </Banner>
                    <div className="tl-app-screen__content">
                        <div className="tl-card">
                            <div className="body-l">Garzón para matrimonio</div>
                            <div className="body">sáb 12 dic · 19:00 · Vitacura</div>
                        </div>
                        <div className="tl-card">
                            <div className="body-l">Bartender para evento de empresa</div>
                            <div className="body">vie 11 dic · 20:00 · Providencia</div>
                        </div>
                    </div>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Aviso educativo en línea · dentro de un formulario">
                <ContractChips />
                <Banner>
                    Con boleta, el turno es sin subordinación ni dependencia: la persona organiza su trabajo y no recibe órdenes
                    como un empleado.
                </Banner>
            </DemoSection>
            <DemoSection title="Con contador (M9) · RES-02 en F3, mientras pagas">
                <Banner tone="warning" timer="09:42" timerLabel="Quedan 9 minutos y 42 segundos">
                    Te guardamos el horario por 10 minutos. Si no pagas a tiempo, se libera.
                </Banner>
                <span className="caption dev-label">
                    El contador va a la derecha, en 16/600 con cifras tabulares en el color de texto del tono, y no se anuncia cada
                    segundo: el lector lo lee al llegar a él. En 00:00 la reserva pasa a «Expirada» y el horario se libera.
                </span>
            </DemoSection>
            <DemoSection title="Estados">
                <State name="Default">
                    <div className="body">Mostrado arriba.</div>
                </State>
                <State name="Presionado · lo tiene su acción">
                    <Banner action={{ label: 'Reintentar', onAction: noop, className: 'is-pressed' }}>{OFFLINE}</Banner>
                </State>
                <State name="Foco · lo tiene su acción; el aviso se anuncia con role «status» o «alert»">
                    <Banner action={{ label: 'Reintentar', onAction: noop, className: 'is-focus' }}>{OFFLINE}</Banner>
                </State>
                <State name="Seleccionado" na>
                    No se marca.
                </State>
                <State name="Deshabilitado" na>
                    Si la acción no aplica, el Banner no la muestra.
                </State>
                <State name="Error · tono danger">
                    <Banner tone="danger" action={{ label: 'Subir', onAction: noop }}>
                        Tu certificado de manipulación de alimentos venció. Súbelo de nuevo para tomar turnos de garzón.
                    </Banner>
                </State>
                <State name="Cargando · su acción usa el estado cargando del Button">
                    <Banner action={{ label: 'Reintentar', onAction: noop, loading: true, loadingLabel: 'Reintentando…' }}>
                        {OFFLINE}
                    </Banner>
                </State>
            </DemoSection>
        </>
    ),
};

export default demo;
