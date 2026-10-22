// ONB-99 · Listo (/onboarding/listo). Resumen del perfil de trabajo con su
// completitud real: lo que falta (credencial SPD, foto) con su acción y lo que
// ya está. Una acción sugerida y «Ir a Inicio» (replace). Demostración: al
// salir, la sesión pasa a Jorge recién registrado (INI-01-jorge-nuevo).
import { useId, useRef } from 'react';
import { useSheet } from '../../../app/sheets';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { IconCheck } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { SectionRow } from '../../../ui/SectionCard';
import { useDemoSession } from '../../demo/session';
import { COPY } from '../copy';
import { CREDENTIAL_SHEET, CredentialSheet } from '../components/Credential';
import { PHOTO_SHEET, PhotoSheet } from '../components/Photo';
import { StepFrame } from '../components/StepFrame';
import { useFocusRescue } from '../components/useFocusRescue';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { buscaDe, faltantes, resumen } from '../model';
import { onbPaths } from '../paths';
import { resetDraft, useDraft } from '../store';
import '../onboarding.css';

export const screenId = 'ONB-99';

const C = COPY.listo;

export function DoneScreen() {
    useFlowEntry();
    const { leave } = useFlow();
    const { startAsNewUser } = useDemoSession();
    const draft = useDraft();
    const credentialSheet = useSheet(CREDENTIAL_SHEET);
    const photoSheet = useSheet(PHOTO_SHEET);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const sectionId = useId();
    const credencialId = useId();
    const fotoId = useId();

    const busca = buscaDe(draft.intenciones);
    const falta = faltantes(draft);
    const lineas = resumen(draft);
    const nombre = draft.datos.nombre.trim();

    /** Termina el onboarding: la demostración pasa a Jorge recién registrado y el registro se olvida. */
    const terminar = (dest: string) => {
        startAsNewUser();
        resetDraft();
        leave(dest);
    };
    // No hay paso anterior: el bloque ya quedó creado. Atrás lleva a Inicio.
    useStepBack(() => terminar(onbPaths.inicio()));
    // Al subir la credencial o agregar la foto, su fila desaparece: el foco vuelve al título.
    useFocusRescue(titleRef, [falta.length, credentialSheet.open, photoSheet.open]);

    return (
        <>
            <StepFrame
                titleRef={titleRef}
                title={C.titulo(nombre)}
                subtitle={falta.length > 0 ? C.sub : C.subCompleto}
                cta={
                    <>
                        <Button
                            size="lg"
                            block
                            onClick={() => terminar(busca.empleo ? onbPaths.empleosEnLista() : onbPaths.turnos())}
                        >
                            {busca.empleo ? C.verEmpleos : C.verTurnos}
                        </Button>
                        <Button variant="ghost" size="lg" block onClick={() => terminar(onbPaths.inicio())}>
                            {C.irInicio}
                        </Button>
                    </>
                }
            >
                <section className="tl-section" aria-labelledby={sectionId}>
                    <div className="tl-section__head">
                        <h2 className="tl-section__title h3" id={sectionId}>
                            {C.perfil}
                        </h2>
                        {falta.length > 0 && <span className="tl-chipgroup__count onb-count">{C.porCompletar(falta.length)}</span>}
                    </div>
                    {falta.includes('credencial') && (
                        <SectionRow className="onb-row">
                            <Stack gap={1} align="start" className="onb-grow">
                                <span className="button-lg" id={credencialId}>
                                    {C.faltaCredencial}
                                </span>
                                <Badge status="Obligatoria" />
                                <span className="body onb-muted">{C.faltaCredencialTexto}</span>
                            </Stack>
                            <Button
                                variant="tonal"
                                size="sm"
                                aria-haspopup="dialog"
                                aria-describedby={credencialId}
                                onClick={() => credentialSheet.show()}
                            >
                                {C.subir}
                            </Button>
                        </SectionRow>
                    )}
                    {falta.includes('foto') && (
                        <SectionRow className="onb-row">
                            <Stack gap={1} align="start" className="onb-grow">
                                <span className="button-lg" id={fotoId}>
                                    {C.faltaFoto}
                                </span>
                                <span className="body onb-muted">{C.faltaFotoTexto}</span>
                            </Stack>
                            <Button
                                variant="tonal"
                                size="sm"
                                aria-haspopup="dialog"
                                aria-describedby={fotoId}
                                onClick={() => photoSheet.show()}
                            >
                                {C.agregar}
                            </Button>
                        </SectionRow>
                    )}
                    <SectionRow className="onb-row--col">
                        <p className="overline onb-muted onb-flush">{C.yaEsta}</p>
                        <ul className="onb-done">
                            {lineas.map((linea) => (
                                <li key={linea} className="body onb-done__item">
                                    <span className="onb-done__check">
                                        <IconCheck size={16} />
                                    </span>
                                    <span>{linea}</span>
                                </li>
                            ))}
                        </ul>
                    </SectionRow>
                </section>
            </StepFrame>
            <CredentialSheet />
            <PhotoSheet name={`${draft.datos.nombre} ${draft.datos.apellido}`.trim()} />
        </>
    );
}
