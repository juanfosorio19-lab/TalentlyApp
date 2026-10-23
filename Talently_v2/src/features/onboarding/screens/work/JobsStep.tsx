// ONB-T1 · ¿En qué quieres trabajar? (/onboarding/trabajo/1). Hasta 3
// oficios (SHT-OFICIO, `?sheet=oficio`), uno principal y los años de
// experiencia de cada uno (`?sheet=experiencia&oficio=<id>`: la hoja vive en
// la URL y el atrás la cierra sin salir del paso, spec §5.3 regla 3).
import { useEffect, useId, useRef, useState } from 'react';
import { useSheet } from '../../../../app/sheets';
import { Badge } from '../../../../ui/Badge';
import { Button } from '../../../../ui/Button';
import { Card } from '../../../../ui/Card';
import { JOB_CATEGORY_ICONS } from '../../../../ui/CategoryGrid';
import { cx } from '../../../../ui/cx';
import { IconAdd, IconAlert, IconTrash } from '../../../../ui/icons';
import { IconButton } from '../../../../ui/IconButton';
import { Stack } from '../../../../ui/Layout';
import { Select } from '../../../../ui/Select';
import { SheetPicker } from '../../../../ui/SheetPicker';
import { StepLayout } from '../../../../ui/StepLayout';
import { EXPERIENCIAS, getOficio, type Experiencia } from '../../catalog';
import { COPY } from '../../copy';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import { OFICIO_SHEET, OficioSheet, categoryName } from '../../components/PickerSheets';
import { MAX_OFICIOS, agregarOficio, oficiosDisponibles, quitarOficio } from '../../model';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T1';

const C = COPY.trabajo.oficios;

const experienceId = (oficioId: string) => `onb-exp-${oficioId}`;
const nameId = (oficioId: string) => `onb-name-${oficioId}`;

/** La hoja «Años de experiencia» (Select de cada oficio), con el oficio en `oficio`. */
const EXPERIENCIA_SHEET = 'experiencia';

