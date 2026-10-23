// LEG-01 Términos (/terminos) y LEG-02 Privacidad (/privacidad): pantallas
// apiladas con AppBar standard y la plantilla LegalDocument de src/ui (H1,
// una sola fecha, índice «En esta página» y secciones numeradas). Las abren
// los enlaces del checkbox de AUTH-02 (spec §6.3: «con enlaces reales») y
// «Términos y Privacidad» de CFG-01. Atrás vuelve a donde se abrió.
//
// El texto legal todavía no existe (docs/PENDIENTES.md #2): un Banner warning
// lo dice antes del documento y cada sección trae solo un resumen.
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Banner } from '../../../ui/Banner';
import { LinkText } from '../../../ui/Button';
import { Stack } from '../../../ui/Layout';
import { LegalDocument } from '../../../ui/LegalDocument';
import { legalContent, type LegalDoc, type LegalLink } from '../content';
import { COPY } from '../copy';

const SCREEN_IDS: Record<LegalDoc, string> = { terminos: 'LEG-01', privacidad: 'LEG-02' };
export const screenId = 'LEG-01';

/** Con qué documento se abrió este (Términos ↔ Privacidad), para no apilarlos en ping-pong. */
type LegalState = { legalFrom?: LegalDoc } | null;

export function LegalScreen({ doc }: { doc: LegalDoc }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const navigate = useNavigate();
    const location = useLocation();
    const { linkProps } = useOpenPath();
    const cameFrom = (location.state as LegalState)?.legalFrom;
    // El otro documento se abre apilado; si este se abrió desde aquel, el enlace lo cierra
    // con navigate(-1) (spec §5.3 regla 2) en vez de apilar Términos → Privacidad → Términos.
    const link: LegalLink = (to, label) => {
        const props = linkProps(to === 'terminos' ? paths.terminos() : paths.privacidad(), {
            state: { legalFrom: doc } satisfies LegalState,
        });
        const onClick: typeof props.onClick =
            cameFrom === to
                ? (e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                      e.preventDefault();
                      void navigate(-1);
                  }
                : props.onClick;
        return (
            <LinkText href={props.href} onClick={onClick}>
                {label}
            </LinkText>
        );
    };
    const { title, updated, sections } = legalContent(doc, link);

    return (
        <div className="tl-app-screen" data-screen-id={SCREEN_IDS[doc]}>
            {/* El H1 va en el documento: el AppBar muestra el título solo cuando el H1 ya pasó por debajo. */}
            <AppBar variant="standard" title={scrolled ? title : undefined} titleAs="p" onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <Banner tone="warning">{COPY.enPreparacion}</Banner>
                        <LegalDocument title={title} updated={updated} sections={sections} />
                    </Stack>
                </div>
            </main>
        </div>
    );
}
