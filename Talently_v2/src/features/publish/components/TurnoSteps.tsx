// PUBL-03 · Publicar turno, el contenido de los pasos 1 a 4 (el StepLayout,
// el CTA y la navegación los pone TurnoWizardScreen). Cada paso recibe el
// borrador, los errores que hay que mostrar y cómo cambiar el borrador.
import { useEffect, useRef, useState } from 'react';
import { Banner } from '../../../ui/Banner';
import { Button } from '../../../ui/Button';
import { ChipGroup } from '../../../ui/ChipGroup';
import { IconAdd, IconCalendar, IconDocument, IconEdit, IconInfo, IconLocation, IconPerson, IconShield, IconTrash } from '../../../ui/icons';
import { IconButton } from '../../../ui/IconButton';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { OptionGroup } from '../../../ui/OptionCard';
import { formatAmount } from '../../../ui/Amount';
import { PublicationCard, cuposLabel } from '../../../ui/PublicationCard';
import { SectionCard } from '../../../ui/SectionCard';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { ShiftBlock, ShiftBlocks } from '../../../ui/ShiftBlock';
import { Switch } from '../../../ui/Switch';
import { TextArea } from '../../../ui/TextArea';
import { TextField } from '../../../ui/TextField';
import type { DemoActor } from '../../demo/session';
import { copy } from '../copy';
import { previewAuthor, previewVerification } from '../model/publisher';
import { dateOptions, dayParts, timeOptions } from '../model/time';
import {
    CUPOS_MAX,
    NOTAS_MINIMAS,
    TITLE_MAX,
    TURNO_UNITS,
    VESTIMENTAS,
    addShift,
    amountPreview,
    contratacionText,
    contratacionesFor,
    credencialNote,
    isBoleta,
    oficioOf,
    oficiosFor,
    requisitosText,
    shiftLines,
    shiftMeta,
    shiftTags,
    totalCupos,
    vestimentaText,
    type Contratacion,
    type ShiftDraft,
    type TurnoDraft,
    type TurnoErrors,
    type TurnoTemplate,
} from '../model/turno';
import { Note, SummaryRow } from './Parts';
import { UrlSelect } from './UrlSelect';

export interface TurnoStepProps {
    draft: TurnoDraft;
    /** Errores del paso, solo después de tocar «Continuar» con algo pendiente. */
    errors: TurnoErrors | null;
    onPatch: (patch: Partial<TurnoDraft>) => void;
}

/** Ids de los campos, para llevar el foco al primero con error. */
export const fieldId = (key: string) => `publish-${key}`;

// ─── Paso 1 · Oficio y plantilla ────────────────────────────────────────────

export function TurnoStep1({
    actor,
    draft,
    errors,
    onPatch,
    template,
    onStart,
}: TurnoStepProps & { actor: DemoActor; template: TurnoTemplate | null; onStart: (inicio: 'plantilla' | 'cero') => void }) {
    const e = errors?.fields;
    return (
        <Stack gap={6}>
            {template && (
                <OptionGroup<'plantilla' | 'cero'>
                    mode="single"
                    legend={copy.turno.paso1.leyenda}
                    legendHidden
                    value={draft.inicio === 'cero' ? 'cero' : 'plantilla'}
                    onChange={onStart}
                    options={[
                        { value: 'plantilla', icon: IconDocument, title: copy.turno.paso1.plantilla(template.titulo), example: template.detalle },
                        { value: 'cero', icon: IconAdd, title: copy.turno.paso1.cero, example: copy.turno.paso1.ceroEj },
                    ]}
                />
            )}
            <UrlSelect
                sheet="oficio"
                id={fieldId('oficio')}
                label={copy.turno.paso1.oficio}
                placeholder={copy.turno.paso1.oficioPlaceholder}
                searchPlaceholder={copy.turno.paso1.oficioBuscar}
                options={oficiosFor(actor)}
                value={draft.oficio}
                onChange={(oficio) => onPatch({ oficio })}
                error={e?.oficio}
            />
            <TextField
                id={fieldId('titulo')}
                label={copy.turno.paso1.titulo_}
                value={draft.titulo}
                maxLength={TITLE_MAX}
                autoComplete="off"
                onChange={(ev) => onPatch({ titulo: ev.target.value })}
                help={copy.turno.paso1.tituloAyuda}
                error={e?.titulo}
            />
        </Stack>
    );
}

// ─── Paso 2 · Fechas y bloques ──────────────────────────────────────────────

const DATE_OPTIONS = dateOptions();
const TIME_OPTIONS = timeOptions();

