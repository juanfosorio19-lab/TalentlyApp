import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { legalContent, type LegalDoc } from './content';

const DOCS: LegalDoc[] = ['terminos', 'privacidad'];
const link = (_doc: LegalDoc, label: string) => label;

function text(doc: LegalDoc): string {
    const { title, updated, sections } = legalContent(doc, link);
    const body = sections.map((s) => `${s.title}\n${renderToStaticMarkup(<>{s.body}</>)}`).join('\n');
    return `${title}\n${updated}\n${body}`;
}

describe('LEG-01 y LEG-02 · resumen honesto mientras falta el texto legal', () => {
    it.each(DOCS)('%s: secciones con ancla única y la sección de contacto', (doc) => {
        const { sections } = legalContent(doc, link);
        const ids = sections.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toContain('contacto');
    });

    it.each(DOCS)('%s: sin razón social, RUT, dirección, correo ni fecha de vigencia inventados', (doc) => {
        const t = text(doc);
        expect(t).not.toMatch(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/); // RUT
        expect(t).not.toMatch(/@|https?:\/\//); // correo o sitio
        expect(t).not.toMatch(/\b(SpA|S\.A\.|Ltda|EIRL)\b/);
        expect(t).not.toMatch(/Madrid|Avenida|Av\.|calle /i);
        expect(t).not.toMatch(/\b20\d\d\b/); // ninguna fecha de vigencia
    });

    it('Privacidad resume los derechos de la Ley 21.719 (acceso, rectificación, supresión, oposición y portabilidad)', () => {
        const t = text('privacidad');
        expect(t).toContain('Ley 21.719');
        for (const derecho of ['ver qué datos', 'corregirlos', 'borrarlos', 'dejemos de usarlos', 'llevártelos']) {
            expect(t).toContain(derecho);
        }
    });
});
