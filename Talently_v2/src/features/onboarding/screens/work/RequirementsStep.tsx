// ONB-T4 · Requisitos de tu oficio (/onboarding/trabajo/4). Solo si algún
// oficio los pide (en la demostración, los de seguridad): los campos del
// oficio (DynamicFields) y la credencial SPD con «Subir ahora» o «Después».
// La decisión es obligatoria; la subida no («Continuar» la deja para después).
import { useRef, useState } from 'react';
import { useSheet } from '../../../../app/sheets';
import { DynamicFields, type DynamicField, type DynamicValues } from '../../../../ui/DynamicFields';
import { IconJobSecurity } from '../../../../ui/icons';
import { StepLayout } from '../../../../ui/StepLayout';
import { DIA_NOCHE, SISTEMAS_TURNO } from '../../catalog';
import { COPY } from '../../copy';
import { CREDENTIAL_SHEET, CredentialCard, CredentialSheet } from '../../components/Credential';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import { useFocusRescue } from '../../components/useFocusRescue';
import { oficioConRequisitos } from '../../model';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T4';

const C = COPY.trabajo.requisitos;

const FIELDS: readonly DynamicField[] = [
    { key: 'sistema', kind: 'chips', label: C.sistema, options: SISTEMAS_TURNO },
    { key: 'dia_noche', kind: 'chips', label: C.diaNoche, options: DIA_NOCHE, multiple: true },
    { key: 'credencial', kind: 'slot', label: C.credencial },
];

export function RequirementsStep() {
    const { draft, layout, next } = useWorkStep(4);
    const { trabajo } = draft;
    const credentialSheet = useSheet(CREDENTIAL_SHEET);
    const oficio = oficioConRequisitos(trabajo);
    const [intentado, setIntentado] = useState(false);
    const slotRef = useRef<HTMLDivElement>(null);
    // Al subir, cancelar o quitar, el botón tocado desaparece: el foco vuelve a la credencial.
    useFocusRescue(slotRef, [trabajo.credencial.estado, credentialSheet.open]);

    const errores = {
        sistema: trabajo.sistema ? undefined : C.errSistema,
        dia_noche: trabajo.diaNoche.length > 0 ? undefined : C.errDiaNoche,
    };

    const value: DynamicValues = { sistema: trabajo.sistema, dia_noche: trabajo.diaNoche };

    const continuar = () => {
        setIntentado(true);
        if (errores.sistema || errores.dia_noche) {
            // El primer grupo sin elegir: sistema de turno (el 1.º) o día y noche (el 2.º).
            const grupos = document.querySelectorAll<HTMLElement>('.tl-dyn .tl-chipgroup');
            grupos[errores.sistema ? 0 : 1]?.querySelector<HTMLElement>('button:not([tabindex="-1"])')?.focus();
            return;
        }
        next();
    };

    return (
        <>
            <StepLayout title={C.titulo} subtitle={C.subSeguridad} {...layout} onContinue={continuar}>
                <DynamicFields
                    title={C.para(oficio?.name ?? '')}
                    icon={IconJobSecurity}
                    fields={FIELDS}
                    value={value}
                    errors={intentado ? errores : undefined}
                    onChange={(next) => {
                        const sistema = next.sistema;
                        const diaNoche = next.dia_noche;
                        setTrabajo({
                            sistema: typeof sistema === 'string' ? sistema : null,
                            diaNoche: Array.isArray(diaNoche) ? [...diaNoche] : [],
                        });
                    }}
                    slots={{
                        credencial: (
                            <div ref={slotRef} tabIndex={-1} className="onb-slot">
                                <CredentialCard credencial={trabajo.credencial} onUpload={() => credentialSheet.show()} />
                            </div>
                        ),
                    }}
                />
            </StepLayout>
            <CredentialSheet />
            <OnboardingMenu />
        </>
    );
}
