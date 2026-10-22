// PUBL-04 · Aviso para mi hogar, el contenido de los pasos 1 a 4 (el
// StepLayout, el CTA y la navegación los pone HogarWizardScreen).
import { Banner } from '../../../ui/Banner';
import { CheckboxGroup } from '../../../ui/Checkbox';
import { ChipGroup } from '../../../ui/ChipGroup';
import { IconCalendar, IconClock, IconHome, IconShield } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { OptionGroup } from '../../../ui/OptionCard';
import { PublicationCard } from '../../../ui/PublicationCard';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { Select } from '../../../ui/Select';
import { TextArea } from '../../../ui/TextArea';
import type { DemoActor } from '../../demo/session';
import { copy } from '../copy';
import {
    ALGO_MAS_MAX,
    COLACIONES,
    CONTEXTOS,
    DIAS,
    HOGAR_OFICIOS,
    HOGAR_UNITS,
    MODALIDADES,
    TAREAS,
    hogarTags,
    hogarTitle,
    horasSemanaText,
    pideInhabilidades,
    type HogarDraft,
    type HogarErrors,
    type HogarOficio,
    type Modalidad,
} from '../model/hogar';
import { previewAuthor } from '../model/publisher';
import { timeOptions } from '../model/time';
import { amountPreview } from '../model/turno';
import { Note } from './Parts';
import { fieldId } from './TurnoSteps';

export interface HogarStepProps {
    draft: HogarDraft;
    errors: HogarErrors | null;
    onPatch: (patch: Partial<HogarDraft>) => void;
}

// ─── Paso 1 · Tipo y puertas ────────────────────────────────────────────────

export function HogarStep1({ draft, errors, onPatch }: HogarStepProps) {
    const p = copy.hogar.paso1;
    return (
        <Stack gap={6}>
            <Select<HogarOficio>
                id={fieldId('oficio')}
                label={p.oficio}
                placeholder={p.oficio}
                searchPlaceholder={p.oficioBuscar}
                options={HOGAR_OFICIOS}
                value={draft.oficio}
                onChange={(oficio) => onPatch({ oficio })}
            />
            <OptionGroup<Modalidad>
                id={fieldId('modalidad')}
                mode="single"
                legend={p.tipo}
                value={draft.modalidad}
                onChange={(modalidad) => onPatch({ modalidad })}
                options={MODALIDADES.map((m) => ({
                    value: m.value,
                    icon: m.value === 'dias' ? IconCalendar : IconHome,
                    title: m.title,
                    example: m.example,
                }))}
                error={errors?.modalidad}
            />
            {draft.modalidad && <p className="caption publish-flush publish-muted">{p.seLlamara(hogarTitle(draft))}</p>}
        </Stack>
    );
}

// ─── Paso 2 · Días y horario ────────────────────────────────────────────────

const HOURS = timeOptions(30, '06:00', '23:00');

export function HogarStep2({ draft, errors, onPatch }: HogarStepProps) {
    const p = copy.hogar.paso2;
    return (
        <Stack gap={6}>
            <ChipGroup
                id={fieldId('dias')}
                label={p.dias}
                options={DIAS}
                value={draft.dias}
                onChange={(dias) => onPatch({ dias })}
                error={errors?.dias}
            />
            <div className="publish-grid">
                <Select
                    id={fieldId('desde')}
                    label={p.desde}
                    placeholder="--:--"
                    options={HOURS}
                    searchable={false}
                    value={draft.desde}
                    onChange={(desde) => onPatch({ desde })}
                />
                <Select
                    id={fieldId('hasta')}
                    label={p.hasta}
                    placeholder="--:--"
                    options={HOURS}
                    searchable={false}
                    value={draft.hasta}
                    onChange={(hasta) => onPatch({ hasta })}
                    error={errors?.hasta}
                />
            </div>
            <Select
                label={p.colacion}
                placeholder={p.colacion}
                options={COLACIONES}
                searchable={false}
                value={String(draft.colacion)}
                onChange={(v) => onPatch({ colacion: Number(v) })}
            />
            {draft.dias.length > 0 && !errors?.hasta && (
                <Note icon={IconClock} size="body">
                    {p.horasAntes}
                    <b>{horasSemanaText(draft)}</b>
                    {p.horasDespues}
                </Note>
            )}
        </Stack>
    );
}

// ─── Paso 3 · Tareas y contexto ─────────────────────────────────────────────

export function HogarStep3({ draft, errors, onPatch }: HogarStepProps) {
    const p = copy.hogar.paso3;
    return (
        <Stack gap={6}>
            <CheckboxGroup
                legend={p.contexto}
                options={CONTEXTOS}
                value={draft.contexto}
                onChange={(contexto) => onPatch({ contexto })}
            />
            {pideInhabilidades(draft) && (
                <div className="publish-after-group">
                    <Banner>{p.ninos}</Banner>
                </div>
            )}
            <CheckboxGroup
                id={fieldId('tareas')}
                legend={p.tareas}
                options={TAREAS}
                value={draft.tareas}
                onChange={(tareas) => onPatch({ tareas })}
                error={errors?.tareas}
            />
            <TextArea
                label={p.algoMas}
                optional
                rows={3}
                maxLength={ALGO_MAS_MAX}
                value={draft.algoMas}
                onChange={(ev) => onPatch({ algoMas: ev.target.value })}
            />
        </Stack>
    );
}

// ─── Paso 4 · Sueldo y vista previa ─────────────────────────────────────────

export function HogarStep4({
    actor,
    draft,
    errors,
    onPatch,
    identityPending,
}: HogarStepProps & { actor: DemoActor; identityPending: boolean }) {
    const p = copy.hogar.paso4;
    const t = copy.turno.paso3;
    return (
        <Stack gap={6}>
            <Stack gap={4}>
                <SegmentedControl<'liquido' | 'bruto'>
                    aria-label={t.tipoMonto}
                    options={[
                        { value: 'liquido', label: t.liquido },
                        { value: 'bruto', label: t.bruto },
                    ]}
                    value={draft.neto ? 'liquido' : 'bruto'}
                    onChange={(v) => onPatch({ neto: v === 'liquido' })}
                />
                <MoneyField
                    id={fieldId('sueldo')}
                    label={draft.neto ? p.sueldoLiquido : p.sueldoBruto}
                    value={draft.sueldo}
                    onChange={(sueldo) => onPatch({ sueldo })}
                    unit={draft.unidad}
                    units={HOGAR_UNITS}
                    onUnitChange={(unidad) => onPatch({ unidad })}
                    help={amountPreview(draft.sueldo, draft.unidad, draft.neto)}
                    error={errors?.sueldo}
                />
            </Stack>
            <Stack gap={3}>
                <p className="overline publish-flush publish-muted">{p.asiLoVeran}</p>
                {/* Vista previa: se mira, no se toca. */}
                <div inert>
                    <PublicationCard
                        author={previewAuthor(actor)}
                        title={hogarTitle(draft)}
                        href="#"
                        tags={hogarTags(draft)}
                        amount={{ value: draft.sueldo, unit: draft.unidad, net: draft.neto }}
                        place={actor.comuna}
                    />
                </div>
                {identityPending && <Note icon={IconShield}>{p.identidad}</Note>}
            </Stack>
        </Stack>
    );
}
