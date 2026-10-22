// /onboarding/trabajo/:paso → el paso del bloque Trabajo. Un paso que no
// aplica (T4 sin requisitos, T5 si solo toma turnos) o que no existe abre el
// que corresponde, con replace.
import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { buscaDe, esPasoTrabajo, oficioConRequisitos, pasoSiguiente, pasosTrabajo, type PasoTrabajo } from '../../model';
import { onbPaths } from '../../paths';
import { useDraft } from '../../store';
import { ExperienceStep } from './ExperienceStep';
import { JobsStep } from './JobsStep';
import { PayStep } from './PayStep';
import { RequirementsStep } from './RequirementsStep';
import { TypeStep } from './TypeStep';

const STEPS: Record<PasoTrabajo, ComponentType> = {
    1: JobsStep,
    2: TypeStep,
    3: PayStep,
    4: RequirementsStep,
    5: ExperienceStep,
};

export function WorkStepRoute() {
    const { paso: raw = '' } = useParams();
    const draft = useDraft();
    const n = Number(raw);
    if (!/^\d+$/.test(raw) || !esPasoTrabajo(n)) return <Navigate to={onbPaths.trabajo(1)} replace />;

    const busca = buscaDe(draft.intenciones);
    const conRequisitos = oficioConRequisitos(draft.trabajo) !== null;
    if (!pasosTrabajo(busca, conRequisitos).includes(n)) {
        const siguiente = pasoSiguiente(n, busca, conRequisitos);
        return <Navigate to={siguiente === 'listo' ? onbPaths.listo() : onbPaths.trabajo(siguiente)} replace />;
    }
    const Step = STEPS[n];
    // Cada paso parte de cero (foco en su H1, scroll arriba) aunque la ruta sea la misma.
    return <Step key={n} />;
}
