// ONB-01 · ¿Qué quieres hacer en Talently? (/onboarding/intencion). Selección
// múltiple con OptionCard en dos grupos. Sin BackButton (no hay pantalla
// anterior): el atrás pregunta «¿Salir del registro?». Con más de un bloque
// se abre ONB-02 «¿Con cuál empiezas?» (`?sheet=empezar`). En la
// demostración solo existe el bloque Trabajo: los demás dicen «Disponible pronto».
import { useState } from 'react';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useSheet } from '../../../app/sheets';
import { Stack } from '../../../ui/Layout';
import { OptionGroup } from '../../../ui/OptionCard';
import { StepLayout } from '../../../ui/StepLayout';
import { COPY } from '../copy';
import { StartSheet, START_SHEET } from '../components/EntrySheets';
import { intentOption } from '../components/intents';
import { ExitDialog, MENU_SHEET, OnboardingMenu } from '../components/OnboardingMenu';
import { useStepScroll } from '../components/useStepScroll';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { INTENCIONES_CONTRATAR, INTENCIONES_TRABAJAR, bloquesDe, type Bloque, type Intencion } from '../model';
import { onbPaths } from '../paths';
import { setBloque, setIntenciones, useDraft } from '../store';
import '../onboarding.css';

export const screenId = 'ONB-01';

const C = COPY.intencion;

export function IntentScreen() {
    useFlowEntry();
    const { forward } = useFlow();
    const { canOpen, soon } = useOpenPath();
    const menu = useSheet(MENU_SHEET);
    const start = useSheet(START_SHEET);
    const { intenciones, bloque } = useDraft();
    const [exit, setExit] = useState(false);
    const scrollRef = useStepScroll();
    useStepBack(() => setExit(true));

    const bloques = bloquesDe(intenciones);
    const trabajar = intenciones.filter((i) => INTENCIONES_TRABAJAR.includes(i));
    const contratar = intenciones.filter((i) => INTENCIONES_CONTRATAR.includes(i));

    // Tus datos van primero; el bloque elegido, después. Si su primer paso aún no existe, se dice aquí
    // y no después de llenar «Tus datos».
    const empezarCon = (b: Bloque, replace: boolean) => {
        setBloque(b);
        if (!canOpen(onbPaths.bloque(b))) {
            soon();
            return;
        }
        forward(onbPaths.datos(), { replace });
    };

    const continuar = () => {
        if (bloques.length > 1) {
            if (!bloque || !bloques.includes(bloque)) setBloque(bloques[0] ?? null);
            start.show();
            return;
        }
        const unico = bloques[0];
        if (unico) empezarCon(unico, false);
    };

    return (
        <>
            <StepLayout
                ref={scrollRef}
                title={C.titulo}
                subtitle={C.sub}
                onMenu={() => menu.show()}
                menuLabel={COPY.menu.boton}
                onContinue={continuar}
                continueDisabled={intenciones.length === 0}
            >
                <Stack gap={6}>
                    <OptionGroup<Intencion>
                        mode="multi"
                        legend={C.trabajar}
                        options={INTENCIONES_TRABAJAR.map(intentOption)}
                        value={trabajar}
                        onChange={(next) => setIntenciones([...next, ...contratar])}
                    />
                    <OptionGroup<Intencion>
                        mode="multi"
                        legend={C.contratar}
                        options={INTENCIONES_CONTRATAR.map(intentOption)}
                        value={contratar}
                        onChange={(next) => setIntenciones([...trabajar, ...next])}
                    />
                </Stack>
                <p className="body onb-muted onb-note">{C.pie}</p>
            </StepLayout>
            <StartSheet
                intenciones={intenciones}
                bloques={bloques}
                value={bloque}
                onChange={setBloque}
                // Reemplaza la entrada de la hoja: atrás desde «Tus datos» vuelve aquí, sin la hoja.
                onStart={() => bloque && empezarCon(bloque, true)}
            />
            <OnboardingMenu />
            <ExitDialog open={exit} onClose={() => setExit(false)} />
        </>
    );
}
