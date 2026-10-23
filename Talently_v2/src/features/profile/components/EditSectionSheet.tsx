// PRF-03 · Editar sección: la BottomSheet genérica del lápiz, con los mismos
// controles del onboarding (ONB-T2 y PUBL-04): chips de jornada, «Disponible
// desde», distancia, la grilla de franjas, montos, experiencia y comuna; los
// idiomas, con su nivel, para agregar y quitar (LanguageFields).
// Guardar cambia el perfil de esta sesión y avisa con un Snackbar; cerrar con
// cambios pregunta «¿Descartar cambios?». Vive en la URL
// (`?sheet=editar&s=<sección>`): cada vez que se abre parte de lo guardado,
// también si la última vez se cerró con el atrás del navegador.
import { useState } from 'react';
import { AvailabilityGrid } from '../../../ui/AvailabilityGrid';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { ChipGroup } from '../../../ui/ChipGroup';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { RadioGroup } from '../../../ui/Radio';
import { Select } from '../../../ui/Select';
import { TextArea } from '../../../ui/TextArea';
import { TextField } from '../../../ui/TextField';
import { COMUNAS_RM } from '../../demo/catalog';
import type { DemoRow } from '../../demo/types';
import { formatShiftDays, parseShiftDays } from '../availability';
import { COPY } from '../copy';
import type { EditableSection } from '../model';
import {
    CONTEXTO_HOGAR,
    DISPONIBLE_DESDE,
    DISTANCIAS,
    HOGAR_NECESIDADES,
    JORNADAS,
    TAMANOS_ORGANIZACION,
    TODA_LA_REGION,
} from '../mock';
import { ChipChoice } from './ChipChoice';
import { DiscardDialog } from './DiscardDialog';
import { LanguageFields } from './LanguageFields';

const EXPERIENCIA = ['Menos de 1 año', '1 a 3 años', '3 a 5 años', '5 a 10 años', 'Más de 10 años'] as const;
const DE_EXPERIENCIA = ' de experiencia';
const SEP = ' · ';
const ASI_LO_VEN = 'Así lo ven en tus avisos';
const FAMILIA_EN = 'Familia en ';
const DATOS_ORGANIZACION = 'Datos de la organización';
const IDIOMAS = 'Idiomas';

/** Errores humanos (sin código). no está en el prototipo. */
const ERRORS = {
    texto: 'Escribe al menos una frase',
    valor: 'Completa este dato',
    monto: 'Ingresa un monto',
    opciones: 'Elige al menos una opción',
    franjas: 'Elige al menos una franja',
};

/** Cómo se edita cada dato: el control del onboarding que le corresponde. */
type FieldKind = 'chips' | 'radio' | 'distancia' | 'franjas' | 'comuna' | 'select' | 'experiencia' | 'monto' | 'texto' | 'fijo';

/** Opciones de los datos de elección (las del onboarding). */
const CHOICES: Record<string, readonly string[]> = {
    Jornada: JORNADAS,
    'Disponible desde': DISPONIBLE_DESDE,
    'Contexto del hogar': CONTEXTO_HOGAR,
    Tamaño: TAMANOS_ORGANIZACION,
};

function kindOf(row: DemoRow, sectionTitle: string): FieldKind {
    if (row.monto) return 'monto';
    if (row.value === undefined) return 'fijo';
    if (sectionTitle === IDIOMAS) return 'select';
    switch (row.label) {
        case 'Jornada':
        case 'Contexto del hogar':
            return 'chips';
        case 'Disponible desde':
            return 'radio';
        case 'Hasta dónde te mueves':
            return 'distancia';
        case 'Turnos por día':
            return 'franjas';
        case 'Comuna':
            // La de la organización sale en «Así te ven», SHT-ACTOR (también el de Inicio) y sus avisos:
            // mientras eso no lea el perfil de la sesión (pedido en «requests»), no se ofrece cambiarla.
            return sectionTitle === DATOS_ORGANIZACION ? 'fijo' : 'comuna';
        case 'Tamaño':
            return 'select';
        // Se arma solo con la comuna; quien administra la organización no se cambia aquí.
        case ASI_LO_VEN:
        case 'La administra':
            return 'fijo';
    }
    return row.value.endsWith(DE_EXPERIENCIA) ? 'experiencia' : 'texto';
}

/** Las opciones con el valor actual incluido (por si el perfil trae uno que no está en la lista). */
const withCurrent = (list: readonly string[], current: readonly string[]) =>
    [...new Set([...list, ...current.filter(Boolean)])].map((v) => ({ value: v, label: v }));

