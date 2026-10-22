// Lo común a los dos asistentes: los errores del paso (se muestran solo
// después de tocar «Continuar» con algo pendiente), avanzar, y publicar —
// directo o, si un hogar aún no verifica su identidad, pasando por la hoja
// PUBL-04-identidad y VER-02 (flujo 5).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useSheet } from '../../../app/sheets';
import type { DemoActor } from '../../demo/session';
import { isPhoneVerified } from '../../demo/sessionStore';
import { PLAN_STEP, needsIdentity, phoneVerifiedInData, type WizardKind } from '../model/publisher';
import { identityPath, publishedPath } from '../publishPaths';
import { awaitIdentity, markPublished, useIdentitySent, type DraftStore, type PublishedSummary } from '../store';

export const IDENTITY_SHEET = 'identidad';

interface FlowOptions<T> {
    kind: WizardKind;
    step: number;
    actor: DemoActor;
    store: DraftStore<T>;
    initial: T;
    /** Hay algo pendiente en este paso. */
    hasErrors: boolean;
    goTo: (step: number) => void;
    /** Lo que muestra PUBL-07, armado con el borrador. */
    summary: () => PublishedSummary;
    /** INI-01-jorge-nuevo: aún no verifica su teléfono. */
    recienRegistrado?: boolean;
}

export function usePublishFlow<T>({ kind, step, actor, store, initial, hasErrors, goTo, summary, recienRegistrado }: FlowOptions<T>) {
    const navigate = useNavigate();
    const { open } = useOpenPath();
    const identitySheet = useSheet(IDENTITY_SHEET);
    const identitySent = useIdentitySent(actor.id);
    const [errorStep, setErrorStep] = useState<number | null>(null);
    const [errorTick, setErrorTick] = useState(0);

    const publish = () => {
        markPublished(actor.id, summary());
        // Al terminar un flujo, replace hacia su resultado (spec §5.3 regla 6): atrás no vuelve al asistente.
        navigate(publishedPath(kind), { replace: true });
        store.discard(actor.id);
    };

    const onContinue = () => {
        if (hasErrors) {
            setErrorStep(step);
            setErrorTick((t) => t + 1);
            return;
        }
        setErrorStep(null);
        if (step < PLAN_STEP) {
            goTo(step + 1);
            return;
        }
        if (needsIdentity(actor, identitySent)) identitySheet.show();
        else publish();
    };

    /** «Verificar ahora»: el borrador queda guardado y VER-02 vuelve a PUBL-07, que termina de publicar. */
    const verifyIdentity = () => {
        store.save(actor.id, initial, step);
        awaitIdentity(actor.id, kind);
        open(identityPath(publishedPath(kind)));
    };

    return {
        /** Mostrar los errores de este paso. */
        showErrors: errorStep === step,
        errorTick,
        onContinue,
        identitySheet,
        verifyIdentity,
        phoneVerified: !recienRegistrado && isPhoneVerified(actor.id, phoneVerifiedInData(actor.id)),
        identityPending: needsIdentity(actor, identitySent),
    };
}
