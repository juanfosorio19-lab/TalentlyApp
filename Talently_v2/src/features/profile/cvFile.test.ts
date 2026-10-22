import { describe, expect, it } from 'vitest';
import { CV_MAX_BYTES, checkCvFile, isPdf, sizeText } from './cvFile';

describe('CV en PDF', () => {
    it('solo acepta PDF (por tipo, o por extensión si el selector no dice el tipo)', () => {
        expect(isPdf({ name: 'cv.pdf', type: 'application/pdf', size: 1 })).toBe(true);
        expect(isPdf({ name: 'CV Jorge.PDF', type: '', size: 1 })).toBe(true);
        expect(isPdf({ name: 'cv.pdf', type: 'application/octet-stream', size: 1 })).toBe(true);
        expect(isPdf({ name: 'foto.jpg', type: 'image/jpeg', size: 1 })).toBe(false);
        // Una foto renombrada sigue siendo una foto.
        expect(isPdf({ name: 'foto.pdf', type: 'image/jpeg', size: 1 })).toBe(false);
        expect(isPdf({ name: 'cv.docx', type: '', size: 1 })).toBe(false);
    });

    it('rechaza lo que no es PDF o pesa más de 10 MB', () => {
        expect(checkCvFile({ name: 'cv.pdf', type: 'application/pdf', size: CV_MAX_BYTES })).toBe('ok');
        expect(checkCvFile({ name: 'cv.pdf', type: 'application/pdf', size: CV_MAX_BYTES + 1 })).toBe('muy-grande');
        expect(checkCvFile({ name: 'foto.png', type: 'image/png', size: 10 })).toBe('no-pdf');
    });

    it('muestra el peso como en la app', () => {
        expect(sizeText(180 * 1024)).toBe('180 KB');
        expect(sizeText(200)).toBe('1 KB');
        expect(sizeText(1.4 * 1024 * 1024)).toBe('1,4 MB');
        expect(sizeText(14 * 1024 * 1024)).toBe('14 MB');
    });
});
