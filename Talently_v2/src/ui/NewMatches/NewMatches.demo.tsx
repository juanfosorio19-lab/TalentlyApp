import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { NewMatchCard, NewMatches, type NewMatch } from './NewMatches';

const noop = () => {};

const HOTEL: NewMatch = {
    id: 'hotel-andino',
    name: 'Hotel Andino',
    kind: 'org',
    context: { kind: 'empleo', title: 'Guardia turno de noche' },
};
const PUNTO: NewMatch = {
    id: 'punto-activo',
    name: 'Punto Activo Eventos Ltda.',
    kind: 'org',
    context: { kind: 'turno', title: 'Guardia de eventos', detail: 'sáb 12 dic' },
};
const ANDES: NewMatch = {
    id: 'seguridad-andes',
    name: 'Seguridad Andes Ltda.',
    kind: 'org',
    context: { kind: 'empleo', title: 'Guardia de seguridad 4x4' },
};

/** Mensajes de Jorge (MSG-01): la sección va arriba, con el margen lateral de la pantalla. */
function Screen({ children }: { children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

/** Una tarjeta sola en su fila, para los estados. */
function One({ className }: { className?: string }) {
    return (
        <ul className="tl-newmatches">
            <li>
                <NewMatchCard match={HOTEL} className={className} onClick={noop} />
            </li>
        </ul>
    );
}

function LiveNewMatches() {
    const [result, setResult] = useState('Toca un match para abrir la conversación.');
    return (
        <Screen>
            <NewMatches
                matches={[HOTEL, PUNTO, ANDES]}
                onOpen={(m) => setResult(`Abriste la conversación con ${m.name}`)}
            />
            <span className="caption dev-label">{result}</span>
        </Screen>
    );
}

const demo: DemoModule = {
    name: 'NewMatches',
    group: 'Chat y match',
    summary:
        '«Nuevos matches (n)» arriba de Mensajes: solo los matches sin mensajes, en una fila de tarjetas que se desliza. Cada tarjeta abre la conversación; sin matches nuevos la sección no aparece.',
    Demo: () => (
        <>
            <DemoSection title="Mensajes de Jorge · «Nuevos matches (2)» · solo matches sin mensajes">
                <Screen>
                    <NewMatches matches={[HOTEL, PUNTO]} onOpen={noop} />
                </Screen>
                <DemoLabel>
                    Tarjeta de 144 con Avatar de 56, nombre en dos líneas como máximo y el ContextChip en texto (ícono del tipo + tipo · título ·
                    fecha). Con más de dos, la fila se desliza.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Probar: con tres, la fila se desliza hasta el borde">
                <LiveNewMatches />
            </DemoSection>
            <DemoSection title="Default">
                <One />
            </DemoSection>
            <DemoSection title="Presionado">
                <One className="is-pressed" />
            </DemoSection>
            <DemoSection title="Foco">
                <One className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>
                    No se marca: abre la conversación y, con el primer mensaje, la tarjeta sale de la fila y pasa a la lista.
                </DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>No aplica.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error">
                <DemoNotApplicable>No aplica: llega con la lista de Mensajes.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoNotApplicable>Llega con la lista; mientras, Skeleton de fila.</DemoNotApplicable>
            </DemoSection>
            <DemoLabel>Sin matches nuevos la sección no aparece: nunca una fila vacía ni «0».</DemoLabel>
        </>
    ),
};

export default demo;
