// src/lib/supabase.js
// Cliente Supabase modular — reemplaza window.talentlyBackend
// Importa con: import { supabase, db } from '@/lib/supabase'

import { createClient } from '@supabase/supabase-js';
import { UPLOAD_LIMITS } from './constants';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://femlqgaqqmkeqtjeruqn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWxxZ2FxcW1rZXF0amVydXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTc2MTEsImV4cCI6MjA4MjU5MzYxMX0.7KuB9qQqv-cUaXKi2b6zV8I99dbmp8CNwlEN5uElJRQ';

// Lock no-op para Supabase auth.
// Supabase JS usa Web Locks API internamente para sincronizar refreshes entre tabs.
// En dev con React StrictMode + HMR, los dobles mounts producen orphan locks que
// causan "AbortError: Lock broken" y dejan la sesión en loading=true forever.
// Como Talently no usa multi-tab sync agresivo, deshabilitar el lock es seguro.
const noopLock = async (_name, _acquireTimeout, fn) => await fn();

// Raw Supabase client — para uso directo donde se necesite
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: noopLock,
    },
});

// ============================================
// Column selections (privacidad)
// ============================================
// Columnas seguras de profiles para exposición a OTROS usuarios.
// Excluye: email, birthday, birth_date, latitude, longitude, notification_prefs.
// Mantiene todo lo necesario para SwipeCard, ProfileView, matches, etc.
const PROFILE_PUBLIC_COLS = `
    id, user_type, full_name, name, headline, bio, role, title,
    avatar_url, video_url, image,
    current_position, professional_area, professional_areas, experience_years, experience_level,
    education_level, education, experience,
    skills, soft_skills, languages, interests,
    modality, work_modality, availability, relocation,
    country, city,
    currency, salary_min, salary_max, expected_salary, salary_expectation, salary_range,
    company_name, company_sector, company_size, company_stage, company_description,
    company_logo, company_logo_url, company_tech_stack, company_benefits, company_values,
    culture_values, work_modalities, website, linkedin_url, industry, size, description, benefits,
    company_uniqueness, company_photos, company_positions, seniority_levels, company_tags,
    onboarding_completed, gender, created_at, updated_at
`.replace(/\s+/g, ' ').trim();

// Columnas seguras de companies para exposición a OTROS usuarios.
// Excluye: tax_id, latitude, longitude, notification_prefs.
const COMPANY_PUBLIC_COLS = `
    id, user_id, name, website, linkedin_url, sector, company_size, company_stage,
    work_model, value_proposition, logo_url, banner_url,
    country, city, fully_remote, multiple_locations,
    selection_stages, selection_duration, technical_test, paid_test,
    benefits, culture_values, positions_looking, seniority_levels, tech_stack, tags,
    gallery, size, stage, description, created_at, updated_at
`.replace(/\s+/g, ' ').trim();

// ============================================
// db — Wrapper con helpers organizados por dominio
// Migrado desde js/supabase-client.js
// ============================================

