import { useId, useRef, type ComponentPropsWithRef, type RefObject } from 'react';
import { cx } from '../cx';
import {
    IconAdd,
    IconAlert,
    IconCamera,
    IconCheck,
    IconClose,
    IconDocument,
    IconInfo,
    IconPerson,
    IconTrash,
    IconUpload,
} from '../icons';
import { Avatar } from '../Avatar';
import { Badge, type BadgeStatus } from '../Badge';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Stack } from '../Layout';
import { Spinner } from '../Spinner';

/* -------------------------------------------------------------------------
   Archivo real: un <input type="file"> oculto detrás de un botón real. Este
   componente no sube nada: entrega los archivos elegidos con `onSelect` y la
   pantalla informa el avance y el resultado por props.
   ------------------------------------------------------------------------- */

interface HiddenFileInputProps {
    ref: RefObject<HTMLInputElement | null>;
    accept: string;
    /** Abre la cámara directo: trasera (`environment`) o frontal (`user`). */
    capture?: 'user' | 'environment';
    multiple?: boolean;
    onSelect: (files: File[]) => void;
}

function HiddenFileInput({ ref, accept, capture, multiple, onSelect }: HiddenFileInputProps) {
    return (
        <input
            ref={ref}
            type="file"
            hidden
            tabIndex={-1}
            accept={accept}
            capture={capture}
            multiple={multiple}
            onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? []);
                // Vacía el input para que elegir otra vez el mismo archivo vuelva a avisar.
                e.currentTarget.value = '';
                if (files.length > 0) onSelect(files);
            }}
        />
    );
}

export interface UploadActionsProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> {
    /** Los archivos elegidos o la foto tomada. */
    onSelect: (files: File[]) => void;
    /** Tipos que acepta «Elegir…» («image/*», o «image/*,application/pdf» en documentos). La cámara siempre toma una imagen. */
    accept?: string;
    /** Cámara que abre «Tomar foto»: trasera para documentos, frontal para la selfie y el avatar. */
    capture?: 'user' | 'environment';
    multiple?: boolean;
    /** «Tomar foto» (o «Tomar selfie»). */
    takeLabel?: string;
    /** «Elegir de la galería», o «Elegir archivo» para documentos (pueden ser PDF). */
    chooseLabel?: string;
    /** Con ícono de cámara y de subir (documento). */
    icons?: boolean;
    disabled?: boolean;
}

/**
 * Los dos botones reales del MediaUploader (`.tl-upload-actions`), siempre
 * outline: «Tomar foto» abre la cámara y «Elegir de la galería» (o «Elegir
 * archivo») abre el selector del teléfono.
 */
export function UploadActions({
    onSelect,
    accept = 'image/*',
    capture = 'environment',
    multiple,
    takeLabel = 'Tomar foto',
    chooseLabel = 'Elegir de la galería',
    icons,
    disabled,
    className,
    ...rest
}: UploadActionsProps) {
    const takeRef = useRef<HTMLInputElement>(null);
    const chooseRef = useRef<HTMLInputElement>(null);
    return (
        <div className={cx('tl-upload-actions', className)} {...rest}>
            <Button variant="outline" icon={icons ? IconCamera : undefined} disabled={disabled} onClick={() => takeRef.current?.click()}>
                {takeLabel}
            </Button>
            <Button variant="outline" icon={icons ? IconUpload : undefined} disabled={disabled} onClick={() => chooseRef.current?.click()}>
                {chooseLabel}
            </Button>
            <HiddenFileInput ref={takeRef} accept="image/*" capture={capture} onSelect={onSelect} />
            <HiddenFileInput ref={chooseRef} accept={accept} multiple={multiple} onSelect={onSelect} />
        </div>
    );
}

/* ----------------------------------- Avatar y logo ----------------------------------- */

export interface MediaUploaderAvatarProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> {
    /** `avatar`: persona, círculo de 96. `logo`: organización, cuadrado de 96 con `radius-md` (M3). */
    variant: 'avatar' | 'logo';
    /** Nombre de la persona u organización: las iniciales del logo vacío («BR») y el texto de la foto. */
    name: string;
    /** Foto o logo actual (URL). `true` = marcador rayado de los mockups (catálogo). */
    photo?: string | true | null;
    /** Subiendo: velo `color-scrim` con spinner de 40. */
    uploading?: boolean;
    onSelect: (files: File[]) => void;
    /** «Tomar foto» y «Elegir de la galería» debajo. Por defecto, sí. */
    actions?: boolean;
    disabled?: boolean;
}

