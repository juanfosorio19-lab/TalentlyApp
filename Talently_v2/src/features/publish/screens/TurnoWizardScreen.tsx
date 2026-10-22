// PUBL-03 · Publicar turno (/publicar/turno/:paso), flujo 4 del prototipo:
// 1 Oficio y plantilla · 2 Fechas y bloques · 3 Tarifa, contratación y
// requisitos · 4 Vista previa · 5 PUBL-08 Tipo de publicación. Lo escrito
// vive en el borrador del actor (store.ts): se conserva al ir y volver entre
// pasos. Al publicar, replace a PUBL-07.
import { useMemo, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Banner } from '../../../ui/Banner';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { copy } from '../copy';
import { PlanStep, planSubtitle } from '../components/PlanStep';
import { TurnoStep1, TurnoStep2, TurnoStep3, TurnoStep4 } from '../components/TurnoSteps';
import { usePublishFlow } from '../components/usePublishFlow';
import { useWizard } from '../components/useWizard';
import { WizardShell } from '../components/WizardShell';
import { IdentitySheet } from '../components/WizardSheets';
import { orgVerified } from '../model/publisher';
import {
    emptyTurno,
    firstIncompleteTurnoStep,
    hasErrors,
    initialTurno,
    turnoErrors,
    turnoTemplate,
    type TurnoDraft,
} from '../model/turno';
import { summaryOf } from '../model/summary';
import { turnoDrafts } from '../store';
import '../publish.css';

export const screenId = 'PUBL-03';

export function TurnoWizardScreen({ step }: { step: number }) {
    const { actor } = useDemoSession();
    const template = useMemo(() => turnoTemplate(actor.id), [actor.id]);
    const initial = useMemo(() => initialTurno(actor.id), [actor.id]);
    const entry = turnoDrafts.useEntry(actor.id);
    const draft = entry?.draft ?? initial;
    const changed = JSON.stringify(draft) !== JSON.stringify(initial);

    const wizard = useWizard({ kind: 'turno', step, actorId: actor.id, store: turnoDrafts, initial, changed });
    const errors = turnoErrors(draft, step);
    const flow = usePublishFlow({
        kind: 'turno',
        step,
        actor,
        store: turnoDrafts,
        initial,
        hasErrors: hasErrors(errors),
        goTo: wizard.goTo,
        summary: () => summaryOf(actor, draft),
    });

    // Un enlace a un paso posterior con algo pendiente antes lleva a ese paso.
    const incomplete = firstIncompleteTurnoStep(draft);
    if (incomplete !== null && incomplete < step) return <Navigate to={paths.publicar('turno', incomplete)} replace />;

    const onPatch = (patch: Partial<TurnoDraft>) => turnoDrafts.patch(actor.id, initial, patch);
    // Plantilla o desde cero: cambia el punto de partida (la plantilla vuelve a traer lo suyo).
    const onStart = (inicio: 'plantilla' | 'cero') =>
        turnoDrafts.replace(actor.id, inicio === 'plantilla' && template ? template.draft : emptyTurno('cero'));

    const shown = flow.showErrors ? errors : null;
    const p = copy.turno;
    const steps: Record<number, { title: string; subtitle: string; content: ReactNode }> = {
        1: {
            title: p.paso1.titulo,
            subtitle: template ? p.paso1.sub : p.paso1.subSinPlantilla,
            content: <TurnoStep1 actor={actor} draft={draft} errors={shown} onPatch={onPatch} template={template} onStart={onStart} />,
        },
        2: { title: p.paso2.titulo, subtitle: p.paso2.sub, content: <TurnoStep2 draft={draft} errors={shown} onPatch={onPatch} /> },
        3: { title: p.paso3.titulo, subtitle: p.paso3.sub, content: <TurnoStep3 draft={draft} errors={shown} onPatch={onPatch} /> },
        4: {
            title: p.paso4.titulo,
            subtitle: p.paso4.sub,
            content: (
                <Stack gap={6}>
                    {actor.kind === 'organizacion' && !orgVerified(actor) && <Banner>{p.paso4.revision}</Banner>}
                    <TurnoStep4 actor={actor} draft={draft} />
                </Stack>
            ),
        },
        5: { title: copy.plan.titulo, subtitle: planSubtitle('turno'), content: <PlanStep kind="turno" /> },
    };
    const current = steps[step] ?? steps[1];
    if (!current) return null;

    return (
        <WizardShell
            step={step}
            title={current.title}
            subtitle={current.subtitle}
            onContinue={flow.onContinue}
            continueLabel={step === 5 ? copy.plan.publicar : undefined}
            errorTick={flow.errorTick}
            menu={wizard.menu}
            onSaveExit={wizard.saveAndExit}
            onHelp={wizard.help}
            sheets={
                <IdentitySheet
                    open={flow.identitySheet.open}
                    onClose={flow.identitySheet.hide}
                    onVerify={flow.verifyIdentity}
                    que="turno"
                    phoneVerified={flow.phoneVerified}
                />
            }
        >
            {current.content}
        </WizardShell>
    );
}
