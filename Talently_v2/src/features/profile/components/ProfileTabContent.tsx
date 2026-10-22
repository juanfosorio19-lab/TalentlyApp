// Contenido de un perfil (Trabajo, Hogar u Organización): la tarjeta «Te falta
// 1 cosa», sus secciones editables y las hojas que abren, en la URL (spec
// §5.4): PRF-03 es `?sheet=editar&s=<sección>` y Subir CV, `?sheet=cv`.
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from '../../../ui/Snackbar';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import type { DemoProfileSection, DemoProfileTab } from '../../demo/types';
import { COPY, SAVED_BY_SECTION } from '../copy';
import { editAction, findEditable, isCvAction, sectionSlug, tipAction, type EditableSection } from '../model';
import { useStillSheet } from '../useStillSheet';
import { CvSheet, type CvFile } from './CvSheet';
import { EditSectionSheet } from './EditSectionSheet';
import { ProfileSection } from './ProfileSection';
import { ProfileTip } from './ProfileTip';

export interface ProfileTabContentProps {
    tab: DemoProfileTab;
    /** Comuna del actor («Desde Puente Alto.» al editar la distancia). */
    comuna: string;
    onChange: (next: DemoProfileTab) => void;
}

export function ProfileTabContent({ tab, comuna, onChange }: ProfileTabContentProps) {
    const { show } = useSnackbar();
    const { open: openPath, soon } = useOpenPath();
    const editar = useStillSheet('editar');
    const cv = useStillSheet('cv');

    // ─── PRF-03 · Editar sección ────────────────────────────────────────────
    const slug = editar.param('s');
    const target = findEditable(tab, slug);
    // Mientras la hoja sale (la URL ya no dice `s`), sigue mostrando la sección que se editaba.
    const [shownSlug, setShownSlug] = useState(slug);
    if (target && slug !== shownSlug) setShownSlug(slug);
    const shown = target ?? findEditable(tab, shownSlug);

    // Un enlace con una sección que no existe o no se edita aquí: la hoja no se abre y sale de la URL,
    // con su `s` (hide() de useSheet solo quita `sheet`; pedido en «requests»).
    const [, setParams] = useSearchParams();
    const invalidLink = editar.open && !target;
    useEffect(() => {
        if (!invalidLink) return;
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('sheet');
                next.delete('s');
                return next;
            },
            { replace: true, preventScrollReset: true },
        );
    }, [invalidLink, setParams]);

    // ─── Subir CV ───────────────────────────────────────────────────────────
    const cvIndex = tab.secciones.findIndex((s) => s.titulo === 'CV');
    const cvSection = tab.secciones[cvIndex];
    const currentCv: CvFile | undefined =
        cvSection?.tipo === 'archivo' ? { nombre: cvSection.nombre, detalle: cvSection.detalle } : undefined;

    // Quien abrió la hoja del CV («Subir CV» de «Te falta 1 cosa» o de la sección vacía) desaparece al
    // guardar: cuando la hoja termina de cerrarse, el foco pasa a la tarjeta CV en vez de caer en <body>.
    const cvOpener = useRef<Element | null>(null);
    const cvSaved = useRef(false);
    const cvCard = useRef<HTMLElement>(null);
    useEffect(() => {
        if (cv.open || !cvSaved.current) return;
        cvSaved.current = false;
        if (!cvOpener.current?.isConnected) cvCard.current?.focus();
    }, [cv.open]);

    const openCv = () => {
        cvOpener.current = document.activeElement;
        cv.show();
    };

    const onTip = () => {
        if (!tab.completitud) return;
        const action = tipAction(tab.completitud);
        if (action.kind === 'cv') openCv();
        else openPath(action.path);
    };

    const onEdit = (section: DemoProfileSection) => {
        switch (editAction(section)) {
            case 'cv':
                openCv();
                break;
            // Credenciales: el lápiz lleva a Verificación y credenciales (VER-01), como en el prototipo.
            case 'verificacion':
                openPath(paths.verificacion());
                break;
            case 'editar':
                editar.show({ s: sectionSlug(section.titulo) });
                break;
        }
    };

    const saveSection = (index: number, next: EditableSection) => {
        onChange({ ...tab, secciones: tab.secciones.map((s, i) => (i === index ? next : s)) });
        editar.hide();
        show({ message: SAVED_BY_SECTION[next.titulo] ?? COPY.editar.guardado, tone: 'success' });
    };

    const saveCv = (file: CvFile) => {
        const archivo: DemoProfileSection = { tipo: 'archivo', titulo: 'CV', nombre: file.nombre, detalle: file.detalle, editable: true };
        const secciones = cvIndex >= 0 ? tab.secciones.map((s, i) => (i === cvIndex ? archivo : s)) : [...tab.secciones, archivo];
        // Con el CV arriba, «Te falta 1 cosa» ya no aplica.
        const completitud = tab.completitud && isCvAction(tab.completitud.accion) ? undefined : tab.completitud;
        onChange({ ...tab, secciones, completitud });
        cvSaved.current = true;
        cv.hide();
        show({ message: COPY.cv.guardado, tone: 'success' });
    };

    const last = tab.secciones.length - 1;

    return (
        <>
            {tab.completitud && <ProfileTip tip={tab.completitud} onAction={onTip} />}
            {tab.secciones.map((section, i) => (
                <ProfileSection
                    key={section.titulo}
                    section={section}
                    onEdit={() => onEdit(section)}
                    onEmptyAction={section.titulo === 'CV' ? openCv : soon}
                    foot={i === last ? tab.pie : undefined}
                    focusRef={section.titulo === 'CV' ? cvCard : undefined}
                />
            ))}
            {shown && (
                <EditSectionSheet
                    key={shownSlug ?? ''}
                    open={editar.open && target !== undefined}
                    section={shown.section}
                    comuna={comuna}
                    onClose={editar.hide}
                    onSave={(next) => saveSection(shown.index, next)}
                />
            )}
            <CvSheet open={cv.open} current={currentCv} onClose={cv.hide} onSave={saveCv} />
        </>
    );
}
