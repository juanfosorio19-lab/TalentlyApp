// src/context/AppContext.jsx
// Estado global de la aplicación — reemplaza el objeto window.app
// Usa useReducer para actualizaciones predecibles y trazables.
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ═══════════════════════════════════════════
// Estado Inicial
// ═══════════════════════════════════════════
const initialState = {
    // ── Sesión (sincronizado con AuthContext) ──
    currentUser: null,           // auth user de Supabase
    userProfile: null,           // fila de profiles (experience, education, etc.)
    profileType: null,           // 'candidate' | 'company'
    isAuthenticated: false,

    // ── Swipe ──
    profiles: [],                // array de perfiles para explorar
    currentIndex: 0,             // índice actual en el stack

    // ── Matches ──
    matches: [],                 // array de matches activos

    // ── Reference Data (catálogos desde Supabase) ──
    referenceData: {
        countries: [],
        areas: [],
        culture_values: [],
        positions: [],
        seniority_levels: [],
        benefits: [],
        selection_durations: [],
        company_stages: [],
        tech_stack: [],
        interests: [],
    },

    // ── Company-specific ──
    companyData: {
        techStack: [],
        tags: [],
        benefits: [],
        photos: [],
        logo: null,
        banner: null,
    },

    // ── Filtros de swipe ──
    candidateFilters: {
        modality: [],
        areas: [],
        country: null,
        salary: { min: null, max: null },
        stage: [],
    },
    companyFilters: {
        modality: [],
        areas: [],
        availability: [],
        seniority: [],
        country: null,
    },

    // ── UI Preferences ──
    darkMode: localStorage.getItem('talently_dark_mode') === 'true',
};

// ═══════════════════════════════════════════
// Action Types
// ═══════════════════════════════════════════
export const Actions = {
    SET_USER: 'SET_USER',
    SET_PROFILE: 'SET_PROFILE',
    SET_PROFILE_TYPE: 'SET_PROFILE_TYPE',
    SET_MATCHES: 'SET_MATCHES',
    SET_PROFILES: 'SET_PROFILES',
    ADVANCE_INDEX: 'ADVANCE_INDEX',
    SET_REFERENCE_DATA: 'SET_REFERENCE_DATA',
    SET_COMPANY_DATA: 'SET_COMPANY_DATA',
    SET_CANDIDATE_FILTERS: 'SET_CANDIDATE_FILTERS',
    SET_COMPANY_FILTERS: 'SET_COMPANY_FILTERS',
    TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
    LOGOUT: 'LOGOUT',
};

// ═══════════════════════════════════════════
// Reducer
// ═══════════════════════════════════════════
function appReducer(state, action) {
    switch (action.type) {
        case Actions.SET_USER:
            return {
                ...state,
                currentUser: action.payload,
                isAuthenticated: !!action.payload,
            };

        case Actions.SET_PROFILE:
            return {
                ...state,
                userProfile: action.payload,
                profileType: action.payload?.user_type || null,
            };

        case Actions.SET_PROFILE_TYPE:
            return {
                ...state,
                profileType: action.payload,
            };

        case Actions.SET_MATCHES:
            return {
                ...state,
                matches: action.payload,
            };

        case Actions.SET_PROFILES:
            return {
                ...state,
                profiles: action.payload,
                currentIndex: 0, // reset al cargar nuevos perfiles
            };

        case Actions.ADVANCE_INDEX:
            return {
                ...state,
                currentIndex: Math.min(state.currentIndex + 1, state.profiles.length),
            };

        case Actions.SET_REFERENCE_DATA:
            return {
                ...state,
                referenceData: {
                    ...state.referenceData,
                    ...action.payload,
                },
            };

        case Actions.SET_COMPANY_DATA:
            return {
                ...state,
                companyData: {
                    ...state.companyData,
                    ...action.payload,
                },
            };

        case Actions.SET_CANDIDATE_FILTERS:
            return { ...state, candidateFilters: action.payload };

        case Actions.SET_COMPANY_FILTERS:
            return { ...state, companyFilters: action.payload };

        case Actions.TOGGLE_DARK_MODE:
            return {
                ...state,
                darkMode: !state.darkMode,
            };

        case Actions.LOGOUT:
            return {
                ...initialState,
                darkMode: state.darkMode,           // preservar preferencia visual
                referenceData: state.referenceData,  // preservar catálogos (no cambian)
            };

        default:
            console.warn(`[AppContext] Acción desconocida: ${action.type}`);
            return state;
    }
}

