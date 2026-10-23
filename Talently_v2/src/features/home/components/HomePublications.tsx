// Publicaciones en Inicio: «Turnos para ti» (PublicationCard compacta, abre
// DET-01) y «Empleos para ti» (atajo al deck: abre EXP-01 en el deck, con la
// misma tarjeta arriba).
import type { LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { PublicationCard, type PublicationCardData } from '../../../ui/PublicationCard';
import { PublicationCardDeckShortcut } from '../../../ui/PublicationCardDeck';
import { useLivePublication } from '../../demo/manageHooks';
import { getExplore, getPublication } from '../../demo/data';
import { useDemoSession, type DemoActorId } from '../../demo/session';
import { useDecided } from '../../demo/sessionStore';
import type { DemoPublication } from '../../demo/types';
import { useHomeNavigation } from '../navigation';
import { deckTopId } from '../selectors';

/** La publicación de los datos, ya en la forma de la tarjeta. */
function cardData(pub: DemoPublication, link: LinkTargetProps, onVerify: (publicationId: string) => void): PublicationCardData {
    return {
        author: {
            name: pub.autor.nombre,
            kind: pub.autor.tipo === 'persona' ? 'person' : 'org',
            initials: pub.autor.iniciales,
        },
        verifications: pub.autor.verificaciones.map((v) => ({
            status: v.status,
            label: v.label,
            onClick: () => onVerify(pub.id),
        })),
        title: pub.titulo,
        // Sin pantalla de destino, el enlace no lleva a ningún lado y su toque dice «Disponible pronto».
        href: link.href ?? '#',
        onOpen: link.onClick,
        tags: pub.tags.map((t) => ({ kind: t.kind, label: t.text })),
        amount: pub.monto ? { ...pub.monto } : { value: null, negotiableLabel: pub.tipo === 'empleo' ? undefined : 'A convenir' },
        cupos: pub.tipo === 'turno' ? pub.cupos : undefined,
        place: pub.lugar,
    };
}

const existing = (ids: readonly string[]) => ids.map((id) => getPublication(id)).filter((p): p is DemoPublication => p !== undefined);

export interface HomePublicationsProps {
    ids: readonly string[];
    /** Abre «Verificación de …» de quien publica, al tocar su insignia. */
    onVerify: (publicationId: string) => void;
}

/** «Turnos para ti»: tarjetas compactas; cada una abre su detalle (flujo 2: → DET-01). */
export function ShiftCards({ ids, onVerify }: HomePublicationsProps) {
    const { link } = useHomeNavigation();
    // Los cupos que quedan con lo confirmado en la sesión (los mismos de DET-01 y GES-04).
    const live = useLivePublication();
    return existing(ids).map(live).map((pub) => (
        <PublicationCard key={pub.id} variant="compact" {...cardData(pub, link(paths.publicacion(pub.id)), onVerify)} />
    ));
}

/** Las ofertas del deck de EXP-01, en su orden (los datos de Explorar del actor). */
function deckOf(actorId: DemoActorId): string[] {
    try {
        return getExplore(actorId).empleos.publicaciones.filter((id) => getPublication(id)?.tipo === 'empleo');
    } catch {
        // Sin datos de Explorar: el atajo usa las del bloque.
        return [];
    }
}

/**
 * La oferta de arriba del deck de EXP-01 con lo decidido en la sesión (el
 * mismo useDecided de Explorar): «Me interesa», «No me interesa» o postular
 * la saca del atajo igual que del deck.
 */
export function useDeckTop(ids: readonly string[]): DemoPublication | undefined {
    const { actor, recienRegistrado } = useDemoSession();
    const decided = useDecided(actor.id, recienRegistrado);
    const id = deckTopId(deckOf(actor.id), existing(ids).map((p) => p.id), decided);
    return id ? getPublication(id) : undefined;
}

export interface JobsShortcutProps {
    /** La oferta de arriba del deck (useDeckTop). */
    publication: DemoPublication;
    /** Abre «Verificación de …» de quien publica, al tocar su insignia. */
    onVerify: (publicationId: string) => void;
}

/** «Empleos para ti»: la oferta de arriba sobre la pila del deck; abre EXP-01 en el deck, con ella arriba. */
export function JobsShortcut({ publication, onVerify }: JobsShortcutProps) {
    const { link } = useHomeNavigation();
    // Siempre el deck (no la vista de partida del actor, que para Jorge es la lista): es un atajo al deck.
    return (
        <PublicationCardDeckShortcut
            card={cardData(publication, link(paths.explorar('empleo', { vista: 'deck' })), onVerify)}
        />
    );
}
