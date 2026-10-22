// Lo que ve quien abre GES-01, GES-02 o GES-04 de una publicación que no
// existe o que no es suya: un EmptyState honesto. Si puede usar Talently como
// la organización dueña (SHT-ACTOR), se ofrece el cambio; si no, el detalle
// público de la publicación.
import { AppBar } from '../../../ui/AppBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconLock, IconOffers } from '../../../ui/icons';
import { useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { getPublication } from '../../demo/data';
import { DEMO_ACTORS, useDemoSession } from '../../demo/session';
import type { DemoManagedPublication } from '../../demo/types';
import { copy } from '../copy';

export interface ManageGateProps {
    /** Título del AppBar de la pantalla («Publicación», «Postulantes», «Cupos del turno»). */
    title: string;
    /** `undefined` = la publicación no existe en la demo. */
    managed?: DemoManagedPublication;
}

export function ManageGate({ title, managed }: ManageGateProps) {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    const snackbar = useSnackbar();
    const { switchable, setActor, recienRegistrado } = useDemoSession();

    let body;
    if (!managed) {
        body = (
            <EmptyState
                icon={IconOffers}
                title={copy.common.notFoundTitle}
                text={copy.common.notFoundText}
                action={{ label: copy.common.goActivity, onClick: () => open(paths.actividad('publicaciones'), { replace: true }) }}
            />
        );
    } else {
        const owner = DEMO_ACTORS[managed.ownerId];
        const ownerName = getPublication(managed.publicationId)?.autor.nombre ?? owner.fullName;
        const canSwitch = !recienRegistrado && switchable.some((a) => a.id === owner.id);
        const publication = getPublication(managed.publicationId);
        const action = canSwitch
            ? {
                  label: copy.common.switchTo(owner.fullName),
                  onClick: () => {
                      setActor(owner.id);
                      snackbar.show({ message: copy.common.switched(owner.fullName), tone: 'success' });
                  },
              }
            : publication
              ? { label: copy.common.seePublication, onClick: () => open(paths.publicacion(publication.id), { replace: true }) }
              : { label: copy.common.goHome, onClick: () => open(paths.inicio(), { replace: true }) };
        body = (
            <EmptyState
                icon={IconLock}
                title={copy.common.notOwnerTitle}
                text={canSwitch ? copy.common.notOwnerSwitchText(ownerName) : copy.common.notOwnerText(ownerName)}
                action={action}
            />
        );
    }

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={title} onBack={goBack} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">{body}</div>
            </main>
        </div>
    );
}
