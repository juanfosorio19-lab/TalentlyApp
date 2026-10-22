// VER-01 · Verificación y credenciales (`/verificacion`, spec §5.4): qué se
// verificó y cuándo, qué falta y para qué sirve, con su acción. Escalera de
// niveles con el Timeline --levels del sistema de diseño (Cuenta básica ·
// Teléfono verificado · Identidad verificada; una organización, «Organización
// verificada») y las credenciales del perfil con su Badge del diccionario.
// Jorge recién registrado ve lo que de verdad le falta: el teléfono y la
// credencial SPD (INI-01-jorge-nuevo). Nunca RUT, fecha de nacimiento ni fotos.
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { IconDocument } from '../../../ui/icons';
import { ScreenSection } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { useSnackbar } from '../../../ui/Snackbar';
import { Timeline, type TimelineStep } from '../../../ui/Timeline';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { verifyPhone } from '../../demo/sessionStore';
import { PhoneSheet } from '../components/PhoneSheet';
import { COPY } from '../copy';
import type { Credential, Level, LevelActionKind } from '../model';
import { verificationPaths } from '../paths';
import { useVerification } from '../useVerification';
import '../verification.css';

export const screenId = 'VER-01';

const C = COPY.ver01;

/** VER-02 sabe que la abrió VER-01: su «Ver mi verificación» vuelve atrás en vez de apilar otra VER-01. */
export interface FromVerificationState {
    desde: 'verificacion';
}

export function VerificationScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const location = useLocation();
    const { open } = useOpenPath();
    const { show } = useSnackbar();
    const { personId, isOrganization, levels, credentials } = useVerification();
    const phoneSheet = useSheet('telefono');
    const levelsRef = useRef<HTMLOListElement>(null);
    const focusLevels = useRef(false);

    // La hoja parte de cero cada vez que se abre (también si se cerró con el atrás del navegador).
    const [phoneKey, setPhoneKey] = useState(location.key);
    if (phoneSheet.open && phoneKey !== location.key) setPhoneKey(location.key);

    // Al verificar, «Verificar teléfono» desaparece: el foco va a la escalera, que sigue en pantalla.
    useEffect(() => {
        if (phoneSheet.open || !focusLevels.current) return;
        focusLevels.current = false;
        levelsRef.current?.focus();
    }, [phoneSheet.open]);

    const onPhoneVerified = () => {
        focusLevels.current = true;
        phoneSheet.hide();
        verifyPhone(personId);
        show({ message: C.snackTelefono, tone: 'success' });
    };

    const runLevelAction = (kind: LevelActionKind) => {
        if (kind === 'telefono') phoneSheet.show();
        else open(paths.verificarIdentidad(), { state: { desde: 'verificacion' } satisfies FromVerificationState });
    };

    const hasPrimary = levels.some((l) => l.action?.primary);
    const firstUpload = credentials.findIndex((c) => c.upload);

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={C.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <ScreenSection title={isOrganization ? C.organizacion : C.niveles}>
                        <Timeline
                            ref={levelsRef}
                            variant="levels"
                            tabIndex={-1}
                            className="tl-focus"
                            aria-label={isOrganization ? C.organizacion : C.niveles}
                            steps={levels.map((level) => toStep(level, runLevelAction))}
                        />
                    </ScreenSection>
                    {credentials.length > 0 && (
                        <ScreenSection title={C.credenciales}>
                            <List>
                                {credentials.map((cred, i) => (
                                    <CredentialRow
                                        key={cred.tipo}
                                        credential={cred}
                                        primary={!hasPrimary && i === firstUpload}
                                        onUpload={() => open(verificationPaths.subirCredencial(cred.tipo))}
                                    />
                                ))}
                            </List>
                        </ScreenSection>
                    )}
                    <p className="caption ver-muted ver-flush">{isOrganization ? C.notaOrganizacion : C.nota}</p>
                </div>
            </main>
            <PhoneSheet key={phoneKey} open={phoneSheet.open} onClose={phoneSheet.hide} onVerified={onPhoneVerified} />
        </div>
    );
}

function toStep(level: Level, run: (kind: LevelActionKind) => void): TimelineStep {
    const { action } = level;
    return {
        id: level.id,
        status: level.status,
        label: level.label,
        date: level.date,
        description: level.description,
        action: action && (
            <Button
                size="sm"
                variant={action.primary ? 'primary' : 'tonal'}
                aria-haspopup={action.kind === 'telefono' ? 'dialog' : undefined}
                onClick={() => run(action.kind)}
            >
                {action.label}
            </Button>
        ),
    };
}

function CredentialRow({ credential, primary, onUpload }: { credential: Credential; primary: boolean; onUpload: () => void }) {
    return (
        <ListItem
            icon={IconDocument}
            title={credential.label}
            sub={credential.detalle}
            status={credential.badge && <Badge status={credential.badge} />}
            multiline
            actions={
                credential.upload && (
                    <Button size="sm" variant={primary ? 'primary' : 'tonal'} onClick={onUpload}>
                        {C.subirCredencial}
                    </Button>
                )
            }
        />
    );
}
