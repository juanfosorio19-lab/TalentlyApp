console.log('TALENTLY APP V56 LOADED');
// Version Check
if (!window.location.search.includes('v=56')) {
    // Force clear stale matches which are causing ID conflits
    localStorage.removeItem('talently_matches');
    console.log('CLEARED STALE MATCHES');
}

const app = {
    currentView: 'welcomeView',
    currentSection: 'swipeSection', // This is default. If it goes to Matches, check why.
    currentIndex: 0,
    profiles: [...mockProfiles],
    isAuthenticated: false,
    userData: {},
    profileType: null,
    interests: [],
    suggestedTagsRendered: false,
    skillsSelected: [],


    citiesByCountry: citiesByCountry,

    skillsByArea: skillsByArea,

    interestsByArea: interestsByArea,

    interestsData: interestsData,

    // Company-specific state
    companyTechStack: [],
    companyTags: [],
    companyBenefits: [],
    companyPhotos: [],
    companyLogo: null,
    companyBanner: null,
    techSuggestionsRendered: false,
    companyTagSuggestionsRendered: false,
    referenceData: { countries: [], areas: [] }, // Initialize referenceData
    matches: [],
    userProfile: {
        experience: [
            { id: 1, role: 'Senior UX Designer', company: 'TechSolutions', period: '2020 - Presente' }
        ],
        education: [
            { id: 1, degree: 'Diseño Gráfico', school: 'Universidad de Chile', period: '2015 - 2019' }
        ]
    },

    // ============================================
    // SETTINGS & UTILS
    // ============================================

    // ============================================
    // SETTINGS & PROFILE TABS
    // ============================================


    switchProfileTab(tabName) {
        console.log('switchProfileTab called with:', tabName);

        // Update Buttons
        document.querySelectorAll('.profile-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
        });

        const activeBtn = document.getElementById(`tab-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = 'var(--surface)';
            activeBtn.style.color = 'var(--text-primary)';
        }

        // Show/Hide Content
        const cvContent = document.getElementById('profile-content-cv');
        const activityContent = document.getElementById('profile-content-activity');

        console.log('CV element found:', !!cvContent);
        console.log('Activity element found:', !!activityContent);

        if (tabName === 'cv') {
            if (cvContent) { cvContent.style.display = 'block'; cvContent.style.visibility = 'visible'; }
            if (activityContent) { activityContent.style.display = 'none'; activityContent.style.visibility = 'hidden'; }
        } else {
            if (cvContent) { cvContent.style.display = 'none'; cvContent.style.visibility = 'hidden'; }
            if (activityContent) { activityContent.style.display = 'block'; activityContent.style.visibility = 'visible'; }
            // Load dynamic stats when switching to activity tab
            this.renderActivityStats();
        }

        console.log('After switch - CV display:', cvContent?.style.display, 'Activity display:', activityContent?.style.display);
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('talently_dark_mode', isDark);

        // Update toggle UI if exists
        const toggle = document.getElementById('darkModeToggleModal');
        if (toggle) toggle.checked = isDark;
    },



    async init() {
        console.log('🚀 DEBUG: ===== APP INITIALIZING =====');
        console.log('💾 DEBUG: localStorage user_type:', localStorage.getItem('talently_user_type'));
        console.log('🔐 DEBUG: localStorage logged_in:', localStorage.getItem('talently_logged_in'));

        // Wait for Supabase
        await this.waitForSupabase();

        // Pre-fetch reference data
        await this.loadReferenceData();

        // Check Dark Mode
        const isDark = localStorage.getItem('talently_dark_mode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');

        this.checkSession();
        this.setupAuthListener();
    },

    // Función para limpiar completamente el caché y reiniciar la app
    clearCache() {
        console.log('🧹 Limpiando todo el caché de Talently...');

        // Limpiar localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('talently_') || key.includes('supabase')) {
                localStorage.removeItem(key);
                console.log('Removed:', key);
            }
        });

        // Limpiar sessionStorage
        sessionStorage.clear();

        // Resetear propiedades del app
        this.isAuthenticated = false;
        this.currentUser = null;
        this.profileType = null;
        this.userType = null;
        this.companyProfile = null;
        this.companyLogo = null;
        this.companyPhotos = [];
        this.companyBanner = null;
        this.companyTechStack = [];

        console.log('✅ Caché limpiado. Recargando app...');

        // Recargar la página con hard refresh
        setTimeout(() => {
            window.location.href = window.location.pathname + '?v=' + Date.now();
        }, 500);
    },

    async loadReferenceData() {
        if (!window.talentlyBackend) return;

        try {
            console.log('Loading reference data from DB...');
            const { data: countries } = await window.talentlyBackend.reference.getCountries();
            const { data: areas } = await window.talentlyBackend.reference.getAreas();

            if (countries) this.referenceData.countries = countries;
            if (areas) this.referenceData.areas = areas;

            console.log('Reference data loaded:', this.referenceData);
        } catch (e) {
            console.error('Error loading reference data:', e);
        }
    },

    async waitForSupabase() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            // Use the exposed client or factory as fallback (though factory fails auth calls)
            // Fix: Use correct client reference
            const client = window.supabaseClient || window.supabase;
            const { data: { session } } = await client.auth.getSession();

            if (session) {
                // Set basic user
                this.currentUser = session.user;

                // FETCH FULL PROFILE DATA
                const { data: profile } = await window.talentlyBackend.profiles.getById(session.user.id);

                // CHECK ONBOARDING STATUS
                // If profile exists AND has completed onboarding -> Main App
                // Otherwise -> Onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...this.currentUser, ...profile };

                    // Parsear JSONB arrays
                    if (typeof this.currentUser.experience === 'string') {
                        try {
                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                        } catch (e) {
                            this.currentUser.experience = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.experience)) {
                        this.currentUser.experience = [];
                    }

                    if (typeof this.currentUser.education === 'string') {
                        try {
                            this.currentUser.education = JSON.parse(this.currentUser.education);
                        } catch (e) {
                            this.currentUser.education = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.education)) {
                        this.currentUser.education = [];
                    }

                    // Cargar avatar desde localStorage si existe
                    this.loadAvatarFromLocalStorage();

                    // FIX: prevent auto-redirect loop if already authenticated
                    if (!this.isAuthenticated) {
                        this.enterMainApp();
                    }
                } else {
                    console.log('User has incomplete onboarding. Redirecting...');
                    // Ensure no residual mock data
                    this.userProfile = {};
                    this.showView('onboardingStep1');
                }
            } else {
                this.showView('welcomeView');
            }
        } else {
            // Fallback logic
            this.showView('welcomeView');
        }
    },

    async checkSession() {
        console.log('🔍 DEBUG: ===== CHECK SESSION =====');
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            // Use the exposed client or factory as fallback (though factory fails auth calls)
            // Fix: Use correct client reference
            const client = window.supabaseClient || window.supabase;
            const { data: { session } } = await client.auth.getSession();

            console.log('📝 DEBUG: Session exists:', !!session);
            if (session) {
                console.log('👤 DEBUG: User ID:', session.user.id);
                console.log('📧 DEBUG: Email:', session.user.email);

                // Set basic user
                this.currentUser = session.user;

                // Check localStorage to determine user type
                const savedUserType = localStorage.getItem('talently_user_type');
                console.log('💾 DEBUG: Saved user type from localStorage:', savedUserType);

                let profile = null;
                let userType = null;

                // Try to fetch from COMPANIES table first if user_type is company
                if (savedUserType === 'company') {
                    console.log('🏢 DEBUG: Attempting to fetch from COMPANIES table...');
                    const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(session.user.id);
                    if (companyData && !companyError) {
                        console.log('✅ DEBUG: Found company profile:', companyData);
                        profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                        userType = 'company';
                        this.profileType = 'company';
                    } else {
                        console.log('❌ DEBUG: No company profile found:', companyError);
                    }
                }

                // If not found in companies, try PROFILES table
                if (!profile) {
                    console.log('👤 DEBUG: Attempting to fetch from PROFILES table...');
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(session.user.id);
                    if (profileData && !profileError) {
                        console.log('✅ DEBUG: Found candidate profile:', profileData);
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                    } else {
                        console.log('❌ DEBUG: No candidate profile found:', profileError);
                    }
                }

                console.log('📋 DEBUG: Final profile result:', profile);
                console.log('🎯 DEBUG: Determined user type:', userType);

                // CHECK ONBOARDING STATUS
                // If profile exists AND has completed onboarding -> Main App
                // Otherwise -> Onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...this.currentUser, ...profile };

                    // Parsear JSONB arrays
                    if (typeof this.currentUser.experience === 'string') {
                        try {
                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                        } catch (e) {
                            this.currentUser.experience = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.experience)) {
                        this.currentUser.experience = [];
                    }

                    if (typeof this.currentUser.education === 'string') {
                        try {
                            this.currentUser.education = JSON.parse(this.currentUser.education);
                        } catch (e) {
                            this.currentUser.education = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.education)) {
                        this.currentUser.education = [];
                    }

                    // Cargar avatar desde localStorage si existe
                    this.loadAvatarFromLocalStorage();

                    // FIX: prevent auto-redirect loop if already authenticated
                    if (!this.isAuthenticated) {
                        this.enterMainApp();
                    }
                } else {
                    console.log('User has incomplete onboarding. Redirecting...');
                    // Ensure no residual mock data
                    this.userProfile = {};
                    this.showView('onboardingStep1');
                }
            } else {
                this.showView('welcomeView');
            }
        } else {
            // Fallback logic
            this.showView('welcomeView');
        }
    },

    setupAuthListener() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const client = window.supabaseClient || window.supabase;
            if (client && client.auth) {
                client.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        this.currentUser = session.user;
                        // Fetch user profile to ensure name/image availability
                        if (window.talentlyBackend && window.talentlyBackend.profiles) {
                            window.talentlyBackend.profiles.getById(session.user.id).then(({ data: profile }) => {
                                if (profile) {
                                    this.currentUser = { ...this.currentUser, ...profile };

                                    // Parsear JSONB arrays
                                    if (typeof this.currentUser.experience === 'string') {
                                        try {
                                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                                        } catch (e) {
                                            this.currentUser.experience = [];
                                        }
                                    }
                                    if (!Array.isArray(this.currentUser.experience)) {
                                        this.currentUser.experience = [];
                                    }

                                    if (typeof this.currentUser.education === 'string') {
                                        try {
                                            this.currentUser.education = JSON.parse(this.currentUser.education);
                                        } catch (e) {
                                            this.currentUser.education = [];
                                        }
                                    }
                                    if (!Array.isArray(this.currentUser.education)) {
                                        this.currentUser.education = [];
                                    }

                                    // Only re-enter mainApp if NOT already authenticated
                                    // This prevents view reset on tab visibility changes
                                    if (this.currentView === 'mainApp' && !this.isAuthenticated) {
                                        this.enterMainApp();
                                    } else if (this.currentView === 'mainApp') {
                                        // Just update profile data without resetting navigation
                                        this.renderProfile();
                                    }
                                }
                            });
                        }
                    } else if (event === 'SIGNED_OUT') {
                        this.currentUser = null;
                        this.isAuthenticated = false;
                        this.showView('welcomeView');
                    }
                });
            }
        }
    },

    showView(viewId) {
        console.log('showView called with:', viewId);

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            console.log('Added active to:', viewId);
            this.currentView = viewId;
            window.scrollTo(0, 0);
            this.checkAndRenderTags(viewId);
        } else {
            console.error('View not found:', viewId);
        }
    },

    loadAvatarFromLocalStorage() {
        const backup = localStorage.getItem('talently_avatar_backup');
        // console.log('loadAvatarFromLocalStorage - backup exists:', !!backup);
        // console.log('loadAvatarFromLocalStorage - currentUser.avatar_url:', this.currentUser?.avatar_url);

        if (backup && (!this.currentUser.avatar_url || this.currentUser.avatar_url.startsWith('blob:'))) {
            // console.log('Cargando avatar desde localStorage backup');
            this.currentUser.avatar_url = backup;
            this.currentUser.image = backup;
        } else if (!backup) {
            // console.log('No hay backup de avatar en localStorage');
        } else {
            // console.log('Ya hay avatar_url válido:', this.currentUser.avatar_url);
        }

        // SIEMPRE re-renderizar el perfil cuando vuelve la visibilidad
        // para forzar que la imagen se actualice en el DOM
        if (this.currentView === 'mainApp') {
            // console.log('Re-renderizando perfil para actualizar avatar...');
            this.renderProfile();
        }
    },

    // Safety Force Render for Tags
    checkAndRenderTags(viewId) {
        if (viewId === 'companyStep14') {
            if (typeof this.renderCompanyTagSuggestions === 'function') {
                try {
                    this.renderCompanyTagSuggestions();
                } catch (e) {
                    // Silent fail
                }
            }
        }
    },

    showAppSection(sectionId) {
        // FIX: Remove chat mode if leaving chatSection
        if (sectionId !== 'chatSection') {
            document.body.classList.remove('chat-mode');
        }

        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Update nav
        document.querySelectorAll('.nav-item').forEach((item, index) => {
            item.classList.remove('active');
        });

        const sections = ['swipeSection', 'matchesSection', 'settingsSection'];
        const sectionIndex = sections.indexOf(sectionId);
        if (sectionIndex >= 0) {
            document.querySelectorAll('.nav-item')[sectionIndex].classList.add('active');
        }

        this.currentSection = sectionId;

        if (sectionId === 'matchesSection') {
            this.renderMatches();
        }
        if (sectionId === 'settingsSection') {
            this.renderProfile();
            this.initNotificationToggle();
        }
    },

    showWelcome() {
        this.showView('welcomeView');
    },

    showLogin() {
        this.showView('loginView');
    },

    showRegister() {
        this.showView('registerView');
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--text-primary);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    validatePassword() {
        const passwordInput = document.getElementById('registerPassword');
        const successMsg = document.getElementById('passwordSuccess');
        const reqLength = document.getElementById('reqLength');
        const reqUppercase = document.getElementById('reqUppercase');
        const reqSpecial = document.getElementById('reqSpecial');

        if (!passwordInput) return;

        const password = passwordInput.value;

        // Check requirements
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%&*^()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);

        // Update length requirement
        if (password.length === 0) {
            reqLength.style.color = 'var(--text-muted)';
            reqLength.querySelector('span').textContent = '○';
        } else if (hasMinLength) {
            reqLength.style.color = 'var(--success)';
            reqLength.querySelector('span').textContent = '?';
        } else {
            reqLength.style.color = 'var(--danger)';
            reqLength.querySelector('span').textContent = '✗';
        }

        // Update uppercase requirement
        if (password.length === 0) {
            reqUppercase.style.color = 'var(--text-muted)';
            reqUppercase.querySelector('span').textContent = '○';
        } else if (hasUppercase) {
            reqUppercase.style.color = 'var(--success)';
            reqUppercase.querySelector('span').textContent = '?';
        } else {
            reqUppercase.style.color = 'var(--danger)';
            reqUppercase.querySelector('span').textContent = '✗';
        }

        // Update special char requirement
        if (password.length === 0) {
            reqSpecial.style.color = 'var(--text-muted)';
            reqSpecial.querySelector('span').textContent = '○';
        } else if (hasSpecialChar) {
            reqSpecial.style.color = 'var(--success)';
            reqSpecial.querySelector('span').textContent = '?';
        } else {
            reqSpecial.style.color = 'var(--danger)';
            reqSpecial.querySelector('span').textContent = '✗';
        }

        // Update input border and success message
        const allValid = hasMinLength && hasUppercase && hasSpecialChar;

        if (password.length === 0) {
            passwordInput.style.borderColor = 'var(--border)';
            successMsg.style.display = 'none';
        } else if (allValid) {
            passwordInput.style.borderColor = 'var(--success)';
            successMsg.style.display = 'block';
        } else {
            passwordInput.style.borderColor = 'var(--danger)';
            successMsg.style.display = 'none';
        }

        return allValid;
    },

    async handleLogin(e) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        console.log('🔐 DEBUG: ===== LOGIN ATTEMPT =====');
        console.log('📧 DEBUG: Email:', email);

        if (!email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                console.log('🔑 DEBUG: Calling auth.signIn...');
                const { data, error } = await window.talentlyBackend.auth.signIn(email, password);
                if (error) throw error;

                console.log('✅ DEBUG: Auth successful, user ID:', data.user.id);

                // Try to fetch from both tables
                let profile = null;
                let userType = null;

                // First try COMPANIES table
                console.log('🏢 DEBUG: Trying to fetch from COMPANIES table...');
                const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(data.user.id);
                if (companyData && !companyError) {
                    console.log('✅ DEBUG: Found company profile:', companyData);
                    profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                    userType = 'company';
                    this.profileType = 'company';
                    localStorage.setItem('talently_user_type', 'company');
                } else {
                    console.log('❌ DEBUG: Not found in companies table, trying profiles...');

                    // Try PROFILES table
                    console.log('👤 DEBUG: Trying to fetch from PROFILES table...');
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(data.user.id);
                    if (profileData && !profileError) {
                        console.log('✅ DEBUG: Found candidate profile:', profileData);
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                        localStorage.setItem('talently_user_type', userType);
                    } else {
                        console.log('❌ DEBUG: Not found in profiles table either');
                    }
                }

                console.log('📋 DEBUG: Final profile:', profile);
                console.log('🎯 DEBUG: User type:', userType);

                // Verificar si existe perfil Y si completó onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...data.user, ...profile };
                    this.showToast('¡Bienvenido de nuevo!');
                    this.enterMainApp();
                } else if (profile) {
                    // Perfil existe pero no completó onboarding
                    this.currentUser = { ...data.user, ...profile };
                    this.showToast('Completa tu perfil para continuar');
                    this.showView('onboardingStep1');
                } else {
                    // No hay perfil, debe completar onboarding
                    this.currentUser = data.user;
                    this.showToast('Completa tu perfil para continuar');
                    this.showView('onboardingStep1');
                }
            } catch (err) {
                console.error('❌ DEBUG: Login Error:', err);
                this.showToast('Error al iniciar sesión: ' + err.message, 'error');
            }
            return;
        }

        // Fallback
        if (email.includes('@') && password.length > 5) {
            this.currentUser = { name: 'Demo User', email };
            localStorage.setItem('talently_logged_in', 'true');
            this.showToast('¡Bienvenido de nuevo! (Demo)');
            this.enterMainApp();
        } else {
            this.showToast('Credenciales incorrectas (Demo)', 'error');
        }
    },

    async handleRegisterClick(e) {
        if (e) e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                // 1. Sign Up Auth with Metadata
                const { data, error } = await window.talentlyBackend.auth.signUp(email, password, {
                    data: { full_name: name }
                });
                if (error) throw error;

                // 2. Create Public Profile
                // CRITICAL FIX: Only create profile if we have a valid session (User is logged in).
                // If Supabase returns a user but NO session, it means Email Confirmation is required or User Exists.
                if (data.session) {
                    if (data.user) {
                        const { error: profileError } = await window.talentlyBackend.profiles.create({
                            id: data.user.id,
                            email: email,
                            name: name,
                            user_type: 'candidate',
                            image: `https://ui-avatars.com/api/?name=${name}&background=random`
                        });

                        if (profileError) {
                            console.error('Profile Creation Error RAW:', profileError);
                            const msg = profileError.message || JSON.stringify(profileError);
                            // Don't block flow if profile creation fails (it might conflict with trigger)
                            console.warn('Profile creation warning:', msg);
                        }
                    }

                    // Update local state immediately so UI reflects name/image
                    this.currentUser = {
                        ...data.user,
                        name: name,
                        email: email, // ensure email is available
                        image: `https://ui-avatars.com/api/?name=${name}&background=random`
                    };
                    this.showToast('Cuenta creada exitosamente');
                    this.showView('onboardingStep1');
                } else if (data.user) {
                    // User created (or existed) but no session -> Likely needs email confirmation OR user already exists
                    console.warn('Signup successful but no session. Email confirmation likely required OR user exists.', data);

                    // SAFE MODE/DEV WARNING
                    if (email.includes('test') || email.includes('example')) {
                        this.showToast('⚠️ Modo Prueba: Confirma tu correo real o usa uno válido.', 'info');
                    } else {
                        this.showToast('Registro procesado. Revisa tu correo para confirmar.', 'info');
                    }

                    // Redirect to login to avoid "stuck" state
                    setTimeout(() => {
                        this.showLogin();
                    }, 3500);
                }
            } catch (err) {
                console.error('Signup Error:', err);
                this.showToast('Error al registrarse: ' + err.message, 'error');
            }
            return;
        }

        // ... Mock fallback ...
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            type: 'candidate',
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
        };

        this.currentUser = newUser;
        localStorage.setItem('talently_logged_in', 'true');
        this.showToast('Cuenta creada (Demo)');
        this.showView('onboardingStep1');
    },

    // Restored Methods
    async loginWithGoogle() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + window.location.pathname
                    }
                });
                if (error) throw error;
                // Supabase will handle the redirect
            } catch (err) {
                console.error('Google Login Error:', err);
                let msg = err.message;
                if (msg && msg.includes('provider is not enabled')) {
                    msg = 'El inicio con Google no está habilitado en Supabase. Contacta al admin.';
                }
                this.showToast('Error: ' + msg, 'error');
            }
        } else {
            // Mock Fallback
            this.userData = { name: 'Usuario Google', email: 'usuario@gmail.com' };
            this.showToast('Login Google (Demo)');
            this.showView('onboardingStep1');
        }
    },

    authenticateUser() {
        this.isAuthenticated = true;
        localStorage.setItem('talently_logged_in', 'true');
        this.enterMainApp();
    },

    enterMainApp() {
        console.log('🚀 DEBUG: ===== ENTERING MAIN APP =====');
        console.log('👤 DEBUG: User type:', this.profileType);
        console.log('💾 DEBUG: localStorage user_type:', localStorage.getItem('talently_user_type'));

        this.isAuthenticated = true;
        this.updateBadge();

        // Route to correct app based on user type
        if (this.profileType === 'company' || localStorage.getItem('talently_user_type') === 'company') {
            console.log('🏢 DEBUG: Redirecting to COMPANY APP');
            this.showView('companyApp');
            this.showCompanySection('companyProfileSection');
            this.renderCompanyProfile();
        } else {
            console.log('👤 DEBUG: Redirecting to CANDIDATE APP');
            // Only reset view/section if not already in mainApp
            if (this.currentView !== 'mainApp') {
                this.showView('mainApp');
                this.showAppSection('swipeSection');
            }

            this.renderCard();
            this.setupSwipeGestures();
            this.renderProfile();
        }
    },

    renderProfile() {
        if (!this.currentUser) return;

        // console.log('renderProfile() ejecutándose...');

        // 1. Update Header Info
        const profileHero = document.querySelector('.profile-hero');
        if (profileHero) {
            // Update Name
            const nameEl = profileHero.querySelector('h2');
            if (nameEl) nameEl.textContent = this.currentUser.name || 'Usuario';

            // Update Position
            const titleEl = profileHero.querySelector('p');
            if (titleEl) titleEl.textContent = this.currentUser.current_position || 'Sin cargo definido';

            // Update Location
            let countryDisplay = this.currentUser.country || '';
            // Try to resolve Country ID to Name if possible
            if (this.referenceData && this.referenceData.countries) {
                const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
                if (countryObj) countryDisplay = countryObj.name;
            }

            const locationEl = profileHero.querySelector('.profile-location span');
            if (locationEl) locationEl.textContent = `${this.currentUser.city || ''}, ${countryDisplay}`;

            // Update Avatar (priorizar avatar_url sobre image para evitar blob: URLs)
            const avatar = document.getElementById('profileAvatar');
            const avatarImg = document.getElementById('profileAvatarImg');
            const imageUrl = this.currentUser.avatar_url || this.currentUser.image;

            // console.log('renderProfile() - Elementos encontrados:', {
            //     avatar: !!avatar,
            //     avatarImg: !!avatarImg,
            //     imageUrl: imageUrl?.substring(0, 80) + '...',
            //     isBlob: imageUrl?.startsWith('blob:')
            // });

            if (avatar && imageUrl && !imageUrl.startsWith('blob:')) {
                avatar.src = imageUrl;
                // console.log('✓ Avatar actualizado (profileAvatar)');
            }
            if (avatarImg && imageUrl && !imageUrl.startsWith('blob:')) {
                avatarImg.src = imageUrl;
                // console.log('✓ Avatar actualizado (profileAvatarImg)');
            }
        } else {
            // console.warn('renderProfile() - No se encontró .profile-hero');
        }

        // 2. Update Personal Information List
        const updateInfoRow = (label, value) => {
            const rows = document.querySelectorAll('.profile-info-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.profile-info-label');
                if (labelEl && labelEl.textContent.includes(label)) {
                    const valueEl = row.querySelector('.profile-info-value');
                    if (valueEl) valueEl.textContent = value;
                    break;
                }
            }
        };

        if (this.currentUser.birth_date) updateInfoRow('Fecha de nacimiento', this.currentUser.birth_date);
        if (this.currentUser.email) updateInfoRow('Email', this.currentUser.email);

        if (this.currentUser.availability) updateInfoRow('Disponibilidad', this.currentUser.availability);
        // Map modality values to user-friendly text if needed
        if (this.currentUser.work_modality) updateInfoRow('Modalidad', this.currentUser.work_modality);

        if (this.currentUser.expected_salary) {
            const formatted = new Intl.NumberFormat('es-CL').format(this.currentUser.expected_salary);
            updateInfoRow('Pretensión salarial', `$${formatted} ${this.currentUser.currency || 'CLP'}`);
        }

        // 3. Update Skills
        const skillsContainer = document.querySelector('.skills-display');
        if (skillsContainer) {
            const skills = this.currentUser.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">Sin habilidades registradas</span>';
            }
        }

        // 4. Update About Me
        const aboutMeEl = document.querySelector('.about-text');
        if (aboutMeEl) {
            aboutMeEl.textContent = this.currentUser.bio || 'Sin descripción.';
        }

        // 5. Render Experience & Education
        this.renderExperience();
        this.renderEducation();
    },

    // ============================================
    // ACTIVITY STATISTICS (Dynamic)
    // ============================================

    async renderActivityStats() {
        console.log('renderActivityStats called');

        // Default values if backend not available
        let stats = {
            profile_views: 0,
            matches_count: 0,
            swipes_given: 0,
            messages_sent: 0,
            messages_received: 0,
            avg_response_time_minutes: 0,
            daily_activity: []
        };

        // Try to fetch from backend
        if (window.talentlyBackend && window.talentlyBackend.isReady && window.talentlyBackend.statistics) {
            try {
                const { data, error } = await window.talentlyBackend.statistics.get();
                if (data && !error) {
                    stats = { ...stats, ...data };
                    console.log('Stats loaded:', stats);
                } else {
                    console.warn('Stats fetch error:', error);
                }
            } catch (e) {
                console.warn('Stats fetch failed:', e);
            }
        }

        // --- 1. Update Summary Values ---
        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = stats.profile_views || 0;

        const statMatches = document.getElementById('stat-matches');
        if (statMatches) statMatches.textContent = stats.matches_count || 0;

        // Response rate = messages_sent / messages_received * 100
        const responseRate = stats.messages_received > 0
            ? Math.round((stats.messages_sent / stats.messages_received) * 100)
            : 0;
        const statResponseRate = document.getElementById('stat-response-rate');
        if (statResponseRate) statResponseRate.textContent = `${responseRate}%`;

        // --- 2. Update Weekly Chart ---
        const chartContainer = document.getElementById('activity-chart');
        const labelsContainer = document.getElementById('activity-chart-labels');

        if (chartContainer && labelsContainer) {
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const activity = stats.daily_activity || [];

            // Fill last 7 days
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayData = activity.find(a => a.date === dateStr) || { views: 0, matches: 0, swipes: 0, messages: 0 };
                const total = (dayData.views || 0) + (dayData.matches || 0) + (dayData.swipes || 0) + (dayData.messages || 0);
                days.push({
                    label: dayNames[d.getDay()],
                    total: total
                });
            }

            // Find max for scaling
            const maxVal = Math.max(...days.map(d => d.total), 1);

            // Render bars
            chartContainer.innerHTML = days.map(d => {
                const heightPct = Math.max((d.total / maxVal) * 100, 5); // min 5% height
                return `<div class="chart-bar" style="height: ${heightPct}%;" data-value="${d.total}"></div>`;
            }).join('');

            // Render labels
            labelsContainer.innerHTML = days.map(d => {
                return `<span class="chart-label">${d.label}</span>`;
            }).join('');
        }

        // --- 3. Update Ranking ---
        // Match rate
        const matchRate = stats.swipes_given > 0
            ? Math.round((stats.matches_count / stats.swipes_given) * 100)
            : 0;
        const rankMatchRate = document.getElementById('rank-match-rate');
        if (rankMatchRate) rankMatchRate.textContent = `${matchRate}%`;

        // Response time
        const avgTime = stats.avg_response_time_minutes || 0;
        const rankResponseTime = document.getElementById('rank-response-time');
        if (rankResponseTime) {
            if (avgTime === 0) {
                rankResponseTime.textContent = '-';
            } else if (avgTime < 60) {
                rankResponseTime.textContent = `${Math.round(avgTime)}m`;
            } else {
                rankResponseTime.textContent = `<${Math.ceil(avgTime / 60)}h`;
            }
        }

        // Profile completeness (computed dynamically)
        const profileComplete = this.calculateProfileCompleteness();
        const rankProfileComplete = document.getElementById('rank-profile-complete');
        if (rankProfileComplete) rankProfileComplete.textContent = `${profileComplete}%`;

        // Update ranking subtitles
        const rankMatchSub = document.getElementById('rank-match-subtitle');
        if (rankMatchSub) {
            if (matchRate >= 60) rankMatchSub.textContent = 'Top 5% de candidatos';
            else if (matchRate >= 40) rankMatchSub.textContent = 'Top 20% de candidatos';
            else if (matchRate >= 20) rankMatchSub.textContent = 'Top 50% de candidatos';
            else rankMatchSub.textContent = '¡Sigue mejorando!';
        }

        const rankProfileSub = document.getElementById('rank-profile-subtitle');
        if (rankProfileSub) rankProfileSub.textContent = `${profileComplete}% completado`;
    },

    calculateProfileCompleteness() {
        if (!this.currentUser) return 0;

        const fields = [
            'name', 'email', 'birth_date', 'country', 'city',
            'current_position', 'work_modality', 'availability',
            'expected_salary', 'bio'
        ];

        // Image check (support both fields, pero excluir blob: URLs temporales)
        const imageUrl = this.currentUser.avatar_url || this.currentUser.image;
        const hasImage = imageUrl && !imageUrl.startsWith('blob:') && imageUrl.trim() !== '';

        const arrayFields = ['skills', 'experience', 'education'];

        let filled = 0;
        let total = fields.length + 1 + arrayFields.length; // +1 for image

        fields.forEach(f => {
            if (this.currentUser[f] && this.currentUser[f] !== '') filled++;
        });

        if (hasImage) filled++;

        arrayFields.forEach(f => {
            const arr = this.currentUser[f];
            if (Array.isArray(arr) && arr.length > 0) {
                filled++;
            }
        });

        return Math.round((filled / total) * 100);
    },


    // ============================================
    // PERSONAL INFO MANAGEMENT
    // ============================================

    openEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (!modal) return;

        // Populate Fields
        document.getElementById('editName').value = this.currentUser.name || '';
        document.getElementById('editPosition').value = this.currentUser.current_position || '';

        const linkedinInput = document.getElementById('editLinkedin');
        if (linkedinInput) linkedinInput.value = this.currentUser.linkedin || '';

        const bioInput = document.getElementById('editBio');
        if (bioInput) bioInput.value = this.currentUser.bio || '';

        // Handle Salary Formatting
        const salaryInput = document.getElementById('editSalary');
        if (salaryInput) {
            const rawSalary = this.currentUser.expected_salary || '';
            salaryInput.value = new Intl.NumberFormat('es-CL').format(rawSalary);
        }

        // Set Currency (normalize to lowercase to match options)
        const currencySelect = document.getElementById('editCurrency');
        const userCurrency = (this.currentUser.currency || 'clp').toLowerCase();
        if (currencySelect) currencySelect.value = userCurrency;

        document.getElementById('editModality').value = this.currentUser.work_modality || 'Remoto';

        // Set Availability (normalize)
        const availabilitySelect = document.getElementById('editAvailability');
        const userAvailability = this.currentUser.availability || 'inmediata';
        // Try exact match, or fallback if using old values
        if (availabilitySelect) {
            availabilitySelect.value = userAvailability;
            // If value didn't stick (because it's not in options), default to immediate
            if (!availabilitySelect.value) availabilitySelect.value = 'inmediata';
        }

        // Populate Country & City
        const countrySelect = document.getElementById('editCountry');
        const citySelect = document.getElementById('editCity');

        // Clear previous options
        countrySelect.innerHTML = '<option value="">Selecciona país</option>';

        // Get countries from reference data
        if (this.referenceData && this.referenceData.countries) {
            this.referenceData.countries.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                countrySelect.appendChild(opt);
            });
        }

        // Set current selection
        let currentCountry = this.currentUser.country;
        if (currentCountry) {
            // Try to find if the stored value matches an ID or Name
            const countryObj = this.referenceData && this.referenceData.countries.find(c => c.id == currentCountry || c.name === currentCountry);

            if (countryObj) {
                countrySelect.value = countryObj.id;
                // Trigger City Update
                this.updateCities('editCountry', 'editCity', this.currentUser.city);
            } else {
                // Fallback: manually add it if not in list
                const opt = document.createElement('option');
                opt.value = currentCountry;
                opt.textContent = currentCountry;
                countrySelect.appendChild(opt);
                countrySelect.value = currentCountry;

                // Also enable city and populate if exists
                if (this.currentUser.city) {
                    citySelect.innerHTML = `<option value="${this.currentUser.city}">${this.currentUser.city}</option>`;
                    citySelect.value = this.currentUser.city;
                    citySelect.disabled = false;
                }
            }
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    savePersonal() {
        const name = document.getElementById('editName').value;
        const position = document.getElementById('editPosition').value;
        const countrySelect = document.getElementById('editCountry');
        const country = countrySelect.value;
        // Store country name or ID? usually ID if available, but renderProfile expects ID or Name. 
        // Let's stick to what updateCities uses.


        const cityId = document.getElementById('editCity').value;
        const citySelect = document.getElementById('editCity');
        const cityName = citySelect.selectedIndex >= 0 ? citySelect.options[citySelect.selectedIndex].text : '';

        const salaryStr = document.getElementById('editSalary').value.replace(/\./g, '').replace(/,/g, '');
        const salary = parseInt(salaryStr) || 0;
        const currency = document.getElementById('editCurrency').value;
        const modality = document.getElementById('editModality').value;
        const availability = document.getElementById('editAvailability') ? document.getElementById('editAvailability').value : 'inmediata';

        const linkedinInput = document.getElementById('editLinkedin');
        const linkedin = linkedinInput ? linkedinInput.value : '';

        const bioInput = document.getElementById('editBio');
        const bio = bioInput ? bioInput.value : '';

        if (!name || !position || !country) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        this.currentUser = {
            ...this.currentUser,
            name,
            current_position: position,
            country,          // ID
            city: cityName,   // Name (for UI display)
            city_id: cityId,  // ID (for Payload)
            expected_salary: salary,
            currency,
            work_modality: modality,
            availability,
            linkedin,
            bio
        };

        // Sync with userProfile (mock)
        this.userProfile = { ...this.userProfile, ...this.currentUser };

        // Save to Supabase
        if (window.talentlyBackend && window.talentlyBackend.profiles && window.talentlyBackend.profiles.create) {

            // Clean Payload: Send city_id (UUID)
            const profilePayload = {
                full_name: name,
                professional_title: position,
                country_id: country, // UUID
                city_id: cityId,     // UUID
                expected_salary: salary,
                currency: currency.toLowerCase(), // Ensure lowercase as per onboarding
                work_modality: modality,
                availability: availability,
                linkedin: linkedin,
                bio: bio
            };

            // Attempt save
            window.talentlyBackend.profiles.create(profilePayload).then(({ error }) => {
                if (error) {
                    console.error("Supabase Save Error:", error);
                    this.showToast('Error al guardar en servidor', 'error');
                }
            });
        }



        this.renderProfile();
        this.closeEditPersonal();
        this.showToast('Perfil actualizado');
    },

    // Wrappers for HTML buttons
    addExperience() {
        this.openEditExperience();
    },

    addEducation() {
        this.openEditEducation();
    },

    // ============================================
    // EXPERIENCE MANAGEMENT
    // ============================================

    renderExperience() {
        // Use currentUser.experience if available, fallback to userProfile.experience (mock)
        // Ensure it's an array
        const expList = this.currentUser.experience || this.userProfile.experience || [];
        const container = document.getElementById('experienceList');

        if (!container) return;

        if (expList.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; padding: 10px 0;">No has agregado experiencia laboral.</div>';
            return;
        }

        container.innerHTML = expList.map((exp, index) => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 class="timeline-title">${exp.role}</h4>
                            <div class="timeline-subtitle">${exp.company}</div>
                            <div class="timeline-date">${exp.period}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="icon-btn" onclick="app.openEditExperience(${index})">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button class="icon-btn" onclick="app.removeExperience(${index})" style="color: var(--danger);">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openEditExperience(index = null) {
        const modal = document.getElementById('editExperienceModal');
        if (!modal) return;

        const title = document.getElementById('expModalTitle');
        const expIndex = document.getElementById('expIndex');
        const role = document.getElementById('expRole');
        const company = document.getElementById('expCompany');
        const start = document.getElementById('expStartDate');
        const end = document.getElementById('expEndDate');
        const current = document.getElementById('expCurrent');

        // Reset fields
        expIndex.value = '';
        role.value = '';
        company.value = '';
        start.value = '';
        end.value = '';
        current.checked = false;
        if (end) end.disabled = false;

        if (index !== null) {
            // Edit Mode
            const list = this.currentUser.experience || this.userProfile.experience || [];
            const item = list[index];
            if (item) {
                title.textContent = 'Editar Experiencia';
                expIndex.value = index;
                role.value = item.role;
                company.value = item.company;

                // Parse Period "YYYY - YYYY" or "MM/YYYY - Presente"
                // This is a simple parser, might need adjustment based on how data is stored
                // Assuming "Month YYYY - Month YYYY" or just free text. 
                // For simplicity in this demo, we might not auto-fill dates perfectly if they aren't stored structured.
                // We will try to rely on user re-entering if structure is complex.

                if (item.period && item.period.includes('Presente')) {
                    current.checked = true;
                    end.disabled = true;
                }
            }
        } else {
            // Add Mode
            title.textContent = 'Agregar Experiencia';
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditExperience() {
        const modal = document.getElementById('editExperienceModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    toggleExpEndDate() {
        const checkbox = document.getElementById('expCurrent');
        const endInput = document.getElementById('expEndDate');
        if (checkbox && endInput) {
            endInput.disabled = checkbox.checked;
            if (checkbox.checked) {
                endInput.value = '';
                endInput.style.backgroundColor = 'var(--bg-secondary)'; // Visual indication
                endInput.style.color = 'var(--text-disabled)';
            } else {
                endInput.style.backgroundColor = '';
                endInput.style.color = '';
            }
        }
    },

    saveExperience() {
        const indexStr = document.getElementById('expIndex').value;
        const role = document.getElementById('expRole').value;
        const company = document.getElementById('expCompany').value;
        const start = document.getElementById('expStartDate').value; // YYYY-MM
        const end = document.getElementById('expEndDate').value; // YYYY-MM
        const current = document.getElementById('expCurrent').checked;

        if (!role || !company || !start) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (!current && !end) {
            this.showToast('Indica fecha de fin o selecciona "Actualmente"', 'error');
            return;
        }

        const formatMonth = (val) => {
            if (!val) return '';
            const [y, m] = val.split('-');
            const date = new Date(y, m - 1);
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        };

        const period = `${formatMonth(start)} - ${current ? 'Presente' : formatMonth(end)}`;

        const newItem = {
            id: Date.now(),
            role,
            company,
            period,
            start_date: start,
            end_date: end,
            is_current: current,
            description: ''
        };

        if (!Array.isArray(this.currentUser.experience)) {
            this.currentUser.experience = [];
        }

        // Ensure we work with the main list
        const targetList = this.currentUser.experience;

        if (indexStr !== '') {
            // Update
            const idx = parseInt(indexStr);
            if (targetList[idx]) {
                targetList[idx] = { ...targetList[idx], ...newItem, id: targetList[idx].id };
            }
        } else {
            // Add
            targetList.push(newItem);
        }


        // Update Backend (Mock) - In real app, call Supabase here.
        // For now, we update local state and re-render.
        this.renderExperience();
        this.closeEditExperience();
        this.showToast('Experiencia guardada');

        // Persist to Supabase
        this.saveProfile();
    },

    removeExperience(index) {
        if (!confirm('¿Seguro que deseas eliminar esta experiencia?')) return;

        const list = this.currentUser.experience || this.userProfile.experience;
        if (list && list[index]) {
            list.splice(index, 1);
            this.renderExperience();
            this.showToast('Experiencia eliminada');
            // Persist to Supabase
            this.saveProfile();
        }
    },


    // ============================================
    // EDUCATION MANAGEMENT
    // ============================================

    renderEducation() {
        const eduList = (Array.isArray(this.currentUser.education) ? this.currentUser.education : [])
            || (Array.isArray(this.userProfile.education) ? this.userProfile.education : [])
            || [];
        const container = document.getElementById('educationList');

        if (!container) return;

        if (eduList.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; padding: 10px 0;">No has agregado educación.</div>';
            return;
        }

        container.innerHTML = eduList.map((edu, index) => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 class="timeline-title">${edu.degree}</h4>
                            <div class="timeline-subtitle">${edu.school}</div>
                            <div class="timeline-date">${edu.period}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="icon-btn" onclick="app.openEditEducation(${index})">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button class="icon-btn" onclick="app.removeEducation(${index})" style="color: var(--danger);">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openEditEducation(index = null) {
        const modal = document.getElementById('editEducationModal');
        if (!modal) return;

        const title = document.getElementById('eduModalTitle');
        const eduIndex = document.getElementById('eduIndex');
        const degree = document.getElementById('eduDegree');
        const school = document.getElementById('eduSchool');
        const start = document.getElementById('eduStartDate');
        const end = document.getElementById('eduEndDate');
        const current = document.getElementById('eduCurrent');

        // Reset
        eduIndex.value = '';
        degree.value = '';
        school.value = '';
        start.value = '';
        end.value = '';
        current.checked = false;
        if (end) end.disabled = false;

        if (index !== null) {
            const list = this.currentUser.education || this.userProfile.education || [];
            const item = list[index];
            if (item) {
                title.textContent = 'Editar Educación';
                eduIndex.value = index;
                degree.value = item.degree;
                school.value = item.school;

                if (item.period && item.period.includes('Presente')) {
                    current.checked = true;
                    end.disabled = true;
                }
            }
        } else {
            title.textContent = 'Agregar Educación';
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditEducation() {
        const modal = document.getElementById('editEducationModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    toggleEduEndDate() {
        const checkbox = document.getElementById('eduCurrent');
        const endInput = document.getElementById('eduEndDate');
        if (checkbox && endInput) {
            endInput.disabled = checkbox.checked;
            if (checkbox.checked) {
                endInput.value = '';
                endInput.style.backgroundColor = 'var(--bg-secondary)';
                endInput.style.color = 'var(--text-disabled)';
            } else {
                endInput.style.backgroundColor = '';
                endInput.style.color = '';
            }
        }
    },

    saveEducation() {
        const indexStr = document.getElementById('eduIndex').value;
        const degree = document.getElementById('eduDegree').value;
        const school = document.getElementById('eduSchool').value;
        const start = document.getElementById('eduStartDate').value;
        const end = document.getElementById('eduEndDate').value;
        const current = document.getElementById('eduCurrent').checked;

        if (!degree || !school || !start) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (!current && !end) {
            this.showToast('Indica fecha de fin o selecciona "Cursando actualmente"', 'error');
            return;
        }

        const formatMonth = (val) => {
            if (!val) return '';
            const [y, m] = val.split('-');
            const date = new Date(y, m - 1);
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        };

        const period = `${formatMonth(start)} - ${current ? 'Presente' : formatMonth(end)}`;

        const newItem = {
            id: Date.now(),
            degree,
            school,
            period,
            start_date: start,
            end_date: end,
            is_current: current
        };

        if (!Array.isArray(this.currentUser.education)) {
            this.currentUser.education = [];
        }

        const targetList = this.currentUser.education;

        if (indexStr !== '') {
            const idx = parseInt(indexStr);
            if (targetList[idx]) {
                targetList[idx] = { ...targetList[idx], ...newItem, id: targetList[idx].id };
            }
        } else {
            targetList.push(newItem);
        }

        this.renderEducation();
        this.closeEditEducation();
        this.showToast('Educación guardada');

        // Persist to Supabase
        this.saveProfile();
    },

    removeEducation(index) {
        if (!confirm('¿Seguro que deseas eliminar esta educación?')) return;

        const list = this.currentUser.education || this.userProfile.education;
        if (list && list[index]) {
            list.splice(index, 1);
            this.renderEducation();
            this.showToast('Educación eliminada');
            // Persist to Supabase
            this.saveProfile();
        }
    },

    // ============================================
    // SKILLS MANAGEMENT
    // ============================================

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // Copy current skills to temp array
        this.skillsSelected = [...(this.currentUser.skills || [])];

        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();

        // Populate areas dropdown if empty
        this.populateProfessionalAreas();

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    async populateProfessionalAreas() {
        const areaSelect = document.getElementById('editSkillsArea');
        if (!areaSelect || areaSelect.options.length > 1) return; // Already populated or missing

        try {
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const { data: areas, error } = await window.talentlyBackend.reference.getAreas();
                if (areas && areas.length > 0) {
                    // Clear existing options except first
                    areaSelect.innerHTML = '<option value="">Selecciona un área</option>';

                    areas.forEach(area => {
                        const option = document.createElement('option');
                        option.value = area.slug; // Use slug for API calls
                        option.textContent = area.name;
                        areaSelect.appendChild(option);
                    });
                }
            } else {
                // Fallback areas if backend not ready
                const fallbackAreas = [
                    { slug: 'desarrollo', name: 'Desarrollo de Software' },
                    { slug: 'diseno-ux', name: 'Diseño UX/UI' },
                    { slug: 'producto', name: 'Gestión de Producto' },
                    { slug: 'marketing', name: 'Marketing Digital' },
                    { slug: 'data', name: 'Data Science & Analytics' },
                    { slug: 'ventas', name: 'Ventas' },
                    { slug: 'rrhh', name: 'Recursos Humanos' },
                    { slug: 'finanzas', name: 'Finanzas' },
                ];

                areaSelect.innerHTML = '<option value="">Selecciona un área</option>';
                fallbackAreas.forEach(area => {
                    const option = document.createElement('option');
                    option.value = area.slug;
                    option.textContent = area.name;
                    areaSelect.appendChild(option);
                });
            }
        } catch (e) {
            console.error('Error populating areas:', e);
        }
    },

    closeEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    renderSelectedSkillsChips() {
        const container = document.getElementById('editSkillsSelected');
        if (!container) return;

        container.innerHTML = this.skillsSelected.map(skill => `
            <span class="skill-badge" style="background: var(--primary); color: white; border: none; padding-right: 8px; display: inline-flex; align-items: center;">
                ${skill}
                <button onclick="app.toggleSkill('${skill}')" style="background:none; border:none; color:white; margin-left:6px; cursor:pointer; font-weight:bold; font-size: 16px; line-height: 1;">&times;</button>
            </span>
        `).join('');
    },

    async renderEditSkillsBubbles() {
        const areaSelect = document.getElementById('editSkillsArea');
        const areaSlug = areaSelect ? areaSelect.value : '';
        const container = document.getElementById('editSkillsBubbles');
        if (!container) return;

        if (!areaSlug) {
            container.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">Selecciona una área para ver habilidades.</div>';
            return;
        }

        container.innerHTML = '<div style="padding: 10px;">Cargando habilidades...</div>';

        let availableSkills = [];

        // Validar si window.talentlyBackend existe y está listo
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.reference.getSkills(areaSlug);
                if (data) {
                    // Map object list to string array if necessary, or use objects. 
                    // The current implementation uses strings for selections.
                    availableSkills = data.map(s => s.name);
                }
            } catch (err) {
                console.error("Error fetching skills:", err);
            }
        }

        // Fallback if no backend or empty result
        if (availableSkills.length === 0) {
            const fallbackSkills = {
                'desarrollo': ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'Git', 'AWS', 'Docker'],
                'diseno-ux': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'UI Design'],
                'producto': ['Agile', 'Scrum', 'Product Management', 'Roadmapping', 'Jira', 'User Stories'],
                'marketing': ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Google Analytics', 'Email Marketing'],
                'data': ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Big Data'],
                'ventas': ['CRM', 'Negociación', 'Prospección', 'Cierre de ventas', 'Salesforce'],
                'rrhh': ['Reclutamiento', 'Selección', 'Clima Laboral', 'Entrevistas', 'Onboarding'],
                'finanzas': ['Excel', 'Contabilidad', 'Análisis Financiero', 'Presupuesto', 'Auditoría'],
                'other': ['Inglés', 'Comunicación', 'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas']
            };
            availableSkills = fallbackSkills[areaSlug] || [];
        }

        if (availableSkills.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">No hay habilidades disponibles para esta área.</div>';
            return;
        }

        container.innerHTML = availableSkills.map(skill => {
            const isSelected = this.skillsSelected.includes(skill);
            return `
                <button class="skill-bubble ${isSelected ? 'selected' : ''}" 
                    style="${isSelected ? 'background: var(--primary); color: white;' : 'background: var(--bg); color: var(--text-primary); border: 1px solid var(--border);'} padding: 8px 16px; border-radius: 20px; cursor: pointer; margin: 4px;"
                    onclick="app.toggleSkill('${skill}')">
                    ${skill}
                </button>
            `;
        }).join('');
    },

    toggleSkill(skill) {
        if (this.skillsSelected.includes(skill)) {
            this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
        } else {
            if (this.skillsSelected.length >= 10) {
                this.showToast('Máximo 10 habilidades', 'error');
                return;
            }
            this.skillsSelected.push(skill);
        }
        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();
    },

    async saveEditSkills() {
        this.currentUser.skills = [...this.skillsSelected];
        // Sync with mock
        this.userProfile.skills = this.currentUser.skills;

        // Attempt backend save
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                // NOTE: Profiles create/upsert requires the full object or it mimics a patch if designed so.
                // Based on supabase-client.js, it creates a payload with ...profileData.
                // If we send only skills, it might overwrite other fields if not careful, 
                // OR if supabase Upsert works as "Patch" for existing IDs (it usually replaces).
                // SAFE APPROACH: Since we don't have a specific PATCH method exposed in the wrapper,
                // we will update the local 'currentUser' object fully and then send it... 
                // BUT simpler is to assume we just want to save skills.
                // If the wrapper does an 'upsert' on just {skills: ...}, the other columns might become null 
                // if it's a replace-upsert. Standard Supabase upsert updates match columns and replaces others.
                // WE SHOULD FETCH FIRST or better, assume the wrapper should handle this.
                // FOR NOW, we just update local and try to send {skills} knowing it might be risky
                // if the wrapper doesn't handle partials. 
                // IMPROVEMENT: Let's fetch the full profile first? No, we have this.currentUser.
                // Let's rely on profiles.create acting as an upsert/update.

                // To be safe against data loss, we'll strip known 'view-only' fields if any, 
                // but for now let's just send the skills update combined with what we have locally?
                // Actually, let's keep it simple: just update local state which drives the UI.
                // And do a "best effort" persist.

                // Construct a CLEAN payload that matches the 'profiles' table schema.
                // We must map local property names to DB column names.
                const profilePayload = {
                    // Map local 'name' -> DB 'name'
                    name: this.currentUser.name,

                    // Map local 'current_position' -> DB 'current_position'
                    current_position: this.currentUser.current_position || this.currentUser.professional_title,

                    // Location (DB uses 'country' and 'city')
                    country: this.currentUser.country,
                    city: this.currentUser.city_id,

                    // Other fields
                    expected_salary: this.currentUser.expected_salary || this.currentUser.salary,
                    currency: this.currentUser.currency,
                    work_modality: this.currentUser.work_modality,
                    availability: this.currentUser.availability,
                    bio: this.currentUser.bio,

                    // Send skills - Schema has 'skills' column
                    skills: this.currentUser.skills
                };

                // Remove undefined/null keys to avoid sending bad data
                Object.keys(profilePayload).forEach(key =>
                    profilePayload[key] === undefined && delete profilePayload[key]
                );

                await window.talentlyBackend.profiles.create(profilePayload);

            } catch (e) {
                console.error('Error saving skills to backend:', e);
            }
        }

        this.renderProfile();
        this.closeEditSkills();
        this.showToast('Habilidades actualizadas');
    },

    async logout() {
        this.isAuthenticated = false;

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            await window.talentlyBackend.auth.signOut();
        }

        localStorage.removeItem('talently_logged_in');
        localStorage.removeItem('talently_user_type');
        localStorage.removeItem('talently_current_user');

        // Force fully clear potentially sticky Supabase session from localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) localStorage.removeItem(key);
        });

        window.location.reload();
    },
    async renderCard() {
        const cardStack = document.getElementById('cardStack');

        let displayProfiles = [];

        // 1. Fetch Real Profiles from DB
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const { data, error } = await window.talentlyBackend.profiles.getDiscovery('candidate'); // Fetches 'company' type
            if (data && data.length > 0) {
                displayProfiles = data.map(p => ({
                    ...p,
                    // Map DB fields to UI expected fields
                    title: p.role || p.industry || 'Empresa',
                    tags: p.benefits || (p.industry ? [p.industry] : []),
                    salary: p.salary_range || 'Salario no visible',
                    modality: p.location || 'Remoto'
                }));
            }
        }

        if (displayProfiles.length === 0) {
            // FALLBACK TO MOCK
            displayProfiles = [...this.profiles];
        }

        // Combine with local company offers if any
        if (this.companyOffers && this.companyOffers.length > 0) {
            const realOffers = this.companyOffers.map(offer => ({
                id: offer.id,
                name: 'Tu Empresa (Demo)',
                title: offer.title,
                image: 'https://ui-avatars.com/api/?name=Talently+Business&background=6c5ce7&color=fff&size=400',
                tags: offer.skills ? offer.skills.split(',').slice(0, 3) : ['Hiring'],
                location: 'Remoto',
                salary: offer.salary,
                modality: offer.modality
            }));
            displayProfiles = [...realOffers, ...displayProfiles];
        }

        // Index Check
        if (this.currentIndex >= displayProfiles.length) {
            cardStack.innerHTML = `
                <div class="empty-state">
                    <h3>¡Has revisado todos los perfiles!</h3>
                    <p>Vuelve más tarde para ver nuevas oportunidades</p>
                </div>
            `;
            const bu = document.querySelector('.action-buttons');
            if (bu) bu.style.display = 'none';
            return;
        }
        const bu = document.querySelector('.action-buttons');
        if (bu) bu.style.display = 'flex';

        const profile = displayProfiles[this.currentIndex];

        // Store DATA for logic
        this.currentProfileData = profile;

        cardStack.innerHTML = `
            <div class="profile-card" id="currentCard">
                <img src="${profile.image || 'https://via.placeholder.com/400'}" alt="${profile.name}" class="profile-image">
                <button class="view-details-btn" onclick="event.stopPropagation(); app.openCompanyModal('${profile.id}')">
                    Ver más detalles
                </button>
                <div class="profile-overlay">
                    <h2 class="profile-name">${profile.name}</h2>
                    <div class="profile-title">${profile.title}</div>
                </div>
                <div class="profile-content">
                    <div class="profile-tags">
                        ${profile.tags ? profile.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="info-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        <span>${profile.location || 'Remoto'}</span>
                    </div>
                    <div class="info-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>${profile.salary || 'A convenir'}</span>
                    </div>
                </div>
            </div>
        `;

        // Store DOM ELEMENT for animation
        this.currentProfileCard = document.getElementById('currentCard');

        // Restore Event Listeners for Swipe
        this.setupSwipeGestures();
    },

    async openChat(matchId, matchName) {
        console.log('Opening chat for:', matchId);
        this.currentMatchId = String(matchId); // FORCE STRING ID for consistency

        // FIX: Add chat-mode class to body to hide bottom nav
        document.body.classList.add('chat-mode');

        // 1. Find Match Data
        let matchIndex = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
        let match = matchIndex !== -1 ? this.matches[matchIndex] : null;

        // FIX: Look up fresh data from mockProfiles but ONLY if it's a mock profile ID (1-100)
        // This prevents overwriting custom test matches or real matches logic
        const isMockId = matchId && !String(matchId).includes('-') && Number(matchId) <= 100;

        // FIX: Generic find for ANY mock profile to avoid "Startup Lab" errors
        const freshProfile = (isMockId && window.mockProfiles) ? window.mockProfiles.find(p => String(p.id) === String(matchId)) : null;

        if (freshProfile && match) {
            match = { ...match, ...freshProfile };
            if (matchIndex !== -1) this.matches[matchIndex] = match;
        } else if (freshProfile && !match) {
            // If we have profile data but no match record (edge case), create a temp one
            match = { ...freshProfile };
        }

        // --- FIX: CLEAR UNREAD STATUS ---
        if (match && match.hasUnread) {
            match.hasUnread = false;
            if (matchIndex !== -1) this.matches[matchIndex] = match;
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.updateBadge();
        }
        // --------------------------------

        const name = match ? (match.name || match.company_name) : (matchName || 'Usuario');
        console.log('Chat Name to Set:', name);

        // 2. Update Header UI
        const candidateHeader = document.querySelector('.chat-company-name');
        if (candidateHeader) candidateHeader.textContent = name;

        const companyHeader = document.querySelector('#companyChatName');
        if (companyHeader) companyHeader.textContent = name;

        // Update Roles
        const roleText = (match && match.title) ? match.title : '';
        const candidateRole = document.querySelector('.chat-company-role');
        if (candidateRole) candidateRole.textContent = roleText;

        // Update Avatars
        const avatarSrc = (match && (match.logo || match.image || match.avatar))
            ? (match.logo || match.image || match.avatar)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        const candidateAvatar = document.querySelector('.chat-avatar');
        if (candidateAvatar) candidateAvatar.src = avatarSrc;

        const companyAvatar = document.querySelector('#companyChatAvatar');
        if (companyAvatar) companyAvatar.src = avatarSrc;

        // 3. Show View
        if (document.getElementById('chatSection')) {
            this.showAppSection('chatSection');
        } else if (document.getElementById('messagesChatView')) {
            this.showCompanySection('messagesChatView');
        }

        // 4. Load Messages
        const messagesContainer = document.getElementById('chatMessages') || document.getElementById('companyChatMessages');
        if (messagesContainer) messagesContainer.innerHTML = '';

        const isRealMatch = typeof matchId === 'string' && matchId.includes('-');

        if (isRealMatch && window.talentlyBackend && window.talentlyBackend.isReady) {
            // Real Backend Logic...
            if (this.chatSubscription) {
                this.chatSubscription.unsubscribe();
                this.chatSubscription = null;
            }
            try {
                // Fetch previous messages... 
                const { data: msgs } = await window.talentlyBackend.matches.getMessages(matchId);
                if (msgs) {
                    msgs.forEach(m => this.appendMessageToUI(m.content, m.sender_id === this.userProfile.id ? 'sent' : 'received'));
                }
                // Subscribe...
                this.chatSubscription = window.talentlyBackend.matches.subscribe(matchId, async (newMsg) => {
                    const { data: { user } } = await window.supabaseClient.auth.getUser();
                    if (user) {
                        const isMe = newMsg.sender_id === user.id;
                        if (!isMe) {
                            this.appendMessageToUI(newMsg.content, 'received');
                        }
                    }
                });
            } catch (err) {
                console.error('Chat load error:', err);
                if (messagesContainer) messagesContainer.innerHTML = '<div style="text-align:center; padding:20px; color: var(--danger);">Error al cargar mensajes.</div>';
            }
        } else {
            // 5. Local Persistence Logic
            if (!this.localMessages) {
                try {
                    this.localMessages = JSON.parse(localStorage.getItem('talently_local_messages')) || {};
                } catch (e) {
                    this.localMessages = {};
                }
            }

            // FIX: Ensure consistency using String ID
            const safeId = String(matchId);
            console.log('LOADING LOCAL MSGS for:', safeId);
            const localMsgs = this.localMessages[safeId] || [];

            if (localMsgs.length > 0) {
                // Render persisted messages
                localMsgs.forEach(msg => {
                    this.appendMessageToUI(msg.content, msg.type);
                });
            } else {
                // First time welcome
                const welcomeMsg = match && match.lastMessage ? match.lastMessage : "¡Hola! Gracias por conectar.";

                setTimeout(() => {
                    this.appendMessageToUI(welcomeMsg, 'received');
                    this.saveLocalMessage(safeId, welcomeMsg, 'received');

                    setTimeout(() => {
                        const followUp = "Me interesa mucho tu perfil. ¿Podemos agendar una llamada?";
                        this.appendMessageToUI(followUp, 'received');
                        this.saveLocalMessage(safeId, followUp, 'received');
                    }, 1000);
                }, 300);
            }
        }
    },

    saveLocalMessage(matchId, content, type) {
        console.log('SAVING MSG:', matchId, content);
        if (!this.localMessages) this.localMessages = {};
        if (!this.localMessages[matchId]) this.localMessages[matchId] = [];

        this.localMessages[matchId].push({
            content,
            type,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('talently_local_messages', JSON.stringify(this.localMessages));
        console.log('SAVED TO STORAGE:', this.localMessages);
    },

    async sendMessageWithReceipts() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        // Add to UI immediately
        this.appendMessageToUI(text, 'sent');

        // FIX: Ensure ID is string
        const matchId = String(this.currentMatchId);
        const isRealMatch = matchId.includes('-');

        if (isRealMatch && window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                await window.talentlyBackend.matches.sendMessage(matchId, user.id, text);
                // Track statistics
                window.talentlyBackend.statistics.increment('messages_sent').catch(e => console.warn('Stats error:', e));
            } catch (err) {
                console.error('Send error:', err);
                this.appendMessageToUI('Error al enviar', 'error');
            }
        } else {
            // Local Persistence
            this.saveLocalMessage(matchId, text, 'sent');

            // Update match last message preview
            const matchIndex = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
            if (matchIndex !== -1) {
                const match = this.matches[matchIndex];
                match.lastMessage = text;
                match.timestamp = new Date().toISOString();

                // --- FIX: SAVE TO STORAGE ---
                // Save the updated matches array to localStorage so the list view updates
                localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            }
        }
    },

    setupSwipeGestures() {
        const card = document.getElementById('currentCard');
        if (!card) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 100;

        // Touch Events
        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            card.style.transition = 'none';
        });

        card.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
        });

        card.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            card.style.transition = 'transform 0.3s ease';

            const diff = currentX - startX;
            if (diff > threshold) {
                this.swipeRight();
            } else if (diff < -threshold) {
                this.swipeLeft();
            } else {
                card.style.transform = 'translateX(0) rotate(0)';
            }
        });

        // Mouse Events (for desktop testing)
        card.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            card.style.transition = 'none';
            card.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            const cardEl = document.getElementById('currentCard');
            if (cardEl) cardEl.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const cardEl = document.getElementById('currentCard');
            if (cardEl) {
                cardEl.style.transition = 'transform 0.3s ease';
                cardEl.style.cursor = 'grab';

                const diff = e.clientX - startX;
                if (diff > threshold) {
                    this.swipeRight();
                } else if (diff < -threshold) {
                    this.swipeLeft();
                } else {
                    cardEl.style.transform = 'translateX(0) rotate(0)';
                }
            }
        });
    },

    // ... setupSwipeGestures (unchanged) ...

    swipeLeft() {
        this.animateSwipe('left');
    },

    async swipeRight() {
        // Use the profile stored during render
        // FIX: Use currentProfileData which has the actual object, NOT the DOM element
        const profile = this.currentProfileData || this.profiles[this.currentIndex];

        if (profile) {
            // Check if REAL profile (UUID)
            const isReal = typeof profile.id === 'string' && profile.id.includes('-');

            if (isReal && window.talentlyBackend && window.talentlyBackend.isReady) {
                try {
                    await window.talentlyBackend.matches.create(profile.id);
                    this.showToast('¡Match Guardado!');
                    // Track statistics
                    window.talentlyBackend.statistics.increment('matches_count').catch(e => console.warn('Stats error:', e));
                    window.talentlyBackend.statistics.increment('swipes_given').catch(e => console.warn('Stats error:', e));
                } catch (e) {
                    console.error('Match Error', e);
                    // Continue anyway
                }
            } else {
                this.addMatch(profile); // Local Fallback
            }
        }
        this.animateSwipe('right');
    },

    addMatch(profile) {
        // Prevent duplicates
        if (!this.matches.find(m => m.id === profile.id)) {
            const match = {
                ...profile,
                matchDate: new Date().toISOString(),
                hasUnread: true,
                lastMessage: "¡Nuevo Match! Saluda ahora."
            };
            this.matches.unshift(match);
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.showToast('¡Es un Match!');
            this.updateBadge();
        }
    },

    async renderMatches() {
        const grid = document.querySelector('.matches-grid');
        const conversastionList = document.getElementById('conversationsList');

        // PREPARATION: Get current user ID to know who the "other" person is
        let myId = null;
        if (window.supabaseClient) {
            const { data } = await window.supabaseClient.auth.getUser();
            if (data && data.user) myId = data.user.id;
        }

        // 1. Local Matches (Mocks or temporary)
        // Ensure we preserve the structure of local matches
        let finalMatches = (this.matches || []).map(m => ({
            ...m,
            // Ensure local matches have these fields for consistency
            otherUserId: m.otherUserId || null,
            isReal: !!m.isReal,
            lastMessage: m.lastMessage || ''
        }));

        // 2. Fetch Real Matches from Backend
        if (window.talentlyBackend && window.talentlyBackend.isReady && myId) {
            const { data, error } = await window.talentlyBackend.matches.get();
            if (data && data.length > 0) {
                // Enrich matches with Profile Data
                const realMatches = await Promise.all(data.map(async (m) => {
                    const otherUserId = m.user_id_1 === myId ? m.user_id_2 : m.user_id_1;

                    // Fetch Profile of the other user
                    let otherProfile = null;
                    try {
                        const { data: profileData } = await window.talentlyBackend.profiles.getById(otherUserId);
                        otherProfile = profileData;
                    } catch (e) {
                        // ignore error
                    }

                    // Default Name/Image if profile missing (e.g. deleted user)
                    const name = otherProfile ? (otherProfile.name || otherProfile.company_name) : 'Usuario';
                    const image = otherProfile ? (otherProfile.image || otherProfile.avatar) : null;

                    // Fetch Last Message
                    let lastMsg = '';
                    try {
                        // FIX: Only fetch messages if ID is valid UUID
                        if (typeof m.id === 'string' && m.id.includes('-')) {
                            const { data: msgs } = await window.talentlyBackend.matches.getMessages(m.id);
                            if (msgs && msgs.length > 0) {
                                const last = msgs[msgs.length - 1];
                                lastMsg = last.content;
                            }
                        }
                    } catch (e) { }

                    return {
                        id: m.id,
                        name: name || 'Usuario',
                        image: image,
                        lastMessage: lastMsg,
                        otherUserId: otherUserId,
                        isReal: true
                    };
                }));

                // Merge: Add real matches to final list
                // To avoid duplicates, we can check if a match with same 'otherUserId' or 'id' exists.
                realMatches.forEach(rm => {
                    const exists = finalMatches.find(fm => fm.id === rm.id); // Check by ID
                    if (!exists) {
                        finalMatches.push(rm);
                    }
                });
            }
        }

        // Remove duplicates by ID just in case
        const seen = new Set();
        finalMatches = finalMatches.filter(m => {
            if (!m.id) return false; // Skip invalid matches without ID
            const duplicate = seen.has(m.id);
            seen.add(m.id);
            return !duplicate;
        });

        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        // Render Grid (Matches View)
        if (grid) {
            if (finalMatches.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px;">No tienes matches aún</div>';
            } else {
                grid.innerHTML = finalMatches.map(match => {
                    const safeName = escapeHtml(match.name || 'Usuario');
                    const safeId = escapeHtml(String(match.id));
                    const imgUrl = match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`;

                    return `
                    <div class="match-card-container" onclick="app.openChat('${safeId}', '${safeName}')">
                        <div class="match-card">
                            <img src="${imgUrl}" alt="${safeName}">
                            <div class="online-indicator"></div>
                            <div class="match-card-overlay">
                                <div class="match-name">${safeName}</div>
                            </div>
                        </div>
                    </div>
                `}).join('');
            }
        }

        // Render Conversation List (Messages View)
        if (conversastionList) {
            if (finalMatches.length === 0) {
                conversastionList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 14px;">No tienes mensajes aún</div>';
            } else {
                conversastionList.innerHTML = finalMatches.map(match => {
                    const safeName = escapeHtml(match.name || 'Usuario');
                    const safeId = escapeHtml(String(match.id));
                    const imgUrl = match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`;

                    return `
                    <div class="conversation-item" onclick="app.openChat('${safeId}', '${safeName}')">
                        <div style="position: relative;">
                            <img src="${imgUrl}" class="conversation-avatar">
                            <div class="online-indicator"></div>
                        </div>
                        <div class="conversation-content">
                            <div class="conversation-header">
                                <span class="conversation-name">${safeName}</span>
                                <span class="conversation-time">Ahora</span>
                            </div>
                            <p class="conversation-message">${match.lastMessage || '¡Es un Match! Saluda ahora.'}</p>
                        </div>
                        ${match.hasUnread ? '<span class="unread-badge">1</span>' : ''}
                    </div>
                `}).join('');
            }
        }
    },

    renderProfile() {
        // Use Real User Data if available, otherwise fallback to mock
        const profileData = this.currentUser || {};

        // 1. Update Header Info
        const profileHero = document.querySelector('.profile-hero');
        if (profileHero) {
            // Update Name
            const nameEl = profileHero.querySelector('h2');
            if (nameEl) nameEl.textContent = profileData.name || 'Usuario';

            // Update Position
            const titleEl = profileHero.querySelector('p');
            if (titleEl) titleEl.textContent = profileData.current_position || 'Sin cargo definido';
        }

        // Update Avatar (Target correct classes in HTML)
        // HTML uses .profile-avatar-large in Settings, .preview-image in Preview Modal
        // Also support .profile-image-large just in case
        if (profileData.image || profileData.avatar_url) {
            const imgSrc = profileData.image || profileData.avatar_url;
            document.querySelectorAll('.profile-avatar-large, .profile-image-large, .preview-image').forEach(el => el.src = imgSrc);
        } else {
            document.querySelectorAll('.profile-avatar-large, .profile-image-large, .preview-image').forEach(el => el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random`);
        }

        // 2. Update Personal Information List
        // Helper to find row by label text
        const updateInfoRow = (label, value) => {
            const rows = document.querySelectorAll('.profile-info-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.profile-info-label');
                if (labelEl && labelEl.textContent.includes(label)) {
                    const valueEl = row.querySelector('.profile-info-value');
                    if (valueEl) valueEl.textContent = value;
                    break;
                }
            }
        };

        // Prepare Location
        let locationString = '';
        let countryDisplay = profileData.country || '';
        // Try to resolve Country ID to Name
        if (this.referenceData && this.referenceData.countries) {
            const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
            if (countryObj) countryDisplay = countryObj.name;
        }
        if (profileData.city) {
            locationString = `${profileData.city}, ${countryDisplay}`;
        } else {
            locationString = countryDisplay || 'No especificada';
        }

        updateInfoRow('Ubicación', locationString);
        if (profileData.birth_date) updateInfoRow('Fecha de nacimiento', profileData.birth_date);
        if (profileData.email) updateInfoRow('Email', profileData.email);
        updateInfoRow('Disponibilidad', profileData.availability || 'No especificada');
        updateInfoRow('Modalidad', profileData.work_modality || 'No especificada');

        if (profileData.expected_salary) {
            const formatted = new Intl.NumberFormat('es-CL').format(profileData.expected_salary);
            updateInfoRow('Pretensión salarial', `$${formatted} ${profileData.currency || 'CLP'}`);
        } else {
            updateInfoRow('Pretensión salarial', 'No especificada');
        }

        // 3. Update Skills
        const skillsContainer = document.querySelector('.skills-display');
        if (skillsContainer) {
            const skills = profileData.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">Sin habilidades registradas</span>';
            }
        }

        // 4. Update About Me / Bio
        // Check for .about-text or similar. If not in HTML, this might need an HTML update later.
        const aboutMeEl = document.querySelector('.about-text');
        if (aboutMeEl) {
            aboutMeEl.textContent = profileData.bio || 'Sin descripción.';
        }

        // Render Experience
        const expList = document.getElementById('experienceList');
        if (expList) {
            let experience = profileData.experience || [];
            if (typeof experience === 'string') {
                try { experience = JSON.parse(experience); } catch (e) { experience = []; }
            }
            if (!Array.isArray(experience)) experience = [];

            if (experience.length === 0) {
                expList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin experiencia registrada</div>';
            } else {
                expList.innerHTML = experience.map(exp => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${exp.role}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${exp.company} • ${exp.period}</div>
                        </div>
                        <button onclick="app.removeExperience(${exp.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }

        // Render Education
        const eduList = document.getElementById('educationList');
        if (eduList) {
            let education = profileData.education || [];
            if (typeof education === 'string') {
                try { education = JSON.parse(education); } catch (e) { education = []; }
            }
            if (!Array.isArray(education)) education = [];

            if (education.length === 0) {
                eduList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin educación registrada</div>';
            } else {
                eduList.innerHTML = education.map(edu => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${edu.degree}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${edu.school} • ${edu.period}</div>
                        </div>
                        <button onclick="app.removeEducation(${edu.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }
    },

    addExperience() {
        const role = prompt('Cargo:');
        if (!role) return;
        const company = prompt('Empresa:');
        if (!company) return;
        const period = prompt('Periodo (ej. 2021 - 2023):');

        if (!this.currentUser.experience) this.currentUser.experience = [];
        this.currentUser.experience.push({
            id: Date.now(),
            role,
            company,
            period: period || 'Actualidad'
        });
        this.saveProfile();
        this.renderProfile();
    },

    animateSwipe(direction) {
        const card = this.currentProfileCard;
        if (!card) return;

        // Visual animation
        card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        if (direction === 'left') {
            card.style.transform = 'translateX(-150%) rotate(-30deg)';
        } else {
            card.style.transform = 'translateX(150%) rotate(30deg)';
        }
        card.style.opacity = '0';

        // Wait for animation then remove
        setTimeout(() => {
            if (card.parentNode) card.parentNode.removeChild(card);
            this.currentProfileCard = null;
            this.currentIndex++;
            this.renderCard(); // Show next
        }, 300);
    },

    // Skills Edit State
    activeEditSkills: [],

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // Initialize state
        this.activeEditSkills = [...(this.currentUser.skills || [])];

        this.renderEditSkillsSelected();
        this.renderEditSkillsBubbles();

        modal.classList.add('active');
    },

    closeEditSkills() {
        document.getElementById('editSkillsModal').classList.remove('active');
    },

    saveEditSkills() {
        this.currentUser.skills = [...this.activeEditSkills];
        this.saveProfile();
        this.renderProfile();
        this.closeEditSkills();
    },

    renderEditSkillsSelected() {
        const container = document.getElementById('editSkillsSelected');
        if (!container) return;

        container.innerHTML = '';
        this.activeEditSkills.forEach((skill, index) => {
            const chip = document.createElement('div');
            chip.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 13px; display: flex; align-items: center; gap: 6px;';
            chip.innerHTML = `
                ${skill}
                <span onclick="app.removeEditSkill(${index})" style="cursor: pointer; font-weight: bold;">×</span>
            `;
            container.appendChild(chip);
        });
    },

    async renderEditSkillsBubbles() {
        const areaSelect = document.getElementById('editSkillsArea');
        const areaSlug = areaSelect ? areaSelect.value : 'desarrollo';
        const container = document.getElementById('editSkillsBubbles');

        if (!container) return;

        container.innerHTML = '<div class="loader-spinner"></div>';

        try {
            const result = await window.talentlyBackend.reference.getSkills(areaSlug);
            const skills = result.data || [];

            container.innerHTML = '';

            if (skills.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary);">No se encontraron habilidades.</p>';
                return;
            }

            // Filter out already selected
            const available = skills.filter(s => !this.activeEditSkills.includes(s.name));

            if (available.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary);">Ya has seleccionado todas las habilidades de esta área.</p>';
                return;
            }

            available.forEach(skill => {
                const btn = document.createElement('button');
                btn.textContent = skill.name;
                btn.type = 'button';
                btn.className = 'btn-chip'; // Reuse class if exists, or style inline
                btn.style.cssText = 'margin: 4px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: 13px; transition: all 0.2s;';

                btn.onmouseover = () => { btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
                btn.onmouseout = () => { btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text-primary)'; };

                btn.onclick = () => this.addEditSkill(skill.name);
                container.appendChild(btn);
            });

        } catch (e) {
            console.error('Error loading skills for edit:', e);
            container.innerHTML = '<p style="color: var(--danger);">Error al cargar.</p>';
        }
    },

    addEditSkill(skill) {
        if (this.activeEditSkills.length >= 10) {
            this.showToast('Máximo 10 habilidades');
            return;
        }
        if (!this.activeEditSkills.includes(skill)) {
            this.activeEditSkills.push(skill);
            this.renderEditSkillsSelected();
            this.renderEditSkillsBubbles();
        }
    },

    removeEditSkill(index) {
        this.activeEditSkills.splice(index, 1);
        this.renderEditSkillsSelected();
        this.renderEditSkillsBubbles();
    },

    // Legacy function support
    editSkills() {
        this.openEditSkills();
    },

    // ================= EXPERIENCE MODAL =================
    openEditExperience(index = null) {
        const modal = document.getElementById('editExperienceModal');
        if (!modal) return;

        const roleInput = document.getElementById('expRole');
        const companyInput = document.getElementById('expCompany');
        const startInput = document.getElementById('expStartDate');
        const endInput = document.getElementById('expEndDate');
        const currentInput = document.getElementById('expCurrent');
        const indexInput = document.getElementById('expIndex');
        const title = document.getElementById('expModalTitle');

        // Reset
        roleInput.value = '';
        companyInput.value = '';
        startInput.value = '';
        endInput.value = '';
        currentInput.checked = false;
        endInput.disabled = false;
        indexInput.value = '';

        if (index !== null && this.currentUser.experience && this.currentUser.experience[index]) {
            // Edit Mode
            const item = this.currentUser.experience[index];
            roleInput.value = item.role || '';
            companyInput.value = item.company || '';
            indexInput.value = index;
            title.textContent = 'Editar Experiencia';

            if (item.startDate) startInput.value = item.startDate;
            if (item.endDate) endInput.value = item.endDate;
            if (item.isCurrent) {
                currentInput.checked = true;
                endInput.value = '';
                endInput.disabled = true;
            }
        } else {
            // Add Mode
            title.textContent = 'Agregar Experiencia';
        }

        modal.classList.add('active');
    },

    closeEditExperience() {
        const modal = document.getElementById('editExperienceModal');
        if (modal) modal.classList.remove('active');
    },

    toggleExpEndDate() {
        const isCurrent = document.getElementById('expCurrent').checked;
        const endInput = document.getElementById('expEndDate');
        endInput.disabled = isCurrent;
        if (isCurrent) endInput.value = '';
    },

    saveExperience() {
        const role = document.getElementById('expRole').value;
        const company = document.getElementById('expCompany').value;
        const start = document.getElementById('expStartDate').value;
        const end = document.getElementById('expEndDate').value;
        const isCurrent = document.getElementById('expCurrent').checked;
        const indexStr = document.getElementById('expIndex').value;

        if (!role || !company) {
            this.showToast('Cargo y Empresa son obligatorios');
            return;
        }
        if (!start) {
            this.showToast('Fecha de inicio requerida');
            return;
        }
        if (!isCurrent && !end) {
            this.showToast('Fecha fin requerida');
            return;
        }

        // Format
        const formatMonth = (iso) => {
            if (!iso) return '';
            const [y, m] = iso.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1);
            return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        };
        // Capitalize
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        const periodStr = `${cap(formatMonth(start))} - ${isCurrent ? 'Presente' : cap(formatMonth(end))}`;

        const newItem = {
            role,
            company,
            period: periodStr,
            startDate: start,
            endDate: isCurrent ? null : end,
            isCurrent
        };

        if (!Array.isArray(this.currentUser.experience)) {
            // If it exists but is not an array (e.g. object), we might want to preserve it or just reset?
            // Safest is to reset to array if it's garbage, or wrap it. 
            // Given the error, it's likely garbage or {} from bad init.
            this.currentUser.experience = [];
        }

        if (indexStr !== '') {
            const index = parseInt(indexStr);
            this.currentUser.experience[index] = { ...this.currentUser.experience[index], ...newItem };
        } else {
            this.currentUser.experience.push({ ...newItem, id: Date.now() });
        }

        this.saveProfile();
        this.renderProfile();
        this.closeEditExperience();
    },

    // Legacy Support
    addExperience() {
        this.openEditExperience();
    },

    removeExperience(id) {
        if (confirm('¿Eliminar experiencia?')) {
            this.currentUser.experience = (this.currentUser.experience || []).filter(e => e.id !== id);
            this.saveProfile();
            this.renderProfile();
        }
    },

    // ================= EDUCATION MODAL =================
    openEditEducation(index = null) {
        const modal = document.getElementById('editEducationModal');
        if (!modal) return;

        const degreeInput = document.getElementById('eduDegree');
        const schoolInput = document.getElementById('eduSchool');
        const startInput = document.getElementById('eduStartDate');
        const endInput = document.getElementById('eduEndDate');
        const currentInput = document.getElementById('eduCurrent');
        const indexInput = document.getElementById('eduIndex');
        const title = document.getElementById('eduModalTitle');

        // Reset
        degreeInput.value = '';
        schoolInput.value = '';
        startInput.value = '';
        endInput.value = '';
        currentInput.checked = false;
        endInput.disabled = false;
        indexInput.value = '';

        if (index !== null && this.currentUser.education && this.currentUser.education[index]) {
            const item = this.currentUser.education[index];
            degreeInput.value = item.degree || '';
            schoolInput.value = item.school || '';
            indexInput.value = index;
            title.textContent = 'Editar Educación';

            if (item.startDate) startInput.value = item.startDate;
            if (item.endDate) endInput.value = item.endDate;
            if (item.isCurrent) {
                currentInput.checked = true;
                endInput.value = '';
                endInput.disabled = true;
            }
        } else {
            title.textContent = 'Agregar Educación';
        }

        modal.classList.add('active');
    },

    closeEditEducation() {
        const modal = document.getElementById('editEducationModal');
        if (modal) modal.classList.remove('active');
    },

    toggleEduEndDate() {
        const isCurrent = document.getElementById('eduCurrent').checked;
        const endInput = document.getElementById('eduEndDate');
        endInput.disabled = isCurrent;
        if (isCurrent) endInput.value = '';
    },

    saveEducation() {
        const degree = document.getElementById('eduDegree').value;
        const school = document.getElementById('eduSchool').value;
        const start = document.getElementById('eduStartDate').value;
        const end = document.getElementById('eduEndDate').value;
        const isCurrent = document.getElementById('eduCurrent').checked;
        const indexStr = document.getElementById('eduIndex').value;

        if (!degree || !school) {
            this.showToast('Título e Institución son obligatorios');
            return;
        }
        if (!start) {
            this.showToast('Fecha de inicio requerida');
            return;
        }
        if (!isCurrent && !end) {
            this.showToast('Fecha fin requerida');
            return;
        }

        const formatMonth = (iso) => {
            if (!iso) return '';
            const [y, m] = iso.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1);
            return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        };
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        const periodStr = `${cap(formatMonth(start))} - ${isCurrent ? 'Presente' : cap(formatMonth(end))}`;

        const newItem = {
            degree,
            school,
            period: periodStr,
            startDate: start,
            endDate: isCurrent ? null : end,
            isCurrent
        };

        if (!this.currentUser.education) this.currentUser.education = [];

        if (indexStr !== '') {
            const index = parseInt(indexStr);
            this.currentUser.education[index] = { ...this.currentUser.education[index], ...newItem };
        } else {
            this.currentUser.education.push({ ...newItem, id: Date.now() });
        }

        this.saveProfile();
        this.renderProfile();
        this.closeEditEducation();
    },

    // Legacy Support
    addEducation() {
        this.openEditEducation();
    },

    async openEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (!modal) return;

        // Safety: Ensure Reference Data is Loaded
        if (!this.referenceData || !this.referenceData.countries || this.referenceData.countries.length === 0) {
            await this.loadReferenceData();
        }

        // Pre-fill data
        document.getElementById('editName').value = this.currentUser.name || '';
        document.getElementById('editPosition').value = this.currentUser.current_position || '';
        document.getElementById('editSalary').value = this.currentUser.expected_salary ? new Intl.NumberFormat('es-CL').format(this.currentUser.expected_salary) : '';
        document.getElementById('editCurrency').value = this.currentUser.currency || 'CLP';
        document.getElementById('editModality').value = this.currentUser.work_modality || 'Remoto';
        document.getElementById('editBio').value = this.currentUser.bio || '';

        // Load Countries (Reuse Onboarding Logic)
        this.renderCountries('editCountry');

        // Function to set City after countries load/change
        const setCityAfterLoad = () => {
            const countrySelect = document.getElementById('editCountry');
            if (this.currentUser.country) {
                // Try to find by ID or Name
                for (let i = 0; i < countrySelect.options.length; i++) {
                    const opt = countrySelect.options[i];
                    if (opt.value === this.currentUser.country || opt.text === this.currentUser.country) {
                        countrySelect.selectedIndex = i;
                        break;
                    }
                }
            }

            // Trigger City Load
            this.updateCities('editCountry', 'editCity').then(() => {
                const citySelect = document.getElementById('editCity');
                if (this.currentUser.city) {
                    citySelect.value = this.currentUser.city;
                }
            });
        };

        // Small delay to ensure renderCountries fills the select
        setTimeout(setCityAfterLoad, 100);

        modal.classList.add('active');
    },

    closeEditPersonal() {
        document.getElementById('editPersonalModal').classList.remove('active');
    },

    saveEditPersonal() {
        const name = document.getElementById('editName').value;
        if (!name) {
            this.showToast('El nombre es obligatorio');
            return;
        }

        const salaryStr = document.getElementById('editSalary').value.replace(/\./g, '');

        this.currentUser = {
            ...this.currentUser,
            name: name,
            current_position: document.getElementById('editPosition').value,
            country: document.getElementById('editCountry').value, // This stores ID now
            city: document.getElementById('editCity').value,
            expected_salary: salaryStr ? parseInt(salaryStr) : 0,
            currency: document.getElementById('editCurrency').value,
            work_modality: document.getElementById('editModality').value,
            bio: document.getElementById('editBio').value
        };

        this.saveProfile();
        this.renderProfile();
        this.closeEditPersonal();
    },

    // Legacy function support (redirect to new)
    editPersonalInfo() {
        this.openEditPersonal();
    },

    renderProfile() {
        // Use Real User Data if available, otherwise fallback to mock
        const profileData = this.currentUser || {};

        // console.log('✓ renderProfile() EJECUTÁNDOSE (línea 2980)');

        // 1. Update Header Info
        const profileHero = document.querySelector('.profile-hero');
        if (profileHero) {
            // Update Name
            const nameEl = profileHero.querySelector('h2');
            if (nameEl) nameEl.textContent = profileData.name || 'Usuario';

            // Update Position
            const titleEl = profileHero.querySelector('p');
            if (titleEl) titleEl.textContent = profileData.current_position || 'Sin cargo definido';
        }

        // Update Avatar - PRIORIZAR avatar_url sobre image y EVITAR blob: URLs
        const imageUrl = profileData.avatar_url || profileData.image;
        const avatarElements = document.querySelectorAll('.profile-avatar-large, .profile-image-large, .preview-image');

        // console.log('renderProfile() - Avatar info:', {
        //     imageUrl: imageUrl?.substring(0, 80) + '...',
        //     isBlob: imageUrl?.startsWith('blob:'),
        //     elementos: avatarElements.length
        // });

        if (imageUrl && !imageUrl.startsWith('blob:')) {
            avatarElements.forEach(el => {
                el.src = imageUrl;
                // console.log('✓ Avatar actualizado:', el.className);
            });
        } else if (!imageUrl || imageUrl.startsWith('blob:')) {
            // Fallback a avatar generado
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random`;
            avatarElements.forEach(el => el.src = fallbackUrl);
            // console.log('⚠ Usando fallback avatar (sin URL válida o blob: temporal)');
        }

        // 2. Update Personal Information List
        const updateInfoRow = (label, value) => {
            const rows = document.querySelectorAll('.profile-info-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.profile-info-label');
                if (labelEl && labelEl.textContent.includes(label)) {
                    const valueEl = row.querySelector('.profile-info-value');
                    if (valueEl) valueEl.textContent = value;
                    break;
                }
            }
        };

        // Prepare Location
        let locationString = '';
        let countryDisplay = profileData.country || '';
        // Try to resolve Country ID to Name
        if (this.referenceData && this.referenceData.countries) {
            const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
            if (countryObj) countryDisplay = countryObj.name;
        }
        if (profileData.city) {
            locationString = `${profileData.city}, ${countryDisplay}`;
        } else {
            locationString = countryDisplay || 'No especificada';
        }

        updateInfoRow('Ubicación', locationString);
        if (profileData.birth_date) updateInfoRow('Fecha de nacimiento', profileData.birth_date);
        if (profileData.email) updateInfoRow('Email', profileData.email);
        updateInfoRow('Disponibilidad', profileData.availability || 'No especificada');
        updateInfoRow('Modalidad', profileData.work_modality || 'No especificada');

        if (profileData.expected_salary) {
            const formatted = new Intl.NumberFormat('es-CL').format(profileData.expected_salary);
            updateInfoRow('Pretensión salarial', `$${formatted} ${profileData.currency || 'CLP'}`);
        } else {
            updateInfoRow('Pretensión salarial', 'No especificada');
        }

        // Button Listeners for Personal Info
        const infoSection = document.querySelector('.profile-section:first-of-type'); // Assuming first section is personal info
        if (infoSection) {
            const editBtn = infoSection.querySelector('.edit-section-btn');
            if (editBtn) editBtn.onclick = () => this.editPersonalInfo();
        }


        // 3. Update Skills
        const skillsContainer = document.querySelector('.skills-display');
        if (skillsContainer) {
            const skills = profileData.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">Sin habilidades registradas</span>';
            }
            // Add Listener to localized edit button
            const section = skillsContainer.closest('.profile-section');
            if (section) {
                const editBtn = section.querySelector('.edit-section-btn');
                if (editBtn) editBtn.onclick = () => this.editSkills();
            }
        }

        // 4. Update About Me
        const aboutMeEl = document.querySelector('.about-text');
        if (aboutMeEl) {
            aboutMeEl.textContent = profileData.bio || 'Sin descripción.';
        }

        // Render Experience
        const expList = document.getElementById('experienceList');
        if (expList) {
            let experience = profileData.experience || [];
            if (typeof experience === 'string') {
                try { experience = JSON.parse(experience); } catch (e) { experience = []; }
            }
            if (!Array.isArray(experience)) experience = [];

            if (experience.length === 0) {
                expList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin experiencia registrada</div>';
            } else {
                expList.innerHTML = experience.map((exp, index) => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${exp.role}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${exp.company} • ${exp.period}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                             <button onclick="app.openEditExperience(${index})" style="color: var(--primary); background: none; border: none; font-size: 18px; cursor: pointer;">✎</button>
                             <button onclick="app.removeExperience(${exp.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Education
        const eduList = document.getElementById('educationList');
        if (eduList) {
            let education = profileData.education || [];
            if (typeof education === 'string') {
                try { education = JSON.parse(education); } catch (e) { education = []; }
            }
            if (!Array.isArray(education)) education = [];

            if (education.length === 0) {
                eduList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin educación registrada</div>';
            } else {
                eduList.innerHTML = education.map((edu, index) => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${edu.degree}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${edu.school} • ${edu.period}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button onclick="app.openEditEducation(${index})" style="color: var(--primary); background: none; border: none; font-size: 18px; cursor: pointer;">✎</button>
                            <button onclick="app.removeEducation(${edu.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    removeEducation(id) {
        if (confirm('¿Eliminar educación?')) {
            this.currentUser.education = (this.currentUser.education || []).filter(e => e.id !== id);
            this.saveProfile();
            this.renderProfile();
        }
    },

    async saveProfile() {
        if (window.talentlyBackend && window.talentlyBackend.isReady && this.currentUser) {
            // Construct a CLEAN payload that matches the 'profiles' table schema.
            const payload = {
                name: this.currentUser.name,
                current_position: this.currentUser.current_position || this.currentUser.professional_title,
                country: this.currentUser.country,
                city: this.currentUser.city || this.currentUser.city_id,
                expected_salary: this.currentUser.expected_salary || this.currentUser.salary,
                currency: this.currentUser.currency,
                work_modality: this.currentUser.work_modality,
                availability: this.currentUser.availability,
                bio: this.currentUser.bio,
                skills: this.currentUser.skills,
                experience: this.currentUser.experience || [],
                education: this.currentUser.education || [],
                avatar_url: this.currentUser.avatar_url || this.currentUser.image
            };

            // Remove undefined/null keys
            Object.keys(payload).forEach(key =>
                payload[key] === undefined && delete payload[key]
            );

            await window.talentlyBackend.profiles.create(payload); // Uses UPSERT now
            this.showToast('Perfil actualizado');
        } else {
            localStorage.setItem('talently_profile', JSON.stringify(this.currentUser));
        }
    },



    appendMessageToUI(text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageHTML = `
            <div class="message ${type}">
                <div class="message-bubble">${text}</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;
        if (!this.currentMatchId) return;

        // Optimistic UI
        this.appendMessageToUI(message, 'sent');
        input.value = '';

        // Send to Backend
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const { error } = await window.talentlyBackend.matches.sendMessage(this.currentMatchId, message);
            if (error) {
                console.error('Error sending message:', error);
                // Optionally show error state on the message
            }
        }
    },

    openFilters() {
        console.log('openFilters called');
        const view = document.getElementById('filtersView');
        if (!view) {
            console.error('filtersView not found');
            return;
        }

        // Toggle: Si ya está abierto, cerrar
        if (view.style.transform === 'translateY(0px)' || view.style.transform === 'translateY(0)') {
            console.log('Filters already open, closing...');
            this.closeFilters();
            return;
        }

        // Cerrar otros toggles
        console.log('Closing other toggles...');
        this.closeNotifications();
        this.closeSettingsModal();

        // Abrir filtros
        console.log('Opening filters...');
        view.style.transform = 'translateY(0)';
        this.loadFilterOptions();
    },

    closeFilters() {
        const view = document.getElementById('filtersView');
        if (view) view.style.transform = 'translateY(100%)';
    },

    async loadFilterOptions() {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        // 1. MODALIDAD - Desde BD
        const modalityContainer = document.getElementById('filterModalityChips');
        if (modalityContainer) {
            try {
                const { data: modalities } = await window.talentlyBackend.reference.getWorkModalities();
                if (modalities && modalities.length > 0) {
                    modalityContainer.innerHTML = '';
                    modalities.forEach(m => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'work_modality', m.slug);
                        btn.textContent = m.name;
                        btn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--bg); color: var(--text-primary); transition: all 0.2s;';
                        modalityContainer.appendChild(btn);
                    });
                }
            } catch (e) {
                console.error('Error loading modalities:', e);
            }
        }

        // 2. EDUCACIÓN - Desde BD
        const eduContainer = document.getElementById('filterEducationChips');
        if (eduContainer) {
            try {
                const { data: levels } = await window.talentlyBackend.reference.getEducationLevels();
                if (levels && levels.length > 0) {
                    eduContainer.innerHTML = '';
                    levels.forEach(l => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'education_level', l.slug);
                        btn.textContent = l.name;
                        btn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--bg); color: var(--text-primary); transition: all 0.2s;';
                        eduContainer.appendChild(btn);
                    });
                }
            } catch (e) {
                console.error('Error loading education levels:', e);
            }
        }

        // 3. EXPERIENCIA - Desde BD
        const expContainer = document.getElementById('filterExperienceChips');
        if (expContainer) {
            try {
                const { data: ranges } = await window.talentlyBackend.reference.getExperienceRanges();
                if (ranges && ranges.length > 0) {
                    expContainer.innerHTML = '';
                    ranges.forEach(r => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'experience_range', r.slug);
                        btn.textContent = r.name;
                        btn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--bg); color: var(--text-primary); transition: all 0.2s;';
                        expContainer.appendChild(btn);
                    });
                }
            } catch (e) {
                console.error('Error loading experience ranges:', e);
            }
        }

        // 4. Countries (DB)
        const countrySelect = document.getElementById('filterCountry');
        if (countrySelect && countrySelect.options.length <= 1) {
            try {
                const { data: countries } = await supabase.from('countries').select('id, name').order('name');
                if (countries) {
                    countries.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.id;
                        opt.textContent = c.name;
                        countrySelect.appendChild(opt);
                    });
                }
            } catch (e) {
                console.warn('Error fetching countries:', e);
            }
        }

        // 5. Skills (DB)
        const skillsContainer = document.getElementById('filterSkillsChips');
        if (skillsContainer) { // Always refresh skills to avoid "Loading..." stuck
            try {
                const { data: skills } = await supabase.from('skills').select('id, name').order('name').limit(30);
                if (skills && skills.length > 0) {
                    skillsContainer.innerHTML = '';
                    skills.forEach(s => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.textContent = s.name;
                        btn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--bg); color: var(--text-primary); transition: all 0.2s;';
                        btn.onclick = () => this.toggleFilterChip(btn, 'skills', s.name);
                        skillsContainer.appendChild(btn);
                    });
                } else {
                    skillsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-secondary);">Sin habilidades disponibles</span>';
                }
            } catch (e) {
                skillsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-secondary);">Error al cargar habilidades</span>';
            }
        }
    },

    async loadFilterCities() {
        const countryId = document.getElementById('filterCountry')?.value;
        const citySelect = document.getElementById('filterCity');
        if (!citySelect) return;

        // Reset cities
        citySelect.innerHTML = '<option value="">Todas</option>';

        if (!countryId || !window.talentlyBackend?.isReady) return;

        try {
            const supabase = window.supabaseClient;
            if (!supabase) return;

            const { data: cities } = await supabase.from('cities').select('id, name').eq('country_id', countryId).order('name');
            if (cities) {
                cities.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    citySelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.warn('Error loading cities:', e);
        }
    },

    clearAllFilters() {
        // Reset all filter chips
        document.querySelectorAll('#filtersView .filter-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
            chip.style.background = 'var(--bg)';
            chip.style.color = 'var(--text-primary)';
            chip.style.borderColor = 'var(--border)';
        });

        // Reset salary inputs
        const salaryMin = document.getElementById('filterSalaryMin');
        const salaryMax = document.getElementById('filterSalaryMax');
        if (salaryMin) salaryMin.value = '';
        if (salaryMax) salaryMax.value = '';

        // Reset dropdowns
        const countrySelect = document.getElementById('filterCountry');
        const citySelect = document.getElementById('filterCity');
        if (countrySelect) countrySelect.value = '';
        if (citySelect) {
            citySelect.innerHTML = '<option value="">Todas</option>';
            citySelect.value = '';
        }

        // Reset filter state
        this.activeFilters = {};
        this.showToast('Filtros limpiados');
    },

    applyFilters() {
        // Collect all filter state
        const filters = { ...this.activeFilters };

        const salaryMin = document.getElementById('filterSalaryMin')?.value;
        const salaryMax = document.getElementById('filterSalaryMax')?.value;
        if (salaryMin) filters.salaryMin = parseInt(salaryMin);
        if (salaryMax) filters.salaryMax = parseInt(salaryMax);

        const country = document.getElementById('filterCountry')?.value;
        const city = document.getElementById('filterCity')?.value;
        if (country) filters.country = country;
        if (city) filters.city = city;

        console.log('Applied filters:', filters);
        this.activeFilters = filters;
        this.closeFilters();
        this.showToast('Filtros aplicados');
    },

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Por favor selecciona una imagen');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('La imagen no debe superar 5MB');
            return;
        }

        // Show preview immediately y guardar en localStorage como backup
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            const avatarImg = document.getElementById('profileAvatarImg');
            if (avatarImg) avatarImg.src = base64Image;

            // Guardar inmediatamente en localStorage como backup
            localStorage.setItem('talently_avatar_backup', base64Image);
            this.currentUser.image = base64Image;
            this.currentUser.avatar_url = base64Image;
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        try {
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const supabase = window.supabaseClient;
                if (!supabase) return;

                const userId = this.currentUser?.id || (await supabase.auth.getUser())?.data?.user?.id;
                if (!userId) return;

                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}/avatar.${fileExt}`;

                // Upload to storage bucket
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file, { upsert: true });

                if (error) {
                    console.error('Avatar upload error:', error);

                    if (error.message && error.message.includes('Bucket not found')) {
                        this.showToast('Error: Storage no configurado. Contacta al administrador.');
                    } else {
                        this.showToast('Error al subir imagen. Se guardará localmente.');
                    }

                    // Guardar como base64 en lugar de ObjectURL
                    const reader2 = new FileReader();
                    reader2.onload = (e) => {
                        const base64Image = e.target.result;
                        this.currentUser.image = base64Image;
                        this.currentUser.avatar_url = base64Image;
                        localStorage.setItem('talently_avatar_backup', base64Image);
                        this.saveProfile();
                        this.renderProfile();
                    };
                    reader2.readAsDataURL(file);
                    return;
                }

                // Get the public URL
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                const publicUrl = urlData?.publicUrl;
                if (publicUrl) {
                    // Update profile with new image URL (agregar timestamp para evitar cache)
                    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
                    this.currentUser.image = urlWithTimestamp;
                    this.currentUser.avatar_url = urlWithTimestamp;

                    // GUARDAR la URL de Supabase en localStorage como backup permanente
                    localStorage.setItem('talently_avatar_backup', urlWithTimestamp);
                    // console.log('Avatar URL guardada en localStorage:', urlWithTimestamp);

                    await this.saveProfile();
                    this.renderProfile(); // Update UI immediately
                    this.showToast('Foto actualizada correctamente');
                }
            } else {
                this.currentUser.image = URL.createObjectURL(file);
                this.renderProfile(); // Update UI immediately
                this.showToast('Foto actualizada localmente (Backend no listo)');
            }
        } catch (e) {
            console.error('Avatar upload failed:', e);
            this.showToast('Error crítico al subir foto');
            // Prevent disappearance
            this.currentUser.image = URL.createObjectURL(file);
            this.renderProfile(); // Update UI immediately
        }
    },

    // === NOTIFICATION TOGGLE ===
    async toggleNotificationSetting() {
        const toggle = document.getElementById('notifToggle');
        const knob = document.getElementById('notifToggleKnob');
        const statusText = document.getElementById('notifStatusText');
        if (!toggle || !knob || !statusText) return;

        const isCurrentlyOn = toggle.dataset.on === 'true';

        if (!isCurrentlyOn) {
            // Turning ON — request permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Enable
                    toggle.dataset.on = 'true';
                    toggle.style.background = 'var(--primary)';
                    knob.style.transform = 'translateX(20px)';
                    statusText.textContent = 'Activado';
                    statusText.style.color = 'var(--success)';
                    localStorage.setItem('talently_notifications', 'true');
                    this.showToast('Notificaciones activadas');

                    // Show a test notification
                    new Notification('Talently', {
                        body: '¡Notificaciones activadas! Recibirás alertas de matches y mensajes.',
                        icon: 'https://ui-avatars.com/api/?name=T&background=6C5CE7&color=fff'
                    });
                } else {
                    this.showToast('Permiso de notificaciones denegado por el navegador');
                }
            } else {
                this.showToast('Tu navegador no soporta notificaciones');
            }
        } else {
            // Turning OFF
            toggle.dataset.on = 'false';
            toggle.style.background = 'var(--border)';
            knob.style.transform = 'translateX(0)';
            statusText.textContent = 'Desactivado';
            statusText.style.color = 'var(--text-secondary)';
            localStorage.setItem('talently_notifications', 'false');
            this.showToast('Notificaciones desactivadas');
        }
    },

    initNotificationToggle() {
        const isOn = localStorage.getItem('talently_notifications') === 'true';
        const toggle = document.getElementById('notifToggle');
        const knob = document.getElementById('notifToggleKnob');
        const statusText = document.getElementById('notifStatusText');
        if (!toggle || !knob || !statusText) return;

        if (isOn && 'Notification' in window && Notification.permission === 'granted') {
            toggle.dataset.on = 'true';
            toggle.style.background = 'var(--primary)';
            knob.style.transform = 'translateX(20px)';
            statusText.textContent = 'Activado';
            statusText.style.color = 'var(--success)';
        } else {
            toggle.dataset.on = 'false';
        }
    },

    // === PROFILE COMPLETENESS DETAIL ===
    showProfileCompletenessDetail() {
        if (!this.currentUser) return;

        const fieldLabels = {
            name: 'Nombre',
            email: 'Correo electrónico',
            birth_date: 'Fecha de nacimiento',
            country: 'País',
            city: 'Ciudad',
            current_position: 'Cargo actual',
            work_modality: 'Modalidad de trabajo',
            availability: 'Disponibilidad',
            expected_salary: 'Salario esperado',
            bio: 'Biografía / Sobre mí',
            image: 'Foto de perfil'
        };

        const arrayFieldLabels = {
            skills: 'Habilidades',
            experience: 'Experiencia laboral',
            education: 'Educación'
        };

        const missing = [];

        Object.entries(fieldLabels).forEach(([key, label]) => {
            const val = this.currentUser[key];
            if (!val || val === '') {
                // Check avatar_url as fallback for image
                if (key === 'image' && (this.currentUser.avatar_url)) return;
                missing.push(label);
            }
        });

        Object.entries(arrayFieldLabels).forEach(([key, label]) => {
            const val = this.currentUser[key];
            if (!val || !Array.isArray(val) || val.length === 0) {
                missing.push(label);
            }
        });

        const pct = this.calculateProfileCompleteness();

        if (missing.length === 0) {
            this.showToast('🎉 ¡Tu perfil está 100% completo!');
        } else {
            // Show modal with missing fields
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
            overlay.onclick = () => overlay.remove();

            const modal = document.createElement('div');
            modal.style.cssText = 'background: var(--surface); border-radius: 20px; padding: 24px; max-width: 340px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2);';
            modal.onclick = (e) => e.stopPropagation();

            modal.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 42px; margin-bottom: 8px;">📋</div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Perfil ${pct}% completo</h3>
                    <p style="font-size: 13px; color: var(--text-secondary);">Te falta completar ${missing.length} campo${missing.length > 1 ? 's' : ''}</p>
                </div>
                <div style="max-height: 250px; overflow-y: auto;">
                    ${missing.map(f => `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,107,157,0.08); margin-bottom: 6px;">
                            <span style="color: var(--danger); font-size: 16px;">✕</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 500;">${f}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('div[style*=fixed]').remove()"
                    style="width: 100%; margin-top: 16px; padding: 14px; background: var(--gradient-primary); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">
                    Entendido
                </button>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        }
    },

    updateBadge() {
        const badge = document.querySelector('.icon-btn .badge');

        // Count unread matches
        const count = this.matches ? this.matches.filter(m => m.hasUnread).length : 0;

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Also update the list if it's visible or just to be safe
        this.renderNotifications();
    },

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        const unreadMatches = (this.matches || []).filter(m => m.hasUnread);

        if (unreadMatches.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>No tienes nuevas notificaciones</p>
                </div>
            `;
            return;
        }

        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        list.innerHTML = unreadMatches.map(match => {
            const safeName = escapeHtml(match.name || 'Usuario');
            const safeId = escapeHtml(String(match.id));
            const imgUrl = match.image || match.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`;
            const time = match.matchDate ? new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora';

            return `
            <div style="padding: 16px; border-bottom: 1px solid var(--border); background: rgba(108,92,231,0.05); cursor: pointer;" 
                 onclick="app.openChat('${safeId}', '${safeName}'); app.closeNotifications();">
                <div style="display: flex; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">
                            ¡Hiciste Match con ${safeName}!
                        </div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                            Ahora pueden chatear. Envía un mensaje.
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
                            ${time}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    // Filter state
    activeFilters: {},

    showFilterTab(tabName) {
        // Update tabs
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.filter-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`filter-${tabName}`).style.display = 'block';
    },

    toggleFilterChip(element, category, value) {
        const isSelected = element.classList.toggle('selected');

        // Visual toggle
        if (isSelected) {
            element.style.background = 'rgba(108,92,231,0.15)';
            element.style.color = 'var(--primary)';
            element.style.borderColor = 'var(--primary)';
        } else {
            element.style.background = 'var(--bg)';
            element.style.color = 'var(--text-primary)';
            element.style.borderColor = 'var(--border)';
        }

        // Update filter state
        if (!this.activeFilters[category]) {
            this.activeFilters[category] = [];
        }

        const index = this.activeFilters[category].indexOf(value);
        if (index > -1) {
            this.activeFilters[category].splice(index, 1);
        } else {
            this.activeFilters[category].push(value);
        }

        this.updateActiveFiltersDisplay();
    },

    updateActiveFiltersDisplay() {
        const container = document.getElementById('activeFilters');
        const allFilters = Object.entries(this.activeFilters)
            .flatMap(([cat, values]) => values.map(v => ({ cat, value: v })));

        if (allFilters.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = allFilters.map(f => `
            <span class="active-filter-tag">
                ${f.value}
                <button class="remove-filter" onclick="app.removeFilter('${f.cat}', '${f.value}')">×</button>
            </span>
        `).join('');
    },

    removeFilter(category, value) {
        const index = this.activeFilters[category].indexOf(value);
        if (index > -1) {
            this.activeFilters[category].splice(index, 1);
        }

        // Update chip state
        document.querySelectorAll('.filter-chip').forEach(chip => {
            if (chip.textContent.includes(value)) {
                chip.classList.remove('selected');
            }
        });

        this.updateActiveFiltersDisplay();
    },

    clearFilters() {
        this.activeFilters = {};
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        this.updateActiveFiltersDisplay();
    },

    applyFilters() {
        const active = this.activeFilters;
        let filtered = [...mockProfiles];

        // Filter by Sector
        if (active.sector && active.sector.length > 0) {
            filtered = filtered.filter(p => active.sector.some(s => p.sector && p.sector.includes(s)));
        }

        // Filter by Modalidad
        if (active.modalidad && active.modalidad.length > 0) {
            filtered = filtered.filter(p => active.modalidad.some(m => p.modality && p.modality.includes(m)));
        }

        // Filter by Tech Stack
        if (active.techStack && active.techStack.length > 0) {
            filtered = filtered.filter(p => p.techStack && active.techStack.some(t => p.techStack.includes(t)));
        }

        // Filter by Size (Tamaño)
        if (active['tamaño'] && active['tamaño'].length > 0) {
            filtered = filtered.filter(p => active['tamaño'].some(s => p.size && p.size.includes(s)));
        }

        this.profiles = filtered;
        this.currentIndex = 0;

        if (this.profiles.length === 0) {
            const cardStack = document.querySelector('.card-stack');
            if (cardStack) {
                cardStack.innerHTML = `
                    <div class="no-profiles" style="text-align: center; padding: 40px;">
                        <h3>No hay perfiles que coincidan</h3>
                        <p>Intenta ajustar tus filtros</p>
                        <button class="btn-secondary" onclick="app.clearFilters(); app.applyFilters()" style="margin-top: 16px;">Limpiar Filtros</button>
                    </div>`;
            }
            this.showToast('No se encontraron perfiles');
        } else {
            this.renderCard();
            this.showToast(`${this.profiles.length} perfiles encontrados`);
        }

        this.closeFilters();
    },

    selectProfileType(type, element) {
        this.profileType = type;
        console.log('🎯 DEBUG: Profile type selected:', type);
        localStorage.setItem('talently_user_type', type);
        console.log('💾 DEBUG: Saved to localStorage:', type);

        // Update UI
        document.querySelectorAll('.profile-type-option').forEach(opt => {
            opt.style.borderColor = 'var(--border)';
            opt.style.background = 'var(--surface)';
        });

        element.style.borderColor = 'var(--primary)';
        element.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)';

        // Enable continue button
        document.getElementById('continueStep1').disabled = false;
    },

    continueFromStep1() {
        console.log('🚀 DEBUG: Continuing from Step 1');
        console.log('📋 DEBUG: Current profileType:', this.profileType);
        console.log('💾 DEBUG: localStorage user_type:', localStorage.getItem('talently_user_type'));

        // Route to appropriate onboarding based on profile type
        if (this.profileType === 'company') {
            console.log('🏢 DEBUG: Redirecting to company onboarding (companyStep2)');
            this.showView('companyStep2');
        } else {
            console.log('👤 DEBUG: Redirecting to candidate onboarding');

            this.showView('onboardingStep2');
        }
    },

    nextOnboardingStep(step) {
        // Inline validation helper
        const validateInput = (id, message) => {
            const el = document.getElementById(id);
            if (!el) return true;

            // Clear previous error
            el.style.borderColor = 'var(--border)';
            const prevError = el.parentNode.querySelector('.field-error-msg');
            if (prevError) prevError.remove();

            if (!el.value || el.value === '') {
                el.style.borderColor = 'var(--danger)';
                const errorMsg = document.createElement('div');
                errorMsg.className = 'field-error-msg';
                errorMsg.style.cssText = 'color: var(--danger); font-size: 12px; margin-top: 4px; font-weight: 500;';
                errorMsg.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${message}
                    </div>`;
                el.parentNode.appendChild(errorMsg);

                // Add input listener to clear error on type
                el.addEventListener('input', function () {
                    this.style.borderColor = 'var(--border)';
                    const err = this.parentNode.querySelector('.field-error-msg');
                    if (err) err.remove();
                }, { once: true });

                return false;
            }
            return true;
        };

        const currentStep = step - 1;
        let isValid = true;

        // Step 2: Personal Data
        if (currentStep === 2) {
            const dobValid = validateInput('birthDate', 'La fecha de nacimiento es obligatoria');
            // Gender is optional now, so we remove validation check for it
            if (!dobValid) return;

            // Age validation
            const dob = document.getElementById('birthDate').value;
            if (dob) {
                const birthDate = new Date(dob);
                const ageDifMs = Date.now() - birthDate.getTime();
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);

                if (age < 18) {
                    const el = document.getElementById('birthDate');
                    el.style.borderColor = 'var(--danger)';

                    // Remove existing error if any
                    const prevError = el.parentNode.querySelector('.field-error-msg');
                    if (prevError) prevError.remove();

                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.style.cssText = 'color: var(--danger); font-size: 12px; margin-top: 4px; font-weight: 500;';
                    errorMsg.innerHTML = 'Debes ser mayor de 18 años';
                    el.parentNode.appendChild(errorMsg);
                    return;
                }
            }
        }

        // Step 3: Location
        if (currentStep === 3) {
            const countryValid = validateInput('country', 'Selecciona tu país');
            // City is dependent on country. If disabled (loading or no country), don't validate strictly?
            // But user must select it.
            const cityValid = validateInput('city', 'La ciudad es obligatoria');
            if (!countryValid || !cityValid) return;
        }

        // Step 4: Experience Level
        if (currentStep === 4) {
            // Validation is implicit by selection, but let's ensure something is selected if needed
            // Currently handled by direct onclick in HTML, so logic moves to next step directly.
            // If button is used:
            const experienceLevel = document.querySelector('input[name="experienceLevel"]:checked');
            if (!experienceLevel && !(step === 5)) { // Allow skip if intended, but usually required
                // For now, let's assume it requires selection if we are validating
            }
        }

        // Step 7: Salary
        if (currentStep === 7) {
            const salaryValid = validateInput('expectedSalary', 'Ingresa tu pretensión salarial');
            const currencyValid = validateInput('currency', 'Selecciona la moneda');
            if (!salaryValid || !currencyValid) return;
        }

        // Step 10: Professional Area
        // Step 10: Professional Area
        if (currentStep === 10) {
            const areaValid = validateInput('professionalArea', 'Selecciona tu área profesional');
            if (!areaValid) return;
        }

        this.renderedSteps = this.renderedSteps || {};

        // Render dynamic content only if not already rendered or if needed
        if (step === 3 && !this.renderedSteps['country']) {
            this.renderCountries('country');
            this.renderedSteps['country'] = true;
        }
        if (step === 11) {
            // Always re-render skills to ensure category changes are reflected if user went back
            this.renderSkillsBubbles();
        }
        if (step === 15) {
            this.renderInterestsBubbles();
            this.renderSuggestedTags();
        }

        this.updateProgress(step);
        this.showView(`onboardingStep${step}`);
    },

    updateProgress(step) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill && progressText) {
            // Total steps is approximately 15
            const totalSteps = 15;
            const percentage = Math.min(100, Math.round((step / totalSteps) * 100));

            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% completado`;
        }
    },

    renderCountries(selectId = 'country') {
        const countrySelect = document.getElementById(selectId);
        if (!countrySelect) return;

        // Save current selection if re-rendering
        const currentVal = countrySelect.value;

        countrySelect.innerHTML = '<option value="">Selecciona tu país</option>';

        // Remove existing listener to prevent duplicates (though onchange overwrite handles it)
        // Determine correct city select ID
        let targetCityId = 'city';
        if (selectId === 'companyCountry') targetCityId = 'companyCity';
        else if (selectId === 'editCountry') targetCityId = 'editCity';

        countrySelect.onchange = () => this.updateCities(selectId, targetCityId);

        // Use DB data
        if (this.referenceData.countries.length > 0) {
            this.referenceData.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id; // Use ID for DB relationship
                option.textContent = country.name;
                option.setAttribute('data-code', country.code);
                countrySelect.appendChild(option);
            });
        }

        if (currentVal) {
            countrySelect.value = currentVal;
            // Trigger updateCities to load cities if a country was already selected
            // Trigger updateCities to load cities if a country was already selected
            this.updateCities(selectId, targetCityId);
        }
    },

    async updateCities(countrySelectId = 'country', citySelectId = 'city', preselectedCity = null) {
        const countrySelect = document.getElementById(countrySelectId);
        const citySelect = document.getElementById(citySelectId);

        if (!countrySelect || !citySelect) return;

        const countryId = countrySelect.value;

        // Immediate Visual Feedback: Clear and Disable
        citySelect.innerHTML = '<option value="">Cargando...</option>';
        citySelect.disabled = true;

        if (!countryId) {
            citySelect.innerHTML = '<option value="">Selecciona un país</option>';
            return;
        }

        try {
            // Fetch cities
            const { data: cities, error } = await window.talentlyBackend.reference.getCities(countryId);

            if (error) throw error;

            citySelect.innerHTML = '<option value="">Selecciona tu ciudad</option>';

            if (cities && cities.length > 0) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.name;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });

                // Re-enable
                citySelect.disabled = false;

                if (preselectedCity) {
                    citySelect.value = preselectedCity;
                }
            } else {
                citySelect.innerHTML = '<option value="">No hay ciudades disponibles</option>';
            }
        } catch (e) {
            console.error('Error fetching cities:', e);
            citySelect.innerHTML = '<option value="">Error al cargar ciudades (Intenta de nuevo)</option>';
        }
    },

    updateExperienceSlider(input) {
        const val = input.value;
        document.getElementById('yearsValue').textContent = val + (val >= 20 ? '+' : '');
        const percent = (val / 20) * 100;
        input.style.background = `linear-gradient(to right, var(--primary) ${percent}%, var(--border) ${percent}%)`;
    },

    formatCurrency(input) {
        let value = input.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') {
            input.value = '';
            return;
        }
        // Format with thousands separator
        input.value = new Intl.NumberFormat('es-CL').format(value);
    },

    async renderSkillsBubbles() {
        const areaSlug = document.getElementById('professionalArea').value || 'desarrollo'; // Default fallback
        const bubbleContainer = document.getElementById('skillsBubbleContainer');

        if (!bubbleContainer) return;

        bubbleContainer.innerHTML = '<div class="loader-spinner"></div>'; // Simple loading state

        try {
            // Check cache first if implemented, or just fetch
            let skills = [];

            // Map the select values (desarrollo, diseno-ux) to what DB expects if needed, 
            // but my DB generation script matched the slugs.

            const result = await window.talentlyBackend.reference.getSkills(areaSlug);
            skills = result.data || [];

            bubbleContainer.innerHTML = '';

            if (skills.length === 0) {
                bubbleContainer.innerHTML = '<p class="text-sm text-gray-500">No se encontraron habilidades para esta área.</p>';
                return;
            }

            skills.filter(skill => !this.skillsSelected.includes(skill.name)).forEach(skill => {
                const btn = document.createElement('button');
                btn.textContent = skill.name;
                btn.type = 'button';
                btn.style.cssText = 'padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border); cursor: pointer; font-size: 14px; transition: all 0.2s; background: var(--surface); color: var(--text-primary);';

                btn.onmouseover = () => { btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
                btn.onmouseout = () => { btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text-primary)'; };

                btn.onclick = () => this.addSkill(skill.name);
                bubbleContainer.appendChild(btn);
            });

        } catch (e) {
            console.error('Error loading skills:', e);
            bubbleContainer.innerHTML = '<p class="text-error">Error cargando habilidades</p>';
        }
    },

    renderSelectedSkills() {
        // Render Selected Chips
        const chipContainer = document.getElementById('skillsSelectedContainer');
        if (chipContainer) {
            chipContainer.innerHTML = '';
            this.skillsSelected.forEach((skill, index) => {
                const chip = document.createElement('div');
                chip.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;';
                chip.innerHTML = `
                        ${skill}
                        <span onclick="app.removeSkill(${index})" style="cursor: pointer; font-weight: bold;">×</span>
                    `;
                chipContainer.appendChild(chip);
            });
        }
    },

    addSkill(skill) {
        if (this.skillsSelected.length >= 10) {
            this.showToast('Máximo 10 habilidades');
            return;
        }
        if (!this.skillsSelected.includes(skill)) {
            this.skillsSelected.push(skill);
            this.renderSkillsBubbles();
        }
    },

    removeSkill(index) {
        this.skillsSelected.splice(index, 1);
        this.renderSkillsBubbles();
    },



    renderInterestsBubbles() {
        const container = document.getElementById('interestsBubbleSection');
        container.innerHTML = '';

        // Get Area-specific interests
        const area = document.getElementById('professionalArea').value || 'other';
        const professionalInterests = this.interestsByArea[area] || [];

        // Combined Data
        const allInterestsData = {
            'Intereses Profesionales': professionalInterests,
            ...this.interestsData
        };

        Object.entries(allInterestsData).forEach(([category, interests]) => {
            const catDiv = document.createElement('div');
            catDiv.innerHTML = `<h3 style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">${category}</h3>`;

            const bubblesDiv = document.createElement('div');
            bubblesDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';

            interests.forEach(interest => {
                const btn = document.createElement('button');
                btn.textContent = interest;
                btn.type = 'button';

                if (!this.interests) this.interests = [];
                const isSelected = this.interests.includes(interest);
                const baseStyle = 'padding: 6px 14px; border-radius: 16px; border: 1px solid; cursor: pointer; font-size: 13px; transition: all 0.2s;';
                const defaultStyle = 'background: var(--surface); border-color: var(--border); color: var(--text-primary);';
                const activeStyle = 'background: rgba(108, 92, 231, 0.1); border-color: var(--primary); color: var(--primary);';

                btn.style.cssText = baseStyle + (isSelected ? activeStyle : defaultStyle);
                btn.onclick = () => this.toggleInterestBubble(interest, btn);

                bubblesDiv.appendChild(btn);
            });

            catDiv.appendChild(bubblesDiv);
            container.appendChild(catDiv);
        });
    },

    toggleInterestBubble(interest, btn) {
        if (!this.interests) this.interests = [];
        const index = this.interests.indexOf(interest);
        const activeStyle = 'background: rgba(108, 92, 231, 0.1); border-color: var(--primary); color: var(--primary);';
        const defaultStyle = 'background: var(--surface); border-color: var(--border); color: var(--text-primary);';
        const baseStyle = 'padding: 6px 14px; border-radius: 16px; border: 1px solid; cursor: pointer; font-size: 13px; transition: all 0.2s;';

        if (index > -1) {
            this.interests.splice(index, 1);
            btn.style.cssText = baseStyle + defaultStyle;
        } else {
            if (this.interests.length >= 15) {
                this.showToast('Máximo 15 intereses');
                return;
            }
            this.interests.push(interest);
            btn.style.cssText = baseStyle + activeStyle;
        }

        this.renderInterests();
    },

    selectOption(category, value, element) {
        // Generic function for radio button options with styling
        const groupClass = `${category}-option`;

        // Deselect all options (styling + radio button)
        document.querySelectorAll(`.${groupClass}`).forEach(opt => {
            opt.style.borderColor = 'var(--border)';
            opt.style.background = 'transparent';
            opt.style.removeProperty('background');
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });

        // Select clicked option (styling + radio button)
        element.style.borderColor = 'var(--primary)';
        element.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)';

        const radioInput = element.querySelector('input[type="radio"]');
        if (radioInput) radioInput.checked = true;
    },

    toggleSoftSkill(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        const isChecked = checkbox.checked;

        // Count selected
        const checkedCount = document.querySelectorAll('.soft-skill-option input:checked').length;

        // Update counter
        document.getElementById('softSkillsCount').textContent = checkedCount;

        // Limit to 6
        if (checkedCount > 6) {
            checkbox.checked = false;
            alert('Máximo 6 habilidades blandas');
            return;
        }

        // Update styling
        if (isChecked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }
    },

    addInterest(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const interest = input.value.trim();

            if (!this.interests) this.interests = [];

            if (interest && this.interests.length < 15) {
                this.interests.push(interest);
                this.renderInterests();
                input.value = '';
            } else if (this.interests.length >= 15) {
                alert('Máximo 15 tags de intereses');
            }
        }
    },

    renderInterests() {
        const container = document.getElementById('interestsContainer');
        const input = document.getElementById('interestInput');

        // Clear existing tags (except input)
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Add interest tags
        this.interests.forEach((interest, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag-item';
            tag.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tag.innerHTML = `
                ${interest}
                <button onclick="app.removeInterest(${index})" style="width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            `;
            container.insertBefore(tag, input);
        });

        // Update counter
        document.getElementById('interestsCount').textContent = this.interests.length;

        // Populate suggested tags on first render or update them
        this.renderSuggestedTags();
    },

    removeInterest(index) {
        this.interests.splice(index, 1);
        this.renderInterests();
    },

    renderSuggestedTags() {
        const container = document.getElementById('suggestedTags');
        if (!container) return; // Guard clause
        container.innerHTML = ''; // Clear previous

        // Logic to get selected area (assuming it's saved in a variable or we get it from DOM)
        // For now, let's assume we store it in this.userProfile.area or similar. 
        // If not, we'll try to get it from the onboardingStep4 selection if possible, 
        // but given the app structure, we might need to store it when selected.

        const selectedAreaInput = document.getElementById('professionalArea'); // Step 10 Use Select
        const selectedArea = selectedAreaInput ? selectedAreaInput.value : 'default';

        const interestsByArea = {
            'operaciones': ['Logística', 'Supply Chain', 'Mejora Continua', 'Lean Six Sigma', 'Gestión de Proyectos', 'Operaciones', 'Distribución', 'Inventarios', 'KPIs', 'Calidad', 'Seguridad Industrial', 'Planificación', 'Compras'],
            'desarrollo': ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Cloud', 'Cybersecurity', 'AI/ML', 'Blockchain', 'QA', 'Arquitectura', 'Data Science', 'IoT'],
            'diseno-ux': ['UX Research', 'UI Design', 'Product Design', 'Graphic Design', 'Motion Graphics', 'Branding', 'Prototyping', 'Design Systems', 'Figma', 'Adobe Suit'],
            'marketing': ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Email Marketing', 'Growth Hacking', 'Brand Management', 'Analytics', 'Copywriting', 'Public Relations'],
            'ventas': ['B2B Sales', 'B2C Sales', 'Account Management', 'Lead Generation', 'CRM', 'Negotiation', 'Sales Strategy', 'Customer Success', 'Business Development'],
            'rrhh': ['Recruitment', 'Talent Acquisition', 'Employee Relations', 'Comp & Ben', 'L&D', 'People Analytics', 'Organizational Culture', 'HRBP'],
            'finanzas': ['Financial Analysis', 'Accounting', 'Auditing', 'Taxation', 'Corporate Finance', 'Investment Banking', 'Risk Management', 'Controlling'],
            'producto': ['Startups', 'Tech Trends', 'Innovation', 'User Psychology', 'Behavioral Economics', 'SaaS', 'Fintech', 'Growth'],
            'data': ['Data Engineering', 'Deep Learning', 'NLP', 'Computer Vision', 'Algorithmic Trading', ' Kaggle', 'Data Ethics'],
            'default': ['FinTech', 'E-commerce', 'HealthTech', 'EdTech', 'SaaS', 'Innovación', 'Startup Culture', 'Remote First', 'Agile', 'Scrum']
        };

        const suggestions = interestsByArea[selectedArea] || interestsByArea['default'];

        suggestions.filter(tag => !this.interests.includes(tag)).forEach(tag => {
            const tagEl = document.createElement('button');
            tagEl.style.cssText = 'padding: 8px 14px; background: var(--bg); color: var(--primary); border: 1px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;';
            tagEl.textContent = tag;
            tagEl.onclick = () => {
                if (!this.interests) this.interests = [];
                if (this.interests.length < 15 && !this.interests.includes(tag)) {
                    this.interests.push(tag);
                    this.renderInterests();
                }
            };
            tagEl.onmouseover = () => {
                tagEl.style.background = 'var(--primary)';
                tagEl.style.color = 'white';
            };
            tagEl.onmouseout = () => {
                tagEl.style.background = 'var(--bg)';
                tagEl.style.color = 'var(--primary)';
            };
            container.appendChild(tagEl);
        });
    },

    addLanguage() {
        const container = document.getElementById('languagesContainer');
        const newLanguage = document.createElement('div');
        newLanguage.className = 'language-item';
        newLanguage.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
        newLanguage.innerHTML = `
            <select class="form-input" style="flex: 2;">
                <option value="">Selecciona idioma</option>
                <option value="espanol">Español</option>
                <option value="ingles">Inglés</option>
                <option value="portugues">Portugués</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="italiano">Italiano</option>
                <option value="chino">Chino</option>
            </select>
            <select class="form-input" style="flex: 1;">
                <option value="">Nivel</option>
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="nativo">Nativo</option>
            </select>
        `;
        container.appendChild(newLanguage);
    },

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('La foto debe ser menor a 5MB');
                return;
            }

            // Save file for later upload
            if (!this.pendingUploads) this.pendingUploads = {};
            this.pendingUploads.photo = file;

            // Show success message
            document.getElementById('photoPreview').style.display = 'block';
            console.log('Photo selected for upload:', file.name);
        }
    },

    handleCVUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                this.showToast('El CV debe ser menor a 10MB');
                return;
            }

            // Check if PDF
            if (file.type !== 'application/pdf') {
                this.showToast('El CV debe ser un archivo PDF');
                return;
            }

            // Save file for later upload
            if (!this.pendingUploads) this.pendingUploads = {};
            this.pendingUploads.cv = file;

            // Show success message
            document.getElementById('cvPreview').style.display = 'block';
            console.log('CV selected for upload:', file.name);
        }
    },

    // ============================================
    // COMPANY ONBOARDING FUNCTIONS
    // ============================================

    // Función para validar RUT chileno (algoritmo módulo 11)
    validateRUT(rut) {
        // Limpiar RUT (eliminar puntos, guiones y espacios)
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');

        if (cleanRUT.length < 2) return false;

        // Separar número y dígito verificador
        const rutNumber = cleanRUT.slice(0, -1);
        const verifier = cleanRUT.slice(-1).toUpperCase();

        // Calcular dígito verificador esperado
        let sum = 0;
        let multiplier = 2;

        for (let i = rutNumber.length - 1; i >= 0; i--) {
            sum += parseInt(rutNumber[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const expectedVerifier = 11 - (sum % 11);
        let calculatedVerifier;

        if (expectedVerifier === 11) calculatedVerifier = '0';
        else if (expectedVerifier === 10) calculatedVerifier = 'K';
        else calculatedVerifier = expectedVerifier.toString();

        return verifier === calculatedVerifier;
    },

    // Función para formatear RUT con puntos y guión
    formatRUT(rut) {
        // Limpiar RUT (solo números y K)
        const cleanRUT = rut.replace(/[^0-9kK]/g, '').toUpperCase();

        if (cleanRUT.length < 2) return cleanRUT;

        // Separar número y dígito verificador
        const rutNumber = cleanRUT.slice(0, -1);
        const verifier = cleanRUT.slice(-1);

        // Agregar puntos cada 3 dígitos desde la derecha
        const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${formattedNumber}-${verifier}`;
    },

    // Event listener para formateo automático de RUT
    setupRUTFormatting() {
        const taxIdInput = document.getElementById('companyTaxId');
        if (taxIdInput) {
            // Prevenir caracteres inválidos al escribir
            taxIdInput.addEventListener('keydown', (e) => {
                const key = e.key;
                const currentValue = e.target.value;

                // Permitir teclas de control (backspace, delete, arrows, tab, etc.)
                if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key)) {
                    return;
                }

                // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                if (e.ctrlKey || e.metaKey) {
                    return;
                }

                // Solo permitir números del 0-9
                if (key >= '0' && key <= '9') {
                    return;
                }

                // Permitir la letra K (mayúscula o minúscula)
                if (key.toLowerCase() === 'k') {
                    return;
                }

                // Bloquear cualquier otro carácter
                e.preventDefault();
            });

            // Formateo automático mientras escribe
            taxIdInput.addEventListener('input', (e) => {
                const cursorPosition = e.target.selectionStart;
                const oldValue = e.target.value;
                const newValue = this.formatRUT(oldValue);

                // Solo actualizar si el valor cambió
                if (oldValue !== newValue) {
                    e.target.value = newValue;
                    // Ajustar posición del cursor
                    const diff = newValue.length - oldValue.length;
                    e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
                }
            });
        }
    },

    // Cargar company sizes y sectors desde BD
    async loadCompanySizesAndSectors() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            // Load sizes
            const { data: sizes } = await backend.reference.getCompanySizes();
            const sizeSelect = document.getElementById('companySize');
            if (sizeSelect && sizes) {
                sizeSelect.innerHTML = '<option value="">Selecciona una opción</option>';
                sizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size.slug;
                    option.textContent = size.description ? `${size.name} (${size.description})` : size.name;
                    sizeSelect.appendChild(option);
                });
            }

            // Load sectors
            const { data: sectors } = await backend.reference.getCompanySectors();
            const sectorSelect = document.getElementById('companySector');
            if (sectorSelect && sectors) {
                sectorSelect.innerHTML = '<option value="">Selecciona una opción</option>';
                sectors.forEach(sector => {
                    const option = document.createElement('option');
                    option.value = sector.slug;
                    option.textContent = sector.name;
                    sectorSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading company sizes/sectors:', error);
        }
    },

    // Cargar culture values desde BD
    async loadCompanyCultureValues() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: values } = await backend.reference.getCompanyCultureValues();
            const container = document.getElementById('companyCultureContainer');
            if (!container || !values) return;

            container.innerHTML = '';
            values.forEach(value => {
                const label = document.createElement('label');
                label.className = 'company-culture-option';
                label.style.cssText = 'padding: 14px; border: 2px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500;';
                label.onclick = () => this.toggleCompanyCulture(label);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value.slug;
                checkbox.style.cssText = 'width: 16px; height: 16px; accent-color: var(--primary);';

                const span = document.createElement('span');
                span.textContent = value.name;

                label.appendChild(checkbox);
                label.appendChild(span);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading culture values:', error);
        }
    },

    // Cargar company stages desde BD
    async loadCompanyStages() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: stages } = await backend.reference.getCompanyStages();
            const container = document.querySelector('#companyStep6 .auth-content > div:last-of-type');
            if (!container || !stages) return;

            // Clear existing options
            const existingOptions = container.querySelectorAll('.company-stage-option');
            existingOptions.forEach(opt => opt.remove());

            stages.forEach(stage => {
                const label = document.createElement('label');
                label.className = 'company-stage-option';
                label.style.cssText = 'padding: 18px; border: 2px solid var(--border); border-radius: 14px; cursor: pointer; transition: all 0.3s ease;';
                label.onclick = () => this.selectOption('companyStage', stage.slug, label);

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'companyStage';
                radio.value = stage.slug;
                radio.style.cssText = 'width: 18px; height: 18px; accent-color: var(--primary); margin-right: 12px;';

                const span = document.createElement('span');
                span.style.cssText = 'font-weight: 600; font-size: 14px;';
                span.textContent = stage.description ? `${stage.name} / ${stage.description}` : stage.name;

                label.appendChild(radio);
                label.appendChild(span);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading company stages:', error);
        }
    },

    // Cargar work models desde BD
    async loadWorkModels() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: models } = await backend.reference.getWorkModalities();
            const container = document.querySelector('#companyStep7 .auth-content > div:last-of-type');
            if (!container || !models) return;

            // Clear existing options
            const existingOptions = container.querySelectorAll('.work-model-option');
            existingOptions.forEach(opt => opt.remove());

            models.forEach(model => {
                const label = document.createElement('label');
                label.className = 'work-model-option';
                label.style.cssText = 'padding: 20px; border: 2px solid var(--border); border-radius: 16px; cursor: pointer; transition: all 0.3s ease;';
                label.onclick = () => this.selectOption('workModel', model.slug, label);

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'workModel';
                radio.value = model.slug;
                radio.style.cssText = 'width: 20px; height: 20px; accent-color: var(--primary); margin-right: 12px;';

                const nameSpan = document.createElement('span');
                nameSpan.style.fontWeight = '600';
                nameSpan.textContent = model.name;

                const descDiv = document.createElement('div');
                descDiv.style.cssText = 'font-size: 13px; color: var(--text-secondary); margin-left: 32px; margin-top: 4px;';
                descDiv.textContent = model.description || '';

                label.appendChild(radio);
                label.appendChild(nameSpan);
                if (model.description) label.appendChild(descDiv);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading work models:', error);
        }
    },

    // Cargar positions desde BD
    async loadCompanyPositions() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: positions } = await backend.reference.getCompanyPositions();
            const container = document.querySelector('#companyStep8 > div > div:nth-child(2) > div:nth-child(3)');
            if (!container || !positions) return;

            container.innerHTML = '';
            positions.forEach(position => {
                const label = document.createElement('label');
                label.className = 'position-option';
                label.style.cssText = 'padding: 14px; border: 2px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500;';
                label.onclick = () => this.togglePosition(label);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = position.slug;
                checkbox.style.cssText = 'width: 16px; height: 16px; accent-color: var(--primary);';

                const span = document.createElement('span');
                span.textContent = position.name;

                label.appendChild(checkbox);
                label.appendChild(span);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading positions:', error);
        }
    },

    // Cargar seniority levels desde BD
    async loadSeniorityLevels() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: levels } = await backend.reference.getSeniorityLevels();
            const container = document.querySelector('#companyStep9 .auth-content > div:nth-child(3)');
            if (!container || !levels) return;

            container.innerHTML = '';
            levels.forEach(level => {
                const label = document.createElement('label');
                label.className = 'seniority-option';
                label.style.cssText = 'padding: 18px; border: 2px solid var(--border); border-radius: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center;';
                label.onclick = () => this.toggleSeniority(label);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = level.slug;
                checkbox.style.cssText = 'width: 18px; height: 18px; accent-color: var(--primary); margin-right: 14px;';

                const div = document.createElement('div');

                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-weight: 600; font-size: 15px;';
                nameDiv.textContent = level.name;

                const descDiv = document.createElement('div');
                descDiv.style.cssText = 'font-size: 13px; color: var(--text-secondary); margin-top: 2px;';
                descDiv.textContent = level.description || '';

                div.appendChild(nameDiv);
                if (level.description) div.appendChild(descDiv);

                label.appendChild(checkbox);
                label.appendChild(div);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading seniority levels:', error);
        }
    },

    validateCompanyStep(step) {
        const validateInput = (id, message) => {
            const el = document.getElementById(id);
            if (!el) return true; // Skip if not found
            if (!el.value || el.value === 'NaN') {
                el.style.borderColor = 'var(--danger)';
                // Create inline error if not exists
                this.showToast(message); // Using Toast for feedback
                return false;
            }
            el.style.borderColor = 'var(--border)';
            return true;
        };

        let isValid = true;

        if (step === 2) {
            // Info
            isValid = validateInput('companyName', 'El nombre de la empresa es obligatorio') && isValid;

            // Validar RUT (obligatorio)
            const taxId = document.getElementById('companyTaxId');
            if (taxId) {
                if (!taxId.value || taxId.value.trim() === '') {
                    taxId.style.borderColor = 'var(--danger)';
                    this.showToast('El RUT es obligatorio');
                    isValid = false;
                } else if (!this.validateRUT(taxId.value)) {
                    taxId.style.borderColor = 'var(--danger)';
                    this.showToast('El RUT ingresado no es válido');
                    isValid = false;
                } else {
                    taxId.style.borderColor = 'var(--border)';
                }
            }

            // Validar sitio web (opcional, pero si existe debe ser válido)
            const website = document.getElementById('companyWebsite');
            if (website && website.value && website.value.trim() !== '') {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlPattern.test(website.value)) {
                    website.style.borderColor = 'var(--danger)';
                    this.showToast('La URL del sitio web no es válida');
                    return false;
                }
                website.style.borderColor = 'var(--border)';
            }
        }

        if (step === 3) {
            // Size/Sector
            isValid = validateInput('companySize', 'El tamaño de la empresa es obligatorio') && isValid;
            isValid = validateInput('companySector', 'El sector es obligatorio') && isValid;
        }

        if (step === 4) {
            // Location
            isValid = validateInput('companyCountry', 'El país es obligatorio') && isValid;
            isValid = validateInput('companyCity', 'La ciudad es obligatoria') && isValid;
        }

        if (step === 5) {
            // Culture - min 3 max 8
            const cultureCount = document.querySelectorAll('.company-culture-option input:checked').length;
            if (cultureCount < 3) {
                this.showToast('Selecciona al menos 3 valores de cultura');
                return false;
            }
        }

        if (step === 6) {
            const stage = document.querySelector('input[name="companyStage"]:checked');
            if (!stage) {
                this.showToast('Selecciona la etapa de la empresa');
                return false;
            }
        }

        if (step === 7) {
            const workModel = document.querySelector('input[name="workModel"]:checked');
            if (!workModel) {
                this.showToast('Selecciona el modelo de trabajo');
                return false;
            }
        }

        if (step === 8) {
            // Positions - at least 1
            const posCount = document.querySelectorAll('.position-option input:checked').length;
            if (posCount === 0) {
                this.showToast('Selecciona al menos un perfil');
                return false;
            }
        }

        if (step === 9) {
            // Seniority - at least 1
            const seniorityCount = document.querySelectorAll('.seniority-option input:checked').length;
            if (seniorityCount === 0) {
                this.showToast('Selecciona el nivel de seniority');
                return false;
            }
        }

        if (step === 15) {
            // Logo - mandatory
            if (!this.companyLogo) {
                this.showToast('Debes subir el logo de tu empresa');
                return false;
            }
        }

        return isValid;
    },

    toggleSeniority(element) {
        const checkbox = element.querySelector('input');
        checkbox.checked = !checkbox.checked;

        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108, 92, 231, 0.05)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'transparent';
        }

        // Update counter
        const count = document.querySelectorAll('.seniority-option input:checked').length;
        const counterEl = document.getElementById('seniorityCountValue');
        if (counterEl) counterEl.textContent = count;
    },

    nextCompanyStep(step) {
        if (this.validateCompanyStep(step - 1)) {

            // Trigger specific renders for steps
            if (step === 2) {
                // Setup RUT formatting for company
                setTimeout(() => this.setupRUTFormatting(), 100);
            }

            if (step === 3) {
                // Load company sizes and sectors from database
                this.loadCompanySizesAndSectors();
            }

            if (step === 4) {
                // Render countries for Company
                this.renderCountries('companyCountry');
            }

            if (step === 5) {
                // Load culture values from database
                this.loadCompanyCultureValues();
            }

            if (step === 6) {
                // Load company stages from database
                this.loadCompanyStages();
            }

            if (step === 7) {
                // Load work models from database
                this.loadWorkModels();
            }

            if (step === 8) {
                // Load positions from database
                this.loadCompanyPositions();
            }

            if (step === 9) {
                // Load seniority levels from database
                this.loadSeniorityLevels();
            }

            if (step === 10) {
                this.renderCompanyTechStack();
                setTimeout(() => this.renderCompanyTechStack(), 100);
            }
            if (step === 14) { // Renumbered Step 15 (Tags) -> 14
                console.log('Force rendering tags for Step 14');
                try {
                    this.renderCompanyTags();
                } catch (e) { console.error('Error rendering tags:', e); }
                setTimeout(() => this.renderCompanyTags(), 300);
            }
            this.showView(`companyStep${step}`);
        }
    },

    updateCompanyCities() {
        this.updateCities('companyCountry', 'companyCity');
    },

    toggleMultipleLocations() {
        const isRemote = document.getElementById('companyFullyRemote').value;
        const multipleGroup = document.getElementById('multipleLocationsGroup');
        if (multipleGroup) {
            multipleGroup.style.display = isRemote === 'no' ? 'block' : 'none';
        }
    },

    toggleCompanyCulture(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        const allChecked = document.querySelectorAll('.company-culture-option input:checked');
        const count = allChecked.length;

        // If trying to check and already at max
        if (!checkbox.checked && count >= 8) {
            this.showToast('Máximo 8 valores de cultura');
            return;
        }

        // Toggle checkbox
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108,92,231,0.1)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }

        // Update counter
        const newCount = document.querySelectorAll('.company-culture-option input:checked').length;
        document.getElementById('companyCultureCount').textContent = newCount;
    },

    togglePosition(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108,92,231,0.1)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }

        // Update counter
        const count = document.querySelectorAll('.position-option input:checked').length;
        document.getElementById('positionsCount').textContent = count;
    },

    toggleSeniority(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108,92,231,0.1)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }
    },

    addTechStack(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tech = input.value.trim();

            if (!tech) return;

            if (this.companyTechStack.length >= 20) {
                this.showToast('Máximo 20 tecnologías');
                return;
            }

            if (!this.companyTechStack.includes(tech)) {
                this.companyTechStack.push(tech);
                this.renderTechStack();
                input.value = '';
            }
        }
    },

    renderTechStack() {
        const container = document.getElementById('techStackContainer');
        const input = document.getElementById('techStackInput');

        // Clear existing tags
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Render tags
        this.companyTechStack.forEach((tech, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag-item';
            tag.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tag.innerHTML = `
                ${tech}
                <button onclick="app.removeTechStack(${index})" style="background: rgba(255,255,255,0.3); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">×</button>
            `;
            container.insertBefore(tag, input);
        });

        // Update counter
        document.getElementById('techStackCount').textContent = this.companyTechStack.length;

        // Render suggestions once
        if (!this.techSuggestionsRendered) {
            this.renderTechSuggestions();
            this.techSuggestionsRendered = true;
        }
    },

    removeTechStack(index) {
        this.companyTechStack.splice(index, 1);
        this.renderTechStack();
    },

    renderTechSuggestions() {
        const container = document.getElementById('techSuggestions');
        if (!container) return;

        const suggestions = [
            'React', 'Python', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
            'TypeScript', 'Vue', 'Angular', 'Java', 'Go', 'Ruby',
            'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
            'Git', 'Figma', 'Jira', 'Slack', 'Notion', 'Linear',
            'CI/CD', 'Terraform', 'Microservices', 'Agile', 'Scrum', 'TDD'
        ];

        suggestions.forEach(tech => {
            const btn = document.createElement('button');
            btn.textContent = tech;
            btn.style.cssText = 'padding: 8px 14px; background: var(--bg); color: var(--primary); border: 1px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;';
            btn.onmouseover = () => {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
            };
            btn.onmouseout = () => {
                btn.style.background = 'var(--bg)';
                btn.style.color = 'var(--primary)';
            };
            btn.onclick = () => {
                if (this.companyTechStack.length < 20 && !this.companyTechStack.includes(tech)) {
                    this.companyTechStack.push(tech);
                    this.renderTechStack();
                }
            };
            container.appendChild(btn);
        });
    },

    toggleBenefit(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108,92,231,0.1)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }

        // Update counter
        const count = document.querySelectorAll('.benefit-option input:checked').length;
        document.getElementById('benefitsCount').textContent = count;
    },

    updateCharCount(inputId, counterId, maxLength) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);

        if (!input || !counter) return;

        const length = input.value.length;
        counter.textContent = `${length} / ${maxLength}`;

        // Update counter color based on length
        if (length < 100) {
            counter.style.color = 'var(--danger)';
        } else {
            counter.style.color = 'var(--success)';
        }
    },

    addCompanyTag(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tag = input.value.trim();

            if (!tag) return;

            if (this.companyTags.length >= 20) {
                this.showToast('Máximo 20 tags');
                return;
            }

            if (!this.companyTags.includes(tag)) {
                this.companyTags.push(tag);
                this.renderCompanyTags();
                input.value = '';
            }
        }
    },

    renderCompanyTags() {
        const container = document.getElementById('companyTagsContainer');
        const input = document.getElementById('companyTagInput');

        if (!container || !input) return;

        // Clear existing tags
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Render tags
        this.companyTags.forEach((tag, index) => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-item';
            tagEl.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tagEl.innerHTML = `
                ${tag}
                <button onclick="app.removeCompanyTag(${index})" style="background: rgba(255,255,255,0.3); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">×</button>
            `;
            container.insertBefore(tagEl, input);
        });

        // Update counter
        document.getElementById('companyTagsCount').textContent = this.companyTags.length;

        // Always render suggestions to update visibility
        this.renderCompanyTagSuggestions();
    },

    removeCompanyTag(index) {
        this.companyTags.splice(index, 1);
        this.renderCompanyTags();
    },

    // ============================================
    // EDIT SKILLS LOGIC (DYNAMIC)
    // ============================================

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // 1. Populate Areas
        const areaSelect = document.getElementById('editSkillsArea');
        areaSelect.innerHTML = '<option value="">Selecciona un área</option>';

        let areas = this.referenceData?.areas || [];
        if (areas.length === 0) {
            // Fallback to local keys if no DB data
            areas = Object.keys(this.skillsByArea).map(k => ({ id: k, name: k.charAt(0).toUpperCase() + k.slice(1) }));
        }

        areas.forEach(area => {
            const opt = document.createElement('option');
            opt.value = area.id || area.name; // Robust fallback
            opt.textContent = area.name;
            areaSelect.appendChild(opt);
        });

        // 2. Load User's Current Skills
        this.skillsSelected = [...(this.currentUser.skills || [])];
        this.renderSelectedSkillsChips();

        // 3. Clear Bubbles initially
        document.getElementById('editSkillsBubbles').innerHTML = '<div style="color:var(--text-secondary); text-align:center; padding:20px;">Selecciona un área para ver sugerencias</div>';

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    renderSelectedSkillsChips() {
        const container = document.getElementById('editSkillsSelected');
        if (!container) return;

        if (this.skillsSelected.length === 0) {
            container.innerHTML = '<span style="color:var(--text-secondary); font-size:13px;">No tienes habilidades seleccionadas aún.</span>';
            return;
        }

        container.innerHTML = this.skillsSelected.map((skill, index) => `
            <div class="skill-badge" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--primary); color:white; border-radius:16px; font-size:13px;">
                ${skill}
                <span onclick="app.removeSkill(${index})" style="cursor:pointer; font-weight:bold; opacity:0.8; font-size:16px;">&times;</span>
            </div>
        `).join('');
    },

    removeSkill(index) {
        this.skillsSelected.splice(index, 1);
        this.renderSelectedSkillsChips();
        // Also re-render bubbles to uncheck the removed skill if visible
        this.renderEditSkillsBubbles();
    },

    renderEditSkillsBubbles() {
        const areaSelect = document.getElementById('editSkillsArea');
        const container = document.getElementById('editSkillsBubbles');
        const selectedArea = areaSelect.value;

        if (!selectedArea) {
            container.innerHTML = '';
            return;
        }

        // Try to find skills for this area
        // 1. From DB reference if structure supports it (assuming area object might have skills?)
        // 2. From local map 'skillsByArea' (Most reliable right now based on data.js)

        // Match area ID to local key (handle case-sensitivity or exact match)
        // Our local keys: 'desarrollo', 'diseno-ux'. 
        // If DB returns 'UUID' we might need a mapping, but let's assume loose matching for now or 
        // that DB returns readable IDs.

        let skillsForArea = this.skillsByArea[selectedArea] || [];

        // If empty, maybe the area name in DB matches a key?
        if (skillsForArea.length === 0 && this.referenceData.areas) {
            const areaObj = this.referenceData.areas.find(a => a.id == selectedArea);
            if (areaObj && this.skillsByArea[areaObj.name.toLowerCase()]) {
                skillsForArea = this.skillsByArea[areaObj.name.toLowerCase()];
            }
        }

        // Fallback: Default generic skills if none found
        if (!skillsForArea || skillsForArea.length === 0) {
            container.innerHTML = '<div style="padding:10px;">No hay sugerencias para esta área. Escribe abajo para agregar (Próximamente).</div>';
            return;
        }

        container.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:8px; padding:10px;">
            ${skillsForArea.map(skill => {
            const isSelected = this.skillsSelected.includes(skill);
            const bg = isSelected ? 'var(--primary)' : 'var(--bg)';
            const color = isSelected ? 'white' : 'var(--text-primary)';
            const border = isSelected ? 'var(--primary)' : 'var(--border)';

            return `
                <button onclick="app.toggleSkillSelection('${skill}')" 
                    style="padding:8px 16px; border-radius:20px; border:1px solid ${border}; background:${bg}; color:${color}; cursor:pointer; font-size:13px; transition:all 0.2s;">
                    ${skill} ${isSelected ? '✓' : '+'}
                </button>
                `;
        }).join('')}
        </div>`;
    },

    toggleSkillSelection(skill) {
        if (this.skillsSelected.includes(skill)) {
            this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
        } else {
            if (this.skillsSelected.length >= 15) {
                this.showToast('Máximo 15 habilidades');
                return;
            }
            this.skillsSelected.push(skill);
        }
        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles(); // Refresh buttons
    },

    async saveEditSkills() {
        this.currentUser.skills = [...this.skillsSelected];
        this.renderProfile(); // Update UI immediately
        this.closeEditSkills();

        if (window.talentlyBackend && window.talentlyBackend.profiles && window.talentlyBackend.profiles.create) {
            const { error } = await window.talentlyBackend.profiles.create({
                id: this.currentUser.id,
                skills: this.currentUser.skills,
                email: this.currentUser.email // Required for upsert usually
            });

            if (error) {
                console.error('Error saving skills:', error);
                this.showToast('Error al guardar en servidor', 'error');
            } else {
                this.showToast('Habilidades actualizadas');
            }
        } else {
            this.showToast('Habilidades guardadas (Local)');
        }
    },

    renderCompanyTagSuggestions() {
        if (!this.companyTags) this.companyTags = [];
        const categories = {
            companyTypeTags: ['Startup', 'Scale-up', 'Unicornio', 'B-Corp', 'Enterprise', 'Bootstrapped', 'VC-backed'],
            cultureTags: ['Remote-first', 'Fast-paced', 'Feedback culture', 'Ownership', 'Work-life balance', 'Flat hierarchy'],
            focusTags: ['Product-led', 'Data-driven', 'AI-powered', 'Customer-centric', 'Mobile-first'],
            growthTags: ['Career growth', 'Mentorship', 'Training budget', 'Internal mobility'],
            valuesTags: ['Diversity', 'Sustainability', 'Innovation', 'Transparency', 'Social Impact'],
            techTags: ['Agile', 'Scrum', 'CI/CD', 'Cloud-native', 'Microservices']
        };

        Object.keys(categories).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('CRITICAL: Container not found:', containerId);
                return;
            }
            console.log('Found container:', containerId, 'Current children:', container.children.length);
            // Clear container before re-rendering
            container.innerHTML = '';

            categories[containerId].forEach(tag => {
                // Skip if already selected
                if (this.companyTags.includes(tag)) return;

                const btn = document.createElement('button');
                btn.textContent = tag;
                btn.type = 'button'; // Prevent form submission
                btn.className = 'tag-bubble';
                // Explicit high-contrast colors to fix "empty" appearance
                btn.style.cssText = 'padding: 8px 16px; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; user-select: none; margin-bottom: 0;';

                btn.onmouseover = () => {
                    btn.style.backgroundColor = '#e5e7eb';
                    btn.style.color = '#111827';
                };
                btn.onmouseout = () => {
                    btn.style.backgroundColor = '#f3f4f6';
                    btn.style.color = '#1f2937';
                };
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (this.companyTags.length < 20 && !this.companyTags.includes(tag)) {
                        this.companyTags.push(tag);
                        this.renderCompanyTags();
                    }
                };
                container.appendChild(btn);
            });
        });
    },

    handleCompanyLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                this.showToast('El logo debe ser menor a 2MB');
                return;
            }

            // Check file type
            const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                this.showToast('El logo debe ser PNG, JPG o SVG');
                return;
            }

            this.companyLogo = file;
            document.getElementById('logoPreview').style.display = 'block';
            console.log('Logo uploaded:', file.name);
        }
    },

    handleCompanyPhotosUpload(event) {
        const files = event.target.files;
        if (files.length > 5) {
            this.showToast('Máximo 5 fotos');
            return;
        }

        let validFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Check size
            if (file.size > 5 * 1024 * 1024) {
                this.showToast(`${file.name} es muy grande (máx 5MB)`);
                continue;
            }

            // Check type
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                this.showToast(`${file.name} debe ser PNG o JPG`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            this.companyPhotos = validFiles;
            document.getElementById('photosPreview').style.display = 'block';
            document.getElementById('photosCount').textContent = validFiles.length;
            console.log(`${validFiles.length} fotos cargadas`);
        }
    },

    handleCompanyBannerUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('El banner debe ser menor a 5MB');
                return;
            }

            // Check file type
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                this.showToast('El banner debe ser PNG o JPG');
                return;
            }

            this.companyBanner = file;
            document.getElementById('bannerPreview').style.display = 'block';
            console.log('Banner uploaded:', file.name);
        }
    },

    async completeCompanyOnboarding() {
        console.log('🏢 DEBUG: ===== STARTING COMPANY ONBOARDING COMPLETION =====');
        console.log('👤 DEBUG: Current user:', this.currentUser);
        console.log('📋 DEBUG: Profile type:', this.profileType);
        console.log('💾 DEBUG: localStorage user_type:', localStorage.getItem('talently_user_type'));

        // Validate logo is required before proceeding
        if (!this.companyLogo) {
            console.log('❌ DEBUG: Logo validation failed');
            this.showToast('Debes subir el logo de tu empresa');
            return;
        }

        console.log('✅ DEBUG: Logo validation passed');
        try {
            this.showToast('Guardando perfil de empresa...', 'info');

            // Collect Data
            const companyName = document.getElementById('companyName')?.value;
            const companyWebsite = document.getElementById('companyWebsite')?.value;
            const companySize = document.getElementById('companySize')?.value;
            const companySector = document.getElementById('companySector')?.value;
            const companyCountry = document.getElementById('companyCountry')?.value;
            const companyCity = document.getElementById('companyCity')?.value;

            // Culture
            const culture = Array.from(document.querySelectorAll('.company-culture-option input:checked')).map(el => el.value);

            const stage = document.querySelector('input[name="companyStage"]:checked')?.value;
            const workModel = document.querySelector('input[name="workModel"]:checked')?.value;

            // Positions
            const positions = Array.from(document.querySelectorAll('.position-option input:checked')).map(el => el.value);

            // Tech Stack is in this.companyTechStack

            // Handle Logo Upload (if pending)
            let logoUrl = this.companyProfile?.logo;
            if (this.pendingUploads && this.pendingUploads.logo) { // Assuming logo upload logic sets this
                if (window.talentlyBackend && window.talentlyBackend.storage) {
                    try {
                        const uploadedUrl = await window.talentlyBackend.storage.uploadImage(this.pendingUploads.logo, 'logos');
                        if (uploadedUrl) logoUrl = uploadedUrl;
                    } catch (e) {
                        console.error('Logo upload failed', e);
                    }
                }
            }
            // Fallback logo
            if (!logoUrl) {
                logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=random`;
            }

            // Prepare company data for COMPANIES table
            const companyData = {
                name: companyName,
                website: companyWebsite,
                company_size: companySize,
                sector: companySector,
                country: companyCountry,
                city: companyCity,
                company_stage: stage,
                work_model: workModel,
                logo_url: logoUrl,
                // Note: culture, positions, tech_stack, tags will be saved to relational tables later
            };

            // Save to Supabase COMPANIES table
            console.log('💾 DEBUG: Attempting to save to COMPANIES table...');
            console.log('📦 DEBUG: Company data:', companyData);

            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                console.log('✅ DEBUG: Backend ready, calling companies.create...');
                const { data: savedCompany, error } = await window.talentlyBackend.companies.create(companyData);
                if (error) {
                    console.log('❌ DEBUG: Error saving company:', error);
                    throw error;
                }
                console.log('✅ DEBUG: Company saved successfully to COMPANIES table!', savedCompany);

                // Save relational data (culture, positions, tech stack, tags)
                if (savedCompany && savedCompany.id) {
                    console.log('💾 DEBUG: Saving relational data for company ID:', savedCompany.id);

                    // TODO: Save to company_culture_selected, company_positions_looking,
                    // company_tech_stack, company_tags tables
                    // For now, we skip this to get the basic flow working
                }

                // Update local state
                this.currentUser = { ...this.currentUser, ...savedCompany, user_type: 'company' };
                this.companyProfile = savedCompany;
                this.profileType = 'company';
                localStorage.setItem('talently_user_type', 'company');
                localStorage.setItem('talently_logged_in', 'true');
                console.log('✅ DEBUG: Local state updated');
            } else {
                console.warn('⚠️ DEBUG: Backend not ready, saving to localStorage');
                localStorage.setItem('talently_company_profile', JSON.stringify(companyData));
                localStorage.setItem('talently_user_type', 'company');
            }

            this.showView('successView');
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error saving company profile:', error);
            this.showToast('Error al guardar perfil: ' + error.message);
        }
    },

    async completeOnboarding() {
        console.log('Starting completeOnboarding...');
        try {
            this.showToast('Guardando perfil...', 'info'); // UI feedback

            // DEBUG: Log collected data
            console.log('Skills selected:', this.skillsSelected);
            console.log('Interests:', this.interests);

            // 1. Collect Data form DOM
            const experienceLevel = document.querySelector('input[name="experienceLevel"]:checked')?.value || 'junior';
            const educationLink = document.querySelector('input[name="education"]:checked')?.value || 'universitario';
            const workModality = document.querySelector('input[name="workModality"]:checked')?.value || 'remoto';
            const availability = document.querySelector('input[name="availability"]:checked')?.value || 'inmediata';

            // 1b. Handle Image Upload (Real or Fallback)
            // Fix: Use correct name for fallback, not generic 'User'
            const userNameForAvatar = this.currentUser?.name ||
                this.currentUser?.user_metadata?.full_name ||
                'Usuario';

            let imageUrl = this.currentUser?.image;
            if (!imageUrl) {
                imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userNameForAvatar)}&background=random`;
            }

            // Check if we have a pending photo upload
            if (this.pendingUploads && this.pendingUploads.photo) {
                if (window.talentlyBackend && window.talentlyBackend.storage) {
                    try {
                        const uploadedUrl = await window.talentlyBackend.storage.uploadImage(this.pendingUploads.photo);
                        if (uploadedUrl) {
                            imageUrl = uploadedUrl;
                            console.log('Image uploaded successfully:', imageUrl);
                        } else {
                            console.warn('Image upload returned null, using default.');
                        }
                    } catch (uploadErr) {
                        console.error('Image upload failed:', uploadErr);
                        // Continue without failing the whole profile
                    }
                }
            }

            const profileData = {
                onboarding_completed: true,
                // CRITICAL FIX: robust name extraction from metadata (Google) or local state
                name: userNameForAvatar,

                birth_date: document.getElementById('birthDate')?.value,
                gender: document.getElementById('gender')?.value,
                country: document.getElementById('country')?.value,
                city: document.getElementById('city')?.value,
                relocation: document.getElementById('relocation')?.value === 'si',
                experience_years: parseInt(document.getElementById('yearsExperience')?.value || 0),
                expected_salary: parseInt((document.getElementById('expectedSalary')?.value || '0').replace(/\./g, '')),
                currency: document.getElementById('currency')?.value,
                current_position: document.getElementById('currentPosition')?.value || 'Sin cargo',
                professional_area: document.getElementById('professionalArea')?.value,

                // Arrays
                skills: (this.skillsSelected && this.skillsSelected.length > 0) ? this.skillsSelected : [],
                interests: this.interests || [],
                experience_level: experienceLevel,
                education_level: educationLink,
                work_modality: workModality,
                availability: availability,

                user_type: 'candidate', // Explicitly set
                email: this.currentUser?.email, // Ensure email is saved to profile

                // CRITICAL: Include Image
                image: imageUrl,

                languages: [],
                soft_skills: Array.from(document.querySelectorAll('.soft-skill-option input:checked')).map(cb => cb.value),

                // Empty arrays (User can add later)
                experience: [],
                education: [],
                bio: document.getElementById('bioInput')?.value || ''
            };

            console.log('Profile Data prepared:', profileData);

            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                // EXPLICIT CHECK: Only try to save to DB if we have a real authenticated user
                const { data: { session } } = await window.supabaseClient.auth.getSession();

                if (session && session.user) {
                    console.log('Backend ready & Session Active, sending profile to DB...');
                    const { data, error } = await window.talentlyBackend.profiles.create(profileData);

                    if (error) {
                        console.error('Supabase Error:', error);
                        // Enhance error message
                        throw new Error(error.message || error.details || 'Unknown DB Error');
                    }

                    console.log('Profile saved successfully to DB:', data);
                    this.showToast('¡Perfil creado exitosamente!');

                    // Merge returned usage (which might have DB fields)
                    const savedProfile = data || profileData;
                    this.currentUser = { ...this.currentUser, ...savedProfile };
                } else {
                    console.warn('Backend ready but NO SESSION. Saving locally (Demo Mode).');
                    this.currentUser = { ...this.currentUser, ...profileData };
                    this.showToast('Perfil guardado (Modo Demo - Sin Sesión)');
                }

                // Force save to local storage as backup/cache
                localStorage.setItem('talently_current_user', JSON.stringify(this.currentUser));
                this.enterMainApp();
            } else {
                // FALLBACK
                console.warn('Backend not ready, using Mock fallback');
                this.currentUser = { ...this.currentUser, ...profileData };
                localStorage.setItem('talently_profile', JSON.stringify(this.currentUser));
                this.showToast('Perfil guardado (Modo Demo)');
                this.enterMainApp();
            }

        } catch (err) {
            console.error('CRITICAL ONBOARDING ERROR:', err);
            // Alert user but also log to console
            this.showToast('Error al guardar: ' + err.message, 'error');
        }
    },


    // ============================================
    // COMPANY DETAIL MODAL FUNCTIONS
    // ============================================

    openCompanyModal(profileId) {
        const profile = this.profiles.find(p => p.id === profileId) || this.profiles[this.currentIndex];
        if (!profile) return;

        const modalBody = document.getElementById('companyModalBody');
        modalBody.innerHTML = `
            <div class="company-hero">
                <img src="${profile.logo || profile.image}" alt="${profile.name}" class="company-logo-large">
                <h2 class="company-name-large">${profile.name}</h2>
                <p class="company-tagline">${profile.title}</p>
                <div class="company-badges">
                    <span class="company-badge">${profile.sector || 'Tech'}</span>
                    <span class="company-badge">${profile.size || '50-200'}</span>
                    <span class="company-badge">${profile.stage || 'Growth'}</span>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Información General
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Ubicación</div>
                        <div class="detail-value">${profile.location}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Modalidad</div>
                        <div class="detail-value">${profile.workModel || profile.modality}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Salario</div>
                        <div class="detail-value">${profile.salary}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Proceso</div>
                        <div class="detail-value">${profile.hiringProcess || '3-4 semanas'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Beneficios
                </div>
                <div class="benefits-grid">
                    ${(profile.benefits || ['Seguro médico', 'Home office', 'Capacitación']).map(b => `
                        <span class="benefit-tag">? ${b}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Tech Stack
                </div>
                <div class="tech-stack-grid">
                    ${(profile.techStack || ['React', 'Node.js', 'AWS']).map(t => `
                        <span class="tech-tag">${t}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Cultura
                </div>
                <div class="culture-tags">
                    ${(profile.culture || ['Innovación', 'Colaboración', 'Autonomía']).map(c => `
                        <span class="culture-tag">${c}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                    </svg>
                    Descripción
                </div>
                <p class="company-description">${profile.description || 'Empresa líder en su sector, comprometida con el crecimiento profesional de sus colaboradores.'}</p>
            </div>
        `;

        document.getElementById('companyModalOverlay').classList.add('active');
    },

    closeCompanyModal(event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('companyModalOverlay').classList.remove('active');
    },

    // ============================================
    // PREVIEW MODAL (HOW COMPANIES SEE YOU)
    // ============================================

    openPreviewModal() {
        document.getElementById('previewModalOverlay').classList.add('active');
    },

    closePreviewModal() {
        document.getElementById('previewModalOverlay').classList.remove('active');
    },

    // ============================================
    // IMPROVED CHAT WITH READ RECEIPTS
    // ============================================

    handleAttachment() {
        this.showToast('Funcionalidad de adjuntar archivos próximamente');
    },

    // Duplicate sendMessageWithReceipts removed to fix persistence bug.
    // The correct version is defined earlier (line ~950).

    updateReceipt(messageId, status) {
        const receipt = document.getElementById(`receipt-${messageId}`);
        if (!receipt) return;

        receipt.className = `read-receipt ${status}`;

        if (status === 'delivered' || status === 'read') {
            receipt.innerHTML = `
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
        }
    },

    // ============================================
    // PROFILE EDITING
    // ============================================

    editingField: null,

    startEditing(fieldId, currentValue) {
        this.editingField = fieldId;
        const container = document.getElementById(`field-${fieldId}`);
        if (!container) return;

        container.innerHTML = `
            <div class="editable-field">
                <input type="text" class="editable-input" id="input-${fieldId}" value="${currentValue}">
                <div class="edit-actions">
                    <button class="save-btn" onclick="app.saveField('${fieldId}')">Guardar</button>
                    <button class="cancel-btn" onclick="app.cancelEdit('${fieldId}', '${currentValue}')">Cancelar</button>
                </div>
            </div>
        `;

        document.getElementById(`input-${fieldId}`).focus();
    },

    saveField(fieldId) {
        const input = document.getElementById(`input-${fieldId}`);
        const newValue = input.value.trim();

        if (newValue) {
            const container = document.getElementById(`field-${fieldId}`);
            container.innerHTML = `
                <span class="profile-info-value">${newValue}</span>
            `;

            // Show success feedback
            container.style.background = 'rgba(0, 208, 132, 0.1)';
            setTimeout(() => {
                container.style.background = '';
            }, 1000);
        } else {
            this.showToast('El campo no puede estar vacío');
            // Keep editing capability
        }

        this.editingField = null;
    },

    cancelEdit(fieldId, originalValue) {
        const container = document.getElementById(`field-${fieldId}`);
        container.innerHTML = `
            <span class="profile-info-value">${originalValue}</span>
        `;
        this.editingField = null;
    },

    // ============================================
    // STATISTICS
    // ============================================

    userStats: {
        views: [12, 18, 25, 15, 30, 28, 35],
        matches: 24,
        conversations: 18,
        responseRate: 92
    },

    chatTemplates: [
        "Hola, nos interesa tu perfil.",
        "¿Cuándo tienes disponibilidad para una llamada?",
        "Te envío los detalles de la oferta."
    ],

    renderChatSuggestions() {
        const container = document.getElementById('chatSuggestions');
        if (!container) return;

        // Check user type properly
        const type = localStorage.getItem('talently_user_type');
        if (type === 'company' || this.userType === 'company') {
            container.style.display = 'flex';
            container.innerHTML = this.chatTemplates.map(t => `
                <button onclick="app.sendTemplate('${t}')" style="white-space: nowrap; padding: 6px 12px; border: 1px solid var(--primary); color: var(--primary); background: var(--surface); border-radius: 16px; font-size: 13px; cursor: pointer;">
                    ${t}
                </button>
            `).join('');
        } else {
            container.style.display = 'none';
        }
    },

    sendTemplate(text) {
        const input = document.getElementById('chatInput');
        input.value = text;
        this.sendMessageWithReceipts();
    },

    renderStats() {
        // This would be called when entering stats view
        console.log('Stats rendered');
    },

    // ============================================
    // COMPANY DASHBOARD LOGIC
    // ============================================

    companyOffers: [],
    editingOfferId: null,

    completeCompanyOnboarding() {
        this.isAuthenticated = true;
        this.userType = 'company';
        localStorage.setItem('talently_logged_in', 'true');
        localStorage.setItem('talently_user_type', 'company');
        this.showView('companyApp');
        this.showCompanySection('companyOffersSection');
    },

    showCompanySection(sectionId) {
        // Handle shorthand aliases
        if (sectionId === 'offers') sectionId = 'companyOffersSection';
        if (sectionId === 'search') sectionId = 'companySearchSection';
        if (sectionId === 'messages') sectionId = 'companyMessagesSection';
        if (sectionId === 'profile') sectionId = 'companyProfileSection';

        // Force Close Modals/Overlays
        const offerForm = document.getElementById('companyOfferForm');
        if (offerForm) offerForm.style.display = 'none';

        const matchModal = document.getElementById('matchModal');
        if (matchModal) matchModal.style.display = 'none';

        document.querySelectorAll('.company-section').forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
                // Only Flex for Search/Messages potentially, Block for Offers/Profile
                if (sectionId === 'companySearchSection') {
                    section.style.display = 'flex';
                } else if (sectionId === 'companyMessagesSection') {
                    section.style.display = 'flex';
                } else {
                    section.style.display = 'block';
                }
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });

        // Update Nav
        const navItems = document.querySelectorAll('#companyApp .nav-item');
        if (navItems.length > 0) {
            navItems.forEach(item => item.classList.remove('active'));

            if (sectionId === 'companyOffersSection') navItems[0].classList.add('active');
            if (sectionId === 'companySearchSection') navItems[1].classList.add('active');
            if (sectionId === 'companyMessagesSection') navItems[2].classList.add('active');
            if (sectionId === 'companyProfileSection') navItems[3].classList.add('active');
        }

        if (sectionId === 'companyOffersSection') this.renderCompanyOffers();
        if (sectionId === 'companySearchSection') this.initCandidateSwipe();
        if (sectionId === 'companyMessagesSection') this.renderConversationsList();
        if (sectionId === 'companyProfileSection') this.renderCompanyProfile();
    },

    renderCompanyProfile() {
        // Render company profile data
        const companyData = this.companyProfile || this.currentUser || {};

        // Set logo
        const logoEl = document.getElementById('companyProfileLogo');
        if (logoEl && companyData.logo_url) {
            logoEl.src = companyData.logo_url;
        }

        // Set company name
        const nameEl = document.getElementById('companyProfileName');
        if (nameEl) nameEl.textContent = companyData.name || 'Nombre de la Empresa';

        // Set sector
        const sectorEl = document.getElementById('companyProfileSector');
        if (sectorEl) sectorEl.textContent = companyData.sector || 'Sector';

        // Set size
        const sizeEl = document.getElementById('companyProfileSize');
        if (sizeEl) sizeEl.textContent = companyData.company_size || 'Tamaño';

        // Set location
        const locationEl = document.getElementById('companyProfileLocation');
        if (locationEl) locationEl.textContent = `${companyData.city || 'Ciudad'}, ${companyData.country || 'País'}`;

        // Set website
        const websiteEl = document.getElementById('companyProfileWebsite');
        if (websiteEl) {
            if (companyData.website) {
                websiteEl.href = companyData.website;
                websiteEl.textContent = companyData.website;
            } else {
                websiteEl.textContent = '-';
            }
        }

        // Set LinkedIn
        const linkedinEl = document.getElementById('companyProfileLinkedin');
        if (linkedinEl) {
            if (companyData.linkedin_url) {
                linkedinEl.href = companyData.linkedin_url;
                linkedinEl.textContent = 'Ver perfil';
            } else {
                linkedinEl.textContent = '-';
            }
        }

        // Set work model
        const workModelEl = document.getElementById('companyProfileWorkModel');
        if (workModelEl) workModelEl.textContent = companyData.work_model || '-';

        // Set company stage
        const stageEl = document.getElementById('companyProfileStage');
        if (stageEl) stageEl.textContent = companyData.company_stage || '-';

        // Set value proposition
        const valuePropEl = document.getElementById('companyProfileValueProp');
        if (valuePropEl) valuePropEl.textContent = companyData.value_proposition || '-';

        // Render culture values
        const cultureContainer = document.getElementById('companyProfileCulture');
        if (cultureContainer && companyData.culture_values && Array.isArray(companyData.culture_values)) {
            cultureContainer.innerHTML = companyData.culture_values.map(value => `
                <span style="padding: 6px 14px; background: rgba(108, 92, 231, 0.1); color: var(--primary); border-radius: 20px; font-size: 13px; font-weight: 600;">${value}</span>
            `).join('');
        }

        // Render tech stack
        const techContainer = document.getElementById('companyProfileTech');
        if (techContainer && this.companyTechStack && Array.isArray(this.companyTechStack)) {
            techContainer.innerHTML = this.companyTechStack.map(tech => `
                <span style="padding: 6px 14px; background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); border-radius: 20px; font-size: 13px; font-weight: 500;">${tech}</span>
            `).join('');
        }

        // Set stats (placeholder values - would come from database)
        const statsOffers = document.getElementById('companyStatsOffers');
        if (statsOffers) statsOffers.textContent = '0'; // TODO: Get from DB

        const statsMatches = document.getElementById('companyStatsMatches');
        if (statsMatches) statsMatches.textContent = '0'; // TODO: Get from DB

        const statsViews = document.getElementById('companyStatsViews');
        if (statsViews) statsViews.textContent = '0'; // TODO: Get from DB
    },

    openCompanyEditModal() {
        // Pre-fill onboarding with current data and allow editing
        const confirmation = confirm('¿Deseas editar tu perfil de empresa? Esto te llevará al formulario de onboarding con tus datos actuales.');

        if (confirmation) {
            // Navigate back to first step of company onboarding
            this.showView('companyStep1');

            // TODO: Pre-fill all form fields with current company data
            // For now, user can go through the steps again

            this.showToast('Editando perfil de empresa');
        }
    },

    formatCurrency(input) {
        // Strictly remove non-digit characters
        let value = input.value.replace(/\D/g, '');
        if (value) {
            // Check for realistic integer length to avoid overflow or weird formatting
            value = value.substring(0, 15);
            input.value = parseInt(value, 10).toLocaleString('es-CL');
        } else {
            input.value = '';
        }
    },

    createOffer() {
        this.editingOfferId = null; // Reset edit state
        const view = document.getElementById('createOfferView');
        if (view) {
            view.style.display = 'flex';
            // Reset form
            this.clearFormErrors();
            document.getElementById('offerTitle').value = '';
            document.getElementById('offerDescription').value = '';
            document.getElementById('offerProfessionalTitle').value = '';

            const minInput = document.getElementById('offerSalaryMin');
            const maxInput = document.getElementById('offerSalaryMax');
            minInput.value = '';
            maxInput.value = '';
            // Listeners are now inline in HTML for robustness

            document.getElementById('offerSkills').value = '';
            document.getElementById('offerSkillsDisplay').innerHTML = '<span style="color: var(--text-muted);">Seleccionar habilidades...</span>';

            document.getElementById('offerExperience').value = '';
            document.getElementById('offerModality').value = '';
            document.querySelectorAll('input[name="offerSoftSkills"]').forEach(cb => cb.checked = false);
        }
    },

    setupCurrencyInput(input) {
        input.oninput = (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('es-CL');
                e.target.value = value;
            }
        };
    },

    clearFormErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
    },

    cancelCreateOffer() {
        console.log('DEBUG: cancelCreateOffer called');
        try {
            const view = document.getElementById('createOfferView');
            console.log('DEBUG: view element:', view);
            if (view) {
                view.style.setProperty('display', 'none', 'important');
                console.log('DEBUG: view display set to none');
            }
            const skillsModal = document.getElementById('skillsModal');
            if (skillsModal) skillsModal.style.display = 'none';
        } catch (e) {
            console.error('Error closing modal:', e);
        }
    },

    // Skills Modal Logic
    availableSkills: ['React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'TypeScript', 'C#', '.NET', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'Figma', 'UX/UI'],
    selectedSkills: new Set(),

    openSkillsModal() {
        const modal = document.getElementById('skillsModal');
        const grid = document.getElementById('skillsGrid');

        // Load current skills from hidden input
        const current = document.getElementById('offerSkills').value;
        this.selectedSkills = new Set(current ? current.split(',') : []);

        this.renderSkillsGrid(this.availableSkills);
        modal.style.display = 'flex';
    },

    renderSkillsGrid(skills) {
        const grid = document.getElementById('skillsGrid');
        grid.innerHTML = skills.map(skill => `
            <div class="skill-tag ${this.selectedSkills.has(skill) ? 'selected' : ''}" 
                 onclick="app.toggleSkill('${skill}')">
                ${skill}
            </div>
        `).join('');
    },

    filterSkills(query) {
        const filtered = this.availableSkills.filter(s => s.toLowerCase().includes(query.toLowerCase()));
        this.renderSkillsGrid(filtered);
    },

    toggleSkill(skill) {
        if (this.selectedSkills.has(skill)) {
            this.selectedSkills.delete(skill);
        } else {
            this.selectedSkills.add(skill);
        }
        this.filterSkills(document.querySelector('#skillsModal input').value); // Re-render preserving filter
    },

    confirmSkills() {
        const skillsArr = Array.from(this.selectedSkills);
        document.getElementById('offerSkills').value = skillsArr.join(',');

        const display = document.getElementById('offerSkillsDisplay');
        if (skillsArr.length > 0) {
            display.innerHTML = skillsArr.map(s => `
                <span style="background: var(--bg); padding: 4px 12px; border-radius: 12px; font-size: 12px; border: 1px solid var(--border); color: var(--primary); font-weight: 600;">${s}</span>
            `).join('');
        } else {
            display.innerHTML = '<span style="color: var(--text-muted);">Seleccionar habilidades...</span>';
        }

        document.getElementById('skillsModal').style.display = 'none';
    },

    saveOffer() {
        this.clearFormErrors();
        let hasError = false;

        // Fields to validate
        const fields = [
            { id: 'offerTitle', name: 'Título del Cargo' },
            { id: 'offerProfessionalTitle', name: 'Título Profesional' },
            { id: 'offerSalaryMin', name: 'Salario Mínimo' },
            { id: 'offerSalaryMax', name: 'Salario Máximo' },
            { id: 'offerModality', name: 'Modalidad' },
            { id: 'offerExperience', name: 'Experiencia' },
            { id: 'offerDescription', name: 'Descripción' }
        ];

        // 1. Validate Empty Fields
        fields.forEach(field => {
            const el = document.getElementById(field.id);
            if (!el || !el.value.trim()) {
                if (el) el.classList.add('input-error');
                // Target error text by ID
                const errorText = document.getElementById(field.id + 'Error');
                if (errorText) errorText.style.display = 'block';
                hasError = true;
            }
        });

        // Validate Skills
        const skillsVal = document.getElementById('offerSkills').value;
        if (!skillsVal) {
            const display = document.getElementById('offerSkillsDisplay');
            if (display) display.style.border = '1px solid var(--danger)';

            const errorText = document.getElementById('offerSkillsError');
            if (errorText) errorText.style.display = 'block';
            hasError = true;
        } else {
            const display = document.getElementById('offerSkillsDisplay');
            if (display) display.style.border = '';
        }

        if (hasError) {
            this.showToast('Por favor completa todos los campos obligatorios');
            return;
        }

        // 2. Validate Salary Logic
        let minStr = document.getElementById('offerSalaryMin').value.replace(/\./g, '');
        let maxStr = document.getElementById('offerSalaryMax').value.replace(/\./g, '');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);

        if (isNaN(min) || isNaN(max)) {
            document.getElementById('offerSalaryMin').classList.add('input-error');
            document.getElementById('offerSalaryMax').classList.add('input-error');
            this.showToast('El salario debe ser un número válido');
            return;
        }

        if (min > max) {
            document.getElementById('offerSalaryMin').classList.add('input-error');
            document.getElementById('offerSalaryMax').classList.add('input-error');
            document.getElementById('offerSalaryMinError').style.display = 'block';
            document.getElementById('offerSalaryMaxError').style.display = 'block';
            this.showToast('El salario mínimo no puede ser mayor al máximo');
            return;
        }

        // Gather Data
        const title = document.getElementById('offerTitle').value;
        const professionalTitle = document.getElementById('offerProfessionalTitle').value;
        const currency = document.getElementById('offerCurrency').value;
        const description = document.getElementById('offerDescription').value;
        const modality = document.getElementById('offerModality').value;
        const experience = document.getElementById('offerExperience').value;

        const softSkills = Array.from(document.querySelectorAll('input[name="offerSoftSkills"]:checked'))
            .map(cb => cb.value);

        const newOffer = {
            id: this.editingOfferId || Date.now(),
            title: title || 'Sin título',
            professionalTitle: professionalTitle || '',
            salary: `${currency}${min.toLocaleString('es-CL')} - ${max.toLocaleString('es-CL')}`,
            description: description || '',
            modality: modality || 'Remoto',
            experience: experience ? `${experience} años` : 'Sin experiencia',
            skills: skillsVal.split(','),
            softSkills,
            status: 'active',
            candidates: this.editingOfferId ? (this.companyOffers.find(o => o.id === this.editingOfferId)?.candidates || 0) : 0,
            date: new Date().toLocaleDateString()
        };

        if (this.editingOfferId) {
            const index = this.companyOffers.findIndex(o => o.id === this.editingOfferId);
            if (index !== -1) {
                this.companyOffers[index] = newOffer;
                this.showToast('Oferta actualizada exitosamente');
            }
        } else {
            this.companyOffers.unshift(newOffer);
            this.showToast('Oferta publicada exitosamente');
        }

        this.renderCompanyOffers();
        this.cancelCreateOffer();
    },

    renderCompanyOffers() {
        const list = document.getElementById('companyOffersList');
        if (!list) return;

        if (this.companyOffers.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No tienes ofertas activas.</div>';
            return;
        }

        list.innerHTML = this.companyOffers.map(offer => `
            <div class="job-offer-card" style="padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${offer.title}</h3>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">${offer.professionalTitle || 'Sin título especificado'}</div>
                        <div style="font-size: 13px; color: var(--success); font-weight: 500;">Activa • ${offer.candidates} candidatos</div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${offer.modality} • ${offer.salary}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="app.editOffer(${offer.id})" style="padding: 6px 12px; font-size: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; color: var(--primary);">Editar</button>
                        <button onclick="app.deleteOffer(${offer.id})" style="padding: 6px 12px; font-size: 12px; background: #fff0f0; border: 1px solid #ffcccc; border-radius: 6px; cursor: pointer; color: var(--danger);">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Delete Confirmation Logic
    offerToDeleteId: null,

    testConnection: async function () {
        this.showToast('Verificando conexión...');

        // 1. Check Protocol (Common issue with Supabase Auth)
        if (window.location.protocol === 'file:') {
            alert('⚠️ ADVERTENCIA: Estás ejecutando el archivo localmente (file://). Supabase Auth NO funciona en este modo. Debes usar un servidor local (localhost) o subirlo a GitHub Pages para que el Login y guardado de datos funcionen.');
        }

        // 2. Try to get or init client
        let client = window.supabaseClient;
        if (!client && window.talentlyBackend && window.talentlyBackend.isReady) {
            client = window.supabaseClient;
        }

        if (!client) {
            if (window.supabase && window.supabase.createClient && window.talentlyBackend) {
                const ready = window.talentlyBackend.isReady; // Trigger getter
                client = window.supabaseClient;
            }
        }

        if (!client) {
            this.showToast('❌ Error Crítico: Librería Supabase no cargada.');
            return;
        }

        try {
            // Check Auth Service
            // Use the exposed client instance directly
            const client = window.supabaseClient;
            if (!client) throw new Error('Cliente Supabase no inicializado en window.supabaseClient');

            const { data: { session }, error: authError } = await client.auth.getSession();

            // On file:// session is usually null, but no error. 
            if (!session && window.location.protocol === 'file:') {
                this.showToast('⚠️ Conexión OK, pero Auth fallará por protocolo file://');
            } else if (authError) {
                throw new Error('Auth Error: ' + authError.message);
            }

            // Check Database (Profiles)
            const { count, error: dbError } = await client
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (dbError) throw new Error('DB Error: ' + dbError.message);

            this.showToast(`✅ Conexión Exitosa. Registros: ${count || 0}`);
            console.log('Connection Test Success:', { session, count });

        } catch (e) {
            console.error('Connection Test Failed:', e);
            this.showToast(`❌ Error: ${e.message}`);
        }
    },

    deleteOffer(id) {
        this.offerToDeleteId = id;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) {
            modal.style.display = 'flex';
            // Force reflow
            modal.offsetHeight;
            modal.style.opacity = '1';
        }
    },

    closeDeleteModal() {
        this.offerToDeleteId = null;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.style.display = 'none';
    },

    confirmDeleteOffer() {
        if (this.offerToDeleteId) {
            this.companyOffers = this.companyOffers.filter(o => o.id !== this.offerToDeleteId);
            this.renderCompanyOffers();
            this.showToast('Oferta eliminada');
        }
        this.closeDeleteModal();
    },

    editOffer(id) {
        const offer = this.companyOffers.find(o => o.id === id);
        if (!offer) return;

        this.createOffer(); // Open the modal (resets state first)
        this.editingOfferId = id; // Set ID AFTER opening

        // Populate fields
        document.getElementById('offerTitle').value = offer.title;
        document.getElementById('offerProfessionalTitle').value = offer.professionalTitle;
        document.getElementById('offerDescription').value = offer.description;
        document.getElementById('offerModality').value = offer.modality;

        if (offer.experience) {
            const expMatch = offer.experience.match(/(\d+)/);
            if (expMatch) document.getElementById('offerExperience').value = expMatch[0];
        }

        // Salary parsing logic
        if (offer.salary) {
            // Expecting format: "$800.000 - 1.200.000"
            const parts = offer.salary.split('-');
            if (parts.length === 2) {
                const min = parts[0].replace(/[^0-9]/g, '');
                const max = parts[1].replace(/[^0-9]/g, '');
                document.getElementById('offerSalaryMin').value = parseInt(min).toLocaleString('es-CL');
                document.getElementById('offerSalaryMax').value = parseInt(max).toLocaleString('es-CL');
            }
        }

        if (offer.skills) {
            document.getElementById('offerSkills').value = offer.skills.join(',');
            // Re-render skills logic if separate function exists, otherwise skipping visual 'badge' update 
            // relying on internal value
        }

    },

    toggleNotifications() {
        console.log('toggleNotifications called');
        const view = document.getElementById('notificationsView');
        if (!view) {
            console.error('notificationsView not found');
            return;
        }

        // Toggle usando style.transform
        if (view.style.transform === 'translateY(0px)' || view.style.transform === 'translateY(0)') {
            console.log('Notifications open, closing...');
            view.style.transform = 'translateY(100%)';
        } else {
            console.log('Opening notifications, closing others...');
            // Cerrar otros toggles
            this.closeFilters();
            this.closeSettingsModal();

            view.style.transform = 'translateY(0)';
        }
    },

    markNotificationsAsRead() {
        // Clear badges
        document.querySelectorAll('.badge').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.unread-badge').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.conversation-message.unread').forEach(el => el.classList.remove('unread'));

        // Visual feedback for Notifications View (Change background of items)
        const notifView = document.getElementById('notificationsView');
        if (notifView) {
            // Find div children that have the light purple background
            const items = notifView.querySelectorAll('div[style*="background"]');
            items.forEach(item => {
                if (item.style.background.includes('rgba(108,92,231,0.05)')) {
                    item.style.background = 'transparent';
                }
            });
        }

        // Visual feedback
        this.showToast('Notificaciones marcadas como leídas');
    },

    closeNotifications() {
        const view = document.getElementById('notificationsView');
        if (view) {
            view.style.transform = 'translateY(100%)';
        }
    },

    openSettingsModal() {
        console.log('openSettingsModal called');
        const candidateView = document.getElementById('settingsView');
        const companyModal = document.getElementById('settingsModal');
        const type = localStorage.getItem('talently_user_type');
        console.log('User type:', type, 'Profile type:', this.profileType);

        if (type === 'company' || this.profileType === 'company') {
            console.log('Opening company settings...');
            // Company modal toggle
            if (companyModal && companyModal.style.display === 'flex') {
                console.log('Company modal already open, closing...');
                this.closeSettingsModal();
                return;
            }

            // Cerrar otros toggles
            this.closeFilters();
            this.closeNotifications();

            if (companyModal) {
                companyModal.style.display = 'flex';
                companyModal.offsetHeight; // force reflow
                companyModal.style.opacity = '1';
                const inner = companyModal.querySelector('.company-modal');
                if (inner) inner.style.transform = 'translateY(0)';
            } else {
                console.error('settingsModal not found');
            }
        } else {
            console.log('Opening candidate settings...');
            // Candidate toggle usando style.transform
            if (!candidateView) {
                console.error('settingsView not found');
                return;
            }

            if (candidateView.style.transform === 'translateY(0px)' || candidateView.style.transform === 'translateY(0)') {
                console.log('Settings already open, closing...');
                candidateView.style.transform = 'translateY(100%)';
                return;
            }

            // Cerrar otros toggles
            this.closeFilters();
            this.closeNotifications();

            candidateView.style.transform = 'translateY(0)';
        }
    },

    closeSettingsModal() {
        // Cerrar candidate view
        const candidateView = document.getElementById('settingsView');
        if (candidateView) {
            candidateView.style.transform = 'translateY(100%)';
        }

        // Cerrar company modal
        const companyModal = document.getElementById('settingsModal');
        if (companyModal) {
            companyModal.style.display = 'none';
            companyModal.style.opacity = '0';
        }
    },







// Company Profile Logic
companyProfile: {
    name: 'Talently Business',
        industry: 'Tecnología',
            logo: '',
                location: 'Santiago, Chile',
                    description: 'Empresa líder en tecnología e innovación.'
},

handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('cpLogoPreview');
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.display = 'block';
            document.getElementById('cpLogo').value = e.target.result; // Save DataURL
        };
        reader.readAsDataURL(input.files[0]);
    }
},

openCompanyProfile() {
    const modal = document.getElementById('companyProfileModal');
    // Load current data
    document.getElementById('cpName').value = this.companyProfile.name;
    document.getElementById('cpIndustry').value = this.companyProfile.industry;

    // Handle logo preview
    const logoVal = this.companyProfile.logo;
    document.getElementById('cpLogo').value = logoVal;
    const preview = document.getElementById('cpLogoPreview');
    if (logoVal) {
        preview.style.backgroundImage = `url(${logoVal})`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('cpLocation').value = this.companyProfile.location;
    document.getElementById('cpDescription').value = this.companyProfile.description;

    modal.style.setProperty('display', 'flex', 'important');
},

closeCompanyProfile() {
    document.getElementById('companyProfileModal').style.display = 'none';
},

saveCompanyProfile() {
    const name = document.getElementById('cpName').value;
    if (!name) {
        this.showToast('El nombre es obligatorio');
        return;
    }

    this.companyProfile = {
        name: name,
        industry: document.getElementById('cpIndustry').value,
        logo: document.getElementById('cpLogo').value,
        location: document.getElementById('cpLocation').value,
        description: document.getElementById('cpDescription').value
    };

    this.updateCompanyHeader();
    this.closeCompanyProfile();
    this.showToast('Perfil actualizado');
},

updateCompanyHeader() {
    const nameEl = document.getElementById('headerCompanyName');
    const logoEl = document.getElementById('headerCompanyLogo');

    if (nameEl) nameEl.textContent = this.companyProfile.name;
    if (logoEl) {
        const logoUrl = this.companyProfile.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.companyProfile.name)}&background=6c5ce7&color=fff`;
        logoEl.src = logoUrl;
    }
},

