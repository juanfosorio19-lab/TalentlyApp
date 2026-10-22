// Hojas de la entrada al registro:
// - «Ya tengo cuenta» (AUTH-01, `?sheet=ingresar`): AUTH-04 no existe en la
//   demostración (no hay cuentas reales), así que la hoja lo dice y deja
//   entrar como una de sus personas, o retomar el registro guardado.
// - ONB-02 «¿Con cuál empiezas?» (`?sheet=empezar`), si eligió más de un bloque.
import { useNavigate } from 'react-router-dom';
import { useSheet } from '../../../app/sheets';
import { Avatar } from '../../../ui/Avatar';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { List, ListItem } from '../../../ui/ListItem';
import { OptionGroup } from '../../../ui/OptionCard';
import { DEMO_ACTORS, useDemoSession, type DemoActorId } from '../../demo/session';
import { COPY } from '../copy';
import { useFlow } from '../flow';
import type { Bloque, Intencion } from '../model';
import { onbPaths } from '../paths';
import { useDraft } from '../store';
import { blockOption } from './intents';

export const LOGIN_SHEET = 'ingresar';
export const START_SHEET = 'empezar';

/** Las personas de los flujos del prototipo (las organizaciones se usan desde su persona). */
const PERSONAS = ['matias', 'jorge', 'pedro', 'carolina', 'rosa'] as const satisfies readonly DemoActorId[];

export function DemoLoginSheet() {
    const sheet = useSheet(LOGIN_SHEET);
    const navigate = useNavigate();
    const { setActor } = useDemoSession();
    const { leave } = useFlow();
    const { retomar } = useDraft();

    const enterAs = (id: DemoActorId) => {
        setActor(id);
        leave(onbPaths.inicio());
    };

    return (
        <BottomSheet open={sheet.open} onClose={sheet.hide} title={COPY.ingresar.titulo}>
            <p className="body onb-muted onb-flush">{COPY.ingresar.texto}</p>
            {retomar && (
                <List flat className="onb-sheet-list">
                    <ListItem
                        title={COPY.ingresar.retomar}
                        sub={COPY.ingresar.retomarSub}
                        chevron
                        // Reemplaza la entrada de la hoja: atrás desde el paso vuelve a Bienvenida.
                        onClick={() => navigate(retomar, { replace: true })}
                    />
                </List>
            )}
            <p className="tl-sheet__group overline">{COPY.ingresar.personas}</p>
            <List flat className="onb-sheet-list">
                {PERSONAS.map((id) => {
                    const actor = DEMO_ACTORS[id];
                    return (
                        <ListItem
                            key={id}
                            avatar={<Avatar name={actor.fullName} />}
                            title={actor.fullName}
                            sub={`${COPY.ingresar.roles[id]} · ${actor.comuna}`}
                            chevron
                            onClick={() => enterAs(id)}
                        />
                    );
                })}
            </List>
        </BottomSheet>
    );
}

export interface StartSheetProps {
    intenciones: readonly Intencion[];
    bloques: readonly Bloque[];
    value: Bloque | null;
    onChange: (bloque: Bloque) => void;
    onStart: () => void;
}

export function StartSheet({ intenciones, bloques, value, onChange, onStart }: StartSheetProps) {
    const sheet = useSheet(START_SHEET);
    return (
        <BottomSheet
            open={sheet.open && bloques.length > 1}
            onClose={sheet.hide}
            title={COPY.empezar.titulo}
            footer={
                <Button size="lg" block disabled={value === null} onClick={onStart}>
                    {COPY.empezar.cta}
                </Button>
            }
        >
            <p className="body onb-muted onb-flush">{COPY.empezar.texto}</p>
            <OptionGroup<Bloque>
                mode="single"
                legend={COPY.empezar.titulo}
                legendHidden
                options={bloques.map((b) => blockOption(b, intenciones))}
                value={value}
                onChange={onChange}
            />
        </BottomSheet>
    );
}
