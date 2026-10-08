import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { Button } from '../Button';
import { MatchModal } from './MatchModal';

const noop = () => {};

const JORGE = { name: 'Jorge Muñoz' };
const ANDES = { name: 'Seguridad Andes Ltda.', shortName: 'Seguridad Andes' };
const PUBLICATION = 'Guardia de seguridad 4x4';

// Pantalla de fondo bajo el velo (DET-01 de la oferta a la que Jorge postuló).
function ScreenBehind({ children }: { children?: ReactNode }) {
    return (
        <div className="tl-app-screen__content">
            {children}
            <div className="tl-card">
                <div className="body-l">{PUBLICATION}</div>
                <div className="body">Seguridad Andes Ltda. · a 4 km · Puente Alto</div>
            </div>
            <div className="tl-card">
                <div className="body-l">$650.000 líquidos al mes</div>
                <div className="body">Jornada completa · Plazo fijo · Turno de noche</div>
            </div>
            <div className="tl-card">
                <div className="body-l">Requisitos</div>
                <div className="body">Credencial SPD (ex OS-10) · 1 a 3 años de experiencia</div>
            </div>
        </div>
    );
}

/** MatchModal de verdad: el foco va a «Enviar mensaje»; velo, Escape y «Seguir explorando» cierran y el foco vuelve al botón. */
function LiveMatch() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState('Esperando la respuesta de Seguridad Andes Ltda.');
    return (
        <DemoFrame height={640}>
            <ScreenBehind>
                <DemoRow>
                    <Button variant="tonal" onClick={() => setOpen(true)}>
                        Simular match
                    </Button>
                </DemoRow>
                <span className="caption dev-label">{result}</span>
            </ScreenBehind>
            <MatchModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setResult('Seguiste explorando');
                }}
                onMessage={() => {
                    setOpen(false);
                    setResult('Abriste la conversación con Seguridad Andes Ltda.');
                }}
                person={JORGE}
                org={ANDES}
                publication={PUBLICATION}
                portal={false}
            />
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'MatchModal',
    group: 'Chat y match',
    summary:
        'El aviso «¡Hicieron match!» (DET-03) sobre el velo: franja gradient-brand solo con los dos avatares, «Enviar mensaje» y «Seguir explorando». El único modal que celebra.',
    Demo: () => (
        <>
            <DemoSection title="Jorge Muñoz y Seguridad Andes Ltda. · Guardia de seguridad 4x4 (F1)">
                <DemoFrame height={640}>
                    <ScreenBehind />
                    <MatchModal
                        open
                        onClose={noop}
                        onMessage={noop}
                        person={JORGE}
                        org={ANDES}
                        publication={PUBLICATION}
                        portal={false}
                        modal={false}
                    />
                </DemoFrame>
                <DemoLabel>
                    Persona redonda a la izquierda y organización cuadrada a la derecha, sobre la franja de 120 con gradient-brand. Nada de
                    texto sobre el gradiente.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Probar: abrir, Escape o tocar el velo">
                <LiveMatch />
            </DemoSection>
            <DemoSection title="Default">
                <DemoLabel>Mostrado arriba. Se abre una sola vez por match, con duration-slow y ease-spring.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoNotApplicable>Lo tienen sus botones.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoNotApplicable>El foco entra en «Enviar mensaje»; el título se lee primero (aria-labelledby).</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>No aplica.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>Sin conexión se muestra igual: el mensaje se escribe y queda en cola.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error">
                <DemoNotApplicable>No aplica: el match ya existe cuando se muestra.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoNotApplicable>No espera datos: llega con el match.</DemoNotApplicable>
            </DemoSection>
        </>
    ),
};

export default demo;
