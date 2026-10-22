// Publicaciones en Inicio: «Turnos para ti» (PublicationCard compacta, abre
// DET-01) y «Empleos para ti» (atajo al deck: abre EXP-01).
import type { LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { PublicationCard, type PublicationCardData } from '../../../ui/PublicationCard';
import { PublicationCardDeckShortcut } from '../../../ui/PublicationCardDeck';
import { getPublication } from '../../demo/data';
import type { DemoPublication } from '../../demo/types';
import { useHomeNavigation } from '../navigation';

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
    return existing(ids).map((pub) => (
        <PublicationCard key={pub.id} variant="compact" {...cardData(pub, link(paths.publicacion(pub.id)), onVerify)} />
    ));
}

/** «Empleos para ti»: la primera oferta sobre la pila del deck; abre EXP-01. */
export function JobsShortcut({ ids, onVerify }: HomePublicationsProps) {
    const { link } = useHomeNavigation();
    const first = existing(ids)[0];
    if (!first) return null;
    return <PublicationCardDeckShortcut card={cardData(first, link(paths.explorar('empleo')), onVerify)} />;
}
