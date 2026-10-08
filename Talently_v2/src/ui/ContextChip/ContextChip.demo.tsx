import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { IconMore } from '../icons';
import { BackButton, IconButton } from '../IconButton';
import { ContextChip, ContextChipBar, ContextChipInRow } from './ContextChip';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'ContextChip',
    group: 'Chat y match',
    summary: 'Dice de qué publicación habla una conversación («Turno · Garzón · sáb 12 dic»). Fijo bajo el AppBar del chat y, sin chevron, en la fila de Mensajes.',
    Demo: () => (
        <>
            <DemoSection title="Uno por tipo de publicación · ícono y etiqueta, sin color propio">
                <DemoRow column>
                    <DemoItem label="F1 · Empleo">
                        <ContextChip kind="empleo" title="Guardia de seguridad 4x4" />
                    </DemoItem>
                    <DemoItem label="F1 · Turno">
                        <ContextChip kind="turno" title="Garzón" detail="sáb 12 dic" />
                    </DemoItem>
                    <DemoItem label="F2 · Clase">
                        <ContextChip kind="clase" title="PAES M1" detail="jue 11 mar" />
                    </DemoItem>
                    <DemoItem label="F3 · Servicio">
                        <ContextChip kind="servicio" title="Gasfitería" detail="mar 22 jun" />
                    </DemoItem>
                    <DemoItem label="F3 · Servicio · con la comuna (SRV-02)">
                        <ContextChip kind="servicio" title="Gasfitería" detail="San Miguel" />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Fijo bajo el AppBar de la conversación (M5)">
                <DemoFrame width={390}>
                    <header className="tl-appbar tl-appbar--chat">
                        <div className="tl-appbar__row">
                            <BackButton />
                            <a className="tl-appbar__who" href="#perfil" aria-label="Ver perfil de Seguridad Andes Ltda.">
                                <Avatar name="Seguridad Andes Ltda." kind="org" verified />
                                <span className="tl-appbar__who-text">
                                    <span className="tl-appbar__name">Seguridad Andes Ltda.</span>
                                    <span className="tl-appbar__meta">Organización verificada</span>
                                </span>
                            </a>
                            <div className="tl-appbar__actions">
                                <IconButton icon={IconMore} label="Más opciones" />
                            </div>
                        </div>
                    </header>
                    <ContextChipBar>
                        <ContextChip kind="empleo" title="Guardia 4x4" />
                    </ContextChipBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="En la fila de Mensajes · sin chevron (M5)">
                <DemoFrame width={390}>
                    <ul className="tl-list">
                        <li>
                            <button
                                type="button"
                                className="tl-listitem tl-listitem--chat is-unread"
                                aria-label="Seguridad Andes Ltda., Empleo · Guardia 4x4, hace 10 min, 2 mensajes sin leer"
                            >
                                <Avatar name="Seguridad Andes Ltda." kind="org" />
                                <span className="tl-listitem__body">
                                    <span className="tl-listitem__title">Seguridad Andes Ltda.</span>
                                    <ContextChipInRow kind="empleo" title="Guardia 4x4" />
                                    <span className="tl-listitem__sub">Cualquier duda, me escribes por aquí.</span>
                                </span>
                                <span className="tl-listitem__end">
                                    <span className="tl-listitem__time">hace 10 min</span>
                                    <Badge tone="primary">2</Badge>
                                </span>
                            </button>
                        </li>
                    </ul>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Texto largo · se corta con «…»">
                <DemoFrame width={360}>
                    <ContextChipBar>
                        <ContextChip kind="empleo" title="Mecánico/a automotriz para taller en Macul" />
                    </ContextChipBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <DemoItem label="default">
                        <ContextChip kind="turno" title="Garzón" detail="sáb 12 dic" />
                    </DemoItem>
                    <DemoItem label="presionado">
                        <ContextChip kind="turno" title="Garzón" detail="sáb 12 dic" className="is-pressed" />
                    </DemoItem>
                    <DemoItem label="foco">
                        <ContextChip kind="turno" title="Garzón" detail="sáb 12 dic" className="is-focus" />
                    </DemoItem>
                    <StateNote state="seleccionado">No se marca; abre el detalle de la publicación.</StateNote>
                    <StateNote state="deshabilitado">
                        Si la publicación ya no existe, el chip dice «Publicación cerrada» y sigue abriendo el resumen guardado.
                    </StateNote>
                    <DemoItem label="publicación cerrada">
                        <ContextChip kind="turno" title="Garzón" closed />
                    </DemoItem>
                    <StateNote state="error">No aplica.</StateNote>
                    <StateNote state="cargando">Llega con la conversación.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
