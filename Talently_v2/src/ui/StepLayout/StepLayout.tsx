import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ComponentPropsWithRef,
    type MouseEventHandler,
    type ReactNode,
} from 'react';
import { cx } from '../cx';
import { IconMore } from '../icons';
import { AppBar } from '../AppBar';
import { Button } from '../Button';
import { CtaBar } from '../CtaBar';
import { IconButton } from '../IconButton';

export interface StepLayoutProgress {
    /** Paso actual, desde 1. */
    step: number;
    /** Total de pasos del asistente. */
    total: number;
}

interface StepLayoutBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
    /** H1 del paso, en imperativo o pregunta («¿En qué quieres trabajar?», «Agrega una foto de perfil»). */
    title: ReactNode;
    /** Body-L en `color-text-2` bajo el título. */
    subtitle?: ReactNode;
    /** El contenido del paso (ChipGroup, campos, MediaUploader…). */
    children?: ReactNode;
    /** BackButton = paso anterior (o salir, con su confirmación). La app pasa `useGoBack()` o su propio paso atrás. */
    onBack: () => void;
    backLabel?: string;
    /** CTA fijo «Continuar» (primary lg). */
    onContinue: MouseEventHandler<HTMLButtonElement>;
    continueLabel?: string;
    /** Mientras falte algo obligatorio; el paso dice qué falta. */
    continueDisabled?: boolean;
    /** Guardando el paso. */
    continueLoading?: boolean;
    continueLoadingLabel?: string;
    /** Paso opcional: «Omitir» como Button ghost aparte, debajo de «Continuar». */
    onSkip?: MouseEventHandler<HTMLButtonElement>;
    skipLabel?: string;
    /** Encima del CTA, dentro de la barra: el Snackbar estático si guardar falla («No pudimos guardar este paso»). */
    notice?: ReactNode;
    /** Al entrar a un paso, el foco va al H1 (por defecto). `false` en el catálogo. */
    focusTitle?: boolean;
}

/** Asistente (onboarding, publicar, reservar): «Paso X de N», barra de progreso y menú ⋯. */
export interface StepLayoutWizardProps extends StepLayoutBaseProps {
    progress: StepLayoutProgress;
    /** ⋯ abre la hoja «Guardar y salir» · «Ayuda» (en el onboarding, también «Cerrar sesión» y «Eliminar cuenta»). */
    onMenu: MouseEventHandler<HTMLButtonElement>;
    menuLabel?: string;
}

/** Acceso (AUTH-02 a AUTH-06): la misma plantilla sin barra ni menú; el AppBar lleva solo el BackButton. */
export interface StepLayoutAccessProps extends StepLayoutBaseProps {
    progress?: undefined;
    onMenu?: undefined;
    menuLabel?: undefined;
}

export type StepLayoutProps = StepLayoutWizardProps | StepLayoutAccessProps;

/**
 * Plantilla de todo asistente: un paso por pantalla con AppBar standard,
 * barra de progreso de 4 px, H1 + subtítulo, contenido con scroll propio y
 * CTA fijo. Ocupa el alto de su contenedor (`height: 100%`). El AppBar gana
 * sombra cuando el contenido baja y el CTA, cuando hay contenido debajo.
 */
export function StepLayout({
    title,
    subtitle,
    children,
    onBack,
    backLabel,
    onContinue,
    continueLabel = 'Continuar',
    continueDisabled,
    continueLoading,
    continueLoadingLabel = 'Guardando…',
    onSkip,
    skipLabel = 'Omitir',
    notice,
    focusTitle = true,
    progress,
    onMenu,
    menuLabel = 'Más opciones',
    className,
    ...rest
}: StepLayoutProps) {
    const bodyRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [edges, setEdges] = useState({ scrolled: false, more: false });
    const step = progress?.step;

    // Sombra del AppBar (contenido arriba) y del CTA (contenido debajo).
    const measure = useCallback(() => {
        const el = bodyRef.current;
        if (!el) return;
        const scrolled = el.scrollTop > 4;
        const more = el.scrollHeight - el.scrollTop - el.clientHeight > 4;
        setEdges((prev) => (prev.scrolled === scrolled && prev.more === more ? prev : { scrolled, more }));
    }, []);

    useEffect(() => {
        const el = bodyRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        for (const child of Array.from(el.children)) observer.observe(child);
        return () => observer.disconnect();
    }, [measure, step]);

    // Al entrar a un paso, el foco va al título (sin mover el scroll).
    useEffect(() => {
        if (focusTitle) titleRef.current?.focus({ preventScroll: true });
    }, [focusTitle, step]);

    const label = progress ? `Paso ${progress.step} de ${progress.total}` : undefined;
    const percent = progress && progress.total > 0 ? Math.min(100, Math.max(0, (progress.step / progress.total) * 100)) : 0;

    return (
        <div className={cx('tl-steplayout', className)} {...rest}>
            <AppBar
                variant="standard"
                title={label}
                titleAs="p"
                onBack={onBack}
                backLabel={backLabel}
                scrolled={edges.scrolled}
                actions={
                    progress && <IconButton icon={IconMore} label={menuLabel} aria-haspopup="dialog" onClick={onMenu} />
                }
            />
            {progress && (
                <div
                    className="tl-progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    aria-valuenow={progress.step}
                    aria-label={label}
                >
                    <div className="tl-progress__bar" style={{ width: `${percent}%` }} />
                </div>
            )}
            <div ref={bodyRef} className="tl-steplayout__body" onScroll={measure}>
                <h1 ref={titleRef} className="tl-steplayout__title h1" tabIndex={-1}>
                    {title}
                </h1>
                {subtitle && <p className="tl-steplayout__sub">{subtitle}</p>}
                {children}
            </div>
            <CtaBar scrolled={edges.more}>
                {notice}
                <Button
                    size="lg"
                    block
                    disabled={continueDisabled}
                    loading={continueLoading}
                    loadingLabel={continueLoadingLabel}
                    onClick={onContinue}
                >
                    {continueLabel}
                </Button>
                {onSkip && (
                    <Button variant="ghost" block onClick={onSkip}>
                        {skipLabel}
                    </Button>
                )}
            </CtaBar>
        </div>
    );
}
