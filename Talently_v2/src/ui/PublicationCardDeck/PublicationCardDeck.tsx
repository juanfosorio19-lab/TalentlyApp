import { useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type PointerEvent } from 'react';
import { cx } from '../cx';
import { ActionPair, type ActionPairChoice } from '../ActionPair';
import { PublicationCard, type PublicationCardData } from '../PublicationCard';
import { Skeleton, SkeletonGroup } from '../Skeleton';

/** La decisión sobre la tarjeta de arriba: `si` = «Me interesa» (derecha) · `no` = «No me interesa» (izquierda). */
export type DeckDecision = 'si' | 'no';

/**
 * Una tarjeta del deck: el contenido de PublicationCard más su identificador.
 * `id` y `subject` son del deck: no llegan al `<article>` (el id de la base no
 * es un id del DOM, y se repetiría si la publicación aparece dos veces).
 */
export interface PublicationDeckCard extends PublicationCardData {
    /** Identificador estable de la publicación o de la persona (`key` y `onDecide`). */
    id: string;
    /**
     * Sobre qué se decide, para el lector de pantalla («Me interesa, Jorge
     * Muñoz»). Por defecto, el título.
     */
    subject?: string;
}

export interface PublicationCardDeckProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
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
     *
     * Foco: al decidir la última tarjeta el deck desaparece con su ActionPair,
     * que pudo tener el foco (teclado o lector de pantalla). La pantalla debe
     * llevar el foco a su EmptyState (el título o su acción) en cuanto lo
     * dibuja; si no, cae al `body` y no se anuncia nada.
     */
    onDecide: (decision: DeckDecision, card: PublicationDeckCard) => void;
    /** Sin conexión: el ActionPair se deshabilita y la tarjeta no se arrastra. */
    disabled?: boolean;
    /** Skeleton de tarjeta en el lugar del deck, con el ActionPair deshabilitado. */
    loading?: boolean;
    /**
     * Alto mínimo de la tarjeta, calculado por la pantalla para llenar el
     * espacio entre el SegmentedControl y el ActionPair (en EXP-01 a 390 ×
     * 844, unos 452). Provisorio: bundle.css no trae una regla para que
     * `.tl-deck` estire su tarjeta al alto disponible (brecha); cuando la
     * traiga, esta prop sobra.
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
 * El contenido para PublicationCard, sin `id` ni `subject`: son del deck y,
 * esparcidos en la tarjeta, terminarían como atributos del `<article>`.
 */
function toCardData(card: PublicationCardData & Partial<Pick<PublicationDeckCard, 'id' | 'subject'>>): PublicationCardData {
    const data = { ...card };
    delete data.id;
    delete data.subject;
    return data;
}

/**
 * Deck que carga: la forma de la tarjeta del deck (avatar de 56, título,
 * InfoTag, monto y lugar) sin la barra del CTA, porque en el deck decide el
 * ActionPair. Con `aria-busy` y «Cargando…» oculto, como SkeletonCard.
 */
function DeckSkeleton({ style }: { style?: CSSProperties }) {
    return (
        <SkeletonGroup className="tl-pub tl-deck__card" style={style}>
            <div className="tl-pub__head" aria-hidden="true">
                <span className="tl-avatar tl-avatar--org tl-avatar--56">
                    <Skeleton shape="square" size={56} />
                </span>
                <span className="tl-pub__by">
                    <Skeleton shape="line" width="55%" />
                </span>
                <span className="tl-pub__trust">
                    <Skeleton shape="line" width="35%" />
                </span>
            </div>
            <span className="tl-pub__title" aria-hidden="true">
                <Skeleton shape="title" width="80%" />
            </span>
            <span className="tl-tags tl-pub__tags" aria-hidden="true">
                <Skeleton shape="tag" width={136} />
                <Skeleton shape="tag" width={96} />
            </span>
            <span className="tl-pub__amount tl-stack tl-stack--3" aria-hidden="true">
                <Skeleton shape="title" width="50%" />
                <Skeleton shape="line" width="40%" />
            </span>
        </SkeletonGroup>
    );
}

/**
 * Deck de empleos (EXP-01) y de Personas sugeridas (GES-03, EXP-05): la
 * tarjeta grande arriba, la siguiente debajo y el ActionPair. La tarjeta se
 * arrastra con el dedo: a la derecha muestra el sello «Me interesa», a la
 * izquierda «No me interesa», gira hasta 4° y, si no pasa el umbral, vuelve
 * con `ease-spring`. Los botones del ActionPair hacen lo mismo que el
 * arrastre (también con teclado y lector de pantalla). Tocar la tarjeta
 * abre el detalle. Con «reducir movimiento» no hay animaciones (bundle.css).
 */
