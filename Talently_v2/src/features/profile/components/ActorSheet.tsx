// SHT-ACTOR · «Usar Talently como»: la persona y sus organizaciones, cada una
// con su avatar (persona redondo, organización cuadrado), su escudo si está
// verificada y el punto de novedades sin leer (la bandeja con lo ya leído, la
// misma de Inicio). El hogar no aparece (su actividad se ve dentro del perfil
// de la persona).
// Radio de src/ui no tiene lugar para el Avatar antes del texto: la fila se
// arma con sus piezas tl-choice, igual que el catálogo de BottomSheet (pedido
// en «requests», junto con mover esta hoja a un lugar común con Inicio).
// Con el teclado se comporta como la de Inicio y SheetPicker: las flechas solo
// recorren la lista; Espacio, Enter o un toque eligen y cierran.
import { useId, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAdd } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { useSnackbar } from '../../../ui/Snackbar';
import { getProfile } from '../../demo/data';
import { useDemoSession, type DemoActorId } from '../../demo/session';
import { focusActorSelectorAfterSwitch } from '../actor';
import { COPY } from '../copy';
import { useInbox } from '../inbox';
import { useSoon } from '../useOpenRoute';

const isRadio = (target: EventTarget): target is HTMLInputElement =>
    target instanceof HTMLInputElement && target.type === 'radio';

export function ActorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { actor, switchable, setActor } = useDemoSession();
    const { items } = useInbox();
    const { show } = useSnackbar();
    const soon = useSoon();
    const name = useId();
    // Si el cambio que viene llega por una flecha: el radio nativo se marca al
    // moverse, pero eso solo recorre la lista (ni cambia de actor ni cierra).
    const arrow = useRef(false);

    const choose = (id: DemoActorId) => {
        if (arrow.current) return;
        onClose();
        if (id === actor.id) return;
        const next = switchable.find((a) => a.id === id);
        focusActorSelectorAfterSwitch();
        setActor(id);
        if (next) show({ message: COPY.actor.cambiaste(next.fullName), tone: 'success' });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && isRadio(e.target)) {
            // Enter elige la fila con foco y cierra, como un toque.
            e.preventDefault();
            arrow.current = false;
            choose(e.target.value as DemoActorId);
            return;
        }
        arrow.current = e.key.startsWith('Arrow');
    };
    // El change (y el click) de la flecha llegan antes de soltarla.
    const onKeyUp = () => {
        arrow.current = false;
    };
    // Tocar el actor actual (o marcarlo con Espacio) también cierra la hoja.
    const onClick = (e: MouseEvent<HTMLDivElement>) => {
        if (isRadio(e.target) && e.target.value === actor.id && !arrow.current) onClose();
    };

    return (
        <BottomSheet open={open} onClose={onClose} title={COPY.actor.titulo}>
            <div
                role="radiogroup"
                aria-label={COPY.actor.titulo}
                onPointerDown={onKeyUp}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onClick={onClick}
            >
                {switchable.map((a) => {
                    const { asiTeVen } = getProfile(a.id);
                    const org = a.kind === 'organizacion';
                    // El actor actual no lleva punto: lo que ve ya es suyo.
                    const unread = a.id !== actor.id && items.some((n) => n.sinLeer && n.actorId === a.id);
                    return (
                        <label key={a.id} className="tl-choice tl-choice--row">
                            <Avatar
                                name={a.fullName}
                                initials={asiTeVen.iniciales}
                                kind={org ? 'org' : 'person'}
                                verified={asiTeVen.verificaciones.some((v) => v.status === 'verified')}
                            />
                            <span className="tl-choice__text">
                                {a.fullName}
                                <span className="tl-choice__desc">
                                    {org ? COPY.actor.organizacion(a.comuna) : COPY.actor.persona}
                                </span>
                            </span>
                            {unread && (
                                <>
                                    <span className="tl-unread" aria-hidden="true" />
                                    <span className="tl-vh">{COPY.actor.sinLeer}</span>
                                </>
                            )}
                            <span className="tl-radio">
                                <input
                                    type="radio"
                                    name={name}
                                    value={a.id}
                                    checked={a.id === actor.id}
                                    onChange={() => choose(a.id)}
                                />
                                <span className="tl-radio__box" />
                            </span>
                        </label>
                    );
                })}
            </div>
            <List flat className="prf-sheet-list">
                <ListItem icon={IconAdd} title={COPY.actor.crearOrganizacion} chevron={false} onClick={() => soon()} />
            </List>
            <p className="caption prf-muted prf-sheet-note">{COPY.actor.notaHogar}</p>
        </BottomSheet>
    );
}
