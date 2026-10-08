// SHT-ACTOR «Usar Talently como»: la persona y sus organizaciones (el hogar
// nunca aparece). Elegir cambia el actor de toda la app y cierra la hoja.
import { useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAdd } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { RadioGroup } from '../../../ui/Radio';
import { useSnackbar } from '../../../ui/Snackbar';
import { useDemoSession, type DemoActor, type DemoActorId } from '../../demo/session';
import { copy } from '../copy';
import { useInbox } from '../inbox';
import { actorVerified } from '../mock';

export const sheetId = 'SHT-ACTOR';

export interface ActorSheetProps {
    open: boolean;
    onClose: () => void;
}

/** Avatar, nombre, qué es y el punto de novedades: todo dentro de la fila del Radio. */
function ActorLabel({ actor, unread }: { actor: DemoActor; unread: boolean }) {
    const org = actor.kind === 'organizacion';
    return (
        <Stack row gap={3}>
            <Avatar name={actor.fullName} kind={org ? 'org' : 'person'} verified={actorVerified(actor)} />
            <span className="home-actor__text">
                {actor.fullName}
                <span className="tl-choice__desc">{org ? copy.actor.organizacion(actor.comuna) : copy.actor.persona}</span>
            </span>
            {unread && (
                <>
                    <span className="tl-unread" aria-hidden="true" />
                    <span className="tl-vh">{copy.actor.conNovedades}</span>
                </>
            )}
        </Stack>
    );
}

export function ActorSheet({ open, onClose }: ActorSheetProps) {
    const { actor, switchable, setActor } = useDemoSession();
    const { items } = useInbox();
    const snackbar = useSnackbar();
    // Con flechas el radio nativo se marca al moverse: eso solo recorre la lista (como SheetPicker).
    const arrow = useRef(false);

    const hasNews = (id: DemoActorId) => id !== actor.id && items.some((n) => n.sinLeer && n.actorId === id);

    const pick = (id: DemoActorId) => {
        if (arrow.current) return;
        if (id !== actor.id) setActor(id);
        onClose();
    };
    const onKeyDown = (e: KeyboardEvent<HTMLFieldSetElement>) => {
        const target = e.target;
        if (e.key === 'Enter' && target instanceof HTMLInputElement && target.type === 'radio') {
            e.preventDefault();
            arrow.current = false;
            pick(target.value as DemoActorId);
            return;
        }
        arrow.current = e.key.startsWith('Arrow');
    };
    const onKeyUp = () => {
        arrow.current = false;
    };
    // Tocar la fila ya elegida también cierra (en el prototipo vuelve al Inicio).
    const onClick = (e: MouseEvent<HTMLFieldSetElement>) => {
        const target = e.target;
        if (target instanceof HTMLInputElement && target.type === 'radio' && target.value === actor.id && !arrow.current) onClose();
    };

    const createOrg = () => {
        onClose();
        snackbar.show({ message: copy.soon });
    };

    return (
        <BottomSheet open={open} onClose={onClose} title={copy.actor.titulo}>
            <RadioGroup<DemoActorId>
                legend={copy.actor.titulo}
                legendHidden
                variant="row"
                options={switchable.map((a) => ({ value: a.id, label: <ActorLabel actor={a} unread={hasNews(a.id)} /> }))}
                value={actor.id}
                onChange={pick}
                onPointerDown={onKeyUp}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onClick={onClick}
            />
            <List flat className="home-sheet-list">
                <ListItem icon={IconAdd} title={copy.actor.crear} onClick={createOrg} />
            </List>
            <p className="tl-field__help home-sheet-note">{copy.actor.nota}</p>
        </BottomSheet>
    );
}
