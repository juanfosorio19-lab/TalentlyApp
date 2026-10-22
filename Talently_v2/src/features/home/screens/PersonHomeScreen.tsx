// INI-01 · Inicio de una persona (spec §5.2): los bloques «Para ti» en el
// orden en que llegan de los datos, cada uno solo si su capacidad está activa.
// Matías: agenda de hoy, turnos, novedades y completitud (Main). Carolina:
// «¿Qué necesitas?», su aviso y «Publicar» (INI-01-carolina). Jorge recién
// registrado: sin actividad y la credencial SPD (INI-01-jorge-nuevo). Rosa:
// «Aún no tienes perfiles» (INI-01-rosa).
import type { DemoHomeBlock } from '../../demo/types';
import { PersonBlock, type PersonBlockProps } from '../components/PersonBlocks';
import '../home.css';

export const screenId = 'INI-01';

export interface PersonHomeScreenProps extends Omit<PersonBlockProps, 'block'> {
    /** Los bloques ya al día con la sesión (selectors.homeBlocks). */
    blocks: readonly DemoHomeBlock[];
}

export function PersonHomeScreen({ blocks, ...handlers }: PersonHomeScreenProps) {
    return (
        <main className="tl-app-screen__body">
            <div className="tl-app-screen__content home-content">
                {blocks.map((block, i) => (
                    <PersonBlock key={`${block.tipo}-${i}`} block={block} {...handlers} />
                ))}
            </div>
        </main>
    );
}
