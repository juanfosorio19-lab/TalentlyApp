// PRF-03 · Editar idiomas (`?sheet=editar&s=idiomas`). No está en el
// prototipo: PRF-01 muestra los idiomas («Español · Nativo», «Inglés ·
// Básico») y, sin idiomas, «Agregar idioma». Aquí se elige el nivel de cada
// uno (el mismo Select de antes), se quita uno con el basurero y se agrega
// otro de la lista. Guardar sin idiomas deja la sección vacía otra vez.
import { useEffect, useRef } from 'react';
import { IconButton } from '../../../ui/IconButton';
import { IconTrash } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { Select } from '../../../ui/Select';
import type { DemoRow } from '../../demo/types';
import { COPY } from '../copy';
import { IDIOMAS, NIVELES_IDIOMA } from '../mock';

const options = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

/** Los niveles, con el actual incluido si los datos traen uno que no está en la lista. */
const levels = (current: string | undefined) =>
    options(current && !NIVELES_IDIOMA.includes(current) ? [...NIVELES_IDIOMA, current] : NIVELES_IDIOMA);

export interface LanguageFieldsProps {
    /** Los idiomas del borrador: `label` es el idioma y `value`, su nivel ('' mientras no lo elige). */
    filas: readonly DemoRow[];
    /** Ya intentó guardar: un idioma sin nivel muestra su error. */
    tried: boolean;
    onChange: (next: DemoRow[]) => void;
}

export function LanguageFields({ filas, tried, onChange }: LanguageFieldsProps) {
    // Quitar un idioma se lleva el basurero que tenía el foco: pasa a «Agregar…», que siempre está.
    const addRef = useRef<HTMLButtonElement>(null);
    const removed = useRef(false);
    useEffect(() => {
        if (!removed.current) return;
        removed.current = false;
        addRef.current?.focus();
    });

    const rest = IDIOMAS.filter((idioma) => !filas.some((r) => r.label === idioma));
    const setLevel = (i: number, value: string) => onChange(filas.map((r, j) => (j === i ? { ...r, value } : r)));
    const remove = (i: number) => {
        removed.current = true;
        onChange(filas.filter((_, j) => j !== i));
    };

    return (
        <Stack gap={6}>
            {filas.map((row, i) => (
                // El basurero a la altura del campo (no de su rótulo), como el nivel que acompaña.
                <Stack key={row.label} row gap={2} align="end">
                    <Select
                        className="prf-grow"
                        label={row.label}
                        placeholder={COPY.editar.nivel}
                        options={levels(row.value)}
                        value={row.value || null}
                        error={tried && !row.value ? COPY.editar.nivel : undefined}
                        onChange={(v) => setLevel(i, v)}
                    />
                    <IconButton icon={IconTrash} label={COPY.idiomas.quitar(row.label)} onClick={() => remove(i)} />
                </Stack>
            ))}
            {rest.length > 0 && (
                <Select
                    ref={addRef}
                    label={filas.length > 0 ? COPY.idiomas.agregarOtro : COPY.idiomas.agregar}
                    placeholder={COPY.idiomas.elegir}
                    options={options(rest)}
                    value={null}
                    // Elegir un idioma lo agrega arriba, sin nivel todavía.
                    onChange={(idioma) => onChange([...filas, { label: idioma, value: '' }])}
                />
            )}
        </Stack>
    );
}
