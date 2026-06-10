// src/hooks/useOnboardingCandidate.js
// Persistencia del onboarding candidato en Supabase.
// Guarda progreso parcial al avanzar cada paso, permite retomar en recarga.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../lib/supabase';
import { useApp, Actions } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const TOTAL_STEPS = 12;

export default function useOnboardingCandidate() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { refreshProfile } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ── Cargar progreso al montar ──
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setLoading(false); return; }

                const { data: profile } = await db.profiles.getById(user.id);
                if (profile) {
                    // Restaurar paso guardado
                    const savedStep = profile.onboarding_step || 1;
                    setCurrentStep(savedStep);

                    // Restaurar datos parciales
                    setFormData({
                        user_type: profile.user_type || '',
                        full_name: profile.full_name || '',
                        headline: profile.headline || '',
                        country: profile.country || '',
                        city: profile.city || '',
                        salary_expectation: profile.salary_expectation || '',
                        work_modality: profile.work_modality || '',
                        professional_areas: profile.professional_areas || [],
                        education: profile.education || [],
                        experience: profile.experience || [],
                        availability: profile.availability || '',
                        skills: profile.skills || [],
                        languages: profile.languages || [],
                        avatar_url: profile.avatar_url || '',
                        cv_url: profile.cv_url || '',
                        interests: profile.interests || [],
                    });
                }
            } catch (err) {
                console.error('[useOnboardingCandidate] Error loading progress:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, []);

    // ── Guardar paso ──
    const saveStep = useCallback(async (stepNumber, stepData) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const nextStep = Math.min(stepNumber + 1, TOTAL_STEPS);

            // Merge data
            const merged = { ...formData, ...stepData };
            setFormData(merged);

            // Upsert en profiles
            const { data: profile } = await db.profiles.create({
                ...merged,
                user_type: merged.user_type || 'candidate',
                onboarding_step: nextStep,
            });

            if (profile) {
                dispatch({ type: Actions.SET_PROFILE, payload: profile });
            }

            setCurrentStep(nextStep);
        } catch (err) {
            console.error('[useOnboardingCandidate] Error saving step:', err);
        } finally {
            setSaving(false);
        }
    }, [formData, dispatch]);

    // ── Retroceder paso ──
    const goBack = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    // ── Completar onboarding ──
    const completeOnboarding = useCallback(async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await db.profiles.create({
                ...formData,
                onboarding_completed: true,
                onboarding_step: TOTAL_STEPS,
            });

            if (profile) {
                dispatch({ type: Actions.SET_PROFILE, payload: profile });
            }

            // ⚠️ CRÍTICO: OnboardingGate lee el profile de AuthContext (no de
            // AppContext). Sin este refresh, el gate sigue viendo el perfil
            // viejo (onboarding_completed=false) y rebota al wizard.
            await refreshProfile();

            navigate('/app/swipe', { replace: true });
        } catch (err) {
            console.error('[useOnboardingCandidate] Error completing onboarding:', err);
        } finally {
            setSaving(false);
        }
    }, [formData, dispatch, navigate, refreshProfile]);

    // ── Upload de archivo ──
    const uploadFile = useCallback(async (file, type = 'image') => {
        if (type === 'document') {
            return await db.storage.uploadDocument(file);
        }
        return await db.storage.uploadImage(file, 'avatars');
    }, []);

    return {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        loading,
        saving,
        totalSteps: TOTAL_STEPS,
        saveStep,
        goBack,
        completeOnboarding,
        uploadFile,
    };
}
