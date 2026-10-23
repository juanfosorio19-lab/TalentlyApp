// PRF-11 · Perfil público de organización (/o/:id, spec §5.4): «Con sus
// publicaciones activas tocables». No está en el prototipo F1: el «Así te
// ven» de PRF-02 con «Sobre la organización» (rubro y tamaño, como DET-01) y
// lo que publica y recibe postulaciones en la sesión (ni pausado ni cerrado
// en GES-01; cupos al día con GES-04). Un hogar no tiene perfil público
// (spec §2: `is_public` es false): se ven su comuna, su verificación y sus
// avisos. Lo abren el nombre de quien publica en DET-01 y PRC-01, el AppBar
// del chat (MSG-02) y «Ver cómo me ven» de PRF-02.
import { useParams } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconClock, IconOffers, IconSearch, type IconComponent } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { useLivePublication, useManageSession } from '../../demo/manageHooks';
import { useDemoSession } from '../../demo/session';
import type { DemoPublication, DemoPublicationType } from '../../demo/types';
import { PublicHeader } from '../components/PublicHeader';
import { copy } from '../copy';
import { activePublicationsOf, publicOrg, type PublicOrg } from '../model';
import '../public-profile.css';

export const screenId = 'PRF-11';

const TIPO_ICON: Record<DemoPublicationType, IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    servicio: IconOffers,
    clase: IconOffers,
};

export function OrgPublicScreen() {
    const { id = '' } = useParams();
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { open } = useOpenPath();
    const found = publicOrg(id);

    return (
        <div className="tl-app-screen" data-screen-id={screenId}>
            <AppBar
                variant="standard"
                title={scrolled && found ? found.org.nombre : undefined}
                titleAs="p"
                onBack={goBack}
                scrolled={scrolled}
            />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content pp-content">
                    {found ? (
                        <OrgProfile found={found} />
                    ) : (
                        <EmptyState
                            icon={IconSearch}
                            title={copy.noEncontrado.titulo}
                            text={copy.noEncontrado.texto}
                            action={{ label: copy.noEncontrado.accion, onClick: () => open(paths.inicio()) }}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

function OrgProfile({ found }: { found: PublicOrg }) {
    const { org, verificaciones, sobre } = found;
    const { actor } = useDemoSession();
    const { manage } = useManageSession();
    const live = useLivePublication();
    const { linkProps } = useOpenPath();
    const hogar = org.tipo === 'hogar';
    const pubs = activePublicationsOf(org.id, manage).map(live);

    const sub = (p: DemoPublication) =>
        [
            `${copy.tipo[p.tipo]} · ${p.lugar}`,
            p.tipo === 'turno' ? copy.quedan(p.cupos.left, p.cupos.total) : null,
        ].filter((x): x is string => x !== null);

    return (
        <Stack gap={4}>
            <PublicHeader
                nombre={org.nombre}
                iniciales={org.iniciales}
                kind="org"
                lineas={[org.comuna]}
                verificaciones={verificaciones}
                own={actor.id === org.id}
            >
                {hogar && <p className="caption pp-muted pp-center">{copy.privadoHogar}</p>}
            </PublicHeader>

            {sobre && (
                <ScreenSection title={copy.sobre}>
                    <p className="body">{sobre}</p>
                </ScreenSection>
            )}

            <ScreenSection title={hogar ? copy.avisos : copy.publicaciones}>
                {pubs.length > 0 ? (
                    <List>
                        {pubs.map((p) => (
                            <ListItem key={p.id} icon={TIPO_ICON[p.tipo]} title={p.titulo} sub={sub(p)} chevron {...linkProps(paths.publicacion(p.id))} />
                        ))}
                    </List>
                ) : (
                    <p className="body pp-muted">{copy.sinPublicaciones(org.nombre)}</p>
                )}
            </ScreenSection>
        </Stack>
    );
}