/* ----------------------------------- Documento ----------------------------------- */

export type DocumentUploadState = 'empty' | 'uploading' | 'uploaded' | 'error';

export interface MediaUploaderDocumentProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect' | 'title'> {
    variant: 'document';
    /** Nombre de la credencial o documento: «Credencial SPD (ex OS-10)», «Tu CV». */
    title: string;
    state: DocumentUploadState;
    /** Exigencia, en vacío: «Obligatoria» (warning) o «Recomendado» (neutral). */
    requirement?: 'Obligatoria' | 'Recomendado';
    /** Formatos admitidos, en vacío: «Foto o PDF, hasta 10 MB». */
    formats?: string;
    /** Tipos para «Elegir archivo». */
    accept?: string;
    /** Nombre del archivo («credencial-spd.pdf»). Subido sin archivo propio, se muestra el título. */
    fileName?: string;
    /** Subiendo: porcentaje real, 0 a 100. */
    progress?: number;
    /** Subido: peso («320 KB»). */
    size?: string;
    /** Subido: Badge del diccionario («En revisión», «Verificada», «Vencida»). */
    status?: BadgeStatus;
    /** Subido: dato extra tras la Badge («Vence 03/2028»). */
    note?: string;
    /** Error: el motivo, en humano («Pesa 14 MB. Elige uno de hasta 10 MB.»). */
    error?: string;
    onSelect: (files: File[]) => void;
    /** Subiendo: «Cancelar subida». */
    onCancel?: () => void;
    /** Subido: el basurero «Quitar archivo». */
    onRemove?: () => void;
}

/* ----------------------------------- Galería ----------------------------------- */

export interface GalleryPhoto {
    id: string;
    /**
     * URL de la foto. Sin ella (catálogo), un recuadro rotulado. Brecha:
     * bundle.css aún no ajusta una foto real al recuadro
     * (`.tl-gallery__item > img`); hasta que llegue, ninguna pantalla usa la
     * galería con fotos reales.
     */
    src?: string;
    /** Nombre corto para el lector de pantalla y el rótulo del mockup: «Foto 1». */
    label?: string;
}

export interface MediaUploaderGalleryProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> {
    variant: 'gallery';
    /** «Fotos de tus trabajos». */
    label: string;
    /** Agrega «(opcional)» a la etiqueta. */
    optional?: boolean;
    photos: readonly GalleryPhoto[];
    /** Máximo: 8 en el perfil de servicios (PUBL-06), 5 en SRV-01. */
    max?: number;
    /** Fotos elegidas con «Agregar» (ya recortadas a las que caben). */
    onSelect: (files: File[]) => void;
    /** Tocar una foto abre la hoja «Ver», «Cambiar» y «Quitar foto». */
    onOpenPhoto: (photo: GalleryPhoto, index: number) => void;
    /** Aviso al llegar al máximo. Por defecto: «Llegaste al máximo de 8 fotos. Toca una para cambiarla o quitarla.». */
    maxNote?: string;
    /**
     * Mientras se guarda: sin «Agregar», como llena. No hay `disabled`:
     * bundle.css no tiene estilo deshabilitado para la galería (brecha) y se
     * vería igual que activa.
     */
    saving?: boolean;
}

export type MediaUploaderProps = MediaUploaderAvatarProps | MediaUploaderDocumentProps | MediaUploaderGalleryProps;

/**
 * Para subir fotos y documentos: avatar (o logo cuadrado de una
 * organización), documento con progreso y estados, y galería de hasta 8.
 * Siempre con botones reales; nunca sube por su cuenta: emite `onSelect`.
 */
export function MediaUploader(props: MediaUploaderProps) {
    switch (props.variant) {
        case 'document':
            return <DocumentUploader {...props} />;
        case 'gallery':
            return <GalleryUploader {...props} />;
        default:
            return <AvatarUploader {...props} />;
    }
}

