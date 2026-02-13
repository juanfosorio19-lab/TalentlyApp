
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
        }
    },

    // Storage Helpers
    storage: {
        uploadImage: async (file, bucket = 'images') => {
            if (!db.isReady) return null;
            const fileName = `${Date.now()}_${file.name}`;
            const { data, error } = await supabaseInstance.storage.from(bucket).upload(fileName, file);
            if (error) {
                console.error('Upload Error:', error);
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
            const { data, error } = await supabaseInstance
                .from('matches')
                .insert([{ user_id_1: (await supabaseInstance.auth.getUser()).data.user.id, user_id_2: otherUserId }])
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
                .single();
            return { data, error };
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

            console.log('💾 DEBUG: Creating company record with payload:', payload);

            const { data, error } = await supabaseInstance
                .from('companies')
                .upsert([payload])
                .select()
                .single();

            console.log('📊 DEBUG: Company create result:', { data, error });
            return { data, error };
        },

        getById: async (userId) => {
            if (!db.isReady) return { error: 'Backend not configured' };
            console.log('🔍 DEBUG: Fetching company by user_id:', userId);
            const { data, error } = await supabaseInstance
                .from('companies')
                .select('*')
                .eq('user_id', userId)
                .single();
            console.log('📊 DEBUG: Company fetch result:', { data, error });
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

