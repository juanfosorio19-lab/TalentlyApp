import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { CodeInput, useCountdown } from './CodeInput';

/** Estado que no aplica a este control, con su motivo (como en preview.html). */
function NoAplica({ children }: { children: ReactNode }) {
    return (
        <DemoRow>
            <Badge>No aplica</Badge>
            <DemoLabel>{children}</DemoLabel>
        </DemoRow>
    );
}

/** AUTH-08 en vivo: se verifica solo al completar; «Reenviar» con cuenta regresiva real. */
function CodigoTelefono() {
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [intentos, setIntentos] = useState(3);
    const [error, setError] = useState<string>();
    const [listo, setListo] = useState(false);
    const [resendIn, restart] = useCountdown(45);
    // La verificación simulada se cancela si la tarjeta se desmonta (filtro o navegación del catálogo).
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const verificar = (completo: string) => {
        setVerifying(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            setVerifying(false);
            if (completo === '482910') {
                setListo(true);
                return;
            }
            const quedan = intentos - 1;
            setIntentos(quedan);
            if (quedan > 0) {
                setError(`El código no es correcto. Te quedan ${quedan} ${quedan === 1 ? 'intento' : 'intentos'}.`);
            } else {
                setError(undefined);
                setCode('');
                restart(300);
            }
        }, 1200);
    };

    return (
        <>
            {/* Cabecera del paso (en la app la pone StepLayout); spans para no arrastrar márgenes del navegador. */}
            <span className="h2">Ingresa el código</span>
            <span className="body-l">Te lo enviamos por SMS al +56 9 •••• 5678.</span>
            <CodeInput
                value={code}
                onChange={(next) => {
                    setCode(next);
                    setError(undefined);
                    setListo(false);
                }}
                onComplete={verificar}
                loading={verifying}
                disabled={intentos === 0}
                error={error}
                help={
                    intentos === 0
                        ? 'Demasiados intentos. Pide un código nuevo en 5 min.'
                        : listo
                          ? 'Código correcto.'
                          : undefined
                }
                resendIn={resendIn}
                onResend={() => {
                    setCode('');
                    setError(undefined);
                    setIntentos(3);
                    restart(45);
                }}
            />
            <DemoLabel>Toca las casillas y escribe: un solo campo real con autocompletar del SMS. Prueba con 482910.</DemoLabel>
        </>
    );
}

const demo: DemoModule = {
    name: 'CodeInput',
    group: 'Campos',
    summary:
        'Código de 6 dígitos del correo (AUTH-03) y del teléfono (AUTH-08): 6 casillas y un solo campo real con autocompletar del SMS. Se verifica solo al completar.',
    Demo: () => (
        <>
            <DemoSection title="AUTH-08 · Código del teléfono (también AUTH-03, código del correo)">
                <CodigoTelefono />
            </DemoSection>
            <DemoSection title="Default">
                <CodeInput className="is-focus" defaultValue="482" />
            </DemoSection>
            <DemoSection title="Presionado">
                <NoAplica>Tocar enfoca el campo y abre el teclado numérico.</NoAplica>
            </DemoSection>
            <DemoSection title="Foco">
                <CodeInput className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <CodeInput defaultValue="482910" help="Código completo: se verifica solo, sin botón." />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <CodeInput
                    disabled
                    help="Demasiados intentos. Pide un código nuevo en 5 min."
                    resendIn={299}
                    onResend={() => undefined}
                />
            </DemoSection>
            <DemoSection title="Error">
                <CodeInput
                    defaultValue="482917"
                    error="El código no es correcto. Te quedan 2 intentos."
                    onResend={() => undefined}
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <CodeInput defaultValue="482910" loading />
            </DemoSection>
        </>
    ),
};

export default demo;
