import { describe, expect, it } from 'vitest';
import { paths } from '../../app/paths';
import { getApplications, getPublication } from '../demo/data';
import { DEMO_ACTORS } from '../demo/session';
import type { DemoPublication } from '../demo/types';
import { detailCta, ownerFor, shareUrl } from './model';

const pub = (id: string): DemoPublication => {
    const p = getPublication(id);
    if (!p) throw new Error(id);
    return p;
};

describe('CTA de DET-01', () => {
    it('quien publica gestiona; la persona que administra la organización también', () => {
        const turno = pub('turno-garzones-matrimonio');
        expect(detailCta(DEMO_ACTORS.banqueteria, turno, [])).toEqual({ kind: 'own', ownerId: 'banqueteria' });
        expect(detailCta(DEMO_ACTORS.rosa, turno, [])).toEqual({ kind: 'own', ownerId: 'banqueteria' });
        expect(ownerFor(DEMO_ACTORS.matias, turno)).toBeUndefined();
    });

    it('una organización no postula a la publicación de otra', () => {
        expect(detailCta(DEMO_ACTORS.banqueteria, pub('empleo-mecanico-automotriz'), [])).toEqual({ kind: 'org' });
    });

    it('sin postulación, el turno se puede tomar', () => {
        expect(detailCta(DEMO_ACTORS.matias, pub('turno-garzones-matrimonio'), [])).toEqual({ kind: 'open', waitlist: false });
    });

    it('con postulación lleva a ACT-02 (turno) o a PRC-01 (empleo con proceso)', () => {
        const turno = detailCta(DEMO_ACTORS.matias, pub('turno-garzones-matrimonio'), getApplications('matias'));
        expect(turno).toMatchObject({ kind: 'applied', to: paths.actividad('postulaciones'), label: 'Ver mis postulaciones' });
        const empleo = detailCta(DEMO_ACTORS.pedro, pub('empleo-mecanico-automotriz'), getApplications('pedro'));
        expect(empleo).toMatchObject({ kind: 'applied', to: paths.proceso('proc-pedro-mecanico'), label: 'Ver mi postulación' });
    });

    it('lo elegido en la sesión manda sobre el dato', () => {
        const cta = detailCta(DEMO_ACTORS.matias, pub('turno-garzones-matrimonio'), [], 'En lista de espera');
        expect(cta).toMatchObject({ kind: 'applied', estado: 'En lista de espera' });
    });
});

describe('enlace para compartir', () => {
    it('sin ?demo= ni la hoja abierta', () => {
        const url = shareUrl({ origin: 'https://talently.cl', pathname: '/v3.html' }, '#/p/empleo-mecanico-automotriz');
        expect(url).toBe('https://talently.cl/v3.html#/p/empleo-mecanico-automotriz');
        expect(shareUrl({ origin: 'https://talently.cl', pathname: '/inicio' }, '/p/x')).toBe('https://talently.cl/p/x');
    });
});