function AvatarUploader({
    variant,
    name,
    photo,
    uploading,
    onSelect,
    actions = true,
    disabled,
    className,
    ...rest
}: MediaUploaderAvatarProps) {
    const chooseRef = useRef<HTMLInputElement>(null);
    const org = variant === 'logo';
    const what = org ? 'logo' : 'foto';
    const has = photo !== undefined && photo !== null;

    return (
        <Stack gap={4} className={className} {...rest}>
            <span className={cx('tl-upload-avatar', org && 'tl-upload-avatar--org')} aria-busy={uploading || undefined}>
                {has ? (
                    <Avatar name={name} kind={org ? 'org' : 'person'} size={96} photo={photo} />
                ) : org ? (
                    // Sin logo: el Avatar de organización con iniciales, que es lo que verán los demás.
                    <Avatar name={name} kind="org" size={96} />
                ) : (
                    <span className="tl-upload-avatar__ph">
                        <IconPerson />
                    </span>
                )}
                {uploading ? (
                    <span className="tl-upload-avatar__busy">
                        <Spinner size={40} />
                    </span>
                ) : (
                    <IconButton
                        variant="tonal"
                        icon={IconCamera}
                        label={`${has ? 'Cambiar' : 'Agregar'} ${what}`}
                        disabled={disabled}
                        onClick={() => chooseRef.current?.click()}
                    />
                )}
                <span className="tl-vh" role="status">{uploading ? `Subiendo ${what}…` : ''}</span>
                <HiddenFileInput ref={chooseRef} accept="image/*" onSelect={onSelect} />
            </span>
            {actions && <UploadActions onSelect={onSelect} capture={org ? 'environment' : 'user'} disabled={disabled || uploading} />}
        </Stack>
    );
}

function DocumentUploader({
    variant,
    title,
    state,
    requirement,
    formats,
    accept = 'image/*,application/pdf',
    fileName,
    progress = 0,
    size,
    status,
    note,
    error,
    onSelect,
    onCancel,
    onRemove,
    className,
    ...rest
}: MediaUploaderDocumentProps) {
    const chooseRef = useRef<HTMLInputElement>(null);
    void variant; // se saca de `rest` para que no llegue al DOM

    if (state === 'empty') {
        return (
            <div className={cx('tl-doc tl-doc--empty', className)} {...rest}>
                <div className="tl-doc__body">
                    <span className="tl-doc__name">{title}</span>
                    {(requirement || formats) && (
                        <span className="tl-doc__meta">
                            {requirement && <Badge status={requirement} />}
                            {formats}
                        </span>
                    )}
                </div>
                <UploadActions onSelect={onSelect} accept={accept} chooseLabel="Elegir archivo" icons />
            </div>
        );
    }

    const pct = Math.max(0, Math.min(100, Math.round(progress)));
    const name = fileName ?? title;
    return (
        <div
            className={cx('tl-doc', state === 'error' && 'tl-doc--error', className)}
            aria-busy={state === 'uploading' || undefined}
            {...rest}
        >
            <span className="tl-listitem__tile">
                <IconDocument />
            </span>
            <div className="tl-doc__body">
                <span className="tl-doc__name">{name}</span>
                {state === 'uploading' && (
                    <>
                        <div
                            className="tl-progress"
                            role="progressbar"
                            aria-label={`Subiendo ${name}`}
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            {/* Ancho calculado: el porcentaje real de la subida. */}
                            <div className="tl-progress__bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="tl-doc__meta">Subiendo… {pct}{' '}%</span>
                    </>
                )}
                {state === 'uploaded' && (size || status || note) && (
                    <span className="tl-doc__meta">
                        {size}
                        {status && <Badge status={status} />}
                        {note}
                    </span>
                )}
                {state === 'error' && (
                    <span className="tl-doc__meta" role="alert">
                        <IconAlert size={16} />
                        <span>{error}</span>
                    </span>
                )}
            </div>
            {state === 'uploading' && onCancel && <IconButton icon={IconClose} label="Cancelar subida" onClick={onCancel} />}
            {state === 'uploaded' && onRemove && <IconButton icon={IconTrash} label="Quitar archivo" onClick={onRemove} />}
            {state === 'error' && (
                <>
                    <Button variant="ghost" size="sm" onClick={() => chooseRef.current?.click()}>
                        Elegir otro
                    </Button>
                    <HiddenFileInput ref={chooseRef} accept={accept} onSelect={onSelect} />
                </>
            )}
        </div>
    );
}

