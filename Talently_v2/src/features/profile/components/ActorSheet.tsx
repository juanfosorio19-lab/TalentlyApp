// SHT-ACTOR · «Usar Talently como»: la persona y sus organizaciones. El hogar
// no aparece (su actividad se ve dentro del perfil de la persona).
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAdd } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { RadioGroup } from '../../../ui/Radio';
import { useSnackbar } from '../../../ui/Snackbar';
import { useDemoSession, type DemoActorId } from '../../demo/session';
import { COPY } from '../copy';
import { useSoon } from '../useOpenRoute';

export function ActorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { actor, switchable, setActor } = useDemoSession();
    const { show } = useSnackbar();
    const soon = useSoon();

    const choose = (id: DemoActorId) => {
        onClose();
        if (id === actor.id) return;
        const next = switchable.find((a) => a.id === id);
        setActor(id);
        if (next) show({ message: COPY.actor.cambiaste(next.fullName), tone: 'success' });
    };

    return (
        <BottomSheet open={open} onClose={onClose} title={COPY.actor.titulo}>
            <RadioGroup
                legend={COPY.actor.titulo}
                legendHidden
                variant="row"
                value={actor.id}
                onChange={choose}
                options={switchable.map((a) => ({
                    value: a.id,
                    label: a.fullName,
                    description: a.kind === 'organizacion' ? COPY.actor.organizacion(a.comuna) : COPY.actor.persona,
                }))}
            />
            <List flat>
                <ListItem icon={IconAdd} title={COPY.actor.crearOrganizacion} onClick={() => soon()} />
            </List>
            <p className="caption prf-muted prf-flush">{COPY.actor.notaHogar}</p>
        </BottomSheet>
    );
}