export function PublicationCardDeck({
    cards,
    onDecide,
    disabled,
    loading,
    cardMinHeight,
    previewDrag,
    cardClassName,
    className,
    ...rest
}: PublicationCardDeckProps) {
    const [drag, setDrag] = useState<Drag | null>(null);
    const topRef = useRef<HTMLElement | null>(null);
    const gesture = useRef<Gesture | null>(null);
    // Un arrastre con mouse termina con un click sobre el enlace estirado: no debe abrir el detalle.
    const swallowClick = useRef(false);
    const exitTimer = useRef<number | undefined>(undefined);
    // Hasta cuándo (performance.now) se ignoran otras decisiones; ver «reducir movimiento» en decide.
    const lockedUntil = useRef(0);

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
        if (performance.now() < lockedUntil.current) return;
        const card = top;
        const el = topRef.current;
        // La salida dura lo que la transición de `.tl-deck__card` (duration-slow). No se lee
        // transitionDuration porque durante el arrastre la tarjeta lleva `transition: none`.
        const ms = el ? parseFloat(getComputedStyle(el).getPropertyValue('--duration-slow')) || 0 : 0;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const finish = () => {
            setDrag(null);
            onDecide(toDecision(choice), card);
        };
        if (reduce || ms === 0) {
            // Sin salida animada se decide al tiro y la tarjeta de abajo sube de inmediato. Sin la
            // fase 'leave' que protege la salida animada, un doble toque decidiría también esa
            // tarjeta, que la persona no alcanzó a ver: se ignoran decisiones lo que habría durado.
            lockedUntil.current = performance.now() + ms;
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
        // El click de este mismo gesto (mouse) llega antes que el timer y se descarta. Un arrastre
        // táctil no genera click: el timer borra la marca para no perder la próxima activación
        // (Enter, lector de pantalla) en la tarjeta o en la que sube.
        swallowClick.current = true;
        window.setTimeout(() => {
            swallowClick.current = false;
        }, 0);
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
            // Provisorio: no es un valor calculado; bundle.css no trae `.tl-deck__card.is-dragging
            // { transition: none }` (brecha). Cuando lo traiga, va la clase y se borra esta línea.
            transition: active.phase === 'drag' ? 'none' : undefined,
        };
    }
    // Provisorio hasta que bundle.css estire la tarjeta al alto disponible (ver `cardMinHeight`).
    const minHeight: CSSProperties | undefined = cardMinHeight ? { minHeight: cardMinHeight } : undefined;

    return (
        <div className={className} {...rest}>
            <div className="tl-deck">
                {loading || !top ? (
                    <DeckSkeleton style={minHeight} />
                ) : (
                    [next, top].map((card) => {
                        if (!card) return null;
                        const data = toCardData(card);
                        return card === top ? (
                            <PublicationCard
                                key={card.id}
                                {...data}
                                variant="deck"
                                ref={topRef}
                                className={cx(side && `is-drag-${side}`, cardClassName)}
                                style={{ ...minHeight, ...dragStyle }}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerCancel}
                                onClickCapture={(e) => {
                                    // detail 0: click de teclado o de lector de pantalla, nunca el de un arrastre.
                                    if (!swallowClick.current || e.detail === 0) return;
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
                                {...data}
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

export interface PublicationCardDeckShortcutProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /**
     * La primera oferta del deck (sirve la PublicationDeckCard tal cual: su
     * `id` y `subject` no llegan al DOM). Su `href` abre EXP-01 con esa
     * tarjeta arriba (no DET-01): es la única excepción a «toda la tarjeta
     * abre el detalle» (decisiones M4 punto 2).
     */
    card: PublicationCardData | PublicationDeckCard;
}

/**
 * Atajo al deck en Inicio (INI-01, «Empleos para ti»): la PublicationCard
 * compacta de la primera oferta sobre la pila de `.tl-deck` (asoma 12 px de
 * la siguiente). Sin ActionPair: se decide en el deck o en el detalle.
 */
export function PublicationCardDeckShortcut({ card, className, ...rest }: PublicationCardDeckShortcutProps) {
    return (
        <div className={cx('tl-deck', className)} {...rest}>
            <PublicationCard {...toCardData(card)} variant="compact" />
        </div>
    );
}
