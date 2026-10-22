// ONB-03 · Tus datos (/onboarding/datos). «Paso 1 de N»: nombre y apellido
// (precargados del registro), comuna (SHT-COMUNA, `?sheet=comuna`), foto
// (opcional), fecha de nacimiento (privada; solo si eligió algo de «Quiero
// trabajar») y teléfono (opcional; se verifica al primer turno o publicación).
import { useId, useRef, useState } from 'react';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useSheet } from '../../../app/sheets';
import { Stack } from '../../../ui/Layout';
import { MediaUploader, UploadActions } from '../../../ui/MediaUploader';
import { Select } from '../../../ui/Select';
import { StepLayout } from '../../../ui/StepLayout';
import { FieldFoot, TextField } from '../../../ui/TextField';
import { COMUNAS } from '../catalog';
import { COPY } from '../copy';
import { OnboardingMenu, MENU_SHEET } from '../components/OnboardingMenu';
import { PhoneField } from '../components/PhoneField';
import { usePickPhoto } from '../components/Photo';
import { COMUNA_SHEET, ComunaSheet } from '../components/PickerSheets';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { bloquesDe, buscaDe, mascaraFecha, pideNacimiento, totalPasos, validarNacimiento } from '../model';
import { onbPaths } from '../paths';
import { setDatos, useDraft } from '../store';
import '../onboarding.css';

export const screenId = 'ONB-03';

const C = COPY.datos;

export function DataScreen() {
    useFlowEntry();
    const goBack = useGoBack();
    const { forward, backTo } = useFlow();
    useStepBack(() => backTo(onbPaths.intencion()));
    const { canOpen, soon } = useOpenPath();
    const menu = useSheet(MENU_SHEET);
    const comunaSheet = useSheet(COMUNA_SHEET);
    const draft = useDraft();
    const { datos, intenciones } = draft;
    const bloque = draft.bloque ?? bloquesDe(intenciones)[0] ?? 'trabajo';
    const conNacimiento = pideNacimiento(intenciones);
    const { uploading, pick } = usePickPhoto();
    const [intentado, setIntentado] = useState(false);
    const fotoLabelId = useId();
    const nombreRef = useRef<HTMLInputElement>(null);
    const apellidoRef = useRef<HTMLInputElement>(null);
    const comunaRef = useRef<HTMLButtonElement>(null);
    const nacimientoRef = useRef<HTMLInputElement>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);

    const errores = {
        nombre: datos.nombre.trim() ? undefined : C.errNombre,
        apellido: datos.apellido.trim() ? undefined : C.errApellido,
        comuna: datos.comuna ? undefined : C.errComuna,
        nacimiento: !conNacimiento
            ? undefined
            : { invalida: C.errFecha, menor: C.errEdad, ok: undefined }[validarNacimiento(datos.nacimiento, new Date()) ?? 'ok'],
        telefono: datos.telefono === '' || datos.telefono.length === 8 ? undefined : C.errTelefono,
    };
    const ver = (e: string | undefined) => (intentado ? e : undefined);

    const continuar = () => {
        setIntentado(true);
        const primero = errores.nombre
            ? nombreRef
            : errores.apellido
              ? apellidoRef
              : errores.comuna
                ? comunaRef
                : errores.nacimiento
                  ? nacimientoRef
                  : errores.telefono
                    ? telefonoRef
                    : null;
        if (primero) {
            primero.current?.focus();
            return;
        }
        const siguiente = bloque === 'trabajo' ? onbPaths.trabajo(1) : onbPaths.bloque(bloque);
        if (canOpen(siguiente)) forward(siguiente);
        else soon();
    };

    return (
        <>
            <StepLayout
                title={C.titulo}
                subtitle={C.sub}
                progress={{ step: 1, total: totalPasos(bloque, buscaDe(intenciones)) }}
                onBack={goBack}
                onMenu={() => menu.show()}
                menuLabel={COPY.menu.boton}
                onContinue={continuar}
            >
                <Stack gap={4}>
                    <div className="onb-grid2">
                        <TextField
                            ref={nombreRef}
                            label={C.nombre}
                            autoComplete="given-name"
                            value={datos.nombre}
                            onChange={(e) => setDatos({ nombre: e.target.value })}
                            error={ver(errores.nombre)}
                        />
                        <TextField
                            ref={apellidoRef}
                            label={C.apellido}
                            autoComplete="family-name"
                            value={datos.apellido}
                            onChange={(e) => setDatos({ apellido: e.target.value })}
                            error={ver(errores.apellido)}
                        />
                    </div>
                    <Select
                        ref={comunaRef}
                        label={C.comuna}
                        placeholder={C.comunaPlaceholder}
                        options={COMUNAS}
                        value={datos.comuna}
                        onChange={(comuna) => setDatos({ comuna })}
                        error={ver(errores.comuna)}
                        // SHT-COMUNA vive en la URL (`?sheet=comuna`): la hoja propia del Select no se abre.
                        onClick={(e) => {
                            e.preventDefault();
                            comunaSheet.show();
                        }}
                    />
                    <div role="group" aria-labelledby={fotoLabelId}>
                        <span className="tl-field__label onb-label" id={fotoLabelId}>
                            {C.foto} <span className="tl-field__opt">(opcional)</span>
                        </span>
                        <div className="onb-photo">
                            <MediaUploader
                                variant="avatar"
                                name={`${datos.nombre} ${datos.apellido}`.trim()}
                                photo={datos.foto}
                                uploading={uploading}
                                actions={false}
                                onSelect={pick}
                            />
                            <UploadActions className="onb-photo__actions" capture="user" onSelect={pick} disabled={uploading} />
                        </div>
                        <FieldFoot helpId={`${fotoLabelId}-h`} errorId={`${fotoLabelId}-e`} help={C.fotoAyuda[bloque]} />
                    </div>
                    {conNacimiento && (
                        <TextField
                            ref={nacimientoRef}
                            label={C.nacimiento}
                            placeholder={C.nacimientoPlaceholder}
                            inputMode="numeric"
                            autoComplete="bday"
                            value={datos.nacimiento}
                            onChange={(e) => setDatos({ nacimiento: mascaraFecha(e.target.value) })}
                            help={C.nacimientoAyuda}
                            error={ver(errores.nacimiento)}
                        />
                    )}
                    <PhoneField
                        inputRef={telefonoRef}
                        value={datos.telefono}
                        onChange={(telefono) => setDatos({ telefono })}
                        help={C.telefonoAyuda}
                        error={ver(errores.telefono)}
                    />
                </Stack>
            </StepLayout>
            <ComunaSheet value={datos.comuna} onChange={(comuna) => setDatos({ comuna })} />
            <OnboardingMenu />
        </>
    );
}
