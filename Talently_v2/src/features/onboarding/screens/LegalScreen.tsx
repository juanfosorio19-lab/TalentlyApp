// LEG-01 Términos (/terminos) y LEG-02 Privacidad (/privacidad): pantallas
// apiladas con AppBar standard y la plantilla LegalDocument de src/ui (H1,
// una sola fecha, índice «En esta página» y secciones numeradas). Las abren
// los enlaces del checkbox de AUTH-02 (spec §6.3: «con enlaces reales») y
// «Términos y Privacidad» de CFG-01. Atrás vuelve a donde se abrió.
import { useGoBack } from '../../../app/BackButtonManager';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { LegalDocument } from '../../../ui/LegalDocument';
import { LEGAL, type LegalDoc } from '../legal';

/** Una pantalla para los dos documentos: LEG-01 Términos y LEG-02 Privacidad. */
export const screenId = 'LEG-01';
const SCREEN_IDS: Record<LegalDoc, string> = { terminos: 'LEG-01', privacidad: 'LEG-02' };

export function LegalScreen({ doc }: { doc: LegalDoc }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { title, updated, sections } = LEGAL[doc];

    return (
        <div className="tl-app-screen" data-screen-id={SCREEN_IDS[doc]}>
            {/* El H1 va en el documento: el AppBar muestra el título solo cuando el H1 ya pasó por debajo. */}
            <AppBar variant="standard" title={scrolled ? title : undefined} titleAs="p" onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <LegalDocument title={title} updated={updated} sections={sections} />
                </div>
            </main>
        </div>
    );
}
