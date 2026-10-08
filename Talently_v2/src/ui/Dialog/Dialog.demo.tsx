import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Button } from '../Button/Button';
import { RadioGroup } from '../Radio';
import { Dialog } from './Dialog';

const noop = () => {};

// Pantalla de fondo bajo el velo (un paso del perfil).
function ScreenBehind({ children }: { children?: ReactNode }) {
    return (
        <div className="tl-app-screen__content">
            {children}
            <div className="tl-card">
                <div className="body-l">Garzón para matrimonio</div>
                <div className="body">sáb 12 dic · 19:00 · Vitacura</div>
            </div>
            <div className="tl-card">
                <div className="body-l">$35.000 líquidos por turno</div>
                <div className="body">Quedan 3 de 8 cupos</div>
            </div>
            <div className="tl-card">
                <div className="body-l">Banquetería Rosa SpA</div>
                <div className="body">a 3 km · Ñuñoa</div>
            </div>
        </div>
    );
}

function DiscardDialog({ loading }: { loading?: boolean }) {
    return (
        <DemoFrame height={440}>
            <ScreenBehind />
            <Dialog
                open
                onClose={noop}
                title="¿Descartar cambios?"
                cancelLabel="Seguir editando"
                confirmLabel="Descartar"
                onConfirm={noop}
                destructive
                loading={loading}
                loadingLabel="Descartando…"
                portal={false}
                modal={false}
            >
                Si sales ahora, no se guarda lo que cambiaste en este paso.
            </Dialog>
        </DemoFrame>
    );
}

function PauseDialog() {
    return (
        <DemoFrame height={440}>
            <ScreenBehind />
            <Dialog
                open
                onClose={noop}
                title="¿Pausar la publicación?"
                confirmLabel="Pausar"
                onConfirm={noop}
                portal={false}
                modal={false}
            >
                No recibirás postulaciones mientras esté pausada. Puedes reactivarla cuando quieras.
            </Dialog>
        </DemoFrame>
    );
}

const WEB_REASONS = [
    { value: 'foto', label: 'La foto no se lee' },
    { value: 'vencido', label: 'El documento venció' },
    { value: 'persona', label: 'No coincide con la persona' },
] as const;
type WebReason = (typeof WEB_REASONS)[number]['value'];

/**
 * Escritorio del backoffice (M11) a 1024, donde se verifica: el Dialog web se
 * ve a su ancho real de 560. Con claro y oscuro lado a lado, el marco se
 * ajusta al panel y el Dialog con él.
 */
function DesktopFrame({ children }: { children: ReactNode }) {
    return (
        <div className="dev-frame" style={{ width: 1024, height: 560 }}>
            {children}
        </div>
    );
}

function WebDialog() {
    const [reason, setReason] = useState<WebReason | null>(null);
    return (
        <DesktopFrame>
            <ScreenBehind />
            <Dialog
                open
                onClose={noop}
                title="Rechazar con motivo"
                confirmLabel="Rechazar"
                onConfirm={noop}
                destructive
                confirmDisabled={!reason}
                variant="web"
                portal={false}
                modal={false}
            >
                <p className="body-l">Le contaremos a Andrés Carrasco el motivo para que suba otra credencial SPD.</p>
                <RadioGroup legend="Motivo" options={WEB_REASONS} value={reason} onChange={setReason} />
            </Dialog>
        </DesktopFrame>
    );
}

/** Dialog de verdad: el foco va a «Seguir editando»; Escape, velo y «Seguir editando» no destruyen. */
function LiveDialog() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState('Sin cambios descartados');
    return (
        <DemoFrame height={440}>
            <ScreenBehind>
                <DemoRow>
                    <Button variant="outline" onClick={() => setOpen(true)}>
                        Salir del paso
                    </Button>
                </DemoRow>
                <span className="caption dev-label">{result}</span>
            </ScreenBehind>
            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    setResult('Seguiste editando');
                }}
                title="¿Descartar cambios?"
                cancelLabel="Seguir editando"
                confirmLabel="Descartar"
                onConfirm={() => {
                    setOpen(false);
                    setResult('Descartaste los cambios');
                }}
                destructive
                portal={false}
            >
                Si sales ahora, no se guarda lo que cambiaste en este paso.
            </Dialog>
        </DemoFrame>
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
    name: 'Dialog',
    group: 'Capas',
    summary:
        'Ventana de confirmación, solo para confirmar: título en pregunta, la consecuencia y dos acciones (la que no destruye en ghost, con el foco al abrir).',
    Demo: () => (
        <>
            <DemoSection title="Descartar cambios · acción destructiva en danger">
                <DiscardDialog />
            </DemoSection>
            <DemoSection title="Confirmación no destructiva · primary">
                <PauseDialog />
            </DemoSection>
            <DemoSection title="Web (backoffice, M11) · confirma con su motivo">
                <WebDialog />
            </DemoSection>
            <DemoSection title="Probar: el foco va a «Seguir editando»">
                <LiveDialog />
            </DemoSection>
            <DemoSection title="Estados">
                <State name="Default">
                    <div className="body">Mostrado arriba.</div>
                </State>
                <State name="Presionado" na>
                    Lo tienen sus botones.
                </State>
                <State name="Foco" na>
                    Al abrir, el foco va a la acción que no destruye («Seguir editando»); no sale del diálogo.
                </State>
                <State name="Seleccionado" na>
                    Un diálogo no se marca.
                </State>
                <State name="Deshabilitado" na>
                    Sus dos acciones siempre funcionan.
                </State>
                <DemoLabel>
                    Solo en web (variant «web»): confirmar con motivo espera a que se elija uno, como «Rechazar» arriba.
                </DemoLabel>
                <State name="Error" na>
                    Si la acción falla, el diálogo se cierra y aparece un Snackbar de error con «Reintentar».
                </State>
                <State name="Cargando · la acción usa su estado cargando mientras se confirma">
                    <DiscardDialog loading />
                </State>
            </DemoSection>
        </>
    ),
};

export default demo;
