// ACT-02 · Actividad · Postulaciones (prototipo ACT-02, ACT-02-jorge,
// ACT-02-matias y ACT-02-desplazado): Empleos y Turnos con su Badge de estado
// y, al final, «Impulsa tu perfil» (flujo 11 → PRF-12). Un turno confirmado
// abre Mi turno (TUR-01, flujo 2); un turno postulado o en lista de espera, su
// detalle (DET-01, como DET-01-turno-postulado). Un empleo abre su proceso
// (PRC-01) cuando esté en el router; mientras tanto, su detalle.
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { EmptyState } from '../../../ui/EmptyState';
import { IconBoost, IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import type { DemoApplication } from '../../demo/types';
import { LinkListItem } from '../components/LinkListItem';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import { useGo } from '../navigation';
import { activityPaths } from '../paths';
import { applicationsFor } from '../selectors';
import { useRecienRegistrado } from '../session';
import { useCancelledShifts } from '../shiftStore';
import '../activity.css';

export const screenId = 'ACT-02';

/**
 * A dónde lleva cada postulación. PRC-01 (/procesos/:id) aún no está en el
 * router (pedido en requests): un empleo abre su detalle hasta que se
 * registre; entonces vuelve a `paths.proceso(a.processId)`.
 */
function destinationOf(a: DemoApplication): string {
    if (a.miTurno) return paths.miTurno(a.id);
    return paths.publicacion(a.publicationId);
}

export function ApplicationsScreen() {
    const go = useGo();
    const { actor } = useDemoSession();
    const cancelled = useCancelledShifts();
    const recienRegistrado = useRecienRegistrado(actor.id);
    const applications = applicationsFor(actor, { recienRegistrado });
    const empleos = applications.filter((a) => a.tipo === 'empleo');
    const turnos = applications.filter((a) => a.tipo === 'turno');

    const row = (a: DemoApplication) => (
        <LinkListItem
            key={a.id}
            to={destinationOf(a)}
            avatar={
                <Avatar name={a.autor.nombre} initials={a.autor.iniciales} kind={a.autor.tipo === 'persona' ? 'person' : 'org'} />
            }
            title={a.titulo}
            sub={a.detalle}
            status={<Badge status={cancelled.has(a.id) ? 'Cancelaste' : a.estado} />}
        />
    );

    // Flujo 11: PRF-12 se abre apilado; atrás vuelve aquí, en el mismo scroll.
    const boost = (
        <div className="act-after">
            <ListGroup>
                <LinkListItem
                    to={activityPaths.impulsarPerfil()}
                    icon={IconBoost}
                    title={copy.applications.boostTitle}
                    sub={copy.applications.boostSub}
                    end={<Badge status="Pronto" />}
                />
            </ListGroup>
        </div>
    );

    if (applications.length === 0) {
        const turnosFirst = actor.capabilities.includes('turnos');
        return (
            <Stack gap={4}>
                <EmptyState
                    icon={IconOffers}
                    title={copy.applications.emptyTitle}
                    text={copy.applications.emptyText}
                    action={{
                        label: turnosFirst ? copy.applications.seeShifts : copy.applications.seeJobs,
                        onClick: () => go(paths.explorar(turnosFirst ? 'turno' : 'empleo')),
                    }}
                />
                {boost}
            </Stack>
        );
    }

    // Como en ACT-02: 24 entre grupos (16 + el margen de 8 del Overline «Turnos») y 32 hasta «Impulsa tu perfil».
    return (
        <Stack gap={4}>
            <Stack gap={6}>
                {empleos.length > 0 && <ListGroup label={copy.applications.empleos}>{empleos.map(row)}</ListGroup>}
                {turnos.length > 0 && <ListGroup label={copy.applications.turnos}>{turnos.map(row)}</ListGroup>}
            </Stack>
            {boost}
        </Stack>
    );
}