renderCompanyTechStack() {
    const container = document.getElementById('companyTechStackBubbleContainer');
    if (!container) return;

    container.innerHTML = '';
    this.companyTechStack.forEach((tech, index) => {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 13px; display: flex; align-items: center; gap: 6px;';
        bubble.innerHTML = `
                ${tech}
                <span onclick="app.removeCompanyTechStack(${index})" style="cursor: pointer; font-weight: bold;">×</span>
            `;
        container.appendChild(bubble);
    });

    // Update Suggestions
    this.renderCompanyTechStackSuggestions();
},

renderCompanyTechStackSuggestions() {
    const container = document.getElementById('companyTechStackSuggestionsContainer');
    if (!container) return;

    container.innerHTML = '';
    const suggestions = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'AWS', 'Docker', 'SQL', 'TypeScript', 'Go', 'Figma', 'Vue.js', 'Angular', 'Kubernetes', 'C#', 'Flutter'];

    suggestions.filter(tech => !this.companyTechStack.includes(tech)).forEach(tech => {
        const btn = document.createElement('button');
        btn.textContent = tech;
        btn.className = 'btn-chip'; // Reuse existing class if available or style directly
        btn.style.cssText = 'padding: 8px 16px; background: var(--surface); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 24px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.03); display: inline-flex; align-items: center; justify-content: center;';

        btn.onmouseover = () => { btn.style.background = 'var(--primary)'; btn.style.color = 'white'; };
        btn.onmouseout = () => { btn.style.background = 'var(--surface)'; btn.style.color = 'var(--text-secondary)'; };

        btn.onclick = () => this.addCompanyTechStackFromSuggestion(tech);
        container.appendChild(btn);
    });
},

