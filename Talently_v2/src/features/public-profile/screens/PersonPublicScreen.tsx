// PRF-10 · Perfil público de persona (/u/:id?ver=trabajo|servicios|clases,
// spec §5.4): lo que ve un tercero, separado por capacidad. No está en el
// prototipo F1: es el «Así te ven» de PRF-01 sin nada privado (pretensión,
// RUT, teléfono, dirección) y con las insignias de la sesión. Lo abren las
// tarjetas de personas de EXP-05 y EXP-07, el nombre en DET-01 y PRC-01, el
// AppBar del chat (MSG-02) y «Ver cómo me ven» de PRF-01.
import { useParams, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconBook, IconCheck, IconDocument, IconPerson, IconSearch, IconTool } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { RatingStars } from '../../../ui/RatingStars';
import { useDemoSession } from '../../demo/session';
import { useSessionState } from '../../demo/sessionStore';
import { PublicHeader } from '../components/PublicHeader';
import { copy } from '../copy';
import { isPublicView, publicPerson, type PublicPerson } from '../model';
import '../public-profile.css';

export const screenId = 'PRF-10';

export function PersonPublicScreen() {
    const { id = '' } = useParams();
    const [params] = useSearchParams();
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { open } = useOpenPath();
    const { actor, recienRegistrado, onboarding } = useDemoSession();
    // Las insignias siguen la sesión (AUTH-08, VER-02): se vuelve a pintar cuando cambian.
    useSessionState();
    const own = actor.id === id;
    const person = publicPerson(id, own ? { recienRegistrado, onboarding } : {});
    const raw = params.get('ver');
    const ver = isPublicView(raw) ? raw : null;

    return (
        <div className="tl-app-screen" data-screen-id={screenId}>
            {/* El H1 es el nombre, en el encabezado: el AppBar lo repite al bajar. */}
            <AppBar
                variant="standard"
                title={scrolled && person ? person.nombre : undefined}
                titleAs="p"
                onBack={goBack}
                scrolled={scrolled}
            />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content pp-content">
                    {person ? (
                        <PersonProfile person={person} own={own} ver={ver} />
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

function PersonProfile({ person, own, ver }: { person: PublicPerson; own: boolean; ver: 'trabajo' | 'servicios' | 'clases' | null }) {
    const { trabajo } = person;
    const soon = ver === 'servicios' || ver === 'clases' ? copy.capacidadPronto[ver] : null;
    return (
        <Stack gap={4}>
            <PublicHeader
                nombre={person.nombre}
                iniciales={person.iniciales}
                foto={person.foto}
                kind="person"
                lineas={[person.comuna]}
                verificaciones={person.verificaciones}
                own={own}
            >
                {trabajo && !soon && (
                    <Stack row gap={2}>
                        <span className="caption pp-muted">{copy.notaTrabajo}</span>
                        <RatingStars value={trabajo.nota?.value ?? null} count={trabajo.nota?.count ?? 0} />
                    </Stack>
                )}
                {own && <p className="caption pp-muted pp-center">{copy.privadoPersona}</p>}
            </PublicHeader>

            {soon ? (
                <EmptyState icon={IconBook} title={soon.titulo} text={soon.texto} />
            ) : trabajo ? (
                <ScreenSection title={copy.trabajo}>
                    <List>
                        {trabajo.oficios.map((o, i) => (
                            <ListItem
                                key={o.nombre}
                                icon={IconTool}
                                title={o.nombre}
                                sub={[i === 0 && trabajo.oficios.length > 1 ? copy.oficioPrincipal : null, o.experiencia ? copy.experiencia(o.experiencia) : null].filter(Boolean)}
                            />
                        ))}
                        {trabajo.confiabilidad && <ListItem icon={IconCheck} title={trabajo.confiabilidad} />}
                        {trabajo.ultimoTrabajo && <ListItem icon={IconDocument} title={copy.ultimoTrabajo} sub={trabajo.ultimoTrabajo} />}
                    </List>
                </ScreenSection>
            ) : (
                <EmptyState
                    icon={IconPerson}
                    title={own ? copy.sinTrabajo.tituloPropio : copy.sinTrabajo.titulo(person.nombre)}
                    text={own && person.hogar ? copy.privadoHogar : own ? copy.sinTrabajo.textoPropio : copy.sinTrabajo.texto}
                />
            )}
        </Stack>
    );
}