function GalleryUploader({
    variant,
    label,
    optional,
    photos,
    max = 8,
    onSelect,
    onOpenPhoto,
    maxNote,
    saving,
    className,
    ...rest
}: MediaUploaderGalleryProps) {
    const labelId = useId();
    const noteId = useId();
    const addRef = useRef<HTMLInputElement>(null);
    const full = photos.length >= max;
    void variant; // se saca de `rest` para que no llegue al DOM

    return (
        // `tl-chipgroup is-max`: el contador y el aviso del máximo en warning, como en ChipGroup.
        <div
            className={cx('tl-chipgroup', full && 'is-max', className)}
            role="group"
            aria-labelledby={labelId}
            aria-describedby={full ? noteId : undefined}
            aria-busy={saving || undefined}
            {...rest}
        >
            <div className="tl-chipgroup__head">
                <span className="tl-chipgroup__label" id={labelId}>
                    {label}
                    {optional && (
                        <>
                            {' '}
                            <span className="tl-field__opt">(opcional)</span>
                        </>
                    )}
                </span>
                <span className="tl-chipgroup__count" aria-live="polite">
                    {photos.length} de {max}
                </span>
            </div>
            <div className="tl-gallery">
                {photos.map((p, i) => {
                    const name = p.label ?? `Foto ${i + 1}`;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            className="tl-gallery__item"
                            aria-label={`${name}, opciones`}
                            aria-haspopup="dialog"
                            onClick={() => onOpenPhoto(p, i)}
                        >
                            {p.src ? <img src={p.src} alt="" /> : <span>{name}</span>}
                        </button>
                    );
                })}
                {!full && !saving && (
                    <button
                        type="button"
                        className="tl-gallery__add"
                        aria-label="Agregar fotos"
                        onClick={() => addRef.current?.click()}
                    >
                        <IconAdd />
                        Agregar
                    </button>
                )}
            </div>
            {full && (
                <div className="tl-chipgroup__note tl-chipgroup__note--max" id={noteId}>
                    <IconAlert size={16} />
                    <span>{maxNote ?? `Llegaste al máximo de ${max} fotos. Toca una para cambiarla o quitarla.`}</span>
                </div>
            )}
            <HiddenFileInput
                ref={addRef}
                accept="image/*"
                multiple
                onSelect={(files) => onSelect(files.slice(0, Math.max(0, max - photos.length)))}
            />
        </div>
    );
}

/* ----------------------------------- Cámara (M8) ----------------------------------- */

export type MediaCaptureState = 'ready' | 'ok' | 'error';

const HINT_ICON = { ready: IconInfo, ok: IconCheck, error: IconAlert } as const;

export interface MediaCaptureProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> {
    /** `document`: rectángulo de cédula (85,6 × 54). `face`: óvalo para la selfie. */
    guide?: 'document' | 'face';
    /** Lista (guía `color-primary-text`), bien encuadrada (success) o con problema (danger, con el motivo). */
    state?: MediaCaptureState;
    /** Indicación en la píldora: «Centra la cédula», «Bien, no te muevas», «La foto salió borrosa». */
    hint: string;
    /** Texto dentro de la guía. Por defecto «Tu cédula aquí» o «Tu cara aquí». */
    guideLabel?: string;
    /**
     * La foto tomada (URL). `true` = recuadro rotulado de los mockups. Brecha:
     * bundle.css aún no ajusta una foto real al marco (`.tl-capture__shot > img`);
     * hasta que llegue, VER-02 no muestra la foto real aquí.
     */
    shot?: string | true | null;
    /** Con esta prop, debajo van «Tomar foto» (o «Tomar selfie») y «Elegir de la galería». */
    onSelect?: (files: File[]) => void;
}

/**
 * Vista de la cámara con guía de encuadre (`.tl-capture`, VER-02): marco de
 * cédula u óvalo de la cara, velo `color-scrim` alrededor y una indicación en
 * píldora. La foto se toma siempre con Buttons reales.
 */