addCompanyTechStackFromSuggestion(tech) {
    if (this.companyTechStack.length >= 20) {
        this.showToast('Máximo 20 tecnologías');
        return;
    }
    if (!this.companyTechStack.includes(tech)) {
        this.companyTechStack.push(tech);
        this.renderCompanyTechStack();
    }
},

removeCompanyTechStack(index) {
    this.companyTechStack.splice(index, 1);
    this.renderCompanyTechStack();
},

searchCandidates() {
    const input = document.getElementById('candidateSearchInput');
    const query = input ? input.value.toLowerCase() : '';

    const mockCandidates = [
        { name: 'Ana Silva', role: 'Senior UX Designer', skills: ['Figma', 'UX Research'] },
        { name: 'Carlos Ruiz', role: 'Full Stack Dev', skills: ['React', 'Node.js'] },
        { name: 'Laura M.', role: 'Frontend Developer', skills: ['Vue.js', 'CSS'] },
        { name: 'Pedro J.', role: 'Product Manager', skills: ['Agile', 'Scrum'] }
    ];

    const results = mockCandidates.filter(c =>
        c.role.toLowerCase().includes(query) ||
        c.skills.some(s => s.toLowerCase().includes(query))
    );

    const container = document.getElementById('candidateResults');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; opacity: 0.6;">No se encontraron candidatos.</div>';
        return;
    }

    container.innerHTML = results.map(c => `
             <div class="candidate-card" style="padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; gap: 12px;">
                 <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                    ${c.name.charAt(0)}
                 </div>
                 <div style="flex: 1;">
                     <div style="font-weight: 700; color: var(--text-primary);">${c.name}</div>
                     <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">${c.role}</div>
                     <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${c.skills.map(s => `<span style="font-size: 10px; padding: 2px 6px; background: var(--bg); border-radius: 4px; border: 1px solid var(--border);">${s}</span>`).join('')}
                     </div>
                 </div>
                 <button style="padding: 6px 12px; background: var(--primary); color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Chat</button>
             </div>
        `).join('');
}
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    app.init();

    // Make app globally accessible for debugging
    window.app = app;
    console.log('App initialized and available as window.app');

    // Listener para recargar avatar cuando la página vuelve a ser visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && app.currentUser) {
            console.log('Página visible de nuevo, recargando avatar...');
            app.loadAvatarFromLocalStorage();
        }
    });
});

