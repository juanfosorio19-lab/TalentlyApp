import { useEffect, useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { ErrorState } from './ErrorState';

/** Estado que el componente no tiene, con su motivo (como en el sistema de diseño). */
function NotApplicable({ children }: { children: string }) {
    return (
        <span className="body">
            <span className="tl-badge">No aplica</span> {children}
        </span>
    );
}

const noop = () => {};

/** «Reintentar» de verdad: pasa a cargando 1,5 s y vuelve a fallar (el texto no cambia). */
function LiveErrorState() {
    const [retrying, setRetrying] = useState(false);
    useEffect(() => {
        if (!retrying) return;
        const t = setTimeout(() => setRetrying(false), 1500);
        return () => clearTimeout(t);
    }, [retrying]);
    return <ErrorState title="No pudimos cargar los turnos" onRetry={() => setRetrying(true)} retrying={retrying} />;
}

function ErrorStateDemo() {
    return (
        <>
            <DemoSection title="No cargó la lista (tócalo: reintenta y vuelve a fallar)">
                <DemoFrame>
                    <LiveErrorState />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Sin conexión y sin datos guardados">
                <DemoFrame>
                    <ErrorState
                        title="Estás sin conexión"
                        text="Conéctate a internet para ver los turnos de hoy."
                        onRetry={noop}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoSection title="Default"><DemoLabel>Mostrado arriba.</DemoLabel></DemoSection>
                <DemoSection title="Presionado">
                    <DemoFrame>
                        <ErrorState title="No pudimos cargar los turnos" onRetry={noop} retryProps={{ className: 'is-pressed' }} />
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Foco">
                    <DemoFrame>
                        <ErrorState title="No pudimos cargar los turnos" onRetry={noop} retryProps={{ className: 'is-focus' }} />
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Seleccionado"><NotApplicable>No se marca.</NotApplicable></DemoSection>
                <DemoSection title="Deshabilitado"><NotApplicable>«Reintentar» siempre se puede tocar.</NotApplicable></DemoSection>
                <DemoSection title="Error"><DemoLabel>Es el propio estado de error.</DemoLabel></DemoSection>
                <DemoSection title="Cargando · reintentando: si vuelve a fallar, el texto no cambia">
                    <DemoFrame>
                        <ErrorState title="No pudimos cargar los turnos" onRetry={noop} retrying />
                    </DemoFrame>
                </DemoSection>
                <DemoLabel>
                    Si hay datos guardados, no se usa ErrorState: se muestran con el Banner «Sin conexión. Mostramos lo
                    último que cargaste».
                </DemoLabel>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'ErrorState',
    group: 'Avisos y estados',
    summary: 'La pantalla no pudo cargar y no hay nada guardado: círculo danger con alerta, qué falló con palabras humanas y «Reintentar» en primary.',
    Demo: ErrorStateDemo,
};

export default demo;
