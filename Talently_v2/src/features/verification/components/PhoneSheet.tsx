// AUTH-08 · Verificar teléfono (`?sheet=telefono`), abierto desde «Verificar
// teléfono» de VER-01. Paso 1: número y canal (SMS o WhatsApp) → «Enviar
// código». Paso 2: CodeInput de 6 dígitos que se verifica solo al completarse,
// «Reenviar código (en 0:45)» con cuenta regresiva real y «Cambiar número».
// Mientras Supabase está pausado no se envía ningún SMS: el código que se
// escriba se acepta. La misma hoja vive en publications (DET-01); pedida en
// «requests» para src/app o src/ui, y entonces esta copia se borra.
import { useId, useState, type ReactNode } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { CodeInput, formatCountdown, useCountdown } from '../../../ui/CodeInput';
import { cx } from '../../../ui/cx';
import { Stack } from '../../../ui/Layout';
import { RadioGroup } from '../../../ui/Radio';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../../../ui/TextField';
import { COPY } from '../copy';
import { useLater } from './useLater';

export const screenId = 'AUTH-08';

const T = COPY.telefono;
const PHONE_DIGITS = 8;
const RESEND_SECONDS = 45;

type Channel = 'sms' | 'whatsapp';

const onlyDigits = (s: string) => s.replace(/\D/g, '').slice(0, PHONE_DIGITS);
/** «12345678» → «1234 5678». */
const groupPhone = (d: string) => (d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d);

/**
 * Celular chileno con el «+56 9» fijo delante (TextField aún no trae prefijo:
 * pedido en «requests»). Mismo marcado `.tl-field` que el resto de los campos.
 */
function PhoneField({ value, onChange, error }: { value: string; onChange: (digits: string) => void; error?: ReactNode }) {
    const id = useId();
    const helpId = `${id}-h`;
    const errorId = `${id}-e`;
    const isError = hasFieldError(error);
    return (
        <div className={cx('tl-field', isError && 'is-error')}>
            <FieldLabel htmlFor={id}>{T.label}</FieldLabel>
            <div className="tl-field__control">
                <span className="tl-field__affix" aria-hidden="true">
                    {T.prefijo}
                </span>
                <input
                    className="tl-field__input"
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={groupPhone(value)}
                    onChange={(e) => onChange(onlyDigits(e.target.value))}
                    aria-invalid={isError || undefined}
                    aria-describedby={describedBy(isError ? errorId : helpId)}
                />
            </div>
            <FieldFoot helpId={helpId} errorId={errorId} help={T.ayuda} error={error} />
        </div>
    );
}

export interface PhoneSheetProps {
    open: boolean;
    onClose: () => void;
    /** El código se verificó: quien abrió la hoja la cierra y guarda el teléfono en la sesión. */
    onVerified: () => void;
}

/**
 * Parte de cero cada vez que se abre: quien la usa le pone una `key` nueva al
 * abrirla (así el número y la cuenta regresiva no quedan de antes, aunque se
 * haya cerrado con el atrás del navegador).
 */
export function PhoneSheet({ open, onClose, onVerified }: PhoneSheetProps) {
    const later = useLater();
    const [step, setStep] = useState<'numero' | 'codigo'>('numero');
    const [phone, setPhone] = useState('');
    const [channel, setChannel] = useState<Channel>('sms');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const send = () => {
        if (phone.length !== PHONE_DIGITS) {
            setPhoneError(T.invalido);
            return;
        }
        setPhoneError(null);
        setSending(true);
        later(() => {
            setSending(false);
            setStep('codigo');
        });
    };

    if (step === 'codigo') {
        return (
            <BottomSheet open={open} onClose={onClose} title={T.codigoTitulo} className="ver-sheet">
                <CodeStep channel={channel} last4={phone.slice(-4)} onChangeNumber={() => setStep('numero')} onVerified={onVerified} />
            </BottomSheet>
        );
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={T.titulo}
            className="ver-sheet"
            footer={
                <Button size="lg" block loading={sending} loadingLabel={T.enviando} onClick={send}>
                    {T.enviar}
                </Button>
            }
        >
            <Stack gap={4}>
                <p className="body ver-muted ver-flush">{T.intro}</p>
                <PhoneField
                    value={phone}
                    onChange={(d) => {
                        setPhone(d);
                        if (phoneError && d.length === PHONE_DIGITS) setPhoneError(null);
                    }}
                    error={phoneError ?? undefined}
                />
                <RadioGroup
                    legend={T.canal}
                    options={[
                        { value: 'sms', label: T.sms },
                        { value: 'whatsapp', label: T.whatsapp },
                    ]}
                    value={channel}
                    onChange={setChannel}
                />
            </Stack>
        </BottomSheet>
    );
}

/** Paso 2: se monta al enviar el código, así la cuenta regresiva parte en ese momento. */
function CodeStep({
    channel,
    last4,
    onChangeNumber,
    onVerified,
}: {
    channel: Channel;
    last4: string;
    onChangeNumber: () => void;
    onVerified: () => void;
}) {
    const later = useLater();
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [left, restart] = useCountdown(RESEND_SECONDS);

    const verify = () => {
        setVerifying(true);
        later(() => {
            setVerifying(false);
            onVerified();
        });
    };

    return (
        <>
            <Stack gap={4}>
                <p className="body ver-muted ver-flush">{T.enviadoA(channel, last4)}</p>
                <CodeInput value={code} onChange={setCode} onComplete={verify} loading={verifying} autoFocus />
            </Stack>
            <div className="ver-code-actions">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={left > 0 || verifying}
                    onClick={() => {
                        setCode('');
                        restart();
                    }}
                >
                    {left > 0 ? T.reenviarEn(formatCountdown(left)) : T.reenviar}
                </Button>
                <Button variant="ghost" size="sm" disabled={verifying} onClick={onChangeNumber}>
                    {T.cambiarNumero}
                </Button>
            </div>
        </>
    );
}