// ===== CANDIDATE SEARCH LOGIC APPENDED =====
Object.assign(app, {
    // ===== CANDIDATE SWIPE LOGIC =====
    candidatesDeck: [],
    currentCandidateIndex: 0,

    initCandidateSwipe() {
        this.currentCandidateIndex = 0;
        this.renderCandidateCard();
    },

    resetCandidateSwipe() {
        this.currentCandidateIndex = 0;
        document.getElementById('noMoreCandidates').style.display = 'none';
        document.getElementById('candidateSwipeDeck').style.justifyContent = 'center';
        this.renderCandidateCard();
    },

    renderCandidateCard() {
        const deck = document.getElementById('candidateSwipeDeck');
        const candidate = this.candidatesDeck[this.currentCandidateIndex];

        // Clear previous card (except noMore msg)
        const existingCard = document.getElementById('activeCandidateCard');
        if (existingCard) existingCard.remove();

        if (!candidate) {
            document.getElementById('noMoreCandidates').style.display = 'block';
            const controls = document.getElementById('swipeControls');
            if (controls) controls.style.display = 'none';
            return;
        }

        const controls = document.getElementById('swipeControls');
        if (controls) controls.style.display = 'flex';

        const card = document.createElement('div');
        card.id = 'activeCandidateCard';
        card.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow-y: auto; 
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease, opacity 0.3s ease, rotate 0.3s ease;
            transform-origin: bottom center;
        `;

        card.innerHTML = `
            <div style="flex: 1; position: relative; min-height: 100%;">
                <div style="height: 60%; min-height: 350px; background-image: url('${candidate.image}'); background-size: cover; background-position: center; position: relative;">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
                </div>
                
                <div style="padding: 20px 20px 100px; background: white;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <h2 style="color: var(--text-primary); font-size: 24px; font-weight: 700; margin: 0;">${candidate.name}</h2>
                        <span style="background: rgba(0,184,148,0.1); color: var(--success); padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 700;">${candidate.fit}% Match</span>
                    </div>
                    
                    <p style="color: var(--text-secondary); font-size: 16px; margin: 0 0 12px; font-weight: 500;">${candidate.role}</p>

                    <!-- Main Stats Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="background: var(--bg); padding: 10px; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Experiencia</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${candidate.seniority} (${candidate.exp})</div>
                        </div>
                         <div style="background: var(--bg); padding: 10px; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Expectativa Salarial</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${candidate.salary}</div>
                        </div>
                        <div style="background: var(--bg); padding: 10px; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Modalidad</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${candidate.modality}</div>
                        </div>
                         <div style="background: var(--bg); padding: 10px; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Idiomas</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${candidate.languages.join(', ')}</div>
                        </div>
                    </div>
                    
                    <!-- Hard Skills -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px; font-size: 13px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Tech Stack</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${candidate.skills.map(s => `<span style="background: #EEF2FF; color: #4F46E5; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${s}</span>`).join('')}
                        </div>
                    </div>

                     <!-- Soft Skills -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px; font-size: 13px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Superpoderes (Soft Skills)</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${candidate.softSkills.map(s => `<span style="background: #F0FDF4; color: #16A34A; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${s}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Benefits -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px; font-size: 13px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Valora en una empresa</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${candidate.benefits.map(b => `<span style="border: 1px solid var(--border); color: var(--text-secondary); padding: 4px 10px; border-radius: 8px; font-size: 12px;">${b}</span>`).join('')}
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--border); padding-top: 20px;">
                        <h4 style="margin: 0 0 12px; font-size: 14px; color: var(--text-primary); font-weight: 700;">Sobre mí</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 15px;">${candidate.bio}</p>
                    </div>
                </div>
            </div>
        `;

        deck.appendChild(card);
    },

    handleSwipe(direction) {
        const card = document.getElementById('activeCandidateCard');
        if (!card) return;

        const candidate = this.candidatesDeck[this.currentCandidateIndex];

        // Animate Swipe
        if (direction === 'left') {
            card.style.transform = 'translateX(-120%) rotate(-20deg)';
        } else {
            card.style.transform = 'translateX(120%) rotate(20deg)';
            this.handleMatch(candidate);
        }
        card.style.opacity = '0';

        setTimeout(() => {
            this.currentCandidateIndex++;
            this.renderCandidateCard();
        }, 300);
    },

    // ===== CHAT & MATCH LOGIC =====
    companyConversations: [], // Start empty
    activeConversationId: null,
    currentMatchCandidate: null, // For modal

    handleMatch(candidate) {
        this.currentMatchCandidate = candidate;

        // Populate and show Match Modal
        document.getElementById('matchCandidateName').textContent = candidate.name;

        // Fix Image Source - use default if missing
        const candidateImg = candidate.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(candidate.name);
        document.getElementById('matchCandidateImage').src = candidateImg;

        document.getElementById('matchCompanyLogo').src = this.companyProfile.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.companyProfile.name)}&background=6c5ce7&color=fff`;

        const modal = document.getElementById('matchModal');
        modal.style.display = 'flex';

        // Auto-create conversation if not exists
        if (!this.companyConversations.find(c => c.candidateId === candidate.id)) {
            this.companyConversations.unshift({
                id: Date.now(),
                candidateId: candidate.id,
                candidateName: candidate.name,
                candidateImage: candidateImg, // Ensure image is passed
                role: candidate.role,
                lastMessage: '¡Nuevo Match! 🎉',
                timestamp: 'Ahora',
                unread: 0,
                messages: [
                    { text: `Has hecho match con ${candidate.name}. ¡Saluda! 👋`, sender: 'system', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ]
            });
            this.renderConversationsList();
        }
    },

    closeMatchModal() {
        document.getElementById('matchModal').style.display = 'none';
        this.currentMatchCandidate = null;
    },

    startChatFromMatch() {
        if (!this.currentMatchCandidate) return;
        const candidate = this.currentMatchCandidate;
        this.closeMatchModal();

        // Find conversation
        const conv = this.companyConversations.find(c => c.candidateId === candidate.id);
        if (conv) {
            this.showCompanySection('companyMessagesSection'); // Switch tab
            this.openCompanyChat(conv.id);
        }
    },

    createConversationStart(candidate) {
        // Legacy/Placeholder - Redirecting to proper match flow
        this.handleMatch(candidate);
    },

    renderConversationsList() {
        const list = document.getElementById('companyConversationList');
        if (!list) return;

        if (this.companyConversations.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">💬</div>
                    <p>No tienes mensajes aún.</p>
                    <button class="btn-secondary" onclick="app.showCompanySection('companySearchSection')" style="margin-top: 16px;">Ir a Explorar</button>
                </div>
            `;
            return;
        }

        list.innerHTML = this.companyConversations.map(conv => `
            <div onclick="app.openCompanyChat(${conv.id})" 
                style="padding: 16px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'">
                <div style="position: relative;">
                    <img src="${conv.candidateImage}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    ${conv.unread > 0 ? `<div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; background: var(--primary); border: 2px solid white; border-radius: 50%;"></div>` : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 15px;">${conv.candidateName}</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">${conv.timestamp}</span>
                    </div>
                    <div style="font-size: 14px; color: ${conv.unread > 0 ? 'var(--text-primary)' : 'var(--text-secondary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: ${conv.unread > 0 ? '600' : '400'};">
                        ${conv.lastMessage}
                    </div>
                </div>
            </div>
        `).join('');
    },

    openCompanyChat(convId) {
        console.log('Opening chat:', convId);
        const conv = this.companyConversations.find(c => c.id === convId);
        if (!conv) {
            console.error('Conversation not found for id:', convId);
            return;
        }

        this.activeConversationId = convId;
        console.log('Active Conv ID set to:', this.activeConversationId);

        conv.unread = 0; // Mark read
        this.renderConversationsList();

        // Setup Chat View
        const nameEl = document.getElementById('companyChatName');
        const avatarEl = document.getElementById('companyChatAvatar');

        if (nameEl) nameEl.textContent = conv.candidateName;
        if (avatarEl) avatarEl.src = conv.candidateImage;

        document.getElementById('messagesListView').style.display = 'none';
        document.getElementById('messagesChatView').style.display = 'flex';

        this.renderMessages();
    },

    backToConversationsList() {
        this.activeConversationId = null;
        document.getElementById('messagesChatView').style.display = 'none';
        document.getElementById('messagesListView').style.display = 'flex';
        this.renderConversationsList();
    },

    renderMessages() {
        console.log('Rendering messages for IDs:', this.activeConversationId);
        const conv = this.companyConversations.find(c => c.id === this.activeConversationId);
        if (!conv) {
            console.error('No conversation found during render.');
            return;
        }

        const container = document.getElementById('companyChatMessages');
        if (!container) {
            console.error('Chat container not found! Looking for companyChatMessages');
            return;
        }

        console.log('Messages to render:', conv.messages.length);

        container.innerHTML = conv.messages.map(msg => {
            if (msg.sender === 'system') {
                return `<div style="text-align: center; color: var(--text-secondary); font-size: 12px; margin: 10px 0;">${msg.text}</div>`;
            }
            const isMe = msg.sender === 'me';
            return `
                <div style="display: flex; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
                    <div style="max-width: 75%; padding: 10px 16px; border-radius: 18px; font-size: 14px; line-height: 1.4; 
                        ${isMe ? 'background: var(--primary); color: white; border-bottom-right-radius: 4px;' : 'background: #f1f0f0; color: var(--text-primary); border-bottom-left-radius: 4px;'}">
                        ${msg.text}
                        <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: right;">${msg.time}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    },

    sendMessage() {
        const input = document.getElementById('companyChatInput');
        if (!input) {
            console.error('Chat input not found!');
            return;
        }

        const text = input.value.trim();
        console.log('Attempting to send:', text, 'ConvID:', this.activeConversationId);

        if (!text || !this.activeConversationId) {
            console.warn('Send aborted: Missing text or ConvID');
            return;
        }

        const conv = this.companyConversations.find(c => c.id === this.activeConversationId);
        if (!conv) {
            console.error('Send aborted: Conv not found');
            return;
        }

        // User Message
        conv.messages.push({
            text: text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        conv.lastMessage = 'Tú: ' + text;
        conv.timestamp = 'Ahora';

        input.value = '';
        this.renderMessages();
        this.renderConversationsList(); // Update preview

        // Simulate Reply
        setTimeout(() => {
            this.receiveMockReply(this.activeConversationId);
        }, 2000);
    },

    receiveMockReply(convId) {
        const conv = this.companyConversations.find(c => c.id === convId);
        if (!conv) return;

        const replies = [
            "¡Hola! Gracias por conectar. Me interesa mucho la propuesta.",
            "¡Qué bueno hacer match! ¿Podemos agendar una llamada?",
            "Hola, ¿cómo estás? Me gustaría saber más sobre la cultura del equipo.",
            "¡Claro! Cuéntame más sobre el rol.",
            "Gracias por contactarme."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        conv.messages.push({
            text: randomReply,
            sender: 'them',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        conv.lastMessage = randomReply;
        conv.timestamp = 'Ahora';
        conv.unread = (this.activeConversationId !== convId) ? (conv.unread + 1) : 0;

        if (this.activeConversationId === convId) {
            this.renderMessages();
        } else {
            this.showToast(`Nuevo mensaje de ${conv.candidateName}`);
        }
        this.renderConversationsList();
    },

    searchCandidates() {
        const input = document.getElementById('candidateSearchInput');

        // Debug Logger
        // Debug Logger
        const log = (msg) => console.log(`[Search] ${msg}`);

        if (!input) {
            log('ERROR: Input #candidateSearchInput not found!');
            return;
        }

        const query = input.value.trim().toLowerCase();
        log(`Searching for: "${query}"`);

        // FALLBACK DATA (HARDCODED)
        const localData = [
            { id: 1, name: 'Ana García', role: 'Senior React Developer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', skills: ['React', 'TypeScript', 'Redux', 'Node.js'], experience: '5 años', location: 'Santiago', match: 95 },
            { id: 2, name: 'Carlos Rodríguez', role: 'Full Stack Python Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', skills: ['Python', 'Django', 'React', 'AWS', 'Docker'], experience: '4 años', location: 'Remoto', match: 88 },
            { id: 3, name: 'Valentina Martínez', role: 'UX/UI Designer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', skills: ['Figma', 'Prototyping', 'User Research', 'HTML/CSS'], experience: '3 años', location: 'Buenos Aires', match: 92 },
            { id: 4, name: 'Felipe Soto', role: 'Backend Dev (Go)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', skills: ['Go', 'Microservices', 'Kubernetes'], experience: '6 años', location: 'Lima', match: 85 }
        ];

        let candidates = window.mockCandidates || [];
        if (candidates.length === 0) {
            log('WARNING: window.mockCandidates empty. Using fallback data.');
            candidates = localData;
        } else {
            log(`Loaded ${candidates.length} from window data.`);
        }

        // Filter
        let filtered = candidates;
        if (query) {
            filtered = candidates.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.role.toLowerCase().includes(query) ||
                c.skills.some(skill => skill.toLowerCase().includes(query))
            );
        }

        log(`Found ${filtered.length} matches.`);
        this.renderCandidates(filtered);
    },

    renderCandidates(candidates) {
        const container = document.getElementById('candidateResults');
        if (!container) return;

        container.innerHTML = '';

        if (candidates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <p>No se encontraron talentos con esos criterios.</p>
                </div>
            `;
            return;
        }

        candidates.forEach(candidate => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.style.cssText = 'background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: flex-start; gap: 16px; transition: transform 0.2s; cursor: pointer;';
            card.onmouseover = () => card.style.transform = 'translateY(-2px)';
            card.onmouseout = () => card.style.transform = 'translateY(0)';

            // Skills tags HTML
            const skillsHtml = candidate.skills.slice(0, 3).map(skill =>
                `<span style="font-size: 11px; padding: 4px 8px; background: rgba(108,92,231,0.1); color: var(--primary); border-radius: 12px; font-weight: 500;">${skill}</span>`
            ).join('');

            card.innerHTML = `
                <img src="${candidate.image}" alt="${candidate.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${candidate.name}</h3>
                            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${candidate.role}</p>
                        </div>
                        <span style="font-size: 12px; font-weight: 700; color: var(--success); background: rgba(0,184,148,0.1); padding: 4px 8px; border-radius: 6px;">${candidate.match}% Match</span>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        ${skillsHtml}
                        ${candidate.skills.length > 3 ? `<span style="font-size: 11px; color: var(--text-secondary);">+${candidate.skills.length - 3}</span>` : ''}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary);">
                        <span>📍 ${candidate.location}</span>

                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
});

// ===== MESSAGES FEATURE LOGIC REMOVED (Legacy Mock Data causing bugs) =====
// The correct logic is implemented in the main app object above.

// Init search events
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('candidateSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') app.searchCandidates();
        });
    }
});

// Expose app globally for inline HTML handlers
window.app = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app !== 'undefined' && app.init) {
        app.init();
    }
});
