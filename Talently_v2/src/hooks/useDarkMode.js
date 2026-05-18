// src/hooks/useDarkMode.js
// Maneja el dark mode: lee/guarda en localStorage,
// aplica data-theme='dark' en document.documentElement.
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'talently_dark_mode';

export default function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        // Inicializar desde localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored === 'true';

        // Fallback: preferencia del sistema
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    });

    // Aplicar/remover el atributo data-theme en <html>
    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark-mode'); // backward compat
        } else {
            root.removeAttribute('data-theme');
            root.classList.remove('dark-mode');
        }

        // Persistir
        localStorage.setItem(STORAGE_KEY, String(isDark));
    }, [isDark]);

    const toggleDarkMode = useCallback(() => {
        setIsDark((prev) => !prev);
    }, []);

    const setDarkMode = useCallback((value) => {
        setIsDark(value);
    }, []);

    return {
        isDark,
        toggleDarkMode,
        setDarkMode,
    };
}
