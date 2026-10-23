// El marco común de PUBL-03 y PUBL-04: StepLayout con «Paso X de 5», ⋯ con
// la hoja «Opciones», el Snackbar justo encima del CTA y el foco al primer
// campo con error cuando falta algo para continuar.
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { SnackbarOutlet } from '../../../ui/Snackbar';
import { StepLayout } from '../../../ui/StepLayout';
import { useGoBack } from '../../../app/BackButtonManager';
import { copy } from '../copy';
import { WIZARD_STEPS } from '../model/publisher';
import { BrowserBackGuard, type BackGuard } from './BrowserBackGuard';
import { WizardMenuSheet } from './WizardSheets';

/**
 * Lleva el foco al primer campo con error (o a su primer control) cada vez
 * que `tick` cambia: «Continuar» con algo pendiente dice qué falta y dónde.
 */
function useFocusFirstError(root: RefObject<HTMLElement | null>, tick: number) {
    useEffect(() => {
        if (tick === 0) return;
        const invalid = root.current?.querySelector<HTMLElement>('[aria-invalid="true"], .is-error');
        if (!invalid) return;
        const target = invalid.matches('input, button, textarea')
            ? invalid
            : invalid.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled]), textarea');
        target?.focus();
    }, [root, tick]);
}

export interface WizardShellProps {
    step: number;
    title: string;
    subtitle: string;
    onContinue: () => void;
    continueLabel?: string;
    /** Cambia cada vez que «Continuar» encuentra algo pendiente. */
    errorTick: number;
    menu: { open: boolean; show: () => void; hide: () => void };
    onSaveExit: () => void;
    onHelp: () => void;
    /** El atrás del navegador, detenido mientras hay algo que cuidar (useWizard). */
    backGuard: BackGuard;
    children: ReactNode;
    /** Hojas propias del paso (PUBL-04-identidad). */
    sheets?: ReactNode;
}

export function WizardShell({
    step,
    title,
    subtitle,
    onContinue,
    continueLabel,
    errorTick,
    menu,
    onSaveExit,
    onHelp,
    backGuard,
    children,
    sheets,
}: WizardShellProps) {
    const goBack = useGoBack();
    const root = useRef<HTMLDivElement>(null);
    useFocusFirstError(root, errorTick);
    return (
        <>
            <StepLayout
                ref={root}
                progress={{ step, total: WIZARD_STEPS }}
                title={title}
                subtitle={subtitle}
                onBack={goBack}
                onMenu={() => menu.show()}
                menuLabel={copy.menu.titulo}
                onContinue={onContinue}
                continueLabel={continueLabel}
                notice={<SnackbarOutlet />}
            >
                {children}
            </StepLayout>
            <WizardMenuSheet open={menu.open} onClose={menu.hide} onSaveExit={onSaveExit} onHelp={onHelp} />
            {backGuard.active && <BrowserBackGuard shouldBlock={backGuard.shouldBlock} onBlocked={backGuard.onBlocked} />}
            {sheets}
        </>
    );
}
