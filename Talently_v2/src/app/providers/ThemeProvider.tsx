import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

interface ThemeContextValue {
    preference: ThemePreference;
    theme: Theme;
    setPreference: (p: ThemePreference) => void;
}

const STORAGE_KEY = 'tl-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Preferencia de UI: único uso permitido de localStorage (ver CLAUDE.md).
function readPreference(): ThemePreference {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === 'light' || v === 'dark' ? v : 'system';
    } catch {
        return 'system';
    }
}

function systemTheme(): Theme {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Pone `data-theme` en <html>: tokens.css resuelve todos los colores desde ahí. */
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
    const [system, setSystem] = useState<Theme>(systemTheme);

    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!mq) return;
        const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const theme: Theme = preference === 'system' ? system : preference;

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            'content',
            getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
        );
    }, [theme]);

    const setPreference = useCallback((p: ThemePreference) => {
        setPreferenceState(p);
        try {
            if (p === 'system') localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, p);
        } catch {
            /* sin almacenamiento: la preferencia dura la sesión */
        }
    }, []);

    const value = useMemo(() => ({ preference, theme, setPreference }), [preference, theme, setPreference]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
    return ctx;
}
