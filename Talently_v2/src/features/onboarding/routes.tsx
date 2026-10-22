// Rutas del feature Bienvenida y onboarding (las compone src/app/router.tsx).
// Todas apiladas, fuera del AppShell (sin TabBar): AUTH-01 Bienvenida,
// AUTH-02 Crear cuenta, AUTH-03 Revisa tu correo, ONB-01 ¿Qué quieres hacer?,
// ONB-03 Tus datos, ONB-T1 a ONB-T5 (bloque Trabajo, el paso en la URL) y
// ONB-99 Listo (spec §5.4 y §6). También LEG-01 Términos y LEG-02 Privacidad,
// los enlaces del checkbox de AUTH-02 (spec §6.3), mientras no exista el
// módulo `help` (02-arquitectura §4.3).
import type { RouteObject } from 'react-router-dom';
import { DataScreen } from './screens/DataScreen';
import { DoneScreen } from './screens/DoneScreen';
import { IntentScreen } from './screens/IntentScreen';
import { LegalScreen } from './screens/LegalScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { VerifyEmailScreen } from './screens/VerifyEmailScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { WorkStepRoute } from './screens/work/WorkStepRoute';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'bienvenida', element: <WelcomeScreen /> },
    { path: 'registro', element: <SignUpScreen /> },
    { path: 'registro/verificar', element: <VerifyEmailScreen /> },
    { path: 'onboarding/intencion', element: <IntentScreen /> },
    { path: 'onboarding/datos', element: <DataScreen /> },
    { path: 'onboarding/trabajo/:paso', element: <WorkStepRoute /> },
    { path: 'onboarding/listo', element: <DoneScreen /> },
    { path: 'terminos', element: <LegalScreen key="terminos" doc="terminos" /> },
    { path: 'privacidad', element: <LegalScreen key="privacidad" doc="privacidad" /> },
];