function ShiftEditor({
    block,
    index,
    canRemove,
    errors,
    onChange,
    onRemove,
}: {
    block: ShiftDraft;
    index: number;
    canRemove: boolean;
    errors: TurnoErrors['bloques'][string] | undefined;
    onChange: (patch: Partial<ShiftDraft>) => void;
    onRemove: () => void;
}) {
    const n = index + 1;
    const titleId = fieldId(`${block.id}-titulo`);
    // Cupos se escribe como texto: vacío mientras borra, y solo dígitos.
    const [cupos, setCupos] = useState(block.cupos === null ? '' : String(block.cupos));
    return (
        // Brecha: SectionCard aún no acepta una acción propia en la cabecera (el basurero); pedido en «requests».
        <section className="tl-section publish-block" aria-labelledby={titleId}>
            <div className="tl-section__head">
                <h2 id={titleId} className="tl-section__title h3">
                    {copy.turno.paso2.bloque(n)}
                </h2>
                {canRemove && <IconButton icon={IconTrash} label={copy.turno.paso2.quitar(n)} onClick={onRemove} />}
            </div>
            <Stack gap={4}>
                <UrlSelect
                    sheet="fecha"
                    param={{ key: 'bloque', value: block.id }}
                    id={fieldId(`${block.id}-fecha`)}
                    label={copy.turno.paso2.fecha}
                    placeholder={copy.turno.paso2.fechaPlaceholder}
                    searchPlaceholder={copy.turno.paso2.fechaBuscar}
                    options={DATE_OPTIONS}
                    value={block.fecha}
                    onChange={(fecha) => onChange({ fecha })}
                    error={errors?.fecha}
                />
                <div className="publish-grid publish-grid--shift">
                    <UrlSelect
                        sheet="desde"
                        param={{ key: 'bloque', value: block.id }}
                        id={fieldId(`${block.id}-desde`)}
                        label={copy.turno.paso2.desde}
                        placeholder="--:--"
                        options={TIME_OPTIONS}
                        searchable={false}
                        value={block.desde}
                        onChange={(desde) => onChange({ desde })}
                    />
                    <UrlSelect
                        sheet="hasta"
                        param={{ key: 'bloque', value: block.id }}
                        id={fieldId(`${block.id}-hasta`)}
                        label={copy.turno.paso2.hasta}
                        placeholder="--:--"
                        options={TIME_OPTIONS}
                        searchable={false}
                        value={block.hasta}
                        onChange={(hasta) => onChange({ hasta })}
                        error={errors?.hasta}
                    />
                    <TextField
                        id={fieldId(`${block.id}-cupos`)}
                        label={copy.turno.paso2.cupos}
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={2}
                        value={cupos}
                        onChange={(ev) => {
                            const digits = ev.target.value.replace(/\D/g, '').slice(0, String(CUPOS_MAX).length);
                            setCupos(digits);
                            onChange({ cupos: digits === '' ? null : Number(digits) });
                        }}
                        error={errors?.cupos}
                    />
                </div>
            </Stack>
        </section>
    );
}

function ShiftSummary({ block, index, onEdit }: { block: ShiftDraft & { fecha: string }; index: number; onEdit: () => void }) {
    const labelId = fieldId(`${block.id}-rotulo`);
    const { weekday, day, month } = dayParts(block.fecha);
    return (
        <Stack gap={2}>
            <div className="publish-between">
                <span id={labelId} className="overline publish-muted">
                    {copy.turno.paso2.bloque(index + 1)}
                </span>
                <Button variant="ghost" size="sm" icon={IconEdit} aria-describedby={labelId} onClick={onEdit}>
                    {copy.turno.paso2.editar}
                </Button>
            </div>
            <ShiftBlocks>
                <ShiftBlock weekday={weekday} day={day} month={month} time={`${block.desde}–${block.hasta}`} duration={shiftMeta(block)} />
            </ShiftBlocks>
        </Stack>
    );
}