const splitValues = (value: string | undefined) => (value ? value.split(SEP).map((v) => v.trim()).filter(Boolean) : []);

/** «20 km desde Puente Alto» → «20 km» y «Puente Alto». */
function parseDistance(value: string, fallbackComuna: string): { distancia: string | null; comuna: string } {
    if (value === TODA_LA_REGION) return { distancia: TODA_LA_REGION, comuna: fallbackComuna };
    const m = /^(.+?) desde (.+)$/u.exec(value);
    return m?.[1] && m[2] ? { distancia: m[1], comuna: m[2] } : { distancia: null, comuna: fallbackComuna };
}

function rowError(row: DemoRow, kind: FieldKind): string | undefined {
    if (kind === 'monto') return row.monto && row.monto.value > 0 ? undefined : ERRORS.monto;
    if (kind === 'fijo') return undefined;
    const empty = !row.value?.trim();
    if (!empty) return undefined;
    if (kind === 'chips') return ERRORS.opciones;
    if (kind === 'franjas') return ERRORS.franjas;
    return ERRORS.valor;
}

function isValid(s: EditableSection): boolean {
    if (s.tipo === 'texto') return s.texto.trim().length > 0;
    if (s.tipo === 'tags') return s.tags.length > 0;
    return s.filas.every((r) => !rowError(r, kindOf(r, s.titulo)));
}

interface RowFieldProps {
    row: DemoRow;
    kind: FieldKind;
    error?: string;
    /** Comuna del actor: la de «Desde …» si el perfil no la dice. */
    comuna: string;
    /** «En tus avisos se ve como …», bajo la comuna del hogar. */
    help?: string;
    onChange: (next: DemoRow) => void;
}

function RowField({ row, kind, error, comuna, help, onChange }: RowFieldProps) {
    const value = row.value ?? '';
    const set = (v: string) => onChange({ ...row, value: v });
    switch (kind) {
        case 'monto': {
            const monto = row.monto;
            if (!monto) return null;
            return (
                <MoneyField
                    label={row.label}
                    value={monto.value || null}
                    unit={monto.unit}
                    units={[monto.unit]}
                    error={error}
                    onChange={(v) => onChange({ ...row, monto: { ...monto, value: v ?? 0 } })}
                    onUnitChange={() => {}}
                />
            );
        }
        case 'chips': {
            const chosen = splitValues(value);
            return (
                <ChipGroup
                    label={row.label}
                    options={withCurrent(CHOICES[row.label] ?? [], chosen)}
                    value={chosen}
                    error={error}
                    onChange={(next) => set(next.join(SEP))}
                />
            );
        }
        case 'radio':
            return (
                <RadioGroup
                    legend={row.label}
                    options={withCurrent(CHOICES[row.label] ?? [], [value])}
                    value={value || null}
                    error={error}
                    onChange={set}
                />
            );
        case 'distancia': {
            const parsed = parseDistance(value, comuna);
            return (
                <ChipChoice
                    label={row.label}
                    options={withCurrent(DISTANCIAS, parsed.distancia ? [parsed.distancia] : [])}
                    value={parsed.distancia}
                    note={COPY.editar.desde(parsed.comuna)}
                    onChange={(d) => set(d === TODA_LA_REGION ? TODA_LA_REGION : `${d} desde ${parsed.comuna}`)}
                />
            );
        }
        case 'franjas':
            return (
                <AvailabilityGrid
                    label={row.label}
                    value={parseShiftDays(value)}
                    error={error}
                    onChange={(cells) => set(formatShiftDays(cells))}
                />
            );
        case 'comuna':
            return (
                <Select
                    label={row.label}
                    placeholder={COPY.editar.comuna}
                    searchable
                    searchPlaceholder={COPY.editar.buscarComuna}
                    options={withCurrent(COMUNAS_RM, [value])}
                    value={value || null}
                    help={help}
                    error={error}
                    onChange={set}
                />
            );
        case 'select':
            // El tamaño de la organización (el nivel de cada idioma lo eligen LanguageFields).
            return (
                <Select
                    label={row.label}
                    placeholder={COPY.editar.tamano}
                    options={withCurrent(TAMANOS_ORGANIZACION, [value])}
                    value={value || null}
                    error={error}
                    onChange={set}
                />
            );
        case 'experiencia': {
            const current = value.slice(0, -DE_EXPERIENCIA.length);
            return (
                <Select
                    label={row.label}
                    placeholder={COPY.editar.experiencia}
                    options={EXPERIENCIA.map((x) => ({ value: x, label: x }))}
                    value={(EXPERIENCIA as readonly string[]).includes(current) ? current : null}
                    onChange={(next) => set(`${next}${DE_EXPERIENCIA}`)}
                />
            );
        }
        case 'texto':
            return <TextField label={row.label} value={value} error={error} onChange={(e) => set(e.target.value)} />;
        case 'fijo':
            return null;
    }
}

