// INI-01 · Inicio de una persona (spec §5.2): los bloques «Para ti» en el
// orden en que llegan de los datos, cada uno solo si su capacidad está activa.
// Matías: agenda de hoy, turnos, novedades y completitud (Main). Carolina:
// «¿Qué necesitas?», su aviso y «Publicar» (INI-01-carolina). Jorge recién
// registrado: sin actividad y la credencial SPD (INI-01-jorge-nuevo). Rosa:
// «Aún no tienes perfiles» (INI-01-rosa).
import type { DemoAuthor, DemoHomeFeed } from '../../demo/types';
import { PersonBlock } from '../components/PersonBlocks';
import type { PublishKind } from '../components/PublishSheet';
import '../home.css';

export const screenId = 'INI-01';

export interface PersonHomeScreenProps {
    feed: DemoHomeFeed;
    /** Abre «Verificación de …» al tocar la insignia de quien publica. */
    onVerify: (author: DemoAuthor) => void;
    /** Abre PUBL-01, con una opción marcada si viene de «¿Qué necesitas?». */
    onPublish: (initial?: PublishKind) => void;
}

export function PersonHomeScreen({ feed, onVerify, onPublish }: PersonHomeScreenProps) {
    return (
        <main className="tl-app-screen__body">
            <div className="tl-app-screen__content home-content">
                {feed.bloques.map((block, i) => (
                    <PersonBlock key={`${block.tipo}-${i}`} block={block} onVerify={onVerify} onPublish={onPublish} />
                ))}
            </div>
        </main>
    );
}
