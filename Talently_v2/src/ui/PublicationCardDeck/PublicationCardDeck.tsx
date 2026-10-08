import { useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type PointerEvent } from 'react';
import { cx } from '../cx';
import { ActionPair, type ActionPairChoice } from '../ActionPair';
import { PublicationCard, type PublicationCardData } from '../PublicationCard';
import { SkeletonCard } from '../Skeleton';

/** La decisión sobre la tarjeta de arriba: `si` = «Me interesa» (derecha) · `no` = «No me interesa» (izquierda). */
export type DeckDecision = 'si' | 'no';

/** Una tarjeta del deck: el contenido de PublicationCard más su identificador. */
export interface PublicationDeckCard extends PublicationCardData {
    /** Identificador estable de la publicación o de la persona. */
    id: string;
    /**
     * Sobre qué se decide, para el lector de pantalla («Me interesa, Jorge
     * Muñoz»). Por defecto, el título.
     */
    subject?: string;
}

export interface PublicationDeckProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /**
     * Las tarjetas en orden: la primera va arriba y la segunda queda debajo,
     * completa y quieta. Sin tarjetas no se dibuja nada (la pantalla muestra
     * su EmptyState: «Viste todas las ofertas cerca»).
     */
    cards: readonly PublicationDeckCard[];
    /**
     * Se decidió la tarjeta de arriba, con el arrastre o con el ActionPair.
     * Llega cuando la tarjeta ya salió: quítala de `cards` (la de abajo sube).
     * Si la acción falla, vuelve a ponerla primera y muestra el Snackbar con
     * «Reintentar»; si no la quitas, vuelve sola al centro.
     */
    onDecide: (decision: DeckDecision, card: PublicationDeckCard) => void;
    /** Sin conexión: el ActionPair se deshabilita y la tarjeta no se arrastra. */
    disabled?: boolean;
    /** Skeleton de tarjeta en el lugar del deck, con el ActionPair deshabilitado. */
    loading?: boolean;
    /**
     * Alto mínimo de la tarjeta, calculado por la pantalla para llenar el
     * espacio entre el SegmentedControl y el ActionPair (en EXP-01 a 390 ×
     * 844, unos 452). bundle.css no trae una regla que lo resuelva.
     */
    cardMinHeight?: number;
    /** Solo catálogo: muestra el arrastre a un lado (sello, giro y botón presionado) sin tocar. */
    previewDrag?: ActionPairChoice;
    /** Solo catálogo: `is-pressed` / `is-focus` en la tarjeta de arriba. */
    cardClassName?: string;
}

/** Distancia (px) antes de decidir que el gesto es un arrastre horizontal y no un toque o un scroll. */
const SLOP = 8;
/** Fracción del ancho de la tarjeta que hay que arrastrar para decidir. */
const THRESHOLD = 0.3;
/** Giro máximo (grados), al llegar al umbral. */
const MAX_TILT = 4;
/** Cuánto más allá de su ancho sale la tarjeta al decidir. */
const EXIT_EXTRA = 48;

type Drag = { id: string; dx: number; width: number; phase: 'drag' | 'leave' };
type Gesture = { pointerId: number; x: number; y: number; width: number; dragging: boolean };

const toDecision = (choice: ActionPairChoice): DeckDecision => (choice === 'yes' ? 'si' : 'no');

/**
 * Deck de empleos (EXP-01) y de Personas sugeridas (GES-03, EXP-05): la
 * tarjeta grande arriba, la siguiente debajo y el ActionPair. La tarjeta se
 * arrastra con el dedo: a la derecha muestra el sello «Me interesa», a la
 * izquierda «No me interesa», gira hasta 4° y, si no pasa el umbral, vuelve
 * con `ease-spring`. Los botones del ActionPair hacen lo mismo que el
 * arrastre (también con teclado y lector de pantalla). Tocar la tarjeta
 * abre el detalle. Con «reducir movimiento» no hay animaciones (bundle.css).
 */
