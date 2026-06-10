// src/hooks/useOnboardingCompany.js
// Persistencia del onboarding empresa en Supabase.
// 12 pasos reales. Pasos fantasma (9, 11 originales) eliminados.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../lib/supabase';
import { useApp, Actions } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const TOTAL_STEPS = 12;

export default function useOnboardingCompany() {
    const navigate = useNavigate();
    const { dispatch } = useApp();
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
                    const savedStep = profile.company_onboarding_step || 1;
                    setCurrentStep(savedStep);

                    setFormData({
                        user_type: profile.user_type || 'company',
                        company_name: profile.company_name || '',
                        company_sector: profile.company_sector || '',
                        country: profile.country || '',
                        city: profile.city || '',
                        website: profile.website || '',
                        company_description: profile.company_description || '',
                        company_type: profile.company_type || '',
                        linkedin_url: profile.linkedin_url || '',
                        culture_values: profile.culture_values || [],
                        company_stage: profile.company_stage || '',
                        company_size: profile.company_size || '',
                        work_modalities: profile.work_modalities || [],
                        company_benefits: profile.company_benefits || [],
                        company_positions: profile.company_positions || [],
                        seniority_levels: profile.seniority_levels || [],
                        company_tech_stack: profile.company_tech_stack || [],
                        selection_process: profile.selection_process || '',
                        company_uniqueness: profile.company_uniqueness || '',
                        company_tags: profile.company_tags || [],
                        company_logo: profile.company_logo || '',
                        company_photos: profile.company_photos || [],
                    });
                }
            } catch (err) {
                console.error('[useOnboardingCompany] Error loading progress:', err);
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
            const merged = { ...formData, ...stepData };
            setFormData(merged);

            await db.profiles.create({
                ...merged,
                user_type: merged.user_type || 'company',
                company_onboarding_step: nextStep,
            });

            setCurrentStep(nextStep);
        } catch (err) {
            console.error('[useOnboardingCompany] Error saving step:', err);
        } finally {
            setSaving(false);
        }
    }, [formData]);

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
                company_onboarding_step: TOTAL_STEPS,
            });

            if (profile) {
                dispatch({ type: Actions.SET_PROFILE, payload: profile });
            }

            // ⚠️ CRÍTICO: OnboardingGate lee el profile de AuthContext (no de
            // AppContext). Sin este refresh, el gate sigue viendo el perfil
            // viejo (onboarding_completed=false) y rebota al wizard.
            await refreshProfile();

            navigate('/company/profile-created', { replace: true });
        } catch (err) {
            console.error('[useOnboardingCompany] Error completing onboarding:', err);
        } finally {
            setSaving(false);
        }
    }, [formData, dispatch, navigate, refreshProfile]);

    // ── Upload de archivo ──
    const uploadFile = useCallback(async (file, type = 'image') => {
        if (type === 'document') {
            return await db.storage.uploadDocument(file);
        }
        return await db.storage.uploadImage(file);
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
