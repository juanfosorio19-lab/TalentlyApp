// PUBL-01 «¿Qué quieres publicar?» (spec §5.4, `?sheet=publicar&tipo=`). La
// organización elige Empleo o Turno; el hogar, Aviso para mi hogar o Turno
// para un evento. La opción marcada vive en la URL (así sigue marcada al
// volver del asistente) y «Continuar» abre el asistente de esa opción
// (PUBL-02, PUBL-03 o PUBL-04) con useOpenPath.
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconClock, IconOffers, type IconComponent } from '../../../ui/icons';
import { OptionGroup } from '../../../ui/OptionCard';
import { copy } from '../copy';
import { publishKinds, type PublishKind, type Publisher } from '../selectors';

export const sheetId = 'PUBL-01';

const OPTION: Record<PublishKind, { icon: IconComponent; title: string; example: string }> = {
    empleo: { icon: IconOffers, title: 'Empleo', example: 'Contrato estable, con sueldo mensual' },
    turno: { icon: IconClock, title: 'Turno', example: 'Por día o por evento, con tarifa por turno' },
    hogar: {
        icon: IconOffers,
        title: 'Aviso para mi hogar',
        example: 'Asesor/a del hogar, cuidador/a infantil o de adulto mayor',
    },
    evento: { icon: IconClock, title: 'Turno para un evento', example: 'Garzón o banquetero/a para un evento en tu casa' },
};

export interface PublishSheetProps {
    open: boolean;
    onClose: () => void;
    /** Organización (Empleo · Turno) u hogar (Aviso para mi hogar · Turno para un evento). */
    as: Publisher;
    /** «Banquetería Rosa SpA», «Familia en Ñuñoa». */
    publisher: string;
    /** La opción marcada (siempre una de las de `as`). */
    value: PublishKind;
    onChange: (next: PublishKind) => void;
    /** Abre el asistente de la opción marcada. */
    onContinue: () => void;
}

export function PublishSheet({ open, onClose, as, publisher, value, onChange, onContinue }: PublishSheetProps) {
    const options = publishKinds(as).map((k) => ({ value: k, ...OPTION[k] }));
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.publicar.titulo}
            footer={
                <Button size="lg" block onClick={onContinue}>
                    {copy.publicar.continuar}
                </Button>
            }
        >
            <p className="body home-muted home-publisher">{copy.publicar.publicasComo(publisher)}</p>
            <OptionGroup<PublishKind>
                mode="single"
                legend={copy.publicar.leyenda}
                legendHidden
                options={options}
                value={value}
                onChange={onChange}
            />
        </BottomSheet>
    );
}
