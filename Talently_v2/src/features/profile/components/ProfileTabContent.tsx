// Contenido de un perfil (Trabajo, Hogar u Organización): la tarjeta «Te falta
// 1 cosa», sus secciones editables y las hojas que abren (PRF-03 y Subir CV).
import { useState } from 'react';
import { useSnackbar } from '../../../ui/Snackbar';
import { paths } from '../../../app/paths';
import type { DemoProfileSection, DemoProfileTab, DemoProfileTip } from '../../demo/types';
import { COPY, SAVED_BY_SECTION } from '../copy';
import { useOpenRoute, useSoon } from '../useOpenRoute';
import { CvSheet, type CvFile } from './CvSheet';
import { EditSectionSheet, type EditableSection } from './EditSectionSheet';
import { ProfileSection } from './ProfileSection';
import { ProfileTip } from './ProfileTip';

const isCvAction = (accion: string) => accion.includes('CV');

function isEditable(s: DemoProfileSection): s is EditableSection {
    return s.tipo === 'texto' || s.tipo === 'filas' || s.tipo === 'tags';
}

export interface ProfileTabContentProps {
    tab: DemoProfileTab;
    onChange: (next: DemoProfileTab) => void;
}

export function ProfileTabContent({ tab, onChange }: ProfileTabContentProps) {
    const { show } = useSnackbar();
    const openRoute = useOpenRoute();
    const soon = useSoon();
    // La hoja se vuelve a montar (key) en cada apertura: parte con los datos guardados.
    const [edit, setEdit] = useState<{ index: number; key: number; open: boolean } | null>(null);
    const [cv, setCv] = useState<{ key: number; open: boolean }>({ key: 0, open: false });

    const cvIndex = tab.secciones.findIndex((s) => s.titulo === 'CV');
    const cvSection = tab.secciones[cvIndex];
    const currentCv: CvFile | undefined =
        cvSection?.tipo === 'archivo' ? { nombre: cvSection.nombre, detalle: cvSection.detalle } : undefined;

    const openCv = () => setCv((c) => ({ key: c.key + 1, open: true }));
    const openEdit = (index: number) => setEdit((e) => ({ index, key: (e?.key ?? 0) + 1, open: true }));

    const onTip = (tip: DemoProfileTip) => {
        if (tip.destino?.pantalla === 'verificacion') openRoute(paths.verificacion());
        else if (isCvAction(tip.accion)) openCv();
        // Una credencial por subir («Subir curso») se sube en Verificación y credenciales (VER-03).
        else openRoute(paths.verificacion());
    };

    const onEdit = (section: DemoProfileSection, index: number) => {
        if (section.tipo === 'archivo') openCv();
        // Credenciales: el lápiz lleva a Verificación y credenciales (VER-01), como en el prototipo.
        else if (section.titulo === 'Credenciales') openRoute(paths.verificacion());
        else if (isEditable(section)) openEdit(index);
    };

    const saveSection = (index: number, next: EditableSection) => {
        onChange({ ...tab, secciones: tab.secciones.map((s, i) => (i === index ? next : s)) });
        setEdit((e) => (e ? { ...e, open: false } : e));
        show({ message: SAVED_BY_SECTION[next.titulo] ?? COPY.editar.guardado, tone: 'success' });
    };

    const saveCv = (file: CvFile) => {
        const archivo: DemoProfileSection = { tipo: 'archivo', titulo: 'CV', nombre: file.nombre, detalle: file.detalle, editable: true };
        const secciones = cvIndex >= 0 ? tab.secciones.map((s, i) => (i === cvIndex ? archivo : s)) : [...tab.secciones, archivo];
        // Con el CV arriba, «Te falta 1 cosa» ya no aplica.
        const completitud = tab.completitud && isCvAction(tab.completitud.accion) ? undefined : tab.completitud;
        onChange({ ...tab, secciones, completitud });
        setCv((c) => ({ ...c, open: false }));
        show({ message: COPY.cv.guardado, tone: 'success' });
    };

    const editing = edit ? tab.secciones[edit.index] : undefined;
    const last = tab.secciones.length - 1;

    return (
        <>
            {tab.completitud && <ProfileTip tip={tab.completitud} onAction={() => tab.completitud && onTip(tab.completitud)} />}
            {tab.secciones.map((section, i) => (
                <ProfileSection
                    key={section.titulo}
                    section={section}
                    onEdit={() => onEdit(section, i)}
                    onEmptyAction={section.titulo === 'CV' ? openCv : () => soon()}
                    foot={i === last ? tab.pie : undefined}
                />
            ))}
            {edit && editing && isEditable(editing) && (
                <EditSectionSheet
                    key={edit.key}
                    open={edit.open}
                    section={editing}
                    onClose={() => setEdit({ ...edit, open: false })}
                    onSave={(next) => saveSection(edit.index, next)}
                />
            )}
            {cv.key > 0 && (
                <CvSheet
                    key={cv.key}
                    open={cv.open}
                    current={currentCv}
                    onClose={() => setCv({ ...cv, open: false })}
                    onSave={saveCv}
                />
            )}
        </>
    );
}
