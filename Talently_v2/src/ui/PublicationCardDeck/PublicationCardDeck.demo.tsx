import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { Button } from '../Button';
import { Stack } from '../Layout';
import { Snackbar } from '../Snackbar';
import {
    PublicationCardDeck,
    PublicationCardDeckShortcut,
    type DeckDecision,
    type PublicationDeckCard,
} from './PublicationCardDeck';

// En el catálogo nada navega: en la app, la tarjeta abre DET-01 (o EXP-01 desde el atajo).
const noop = () => {};
const open = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();
/** Alto de la tarjeta en EXP-01 a 390 × 844 (entre el SegmentedControl y el ActionPair), como en el preview. */
const ALTO = 452;

/** Pantalla de 390 con su margen; la línea de contexto deja espacio para el sello, que sobresale 18 px. */
function Pantalla({ contexto, children }: { contexto: string; children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">
                <DemoLabel>{contexto}</DemoLabel>
                {children}
            </div>
        </DemoFrame>
    );
}

/** Un estado: su nombre arriba y la explicación abajo, como en el preview del sistema. */
function Estado({ name, note, children }: { name: string; note?: string; children?: ReactNode }) {
    return (
        <DemoRow column>
            <DemoLabel>{name}</DemoLabel>
            {children}
            {note && <DemoLabel>{note}</DemoLabel>}
        </DemoRow>
    );
}

const ORG_VERIFICADA = [{ status: 'verified', label: 'Organización verificada', onClick: noop }] as const;
const REQUISITOS_SPD = [
    { label: 'Credencial SPD (ex OS-10)', required: true },
    { label: 'Tienes tu credencial SPD vigente', met: true },
];

/** INI-01 · la primera oferta de «Empleos para ti» (también la tercera del deck de Jorge). */
const TALLER: PublicationDeckCard = {
    id: 'mecanico',
    author: { name: 'Taller Los Aromos', kind: 'org' },
    verifications: ORG_VERIFICADA,
    title: 'Mecánico/a automotriz',
    href: '#det-01',
    onOpen: open,
    tags: [
        { kind: 'jornada', label: 'Jornada completa' },
        { kind: 'contrato', label: 'Indefinido' },
    ],
    amount: { value: 750000, unit: 'mes', net: true },
    place: 'a 2 km · Macul',
};

/** EXP-01 · Jorge ve ofertas de guardia (F1). */
const OFERTAS: PublicationDeckCard[] = [
    {
        id: 'guardia-4x4',
        author: { name: 'Seguridad Andes Ltda.', kind: 'org' },
        verifications: ORG_VERIFICADA,
        title: 'Guardia de seguridad 4x4',
        href: '#det-01',
        onOpen: open,
        tags: [
            { kind: 'jornada', label: 'Jornada completa' },
            { kind: 'contrato', label: 'Plazo fijo' },
            { kind: 'fecha', label: 'Turno de noche' },
        ],
        amount: { value: 650000, unit: 'mes', net: true },
        place: 'a 4 km · Puente Alto',
        requirements: REQUISITOS_SPD,
        why: 'calza con tu oficio y está a 4 km',
    },
    {
        id: 'supervisor',
        author: { name: 'Protección Integral Ltda.', kind: 'org' },
        verifications: ORG_VERIFICADA,
        title: 'Supervisor/a de seguridad',
        href: '#det-01',
        onOpen: open,
        tags: [
            { kind: 'jornada', label: 'Jornada completa' },
            { kind: 'contrato', label: 'Indefinido' },
            { kind: 'modalidad', label: 'Presencial' },
        ],
        amount: { value: 850000, unit: 'mes', net: true },
        place: 'a 7 km · La Florida',
        requirements: REQUISITOS_SPD,
        why: 'calza con tu oficio y está a 7 km',
    },
    TALLER,
];

