// PUBL-04 · Aviso para mi hogar (/publicar/hogar/:paso), flujo 5 del
// prototipo: 1 Tipo y puertas · 2 Días y horario · 3 Tareas y contexto ·
// 4 Sueldo y vista previa · 5 PUBL-08 Tipo de publicación. Al publicar sin la
// identidad verificada: hoja PUBL-04-identidad → VER-02 → PUBL-07.
import { useMemo, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { copy } from '../copy';
import { HogarStep1, HogarStep2, HogarStep3, HogarStep4 } from '../components/HogarSteps';
import { PlanStep, planSubtitle } from '../components/PlanStep';
import { usePublishFlow } from '../components/usePublishFlow';
import { useWizard } from '../components/useWizard';
import { WizardShell } from '../components/WizardShell';
import { IdentitySheet } from '../components/WizardSheets';
import { firstIncompleteHogarStep, hogarErrors, initialHogar, type HogarDraft } from '../model/hogar';
import { summaryOf } from '../model/summary';
import { hogarDrafts } from '../store';
import '../publish.css';

export const screenId = 'PUBL-04';

export function HogarWizardScreen({ step }: { step: number }) {
    const { actor, recienRegistrado } = useDemoSession();
    const initial = useMemo(() => initialHogar(actor.id, { recienRegistrado }), [actor.id, recienRegistrado]);
    const entry = hogarDrafts.useEntry(actor.id);
    const draft = entry?.draft ?? initial;
    const changed = JSON.stringify(draft) !== JSON.stringify(initial);

    const wizard = useWizard({ kind: 'hogar', step, actorId: actor.id, store: hogarDrafts, initial, changed });
    const errors = hogarErrors(draft, step);
    const flow = usePublishFlow({
        kind: 'hogar',
        step,
        actor,
        store: hogarDrafts,
        initial,
        hasErrors: Object.keys(errors).length > 0,
        goTo: wizard.goTo,
        summary: () => summaryOf(actor, draft),
        recienRegistrado,
    });

    const incomplete = firstIncompleteHogarStep(draft);
    if (incomplete !== null && incomplete < step) return <Navigate to={paths.publicar('hogar', incomplete)} replace />;

    const onPatch = (patch: Partial<HogarDraft>) => hogarDrafts.patch(actor.id, initial, patch);
    const shown = flow.showErrors ? errors : null;
    const p = copy.hogar;
    const steps: Record<number, { title: string; subtitle: string; content: ReactNode }> = {
        1: { title: p.paso1.titulo, subtitle: p.paso1.sub, content: <HogarStep1 draft={draft} errors={shown} onPatch={onPatch} /> },
        2: { title: p.paso2.titulo, subtitle: p.paso2.sub, content: <HogarStep2 draft={draft} errors={shown} onPatch={onPatch} /> },
        3: { title: p.paso3.titulo, subtitle: p.paso3.sub, content: <HogarStep3 draft={draft} errors={shown} onPatch={onPatch} /> },
        4: {
            title: p.paso4.titulo,
            subtitle: p.paso4.sub,
            content: (
                <HogarStep4 actor={actor} draft={draft} errors={shown} onPatch={onPatch} identityPending={flow.identityPending} />
            ),
        },
        5: { title: copy.plan.titulo, subtitle: planSubtitle('hogar'), content: <PlanStep kind="hogar" /> },
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
                    // Ya enviada (al volver con atrás desde PUBL-07), la hoja no vuelve a pedirla.
                    open={flow.identitySheet.open && flow.identityPending}
                    onClose={flow.identitySheet.hide}
                    onVerify={flow.verifyIdentity}
                    que="aviso"
                    phoneVerified={flow.phoneVerified}
                />
            }
        >
            {current.content}
        </WizardShell>
    );
}