export function MediaCapture({
    guide = 'document',
    state = 'ready',
    hint,
    guideLabel,
    shot,
    onSelect,
    className,
    ...rest
}: MediaCaptureProps) {
    const face = guide === 'face';
    const HintIcon = HINT_ICON[state];
    const stateClass = cx(state === 'ok' && 'is-ok', state === 'error' && 'is-error');
    const inner = (
        <>
            <span className={cx('tl-capture__guide', face && 'tl-capture__guide--face')}>
                {shot ? (
                    <span className="tl-capture__shot">
                        {shot === true ? <span>Tu foto</span> : <img src={shot} alt="Foto tomada" />}
                    </span>
                ) : (
                    (guideLabel ?? (face ? 'Tu cara aquí' : 'Tu cédula aquí'))
                )}
            </span>
            <span className="tl-capture__hint" role="status">
                <HintIcon />
                {hint}
            </span>
        </>
    );

    if (!onSelect) {
        return (
            <div className={cx('tl-capture', stateClass, className)} {...rest}>
                {inner}
            </div>
        );
    }
    return (
        <Stack gap={4} className={className} {...rest}>
            <div className={cx('tl-capture', stateClass)}>{inner}</div>
            <UploadActions
                onSelect={onSelect}
                capture={face ? 'user' : 'environment'}
                takeLabel={face ? 'Tomar selfie' : 'Tomar foto'}
            />
        </Stack>
    );
}

/* ----------------------------------- Ejemplo visual (M8) ----------------------------------- */

/** Cédula por delante, por detrás (QR y tres líneas), credencial con banda, o selfie. */
export type DocSampleVariant = 'front' | 'back' | 'credential' | 'face';

export interface DocSampleProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    variant: DocSampleVariant;
    /** Líneas que deben leerse (índice desde 0), en `color-primary-subtle` con borde `color-primary-text`. */
    marks?: readonly number[];
    /** Si va sin rótulo al lado: lo anuncia como imagen («Ejemplo: credencial SPD»). Sin él, es decorativo. */
    label?: string;
}

const LINES: Record<Exclude<DocSampleVariant, 'face'>, number> = { front: 4, back: 3, credential: 4 };

/**
 * Esquema de un documento hecho con tokens (`.tl-docsample`, VER-02 y VER-03):
 * nunca una foto ni datos de verdad.
 */
export function DocSample({ variant, marks = [], label, className, ...rest }: DocSampleProps) {
    const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
    const lines = (n: number) => (
        <span className="tl-docsample__lines">
            {Array.from({ length: n }, (_, i) => (
                <i key={i} className={cx(marks.includes(i) && 'is-mark')} />
            ))}
        </span>
    );
    const photo = (
        <span className="tl-docsample__photo">
            <IconPerson />
        </span>
    );

    if (variant === 'face') {
        return (
            <div className={cx('tl-docsample tl-docsample--face', className)} {...a11y} {...rest}>
                <IconPerson />
            </div>
        );
    }
    return (
        <div
            className={cx('tl-docsample', variant !== 'front' && `tl-docsample--${variant}`, className)}
            {...a11y}
            {...rest}
        >
            {variant === 'credential' && <span className="tl-docsample__band" />}
            {variant !== 'back' && photo}
            {lines(LINES[variant])}
            {variant === 'back' && (
                <>
                    <span className="tl-docsample__qr" />
                    <span className="tl-docsample__mrz">
                        <i />
                        <i />
                        <i />
                    </span>
                </>
            )}
        </div>
    );
}

export interface DocSampleListProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
    /** Hasta 3 juntos, cada uno con su rótulo («Cédula por delante», «Cédula por detrás», «Una selfie»). */
    items: readonly { variant: DocSampleVariant; label: string; marks?: readonly number[] }[];
}

/** Ejemplos juntos (`.tl-docsamples`), cada uno con su rótulo debajo. */
export function DocSampleList({ items, className, ...rest }: DocSampleListProps) {
    return (
        <ul className={cx('tl-docsamples', className)} {...rest}>
            {items.map((it) => (
                <li key={`${it.variant}-${it.label}`}>
                    <DocSample variant={it.variant} marks={it.marks} />
                    {it.label}
                </li>
            ))}
        </ul>
    );
}
