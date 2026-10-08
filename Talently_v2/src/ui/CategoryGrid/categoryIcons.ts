// Clave de categoría (src/domain/categorias) → su ícono del set único.
// Hogar y cuidados no usa la casa, Seguridad no usa el escudo y Profesionales
// no usa el maletín; la clase Tecnología reutiliza el ícono del oficio.
import type { ClassCategoryKey, JobCategoryKey } from '../../domain/categorias';
import {
    IconClassArt,
    IconClassLanguages,
    IconClassMusic,
    IconClassPaes,
    IconClassSchool,
    IconClassSports,
    IconClassSupport,
    IconClassTech,
    IconClassTrades,
    IconClassUniversity,
    IconJobAdmin,
    IconJobAgroMining,
    IconJobAutomotive,
    IconJobCleaning,
    IconJobConstruction,
    IconJobCreative,
    IconJobEducation,
    IconJobFoodEvents,
    IconJobHealth,
    IconJobHomeCare,
    IconJobIndustry,
    IconJobProfessional,
    IconJobRetail,
    IconJobSecurity,
    IconJobTech,
    IconJobTransport,
    type IconComponent,
} from '../icons';

export const JOB_CATEGORY_ICONS: Record<JobCategoryKey, IconComponent> = {
    tecnologia: IconJobTech,
    administracion: IconJobAdmin,
    comercio: IconJobRetail,
    'gastronomia-eventos': IconJobFoodEvents,
    'hogar-cuidados': IconJobHomeCare,
    seguridad: IconJobSecurity,
    construccion: IconJobConstruction,
    industria: IconJobIndustry,
    'transporte-logistica': IconJobTransport,
    automotriz: IconJobAutomotive,
    educacion: IconJobEducation,
    'salud-bienestar': IconJobHealth,
    limpieza: IconJobCleaning,
    'agro-mineria-energia': IconJobAgroMining,
    profesionales: IconJobProfessional,
    'creativos-eventos': IconJobCreative,
};

export const CLASS_CATEGORY_ICONS: Record<ClassCategoryKey, IconComponent> = {
    'clases-escolar': IconClassSchool,
    'clases-paes': IconClassPaes,
    'clases-universitaria': IconClassUniversity,
    'clases-idiomas': IconClassLanguages,
    'clases-musica': IconClassMusic,
    'clases-arte': IconClassArt,
    'clases-deporte': IconClassSports,
    'clases-tecnologia': IconClassTech, // = IconJobTech
    'clases-oficios': IconClassTrades,
    'clases-apoyo': IconClassSupport,
};

/** Ícono de cualquier categoría, de oficio o de clase. */
export function categoryIcon(key: JobCategoryKey | ClassCategoryKey): IconComponent {
    return key in JOB_CATEGORY_ICONS
        ? JOB_CATEGORY_ICONS[key as JobCategoryKey]
        : CLASS_CATEGORY_ICONS[key as ClassCategoryKey];
}
