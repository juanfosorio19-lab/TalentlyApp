import { describe, expect, it } from 'vitest';
import { groupPhone, nextPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
    it('deja los 8 dígitos tal cual', () => {
        expect(normalizePhone('12345678')).toBe('12345678');
        expect(normalizePhone('1234 5678')).toBe('12345678');
    });

    it('quita +56 9 y los espacios de un número pegado', () => {
        expect(normalizePhone('+56 9 1234 5678')).toBe('12345678');
        expect(normalizePhone('+56912345678')).toBe('12345678');
        expect(normalizePhone('56912345678')).toBe('12345678');
        expect(normalizePhone('0056 9 1234 5678')).toBe('12345678');
    });

    it('quita el 9 inicial de «9 1234 5678»', () => {
        expect(normalizePhone('9 1234 5678')).toBe('12345678');
        expect(normalizePhone('(9) 1234-5678')).toBe('12345678');
    });

    it('no toca un número que empieza con 9 mientras se escribe', () => {
        expect(normalizePhone('9')).toBe('9');
        expect(normalizePhone('9123 4567')).toBe('91234567');
    });

    it('corta lo que sobra', () => {
        expect(normalizePhone('1234567890')).toBe('12345678');
    });
});

describe('nextPhone', () => {
    it('ignora un dígito de más escrito con el número completo', () => {
        expect(nextPhone('91234567', '9123 45678')).toBe('91234567');
        expect(nextPhone('12345678', '1234 56789')).toBe('12345678');
    });

    it('acepta lo pegado sobre el campo vacío o completo', () => {
        expect(nextPhone('', '+56 9 1234 5678')).toBe('12345678');
        expect(nextPhone('87654321', '+56 9 1234 5678')).toBe('12345678');
    });

    it('borra normal', () => {
        expect(nextPhone('12345678', '1234 567')).toBe('1234567');
    });
});

describe('groupPhone', () => {
    it('separa en dos grupos de 4', () => {
        expect(groupPhone('1234')).toBe('1234');
        expect(groupPhone('12345')).toBe('1234 5');
        expect(groupPhone('12345678')).toBe('1234 5678');
    });
});
