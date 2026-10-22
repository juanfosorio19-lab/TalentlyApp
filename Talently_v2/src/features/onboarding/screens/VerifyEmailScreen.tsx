// AUTH-03 · Revisa tu correo (/registro/verificar). Código de 6 dígitos que
// se verifica solo al completarse y «Reenviar código (en 0:45)» con cuenta
// regresiva real. Sin CTA (prototipo). Demostración: no se envía ningún
// correo y el código que se escriba se acepta. Verificado, ONB-01 reemplaza
// este paso: volver a pedir el código ya no tiene sentido.
import { useRef, useState } from 'react';
import { useGoBack } from '../../../app/BackButtonManager';
import { AppBar } from '../../../ui/AppBar';
import { Button } from '../../../ui/Button';
import { CodeInput, formatCountdown, useCountdown } from '../../../ui/CodeInput';
import { COPY } from '../copy';
import { StepFrame } from '../components/StepFrame';
import { useLater } from '../components/useLater';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { onbPaths } from '../paths';
import { setCuenta, useDraft } from '../store';
import '../onboarding.css';

export const screenId = 'AUTH-03';

const C = COPY.verificar;
const RESEND_SECONDS = 45;
const DEMO_LATENCY_MS = 600;

export function VerifyEmailScreen() {
    useFlowEntry();
    const goBack = useGoBack();
    const { forward, backTo } = useFlow();
    useStepBack(() => backTo(onbPaths.registro()));
    const later = useLater();
    const { cuenta } = useDraft();
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [left, restart] = useCountdown(RESEND_SECONDS);
    const codeRef = useRef<HTMLInputElement>(null);
    const correo = cuenta.correo.trim();

    const verify = () => {
        setVerifying(true);
        later(() => {
            setVerifying(false);
            // Quien verificó su correo ya aceptó los términos al crear la cuenta.
            setCuenta({ acepta: true });
            forward(onbPaths.intencion(), { replace: true });
        }, DEMO_LATENCY_MS);
    };

    return (
        <StepFrame
            appBar={<AppBar variant="standard" onBack={goBack} />}
            title={C.titulo}
            focusTitle={false}
            subtitle={
                correo ? (
                    <>
                        {C.subA}
                        <b className="onb-strong">{correo}</b>
                        {C.subB}
                    </>
                ) : (
                    C.subSinCorreo
                )
            }
        >
            <CodeInput ref={codeRef} value={code} onChange={setCode} onComplete={verify} loading={verifying} help={C.ayuda} autoFocus />
            <div className="onb-resend">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={left > 0 || verifying}
                    onClick={() => {
                        setCode('');
                        restart();
                        // El botón queda deshabilitado: el foco vuelve al código para escribir el nuevo.
                        codeRef.current?.focus();
                    }}
                >
                    {left > 0 ? C.reenviarEn(formatCountdown(left)) : C.reenviar}
                </Button>
            </div>
        </StepFrame>
    );
}
