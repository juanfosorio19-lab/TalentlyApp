// AppBar large de la pestaña Explorar (spec §5.1): Buscar, Filtros con su
// contador (solo aquí) y la campana con las notificaciones sin leer reales
// (useInbox: la misma cifra que Inicio y NOT-01).
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell, IconFilter, IconSearch } from '../../../ui/icons';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import { copy } from '../copy';
import { useGo } from './hooks';

export interface ExploreAppBarProps {
    /** Filtros activos del segmento (contador del botón). */
    filterCount: number;
    /** Abre la hoja de filtros (EXP-06). Sin él, no hay nada que filtrar y el botón no aparece. */
    onFilters?: () => void;
}

export function ExploreAppBar({ filterCount, onFilters }: ExploreAppBarProps) {
    const { actor, recienRegistrado } = useDemoSession();
    const { unread } = useInbox(actor.id, recienRegistrado);
    const { go } = useGo();
    const scrolled = useScrolled();
    return (
        <AppBar
            title={copy.titulo}
            scrolled={scrolled}
            // Sobre la cabecera fija (SegmentedControl y chips), para que su sombra se vea encima.
            className="explore-appbar"
            actions={
                <>
                    <IconButton icon={IconSearch} label={copy.appBar.buscar} onClick={() => go(paths.buscar())} />
                    {onFilters && (
                        <IconButton
                            icon={IconFilter}
                            label={copy.appBar.filtros(filterCount)}
                            count={filterCount}
                            aria-haspopup="dialog"
                            onClick={onFilters}
                        />
                    )}
                    <IconButton
                        icon={IconBell}
                        label={copy.appBar.notificaciones(unread)}
                        count={unread}
                        onClick={() => go(paths.notificaciones())}
                    />
                </>
            }
        />
    );
}
