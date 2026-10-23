// ACT-02 · Actividad · Postulaciones (prototipo ACT-02, ACT-02-jorge,
// ACT-02-matias y ACT-02-desplazado): Empleos y Turnos con su Badge de estado
// y, al final, «Impulsa tu perfil» (flujo 11 → PRF-12). Lee las postulaciones
// de la sesión (useApplications): las enviadas en DET-01/DET-02 aparecen
// aquí, las que el prototipo muestra antes de postular no, y un turno
// cancelado en TUR-01 dice «Cancelaste», igual que en la Agenda e Inicio.
// Un turno confirmado abre Mi turno (TUR-01, flujo 2); un empleo, su proceso
// (PRC-01); un turno postulado o en lista de espera, su detalle (DET-01). Los
// turnos van por fecha y hora de inicio (sortShiftsByStart).
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { EmptyState } from '../../../ui/EmptyState';
import { IconBoost, IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { ListItem } from '../../../ui/ListItem';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { useApplications } from '../../demo/sessionStore';
import type { DemoApplication } from '../../demo/types';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import { applicationPath, sortShiftsByStart } from '../selectors';
import '../activity.css';

export const screenId = 'ACT-02';

export function ApplicationsScreen() {
    const { open, linkProps } = useOpenPath();
    const { actor, recienRegistrado } = useDemoSession();
    const applications = useApplications(actor.id, recienRegistrado);
    const empleos = applications.filter((a) => a.tipo === 'empleo');
    // Los turnos, por fecha y hora de inicio (ACT-02-matias): el que se toma en el flujo 2 queda en su día, no arriba.
    const turnos = sortShiftsByStart(applications.filter((a) => a.tipo === 'turno'));

    const row = (a: DemoApplication) => (
        <ListItem
            key={a.id}
            {...linkProps(applicationPath(a))}
            avatar={
                <Avatar name={a.autor.nombre} initials={a.autor.iniciales} kind={a.autor.tipo === 'persona' ? 'person' : 'org'} />
            }
            title={a.titulo}
            sub={a.detalle}
            status={<Badge status={a.estado} />}
        />
    );

    // Flujo 11: PRF-12 se abre apilado; atrás vuelve aquí, en el mismo scroll.
    const boost = (
        <div className="act-after">
            <ListGroup>
                <ListItem
                    {...linkProps(paths.impulsar())}
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
                        // Otra pestaña: se cambia con replace (spec §5.3 regla 1).
                        onClick: () => open(paths.explorar(turnosFirst ? 'turno' : 'empleo'), { replace: true }),
                    }}
                />
                {boost}
            </Stack>
        );
    }

    // Como en ACT-02: 16 entre grupos más el margen de 8 del Overline «Turnos» (24), y 32 hasta «Impulsa tu perfil».
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
