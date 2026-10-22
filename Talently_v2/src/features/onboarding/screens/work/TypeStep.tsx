// ONB-T2 · ¿Qué tipo de trabajo buscas? (/onboarding/trabajo/2). Jornada
// (si busca empleo), desde cuándo, hasta dónde se mueve, movilización propia
// y, si toma turnos, la grilla de franjas.
import { useRef, useState } from 'react';
import { AvailabilityGrid } from '../../../../ui/AvailabilityGrid';
import { ChipGroup } from '../../../../ui/ChipGroup';
import { Stack } from '../../../../ui/Layout';
import { RadioGroup } from '../../../../ui/Radio';
import { StepLayout } from '../../../../ui/StepLayout';
import { Switch } from '../../../../ui/Switch';
import { DISPONIBLE_DESDE, JORNADAS, RADIOS, comunaName, type DisponibleDesde, type Jornada, type Radio } from '../../catalog';
import { COPY } from '../../copy';
import { ChipChoice } from '../../components/ChipChoice';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T2';

const C = COPY.trabajo.tipo;

export function TypeStep() {
    const { draft, busca, layout, next } = useWorkStep(2);
    const { trabajo } = draft;
    const [intentado, setIntentado] = useState(false);
    const jornadaRef = useRef<HTMLDivElement>(null);
    const desdeRef = useRef<HTMLFieldSetElement>(null);
    const franjasRef = useRef<HTMLDivElement>(null);
    const comuna = comunaName(draft.datos.comuna);

    const errores = {
        jornada: busca.empleo && trabajo.jornadas.length === 0 ? C.errJornada : undefined,
        desde: trabajo.desde === null ? C.errDesde : undefined,
        franjas: busca.turnos && trabajo.franjas.length === 0 ? C.errFranjas : undefined,
    };
    const ver = (e: string | undefined) => (intentado ? e : undefined);

    const continuar = () => {
        setIntentado(true);
        const primero = errores.jornada ? jornadaRef : errores.desde ? desdeRef : errores.franjas ? franjasRef : null;
        if (primero) {
            // Lleva el grupo a la vista y el foco a su primer control.
            primero.current?.querySelector<HTMLElement>('button, input')?.focus();
            return;
        }
        next();
    };

    const subtitulo = busca.empleo && busca.turnos ? C.subAmbos : busca.empleo ? C.subEmpleo : C.subTurnos;

    return (
        <>
            <StepLayout title={C.titulo} subtitle={subtitulo} {...layout} onContinue={continuar}>
                <Stack gap={6}>
                    {busca.empleo && (
                        <ChipGroup<Jornada>
                            ref={jornadaRef}
                            label={C.jornada}
                            options={JORNADAS}
                            value={trabajo.jornadas}
                            onChange={(jornadas) => setTrabajo({ jornadas })}
                            error={ver(errores.jornada)}
                        />
                    )}
                    <RadioGroup<DisponibleDesde>
                        ref={desdeRef}
                        legend={C.desde}
                        options={DISPONIBLE_DESDE}
                        value={trabajo.desde}
                        onChange={(desde) => setTrabajo({ desde })}
                        error={ver(errores.desde)}
                    />
                    <ChipChoice<Radio>
                        label={C.radio}
                        options={RADIOS}
                        value={trabajo.radio}
                        onChange={(radio) => setTrabajo({ radio })}
                        note={comuna ? C.desdeComuna(comuna) : undefined}
                    />
                    <Switch
                        label={C.movil}
                        description={C.movilDesc}
                        checked={trabajo.movilizacion}
                        onChange={(e) => setTrabajo({ movilizacion: e.target.checked })}
                    />
                    {busca.turnos && (
                        <AvailabilityGrid
                            ref={franjasRef}
                            label={C.franjas}
                            value={trabajo.franjas}
                            onChange={(franjas) => setTrabajo({ franjas })}
                            error={ver(errores.franjas)}
                        />
                    )}
                </Stack>
            </StepLayout>
            <OnboardingMenu />
        </>
    );
}
