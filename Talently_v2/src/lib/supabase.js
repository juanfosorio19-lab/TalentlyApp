// src/lib/supabase.js
// Cliente Supabase modular — reemplaza window.talentlyBackend
// Importa con: import { supabase, db } from '@/lib/supabase'

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://femlqgaqqmkeqtjeruqn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWxxZ2FxcW1rZXF0amVydXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTc2MTEsImV4cCI6MjA4MjU5MzYxMX0.7KuB9qQqv-cUaXKi2b6zV8I99dbmp8CNwlEN5uElJRQ';

// Raw Supabase client — para uso directo donde se necesite
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

        getDiscovery: async (myUserType) => {
            const targetType = myUserType === 'candidate' ? 'company' : 'candidate';
            return await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', targetType)
                .limit(20);
        },

        getCandidatesForExplore: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
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

            return await supabase
                .from('offers')
                .insert([{ ...offerData, user_id: user.id }])
                .select()
                .single();
        },

        getById: async (id) => {
            return await supabase
                .from('offers')
                .select('*, companies(*)')
                .eq('id', id)
                .single();
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
                .select('*')
                .in('id', otherIds);

            const profilesMap = {};
            (profileRows || []).forEach((p) => { profilesMap[p.id] = p; });

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

            return {
                data: matches.map((m) => {
                    const otherId = m.user_id_1 === userId ? m.user_id_2 : m.user_id_1;
                    return {
                        id: m.id,
                        created_at: m.created_at,
                        user_id_1: m.user_id_1,
                        user_id_2: m.user_id_2,
                        otherProfile: profilesMap[otherId] || { full_name: 'Usuario' },
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
            const senderId = (await supabase.auth.getUser()).data.user.id;
            return await supabase
                .from('messages')
                .insert([{ match_id: matchId, sender_id: senderId, content }]);
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

            const today = new Date().toISOString().split('T')[0];

            const { data } = await supabase
                .from('user_statistics')
                .select('daily_activity')
                .eq('user_id', userId)
                .single();

            if (!data) return;

            let activity = data.daily_activity || [];
            let todayEntry = activity.find(d => d.date === today);
            if (!todayEntry) {
                todayEntry = { date: today, views: 0, matches: 0, swipes: 0, messages: 0 };
                activity.push(todayEntry);
            }

            const fieldMap = {
                'profile_views': 'views',
                'matches_count': 'matches',
                'swipes_given': 'swipes',
                'messages_sent': 'messages'
            };

            const key = fieldMap[type];
            if (key) todayEntry[key] = (todayEntry[key] || 0) + 1;

            activity.sort((a, b) => a.date.localeCompare(b.date));
            if (activity.length > 7) activity = activity.slice(-7);

            await supabase
                .from('user_statistics')
                .update({ daily_activity: activity })
                .eq('user_id', userId);
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
        createTicket: (data) =>
            supabase.from('support_tickets').insert(data).select().single(),
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
            const { data: area } = await supabase.from('professional_areas').select('id').eq('slug', areaSlug).single();
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
