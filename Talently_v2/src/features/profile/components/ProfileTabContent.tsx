// Contenido de un perfil (Trabajo, Hogar u Organización): la tarjeta «Te falta
// 1 cosa», sus secciones editables y las hojas que abren, en la URL (spec
// §5.4): PRF-03 es `?sheet=editar&s=<sección>` y Subir CV, `?sheet=cv`.
import { useSheet } from '../../../app/sheets';
import { useEffect, useRef, useState } from 'react';
import { useSnackbar } from '../../../ui/Snackbar';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { saveCv as saveSessionCv } from '../../demo/profileState';
import { useDemoSession } from '../../demo/session';
import type { DemoProfileSection, DemoProfileTab } from '../../demo/types';
import { COPY, SAVED_BY_SECTION } from '../copy';
import { editAction, findEditable, sectionSlug, tipAction, type EditableSection } from '../model';
import { CvSheet, type CvFile } from './CvSheet';
import { EditSectionSheet } from './EditSectionSheet';
import { ProfileSection } from './ProfileSection';
import { ProfileTip } from './ProfileTip';

const IDIOMAS = 'Idiomas';

export interface ProfileTabContentProps {
    tab: DemoProfileTab;
    /** Comuna del actor («Desde Puente Alto.» al editar la distancia). */
    comuna: string;
    onChange: (next: DemoProfileTab) => void;
}

export function ProfileTabContent({ tab, comuna, onChange }: ProfileTabContentProps) {
    const { show } = useSnackbar();
    const { actor, recienRegistrado } = useDemoSession();
    const { open: openPath, soon } = useOpenPath();
    const editar = useSheet('editar', ['s']);
    const cv = useSheet('cv');

    // ─── PRF-03 · Editar sección ────────────────────────────────────────────
    const slug = editar.param('s');
    const target = findEditable(tab, slug);
    // Mientras la hoja sale (la URL ya no dice `s`), sigue mostrando la sección que se editaba.
    const [shownSlug, setShownSlug] = useState(slug);
    if (target && slug !== shownSlug) setShownSlug(slug);
    const shown = target ?? findEditable(tab, shownSlug);

    // Un enlace con una sección que no existe o no se edita aquí no abre la hoja; useSheetGuard
    // (PRF-01 y PRF-02) la saca de la URL.

    // Guardar el primer idioma se lleva «Agregar idioma» (y quitar el último, el lápiz): cuando la hoja
    // termina de cerrarse, el foco pasa a la tarjeta Idiomas en vez de caer en <body>, como con el CV.
    const editOpener = useRef<Element | null>(null);
    const editSaved = useRef<string | null>(null);
    const idiomasCard = useRef<HTMLElement>(null);
    useEffect(() => {
        if (editar.open || editSaved.current === null) return;
        const saved = editSaved.current;
        editSaved.current = null;
        if (saved === IDIOMAS && !editOpener.current?.isConnected) idiomasCard.current?.focus();
    }, [editar.open]);

    // ─── Subir CV (solo en el perfil que tiene la sección CV) ────────────────
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
                editOpener.current = document.activeElement;
                editar.show({ s: sectionSlug(section.titulo) });
                break;
        }
    };

    const saveSection = (index: number, next: EditableSection) => {
        onChange({ ...tab, secciones: tab.secciones.map((s, i) => (i === index ? next : s)) });
        editSaved.current = next.titulo;
        editar.hide();
        show({ message: SAVED_BY_SECTION[next.titulo] ?? COPY.editar.guardado, tone: 'success' });
    };

    const saveCv = (file: CvFile) => {
        // El CV vive en demo/profileState (useCv): Perfil lo muestra en su sección, Inicio deja de pedirlo
        // («Te falta 1 cosa · Subir CV») y DET-02 lo ofrece «Del perfil».
        saveSessionCv(actor.id, file, recienRegistrado);
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
                    focusRef={section.titulo === 'CV' ? cvCard : section.titulo === IDIOMAS ? idiomasCard : undefined}
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
            <CvSheet open={cv.open && cvIndex >= 0} current={currentCv} onClose={cv.hide} onSave={saveCv} />
        </>
    );
}
