import { describe, expect, it } from 'vitest';
import { caretAfterDigits, digitsBefore, groupPhone, nextPhone, normalizePhone } from './phone';

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

describe('cursor del número agrupado', () => {
    it('cuenta los dígitos antes del cursor', () => {
        expect(digitsBefore('91234 5678', 1)).toBe(1);
        expect(digitsBefore('1234 5678', 5)).toBe(4);
        expect(digitsBefore('1234 5678', null)).toBe(8);
        expect(digitsBefore('+56 9 1234', 6)).toBe(3);
    });

    it('deja el cursor después del mismo dígito (salta el espacio)', () => {
        expect(caretAfterDigits('9234 5678', 1)).toBe(1);
        expect(caretAfterDigits('1234 5678', 4)).toBe(4);
        expect(caretAfterDigits('1234 5678', 5)).toBe(6);
        expect(caretAfterDigits('1234 5678', 0)).toBe(0);
        expect(caretAfterDigits('1234 5678', 11)).toBe(9);
    });

    it('Inicio + Supr + «9» sobre «1234 5678» deja «9234 5678» con el cursor tras el 9', () => {
        // Supr: «234 5678», cursor 0.
        const afterDelete = nextPhone('12345678', '234 5678');
        expect(caretAfterDigits(groupPhone(afterDelete), digitsBefore('234 5678', 0))).toBe(0);
        // «9» en el cursor: «9234 5678».
        const raw = `9${groupPhone(afterDelete)}`;
        const next = nextPhone(afterDelete, raw);
        expect(groupPhone(next)).toBe('9234 5678');
        expect(caretAfterDigits(groupPhone(next), digitsBefore(raw, 1))).toBe(1);
    });
});
