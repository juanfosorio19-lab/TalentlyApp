// PUBL-08 · Tipo de publicación, paso final de PUBL-03 y PUBL-04 (spec §10.3):
// Clásica gratis o Premium. En F1 Premium lleva «Pronto»: tocarla no la elige
// y muestra el Snackbar «Te avisaremos cuando puedas destacar tus
// publicaciones»; se publica como Clásica.
import { Amount } from '../../../ui/Amount';
import { IconDocument, IconEye, IconInfo } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { OptionGroup, type OptionGroupOption } from '../../../ui/OptionCard';
import { PromotedBadge } from '../../../ui/PromotedBadge';
import { useSnackbar } from '../../../ui/Snackbar';
import { copy } from '../copy';
import type { WizardKind } from '../model/publisher';
import { Note } from './Parts';

export const screenId = 'PUBL-08';

type Plan = 'clasica' | 'premium';

function planOptions(kind: WizardKind): OptionGroupOption<Plan>[] {
    const turno = kind === 'turno';
    return [
        {
            value: 'clasica',
            icon: IconDocument,
            title: copy.plan.clasica,
            price: <Amount value={0} valueText={copy.plan.gratis} />,
            includes: [copy.plan.ordenNormal, turno ? copy.plan.duraTurno : copy.plan.duraAviso],
        },
        {
            value: 'premium',
            icon: IconEye,
            title: copy.plan.premium,
            soon: true,
            tag: <PromotedBadge />,
            // Un turno vence con su fecha: no se renueva.
            includes: [...copy.plan.premiumIncluye, ...(turno ? [] : [copy.plan.renovacion]), copy.plan.estadisticas],
        },
    ];
}

/** El contenido del paso 5 (el StepLayout lo pone el asistente, con «Publicar»). */
export function PlanStep({ kind }: { kind: WizardKind }) {
    const snackbar = useSnackbar();
    return (
        <Stack gap={6}>
            <OptionGroup<Plan>
                mode="single"
                variant="plan"
                legend={copy.plan.leyenda}
                legendHidden
                options={planOptions(kind)}
                // Antes de F3 solo existe la Clásica: siempre es la elegida.
                value="clasica"
                onChange={() => undefined}
                onSoonClick={() => snackbar.show({ message: copy.plan.pronto })}
            />
            <Note icon={IconInfo}>{copy.plan.nota}</Note>
        </Stack>
    );
}

export const planSubtitle = (kind: WizardKind): string => (kind === 'turno' ? copy.plan.subTurno : copy.plan.subAviso);
