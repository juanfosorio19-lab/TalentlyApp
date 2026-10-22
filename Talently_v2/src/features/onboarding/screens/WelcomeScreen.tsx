// AUTH-01 · Bienvenida (/bienvenida). Hero morado con el logo T en tile y la
// ilustración multioficio del prototipo; «Crear cuenta» y «Ya tengo cuenta».
// Aquí no se elige tipo de cuenta (spec §5.4).
//
// Es la raíz de la app fuera de la sesión: el atrás de Android nunca vuelve a
// la sesión que se acaba de cerrar (Inicio). Como en Inicio, el primer toque
// avisa «Presiona atrás otra vez para salir» y el segundo cierra la app.
import { useEffect, useRef } from 'react';
import { useSheet } from '../../../app/sheets';
import { BrandLogo } from '../../../ui/BrandLogo';
import { Button } from '../../../ui/Button';
import { CtaBar } from '../../../ui/CtaBar';
import { COPY } from '../copy';
import { DemoLoginSheet, LOGIN_SHEET } from '../components/EntrySheets';
import { useExitOnBack } from '../components/useExitOnBack';
import { useFlow, useFlowEntry, useStepBack } from '../flow';
import { WELCOME_ILLUSTRATION_SVG } from '../illustration';
import { onbPaths } from '../paths';
import '../onboarding.css';

export const screenId = 'AUTH-01';

const C = COPY.bienvenida;

export function WelcomeScreen() {
    useFlowEntry(true);
    const { forward } = useFlow();
    const login = useSheet(LOGIN_SHEET);
    const exitOnBack = useExitOnBack();
    useStepBack(exitOnBack);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Al llegar (también tras cerrar sesión o «Guardar y salir»), el foco va al título, como en los pasos.
    useEffect(() => {
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <div className="tl-app-screen">
            <div className="tl-hero onb-hero">
                <div className="tl-statusbar" aria-hidden="true" />
                <BrandLogo size="lg" variant="tile" className="onb-hero__logo" />
                <span className="tl-vh">{C.marca}</span>
                <span
                    className="onb-hero__art"
                    // El SVG del prototipo tal cual (trae su propio role="img" y aria-label).
                    dangerouslySetInnerHTML={{ __html: WELCOME_ILLUSTRATION_SVG }}
                />
            </div>
            <main className="tl-app-screen__body onb-welcome">
                <h1 ref={titleRef} tabIndex={-1} className="display onb-welcome__title">
                    {C.titulo}
                </h1>
                <p className="body-l onb-muted onb-flush">{C.sub}</p>
            </main>
            <CtaBar>
                <Button size="lg" block onClick={() => forward(onbPaths.registro())}>
                    {C.crear}
                </Button>
                <Button variant="outline" size="lg" block aria-haspopup="dialog" onClick={() => login.show()}>
                    {C.tengo}
                </Button>
            </CtaBar>
            <DemoLoginSheet />
        </div>
    );
}
