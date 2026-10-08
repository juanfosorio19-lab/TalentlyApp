// Publicaciones en Inicio: «Turnos para ti» (PublicationCard compacta, abre
// DET-01) y «Empleos para ti» (atajo al deck: abre EXP-01).
import { paths } from '../../../app/paths';
import { PublicationCard, type PublicationCardData } from '../../../ui/PublicationCard';
import { PublicationCardDeckShortcut } from '../../../ui/PublicationCardDeck';
import { getPublication } from '../../demo/data';
import type { DemoAuthor, DemoPublication } from '../../demo/types';
import { useAppLinks } from '../links';

/** La publicación de los datos, ya en la forma de la tarjeta. */
function cardData(
    pub: DemoPublication,
    link: { href: string; onClick: PublicationCardData['onOpen'] },
    onVerify: (author: DemoAuthor) => void,
): PublicationCardData {
    return {
        author: {
            name: pub.autor.nombre,
            kind: pub.autor.tipo === 'persona' ? 'person' : 'org',
            initials: pub.autor.iniciales,
        },
        verifications: pub.autor.verificaciones.map((v) => ({
            status: v.status,
            label: v.label,
            onClick: () => onVerify(pub.autor),
        })),
        title: pub.titulo,
        href: link.href,
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
    /** Abre «Verificación de …» al tocar la insignia de quien publica. */
    onVerify: (author: DemoAuthor) => void;
}

/** «Turnos para ti»: tarjetas compactas; cada una abre su detalle (flujo 2: → DET-01). */
export function ShiftCards({ ids, onVerify }: HomePublicationsProps) {
    const { linkProps } = useAppLinks();
    return existing(ids).map((pub) => (
        <PublicationCard key={pub.id} variant="compact" {...cardData(pub, linkProps(paths.publicacion(pub.id)), onVerify)} />
    ));
}

/** «Empleos para ti»: la primera oferta sobre la pila del deck; abre EXP-01 con ella arriba. */
export function JobsShortcut({ ids, onVerify }: HomePublicationsProps) {
    const { linkProps } = useAppLinks();
    const first = existing(ids)[0];
    if (!first) return null;
    return <PublicationCardDeckShortcut card={cardData(first, linkProps(paths.explorar('empleo')), onVerify)} />;
}
