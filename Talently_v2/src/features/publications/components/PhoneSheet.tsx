// AUTH-08 · Verificar teléfono (`?sheet=telefono`): hoja antes del
// primer acto transaccional (tomar un turno, postular). Paso 1: número y canal
// (SMS o WhatsApp) → «Enviar código». Paso 2: CodeInput de 6 dígitos que se
// verifica solo al completarse, «Reenviar código (en 0:45)» con cuenta
// regresiva real y «Cambiar número». Mientras Supabase está pausado no se
// envía ningún SMS: el código que se escriba se acepta.
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { CodeInput, formatCountdown, useCountdown } from '../../../ui/CodeInput';
import { cx } from '../../../ui/cx';
import { RadioGroup } from '../../../ui/Radio';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../../../ui/TextField';
import { copy } from '../copy';
import { DEMO_LATENCY_MS } from '../mock';
import { PHONE_DIGITS, caretAfterDigits, digitsBefore, groupPhone, nextPhone } from '../phone';
import { useLater } from './useLater';
import '../publications.css';

export const screenId = 'AUTH-08';

const RESEND_SECONDS = 45;

type Channel = 'sms' | 'whatsapp';

/**
 * Celular chileno con el «+56 9» fijo delante (TextField aún no trae prefijo:
 * pedido en «requests»). Mismo marcado `.tl-field` que el resto de los campos.
 */
function PhoneField({
    value,
    onChange,
    error,
    inputRef,
}: {
    value: string;
    onChange: (digits: string) => void;
    error?: ReactNode;
    inputRef: RefObject<HTMLInputElement | null>;
}) {
    const id = useId();
    const helpId = `${id}-h`;
    const errorId = `${id}-e`;
    const isError = hasFieldError(error);
    // El campo se vuelve a agrupar en cada cambio y React deja el cursor al final: se lleva de vuelta a
    // después del mismo dígito, así corregir uno en medio no manda lo siguiente al final del número.
    const caretDigits = useRef<number | null>(null);
    const placeCaret = () => {
        const n = caretDigits.current;
        caretDigits.current = null;
        const el = inputRef.current;
        if (n === null || !el || document.activeElement !== el) return;
        const pos = caretAfterDigits(el.value, n);
        el.setSelectionRange(pos, pos);
    };
    useLayoutEffect(placeCaret);
    return (
        <div className={cx('tl-field', isError && 'is-error')}>
            <FieldLabel htmlFor={id}>{copy.phone.label}</FieldLabel>
            <div className="tl-field__control">
                <span className="tl-field__affix" aria-hidden="true">
                    {copy.phone.prefix}
                </span>
                <input
                    ref={inputRef}
                    className="tl-field__input"
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={groupPhone(value)}
                    // Pegado como venga («+56 9 1234 5678»): quedan los 8 dígitos (phone.ts).
                    onChange={(e) => {
                        const { value: raw, selectionStart } = e.target;
                        caretDigits.current = digitsBefore(raw, selectionStart);
                        const next = nextPhone(value, raw);
                        onChange(next);
                        // Sin cambio (una letra, un dígito de más) no se vuelve a pintar: React repone el valor
                        // al terminar el evento y el cursor se ubica después.
                        if (next === value) queueMicrotask(placeCaret);
                    }}
                    aria-invalid={isError || undefined}
                    aria-describedby={describedBy(isError ? errorId : helpId)}
                />
            </div>
            <FieldFoot helpId={helpId} errorId={errorId} help={copy.phone.help} error={error} />
        </div>
    );
}

export interface PhoneSheetProps {
    open: boolean;
    /** `hide` de useSheet('telefono'). */
    onClose: () => void;
    /** Para qué se pide: cambia la primera frase («Para tomar turnos…» o «Para postular…»). */
    purpose: 'turno' | 'empleo';
    /** El código se verificó: quien abrió la hoja sigue con lo que la persona quería hacer. */
    onVerified: () => void;
}

/**
 * La hoja parte de cero cada vez que se abre: el detalle le pone una `key`
 * nueva al abrirla (así el número y la cuenta regresiva no quedan de antes,
 * aunque se haya cerrado con el atrás del navegador).
 */
export function PhoneSheet({ open, onClose, purpose, onVerified }: PhoneSheetProps) {
    const later = useLater();
    const [step, setStep] = useState<'numero' | 'codigo'>('numero');
    const [phone, setPhone] = useState('');
    const [channel, setChannel] = useState<Channel>('sms');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const phoneRef = useRef<HTMLInputElement>(null);
    // «Cambiar número» se va con el paso 2: el foco vuelve al número, no al body.
    const refocusPhone = useRef(false);
    useEffect(() => {
        if (step !== 'numero' || !refocusPhone.current) return;
        refocusPhone.current = false;
        phoneRef.current?.focus();
    }, [step]);

    const send = () => {
        if (phone.length !== PHONE_DIGITS) {
            // Como REV-01, el foco va al campo con el error; ya pintado, así el lector de pantalla lo lee
            // con el campo (aria-invalid + aria-describedby) y no se queda en «Enviar código».
            flushSync(() => setPhoneError(copy.phone.invalid));
            phoneRef.current?.focus();
            return;
        }
        setPhoneError(null);
        setSending(true);
        later(() => {
            setSending(false);
            setStep('codigo');
        }, DEMO_LATENCY_MS);
    };

    if (step === 'codigo') {
        return (
            <BottomSheet open={open} onClose={onClose} title={copy.phone.codeTitle} className="pub-sheet">
                <CodeStep
                    channel={channel}
                    last4={phone.slice(-4)}
                    onChangeNumber={() => {
                        refocusPhone.current = true;
                        setStep('numero');
                    }}
                    onVerified={onVerified}
                />
            </BottomSheet>
        );
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.phone.title}
            className="pub-sheet"
            footer={
                <Button size="lg" block loading={sending} loadingLabel={copy.phone.sending} onClick={send}>
                    {copy.phone.send}
                </Button>
            }
        >
            <p className="body pub-muted pub-phone-intro">{purpose === 'turno' ? copy.phone.introShift : copy.phone.introJob}</p>
            <PhoneField
                inputRef={phoneRef}
                value={phone}
                onChange={(d) => {
                    setPhone(d);
                    if (phoneError && d.length === PHONE_DIGITS) setPhoneError(null);
                }}
                error={phoneError ?? undefined}
            />
            <RadioGroup
                className="pub-phone-channel"
                legend={copy.phone.channel}
                options={[
                    { value: 'sms', label: copy.phone.sms },
                    { value: 'whatsapp', label: copy.phone.whatsapp },
                ]}
                value={channel}
                onChange={setChannel}
            />
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
        }, DEMO_LATENCY_MS);
    };

    return (
        <>
            <p className="body pub-muted pub-phone-intro">{copy.phone.sentTo(channel, last4)}</p>
            <CodeInput value={code} onChange={setCode} onComplete={verify} loading={verifying} autoFocus />
            <div className="pub-code-actions">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={left > 0 || verifying}
                    onClick={() => {
                        setCode('');
                        restart();
                    }}
                >
                    {left > 0 ? copy.phone.resendIn(formatCountdown(left)) : copy.phone.resend}
                </Button>
                <Button variant="ghost" size="sm" disabled={verifying} onClick={onChangeNumber}>
                    {copy.phone.changeNumber}
                </Button>
            </div>
        </>
    );
}
