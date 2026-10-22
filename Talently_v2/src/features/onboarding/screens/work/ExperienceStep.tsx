// ONB-T5 · Experiencia y CV (/onboarding/trabajo/5). Paso opcional, solo si
// busca empleo: el último trabajo (plantilla oficio). «Terminar» o «Omitir»
// llevan a ONB-99.
import { useRef, useState } from 'react';
import { Checkbox } from '../../../../ui/Checkbox';
import { Stack } from '../../../../ui/Layout';
import { StepLayout } from '../../../../ui/StepLayout';
import { TextField } from '../../../../ui/TextField';
import { COPY } from '../../copy';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import { mascaraMes, mesValido, type ExperienciaDraft } from '../../model';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T5';

const C = COPY.trabajo.experiencia;

export function ExperienceStep() {
    const { draft, layout, next } = useWorkStep(5);
    const { experiencia } = draft.trabajo;
    const [intentado, setIntentado] = useState(false);
    const desdeRef = useRef<HTMLInputElement>(null);
    const hastaRef = useRef<HTMLInputElement>(null);

    const set = (patch: Partial<ExperienciaDraft>) => setTrabajo((t) => ({ ...t, experiencia: { ...t.experiencia, ...patch } }));

    const errores = {
        desde: experiencia.desde && !mesValido(experiencia.desde) ? C.errMes : undefined,
        hasta: !experiencia.actual && experiencia.hasta && !mesValido(experiencia.hasta) ? C.errMes : undefined,
    };

    const terminar = () => {
        setIntentado(true);
        if (errores.desde || errores.hasta) {
            (errores.desde ? desdeRef : hastaRef).current?.focus();
            return;
        }
        setTrabajo({ experienciaOmitida: false });
        next();
    };

    return (
        <>
            <StepLayout
                title={C.titulo}
                subtitle={C.sub}
                {...layout}
                onContinue={terminar}
                continueLabel={C.terminar}
                onSkip={() => {
                    setTrabajo({ experienciaOmitida: true });
                    next();
                }}
            >
                <h2 className="h3 onb-subhead">{C.ultimo}</h2>
                <Stack gap={4}>
                    <TextField
                        label={C.empleador}
                        placeholder={C.empleadorPlaceholder}
                        autoComplete="organization"
                        value={experiencia.empleador}
                        onChange={(e) => set({ empleador: e.target.value })}
                    />
                    <TextField
                        label={C.cargo}
                        autoComplete="organization-title"
                        value={experiencia.cargo}
                        onChange={(e) => set({ cargo: e.target.value })}
                    />
                    <div className="onb-grid2">
                        <TextField
                            ref={desdeRef}
                            label={C.desde}
                            placeholder={C.mesPlaceholder}
                            inputMode="numeric"
                            autoComplete="off"
                            value={experiencia.desde}
                            onChange={(e) => set({ desde: mascaraMes(e.target.value) })}
                            error={intentado ? errores.desde : undefined}
                        />
                        <TextField
                            ref={hastaRef}
                            label={C.hasta}
                            placeholder={C.mesPlaceholder}
                            inputMode="numeric"
                            autoComplete="off"
                            value={experiencia.actual ? '' : experiencia.hasta}
                            onChange={(e) => set({ hasta: mascaraMes(e.target.value) })}
                            disabled={experiencia.actual}
                            error={intentado ? errores.hasta : undefined}
                        />
                    </div>
                    <Checkbox label={C.actual} checked={experiencia.actual} onChange={(e) => set({ actual: e.target.checked })} />
                </Stack>
                <p className="body onb-muted onb-note">{C.pie}</p>
            </StepLayout>
            <OnboardingMenu />
        </>
    );
}
