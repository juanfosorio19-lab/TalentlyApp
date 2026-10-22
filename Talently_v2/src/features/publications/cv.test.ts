import { describe, expect, it } from 'vitest';
import { cvProblem, isPdf, sizeText } from './cv';

describe('CV de DET-02', () => {
    it('acepta un PDF de hasta 10 MB', () => {
        expect(cvProblem({ name: 'CV Pedro Valdés.pdf', size: 180 * 1024, type: 'application/pdf' })).toBeNull();
    });

    it('rechaza la foto de «Tomar foto» y cualquier otro archivo', () => {
        expect(cvProblem({ name: 'foto.jpg', size: 900 * 1024, type: 'image/jpeg' })).toEqual({ kind: 'not-pdf' });
        expect(cvProblem({ name: 'cv.docx', size: 20 * 1024, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toEqual({
            kind: 'not-pdf',
        });
    });

    it('sin tipo MIME, mira la extensión', () => {
        expect(isPdf({ name: 'CV.PDF', type: '' })).toBe(true);
        expect(isPdf({ name: 'cv.png', type: '' })).toBe(false);
    });

    it('rechaza un PDF de más de 10 MB con su peso', () => {
        expect(cvProblem({ name: 'cv.pdf', size: 14 * 1024 * 1024, type: 'application/pdf' })).toEqual({ kind: 'too-big', size: '14,0 MB' });
    });

    it('escribe el peso en KB o MB', () => {
        expect(sizeText(180 * 1024)).toBe('180 KB');
        expect(sizeText(10)).toBe('1 KB');
        expect(sizeText(2.4 * 1024 * 1024)).toBe('2,4 MB');
    });
});