export const db = {
    // ─── Auth ────────────────────────────────
    auth: {
        signUp: async (email, password, options) => {
            return await supabase.auth.signUp({ email, password, options });
        },
        signIn: async (email, password) => {
            return await supabase.auth.signInWithPassword({ email, password });
        },
        signOut: async () => {
            return await supabase.auth.signOut();
        },
        signInWithOAuth: async (params) => {
            return await supabase.auth.signInWithOAuth(params);
        },
        resetPassword: async (email) => {
            return await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`
            });
        },
        verifyOtp: async (email, token, type = 'recovery') => {
            return await supabase.auth.verifyOtp({ email, token, type });
        },
        updateUser: async (attributes) => {
            return await supabase.auth.updateUser(attributes);
        },
        getUser: async () => {
            return await supabase.auth.getUser();
        },
        onAuthStateChange: (callback) => {
            return supabase.auth.onAuthStateChange(callback);
        },
        deleteAccount: () => supabase.rpc('delete_account'),
    },

    // ─── Storage ─────────────────────────────
    storage: {
        uploadImage: async (file, bucket = 'images') => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { console.error('Upload: no user'); return null; }

            // Defense-in-depth: validar tipo y tamaño aunque el caller ya lo haga.
            const limits = UPLOAD_LIMITS.image;
            if (!file || !file.name) { console.error('Upload: archivo inválido'); return null; }
            if (!limits.types.includes(file.type)) {
                console.error('Upload: tipo no permitido', file.type, '— esperado:', limits.types.join(', '));
                return null;
            }
            if (file.size > limits.maxSize) {
                console.error('Upload: archivo supera', limits.maxSize, 'bytes — tamaño actual:', file.size);
                return null;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_logo.${fileExt}`;

            const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
            if (error) { console.error('Upload error:', error); return null; }

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;
        },

        uploadDocument: async (file, bucket = 'documents') => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { console.error('Upload: no user'); return null; }

            // Defense-in-depth: validar tipo y tamaño aunque el caller ya lo haga.
            const limits = UPLOAD_LIMITS.document;
            if (!file || !file.name) { console.error('Upload: archivo inválido'); return null; }
            if (!limits.types.includes(file.type)) {
                console.error('Upload: tipo no permitido', file.type, '— esperado:', limits.types.join(', '));
                return null;
            }
            if (file.size > limits.maxSize) {
                console.error('Upload: archivo supera', limits.maxSize, 'bytes — tamaño actual:', file.size);
                return null;
            }

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${user.id}/${Date.now()}_${safeName}`;

            const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
            if (error) { console.error('Upload error:', error); return null; }

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;
        }
    },

    // ─── Profiles ────────────────────────────
    profiles: {
        create: async (profileData) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: { message: 'No authenticated user' } };

            return await supabase
                .from('profiles')
                .upsert([{ ...profileData, id: user.id }])
                .select()
                .single();
        },

        getById: async (id) => {
            return await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle();
        },

        // Igual que getById pero sin exponer email/birthday/birth_date/coords.
        // Usar SIEMPRE que se consulte el perfil de OTRO usuario (chat, public profiles).
        getPublicById: async (id) => {
            return await supabase
                .from('profiles')
                .select(PROFILE_PUBLIC_COLS)
                .eq('id', id)
                .maybeSingle();
        },

        getDiscovery: async (myUserType) => {
            const targetType = myUserType === 'candidate' ? 'company' : 'candidate';
            return await supabase
                .from('profiles')
                .select(PROFILE_PUBLIC_COLS)
                .eq('user_type', targetType)
                .limit(20);
        },

        getCandidatesForExplore: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select(PROFILE_PUBLIC_COLS)
                .eq('user_type', 'candidate')
                .eq('onboarding_completed', true)
                .limit(50);
            return { data: data || [], error };
        },

        updateCv: (userId, cvUrl) =>
            supabase
                .from('profiles')
                .update({ cv_url: cvUrl })
                .eq('id', userId)
                .select()
                .single(),
    },

    // ─── Companies ───────────────────────────
    companies: {
        create: async (companyData) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: { message: 'No authenticated user' } };

            return await supabase
                .from('companies')
                .upsert([{ ...companyData, user_id: user.id }])
                .select()
                .single();
        },

        getById: async (userId) => {
            return await supabase
                .from('companies')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
        },

        update: async (userId, companyData) => {
            return await supabase
                .from('companies')
                .update(companyData)
                .eq('user_id', userId)
                .select()
                .single();
        }
    },

    // ─── Offers ──────────────────────────────
    offers: {
        create: async (offerData) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: { message: 'No authenticated user' } };

            const title = (offerData?.title || '').trim();
            const description = (offerData?.description || '').trim();
            if (!title || title.length > 120) {
                return { error: { message: 'El título es obligatorio y debe tener máximo 120 caracteres' } };
            }
            if (!description || description.length > 5000) {
                return { error: { message: 'La descripción es obligatoria y debe tener máximo 5000 caracteres' } };
            }

            return await supabase
                .from('offers')
                .insert([{ ...offerData, title, description, user_id: user.id }])
                .select()
                .single();
        },

        getById: async (id) => {
            return await supabase
                .from('offers')
                .select(`*, companies(${COMPANY_PUBLIC_COLS})`)
                .eq('id', id)
                .maybeSingle();
        },

        getByCompany: async (userId) => {
            return await supabase
                .from('offers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);
        },

        getAllActive: async () => {
            const { data: offers, error } = await supabase
                .from('offers')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error || !offers?.length) return { data: [], error };

            const userIds = [...new Set(offers.map(o => o.user_id))];
            const { data: companies } = await supabase
                .from('companies')
                .select('user_id, name, logo_url, sector')
                .in('user_id', userIds);

            const companiesMap = {};
            (companies || []).forEach(c => companiesMap[c.user_id] = c);

            const enriched = offers.map(o => ({
                ...o,
                company: companiesMap[o.user_id] || { name: 'Empresa Confidencial', logo_url: null }
            }));

            return { data: enriched, error: null };
        },

        update: async (offerId, updates) => {
            return await supabase
                .from('offers')
                .update(updates)
                .eq('id', offerId)
                .select()
                .single();
        },

        delete: async (offerId) => {
            return await supabase.from('offers').delete().eq('id', offerId);
        }
    },

    // ─── Matches & Messages ──────────────────
    matches: {
        create: async (otherUserId) => {
            const userId = (await supabase.auth.getUser()).data.user.id;

            const { data: existing } = await supabase
                .from('matches')
                .select('id')
                .or(`and(user_id_1.eq.${userId},user_id_2.eq.${otherUserId}),and(user_id_1.eq.${otherUserId},user_id_2.eq.${userId})`)
                .maybeSingle();

            if (existing) return { data: existing, error: null, alreadyExists: true };

            const { data, error } = await supabase
                .from('matches')
                .insert([{ user_id_1: userId, user_id_2: otherUserId }])
                .select()
                .single();
            return { data, error };
        },

        get: async () => {
            const userId = (await supabase.auth.getUser()).data.user.id;
            return await supabase
                .from('matches')
                .select('id, created_at, user_id_1, user_id_2')
                .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
                .limit(50);
        },

        // Trae matches + perfiles del otro lado + último mensaje — 3 queries totales (sin embedded join)
        getWithProfiles: async (userId) => {
            // 1. Matches del usuario
            const { data: matches, error } = await supabase
                .from('matches')
                .select('id, created_at, user_id_1, user_id_2')
                .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) return { data: null, error };
            if (!matches?.length) return { data: [], error: null };

            // 2. Perfiles del otro lado (bulk — una sola query)
            const otherIds = [...new Set(
                matches.map((m) => (m.user_id_1 === userId ? m.user_id_2 : m.user_id_1))
            )];
            const { data: profileRows } = await supabase
                .from('profiles')
                .select(PROFILE_PUBLIC_COLS)
                .in('id', otherIds);

            const profilesMap = {};
            (profileRows || []).forEach((p) => { profilesMap[p.id] = p; });

            // 2b. Empresas: sus datos viven en la tabla `companies`, NO en profiles.
            // Sin esto, un match con una empresa se mostraba como "Usuario".
            const { data: companyRows } = await supabase
                .from('companies')
                .select('user_id, name, logo_url, sector')
                .in('user_id', otherIds);
            const companiesMap = {};
            (companyRows || []).forEach((c) => { companiesMap[c.user_id] = c; });

            // 3. Último mensaje por match (bulk)
            const matchIds = matches.map((m) => m.id);
            const { data: msgs } = await supabase
                .from('messages')
                .select('match_id, content, created_at')
                .in('match_id', matchIds)
                .order('created_at', { ascending: false });

            const lastMsgMap = {};
            (msgs || []).forEach((msg) => {
                if (!lastMsgMap[msg.match_id]) lastMsgMap[msg.match_id] = msg;
            });

            // Resuelve el perfil del otro lado: profile (candidato) o company (empresa).
            const resolveOther = (otherId) => {
                const prof = profilesMap[otherId];
                const comp = companiesMap[otherId];
                // Si hay company y (no hay profile O el profile es de empresa), usar datos de company.
                if (comp && (!prof || prof.user_type === 'company')) {
                    return {
                        ...(prof || {}),
                        id: otherId,
                        user_type: 'company',
                        company_name: comp.name || prof?.company_name,
                        full_name: comp.name || prof?.full_name,
                        company_logo: comp.logo_url || prof?.company_logo,
                        company_sector: comp.sector || prof?.company_sector,
                    };
                }
                return prof || { full_name: 'Usuario' };
            };

            return {
                data: matches.map((m) => {
                    const otherId = m.user_id_1 === userId ? m.user_id_2 : m.user_id_1;
                    return {
                        id: m.id,
                        created_at: m.created_at,
                        user_id_1: m.user_id_1,
                        user_id_2: m.user_id_2,
                        otherProfile: resolveOther(otherId),
                        lastMsg: lastMsgMap[m.id] || null,
                    };
                }),
                error: null,
            };
        },

        getMessages: async (matchId) => {
            return await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: false })
                .limit(100);
        },

        sendMessage: async (matchId, content) => {
            const senderId = (await supabase.auth.getUser()).data.user?.id;
            if (!senderId) return { error: { message: 'No authenticated user' } };

            const trimmed = (content || '').trim();
            if (!trimmed) {
                return { error: { message: 'El mensaje no puede estar vacío' } };
            }
            if (trimmed.length > 2000) {
                return { error: { message: 'El mensaje no puede superar 2000 caracteres' } };
            }

            return await supabase
                .from('messages')
                .insert([{ match_id: matchId, sender_id: senderId, content: trimmed }]);
        },

        subscribe: (matchId, onNewMessage) => {
            return supabase
                .channel(`public:messages:${matchId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${matchId}`
                }, payload => onNewMessage(payload.new))
                .subscribe();
        }
    },

    // ─── Swipes ──────────────────────────────
    swipes: {
        create: async (targetId, direction, offerId = null) => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return { error: 'No user' };

            const payload = { swiper_id: userId, target_id: targetId, direction };
            if (offerId) payload.offer_id = offerId;

            const { data, error } = await supabase
                .from('swipes')
                .upsert([payload], { onConflict: 'swiper_id,target_id' })
                .select()
                .single();

            if (error) return { data: null, error, isMutualMatch: false };

            let isMutualMatch = false;
            if (direction === 'right') {
                const { data: reverseSwipe } = await supabase
                    .from('swipes')
                    .select('id')
                    .eq('swiper_id', targetId)
                    .eq('target_id', userId)
                    .eq('direction', 'right')
                    .maybeSingle();
                if (reverseSwipe) isMutualMatch = true;
            }

            return { data, error: null, isMutualMatch };
        },

        getSwipedUserIds: async () => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return { data: [] };

            const { data, error } = await supabase
                .from('swipes')
                .select('target_id')
                .eq('swiper_id', userId);

            if (error) return { data: [] };
            return { data: (data || []).map(s => s.target_id) };
        },

        getInterestedCandidates: async () => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return { data: [] };

            const { data: swipes, error } = await supabase
                .from('swipes')
                .select('swiper_id, offer_id, created_at')
                .eq('target_id', userId)
                .eq('direction', 'right')
                .order('created_at', { ascending: false });

            if (error || !swipes) return { data: [] };
            return { data: swipes };
        }
    },

    // ─── Statistics ──────────────────────────
    statistics: {
        get: async () => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return { data: null, error: 'No user' };

            const { data, error } = await supabase
                .from('user_statistics')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (!data && !error) {
                await db.statistics.initialize(userId);
                const retry = await supabase
                    .from('user_statistics')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();
                return { data: retry.data || null, error: retry.error };
            }

            return { data, error };
        },

        increment: async (field) => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return { error: 'No user' };

            const { error: rpcError } = await supabase
                .rpc('increment_stat', { p_user_id: userId, p_field: field });

            if (rpcError) {
                const { data: current } = await db.statistics.get();
                if (current) {
                    const newValue = (current[field] || 0) + 1;
                    await supabase
                        .from('user_statistics')
                        .update({ [field]: newValue, updated_at: new Date().toISOString(), last_activity_at: new Date().toISOString() })
                        .eq('user_id', userId);
                }
            }

            await db.statistics.logDailyActivity(field);
            return { error: null };
        },

        incrementForUser: async (targetUserId, field) => {
            if (!targetUserId) return { error: 'No target user' };

            const { error: rpcError } = await supabase
                .rpc('increment_stat', { p_user_id: targetUserId, p_field: field });

            if (rpcError) {
                const { data: current } = await supabase
                    .from('user_statistics')
                    .select('*')
                    .eq('user_id', targetUserId)
                    .maybeSingle();

                if (current) {
                    const newValue = (current[field] || 0) + 1;
                    await supabase
                        .from('user_statistics')
                        .update({ [field]: newValue, updated_at: new Date().toISOString() })
                        .eq('user_id', targetUserId);
                } else {
                    await supabase
                        .from('user_statistics')
                        .upsert([{ user_id: targetUserId, [field]: 1 }], { onConflict: 'user_id' })
                        .select()
                        .single();
                }
            }

            return { error: null };
        },

        logDailyActivity: async (type) => {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) return;
            return await supabase.rpc('log_daily_activity', { p_user_id: userId, p_type: type });
        },

        initialize: async (userId) => {
            return await supabase
                .from('user_statistics')
                .upsert([{ user_id: userId }], { onConflict: 'user_id' })
                .select()
                .single();
        }
    },

    // ─── Notifications ───────────────────────
    notifications: {
        getByUser: async (userId) => {
            return await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(30);
        },

        markAsRead: async (notificationId) => {
            return await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);
        },

        markAllAsRead: async (userId) => {
            return await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);
        },

        create: async (data) => {
            return await supabase
                .from('notifications')
                .insert(data)
                .select()
                .single();
        },
    },

    // ─── Support ─────────────────────────────
    support: {
        createTicket: async (data) => {
            const subject = (data?.subject || '').trim();
            const message = (data?.message || '').trim();
            const email = (data?.email || '').trim();
            if (!email) {
                return { error: { message: 'El correo es obligatorio' } };
            }
            if (!subject || subject.length > 200) {
                return { error: { message: 'El asunto es obligatorio y debe tener máximo 200 caracteres' } };
            }
            if (!message || message.length > 5000) {
                return { error: { message: 'El mensaje es obligatorio y debe tener máximo 5000 caracteres' } };
            }
            // Whitelist explícita: support_tickets solo tiene user_id, email,
            // subject, message, status (email es NOT NULL). Un spread con keys
            // extra (category, description) → 42703.
            return supabase.from('support_tickets').insert({
                user_id: data?.user_id ?? null,
                email,
                subject,
                message,
                status: data?.status || 'open',
            }).select().single();
        },
    },

    // ─── FAQs ────────────────────────────────
    faqs: {
        getAll: () => supabase.from('faqs').select('*').order('display_order'),
    },

    // ─── Reference Data ──────────────────────
    reference: {
        getCountries: () => supabase.from('countries').select('*').order('name'),
        getCities: (countryId) => supabase.from('cities').select('*').eq('country_id', countryId).order('name'),
        getAreas: () => supabase.from('professional_areas').select('*').order('name'),
        getSkills: async (areaSlug) => {
            const { data: area } = await supabase.from('professional_areas').select('id').eq('slug', areaSlug).maybeSingle();
            if (!area) return { data: [] };
            return supabase.from('skills').select('*').eq('area_id', area.id).order('name');
        },
        getInterests: (category) => {
            let query = supabase.from('interests').select('*').order('name');
            if (category) query = query.eq('category', category);
            return query;
        },
        getWorkModalities: () => supabase.from('work_modalities').select('*').order('display_order'),
        getEducationLevels: () => supabase.from('education_levels').select('*').order('display_order'),
        getExperienceRanges: () => supabase.from('experience_ranges').select('*').order('display_order'),
        getCompanySizes: () => supabase.from('company_sizes').select('*').order('display_order'),
        getCompanySectors: () => supabase.from('company_sectors').select('*').order('display_order'),
        getCompanyStages: () => supabase.from('company_stages').select('*').order('display_order'),
        getCompanyCultureValues: () => supabase.from('company_culture_values').select('*').order('display_order'),
        getCompanyPositions: () => supabase.from('company_positions').select('*').order('display_order'),
        getSeniorityLevels: () => supabase.from('seniority_levels').select('*').order('display_order'),
        getCompanyBenefits: () => supabase.from('company_benefits').select('*').order('display_order'),
        getSelectionDurations: () => supabase.from('selection_durations').select('*').order('display_order'),
        getTechStack: () => supabase.from('tech_stack').select('*').order('display_order'),
    }
};
