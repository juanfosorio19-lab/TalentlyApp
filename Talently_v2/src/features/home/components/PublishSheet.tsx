// PUBL-01 «¿Qué quieres publicar?» (spec §5.4, `?sheet=publicar`). La
// organización elige Empleo o Turno; el hogar, Aviso para mi hogar o Turno
// para un evento. Los asistentes (PUBL-02, PUBL-03, PUBL-04) aún no tienen
// ruta: «Continuar» lo dice con un Snackbar sobre el pie, nunca en silencio.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconClock, IconOffers, type IconComponent } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { OptionGroup } from '../../../ui/OptionCard';
import { useSnackbar } from '../../../ui/Snackbar';
import { copy } from '../copy';

export const sheetId = 'PUBL-01';

export type PublishKind = 'empleo' | 'turno' | 'hogar' | 'evento';

interface PublishOption {
    value: PublishKind;
    icon: IconComponent;
    title: string;
    example: string;
}

const ORG_OPTIONS: PublishOption[] = [
    { value: 'empleo', icon: IconOffers, title: 'Empleo', example: 'Contrato estable, con sueldo mensual' },
    { value: 'turno', icon: IconClock, title: 'Turno', example: 'Por día o por evento, con tarifa por turno' },
];

const HOGAR_OPTIONS: PublishOption[] = [
    {
        value: 'hogar',
        icon: IconOffers,
        title: 'Aviso para mi hogar',
        example: 'Asesor/a del hogar, cuidador/a infantil o de adulto mayor',
    },
    { value: 'evento', icon: IconClock, title: 'Turno para un evento', example: 'Garzón o banquetero/a para un evento en tu casa' },
];

export interface PublishSheetProps {
    open: boolean;
    onClose: () => void;
    /** Organización (Empleo · Turno) u hogar (Aviso para mi hogar · Turno para un evento). */
    as: 'organizacion' | 'hogar';
    /** «Banquetería Rosa SpA», «Familia en Ñuñoa». */
    publisher: string;
    /** Opción marcada al abrir (desde «¿Qué necesitas?»). Por defecto, la del prototipo. */
    initial?: PublishKind;
}

/** El cuerpo se monta en cada apertura: la elección parte de `initial` cada vez. */
function PublishOptions({ as, publisher, initial }: Omit<PublishSheetProps, 'open' | 'onClose'>) {
    const options = as === 'organizacion' ? ORG_OPTIONS : HOGAR_OPTIONS;
    const [value, setValue] = useState<PublishKind>(initial ?? (as === 'organizacion' ? 'turno' : 'hogar'));
    return (
        <Stack gap={4}>
            <span className="tl-listitem__sub">{copy.publicar.publicasComo(publisher)}</span>
            <OptionGroup<PublishKind>
                mode="single"
                legend={copy.publicar.leyenda}
                legendHidden
                options={options}
                value={value}
                onChange={setValue}
            />
        </Stack>
    );
}

export function PublishSheet({ open, onClose, as, publisher, initial }: PublishSheetProps) {
    const snackbar = useSnackbar();
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.publicar.titulo}
            footer={
                <Button size="lg" block onClick={() => snackbar.show({ message: copy.soon })}>
                    {copy.publicar.continuar}
                </Button>
            }
        >
            <PublishOptions as={as} publisher={publisher} initial={initial} />
        </BottomSheet>
    );
}