export function JobsStep() {
    const { draft, layout, next } = useWorkStep(1);
    const { trabajo } = draft;
    const oficioSheet = useSheet(OFICIO_SHEET);
    const expSheet = useSheet(EXPERIENCIA_SHEET);
    const expOficio = trabajo.oficios.find((o) => o.id === expSheet.param('oficio')) ?? null;
    const labelId = useId();
    const addRef = useRef<HTMLButtonElement>(null);
    const [intentado, setIntentado] = useState(false);
    // A dónde va el foco cuando lo tocado desaparece (oficio agregado, quitado o marcado principal).
    const pendingFocus = useRef<'add' | 'title' | { experiencia: string } | null>(null);

    useEffect(() => {
        const target = pendingFocus.current;
        // Se espera a que la hoja de oficios se cierre (si no, la hoja retiene el foco).
        if (!target || oficioSheet.open) return;
        pendingFocus.current = null;
        if (target === 'add') addRef.current?.focus();
        else if (target === 'title') document.querySelector<HTMLElement>('.tl-steplayout__title')?.focus();
        else document.getElementById(experienceId(target.experiencia))?.focus();
    }, [oficioSheet.open, trabajo.oficios, trabajo.principal]);

    // Un `?sheet=experiencia` de un oficio que ya no está (enlace viejo, adelante del navegador) se quita.
    const { open: expOpen, hide: hideExp } = expSheet;
    useEffect(() => {
        if (expOpen && !expOficio) hideExp();
    }, [expOpen, expOficio, hideExp]);

    const sinOficios = trabajo.oficios.length === 0;
    const errorOficios = intentado && sinOficios ? C.errOficios : undefined;

    const continuar = () => {
        setIntentado(true);
        if (sinOficios) {
            addRef.current?.focus();
            return;
        }
        const sinExperiencia = trabajo.oficios.find((o) => o.experiencia === null);
        if (sinExperiencia) {
            document.getElementById(experienceId(sinExperiencia.id))?.focus();
            return;
        }
        next();
    };

    const setExperiencia = (id: string, experiencia: Experiencia) =>
        setTrabajo((t) => ({ ...t, oficios: t.oficios.map((o) => (o.id === id ? { ...o, experiencia } : o)) }));

    return (
        <>
            <StepLayout title={C.titulo} subtitle={C.sub} {...layout} onContinue={continuar}>
                <div className={cx('tl-chipgroup', errorOficios && 'is-error')} role="group" aria-labelledby={labelId}>
                    <div className="tl-chipgroup__head">
                        <span className="tl-chipgroup__label" id={labelId}>
                            {C.tus}
                        </span>
                        <span className="tl-chipgroup__count" aria-live="polite">
                            {trabajo.oficios.length} de {MAX_OFICIOS}
                        </span>
                    </div>
                    <Stack gap={3}>
                        {trabajo.oficios.map((elegido) => {
                            const oficio = getOficio(elegido.id);
                            if (!oficio) return null;
                            const Tile = JOB_CATEGORY_ICONS[oficio.category];
                            const principal = trabajo.principal === elegido.id;
                            return (
                                <Card key={elegido.id}>
                                    <Stack gap={4}>
                                        <Stack row gap={3} align="start">
                                            <span className="tl-listitem__tile">
                                                <Tile />
                                            </span>
                                            <Stack gap={2} align="start" className="onb-grow">
                                                <div>
                                                    <p id={nameId(elegido.id)} className="button-lg onb-flush">
                                                        {oficio.name}
                                                    </p>
                                                    <p className="body onb-muted onb-flush">{categoryName(oficio)}</p>
                                                </div>
                                                {principal ? (
                                                    <Badge status="Principal" />
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="onb-pull"
                                                        aria-describedby={nameId(elegido.id)}
                                                        onClick={() => {
                                                            pendingFocus.current = 'title';
                                                            setTrabajo({ principal: elegido.id });
                                                        }}
                                                    >
                                                        {C.marcar}
                                                    </Button>
                                                )}
                                            </Stack>
                                            <IconButton
                                                icon={IconTrash}
                                                label={C.quitar(oficio.name)}
                                                className="onb-trash"
                                                onClick={() => {
                                                    pendingFocus.current = 'add';
                                                    setTrabajo((t) => quitarOficio(t, elegido.id));
                                                }}
                                            />
                                        </Stack>
                                        <Select<Experiencia>
                                            id={experienceId(elegido.id)}
                                            label={C.experiencia}
                                            placeholder={C.experienciaPlaceholder}
                                            options={EXPERIENCIAS}
                                            value={elegido.experiencia}
                                            onChange={(v) => setExperiencia(elegido.id, v)}
                                            searchable={false}
                                            error={intentado && elegido.experiencia === null ? C.errExperiencia : undefined}
                                            // La hoja vive en la URL (`?sheet=experiencia`): la propia del Select no se abre.
                                            aria-expanded={expOficio?.id === elegido.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                expSheet.show({ oficio: elegido.id });
                                            }}
                                        />
                                    </Stack>
                                </Card>
                            );
                        })}
                        {trabajo.oficios.length < MAX_OFICIOS && (
                            <Button
                                ref={addRef}
                                variant="outline"
                                block
                                icon={IconAdd}
                                aria-haspopup="dialog"
                                aria-describedby={errorOficios ? `${labelId}-e` : undefined}
                                onClick={() => oficioSheet.show()}
                            >
                                {sinOficios ? C.agregarPrimero : C.agregar}
                            </Button>
                        )}
                    </Stack>
                    <div className="tl-chipgroup__note tl-chipgroup__note--error" id={`${labelId}-e`}>
                        <IconAlert size={16} />
                        <span>{errorOficios}</span>
                    </div>
                </div>
            </StepLayout>
            <SheetPicker<Experiencia>
                open={expSheet.open && expOficio !== null}
                onClose={expSheet.hide}
                title={C.experiencia}
                options={EXPERIENCIAS}
                value={expOficio?.experiencia ?? null}
                onChange={(v) => {
                    if (expOficio) setExperiencia(expOficio.id, v);
                }}
                searchable={false}
            />
            <OficioSheet
                options={oficiosDisponibles(trabajo)}
                onChange={(id) => {
                    pendingFocus.current = { experiencia: id };
                    setTrabajo((t) => agregarOficio(t, id));
                }}
            />
            <OnboardingMenu />
        </>
    );
}