/** GES-03 y EXP-05 (M7) · Seguridad Andes Ltda. busca guardia: le sugerimos a Jorge. */
const JORGE: PublicationDeckCard = {
    id: 'jorge',
    subject: 'Jorge Muñoz',
    author: { name: 'Jorge Muñoz', kind: 'person' },
    verifications: [{ status: 'verified', label: 'Teléfono verificado', onClick: noop }],
    title: 'Guardia de seguridad',
    href: '#prf-10',
    onOpen: open,
    tags: [
        { kind: 'experiencia', label: '5 a 10 años de experiencia' },
        { kind: 'jornada', label: 'Sistema 4x4' },
        { kind: 'fecha', label: 'Disponible: Inmediata' },
    ],
    amount: { value: 650000, unit: 'mes', net: true, prefix: 'Pretensión:' },
    rating: { value: 4.9, count: 25 },
    reliability: 'Confiabilidad 96 %',
    place: 'a 3 km · Puente Alto',
    requirements: [{ label: 'Credencial SPD (ex OS-10) verificada · vence 03/2028', met: true }],
    why: 'calza con el oficio y el sistema 4x4 de tu oferta, y está a 3 km',
};

const DOS = OFERTAS.slice(0, 2);
const decisionText = (d: DeckDecision) => (d === 'si' ? '«Me interesa»' : '«No me interesa»');

/** El deck que se usa de verdad: arrastra la tarjeta o usa el ActionPair. */
function DeckInteractivo() {
    const [cards, setCards] = useState<PublicationDeckCard[]>(OFERTAS);
    const [ultima, setUltima] = useState<string | null>(null);
    const vacio = cards.length === 0;
    // Al decidir la última, el deck y su ActionPair desaparecen: el foco pasa a lo que queda
    // (en la app, el EmptyState «Viste todas las ofertas cerca»), no cae al body.
    const reiniciar = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (vacio) reiniciar.current?.focus();
    }, [vacio]);
    return (
        <>
            <Pantalla contexto="Explorar · Empleos (EXP-01) · Jorge">
                {!vacio ? (
                    <PublicationCardDeck
                        cards={cards}
                        cardMinHeight={ALTO}
                        onDecide={(decision, card) => {
                            setUltima(`${decisionText(decision)} en ${card.title}`);
                            setCards((prev) => prev.filter((c) => c.id !== card.id));
                        }}
                    />
                ) : (
                    <Button ref={reiniciar} variant="tonal" onClick={() => setCards(OFERTAS)}>
                        Volver a empezar
                    </Button>
                )}
            </Pantalla>
            <DemoLabel>
                {ultima
                    ? `Elegiste ${ultima}.`
                    : 'Arrastra la tarjeta a la derecha («Me interesa») o a la izquierda («No me interesa»); si no pasa el umbral, vuelve con ease-spring. El ActionPair hace lo mismo.'}
            </DemoLabel>
        </>
    );
}

