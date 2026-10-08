// ACT-02 · Actividad · Postulaciones (prototipo ACT-02, ACT-02-jorge,
// ACT-02-matias y ACT-02-desplazado): Empleos y Turnos con su Badge de estado
// y, al final, «Impulsa tu perfil» (flujo 11). Un empleo abre su proceso
// (PRC-01); un turno confirmado, Mi turno (TUR-01, flujo 2); un turno
// postulado o en lista de espera, su detalle (DET-01).
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { EmptyState } from '../../../ui/EmptyState';
import { IconBoost, IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { getApplications } from '../../demo/data';
import type { DemoApplication } from '../../demo/types';
import { LinkListItem } from '../components/LinkListItem';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import { activityPaths } from '../paths';
import { useCancelledShifts } from '../shiftStore';

export const screenId = 'ACT-02';

/** A dónde lleva cada postulación. */
function destinationOf(a: DemoApplication): string {
    if (a.miTurno) return paths.miTurno(a.id);
    if (a.processId) return paths.proceso(a.processId);
    return paths.publicacion(a.publicationId);
}

export function ApplicationsScreen() {
    const navigate = useNavigate();
    const { actor } = useDemoSession();
    const cancelled = useCancelledShifts();
    const applications = getApplications(actor.id);
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

    const boost = (
        <ListGroup>
            <LinkListItem
                to={activityPaths.impulsarPerfil()}
                icon={IconBoost}
                title={copy.applications.boostTitle}
                sub={copy.applications.boostSub}
                end={<Badge status="Pronto" />}
            />
        </ListGroup>
    );

    if (applications.length === 0) {
        const turnosFirst = actor.capabilities.includes('turnos');
        return (
            <Stack gap={6}>
                <EmptyState
                    icon={IconOffers}
                    title={copy.applications.emptyTitle}
                    text={copy.applications.emptyText}
                    action={{
                        label: turnosFirst ? copy.applications.seeShifts : copy.applications.seeJobs,
                        onClick: () => navigate(paths.explorar(turnosFirst ? 'turno' : 'empleo')),
                    }}
                />
                {boost}
            </Stack>
        );
    }

    return (
        <Stack gap={6}>
            {empleos.length > 0 && <ListGroup label={copy.applications.empleos}>{empleos.map(row)}</ListGroup>}
            {turnos.length > 0 && <ListGroup label={copy.applications.turnos}>{turnos.map(row)}</ListGroup>}
            {boost}
        </Stack>
    );
}
