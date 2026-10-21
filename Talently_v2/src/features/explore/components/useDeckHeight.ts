// Alto mínimo de la tarjeta del deck (prop `cardMinHeight` de
// PublicationCardDeck): la tarjeta llena el espacio entre el SegmentedControl
// y el ActionPair sin que la pantalla scrollee (EXP-01, README del deck: «alto
// que llena el espacio entre el SegmentedControl y el ActionPair»). Provisorio
// mientras bundle.css no estire `.tl-deck` al alto disponible (brecha del deck).
// Todo se mide en el DOM (TabBar, padding del contenido): nada escrito a mano.
import { useEffect, useState, type RefObject } from 'react';

export function useDeckHeight(deckRef: RefObject<HTMLElement | null>, enabled: boolean): number | undefined {
    const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        const wrapper = deckRef.current;
        if (!enabled || !wrapper) return;
        const measure = () => {
            const card = wrapper.querySelector<HTMLElement>('.tl-deck__card:not(.tl-deck__card--next)');
            if (!card) return;
            const tabbar = document.querySelector('.tl-tabbar')?.getBoundingClientRect().height ?? 0;
            const content = wrapper.closest('.tl-app-screen__content');
            const padBottom = content ? parseFloat(getComputedStyle(content).paddingBottom) || 0 : 0;
            // Donde debe terminar el deck (con su ActionPair) en la primera pantalla, en coordenadas de página.
            const target = window.innerHeight - tabbar - padBottom;
            const bottom = wrapper.getBoundingClientRect().bottom + window.scrollY;
            const next = Math.round(card.offsetHeight + (target - bottom));
            setMinHeight((prev) => (prev !== undefined && Math.abs(prev - next) < 1 ? prev : next));
        };
        // ResizeObserver avisa al observar (y cada vez que cambian las tarjetas o la ventana).
        const ro = new ResizeObserver(measure);
        ro.observe(wrapper);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [deckRef, enabled]);

    return enabled ? minHeight : undefined;
}
