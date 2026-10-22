// PUBL-01 «¿Qué quieres publicar?» desde Actividad (spec §5.3 regla 9:
// Publicar está en Inicio y en Actividad). Es la hoja `?sheet=publicar` de la
// pestaña: se abre encima de ACT-03 y atrás la cierra. La organización elige
// Empleo o Turno; el hogar, Aviso para mi hogar o Turno para un evento.
// «Continuar» abre el asistente (PUBL-02/PUBL-03, /publicar/:tipo/1) en lugar
// de la hoja. Textos de PUBL-01.dc.html y PUBL-01-carolina.dc.html. La hoja
// de Inicio es la misma: pedido en requests que pase a src/ui o demo/ para
// que ambas pestañas usen una sola.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconClock, IconOffers, type IconComponent } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { OptionGroup, type OptionGroupOption } from '../../../ui/OptionCard';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { copy } from '../copy';
import '../activity.css';

export const sheetId = 'PUBL-01';

export type PublishKind = 'empleo' | 'turno' | 'hogar' | 'evento';
type WizardType = Parameters<typeof paths.publicar>[0];

const option = (value: PublishKind, icon: IconComponent): OptionGroupOption<PublishKind> => ({
    value,
    icon,
    ...copy.publishSheet.options[value],
});

const OPTIONS = {
    organizacion: [option('empleo', IconOffers), option('turno', IconClock)],
    hogar: [option('hogar', IconOffers), option('evento', IconClock)],
} as const;

/** La del prototipo (PUBL-01: Turno; PUBL-01-carolina: Aviso para mi hogar). */
const DEFAULT: Record<keyof typeof OPTIONS, PublishKind> = { organizacion: 'turno', hogar: 'hogar' };

/** Asistente de cada opción: el turno para un evento es un turno publicado por el hogar. */
const WIZARD: Record<PublishKind, WizardType> = { empleo: 'empleo', turno: 'turno', hogar: 'hogar', evento: 'turno' };

export interface PublishSheetProps {
    /** Organización (Empleo · Turno) u hogar (Aviso para mi hogar · Turno para un evento). */
    as: keyof typeof OPTIONS;
    /** «Banquetería Rosa SpA», «Familia en Ñuñoa». */
    publisher: string;
}

/** Abre la hoja (push de `?sheet=publicar`). */
export function usePublishSheet() {
    return useSheet('publicar');
}

export function PublishSheet({ as, publisher }: PublishSheetProps) {
    const sheet = useSheet('publicar');
    const { open } = useOpenPath();
    const location = useLocation();
    // Cada apertura parte de la opción del prototipo: la elección se reinicia al ABRIR (otra
    // entrada del historial), no al cerrar, así cerrar con el atrás del navegador no deja nada viejo.
    const [choice, setChoice] = useState<{ openedAt: string | null; value: PublishKind }>({
        openedAt: null,
        value: DEFAULT[as],
    });
    if (sheet.open && choice.openedAt !== location.key) setChoice({ openedAt: location.key, value: DEFAULT[as] });
    const value = OPTIONS[as].some((o) => o.value === choice.value) ? choice.value : DEFAULT[as];

    // El asistente reemplaza la entrada de la hoja: atrás desde él vuelve a ACT-03, no a la hoja.
    const next = () => open(paths.publicar(WIZARD[value]), { replace: true });

    return (
        <BottomSheet
            open={sheet.open}
            onClose={sheet.hide}
            title={copy.publishSheet.title}
            footer={
                <Button size="lg" block onClick={next}>
                    {copy.publishSheet.continue}
                </Button>
            }
        >
            <Stack gap={4}>
                <p className="body act-muted">{copy.publishSheet.publishingAs(publisher)}</p>
                <OptionGroup<PublishKind>
                    mode="single"
                    legend={copy.publishSheet.legend}
                    legendHidden
                    options={OPTIONS[as]}
                    value={value}
                    onChange={(v) => setChoice((c) => ({ ...c, value: v }))}
                />
            </Stack>
        </BottomSheet>
    );
}
