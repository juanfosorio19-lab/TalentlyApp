import type { ComponentPropsWithRef, MouseEventHandler } from 'react';
import { cx } from '../cx';
import { IconCheck, IconCloseCircle, IconDocument, IconInfo, IconLike, IconLocation, IconPeople } from '../icons';
import { Amount, type AmountFormatOptions } from '../Amount';
import { Avatar, type AvatarKind } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { InfoTag, InfoTags, type InfoTagKind } from '../InfoTag';
import { PromotedBadge } from '../PromotedBadge';
import { RatingStars } from '../RatingStars';
import { VerificationBadge, type VerificationStatus } from '../VerificationBadge';
import { cuposLabel, cuposTone, type Cupos } from './cupos';

/**
 * `full` (completa: EXP-02, EXP-03, EXP-04 y vista previa al publicar) ·
 * `compact` (`tl-pub--compact`: INI-01, EXP-01 en lista, EXP-07, PRF-02,
 * PRF-11; título 16, hasta 2 InfoTag, sin «Por qué ves esto» ni CTA) ·
 * `deck` (`tl-deck__card`: la tarjeta grande del deck, con avatar 56, sellos
 * del arrastre y «Requisitos»; la usa PublicationDeck).
 */
export type PublicationCardVariant = 'full' | 'compact' | 'deck';

/** Quien publica (o la persona, en Personas sugeridas). */
export interface PublicationAuthor {
    /** «Banquetería Rosa SpA», «Luis Contreras». Si no cabe junto a «Destacado», se corta con «…». */
    name: string;
    /** Organización (incluida «Familia en …») = avatar cuadrado; persona = redondo. */
    kind?: AvatarKind;
    /** Foto real del prestador (obligatoria en servicios, M10). `true` = marcador rayado del catálogo. */
    photo?: string | true | null;
    /** Iniciales a mano, si las calculadas no sirven. */
    initials?: string;
}

/** Una insignia de la cabecera (VerificationBadge): «Organización verificada», «SEC gas clase 3». */
export interface PublicationVerification {
    /** Solo `verified` con verificación real. */
    status: VerificationStatus;
    label: string;
    /** Abre la hoja «Verificación de …»: se toca aparte del resto de la tarjeta. */
    onClick: MouseEventHandler<HTMLButtonElement>;
}

/** Un dato clave (InfoTag): el ícono sale del tipo de dato. */
export interface PublicationTag {
    kind?: InfoTagKind;
    /** Texto del diccionario: «Jornada completa», «sáb 12 dic · 18:00–00:00 (6 h)». */
    label: string;
}

/** Una línea del bloque «Requisitos» (deck): el requisito o su estado para esta persona. */
export interface PublicationRequirement {
    /** «Credencial SPD (ex OS-10)», «Tienes tu credencial SPD vigente». */
    label: string;
    /** La persona lo cumple: check y `color-success-text` (`tl-pub__fact--ok`). */
    met?: boolean;
    /** Badge warning «Obligatoria» al lado. */
    required?: boolean;
}

/** La acción de la tarjeta: Button tonal. Empleo no lleva (se postula desde DET-01). */
export interface PublicationCta {
    /** Infinitivo: «Tomar turno», «Solicitar cotización», «Ver horarios», «Unirme a la lista de espera». */
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    /**
     * Turno (M6): Button sm a la derecha (`tl-pub__cta--end`). Sin `end`, md
     * a lo ancho (Servicio y Clase).
     */
    end?: boolean;
    /** Spinner en el botón mientras espera la respuesta. */
    loading?: boolean;
    /** Texto para lectores de pantalla mientras carga («Tomando el turno…»). */
    loadingLabel?: string;
    /** Solo catálogo: `is-pressed` / `is-focus` en el botón. */
    className?: string;
}

/**
 * El contenido de una publicación, ya listo para mostrar (textos del
 * diccionario, montos en CLP con su unidad). Cada parte es opcional salvo
 * cabecera y título: si falta, no aparece y nada cambia de lugar.
 */
export interface PublicationCardData {
    /** 1 · Cabecera: avatar + nombre. */
    author: PublicationAuthor;
    /** 1 · Cabecera: insignias de confianza bajo el nombre (bajan de línea si no caben). */
    verifications?: readonly PublicationVerification[];
    /** Premium (F3): PromotedBadge «Destacado» arriba a la derecha. No cambia nada más. */
    promoted?: boolean;
    /** 2 · Título H3: el oficio o servicio («Garzones para matrimonio»). */
    title: string;
    /**
     * Destino del enlace del título, que se estira sobre toda la tarjeta:
     * DET-01 (o EXP-01 en el atajo de Inicio).
     */
    href: string;
    /** Al tocar la tarjeta (el enlace): navegación de la app (`preventDefault` + router). */
    onOpen?: MouseEventHandler<HTMLAnchorElement>;
    /** 3 · InfoTag. La compacta muestra solo los 2 primeros. */
    tags?: readonly PublicationTag[];
    /** 4 · Monto en el formato único («$35.000 líquidos por turno», «Desde $25.000 por visita»). */
    amount?: AmountFormatOptions;
    /** 5 · Dato del tipo, Turno: «Quedan 3 de 8 cupos»; con 2 o menos, Badge warning; sin cupos, «Cupos completos». */
    cupos?: Cupos;
    /** 5 · Dato del tipo, Servicio, Clase y persona: nota con RatingStars («4,8 (23)»). */
    rating?: { value: number | null; count: number };
    /** 5 · Junto a la nota, en la tarjeta de persona: «Confiabilidad 96 %». */
    reliability?: string;
    /** 6 · Lugar: «a 21 km · Las Condes», «Atiende La Cisterna y 6 comunas más». */
    place?: string;
    /** Deck: bloque «Requisitos» con el estado para esta persona. */
    requirements?: readonly PublicationRequirement[];
    /** 7 · «Por qué ves esto: …», solo en listas recomendadas. Sin el rótulo: «calza con tu oficio y está a 4 km». */
    why?: string;
    /** 8 · CTA. No va en la compacta ni en el deck. */
    cta?: PublicationCta;
}