export function PublicationDeck({
    cards,
    onDecide,
    disabled,
    loading,
    cardMinHeight,
    previewDrag,
    cardClassName,
    className,
    ...rest
}: PublicationDeckProps) {
    const [drag, setDrag] = useState<Drag | null>(null);
    const topRef = useRef<HTMLElement | null>(null);
    const gesture = useRef<Gesture | null>(null);
    // Un arrastre termina con un click sobre el enlace estirado: no debe abrir el detalle.
    const swallowClick = useRef(false);
    const exitTimer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(exitTimer.current), []);

    const top = cards[0];
    const next = cards[1];
    // El estado del arrastre es de una tarjeta: si ya no está arriba, no cuenta.
    const active = drag && top && drag.id === top.id ? drag : null;
    const leaving = active?.phase === 'leave';
    const side: ActionPairChoice | undefined =
        previewDrag ?? (active && active.dx !== 0 ? (active.dx > 0 ? 'yes' : 'no') : undefined);

    if (!loading && !top) return null;

    const decide = (choice: ActionPairChoice) => {
        if (!top || disabled || loading || leaving) return;
        const card = top;
        const el = topRef.current;
        // La salida dura lo que la transición de `.tl-deck__card` (duration-slow); con
        // «reducir movimiento» no hay salida animada: se decide al tiro. No se lee
        // transitionDuration porque durante el arrastre la tarjeta lleva `transition: none`.
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const ms = reduce || !el ? 0 : parseFloat(getComputedStyle(el).getPropertyValue('--duration-slow')) || 0;
        const finish = () => {
            setDrag(null);
            onDecide(toDecision(choice), card);
        };
        if (ms === 0) {
            finish();
            return;
        }
        const width = el?.offsetWidth ?? 0;
        setDrag({ id: card.id, dx: (choice === 'yes' ? 1 : -1) * (width + EXIT_EXTRA), width, phase: 'leave' });
        window.clearTimeout(exitTimer.current);
        exitTimer.current = window.setTimeout(finish, ms);
    };

    const onPointerDown = (e: PointerEvent<HTMLElement>) => {
        swallowClick.current = false;
        if (disabled || leaving || !e.isPrimary || e.button !== 0) return;
        gesture.current = {
            pointerId: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            width: e.currentTarget.offsetWidth,
            dragging: false,
        };
    };

    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
        const g = gesture.current;
        if (!g || g.pointerId !== e.pointerId || !top) return;
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (!g.dragging) {
            if (Math.abs(dy) > SLOP && Math.abs(dy) >= Math.abs(dx)) {
                gesture.current = null; // es un scroll vertical
                return;
            }
            if (Math.abs(dx) < SLOP) return;
            g.dragging = true;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        setDrag({ id: top.id, dx, width: g.width, phase: 'drag' });
    };

    const onPointerUp = (e: PointerEvent<HTMLElement>) => {
        const g = gesture.current;
        gesture.current = null;
        if (!g || g.pointerId !== e.pointerId || !g.dragging) return;
        swallowClick.current = true;
        const dx = e.clientX - g.x;
        if (Math.abs(dx) >= g.width * THRESHOLD) decide(dx > 0 ? 'yes' : 'no');
        else setDrag(null); // vuelve al centro con ease-spring
    };

    const onPointerCancel = () => {
        gesture.current = null;
        if (!leaving) setDrag(null);
    };

    // Posición del arrastre (valor calculado): sigue al dedo y gira hasta 4° al llegar al umbral.
    let dragStyle: CSSProperties | undefined;
    if (active) {
        const tilt = Math.max(-1, Math.min(1, active.dx / (Math.max(active.width, 1) * THRESHOLD))) * MAX_TILT;
        dragStyle = {
            transform: `translateX(${active.dx}px) rotate(${tilt}deg)`,
            // Mientras el dedo arrastra, sin transición (si no, la tarjeta se queda atrás).
            transition: active.phase === 'drag' ? 'none' : undefined,
        };
    }
    const minHeight: CSSProperties | undefined = cardMinHeight ? { minHeight: cardMinHeight } : undefined;

    return (
        <div className={className} {...rest}>
            <div className="tl-deck">
                {loading || !top ? (
                    <SkeletonCard className="tl-deck__card" style={minHeight} />
                ) : (
                    [next, top].map((card) => {
                        if (!card) return null;
                        const isTop = card === top;
                        return isTop ? (
                            <PublicationCard
                                key={card.id}
                                {...card}
                                variant="deck"
                                ref={topRef}
                                className={cx(side && `is-drag-${side}`, cardClassName)}
                                style={{ ...minHeight, ...dragStyle }}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerCancel}
                                onClickCapture={(e) => {
                                    if (!swallowClick.current) return;
                                    swallowClick.current = false;
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                // El enlace del título no se arrastra como enlace (arrastre nativo del navegador).
                                onDragStart={(e) => e.preventDefault()}
                            />
                        ) : (
                            <PublicationCard
                                key={card.id}
                                {...card}
                                variant="deck"
                                className="tl-deck__card--next"
                                style={minHeight}
                                aria-hidden="true"
                                inert
                            />
                        );
                    })
                )}
            </div>
            <ActionPair
                onYes={() => decide('yes')}
                onNo={() => decide('no')}
                disabled={disabled || loading || !top}
                dragging={side}
                subject={top ? (top.subject ?? top.title) : undefined}
            />
        </div>
    );
}

export interface PublicationDeckShortcutProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /**
     * La primera oferta del deck. Su `href` abre EXP-01 con esa tarjeta
     * arriba (no DET-01): es la única excepción a «toda la tarjeta abre el
     * detalle» (decisiones M4 punto 2).
     */
    card: PublicationCardData;
}

/**
 * Atajo al deck en Inicio (INI-01, «Empleos para ti»): la PublicationCard
 * compacta de la primera oferta sobre la pila de `.tl-deck` (asoma 12 px de
 * la siguiente). Sin ActionPair: se decide en el deck o en el detalle.
 */
export function PublicationDeckShortcut({ card, className, ...rest }: PublicationDeckShortcutProps) {
    return (
        <div className={cx('tl-deck', className)} {...rest}>
            <PublicationCard {...card} variant="compact" />
        </div>
    );
}
