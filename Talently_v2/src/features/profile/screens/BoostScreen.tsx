// PRF-12 · Impulsa tu perfil (flujo 11): «Perfil destacado» por 7 o 30 días.
// Antes de F3 no se vende: los planes llevan «Pronto» y el CTA deja pedir que
// avisemos (Snackbar «Te avisaremos cuando puedas impulsar tu perfil»).
// Solo para quien trabaja (spec §5.4, actor T): a cualquier otro actor, un
// enlace profundo lo deja en su Perfil.
import { Navigate } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Banner } from '../../../ui/Banner';
import { Button } from '../../../ui/Button';
import { CtaBar } from '../../../ui/CtaBar';
import { IconBoost, IconCheck, IconInfo, IconPeople } from '../../../ui/icons';
import { OptionGroup } from '../../../ui/OptionCard';
import { PromotedBadge } from '../../../ui/PromotedBadge';
import { SnackbarOutlet, useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { useDemoSession, type DemoActorId } from '../../demo/session';
import { COPY } from '../copy';
import { trabaja } from '../model';
import { useBoostNotify } from '../store';
import '../profile.css';

export const screenId = 'PRF-12';

const PLANS = [
    { value: '7', icon: IconBoost, title: COPY.impulsa.plan7, soon: true },
    { value: '30', icon: IconBoost, title: COPY.impulsa.plan30, soon: true },
] as const;

const keep = () => {};

export function BoostScreen() {
    const { actor } = useDemoSession();
    if (!trabaja(actor)) return <Navigate to={paths.perfil()} replace />;
    return <Boost actorId={actor.id} />;
}

function Boost({ actorId }: { actorId: DemoActorId }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { show } = useSnackbar();
    const [notify, turnOnNotify] = useBoostNotify(actorId);

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
                    {/* Hechos con ícono de 16: el mismo marcado `ul.tl-pub__facts` del prototipo (PRF-12). src/ui no
                        exporta esta lista suelta (solo dentro de PublicationCard): pedida en «requests». */}
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
                {/* Un solo botón que cambia de estado: conserva el foco (PRF-12-avisado: is-disabled + aria-disabled). */}
                <Button
                    variant="tonal"
                    size="lg"
                    block
                    icon={notify ? IconCheck : undefined}
                    aria-disabled={notify || undefined}
                    className={notify ? 'is-disabled' : undefined}
                    onClick={notify ? undefined : avisar}
                >
                    {notify ? COPY.impulsa.avisado : COPY.impulsa.avisarme}
                </Button>
            </CtaBar>
        </div>
    );
}
