// Asistentes de publicar sin pantallas todavía, con un EmptyState honesto:
// PUBL-02 · Publicar empleo (sin prototipo en F1), PUBL-05 · clase (F2),
// PUBL-06 · servicio (F3), y quien abre un asistente por enlace sin
// organización ni hogar desde donde publicar.
import { AppBar } from '../../../ui/AppBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconBook, IconHome, IconOffers, IconTool, type IconComponent } from '../../../ui/icons';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { copy } from '../copy';
import { canPublish } from '../model/publisher';

export const screenId = 'PUBL-02';

function InfoScreen({
    appBar,
    icon,
    title,
    text,
    action,
}: {
    appBar: string;
    icon: IconComponent;
    title: string;
    text: string;
    action: { label: string; to: string };
}) {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={appBar} onBack={goBack} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <EmptyState
                        icon={icon}
                        title={title}
                        text={text}
                        action={{ label: action.label, onClick: () => open(action.to, { replace: true }) }}
                    />
                </div>
            </main>
        </div>
    );
}

/** PUBL-02 · Publicar empleo: una organización puede, mientras tanto, publicar un turno. */
export function EmpleoScreen() {
    const { actor } = useDemoSession();
    const turno = canPublish(actor, 'turno');
    return (
        <InfoScreen
            appBar={copy.empleo.appBar}
            icon={IconOffers}
            title={copy.empleo.titulo}
            text={copy.empleo.texto}
            action={turno ? { label: copy.empleo.accion, to: paths.publicar('turno') } : { label: copy.pronto.inicio, to: paths.inicio() }}
        />
    );
}

/** PUBL-05 (clases, F2) y PUBL-06 (servicios, F3). */
export function SoonScreen({ tipo }: { tipo: 'clase' | 'servicio' }) {
    const c = copy.pronto[tipo];
    return (
        <InfoScreen
            appBar={c.appBar}
            icon={tipo === 'clase' ? IconBook : IconTool}
            title={c.titulo}
            text={c.texto}
            action={{ label: copy.pronto.inicio, to: paths.inicio() }}
        />
    );
}

/** Sin organización ni hogar desde donde publicar. */
export function NoPublisherScreen() {
    return (
        <InfoScreen
            appBar={copy.sinPerfil.appBar}
            icon={IconHome}
            title={copy.sinPerfil.titulo}
            text={copy.sinPerfil.texto}
            action={{ label: copy.sinPerfil.accion, to: paths.inicio() }}
        />
    );
}
