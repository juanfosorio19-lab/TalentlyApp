import {
    useCallback,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    type ComponentPropsWithRef,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { Banner } from '../Banner';
import { cx } from '../cx';
import { IconAttach, IconSend } from '../icons';
import { IconButton } from '../IconButton';
import { describedBy } from '../TextField';
import { hasContactInfo } from './contactInfo';

/** Props extra de un botón de la barra (catálogo: `className="is-pressed"` / `"is-focus"`). */
export type ComposerButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'type' | 'onClick' | 'disabled' | 'aria-label'>;

export interface ComposerProps
    extends Omit<ComponentPropsWithRef<'textarea'>, 'children' | 'value' | 'defaultValue' | 'onChange' | 'className'> {
    /** Lo escrito. Controlado: la pantalla guarda el borrador. */
    value: string;
    onChange: (next: string) => void;
    /**
     * Solo con el botón «Enviar» (Enter hace un salto de línea, también en
     * el teclado del teléfono). Recibe el texto sin espacios en los extremos;
     * la pantalla lo vacía con `onChange('')` cuando corresponde.
     */
    onSend: (text: string) => void;
    /**
     * Abre la hoja de adjuntar («Tomar foto», «Elegir de la galería»,
     * «Compartir un documento»; para quien trabaja, después del match, primero
     * «Compartir certificado de antecedentes»). Sin handler no hay botón.
     */
    onAttach?: () => void;
    /** Mientras se envía: «Enviar» con spinner y sin poder repetirse. El texto se mantiene. */
    sending?: boolean;
    /**
     * Conversación cerrada: la barra se reemplaza por esta línea con el motivo
     * («Esta conversación se cerró porque el turno terminó.»).
     */
    closedReason?: ReactNode;
    /**
     * Otro aviso sobre la barra, en el mismo lugar que el de seguridad: el
     * Banner info «Compartirlo es voluntario.» cuando la otra parte pide el
     * certificado por texto. Si se escribe un teléfono o un enlace, manda el
     * aviso de seguridad.
     */
    notice?: ReactNode;
    /** Nombre del campo para lectores de pantalla. */
    label?: string;
    /** Va en la raíz `.tl-composer` (catálogo: `is-focus`). El resto de las props van al `textarea`. */
    className?: string;
    sendProps?: ComposerButtonProps;
    attachProps?: ComposerButtonProps;
}

const SAFETY_NOTICE = 'Por tu seguridad, mantén la conversación en Talently.';

/**
 * Barra para escribir en el chat, fija abajo en lugar de la TabBar:
 * adjuntar (`IconAttach`), campo pill que crece hasta 4 líneas y «Enviar»
 * (`IconSend`, relleno de marca, deshabilitado con el campo vacío). Al
 * escribir un teléfono o un enlace aparece encima el Banner warning
 * «Por tu seguridad, mantén la conversación en Talently.»: avisa y no
 * bloquea, y se va al borrar el número o el enlace.
 */
export function Composer({
    value,
    onChange,
    onSend,
    onAttach,
    sending,
    closedReason,
    notice,
    label = 'Mensaje',
    placeholder = 'Escribe un mensaje',
    rows = 1,
    className,
    sendProps,
    attachProps,
    ref,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: ComposerProps) {
    const noticeId = useId();
    const fieldRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => fieldRef.current as HTMLTextAreaElement);

    // Crece con el texto: el alto sale del contenido; bundle.css lo topa en 4 líneas (96) y desde ahí desplaza.
    const fit = useCallback(() => {
        const field = fieldRef.current;
        if (!field) return;
        field.style.height = 'auto';
        field.style.height = `${field.scrollHeight}px`;
    }, []);
    useLayoutEffect(() => fit(), [fit, value, closedReason]);
    useLayoutEffect(() => {
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [fit]);

    if (closedReason) {
        return (
            <div className={cx('tl-composer', className)}>
                <p className="tl-composer__closed">{closedReason}</p>
            </div>
        );
    }

    const text = value.trim();
    const shownNotice = hasContactInfo(value) ? <Banner tone="warning">{SAFETY_NOTICE}</Banner> : notice;

    const send = () => {
        if (!text || sending) return;
        onSend(text);
        // Con teclado, el foco estaba en «Enviar», que se deshabilita al vaciar el campo: vuelve al campo.
        fieldRef.current?.focus({ preventScroll: true });
    };

    // Al tocar «Enviar» el foco se queda en el campo: el teclado del teléfono no se cierra.
    const keepFocus = (e: MouseEvent<HTMLButtonElement>) => {
        sendProps?.onMouseDown?.(e);
        e.preventDefault();
    };

    return (
        <>
            {shownNotice && (
                <div className="tl-composer__notice" id={noticeId}>
                    {shownNotice}
                </div>
            )}
            <div className={cx('tl-composer', className)}>
                {onAttach && <IconButton icon={IconAttach} label="Adjuntar" onClick={onAttach} {...attachProps} />}
                <label className="tl-composer__field">
                    <span className="tl-vh">{label}</span>
                    <textarea
                        ref={fieldRef}
                        className="tl-composer__input"
                        rows={rows}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        aria-describedby={describedBy(shownNotice ? noticeId : undefined, ariaDescribedBy)}
                        {...rest}
                    />
                </label>
                <IconButton
                    icon={IconSend}
                    label={sending ? 'Enviando…' : 'Enviar'}
                    {...sendProps}
                    className={cx('tl-composer__send', sendProps?.className)}
                    disabled={!text}
                    loading={sending}
                    onMouseDown={keepFocus}
                    onClick={send}
                />
            </div>
        </>
    );
}
