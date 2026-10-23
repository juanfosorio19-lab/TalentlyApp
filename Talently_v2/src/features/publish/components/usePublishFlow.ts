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
import { usePhoneVerified, useIdentityStatus } from '../../demo/sessionStore';
import { identityInData } from '../../demo/verifications';
import { PLAN_STEP, needsIdentity, phoneVerifiedInData, type WizardKind } from '../model/publisher';
import { identityPath, publishedPath } from '../publishPaths';
import { awaitIdentity, cancelAwaitIdentity, markPublished, type DraftStore, type PublishedSummary } from '../store';

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
    // Recién registrado, los datos no cuentan (INI-01-jorge-nuevo), pero sí lo verificado en esta sesión.
    const phoneVerified = usePhoneVerified(actor.id, !recienRegistrado && phoneVerifiedInData(actor.id));
    // La identidad es una sola (demo/sessionStore): enviada desde VER-01 o desde aquí, PUBL-04 ya no la pide.
    const identity = useIdentityStatus(actor.id, identityInData(actor.id, recienRegistrado));
    const identitySheet = useSheet(IDENTITY_SHEET);
    const [errorStep, setErrorStep] = useState<number | null>(null);
    const [errorTick, setErrorTick] = useState(0);

    const publish = () => {
        // «Te avisaremos cuando puedas destacar…» (Premium en el paso 5) no sigue sobre PUBL-07 ni GES-01.
        snackbar.hide();
        markPublished(actor.id, summary());
        // PUBL-07 se abre con push, sobre el paso 5 (spec §5.3 regla 6: atrás no vuelve al asistente ni a la
        // hoja PUBL-01). Con replace quedaría encima de la hoja de Inicio y atrás la reabriría; así, atrás cae
        // en el paso 5 de un asistente ya publicado y sin borrador, que useWizard salta (`skipping`) hasta la
        // pantalla de antes, igual que al volver de VER-02 en el flujo 5. «Ver publicación» e «Ir a Inicio»
        // vuelven de un salto a esa pantalla (useFinishFlow), sin pasar por el asistente.
        navigate(publishedPath(kind));
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
        if (needsIdentity(actor, identity)) identitySheet.show();
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
        phoneVerified,
        identityPending: needsIdentity(actor, identity),
    };
}
