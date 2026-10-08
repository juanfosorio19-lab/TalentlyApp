// Una sección del perfil (PRF-01 y PRF-02) con el mismo formato del
// prototipo: SectionCard con lápiz, filas «rótulo + valor» con su ícono,
// oficios con tile y Badge «Principal», credenciales con su estado, idiomas en
// una línea y la nota con candado al pie.
import type { ReactNode } from 'react';
import { Amount } from '../../../ui/Amount';
import { Badge } from '../../../ui/Badge';
import {
    IconCalendar,
    IconClassLanguages,
    IconClock,
    IconDocument,
    IconHome,
    IconInfo,
    IconJobAutomotive,
    IconJobFoodEvents,
    IconJobHomeCare,
    IconJobSecurity,
    IconLocation,
    IconLock,
    IconMoney,
    IconOffers,
    IconPeople,
    IconPerson,
    type IconComponent,
} from '../../../ui/icons';
import { InfoTag, InfoTags } from '../../../ui/InfoTag';
import { Stack } from '../../../ui/Layout';
import { SectionCard, SectionRow } from '../../../ui/SectionCard';
import type { DemoProfileSection, DemoRow } from '../../demo/types';

/** Ícono de cada dato, el mismo que en el prototipo (PRF-01). */
const ROW_ICON: Record<string, IconComponent> = {
    'Último trabajo': IconOffers,
    Jornada: IconClock,
    'Disponible desde': IconCalendar,
    'Sistema de turno': IconClock,
    'Turnos por día': IconCalendar,
    'Hasta dónde te mueves': IconLocation,
    'Sueldo líquido para empleos': IconMoney,
    'Tarifa mínima para turnos': IconMoney,
    'Así lo ven en tus avisos': IconHome,
    Comuna: IconLocation,
    'Contexto del hogar': IconPeople,
    // PRF-02 (no está en el prototipo).
    Rubro: IconOffers,
    Tamaño: IconPeople,
    'La administra': IconPerson,
};

/** Tile del oficio: el ícono de su categoría (Seguridad, Gastronomía y eventos…). */
function oficioIcon(oficio: string): IconComponent {
    const o = oficio.toLocaleLowerCase('es-CL');
    if (o.includes('guardia')) return IconJobSecurity;
    if (o.includes('garz') || o.includes('banquet') || o.includes('bartender')) return IconJobFoodEvents;
    if (o.includes('mecánic')) return IconJobAutomotive;
    if (o.includes('asesor') || o.includes('cuidador')) return IconJobHomeCare;
    return IconOffers;
}

function RowValue({ row }: { row: DemoRow }) {
    return (
        <span className="body">
            {row.monto ? <Amount value={row.monto.value} unit={row.monto.unit} net={row.monto.net} /> : row.value}
            {row.detalle && ` ${row.detalle}`}
        </span>
    );
}

/** Rótulo arriba (Caption) y valor abajo, con el ícono del dato a 20. */
function KeyValueRow({ row }: { row: DemoRow }) {
    const Icon = ROW_ICON[row.label] ?? IconInfo;
    return (
        <SectionRow>
            <span className="prf-icon">
                <Icon size={20} />
            </span>
            <Stack gap={1} align="start" className="prf-grow">
                <span className="caption prf-muted">{row.label}</span>
                <RowValue row={row} />
            </Stack>
        </SectionRow>
    );
}

/** Oficio: tile de su categoría, nombre en 600, experiencia y «Principal». */
function OficioRow({ row }: { row: DemoRow }) {
    return (
        <SectionRow icon={oficioIcon(row.label)}>
            <Stack gap={1} align="start" className="prf-grow">
                <span className="body prf-strong">{row.label}</span>
                {row.value && <span className="body prf-muted">{row.value}</span>}
                {row.badge && <Badge status={row.badge} />}
            </Stack>
        </SectionRow>
    );
}

/** Credencial: documento, su estado (Badge) y el detalle («Vence 03/2028»). */
function CredentialRow({ row }: { row: DemoRow }) {
    return (
        <SectionRow>
            <span className="prf-icon">
                <IconDocument size={20} />
            </span>
            <Stack gap={1} align="start" className="prf-grow">
                <span className="body">{row.label}</span>
                {row.badge && <Badge status={row.badge} />}
                {row.detalle && <span className="caption prf-muted">{row.detalle}</span>}
            </Stack>
        </SectionRow>
    );
}

/** Idioma: nombre y nivel en una línea. */
function InlineRow({ row, icon: Icon }: { row: DemoRow; icon: IconComponent }) {
    return (
        <SectionRow>
            <Stack row gap={3} className="prf-grow">
                <span className="prf-icon">
                    <Icon size={20} />
                </span>
                <span className="body prf-grow">{row.label}</span>
                <span className="body prf-muted">{row.value}</span>
            </Stack>
        </SectionRow>
    );
}

function Rows({ title, rows }: { title: string; rows: readonly DemoRow[] }) {
    const oficios = title.startsWith('Oficios');
    return (
        <>
            {rows.map((row) => {
                if (title === 'Idiomas') return <InlineRow key={row.label} row={row} icon={IconClassLanguages} />;
                if (oficios && row.label !== 'Último trabajo') return <OficioRow key={row.label} row={row} />;
                if (row.badge && !row.value && !row.monto) return <CredentialRow key={row.label} row={row} />;
                return <KeyValueRow key={row.label} row={row} />;
            })}
        </>
    );
}

export interface ProfileSectionProps {
    section: DemoProfileSection;
    /** El lápiz: abre la hoja de edición (o la pantalla que corresponde). Sin él, la sección no se edita. */
    onEdit?: () => void;
    /** La acción de una sección vacía («Subir CV en PDF»). */
    onEmptyAction?: () => void;
    /** Texto al pie, dentro de la tarjeta («Tus avisos se publican desde Inicio.»). */
    foot?: ReactNode;
}

export function ProfileSection({ section, onEdit, onEmptyAction, foot }: ProfileSectionProps) {
    if (section.tipo === 'vacio') {
        return (
            <SectionCard
                title={section.titulo}
                empty={{ text: section.texto, actionLabel: section.accion, onAction: () => onEmptyAction?.() }}
            />
        );
    }

    const edit = section.editable ? onEdit : undefined;
    let body: ReactNode;
    switch (section.tipo) {
        case 'texto':
            body = <p className="body-l prf-flush">{section.texto}</p>;
            break;
        case 'filas':
            body = (
                <>
                    <Rows title={section.titulo} rows={section.filas} />
                    {section.nota && (
                        <p className="caption prf-note">
                            <IconLock size={16} />
                            <span>{section.nota}</span>
                        </p>
                    )}
                </>
            );
            break;
        case 'tags':
            body = (
                <InfoTags>
                    {section.tags.map((t) => (
                        <InfoTag key={t.text} kind={t.kind}>
                            {t.text}
                        </InfoTag>
                    ))}
                </InfoTags>
            );
            break;
        case 'archivo':
            body = (
                <SectionRow icon={IconDocument}>
                    <Stack gap={1} align="start" className="prf-grow">
                        <span className="body prf-strong">{section.nombre}</span>
                        <span className="caption prf-muted">{section.detalle}</span>
                    </Stack>
                </SectionRow>
            );
            break;
    }

    return (
        <SectionCard title={section.titulo} onEdit={edit}>
            {body}
            {foot && <p className="body prf-foot">{foot}</p>}
        </SectionCard>
    );
}
