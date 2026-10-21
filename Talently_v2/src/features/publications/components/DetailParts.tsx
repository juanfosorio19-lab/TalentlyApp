// Piezas del cuerpo de DET-01, armadas solo con src/ui: cabecera de quien
// publica, lista de datos («a 18 km · Las Condes»), fila «rótulo + valor»,
// Requisitos, Beneficios y «Sobre la organización». src/ui aún no las trae
// como componentes (pedido en «requests»).
import type { MouseEventHandler, ReactNode } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { cx } from '../../../ui/cx';
import { IconAlert, IconCheck, type IconComponent } from '../../../ui/icons';
import { InfoTag, InfoTags } from '../../../ui/InfoTag';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { SectionCard, SectionRow } from '../../../ui/SectionCard';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import type { DemoAuthor, DemoRequirement } from '../../demo/types';
import { copy } from '../copy';
import { requirementIcon } from '../model';
import '../publications.css';

const avatarKind = (a: DemoAuthor) => (a.tipo === 'persona' ? 'person' : 'org');

/** Cabecera en `color-surface-2` bajo el AppBar transparente: Avatar de 56, nombre e insignias. */
export function DetailHero({ author, onVerification }: { author: DemoAuthor; onVerification: () => void }) {
    return (
        <div className="pub-hero">
            <Stack row gap={3} className="pub-hero__inner">
                <Avatar name={author.nombre} initials={author.iniciales} kind={avatarKind(author)} size={56} />
                <Stack gap={1} align="start">
                    <span className="button-lg">{author.nombre}</span>
                    {author.verificaciones.map((v) => (
                        <VerificationBadge key={v.label} status={v.status} onClick={onVerification}>
                            {v.label}
                        </VerificationBadge>
                    ))}
                </Stack>
            </Stack>
        </div>
    );
}

/** Lista de datos (`ul.tl-pub__facts`) fuera de la tarjeta. `list`: requisitos, separados 8. */
export function Facts({ variant, children }: { variant?: 'flush' | 'list'; children: ReactNode }) {
    return (
        <ul className={cx('tl-pub__facts', variant === 'flush' && 'pub-facts--flush', variant === 'list' && 'pub-facts--list')}>
            {children}
        </ul>
    );
}

export interface FactProps {
    icon: IconComponent;
    /** `ok`: lo cumple (check en success) · `alert`: aún no (alerta en danger). */
    tone?: 'ok' | 'alert';
    /** Badge al final («Obligatoria»): el texto ocupa el ancho que queda. */
    end?: ReactNode;
    children: ReactNode;
}

export function Fact({ icon: Icon, tone, end, children }: FactProps) {
    return (
        <li className={cx('tl-pub__fact', tone === 'ok' && 'tl-pub__fact--ok', tone === 'alert' && 'pub-fact--alert')}>
            <Icon />
            <span className={end ? 'pub-grow' : undefined}>{children}</span>
            {end}
        </li>
    );
}

/** Fila «rótulo + valor» de una SectionCard, con su ícono de 20 en `color-text-2`. */
export function DetailRow({ icon: Icon, label, children }: { icon: IconComponent; label: string; children: ReactNode }) {
    return (
        <SectionRow>
            <span className="pub-row-icon">
                <Icon size={20} />
            </span>
            <div className="pub-row-text">
                <span className="caption pub-muted">{label}</span>
                <span className="body">{children}</span>
            </div>
        </SectionRow>
    );
}

/**
 * «Requisitos»: cada requisito con su ícono (y «Obligatoria») y, debajo, su
 * estado para quien mira si los datos lo traen escrito para esa persona.
 */
export function RequirementsSection({ items, forViewer }: { items: readonly DemoRequirement[]; forViewer: boolean }) {
    return (
        <SectionCard title={copy.sections.requirements}>
            <Facts variant="list">
                {items.map((r) => (
                    <RequirementLines key={r.texto} item={r} forViewer={forViewer} />
                ))}
            </Facts>
        </SectionCard>
    );
}

function RequirementLines({ item, forViewer }: { item: DemoRequirement; forViewer: boolean }) {
    const mine = forViewer ? item.paraTi : undefined;
    return (
        <>
            <Fact icon={requirementIcon(item.texto)} end={item.obligatoria ? <Badge status="Obligatoria" /> : undefined}>
                {item.texto}
            </Fact>
            {mine && (
                <Fact icon={mine.cumple ? IconCheck : IconAlert} tone={mine.cumple ? 'ok' : 'alert'}>
                    {mine.texto}
                </Fact>
            )}
        </>
    );
}

/** «Beneficios»: InfoTag con check (InfoTag no tiene ese tipo de dato: el ícono va como hijo). */
export function BenefitsSection({ items }: { items: readonly string[] }) {
    return (
        <SectionCard title={copy.sections.benefits}>
            <InfoTags>
                {items.map((b) => (
                    <InfoTag key={b}>
                        <IconCheck />
                        {b}
                    </InfoTag>
                ))}
            </InfoTags>
        </SectionCard>
    );
}

/** «Sobre la organización»: la fila abre su perfil público (PRF-11). */
export function AboutOrgSection({
    author,
    text,
    href,
    onOpen,
}: {
    author: DemoAuthor;
    text: string;
    href: string;
    onOpen: MouseEventHandler<HTMLElement>;
}) {
    return (
        <SectionCard title={copy.sections.aboutOrg}>
            <List flat className="pub-bleed">
                <ListItem
                    avatar={<Avatar name={author.nombre} initials={author.iniciales} kind={avatarKind(author)} />}
                    title={author.nombre}
                    sub={text}
                    href={href}
                    onClick={onOpen}
                />
            </List>
        </SectionCard>
    );
}
