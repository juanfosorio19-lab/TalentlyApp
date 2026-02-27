
// Initialize Supabase Client
// NOTE: You must provide your own API Keys from app.supabase.com
const SUPABASE_URL = 'https://femlqgaqqmkeqtjeruqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWxxZ2FxcW1rZXF0amVydXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTc2MTEsImV4cCI6MjA4MjU5MzYxMX0.7KuB9qQqv-cUaXKi2b6zV8I99dbmp8CNwlEN5uElJRQ';

// Check if keys are set
const isBackendConfigured = () => {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
};

let supabaseInstance = null;

// Safe Initialization
try {
    if (window.supabase && window.supabase.createClient && isBackendConfigured()) {
        supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Expose instance as supabaseClient (Standard)
        window.supabaseClient = supabaseInstance;
        console.log('✅ Supabase Client Initialized via Direct Load');
    } else {
        console.warn('⚠️ Supabase Library not found or Keys missing during load.');
    }
} catch (err) {
    console.error('❌ Error initializing Supabase:', err);
}

// Helper to switch between Real and Mock data
const db = {
    get isReady() {
        // If already initialized, return true
        if (supabaseInstance) return true;

        // Retry/Lazy Load
        if (isBackendConfigured() && window.supabase && window.supabase.createClient) {
            try {
                supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                window.supabaseClient = supabaseInstance;
                console.log('✅ Supabase Client Lazy Initialized');
                return true;
            } catch (e) {
                console.error('Lazy Init Error:', e);
                return false;
            }
        }
        return false;
    },

    // Auth Helpers
    auth: {
        signUp: async (email, password, options) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            return await supabaseInstance.auth.signUp({ email, password, options });
        },
        signIn: async (email, password) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            return await supabaseInstance.auth.signInWithPassword({ email, password });
        },
        signOut: async () => {
            // Safe logout even if not ready
            if (supabaseInstance) return await supabaseInstance.auth.signOut();
        },
        signInWithOAuth: async (params) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            return await supabaseInstance.auth.signInWithOAuth(params);
        },
        resetPassword: async (email) => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };
            const { data, error } = await supabaseInstance.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            return { data, error };
        },
        verifyOtp: async (email, token, type = 'recovery') => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };
            const { data, error } = await supabaseInstance.auth.verifyOtp({
                email,
                token,
                type
            });
            return { data, error };
        },
        updateUser: async (attributes) => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };
            const { data, error } = await supabaseInstance.auth.updateUser(attributes);
            return { data, error };
        }
    },

    // Storage Helpers
    storage: {
        uploadImage: async (file, bucket = 'images') => {
            if (!db.isReady) return null;

            // Get current user to use in path (satisfies common RLS: bucket/userId/file)
            const { data: { user } } = await supabaseInstance.auth.getUser();
            if (!user) {
                console.error('Upload Error: No authenticated user');
                return null;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_logo.${fileExt}`;

            const { data, error } = await supabaseInstance.storage.from(bucket).upload(fileName, file, {
                upsert: true
            });

            if (error) {
                console.error('Upload Error:', error);
                if (error.message && error.message.includes('row-level security')) {
                    console.error('💡 Fix: Add Storage RLS policies in Supabase Dashboard. The "images" bucket needs INSERT policy for authenticated users.');
                }
                return null;
            }

            const { data: { publicUrl } } = supabaseInstance.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;
        },

        uploadDocument: async (file, bucket = 'documents') => {
            if (!db.isReady) return null;

            const { data: { user } } = await supabaseInstance.auth.getUser();
            if (!user) {
                console.error('Upload Error: No authenticated user');
                return null;
            }

            // Using original file name but sanitized
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileExt = safeName.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_${safeName}`;

            const { data, error } = await supabaseInstance.storage.from(bucket).upload(fileName, file, {
                upsert: true
            });

            if (error) {
                console.error('Upload Error:', error);
                if (error.message && error.message.includes('row-level security')) {
                    console.error('💡 Fix: Add Storage RLS policies in Supabase Dashboard. The "documents" bucket needs INSERT policy for authenticated users.');
                }
                return null;
            }

            const { data: { publicUrl } } = supabaseInstance.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;
        }
    },

    // Matches & Messages Helpers
    matches: {
        create: async (otherUserId) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const userId = (await supabaseInstance.auth.getUser()).data.user.id;

            // First check if match already exists (in either direction)
            const { data: existing } = await supabaseInstance
                .from('matches')
                .select('id')
                .or(`and(user_id_1.eq.${userId},user_id_2.eq.${otherUserId}),and(user_id_1.eq.${otherUserId},user_id_2.eq.${userId})`)
                .maybeSingle();

            if (existing) {
                // Match already exists, return it as success
                return { data: existing, error: null, alreadyExists: true };
            }

            const { data, error } = await supabaseInstance
                .from('matches')
                .insert([{ user_id_1: userId, user_id_2: otherUserId }])
                .select()
                .single();
            return { data, error };
        },

        get: async () => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            const userId = (await supabaseInstance.auth.getUser()).data.user.id;
            const { data, error } = await supabaseInstance
                .from('matches')
                .select(`
                    id, 
                    created_at,
                    user_id_1, 
                    user_id_2
                `)
                .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

            return { data, error };
        },

        getMessages: async (matchId) => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true });
            return { data, error };
        },

        sendMessage: async (matchId, content) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('messages')
                .insert([{
                    match_id: matchId,
                    sender_id: (await supabaseInstance.auth.getUser()).data.user.id,
                    content: content
                }]);
            return { data, error };
        },

        subscribe: (matchId, onNewMessage) => {
            if (!db.isReady) return null;
            return supabaseInstance
                .channel(`public:messages:${matchId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${matchId}`
                }, payload => {
                    onNewMessage(payload.new);
                })
                .subscribe();
        }
    },

    // Profile Helpers
    profiles: {
        create: async (profileData) => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };

            // Get current user to ensure ownership
            const user = (await supabaseInstance.auth.getUser()).data.user;
            if (!user) return { error: { message: 'No authenticated user found after signup.' } };

            // Merge profileData with ID
            const payload = { ...profileData, id: user.id };

            const { data, error } = await supabaseInstance
                .from('profiles')
                .upsert([payload])
                .select()
                .single();
            return { data, error };
        },

        // Get profiles to swipe on (excluding myself)
        getDiscovery: async (myUserType) => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            const targetType = myUserType === 'candidate' ? 'company' : 'candidate';
            const { data, error } = await supabaseInstance
                .from('profiles')
                .select('*')
                .eq('user_type', targetType)
                .limit(20);
            return { data, error };
        },

        getById: async (id) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            return { data, error };
        },

        // Get candidate profiles for company explore (onboarding completed candidates)
        getCandidatesForExplore: async () => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('profiles')
                .select('*')
                .eq('user_type', 'candidate')
                .eq('onboarding_completed', true)
                .limit(50);
            return { data: data || [], error };
        }
    },

    // Company Helpers
    companies: {
        create: async (companyData) => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };

            // Get current user to ensure ownership
            const user = (await supabaseInstance.auth.getUser()).data.user;
            if (!user) return { error: { message: 'No authenticated user found.' } };

            // Merge companyData with user_id
            const payload = { ...companyData, user_id: user.id };

            const { data, error } = await supabaseInstance
                .from('companies')
                .upsert([payload])
                .select()
                .single();

            return { data, error };
        },

        getById: async (userId) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('companies')
                .select('*')
                .eq('user_id', userId)
                .single();
            return { data, error };
        },

        update: async (userId, companyData) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('companies')
                .update(companyData)
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        }
    },

    // Offers Helpers
    offers: {
        create: async (offerData) => {
            if (!db.isReady) return { error: { message: 'Backend not configured' } };
            const { data: { user } } = await supabaseInstance.auth.getUser();
            if (!user) return { error: { message: 'No authenticated user' } };

            const payload = { ...offerData, user_id: user.id };
            const { data, error } = await supabaseInstance
                .from('offers')
                .insert([payload])
                .select()
                .single();
            return { data, error };
        },

        getByCompany: async (userId) => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            // Order by newest first
            const { data, error } = await supabaseInstance
                .from('offers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        getAllActive: async () => {
            if (!db.isReady) return { data: [], error: 'Backend not configured' };
            // Fetch offers with company info
            // Note: We need to join with companies table. 
            // Supabase auto-detects FKs. Assuming user_id refers to auth.users, 
            // but we need company profile data from 'companies' table which also has user_id.
            // We can try to join if relationships are set, or just fetch all and map.
            // For simplicity and robustness without complex FK setups immediately:
            // We will fetch offers, then fetch companies for those offers.

            const { data: offers, error } = await supabaseInstance
                .from('offers')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) return { data: [], error };

            // Enrich with company data
            // This is N+1 but acceptable for small scale or we can use `in` query
            const userIds = [...new Set(offers.map(o => o.user_id))];

            if (userIds.length === 0) return { data: [], error: null };

            const { data: companies } = await supabaseInstance
                .from('companies')
                .select('user_id, name, logo_url, sector')
                .in('user_id', userIds);

            const companiesMap = {};
            if (companies) {
                companies.forEach(c => companiesMap[c.user_id] = c);
            }

            const enriched = offers.map(o => ({
                ...o,
                company: companiesMap[o.user_id] || { name: 'Empresa Confidencial', logo_url: null }
            }));

            return { data: enriched, error: null };
        },

        update: async (offerId, updates) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('offers')
                .update(updates)
                .eq('id', offerId)
                .select()
                .single();
            return { data, error };
        },

        delete: async (offerId) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { error } = await supabaseInstance
                .from('offers')
                .delete()
                .eq('id', offerId);
            return { error };
        }
    },

    // Reference Data Helpers (Countries, Cities, Skills, etc.)
    reference: {
        getCountries: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('countries').select('*').order('name');
        },
        getCities: async (countryId) => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('cities').select('*').eq('country_id', countryId).order('name');
        },
        getAreas: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('professional_areas').select('*').order('name');
        },
        getSkills: async (areaSlug) => {
            if (!db.isReady) return { data: [] };
            // First get area ID
            const { data: area } = await supabaseInstance.from('professional_areas').select('id').eq('slug', areaSlug).single();
            if (!area) return { data: [] };

            return await supabaseInstance.from('skills').select('*').eq('area_id', area.id).order('name');
        },
        getInterests: async (category) => {
            if (!db.isReady) return { data: [] };
            let query = supabaseInstance.from('interests').select('*').order('name');
            if (category) {
                query = query.eq('category', category);
            }
            return await query;
        },
        getWorkModalities: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('work_modalities').select('*').order('display_order');
        },
        getEducationLevels: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('education_levels').select('*').order('display_order');
        },
        getExperienceRanges: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('experience_ranges').select('*').order('display_order');
        },

        // Company reference data
        getCompanySizes: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_sizes').select('*').order('display_order');
        },
        getCompanySectors: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_sectors').select('*').order('display_order');
        },
        getCompanyStages: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_stages').select('*').order('display_order');
        },
        getCompanyCultureValues: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_culture_values').select('*').order('display_order');
        },
        getCompanyPositions: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_positions').select('*').order('display_order');
        },
        getSeniorityLevels: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('seniority_levels').select('*').order('display_order');
        },
        getCompanyBenefits: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('company_benefits').select('*').order('display_order');
        },
        getSelectionDurations: async () => {
            if (!db.isReady) return { data: [] };
            return await supabaseInstance.from('selection_durations').select('*').order('display_order');
        }
    },

    // Swipes Helpers (mutual matching system)
    swipes: {
        // Create or update a swipe record
        create: async (targetId, direction, offerId = null) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return { error: 'No user' };

            // Upsert: if swipe already exists for this pair, update direction
            const payload = {
                swiper_id: userId,
                target_id: targetId,
                direction: direction
            };
            if (offerId) payload.offer_id = offerId;

            const { data, error } = await supabaseInstance
                .from('swipes')
                .upsert([payload], { onConflict: 'swiper_id,target_id' })
                .select()
                .single();

            if (error) return { data: null, error, isMutualMatch: false };

            // Check for mutual match (only if this was a right swipe)
            let isMutualMatch = false;
            if (direction === 'right') {
                const { data: reverseSwipe } = await supabaseInstance
                    .from('swipes')
                    .select('id')
                    .eq('swiper_id', targetId)
                    .eq('target_id', userId)
                    .eq('direction', 'right')
                    .maybeSingle();

                if (reverseSwipe) {
                    isMutualMatch = true;
                }
            }

            return { data, error: null, isMutualMatch };
        },

        // Get all user IDs that the current user has already swiped on
        getSwipedUserIds: async () => {
            if (!db.isReady) return { data: [] };
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return { data: [] };

            const { data, error } = await supabaseInstance
                .from('swipes')
                .select('target_id')
                .eq('swiper_id', userId);

            if (error) return { data: [] };
            return { data: (data || []).map(s => s.target_id) };
        },

        // For companies: get candidates who swiped right targeting this company
        getInterestedCandidates: async () => {
            if (!db.isReady) return { data: [] };
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return { data: [] };

            const { data: swipes, error } = await supabaseInstance
                .from('swipes')
                .select('swiper_id, offer_id, created_at')
                .eq('target_id', userId)
                .eq('direction', 'right')
                .order('created_at', { ascending: false });

            if (error || !swipes) return { data: [] };
            return { data: swipes };
        }
    },

    // User Statistics Helpers
    statistics: {
        // Get statistics for the current user
        get: async () => {
            if (!db.isReady) return { data: null, error: 'Backend not configured' };
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return { data: null, error: 'No user' };

            const { data, error } = await supabaseInstance
                .from('user_statistics')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            // If no row exists, initialize one
            if (!data && !error) {
                await db.statistics.initialize(userId);
                const retry = await supabaseInstance
                    .from('user_statistics')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();
                return { data: retry.data || null, error: retry.error };
            }

            return { data, error };
        },

        // Increment a specific counter field
        increment: async (field) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return { error: 'No user' };

            // Try calling the RPC function first (atomic increment)
            const { error: rpcError } = await supabaseInstance
                .rpc('increment_stat', { p_user_id: userId, p_field: field });

            if (rpcError) {
                console.warn('RPC increment failed, using fallback:', rpcError);
                // Fallback: read-modify-write
                const { data: current } = await db.statistics.get();
                if (current) {
                    const newValue = (current[field] || 0) + 1;
                    await supabaseInstance
                        .from('user_statistics')
                        .update({ [field]: newValue, updated_at: new Date().toISOString(), last_activity_at: new Date().toISOString() })
                        .eq('user_id', userId);
                }
            }

            // Also log daily activity
            await db.statistics.logDailyActivity(field);

            return { error: null };
        },

        // Log daily activity for the weekly chart
        logDailyActivity: async (type) => {
            if (!db.isReady) return;
            const userId = (await supabaseInstance.auth.getUser()).data.user?.id;
            if (!userId) return;

            const today = new Date().toISOString().split('T')[0]; // "2026-02-12"

            // Get current daily_activity
            const { data } = await supabaseInstance
                .from('user_statistics')
                .select('daily_activity')
                .eq('user_id', userId)
                .single();

            if (!data) return;

            let activity = data.daily_activity || [];

            // Find or create today's entry
            let todayEntry = activity.find(d => d.date === today);
            if (!todayEntry) {
                todayEntry = { date: today, views: 0, matches: 0, swipes: 0, messages: 0 };
                activity.push(todayEntry);
            }

            // Map field to daily key
            const fieldMap = {
                'profile_views': 'views',
                'matches_count': 'matches',
                'swipes_given': 'swipes',
                'messages_sent': 'messages'
            };
            const key = fieldMap[type];
            if (key) todayEntry[key] = (todayEntry[key] || 0) + 1;

            // Keep only last 7 days
            activity.sort((a, b) => a.date.localeCompare(b.date));
            if (activity.length > 7) activity = activity.slice(-7);

            await supabaseInstance
                .from('user_statistics')
                .update({ daily_activity: activity })
                .eq('user_id', userId);
        },

        // Increment a specific counter for ANY user (used for profile views)
        incrementForUser: async (targetUserId, field) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            if (!targetUserId) return { error: 'No target user' };

            console.log('[DEBUG] incrementForUser called:', targetUserId, field);

            // Try RPC first (atomic increment)
            const { error: rpcError } = await supabaseInstance
                .rpc('increment_stat', { p_user_id: targetUserId, p_field: field });

            if (rpcError) {
                console.log('[DEBUG] RPC increment_stat failed, using direct update fallback:', rpcError.message);
                // Fallback: read-modify-write directly for the target user
                const { data: current } = await supabaseInstance
                    .from('user_statistics')
                    .select('*')
                    .eq('user_id', targetUserId)
                    .maybeSingle();

                if (current) {
                    const newValue = (current[field] || 0) + 1;
                    console.log('[DEBUG] Updating', field, 'from', current[field] || 0, 'to', newValue, 'for user', targetUserId);
                    const { error: updateError } = await supabaseInstance
                        .from('user_statistics')
                        .update({ [field]: newValue, updated_at: new Date().toISOString() })
                        .eq('user_id', targetUserId);
                    if (updateError) {
                        console.error('[DEBUG] Direct update failed:', updateError);
                        return { error: updateError };
                    }
                } else {
                    console.log('[DEBUG] No stats row found for user', targetUserId, '- creating one');
                    // Initialize + set the field
                    const { error: insertError } = await supabaseInstance
                        .from('user_statistics')
                        .upsert([{ user_id: targetUserId, [field]: 1 }], { onConflict: 'user_id' })
                        .select()
                        .single();
                    if (insertError) {
                        console.error('[DEBUG] Upsert failed:', insertError);
                        return { error: insertError };
                    }
                }
            } else {
                console.log('[DEBUG] RPC increment_stat succeeded for user', targetUserId);
            }

            return { error: null };
        },

        // Initialize statistics for a new user
        initialize: async (userId) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            const { data, error } = await supabaseInstance
                .from('user_statistics')
                .upsert([{ user_id: userId }], { onConflict: 'user_id' })
                .select()
                .single();
            return { data, error };
        }
    }
};

// Make available globally
window.talentlyBackend = db;
console.log('✅ Supabase Wrapper Loaded');

