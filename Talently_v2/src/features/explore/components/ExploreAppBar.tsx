// AppBar large de la pestaña Explorar (spec §5.1): Buscar, Filtros con su
// contador (solo aquí) y la campana con las notificaciones sin leer reales.
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell, IconFilter, IconSearch } from '../../../ui/icons';
import { getHomeFeed } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { copy } from '../copy';
import { useLinks } from './useLinks';

export interface ExploreAppBarProps {
    /** Filtros activos del segmento (contador del botón). */
    filterCount: number;
    /** Abre la hoja de filtros (EXP-06). Sin él, no hay nada que filtrar y el botón no aparece. */
    onFilters?: () => void;
}

export function ExploreAppBar({ filterCount, onFilters }: ExploreAppBarProps) {
    const { actor } = useDemoSession();
    const { go } = useLinks();
    const scrolled = useScrolled();
    const unread = getHomeFeed(actor.id).notificacionesSinLeer;
    return (
        <AppBar
            title={copy.titulo}
            scrolled={scrolled}
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