export interface EditSectionSheetProps {
    open: boolean;
    section: EditableSection;
    /** Comuna del actor (la de «Desde …» bajo las distancias). */
    comuna: string;
    onClose: () => void;
    onSave: (next: EditableSection) => void;
}

export function EditSectionSheet({ open, section, comuna, onClose, onSave }: EditSectionSheetProps) {
    const [draft, setDraft] = useState<EditableSection>(section);
    const [tried, setTried] = useState(false);
    const [confirm, setConfirm] = useState(false);
    // Al abrir, parte de lo guardado (estado derivado durante el render, como SheetPicker).
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setDraft(section);
            setTried(false);
            setConfirm(false);
        }
    }
    const dirty = JSON.stringify(draft) !== JSON.stringify(section);
    const addingLanguages = section.tipo === 'filas' && section.titulo === IDIOMAS && section.filas.length === 0;

    const save = () => {
        if (!isValid(draft)) {
            setTried(true);
            return;
        }
        onSave(draft);
    };

    // Velo, X, asa, Escape y atrás de Android: con cambios, pregunta antes.
    const requestClose = () => (dirty ? setConfirm(true) : onClose());

    const setRow = (i: number, next: DemoRow) => {
        if (draft.tipo !== 'filas') return;
        const filas = draft.filas.map((r, j) => (j === i ? next : r));
        // La comuna del hogar cambia también cómo lo ven en sus avisos («Familia en …»).
        if (next.label === 'Comuna' && next.value) {
            const k = filas.findIndex((r) => r.label === ASI_LO_VEN && r.value?.startsWith(FAMILIA_EN));
            const asi = filas[k];
            if (asi) filas[k] = { ...asi, value: `${FAMILIA_EN}${next.value}` };
        }
        setDraft({ ...draft, filas });
    };

    let body;
    if (draft.tipo === 'texto') {
        body = (
            <TextArea
                label={draft.titulo}
                maxLength={500}
                value={draft.texto}
                error={tried && !draft.texto.trim() ? ERRORS.texto : undefined}
                onChange={(e) => setDraft({ ...draft, texto: e.target.value })}
            />
        );
    } else if (draft.tipo === 'tags') {
        const chosen = draft.tags.map((t) => t.text);
        body = (
            <ChipGroup
                label={draft.titulo}
                options={withCurrent(HOGAR_NECESIDADES, chosen)}
                value={chosen}
                error={tried && draft.tags.length === 0 ? ERRORS.opciones : undefined}
                onChange={(next) => setDraft({ ...draft, tags: next.map((text) => ({ text })) })}
            />
        );
    } else if (draft.titulo === IDIOMAS) {
        // Agregar, quitar y el nivel de cada idioma (sin idiomas, la sección vuelve a verse vacía).
        body = <LanguageFields filas={draft.filas} tried={tried} onChange={(filas) => setDraft({ ...draft, filas })} />;
    } else {
        const asiLoVen = draft.filas.find((r) => r.label === ASI_LO_VEN)?.value;
        body = (
            <Stack gap={6}>
                {draft.filas.map((row, i) => {
                    const kind = kindOf(row, draft.titulo);
                    if (kind === 'fijo') return null;
                    return (
                        <RowField
                            key={row.label}
                            row={row}
                            kind={kind}
                            comuna={comuna}
                            help={kind === 'comuna' && asiLoVen ? COPY.editar.asiLoVen(asiLoVen) : undefined}
                            error={tried ? rowError(row, kind) : undefined}
                            onChange={(next) => setRow(i, next)}
                        />
                    );
                })}
            </Stack>
        );
    }

    return (
        <>
            <BottomSheet
                open={open}
                onClose={requestClose}
                // «Agregar idioma» abre la hoja de Idiomas vacía: se titula como la acción que la abrió.
                title={addingLanguages ? COPY.idiomas.agregar : COPY.editar.titulo(section.titulo)}
                footer={
                    <>
                        <Button variant="ghost" onClick={onClose}>
                            {COPY.editar.cancelar}
                        </Button>
                        <Button disabled={!dirty} onClick={save}>
                            {COPY.editar.guardar}
                        </Button>
                    </>
                }
            >
                {body}
            </BottomSheet>
            <DiscardDialog
                open={open && confirm}
                onKeep={() => setConfirm(false)}
                onDiscard={() => {
                    setConfirm(false);
                    onClose();
                }}
            />
        </>
    );
}