export function TurnoStep2({ draft, errors, onPatch }: TurnoStepProps) {
    // El bloque que se está editando: al llegar, el último (como en el prototipo); con errores, también esos.
    const [editing, setEditing] = useState<string[]>(() => {
        const last = draft.bloques[draft.bloques.length - 1];
        return last ? [last.id] : [];
    });
    // Tras «Editar» o «Agregar otro bloque», el foco va a la fecha del bloque que se abre; tras quitar uno, a «Agregar».
    const [focusTarget, setFocusTarget] = useState<{ id: string; n: number } | null>(null);
    const addRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!focusTarget) return;
        const el = focusTarget.id === 'agregar' ? addRef.current : document.getElementById(fieldId(`${focusTarget.id}-fecha`));
        el?.focus();
    }, [focusTarget]);

    const withErrors = new Set(Object.keys(errors?.bloques ?? {}));
    const isOpen = (b: ShiftDraft) => editing.includes(b.id) || withErrors.has(b.id) || b.fecha === null;

    const changeBlock = (id: string, patch: Partial<ShiftDraft>) =>
        onPatch({ bloques: draft.bloques.map((b) => (b.id === id ? { ...b, ...patch } : b)) });

    const remove = (id: string) => {
        onPatch({ bloques: draft.bloques.filter((b) => b.id !== id) });
        setEditing((list) => list.filter((x) => x !== id));
        setFocusTarget((t) => ({ id: 'agregar', n: (t?.n ?? 0) + 1 }));
    };

    const add = () => {
        const bloques = addShift(draft.bloques);
        const added = bloques[bloques.length - 1];
        if (!added) return;
        onPatch({ bloques });
        // Los bloques completos se cierran: queda abierto el nuevo.
        setEditing([added.id]);
        setFocusTarget((t) => ({ id: added.id, n: (t?.n ?? 0) + 1 }));
    };

    const edit = (id: string) => {
        setEditing((list) => [...list, id]);
        setFocusTarget((t) => ({ id, n: (t?.n ?? 0) + 1 }));
    };

    return (
        <Stack gap={6}>
            {draft.bloques.map((b, i) =>
                // Sin fecha, el bloque siempre está abierto (isOpen ya lo dice; aquí lo sabe también el tipo).
                isOpen(b) || b.fecha === null ? (
                    <ShiftEditor
                        key={b.id}
                        block={b}
                        index={i}
                        canRemove={draft.bloques.length > 1}
                        errors={errors?.bloques[b.id]}
                        onChange={(patch) => changeBlock(b.id, patch)}
                        onRemove={() => remove(b.id)}
                    />
                ) : (
                    <ShiftSummary key={b.id} block={{ ...b, fecha: b.fecha }} index={i} onEdit={() => edit(b.id)} />
                ),
            )}
            <Button ref={addRef} variant="outline" block icon={IconAdd} onClick={add}>
                {copy.turno.paso2.agregar}
            </Button>
        </Stack>
    );
}

// ─── Paso 3 · Tarifa, contratación y requisitos ─────────────────────────────

/** ChipGroup de elección única: tocar otra opción la reemplaza; tocar la elegida no la quita. */
function single<T extends string>(current: T | null, next: readonly T[]): T | null {
    return next.find((v) => v !== current) ?? current;
}

export function TurnoStep3({ draft, errors, onPatch }: TurnoStepProps) {
    const e = errors?.fields;
    const p = copy.turno.paso3;
    const oficio = oficioOf(draft.oficio);
    const note = credencialNote(oficio);
    const contrataciones = contratacionesFor(draft.esporadico);
    return (
        <Stack gap={6}>
            <Stack gap={4}>
                <h2 className="h3 publish-flush">{p.tarifa}</h2>
                <SegmentedControl<'liquido' | 'bruto'>
                    aria-label={p.tipoMonto}
                    options={[
                        { value: 'liquido', label: p.liquido },
                        { value: 'bruto', label: p.bruto },
                    ]}
                    value={draft.neto ? 'liquido' : 'bruto'}
                    onChange={(v) => onPatch({ neto: v === 'liquido' })}
                />
                <MoneyField
                    id={fieldId('tarifa')}
                    label={draft.neto ? p.tarifaLiquida : p.tarifaBruta}
                    value={draft.tarifa}
                    onChange={(tarifa) => onPatch({ tarifa })}
                    unit={draft.unidad}
                    units={TURNO_UNITS}
                    onUnitChange={(unidad) => onPatch({ unidad })}
                    help={amountPreview(draft.tarifa, draft.unidad, draft.neto)}
                    error={e?.tarifa}
                />
            </Stack>
            <Stack gap={4}>
                <h2 className="h3 publish-flush">{p.contratacion}</h2>
                <Switch
                    label={p.esporadico}
                    description={p.esporadicoDesc}
                    checked={draft.esporadico}
                    onChange={(ev) => {
                        const esporadico = ev.target.checked;
                        // Un turno que se repite no se paga con boleta: si la había elegido, se elige de nuevo.
                        onPatch({ esporadico, contratacion: !esporadico && isBoleta(draft.contratacion) ? null : draft.contratacion });
                    }}
                />
                <ChipGroup<Contratacion>
                    id={fieldId('contratacion')}
                    label={p.forma}
                    options={contrataciones}
                    value={draft.contratacion ? [draft.contratacion] : []}
                    onChange={(next) => onPatch({ contratacion: single(draft.contratacion, next) })}
                    error={e?.contratacion}
                />
                {isBoleta(draft.contratacion) && <Banner tone="warning">{p.boleta}</Banner>}
            </Stack>
            <Stack gap={4}>
                <h2 className="h3 publish-flush">{p.loQueVeran}</h2>
                <ChipGroup
                    label={p.vestimenta}
                    options={VESTIMENTAS}
                    value={draft.vestimenta}
                    onChange={(vestimenta) => onPatch({ vestimenta })}
                />
                <TextField
                    id={fieldId('puntoEncuentro')}
                    label={p.punto}
                    value={draft.puntoEncuentro}
                    autoComplete="off"
                    onChange={(ev) => onPatch({ puntoEncuentro: ev.target.value })}
                    help={p.puntoAyuda}
                    error={e?.puntoEncuentro}
                />
                <TextField
                    id={fieldId('direccion')}
                    label={p.direccion}
                    value={draft.direccion}
                    autoComplete="street-address"
                    onChange={(ev) => onPatch({ direccion: ev.target.value })}
                    help={p.direccionAyuda}
                    error={e?.direccion}
                />
            </Stack>
            <Stack gap={4}>
                <h2 className="h3 publish-flush">{p.requisitos}</h2>
                {note && (
                    <Note icon={IconInfo} size="body">
                        {note}
                    </Note>
                )}
                <Switch
                    label={p.identidad}
                    description={p.identidadDesc}
                    checked={draft.pideIdentidad}
                    onChange={(ev) => onPatch({ pideIdentidad: ev.target.checked })}
                />
                <UrlSelect
                    sheet="nota"
                    label={p.nota}
                    placeholder={p.notaPlaceholder}
                    options={NOTAS_MINIMAS}
                    searchable={false}
                    value={draft.notaMinima}
                    onChange={(notaMinima) => onPatch({ notaMinima })}
                />
                <TextArea
                    label={p.notaPostulantes}
                    optional
                    rows={3}
                    maxLength={300}
                    placeholder={p.notaPostulantesEj}
                    value={draft.notaPostulantes}
                    onChange={(ev) => onPatch({ notaPostulantes: ev.target.value })}
                />
            </Stack>
        </Stack>
    );
}

