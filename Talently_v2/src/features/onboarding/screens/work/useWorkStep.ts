// Lo común a los pasos del bloque Trabajo (`/onboarding/trabajo/:paso`):
// «Paso X de N», el atrás al paso anterior (useWizardBack), el menú ⋯ y el
// paso que sigue según lo que aplica (T4 solo con requisitos, T5 solo si busca empleo).
import { useGoBack } from '../../../../app/BackButtonManager';
import { useSheet } from '../../../../app/sheets';
import { COPY } from '../../copy';
import { MENU_SHEET } from '../../components/OnboardingMenu';
import { useFlow, useFlowEntry, useStepBack } from '../../flow';
import {
    buscaDe,
    numeroDePaso,
    oficioConRequisitos,
    pasoAnterior,
    pasoSiguiente,
    totalPasos,
    type Busca,
    type OnboardingDraft,
    type PasoTrabajo,
} from '../../model';
import { onbPaths } from '../../paths';
import { useDraft } from '../../store';

export interface WorkStep {
    draft: OnboardingDraft;
    busca: Busca;
    /** Props de StepLayout: progreso, atrás y menú. */
    layout: {
        progress: { step: number; total: number };
        onBack: () => void;
        onMenu: () => void;
        menuLabel: string;
    };
    /** Abre el paso que sigue (o ONB-99). */
    next: () => void;
}

export function useWorkStep(paso: PasoTrabajo): WorkStep {
    useFlowEntry();
    const goBack = useGoBack();
    const { forward, backTo } = useFlow();
    const menu = useSheet(MENU_SHEET);
    const draft = useDraft();
    const busca = buscaDe(draft.intenciones);
    const conRequisitos = oficioConRequisitos(draft.trabajo) !== null;

    const anterior = pasoAnterior(paso, busca, conRequisitos);
    useStepBack(() => backTo(anterior === 'datos' ? onbPaths.datos() : onbPaths.trabajo(anterior)));

    const next = () => {
        const siguiente = pasoSiguiente(paso, busca, conRequisitos);
        forward(siguiente === 'listo' ? onbPaths.listo() : onbPaths.trabajo(siguiente));
    };

    return {
        draft,
        busca,
        next,
        layout: {
            progress: { step: numeroDePaso(paso), total: totalPasos('trabajo', busca) },
            onBack: goBack,
            onMenu: () => menu.show(),
            menuLabel: COPY.menu.boton,
        },
    };
}
