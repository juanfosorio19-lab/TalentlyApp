// AUTH-02 · Crear cuenta (/registro). StepLayout de acceso (sin barra ni ⋯):
// un único checkbox de Términos y Privacidad con enlaces reales, Google (se
// habilita al aceptar), nombre, correo y contraseña con su checklist en vivo.
// Demostración: no se crea ninguna cuenta; Google abre ONB-01 directo (como
// AUTH-07 con una cuenta nueva) y el correo pide el código en AUTH-03.
import { useRef, useState } from 'react';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { Button, Divider, LinkText } from '../../../ui/Button';
import { Checkbox } from '../../../ui/Checkbox';
import { Stack } from '../../../ui/Layout';
import { PasswordField, checkPassword } from '../../../ui/PasswordField';
import { StepLayout } from '../../../ui/StepLayout';
import { TextField } from '../../../ui/TextField';
import { useGoBack } from '../../../app/BackButtonManager';
import { COPY } from '../copy';
import { useLater } from '../components/useLater';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { correoValido, separarNombre } from '../model';
import { onbPaths } from '../paths';
import { getClave, setClave as guardarClave, setCuenta, setDatos, useDraft } from '../store';
import '../onboarding.css';

export const screenId = 'AUTH-02';

const C = COPY.registro;
const DEMO_LATENCY_MS = 600;

export function SignUpScreen() {
    useFlowEntry();
    const goBack = useGoBack();
    const { forward, backTo } = useFlow();
    useStepBack(() => backTo(onbPaths.bienvenida()));
    const { linkProps } = useOpenPath();
    const later = useLater();
    const { cuenta } = useDraft();
    // La contraseña no se guarda en el borrador ni en el teléfono: solo en
    // memoria, para que siga escrita al volver de Términos o Privacidad.
    const [clave, setClave] = useState(getClave);
    const [intentado, setIntentado] = useState(false);
    const [creando, setCreando] = useState(false);
    const nombreRef = useRef<HTMLInputElement>(null);
    const correoRef = useRef<HTMLInputElement>(null);
    const claveRef = useRef<HTMLInputElement>(null);

    const nombreError = intentado && separarNombre(cuenta.nombre).nombre === '' ? C.errNombre : undefined;
    const correoError = intentado && !correoValido(cuenta.correo) ? C.errCorreo : undefined;
    const claveOk = checkPassword(clave).ok;

    /** El nombre del registro precarga «Tus datos» (spec §6.1 regla 2). */
    const precargarDatos = () => {
        const { nombre, apellido } = separarNombre(cuenta.nombre);
        if (nombre) setDatos({ nombre, apellido });
    };

    const crear = () => {
        setIntentado(true);
        const sinNombre = separarNombre(cuenta.nombre).nombre === '';
        const correoMalo = !correoValido(cuenta.correo);
        if (sinNombre || correoMalo || !claveOk) {
            (sinNombre ? nombreRef : correoMalo ? correoRef : claveRef).current?.focus();
            return;
        }
        precargarDatos();
        setCreando(true);
        later(() => {
            setCreando(false);
            forward(onbPaths.verificar());
        }, DEMO_LATENCY_MS);
    };

    const conGoogle = () => {
        precargarDatos();
        forward(onbPaths.intencion());
    };

    const terminos = linkProps(onbPaths.terminos());
    const privacidad = linkProps(onbPaths.privacidad());

    return (
        <StepLayout
            title={C.titulo}
            subtitle={C.sub}
            onBack={goBack}
            onContinue={crear}
            continueLabel={C.crear}
            continueDisabled={!cuenta.acepta}
            continueLoading={creando}
            continueLoadingLabel={C.creando}
        >
            <Stack gap={3}>
                <Checkbox
                    checked={cuenta.acepta}
                    onChange={(e) => setCuenta({ acepta: e.target.checked })}
                    label={
                        <>
                            {C.aceptoA}
                            <LinkText {...terminos}>{C.terminos}</LinkText>
                            {C.aceptoB}
                            <LinkText {...privacidad}>{C.privacidad}</LinkText>
                        </>
                    }
                />
                <Button variant="outline" size="lg" block logo disabled={!cuenta.acepta || creando} onClick={conGoogle}>
                    {C.google}
                </Button>
                <div className="onb-divider">
                    <Divider>{C.o}</Divider>
                </div>
                <TextField
                    ref={nombreRef}
                    label={C.nombre}
                    autoComplete="name"
                    value={cuenta.nombre}
                    onChange={(e) => setCuenta({ nombre: e.target.value })}
                    error={nombreError}
                />
                <TextField
                    ref={correoRef}
                    label={C.correo}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={cuenta.correo}
                    onChange={(e) => setCuenta({ correo: e.target.value })}
                    error={correoError}
                />
                <PasswordField
                    ref={claveRef}
                    value={clave}
                    onChange={(e) => {
                        setClave(e.target.value);
                        guardarClave(e.target.value);
                    }}
                    showMissing={intentado}
                />
            </Stack>
        </StepLayout>
    );
}