// ─── Paso 4 · Vista previa ──────────────────────────────────────────────────

export function TurnoStep4({ actor, draft }: { actor: DemoActor; draft: TurnoDraft }) {
    const p = copy.turno.paso4;
    const verification = previewVerification(actor);
    const total = totalCupos(draft);
    return (
        <Stack gap={6}>
            <Stack gap={2}>
                <p className="overline publish-flush publish-muted">{p.asiLaVeran}</p>
                {/* Vista previa: se mira, no se toca (el detalle y «Tomar turno» existen al publicar). El lector la oye en una línea. */}
                <p className="tl-vh">
                    {[
                        draft.titulo.trim(),
                        previewAuthor(actor).name,
                        ...shiftTags(draft).map((t) => t.label),
                        formatAmount({ value: draft.tarifa, unit: draft.unidad, net: draft.neto, negotiableLabel: 'A convenir' }),
                        cuposLabel({ left: total, total }),
                        actor.comuna,
                    ].join(' · ')}
                </p>
                <div inert>
                    <PublicationCard
                        author={previewAuthor(actor)}
                        verifications={verification ? [{ ...verification, onClick: () => undefined }] : undefined}
                        title={draft.titulo.trim()}
                        href="#"
                        tags={shiftTags(draft)}
                        amount={{ value: draft.tarifa, unit: draft.unidad, net: draft.neto, negotiableLabel: 'A convenir' }}
                        cupos={{ left: total, total }}
                        place={actor.comuna}
                        cta={{ label: p.tomarTurno, end: true, onClick: () => undefined }}
                    />
                </div>
            </Stack>
            <SectionCard title={p.resumen} titleAs="h2">
                <SummaryRow icon={IconCalendar} label={p.bloques}>
                    {shiftLines(draft).map((line, i) => (
                        <span key={line}>
                            {i > 0 && <br />}
                            {line}
                        </span>
                    ))}
                </SummaryRow>
                <SummaryRow icon={IconDocument} label={p.forma}>
                    {contratacionText(draft.contratacion)}
                </SummaryRow>
                {draft.vestimenta.length > 0 && (
                    <SummaryRow icon={IconPerson} label={p.vestimenta}>
                        {vestimentaText(draft.vestimenta)}
                    </SummaryRow>
                )}
                <SummaryRow icon={IconLocation} label={p.punto}>
                    {draft.puntoEncuentro.trim()}
                </SummaryRow>
                <SummaryRow icon={IconShield} label={p.requisitos}>
                    {requisitosText(draft)}
                </SummaryRow>
            </SectionCard>
        </Stack>
    );
}
