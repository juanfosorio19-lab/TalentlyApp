// Lo común a los dos asistentes: los errores del paso (se muestran solo
// después de tocar «Continuar» con algo pendiente), avanzar, y publicar —
// directo o, si un hogar aún no verifica su identidad, pasando por la hoja
// PUBL-04-identidad y VER-02 (flujo 5).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../ui/Snackbar';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useSheet } from '../../../app/sheets';
import type { DemoActor } from '../../demo/session';
import { isPhoneVerified, useSessionState } from '../../demo/sessionStore';
import { PLAN_STEP, needsIdentity, phoneVerifiedInData, type WizardKind } from '../model/publisher';
import { identityPath, publishedPath } from '../publishPaths';
import { awaitIdentity, cancelAwaitIdentity, markPublished, useIdentitySent, type DraftStore, type PublishedSummary } from '../store';

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
    const snackbar = useSnackbar();
    const { open } = useOpenPath();
    // El teléfono verificado en esta sesión (VER-01, AUTH-08) cuenta al momento: la hoja lo lee de aquí.
    useSessionState();
    const identitySheet = useSheet(IDENTITY_SHEET);
    const identitySent = useIdentitySent(actor.id);
    const [errorStep, setErrorStep] = useState<number | null>(null);
    const [errorTick, setErrorTick] = useState(0);

    const publish = () => {
        // «Te avisaremos cuando puedas destacar…» (Premium en el paso 5) no sigue sobre PUBL-07 ni GES-01.
        snackbar.hide();
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
        snackbar.hide();
        store.save(actor.id, initial, step);
        awaitIdentity(actor.id, kind);
        open(identityPath(publishedPath(kind)));
    };

    /** «Ahora no» (o atrás con la hoja abierta, también al volver de VER-02): PUBL-07 ya no publica por su cuenta. */
    const dismissIdentity = () => {
        cancelAwaitIdentity(actor.id, kind);
        identitySheet.hide();
    };

    return {
        /** Mostrar los errores de este paso. */
        showErrors: errorStep === step,
        errorTick,
        onContinue,
        identitySheet,
        dismissIdentity,
        verifyIdentity,
        // Recién registrado, los datos no cuentan (INI-01-jorge-nuevo), pero sí lo verificado en esta sesión.
        phoneVerified: isPhoneVerified(actor.id, !recienRegistrado && phoneVerifiedInData(actor.id)),
        identityPending: needsIdentity(actor, identitySent),
    };
}
