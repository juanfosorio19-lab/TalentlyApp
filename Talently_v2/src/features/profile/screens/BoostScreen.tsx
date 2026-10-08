// PRF-12 · Impulsa tu perfil (flujo 11): «Perfil destacado» por 7 o 30 días.
// Antes de F3 no se vende: los planes llevan «Pronto» y el CTA deja pedir que
// avisemos (Snackbar «Te avisaremos cuando puedas impulsar tu perfil»).
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Banner } from '../../../ui/Banner';
import { Button } from '../../../ui/Button';
import { CtaBar } from '../../../ui/CtaBar';
import { IconBoost, IconCheck, IconInfo, IconPeople } from '../../../ui/icons';
import { OptionGroup } from '../../../ui/OptionCard';
import { PromotedBadge } from '../../../ui/PromotedBadge';
import { SnackbarOutlet, useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useDemoSession } from '../../demo/session';
import { COPY } from '../copy';
import { useBoostNotify } from '../store';
import '../profile.css';

export const screenId = 'PRF-12';

const PLANS = [
    { value: '7', icon: IconBoost, title: COPY.impulsa.plan7, soon: true },
    { value: '30', icon: IconBoost, title: COPY.impulsa.plan30, soon: true },
] as const;

const keep = () => {};

export function BoostScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { actor } = useDemoSession();
    const { show } = useSnackbar();
    const [notify, turnOnNotify] = useBoostNotify(actor.id);

    const avisar = () => {
        turnOnNotify();
        show({ message: COPY.impulsa.snackAvisado, tone: 'success' });
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={COPY.impulsa.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <p className="body-l prf-muted prf-flush">{COPY.impulsa.intro}</p>
                    {/* Hechos con ícono: el marcado tl-pub__facts del prototipo (no hay componente suelto; ver requests). */}
                    <ul className="tl-pub__facts prf-facts">
                        <li className="tl-pub__fact">
                            <IconPeople />
                            <span>{COPY.impulsa.hecho1}</span>
                        </li>
                        <li className="tl-pub__fact">
                            <IconBoost />
                            <span>
                                {COPY.impulsa.hecho2} <PromotedBadge />
                            </span>
                        </li>
                        <li className="tl-pub__fact">
                            <IconInfo />
                            <span>{COPY.impulsa.hecho3}</span>
                        </li>
                    </ul>
                    <OptionGroup
                        mode="single"
                        variant="plan"
                        legend={COPY.impulsa.elige}
                        options={PLANS}
                        value={null}
                        onChange={keep}
                        onSoonClick={() => show({ message: COPY.impulsa.snackPlan })}
                    />
                    <Banner tone="success">{COPY.impulsa.gratis}</Banner>
                </div>
            </main>
            <CtaBar scrolled>
                <SnackbarOutlet />
                {notify ? (
                    <Button variant="tonal" size="lg" block icon={IconCheck} disabled>
                        {COPY.impulsa.avisado}
                    </Button>
                ) : (
                    <Button variant="tonal" size="lg" block onClick={avisar}>
                        {COPY.impulsa.avisarme}
                    </Button>
                )}
            </CtaBar>
        </div>
    );
}