export interface PublicationCardProps
    extends PublicationCardData,
        Omit<ComponentPropsWithRef<'article'>, 'title' | 'children'> {
    variant?: PublicationCardVariant;
}

/** Dato del tipo de un turno: texto con 3 o más, Badge warning con 2 o menos, Badge neutral sin cupos. */
function CuposFact({ cupos }: { cupos: Cupos }) {
    const tone = cuposTone(cupos);
    return (
        <li className="tl-pub__fact">
            <IconPeople />
            {tone === 'text' ? (
                cuposLabel(cupos)
            ) : tone === 'warning' ? (
                <Badge tone="warning">{cuposLabel(cupos)}</Badge>
            ) : (
                <Badge status="Cupos completos" />
            )}
        </li>
    );
}

/**
 * La tarjeta de toda publicación: Empleo, Turno, Servicio y Clase (y la
 * persona en Personas sugeridas). Una sola estructura con orden fijo:
 * cabecera · título · InfoTag · Amount · dato del tipo · lugar · «Por qué
 * ves esto» · CTA. Toda la tarjeta abre el detalle con el enlace del título
 * estirado; las insignias y el CTA quedan por encima y se tocan aparte
 * (foco: insignia, título, CTA). No se selecciona ni se deshabilita.
 */
export function PublicationCard({
    variant = 'full',
    author,
    verifications,
    promoted,
    title,
    href,
    onOpen,
    tags,
    amount,
    cupos,
    rating,
    reliability,
    place,
    requirements,
    why,
    cta,
    className,
    ...rest
}: PublicationCardProps) {
    const compact = variant === 'compact';
    const deck = variant === 'deck';
    const shownTags = compact ? tags?.slice(0, 2) : tags;
    const hasFacts = Boolean(cupos || rating || reliability || place);

    return (
        <article className={cx('tl-pub', compact && 'tl-pub--compact', deck && 'tl-deck__card', className)} {...rest}>
            {deck && (
                <>
                    <span className="tl-deck__stamp tl-deck__stamp--yes" aria-hidden="true">
                        <IconLike />
                        Me interesa
                    </span>
                    <span className="tl-deck__stamp tl-deck__stamp--no" aria-hidden="true">
                        <IconCloseCircle />
                        No me interesa
                    </span>
                </>
            )}
            <div className="tl-pub__head">
                <Avatar
                    name={author.name}
                    kind={author.kind}
                    photo={author.photo}
                    initials={author.initials}
                    size={deck ? 56 : 40}
                    // Una foto real es contenido: se anuncia (como en el preview). Las iniciales no.
                    label={author.photo ? `Foto de ${author.name}` : undefined}
                />
                <span className="tl-pub__by">{author.name}</span>
                {promoted && <PromotedBadge />}
                {verifications && verifications.length > 0 && (
                    <div className="tl-pub__trust">
                        {verifications.map((v) => (
                            <VerificationBadge key={v.label} status={v.status} onClick={v.onClick}>
                                {v.label}
                            </VerificationBadge>
                        ))}
                    </div>
                )}
            </div>
            <h3 className="tl-pub__title">
                <a className="tl-pub__link" href={href} onClick={onOpen}>
                    {title}
                </a>
            </h3>
            {shownTags && shownTags.length > 0 && (
                <InfoTags className="tl-pub__tags">
                    {shownTags.map((t) => (
                        <InfoTag key={t.label} kind={t.kind}>
                            {t.label}
                        </InfoTag>
                    ))}
                </InfoTags>
            )}
            {amount && (
                <p className="tl-pub__amount">
                    <Amount {...amount} />
                </p>
            )}
            {hasFacts && (
                <ul className="tl-pub__facts">
                    {cupos && <CuposFact cupos={cupos} />}
                    {(rating || reliability) && (
                        <li className="tl-pub__fact">
                            {rating && <RatingStars value={rating.value} count={rating.count} />}
                            {reliability && <span>{rating ? `· ${reliability}` : reliability}</span>}
                        </li>
                    )}
                    {place && (
                        <li className="tl-pub__fact">
                            <IconLocation />
                            {place}
                        </li>
                    )}
                </ul>
            )}
            {!compact && requirements && requirements.length > 0 && (
                <div className="tl-pub__reqs">
                    <p className="overline">Requisitos</p>
                    <ul className="tl-pub__facts">
                        {requirements.map((r) => (
                            <li key={r.label} className={cx('tl-pub__fact', r.met && 'tl-pub__fact--ok')}>
                                {r.met ? <IconCheck /> : <IconDocument />}
                                <span>{r.label}</span>
                                {r.required && <Badge status="Obligatoria" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!compact && why && (
                <p className="tl-pub__why">
                    <IconInfo />
                    <span>
                        <b>Por qué ves esto:</b> {why}
                    </span>
                </p>
            )}
            {!compact && !deck && cta && (
                <div className={cx('tl-pub__cta', cta.end && 'tl-pub__cta--end')}>
                    <Button
                        variant="tonal"
                        size={cta.end ? 'sm' : 'md'}
                        block={!cta.end}
                        loading={cta.loading}
                        loadingLabel={cta.loadingLabel}
                        className={cta.className}
                        onClick={cta.onClick}
                    >
                        {cta.label}
                    </Button>
                </div>
            )}
        </article>
    );
}
