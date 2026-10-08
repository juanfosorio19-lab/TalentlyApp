// PRF-03 · Editar sección: la BottomSheet genérica del lápiz, con los mismos
// controles del onboarding (texto, rangos de experiencia, montos, chips).
// Guardar cambia el perfil de esta sesión y avisa con un Snackbar.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { ChipGroup } from '../../../ui/ChipGroup';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { Select } from '../../../ui/Select';
import { TextArea } from '../../../ui/TextArea';
import { TextField } from '../../../ui/TextField';
import type { DemoProfileSection, DemoRow } from '../../demo/types';
import { COPY } from '../copy';
import { HOGAR_NECESIDADES } from '../mock';

export type EditableSection = Extract<DemoProfileSection, { tipo: 'texto' | 'filas' | 'tags' }>;

const EXPERIENCIA = ['Menos de 1 año', '1 a 3 años', '3 a 5 años', '5 a 10 años', 'Más de 10 años'] as const;
const DE_EXPERIENCIA = ' de experiencia';

/** Errores humanos (sin código). no está en el prototipo. */
const ERRORS = {
    texto: 'Escribe al menos una frase',
    valor: 'Completa este dato',
    monto: 'Ingresa un monto',
    tags: 'Elige al menos una opción',
};

function rowError(row: DemoRow): string | undefined {
    if (row.monto) return row.monto.value > 0 ? undefined : ERRORS.monto;
    if (row.value !== undefined) return row.value.trim() ? undefined : ERRORS.valor;
    return undefined;
}

function isValid(s: EditableSection): boolean {
    if (s.tipo === 'texto') return s.texto.trim().length > 0;
    if (s.tipo === 'tags') return s.tags.length > 0;
    return s.filas.every((r) => !rowError(r));
}

export interface EditSectionSheetProps {
    open: boolean;
    section: EditableSection;
    onClose: () => void;
    onSave: (next: EditableSection) => void;
}

export function EditSectionSheet({ open, section, onClose, onSave }: EditSectionSheetProps) {
    const [draft, setDraft] = useState<EditableSection>(section);
    const [tried, setTried] = useState(false);
    const dirty = JSON.stringify(draft) !== JSON.stringify(section);

    const save = () => {
        if (!isValid(draft)) {
            setTried(true);
            return;
        }
        onSave(draft);
    };

    const setRow = (i: number, next: DemoRow) => {
        if (draft.tipo !== 'filas') return;
        setDraft({ ...draft, filas: draft.filas.map((r, j) => (j === i ? next : r)) });
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
        const options = [...new Set([...HOGAR_NECESIDADES, ...draft.tags.map((t) => t.text)])].map((t) => ({ value: t, label: t }));
        body = (
            <ChipGroup
                label={draft.titulo}
                options={options}
                value={draft.tags.map((t) => t.text)}
                error={tried && draft.tags.length === 0 ? ERRORS.tags : undefined}
                onChange={(next) => setDraft({ ...draft, tags: next.map((text) => ({ text })) })}
            />
        );
    } else {
        body = (
            <Stack gap={4}>
                {draft.filas.map((row, i) => {
                    const error = tried ? rowError(row) : undefined;
                    if (row.monto) {
                        const monto = row.monto;
                        return (
                            <MoneyField
                                key={row.label}
                                label={row.label}
                                value={monto.value || null}
                                unit={monto.unit}
                                units={[monto.unit]}
                                error={error}
                                onChange={(v) => setRow(i, { ...row, monto: { ...monto, value: v ?? 0 } })}
                                onUnitChange={() => {}}
                            />
                        );
                    }
                    if (row.value === undefined) return null;
                    if (row.value.endsWith(DE_EXPERIENCIA)) {
                        const current = row.value.slice(0, -DE_EXPERIENCIA.length);
                        return (
                            <Select
                                key={row.label}
                                label={row.label}
                                placeholder="Elige tu experiencia"
                                options={EXPERIENCIA.map((x) => ({ value: x, label: x }))}
                                value={(EXPERIENCIA as readonly string[]).includes(current) ? current : null}
                                onChange={(next) => setRow(i, { ...row, value: `${next}${DE_EXPERIENCIA}` })}
                            />
                        );
                    }
                    return (
                        <TextField
                            key={row.label}
                            label={row.label}
                            value={row.value}
                            error={error}
                            onChange={(e) => setRow(i, { ...row, value: e.target.value })}
                        />
                    );
                })}
            </Stack>
        );
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={COPY.editar.titulo(section.titulo)}
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
    );
}
