import { describe, expect, it } from 'vitest';
import { findContactInfo, hasContactInfo } from './contactInfo';

describe('teléfonos chilenos', () => {
    it.each([
        'Te dejo mi número: +56 9 1234 5678',
        '+56912345678',
        '912345678',
        'Llámame al 9 1234 5678.',
        'mi cel es 9-1234-5678',
        '(9) 1234 5678',
        '56 9 1234 5678',
        '+56 2 2123 4567',
        'fijo 22 123 4567',
        'en Valparaíso: 32 212 3456',
        '(+56) 9 8765 4321',
        '9.1234.5678',
        '+54 9 11 2345 6789',
    ])('avisa con «%s»', (text) => {
        expect(findContactInfo(text)).toBe('phone');
    });

    it.each([
        '¿A qué hora termina el turno?',
        'Son $35.000 líquidos por turno',
        'Ofrecen 650.000 líquidos al mes',
        '$35.000.000 al año',
        'Mi RUT es 12.345.678-9',
        'RUT 9.876.543-2',
        'Mi RUT es 21456789-3',
        'Emitido el 30-11-2026',
        'Nos vemos el 12/12/2026 a las 17:30',
        'De 18.00 - 23.30',
        'Quedan 3 de 8 cupos',
        'Gran Avenida 5530, San Miguel',
        'Pedido 123456789',
        '12345678',
    ])('no avisa con «%s»', (text) => {
        expect(findContactInfo(text)).toBeNull();
    });
});

describe('enlaces', () => {
    it.each([
        'Mira www.minegocio.cl',
        'www.instagram.com/rosa',
        'http://talently.app',
        'https://bit.ly/abc123',
        'escríbeme a rosa.munoz@gmail.com',
        'Está en banqueteriarosa.cl',
        'mi-negocio.com.ar',
        'por wa.me/56912345678',
        'mi canal t.me/banqueteria',
    ])('avisa con «%s»', (text) => {
        expect(findContactInfo(text)).toBe('link');
    });

    it.each([
        'Nos vemos.me avisas cuando llegues',
        'Ok.Claro que sí',
        'Ya comí.como a las 3',
        'Av. Concha y Toro 1234, Puente Alto',
        'Banquetería Rosa SpA. Gracias',
        'Más info en la entrevista',
        'Llego a las 17:30 con camisa blanca y pantalón negro.',
    ])('no avisa con «%s»', (text) => {
        expect(findContactInfo(text)).toBeNull();
    });
});

describe('hasContactInfo', () => {
    it('es true con un teléfono o un enlace y false sin ellos', () => {
        expect(hasContactInfo('+56 9 1234 5678')).toBe(true);
        expect(hasContactInfo('www.')).toBe(false);
        expect(hasContactInfo('www.talently.cl')).toBe(true);
        expect(hasContactInfo('http')).toBe(false);
        expect(hasContactInfo('')).toBe(false);
    });

    it('desaparece al borrar el número', () => {
        expect(hasContactInfo('Te dejo mi número: +56 9 1234 5678')).toBe(true);
        expect(hasContactInfo('Te dejo mi número: +56 9 12')).toBe(false);
    });
});