const demo: DemoModule = {
    name: 'PublicationCardDeck',
    group: 'Publicaciones',
    summary:
        'El deck de empleos (EXP-01) y de Personas sugeridas (GES-03, EXP-05): la tarjeta grande con la siguiente debajo y el ActionPair. Se arrastra con sello «Me interesa» / «No me interesa», giro de 4° y vuelta con ease-spring.',
    Demo: () => (
        <>
            <DemoSection title="Tarjeta del deck · grande · surface-3 con elev-3 · ActionPair debajo">
                <DeckInteractivo />
            </DemoSection>

            <DemoSection title="Arrastre a la derecha · sello «Me interesa»">
                <Pantalla contexto="La siguiente oferta queda debajo, completa y quieta">
                    <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} previewDrag="yes" onDecide={noop} />
                </Pantalla>
            </DemoSection>

            <DemoSection title="Arrastre a la izquierda · sello «No me interesa»">
                <Pantalla contexto="La siguiente oferta queda debajo, completa y quieta">
                    <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} previewDrag="no" onDecide={noop} />
                </Pantalla>
                <DemoLabel>
                    Mientras se arrastra, el botón del lado correspondiente se ve presionado. Al soltar sin pasar el
                    umbral, la tarjeta vuelve con ease-spring.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Tarjeta de persona · el mismo deck y el mismo ActionPair">
                <Pantalla contexto="Personas sugeridas (GES-03 y EXP-05) · Seguridad Andes Ltda. busca guardia">
                    <PublicationCardDeck cards={[JORGE]} cardMinHeight={470} onDecide={noop} />
                </Pantalla>
                <DemoLabel>
                    Avatar redondo, oficio como título, años de experiencia y datos del oficio en InfoTag, pretensión,
                    nota y Confiabilidad, comuna y distancia, requisitos de la oferta con su estado. Nunca la edad.
                    «Me interesa» invita a postular: Snackbar «Invitaste a Jorge a postular · Deshacer».
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Perfil impulsado (F3) · sale primero con «Destacado»">
                <Pantalla contexto="Personas sugeridas · F3">
                    <PublicationCardDeck cards={[{ ...JORGE, promoted: true }]} cardMinHeight={470} onDecide={noop} />
                </Pantalla>
                <DemoLabel>
                    Solo en Personas sugeridas, lejos de la verificación. En Postulantes (GES-02) el impulso no cambia
                    el orden ni muestra la etiqueta.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Atajo al deck · INI-01 «Empleos para ti»">
                <Pantalla contexto="Inicio · Empleos para ti">
                    <PublicationCardDeckShortcut card={{ ...TALLER, href: '#exp-01' }} />
                </Pantalla>
                <DemoLabel>
                    La primera tarjeta del deck, compacta, sobre la misma pila (12 px de la siguiente). Tocarla abre
                    EXP-01 con esa tarjeta arriba; en Inicio no va el ActionPair.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Estados">
                <Estado name="Default" note="Mostrado arriba." />
                <Estado name="Presionado" note="Igual que la completa: capa al 8 %; un toque abre DET-01.">
                    <Pantalla contexto="Explorar · Empleos (EXP-01)">
                        <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} cardClassName="is-pressed" onDecide={noop} />
                    </Pantalla>
                </Estado>
                <Estado
                    name="Foco"
                    note="Contorno + halo sobre elev-3. Con teclado o lector, el ActionPair hace lo mismo que el arrastre."
                >
                    <Pantalla contexto="Explorar · Empleos (EXP-01)">
                        <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} cardClassName="is-focus" onDecide={noop} />
                    </Pantalla>
                </Estado>
                <DemoNotApplicable state="Seleccionado">
                    La tarjeta sale del deck y el ActionPair queda listo para la siguiente.
                </DemoNotApplicable>
                <Estado name="Deshabilitado" note="Sin conexión, el ActionPair se deshabilita y la tarjeta no se arrastra.">
                    <Pantalla contexto="Explorar · Empleos (EXP-01) · sin conexión">
                        <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} disabled onDecide={noop} />
                    </Pantalla>
                </Estado>
                <Estado
                    name="Error"
                    note="Si falla, la tarjeta vuelve al deck y aparece el Snackbar de error con «Reintentar»."
                >
                    <Pantalla contexto="Explorar · Empleos (EXP-01)">
                        {/* El Snackbar va a 12 del deck, como en el preview de PublicationCard (no al gap de la pantalla). */}
                        <Stack gap={3}>
                            <PublicationCardDeck cards={DOS} cardMinHeight={ALTO} onDecide={noop} />
                            <Snackbar
                                tone="error"
                                placement="static"
                                message="No pudimos guardar tu respuesta. Revisa tu conexión e intenta de nuevo."
                                action={{ label: 'Reintentar', onAction: noop }}
                            />
                        </Stack>
                    </Pantalla>
                </Estado>
                <Estado name="Cargando" note="Skeleton de tarjeta en el lugar del deck (sin la barra del CTA: decide el ActionPair).">
                    <Pantalla contexto="Explorar · Empleos (EXP-01)">
                        <PublicationCardDeck cards={[]} loading cardMinHeight={ALTO} onDecide={noop} />
                    </Pantalla>
                </Estado>
            </DemoSection>
        </>
    ),
};

export default demo;