// ═══════════════════════════════════════════
// Context + Provider
// ═══════════════════════════════════════════
const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    // AppProvider está dentro de AuthProvider (ver main.jsx), así que puede leer
    // la sesión de AuthContext.
    const { user, profile } = useAuth();

    // ── Sincronizar sesión AuthContext → AppContext ──
    // CRÍTICO: sin esto, al reabrir la app con sesión persistida (cold start),
    // AuthContext detecta al user pero AppContext.currentUser/userProfile quedan
    // null → ProfileView y demás vistas que usan useApp() no cargan (spinner
    // infinito, sin botón de logout accesible).
    useEffect(() => {
        dispatch({ type: Actions.SET_USER, payload: user || null });
    }, [user]);

    useEffect(() => {
        if (profile) dispatch({ type: Actions.SET_PROFILE, payload: profile });
    }, [profile]);

    // ── Cargar reference data al montar (datos públicos, no requieren auth) ──
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [
                    countries, areas, cultureValues, positions,
                    seniorityLevels, benefits, selectionDurations,
                    companyStages, techStack, interests,
                ] = await Promise.all([
                    db.reference.getCountries(),
                    db.reference.getAreas(),
                    db.reference.getCompanyCultureValues(),
                    db.reference.getCompanyPositions(),
                    db.reference.getSeniorityLevels(),
                    db.reference.getCompanyBenefits(),
                    db.reference.getSelectionDurations(),
                    db.reference.getCompanyStages(),
                    db.reference.getTechStack(),
                    db.reference.getInterests(),
                ]);

                dispatch({
                    type: Actions.SET_REFERENCE_DATA,
                    payload: {
                        countries:          countries.data        || [],
                        areas:              areas.data            || [],
                        culture_values:     cultureValues.data    || [],
                        positions:          positions.data        || [],
                        seniority_levels:   seniorityLevels.data  || [],
                        benefits:           benefits.data         || [],
                        selection_durations: selectionDurations.data || [],
                        company_stages:     companyStages.data    || [],
                        tech_stack:         techStack.data        || [],
                        interests:          interests.data        || [],
                    },
                });
            } catch (err) {
                console.error('[AppContext] Error cargando referenceData:', err);
            }
        };

        loadReferenceData();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // ── Persistencia: dark mode → localStorage + data-theme ──
    useEffect(() => {
        localStorage.setItem('talently_dark_mode', String(state.darkMode));

        const root = document.documentElement;
        if (state.darkMode) {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            root.removeAttribute('data-theme');
            root.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [state.darkMode]);

    // ── Persistencia: user type → localStorage ──
    useEffect(() => {
        if (state.profileType) {
            localStorage.setItem('talently_user_type', state.profileType);
        }
    }, [state.profileType]);

    // ── Limpieza de cache obsoleto (ver ERROR_LOG.md #4) ──
    useEffect(() => {
        localStorage.removeItem('talently_matches');
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

// ═══════════════════════════════════════════
// Custom Hook
// ═══════════════════════════════════════════
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp() debe usarse dentro de un <AppProvider>');
    }
    return context;
}

// ═══════════════════════════════════════════
// Convenience Hooks (evitan dispatch manual repetitivo)
// ═══════════════════════════════════════════
export function useAppState() {
    const { state } = useApp();
    return state;
}

export function useAppDispatch() {
    const { dispatch } = useApp();
    return dispatch;
}
