import { useId, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconChevronRight } from '../icons';

export interface LegalSection {
    /** Ancla de la sección («cuenta»); única en la pantalla. */
    id: string;
    /** Título sin número: el documento lo numera en el índice y en el H2 («Tu cuenta» → «2. Tu cuenta»). */
    title: string;
    /** Párrafos `<p>` y listas `<ul>`: quedan en Body-L 16/24 en `color-text`. Frases cortas y simples. */
    body: ReactNode;
}

export interface LegalDocumentProps extends Omit<ComponentPropsWithRef<'article'>, 'title' | 'children'> {
    /** H1: «Términos y condiciones», «Política de privacidad». */
    title: string;
    /** La única fecha del documento: «Actualizados el 1 dic 2026». Nada de fechas por sección. */
    updated: ReactNode;
    sections: LegalSection[];
}

/** Con «reducir movimiento», el índice salta sin animar. */
function scrollBehavior(): ScrollBehavior {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Plantilla de los textos legales (LEG-01 Términos, LEG-02 Privacidad). Va en
 * una pantalla apilada con AppBar standard: H1, una sola fecha, el índice «En
 * esta página» y las secciones con H2 numerado.
 */
export function LegalDocument({ title, updated, sections, className, ...rest }: LegalDocumentProps) {
    const indexTitleId = useId();

    // El índice baja a la sección y le pasa el foco a su H2, sin tocar la URL:
    // así el atrás de Android sale de la pantalla en vez de recorrer anclas.
    const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
        const section = e.currentTarget.closest('.tl-legal')?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
        if (!section) return;
        e.preventDefault();
        section.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
        section.querySelector<HTMLElement>(':scope > h2')?.focus({ preventScroll: true });
    };

    // Brecha abierta: preview.html anula en línea el margen del H1 y da margin 0 +
    // color-text-2 al overline del índice; bundle.css aún no lo trae (falta
    // `.tl-legal > header > h1` y `.tl-legal__index > .overline` vía Claude Design).
    return (
        <article className={cx('tl-legal', className)} {...rest}>
            <header>
                <h1 className="h1">{title}</h1>
                <p className="tl-legal__updated">{updated}</p>
            </header>
            <nav className="tl-legal__index" aria-labelledby={indexTitleId}>
                <p className="overline" id={indexTitleId}>En esta página</p>
                <ul className="tl-list">
                    {sections.map((s, i) => (
                        <li key={s.id}>
                            <a className="tl-listitem" href={`#${s.id}`} onClick={(e) => goTo(e, s.id)}>
                                <span className="tl-listitem__body">
                                    <span className="tl-listitem__title">{`${i + 1}. ${s.title}`}</span>
                                </span>
                                <span className="tl-listitem__end">
                                    <IconChevronRight />
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            {sections.map((s, i) => (
                <section key={s.id} className="tl-legal__section" id={s.id}>
                    <h2 className="h2 tl-focus" tabIndex={-1}>{`${i + 1}. ${s.title}`}</h2>
                    {s.body}
                </section>
            ))}
        </article>
    );
}
