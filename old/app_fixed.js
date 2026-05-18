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
    profiles: [],
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
    referenceData: { countries: [], areas: [], culture_values: [], positions: [], seniority_levels: [], benefits: [], selection_durations: [] }, // Initialize referenceData
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
        // Update Stitch tab buttons
        const tabCv = document.getElementById('tab-cv');
        const tabActivity = document.getElementById('tab-activity');
        if (tabCv) {
            tabCv.style.background = tabName === 'cv' ? '#ffffff' : 'transparent';
            tabCv.style.color = tabName === 'cv' ? '#1e293b' : '#64748b';
            tabCv.style.fontWeight = tabName === 'cv' ? '600' : '500';
            tabCv.style.boxShadow = tabName === 'cv' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none';
        }
        if (tabActivity) {
            tabActivity.style.background = tabName === 'activity' ? '#ffffff' : 'transparent';
            tabActivity.style.color = tabName === 'activity' ? '#1e293b' : '#64748b';
            tabActivity.style.fontWeight = tabName === 'activity' ? '600' : '500';
            tabActivity.style.boxShadow = tabName === 'activity' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none';
        }

        // Show/Hide Content
        const cvContent = document.getElementById('profile-content-cv');
        const activityContent = document.getElementById('profile-content-activity');

        if (tabName === 'cv') {
            if (cvContent) { cvContent.style.display = 'block'; cvContent.style.visibility = 'visible'; }
            if (activityContent) { activityContent.style.display = 'none'; activityContent.style.visibility = 'hidden'; }
        } else {
            if (cvContent) { cvContent.style.display = 'none'; cvContent.style.visibility = 'hidden'; }
            if (activityContent) { activityContent.style.display = 'block'; activityContent.style.visibility = 'visible'; }
            this.renderActivityStats();
        }
    },


    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showToast('Tu navegador no soporta geolocalización', 'error');
            return;
        }

        const input = document.getElementById('filterLocationInput');
        if (input) input.value = 'Obteniendo ubicación...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Mocking connection to a reverse geocoding service
                setTimeout(() => {
                    if (input) input.value = 'Ubicación actual detectada';
                    this.showToast('Ubicación obtenida correctamente');
                }, 1000);
            },
            (error) => {
                if (input) input.value = '';
                this.showToast('No pudimos acceder a tu ubicación', 'error');
                console.warn('Geolocation error:', error);
            }
        );
    },

    async init() {

        // Wait for Supabase
        await this.waitForSupabase();

        // Pre-fetch reference data
        await this.loadReferenceData();

        // Check Dark Mode
        const isDark = localStorage.getItem('talently_dark_mode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark');
        }

        this.checkSession();
        this.setupAuthListener();
    },

    // Función para limpiar completamente el caché y reiniciar la app
    clearCache() {
        // Limpiar localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('talently_') || key.includes('supabase')) {
                localStorage.removeItem(key);
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
            // Load all reference data in parallel
            const [
                { data: countries },
                { data: areas },
                { data: sectors },
                { data: sizes },
                { data: stages },
                { data: workModalities },
                { data: cultureValues },
                { data: positions },
                { data: seniorityLevels },
                { data: benefits },
                { data: selectionDurations }
            ] = await Promise.all([
                window.talentlyBackend.reference.getCountries(),
                window.talentlyBackend.reference.getAreas(),
                window.talentlyBackend.reference.getCompanySectors(),
                window.talentlyBackend.reference.getCompanySizes(),
                window.talentlyBackend.reference.getCompanyStages(),
                window.talentlyBackend.reference.getWorkModalities(),
                window.talentlyBackend.reference.getCompanyCultureValues(),
                window.talentlyBackend.reference.getCompanyPositions(),
                window.talentlyBackend.reference.getSeniorityLevels(),
                window.talentlyBackend.reference.getCompanyBenefits(),
                window.talentlyBackend.reference.getSelectionDurations()
            ]);

            if (countries) this.referenceData.countries = countries;
            if (areas) this.referenceData.areas = areas;
            if (sectors) this.referenceData.sectors = sectors;
            if (sizes) this.referenceData.sizes = sizes;
            if (stages) this.referenceData.stages = stages;
            if (workModalities) this.referenceData.work_modalities = workModalities;
            if (cultureValues) this.referenceData.culture_values = cultureValues;
            if (positions) this.referenceData.positions = positions;
            if (seniorityLevels) this.referenceData.seniority_levels = seniorityLevels;
            if (benefits) this.referenceData.benefits = benefits;
            if (selectionDurations) this.referenceData.selection_durations = selectionDurations;

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

                // Check user type from storage or default
                const savedUserType = localStorage.getItem('talently_user_type');
                let profile = null;

                if (savedUserType === 'company') {
                    const { data: companyData } = await window.talentlyBackend.companies.getById(session.user.id);
                    if (companyData) {
                        profile = { ...companyData, user_type: 'company' };
                    }
                }

                // If not company or not found, try profile
                if (!profile) {
                    const { data: userProfile } = await window.talentlyBackend.profiles.getById(session.user.id);
                    if (userProfile) {
                        profile = userProfile;
                    }
                }

                // CHECK ONBOARDING STATUS
                // If profile exists AND has completed onboarding -> Main App
                // Otherwise -> Onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...this.currentUser, ...profile };
                    // Sync userProfile with DB data (needed for chat alignment)
                    this.userProfile = { ...this.userProfile, ...profile };
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
                    // Ensure no residual mock data
                    this.userProfile = {};
                    if (savedUserType === 'company') {
                        this.showView('companyOnboardingStep1');
                    } else {
                        this.showView('onboardingStep1');
                    }
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
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            // Use the exposed client or factory as fallback (though factory fails auth calls)
            // Fix: Use correct client reference
            const client = window.supabaseClient || window.supabase;
            const { data: { session } } = await client.auth.getSession();

            if (session) {

                // Set basic user
                this.currentUser = session.user;

                // Check localStorage to determine user type
                const savedUserType = localStorage.getItem('talently_user_type');

                let profile = null;
                let userType = null;

                // Try to fetch from COMPANIES table first if user_type is company
                if (savedUserType === 'company') {
                    const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(session.user.id);
                    if (companyData && !companyError) {
                        profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                        userType = 'company';
                        this.profileType = 'company';
                        this.companyProfile = companyData;
                        // SYNC STATE:
                        this.companyTechStack = companyData.tech_stack || [];
                        this.companyTags = companyData.tags || [];
                    } else {
                    }
                }

                // If not found in companies, try PROFILES table
                if (!profile) {
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(session.user.id);
                    if (profileData && !profileError) {
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                    } else {
                    }
                }


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

                        const savedUserType = localStorage.getItem('talently_user_type');

                        // Fetch user profile based on type
                        if (savedUserType === 'company' && window.talentlyBackend?.companies) {
                            window.talentlyBackend.companies.getById(session.user.id).then(({ data: comp }) => {
                                if (comp) {
                                    this.currentUser = { ...this.currentUser, ...comp, user_type: 'company' };
                                    // No need to parse experience for company
                                    if (this.currentView === 'companyApp') {
                                        // Update profile data logic if needed
                                    }
                                }
                            });
                        } else if (window.talentlyBackend && window.talentlyBackend.profiles) {
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

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Handle aliases
        if (viewId === 'companyOnboardingStep1') viewId = 'onboardingStep1';

        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
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
            section.style.display = 'none';
        });

        // Pause video pitch if playing
        const videoPitchPlayer = document.getElementById('videoPitchPlayer');
        if (videoPitchPlayer && !videoPitchPlayer.paused) {
            videoPitchPlayer.pause();
            const btn = document.getElementById('videoPitchPlayBtn');
            const controls = document.getElementById('videoPitchControls');
            if (btn) btn.innerHTML = '<span class="material-icons" style="font-size: 40px;">play_arrow</span>';
            if (controls) controls.style.opacity = '1';
        }

        const activeSection = document.getElementById(sectionId);
        activeSection.classList.add('active');
        // Stitch sections use flex layout
        const flexSections = ['matchesSection', 'settingsSection', 'chatSection'];
        activeSection.style.display = flexSections.includes(sectionId) ? 'flex' : 'block';

        // Update nav (Stitch inline style nav)
        const navMap = {
            'swipeSection': 'navSwipe',
            'matchesSection': 'navMatches',
            'chatSection': 'navChat',
            'settingsSection': 'navProfile',
        };
        const navIds = ['navSwipe', 'navMatches', 'navChat', 'navProfile'];
        navIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const iconDiv = el.querySelector('div');
            const label = el.querySelector('span:last-child');
            if (id === navMap[sectionId]) {
                if (iconDiv) { iconDiv.style.color = '#1392ec'; }
                if (label) { label.style.color = '#1392ec'; label.style.fontWeight = '700'; }
            } else {
                if (iconDiv) { iconDiv.style.color = '#9ca3af'; }
                if (label) { label.style.color = '#9ca3af'; label.style.fontWeight = '500'; }
            }
        });

        // Legacy nav-item support
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const sections = ['swipeSection', 'matchesSection', 'settingsSection'];
        const sectionIndex = sections.indexOf(sectionId);
        if (sectionIndex >= 0) {
            const navItems = document.querySelectorAll('.nav-item');
            if (navItems[sectionIndex]) navItems[sectionIndex].classList.add('active');
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

    async handleForgotPassword() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
            this.showToast('Ingresa tu correo electronico primero', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            this.showToast('Backend no configurado', 'error');
            return;
        }

        try {
            const { error } = await window.talentlyBackend.auth.resetPassword(email);
            if (error) throw error;
            this._recoveryEmail = email;
            this.showView('recoveryView');
            const emailDisplay = document.getElementById('recoveryEmailDisplay');
            if (emailDisplay) emailDisplay.textContent = email;
            // Focus first input
            const firstInput = document.querySelector('.recovery-code-input[data-index="0"]');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
            this.showToast('Se envio un codigo de recuperacion a tu correo');
        } catch (err) {
            this.showToast('Error al enviar el codigo: ' + (err.message || err), 'error');
        }
    },

    handleRecoveryCodeInput(input, index) {
        // Only allow digits
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value && index < 5) {
            const next = document.querySelector(`.recovery-code-input[data-index="${index + 1}"]`);
            if (next) next.focus();
        }
        // Auto-verify when all 6 digits are entered
        const inputs = document.querySelectorAll('.recovery-code-input');
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length === 6) {
            this.verifyRecoveryCode();
        }
    },

    handleRecoveryCodeKeydown(e, index) {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            const prev = document.querySelector(`.recovery-code-input[data-index="${index - 1}"]`);
            if (prev) { prev.focus(); prev.value = ''; }
        }
    },

    async verifyRecoveryCode() {
        const inputs = document.querySelectorAll('.recovery-code-input');
        const code = Array.from(inputs).map(i => i.value).join('');

        if (code.length !== 6) {
            this.showToast('Ingresa los 6 digitos del codigo', 'error');
            return;
        }

        if (!this._recoveryEmail) {
            this.showToast('Error: email de recuperacion no encontrado', 'error');
            return;
        }

        try {
            const { data, error } = await window.talentlyBackend.auth.verifyOtp(this._recoveryEmail, code, 'recovery');
            if (error) throw error;
            this.showToast('Codigo verificado correctamente');
            this.showView('newPasswordView');
        } catch (err) {
            this.showToast('Codigo incorrecto o expirado: ' + (err.message || err), 'error');
            // Clear inputs
            inputs.forEach(i => { i.value = ''; });
            if (inputs[0]) inputs[0].focus();
        }
    },

    async resendRecoveryCode() {
        if (!this._recoveryEmail) {
            this.showToast('Error: no hay email registrado', 'error');
            return;
        }
        try {
            const { error } = await window.talentlyBackend.auth.resetPassword(this._recoveryEmail);
            if (error) throw error;
            this.showToast('Se reenvio el codigo a ' + this._recoveryEmail);
        } catch (err) {
            this.showToast('Error al reenviar: ' + (err.message || err), 'error');
        }
    },

    validateNewPassword() {
        const pw = document.getElementById('newPassword').value;
        const checks = [
            { id: 'npReqLength', pass: pw.length >= 8 },
            { id: 'npReqNumber', pass: /[0-9]/.test(pw) },
            { id: 'npReqUpper', pass: /[A-Z]/.test(pw) },
            { id: 'npReqSpecial', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pw) }
        ];
        checks.forEach(({ id, pass }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const dot = el.querySelector('div');
            const icon = el.querySelector('.material-icons');
            if (pass) {
                if (dot) dot.style.background = '#22C55E';
                if (icon) { icon.textContent = 'check'; icon.style.color = 'white'; icon.style.fontSize = '14px'; }
                el.querySelector('span:last-child').style.color = '#111827';
                el.querySelector('span:last-child').style.fontWeight = '500';
            } else {
                if (dot) dot.style.background = '#E5E7EB';
                if (icon) { icon.textContent = 'circle'; icon.style.color = '#9CA3AF'; icon.style.fontSize = '14px'; }
                el.querySelector('span:last-child').style.color = '#617589';
                el.querySelector('span:last-child').style.fontWeight = '400';
            }
        });
    },

    async handleSetNewPassword() {
        const password = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        if (!password || !confirm) {
            this.showToast('Completa ambos campos', 'error');
            return;
        }
        if (password.length < 8) {
            this.showToast('La contrasena debe tener al menos 8 caracteres', 'error');
            return;
        }
        if (password !== confirm) {
            this.showToast('Las contrasenas no coinciden', 'error');
            return;
        }

        try {
            const { error } = await window.talentlyBackend.auth.updateUser({ password });
            if (error) throw error;
            this.showToast('Contrasena actualizada correctamente');
            this._recoveryEmail = null;
            this.showLogin();
        } catch (err) {
            this.showToast('Error al actualizar: ' + (err.message || err), 'error');
        }
    },

    async handleLogin(e) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';


        if (!email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signIn(email, password);
                if (error) throw error;


                // Try to fetch from both tables
                let profile = null;
                let userType = null;

                // First try COMPANIES table
                const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(data.user.id);
                if (companyData && !companyError) {
                    profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                    userType = 'company';
                    this.profileType = 'company';
                    this.companyProfile = companyData;
                    this.companyTechStack = companyData.tech_stack || [];
                    this.companyTags = companyData.tags || [];
                    localStorage.setItem('talently_user_type', 'company');
                } else {

                    // Try PROFILES table
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(data.user.id);
                    if (profileData && !profileError) {
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                        localStorage.setItem('talently_user_type', userType);
                    } else {
                    }
                }


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

    async enterMainApp() {

        this.isAuthenticated = true;
        this.updateBadge();

        const userType = this.profileType || localStorage.getItem('talently_user_type');
        console.log('[DEBUG] enterMainApp: profileType =', this.profileType, 'localStorage =', localStorage.getItem('talently_user_type'), '→ resolved:', userType);

        // Fetch fresh data if candidate to make sure all fields are populated
        if (userType !== 'company' && window.talentlyBackend && window.talentlyBackend.isReady && this.currentUser?.id) {
            try {
                const { data: fullProfile } = await window.talentlyBackend.profiles.getById(this.currentUser.id);
                if (fullProfile) {
                    this.currentUser = { ...this.currentUser, ...fullProfile };
                }
            } catch (err) {
                console.error("Error pre-fetching fully loaded profile before enterMainApp", err);
            }
        }

        // Route to correct app based on user type
        if (userType === 'company') {
            console.log('[DEBUG] enterMainApp: entering COMPANY flow');
            this.showView('companyApp');
            this.showCompanySection('companyOffersSection');
            this.renderCompanyProfile();
            this.updateCompanyHeader();

            // Subscribe to real-time messages for company notifications (regardless of which tab is open)
            this._subscribeToAllCompanyMatches();
            // Also preload matches to have conversations ready for badge updates
            this._loadCompanyMatches();
        } else {
            console.log('[DEBUG] enterMainApp: entering CANDIDATE flow');
            // Only reset view/section if not already in mainApp
            if (this.currentView !== 'mainApp') {
                this.showView('mainApp');
                this.showAppSection('swipeSection');
            }

            this.loadOffers().then(() => {
                this.renderCard();
            });
            this.setupSwipeGestures();

            // Render Profile already with fresh currentUser data
            this.renderProfile();

            // Preload matches from DB so notifications have data to work with
            this.renderMatches();

            // Subscribe to real-time messages for candidate notifications
            this._subscribeToCandidateMessages();
        }
    },

    appendMessageToUI(text, type) {
        const messagesContainer = document.getElementById('chatMessages') || document.getElementById('companyChatMessages');
        if (!messagesContainer) return;

        let messageHTML = '';
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (type === 'sent') {
            messageHTML = `
            <div style="display: flex; align-items: flex-end; gap: 12px; max-width: 85%; align-self: flex-end;">
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="background: #1392ec; padding: 14px; border-radius: 16px 16px 4px 16px; box-shadow: 0 2px 8px rgba(19,146,236,0.2);">
                        <p style="font-size: 15px; line-height: 1.5; color: #ffffff; font-weight: 500; margin: 0;">${text}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; margin-right: 4px;">
                        <span style="font-size: 10px; color: #868E96;">${timeStr}</span>
                        <span class="material-icons" style="font-size: 14px; color: #1392ec;">done_all</span>
                    </div>
                </div>
            </div>`;
        } else if (type === 'received') {
            messageHTML = `
            <div style="display: flex; align-items: flex-end; gap: 12px; max-width: 85%; align-self: flex-start;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="background: #F1F3F5; padding: 14px; border-radius: 16px 16px 16px 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                        <p style="font-size: 15px; line-height: 1.5; color: #343A40; margin: 0;">${text}</p>
                    </div>
                </div>
            </div>`;
        } else if (type === 'error') {
            messageHTML = `
            <div style="display: flex; justify-content: center; padding: 8px;">
                <span style="font-size: 13px; color: #ef4444; font-weight: 500;">${text}</span>
            </div>`;
        }

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    _blockChatInput(reason) {
        // Block both candidate and company chat inputs
        const inputs = [document.getElementById('chatInput'), document.getElementById('companyChatInput')];
        inputs.forEach(input => {
            if (input) {
                input.disabled = true;
                input.placeholder = reason || 'Chat bloqueado';
                input.style.opacity = '0.5';
            }
        });
        // Disable send buttons
        const sendBtns = document.querySelectorAll('.chat-send-btn, #companySendBtn');
        sendBtns.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            }
        });
        // Show blocked banner
        const containers = [document.getElementById('chatMessages'), document.getElementById('companyChatMessages')];
        containers.forEach(container => {
            if (container) {
                const existingBanner = container.querySelector('.chat-blocked-banner');
                if (!existingBanner) {
                    container.insertAdjacentHTML('beforeend', `
                        <div class="chat-blocked-banner" style="text-align: center; padding: 12px 16px; margin: 8px 0; background: #FFF3E0; border: 1px solid #FFE0B2; border-radius: 12px; color: #E65100; font-size: 13px; font-weight: 500;">
                            🔒 ${reason || 'Chat bloqueado'}
                        </div>
                    `);
                    container.scrollTop = container.scrollHeight;
                }
            }
        });
        this._chatBlocked = true;
    },

    _unblockChatInput() {
        const inputs = [document.getElementById('chatInput'), document.getElementById('companyChatInput')];
        inputs.forEach(input => {
            if (input) {
                input.disabled = false;
                input.placeholder = 'Escribe un mensaje...';
                input.style.opacity = '1';
            }
        });
        const sendBtns = document.querySelectorAll('.chat-send-btn, #companySendBtn');
        sendBtns.forEach(btn => {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });
        this._chatBlocked = false;
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;
        if (!this.currentMatchId) return;
        if (this._chatBlocked) return;

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
        const type = localStorage.getItem('talently_user_type');
        const isCompany = (type === 'company' || this.profileType === 'company');
        const viewId = isCompany ? 'companyFiltersView' : 'filtersView';
        const view = document.getElementById(viewId);
        if (!view) {
            console.error(viewId + ' not found');
            return;
        }

        // Toggle: Si ya está abierto, cerrar
        if (view.style.transform.includes('translateY(0)')) {
            this.closeFilters();
            return;
        }

        // Cerrar otros toggles
        this.closeNotifications();
        this.closeSettingsModal();

        // Abrir filtros
        view.style.transform = 'translateX(-50%) translateY(0)';

        if (isCompany) {
            // Inicializar slider y cargar sugerencias de skills
            this.updateSalarySlider();
            this._loadCompanyFilterSkillSuggestions();
            this._renderFilterSkillTags();
        } else {
            this.loadFilterOptions();
        }
    },

    closeFilters() {
        const view = document.getElementById('filtersView');
        if (view) view.style.transform = 'translateX(-50%) translateY(100%)';
        const companyView = document.getElementById('companyFiltersView');
        if (companyView) companyView.style.transform = 'translateX(-50%) translateY(100%)';
    },

    async loadFilterOptions() {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const chipStyle = "padding: 10px 16px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; font-family: 'Inter', sans-serif; white-space: nowrap;";
        const chipIconStyle = "display: flex; align-items: center; gap: 8px; " + chipStyle;

        // Icon mapping for modalities
        const modalityIcons = { 'remoto': 'home_work', 'hibrido': 'commute', 'presencial': 'apartment', 'remote': 'home_work', 'hybrid': 'commute', 'onsite': 'apartment' };

        // 1. MODALIDAD - Desde BD (with icons)
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
                        const icon = modalityIcons[m.slug] || modalityIcons[m.name?.toLowerCase()] || '';
                        btn.innerHTML = icon ? `<span class="material-icons" style="font-size: 18px;">${icon}</span>${m.name}` : m.name;
                        btn.style.cssText = icon ? chipIconStyle : chipStyle;
                        modalityContainer.appendChild(btn);

                        const savedValues = this.activeFilters['work_modality'] || [];
                        if (savedValues.includes(m.slug)) {
                            this.toggleFilterChip(btn, 'work_modality', m.slug);
                        }
                    });
                }
            } catch (e) {
                console.error('Error loading modalities:', e);
            }
        }

        // Additional filters loaded dynamically
        if (window.talentlyBackend?.reference) {
            // Seniority
            const expGrid = document.getElementById('filterExperienceGrid');
            if (expGrid && typeof window.talentlyBackend.reference.getSeniorityLevels === 'function') {
                window.talentlyBackend.reference.getSeniorityLevels().then(({ data }) => {
                    if (data && data.length) {
                        expGrid.innerHTML = '';
                        data.forEach(lvl => {
                            const btn = document.createElement('button');
                            const expValue = lvl.dbSlug || lvl.slug;
                            btn.className = 'filter-exp-card';
                            btn.onclick = () => this.selectFilterExperience(btn, expValue);
                            btn.style.cssText = `display:flex;flex-direction:column;align-items:center;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;cursor:pointer;font-family:'Inter', sans-serif;`;
                            btn.innerHTML = `<span style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:500;">${lvl.name}</span>`;
                            expGrid.appendChild(btn);

                            const savedValues = this.activeFilters['experience_range'] || [];
                            if (savedValues.includes(expValue)) {
                                // Since selectFilterExperience acts like radio and adds 'selected', only call if it's the saved value
                                this.selectFilterExperience(btn, expValue);
                            }
                        });
                    }
                }).catch(() => { });
            }
            // Job Types
            const jobContainer = document.getElementById('filterJobTypeChips');
            if (jobContainer && window.supabaseClient) {
                window.supabaseClient.from('job_types').select('*').then(({ data }) => {
                    let d = data || [];
                    if (d.length === 0) d = [
                        { name: 'Full-time', slug: 'full-time' }, { name: 'Part-time', slug: 'part-time' },
                        { name: 'Freelance', slug: 'freelance' }
                    ];
                    jobContainer.innerHTML = '';
                    d.forEach(jt => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'job_type', jt.slug);
                        btn.style.cssText = chipStyle;
                        btn.textContent = jt.name;
                        jobContainer.appendChild(btn);

                        const savedValues = this.activeFilters['job_type'] || [];
                        if (savedValues.includes(jt.slug)) {
                            this.toggleFilterChip(btn, 'job_type', jt.slug);
                        }
                    });
                }).catch(() => { });
            }
        }

        // 2. Load Categories
        this.loadFilterCategories();
    },

    handleSalaryTrackClick(e, type) {
        const track = e.currentTarget;
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        const clickedValue = percent * 15000;

        let minEl, maxEl;
        if (type === 'candidate') {
            minEl = document.getElementById('filterSalaryMinRange');
            maxEl = document.getElementById('filterSalaryMaxRange');
        } else {
            minEl = document.getElementById('companyFilterSalaryMin');
            maxEl = document.getElementById('companyFilterSalaryMax');
        }

        if (!minEl || !maxEl) return;
        const minVal = parseInt(minEl.value) || 0;
        const maxVal = parseInt(maxEl.value) || 0;

        // Snap to nearest
        if (Math.abs(clickedValue - minVal) < Math.abs(clickedValue - maxVal)) {
            minEl.value = Math.round(clickedValue / 500) * 500;
            minEl.style.zIndex = '4'; maxEl.style.zIndex = '3';
        } else {
            maxEl.value = Math.round(clickedValue / 500) * 500;
            maxEl.style.zIndex = '4'; minEl.style.zIndex = '3';
        }

        if (type === 'candidate') this.updateCandidateSalarySlider(null, 'track');
        else this.updateSalarySlider();
    },

    async loadFilterCategories() {
        const categoryContainer = document.getElementById('filterCategoryChips');
        if (!categoryContainer || !window.talentlyBackend?.isReady) return;
        const chipStyle = "padding: 10px 16px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; font-family: 'Inter', sans-serif; white-space: nowrap;";

        try {
            const { data: areas } = await window.talentlyBackend.reference.getAreas();
            if (areas && areas.length > 0) {
                categoryContainer.innerHTML = '';
                areas.forEach(area => {
                    const btn = document.createElement('button');
                    btn.className = 'filter-chip';
                    btn.onclick = () => this.toggleFilterChip(btn, 'category', area.id);
                    btn.textContent = area.name;
                    btn.style.cssText = chipStyle;
                    categoryContainer.appendChild(btn);

                    const savedValues = this.activeFilters['category'] || [];
                    if (savedValues.includes(area.id)) {
                        this.toggleFilterChip(btn, 'category', area.id);
                    }
                });
            }
        } catch (e) {
            console.error('Error loading filter categories:', e);
        }
    },

    updateCandidateSalarySlider(el, source) {
        const minRange = document.getElementById('filterSalaryMinRange');
        const maxRange = document.getElementById('filterSalaryMaxRange');
        const minText = document.getElementById('filterSalaryMin');
        const maxText = document.getElementById('filterSalaryMax');
        const fill = document.getElementById('candidateSalaryFill');
        if (!minRange || !maxRange || !minText || !maxText) return;

        let minVal = parseInt(minRange.value) || 0;
        let maxVal = parseInt(maxRange.value) || 0;

        if (source === 'minText') {
            minVal = parseInt(el.value) || 0;
            minRange.value = minVal;
        } else if (source === 'maxText') {
            maxVal = parseInt(el.value) || 0;
            maxRange.value = maxVal;
        } else {
            minText.value = minVal === 0 ? '' : minVal;
            maxText.value = maxVal === 15000 ? '' : maxVal;
        }

        // Prevent crossing
        if (minVal > maxVal && source !== 'maxText') {
            maxVal = minVal;
            maxRange.value = maxVal;
            if (source !== 'maxText') maxText.value = maxVal;
        } else if (minVal > maxVal && source === 'maxText') {
            minVal = maxVal;
            minRange.value = minVal;
            if (source !== 'minText') minText.value = minVal;
        }

        const range = 15000;
        const leftPct = Math.max(0, Math.min(100, (minVal / range) * 100));
        const rightPct = Math.max(0, Math.min(100, ((range - maxVal) / range) * 100));

        if (fill) {
            fill.style.left = `${leftPct}%`;
            fill.style.right = `${rightPct}%`;
        }
    },

    selectFilterExperience(element, value) {
        // Radio-like single select for experience cards
        document.querySelectorAll('#filterExperienceGrid .filter-exp-card').forEach(card => {
            card.classList.remove('selected');
            card.style.background = '#ffffff';
            card.style.color = '#64748b';
            card.style.borderColor = '#e5e7eb';
            const span = card.querySelector('span');
            if (span) span.style.color = '#64748b';
        });

        if (this._selectedFilterExp === value) {
            // Deselect if clicking same
            this._selectedFilterExp = null;
            this.activeFilters.experience_range = [];
        } else {
            element.classList.add('selected');
            element.style.background = 'rgba(19,146,236,0.06)';
            element.style.color = '#1392ec';
            element.style.borderColor = '#1392ec';
            const span = element.querySelector('span');
            if (span) span.style.color = '#1392ec';
            this._selectedFilterExp = value;
            this.activeFilters.experience_range = [value];
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

                    const savedValues = this.activeFilters['city'] || [];
                    if (savedValues.includes(c.id)) {
                        citySelect.value = c.id; // restaura visual
                    }
                });
            }
        } catch (e) {
            console.warn('Error loading cities:', e);
        }
    },

    clearAllFilters() {
        // Reset candidate filter chips (Stitch solid pills)
        document.querySelectorAll('#filtersView .filter-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
            chip.style.background = '#ffffff';
            chip.style.color = '#64748b';
            chip.style.borderColor = '#e5e7eb';
        });

        // Reset candidate experience radio cards
        document.querySelectorAll('#filterExperienceGrid .filter-exp-card').forEach(card => {
            card.classList.remove('selected');
            card.style.background = '#ffffff';
            card.style.color = '#64748b';
            card.style.borderColor = '#e5e7eb';
            const span = card.querySelector('span');
            if (span) span.style.color = '#64748b';
        });
        this._selectedFilterExp = null;

        // Reset candidate salary inputs
        const salaryMin = document.getElementById('filterSalaryMin');
        const salaryMax = document.getElementById('filterSalaryMax');
        if (salaryMin) salaryMin.value = '';
        if (salaryMax) salaryMax.value = '';
        const salaryMinR = document.getElementById('filterSalaryMinRange');
        const salaryMaxR = document.getElementById('filterSalaryMaxRange');
        if (salaryMinR) salaryMinR.value = '0';
        if (salaryMaxR) salaryMaxR.value = '15000';
        if (salaryMinR) this.updateCandidateSalarySlider(salaryMinR, 'min');
        const catSelect = document.getElementById('filterCategory');
        if (catSelect) catSelect.value = '';

        // Reset candidate location input
        const locInput = document.getElementById('filterLocationInput');
        if (locInput) locInput.value = '';

        // Reset COMPANY filter chips (Stitch checkbox pills)
        document.querySelectorAll('#companyFiltersView .filter-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
            chip.style.background = '#ffffff';
            chip.style.color = '#475569';
            chip.style.borderColor = '#e2e8f0';
            const cb = chip.querySelector('.cf-check');
            if (cb) { cb.style.background = '#ffffff'; cb.style.borderColor = '#cbd5e1'; cb.innerHTML = ''; }
        });

        // Reset company salary slider
        const cMin = document.getElementById('companyFilterSalaryMin');
        const cMax = document.getElementById('companyFilterSalaryMax');
        if (cMin) cMin.value = 0;
        if (cMax) cMax.value = 15000;
        this.updateSalarySlider();

        // Reset company location
        const cLocInput = document.getElementById('companyFilterLocation');
        if (cLocInput) cLocInput.value = '';

        // Reset company experience segmented control
        document.querySelectorAll('#companyFilterExperienceSegments .exp-seg').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.boxShadow = 'none';
        });
        this._selectedExpSegment = null;

        // Reset company skill tags
        this._filterSkills = [];
        const skillTags = document.getElementById('companyFilterSkillTags');
        if (skillTags) skillTags.innerHTML = '';
        const skillInput = document.getElementById('companyFilterSkillInput');
        if (skillInput) skillInput.value = '';
        // Re-show all suggestions
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => b.style.display = '');

        // Reset filter state
        this.activeFilters = {};
        this.showToast('Filtros restablecidos');
    },

    /* ===== Company Filters - Salary Dual Range Slider ===== */
    updateSalarySlider() {
        const minEl = document.getElementById('companyFilterSalaryMin');
        const maxEl = document.getElementById('companyFilterSalaryMax');
        const fill = document.getElementById('companySalaryFill');
        const label = document.getElementById('companySalaryRangeLabel');
        if (!minEl || !maxEl) return;

        let minVal = parseInt(minEl.value) || 0;
        let maxVal = parseInt(maxEl.value) || 0;

        // Prevent crossing
        if (minVal > maxVal) {
            maxVal = minVal;
            maxEl.value = maxVal;
        }

        // Update fill bar position
        const range = 15000;
        const leftPct = Math.max(0, Math.min(100, (minVal / range) * 100));
        const rightPct = Math.max(0, Math.min(100, ((range - maxVal) / range) * 100));
        if (fill) {
            fill.style.left = `calc(8px + ${leftPct}%)`;
            fill.style.right = `calc(8px + ${rightPct}%)`;
        }

        // Dynamic z-index for thumb overlapping
        if (minVal > range / 2) {
            minEl.style.zIndex = '4';
            maxEl.style.zIndex = '3';
        } else {
            maxEl.style.zIndex = '4';
            minEl.style.zIndex = '3';
        }

        // Update label
        if (label) {
            const fmtMin = '$' + minVal.toLocaleString('en-US');
            const fmtMax = maxVal >= 15000 ? '$15,000+' : '$' + maxVal.toLocaleString('en-US');
            label.textContent = `${fmtMin} - ${fmtMax}`;
        }
    },

    /* ===== Company Filters - Experience Segmented Control ===== */
    selectExpSegment(el, value) {
        const wasActive = el.classList.contains('active');

        // Deselect all
        document.querySelectorAll('#companyFilterExperienceSegments .exp-seg').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.boxShadow = 'none';
        });

        if (wasActive) {
            // Toggle off
            this._selectedExpSegment = null;
        } else {
            // Activate
            el.classList.add('active');
            el.style.background = '#ffffff';
            el.style.color = '#1392ec';
            el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            this._selectedExpSegment = value;
        }
    },

    /* ===== Company Filters - Skill Tags ===== */
    _filterSkills: [],

    addFilterSkill() {
        const input = document.getElementById('companyFilterSkillInput');
        if (!input) return;
        const val = input.value.trim();
        if (!val || this._filterSkills.includes(val)) { input.value = ''; return; }
        this._filterSkills.push(val);
        input.value = '';
        this._renderFilterSkillTags();
        // Hide matching suggestion
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => {
            if (b.textContent.trim().toLowerCase() === val.toLowerCase()) b.style.display = 'none';
        });
    },

    removeFilterSkill(skill) {
        this._filterSkills = this._filterSkills.filter(s => s !== skill);
        this._renderFilterSkillTags();
        // Re-show matching suggestion
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => {
            if (b.textContent.trim().toLowerCase() === skill.toLowerCase()) b.style.display = '';
        });
    },

    addFilterSkillFromSuggestion(el, name) {
        if (this._filterSkills.includes(name)) return;
        this._filterSkills.push(name);
        el.style.display = 'none';
        this._renderFilterSkillTags();
    },

    _renderFilterSkillTags() {
        const container = document.getElementById('companyFilterSkillTags');
        if (!container) return;
        container.innerHTML = this._filterSkills.map(s => `
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(19,146,236,0.08); color: #1392ec; border-radius: 99px; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;">
                ${s}
                <span onclick="app.removeFilterSkill('${s.replace(/'/g, "\\'")}')" style="cursor: pointer; display: flex; align-items: center;">
                    <span class="material-icons" style="font-size: 14px; color: #1392ec;">close</span>
                </span>
            </span>
        `).join('');
    },

    async _loadCompanyFilterSkillSuggestions() {
        const container = document.getElementById('companyFilterSkillSuggestions');
        if (!container) return;
        const supabase = window.supabaseClient;
        if (!supabase) return;
        try {
            const { data: skills } = await supabase.from('skills').select('id, name').order('name').limit(20);
            if (skills && skills.length > 0) {
                container.innerHTML = '';
                skills.forEach(s => {
                    const btn = document.createElement('button');
                    const skillName = s.name.replace(/'/g, "\\'");
                    btn.onclick = () => this.addFilterSkillFromSuggestion(btn, skillName);
                    btn.style.cssText = "padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 99px; font-size: 12px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; background: #f8fafc; color: #64748b; transition: all 0.15s;";
                    btn.onmouseover = () => { btn.style.borderColor = '#1392ec'; btn.style.color = '#1392ec'; };
                    btn.onmouseout = () => { btn.style.borderColor = '#e2e8f0'; btn.style.color = '#64748b'; };
                    btn.textContent = s.name;
                    container.appendChild(btn);

                    // Restore visual: hide if already selected
                    if (this._filterSkills && this._filterSkills.includes(s.name)) {
                        btn.style.display = 'none';
                    }
                });
            }
        } catch (e) {
            console.warn('Error loading skill suggestions:', e);
        }
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
        // Nota importante de Soporte: Si te da "Bucket not found", necesitas crear el bucket:
        // En Supabase Dashboard -> Storage -> New Bucket -> nombre: "avatars" -> Public: true.
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
                        // The following block was incorrectly placed in the original instruction.
                        // It seems to be intended for the successful upload path, not the error path.
                        // Re-inserting it here would be illogical.
                        // The instruction asked to add logs and comments, but the provided code snippet
                        // was a mix-up. I will add the logs where they make sense in the success path.
                        // For the error path, the current logic of saving as base64 and calling saveProfile/renderProfile is correct.
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
        const statusText = document.getElementById('notifStatusText');
        const isCurrentlyOn = localStorage.getItem('talently_notifications') === 'true';

        if (!isCurrentlyOn) {
            // Turning ON — request permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    localStorage.setItem('talently_notifications', 'true');
                    if (statusText) { statusText.textContent = 'Activado'; statusText.style.color = '#10B981'; }
                    this.showToast('Notificaciones activadas');

                    new Notification('Talently', {
                        body: '¡Notificaciones activadas! Recibirás alertas de matches y mensajes.',
                        icon: 'https://ui-avatars.com/api/?name=T&background=1392ec&color=fff'
                    });
                } else {
                    this.showToast('Permiso de notificaciones denegado por el navegador');
                }
            } else {
                this.showToast('Tu navegador no soporta notificaciones');
            }
        } else {
            // Turning OFF
            localStorage.setItem('talently_notifications', 'false');
            if (statusText) { statusText.textContent = 'Desactivado'; statusText.style.color = '#9CA3AF'; }
            this.showToast('Notificaciones desactivadas');
        }
    },

    initNotificationToggle() {
        const isOn = localStorage.getItem('talently_notifications') === 'true';
        const statusText = document.getElementById('notifStatusText');
        if (!statusText) return;

        if (isOn && 'Notification' in window && Notification.permission === 'granted') {
            statusText.textContent = 'Activado';
            statusText.style.color = '#10B981';
        } else {
            statusText.textContent = 'Desactivado';
            statusText.style.color = '#9CA3AF';
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

    // Video Logic
    async handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) return this.showToast('El video debe ser menor a 50MB');
        try {
            this.showToast('Subiendo video...', 'info');
            const fileName = `${this.state.user.id}_intro.${file.name.split('.').pop()}`;
            const { error } = await window.supabaseClient.storage.from('videos').upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: p } = window.supabaseClient.storage.from('videos').getPublicUrl(fileName);
            const { error: e2 } = await window.supabaseClient.from('profiles').update({ video_url: p.publicUrl }).eq('id', this.state.user.id);
            if (e2) throw e2;
            this.setupVideoPlayer(p.publicUrl);
            this.showToast('Video subido exitosamente', 'success');
        } catch (e) {
            console.error(e); this.showToast('Error al subir video. Asegúrate de configurar Supabase Storage primero.', 'error');
        }
    },
    setupVideoPlayer(url) {
        const v = document.getElementById('candidateVideoPlayer'); const t = document.getElementById('candidateVideoThumbnail');
        if (!v || !url) return; v.src = url; v.classList.remove('hidden'); if (t) t.classList.add('hidden');
        v.addEventListener('timeupdate', () => {
            const p = document.getElementById('videoProgressBar'), td = document.getElementById('videoTimeDisplay');
            if (p) p.style.width = `${(v.currentTime / v.duration) * 100}%`;
            if (td) td.innerText = `${Math.floor(v.currentTime)}s / ${Math.floor(v.duration || 0)}s`;
        });
    },
    toggleVideoPlay() {
        const v = document.getElementById('candidateVideoPlayer'), b = document.getElementById('videoPlayBtn');
        if (!v || !v.src) return this.showToast('Aún no tienes un video.');
        if (v.paused) { v.play(); b.innerHTML = '<span class="material-icons text-5xl">pause</span>'; }
        else { v.pause(); b.innerHTML = '<span class="material-icons text-5xl">play_arrow</span>'; }
    },
    toggleVideoMute() {
        const v = document.getElementById('candidateVideoPlayer'), m = document.getElementById('videoMuteIcon');
        if (v) { v.muted = !v.muted; m.innerText = v.muted ? 'volume_off' : 'volume_up'; }
    },
    seekVideo(e) {
        const v = document.getElementById('candidateVideoPlayer');
        if (v && v.duration) { const r = e.currentTarget.getBoundingClientRect(); v.currentTime = (Math.max(0, Math.min(e.clientX - r.left, r.width)) / r.width) * v.duration; }
    },

    updateBadge() {
        const badge = document.querySelector('.icon-btn .badge');
        const dot = document.getElementById('notifBadgeDot');

        // Count unread matches
        const count = this.matches ? this.matches.filter(m => m.hasUnread).length : 0;
        console.log('[DEBUG] updateBadge: unread count =', count, 'total matches =', (this.matches || []).length);

        if (dot) dot.style.display = count > 0 ? 'block' : 'none';

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update candidate Matches tab badge
        const matchesBadge = document.getElementById('candidateMatchesBadge');
        if (matchesBadge) {
            if (count > 0) {
                matchesBadge.textContent = count > 9 ? '9+' : count;
                matchesBadge.style.display = 'flex';
            } else {
                matchesBadge.style.display = 'none';
            }
        }

        // Also update the list if it's visible or just to be safe
        this.renderNotifications();
    },

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        // Build notifications array from matches + any custom notifications
        const notifications = [];
        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        };

        // Match-based notifications
        (this.matches || []).filter(m => m.matchDate || m.isReal).forEach(match => {
            const type = match.lastMessage ? 'message' : 'match';
            notifications.push({
                id: String(match.id),
                type: type,
                name: match.name || 'Usuario',
                image: match.image || match.avatar || null,
                title: type === 'match' ? '¡Nuevo Match!' : 'Mensaje recibido',
                body: type === 'match'
                    ? `<span style="font-weight:600;color:#333333;">${escapeHtml(match.name || 'Usuario')}</span> le ha gustado tu perfil. ¡Comienza a chatear ahora!`
                    : escapeHtml(match.lastMessage || 'Tienes un nuevo mensaje'),
                date: match.matchDate ? new Date(match.matchDate) : new Date(),
                isUnread: !!match.hasUnread,
                onclick: `app.markSingleNotificationRead('${escapeHtml(String(match.id))}'); app.openChat('${escapeHtml(String(match.id))}', '${escapeHtml(match.name || 'Usuario')}'); app.closeNotifications();`
            });
        });

        // Add custom notifications if stored
        (this.candidateNotifications || []).forEach(n => {
            notifications.push(n);
        });

        // Sort by date descending
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (notifications.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 60px 24px; color: #666666;">
                <span class="material-icons" style="font-size: 48px; color: #E5E7EB; display: block; margin-bottom: 12px;">notifications_none</span>
                <p style="margin: 0; font-size: 14px;">No tienes notificaciones</p>
            </div>`;
            return;
        }

        // Group by date
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const groups = { 'Hoy': [], 'Ayer': [], 'Anteriores': [] };

        notifications.forEach(n => {
            const d = new Date(n.date);
            if (d >= today) groups['Hoy'].push(n);
            else if (d >= yesterday) groups['Ayer'].push(n);
            else groups['Anteriores'].push(n);
        });

        // Type config
        const typeConfig = {
            match: { icon: 'favorite', badgeBg: '#22c55e', badgeColor: '#ffffff' },
            message: { icon: 'chat', badgeBg: '#1392ec', badgeColor: '#ffffff' },
            offer: { icon: 'work', badgeBg: '#8b5cf6', badgeColor: '#ffffff' },
            viewed: { icon: 'mark_email_read', badgeBg: '#6B7280', badgeColor: '#ffffff' },
            security: { icon: 'security', badgeBg: null, badgeColor: '#6B7280' }
        };

        // Relative time
        const relativeTime = (d) => {
            const diff = Math.floor((now - new Date(d)) / 1000);
            if (diff < 60) return 'Ahora';
            if (diff < 3600) return `${Math.floor(diff / 60)}m`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
            return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
        };

        let html = '';
        Object.entries(groups).forEach(([label, items]) => {
            if (items.length === 0) return;
            html += `<div style="padding: 16px 16px 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2 style="font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${label}</h2>
                </div>
            </div>`;

            items.forEach(n => {
                const cfg = typeConfig[n.type] || typeConfig.match;
                const safeName = escapeHtml(n.name || '');
                const imgUrl = n.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=1392ec&color=fff`;
                const isUnread = n.isUnread;
                const cardBg = isUnread ? 'background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.15);' : 'background: #ffffff; border: 1px solid #E5E7EB;';
                const unreadDot = isUnread ? `<div style="width: 10px; height: 10px; border-radius: 50%; background: #1392ec; box-shadow: 0 0 8px rgba(19,146,236,0.4);"></div>` : '';
                const timeColor = isUnread ? 'color: #1392ec; font-weight: 500;' : 'color: #9CA3AF;';

                // Avatar section
                let avatarHtml;
                if (n.type === 'security') {
                    avatarHtml = `<div style="height: 48px; width: 48px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; flex-shrink: 0;">
                        <span class="material-icons" style="font-size: 24px; color: #6B7280;">security</span>
                    </div>`;
                } else {
                    avatarHtml = `<div style="position: relative; flex-shrink: 0;">
                        <div style="height: 48px; width: 48px; border-radius: 50%; background: #E5E7EB center / cover; border: 1px solid #f3f4f6; background-image: url('${imgUrl}');"></div>
                        <div style="position: absolute; bottom: -4px; right: -4px; background: ${cfg.badgeBg}; border-radius: 50%; padding: 2px; border: 2px solid #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="font-size: 10px; color: ${cfg.badgeColor}; display: block;">${cfg.icon}</span>
                        </div>
                    </div>`;
                }

                html += `<div style="margin: 0 12px 8px;">
                    <div onclick="${n.onclick || ''}" style="position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; ${cardBg} cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04);">
                        <div style="position: absolute; top: 16px; right: 16px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 12px; ${timeColor}">${relativeTime(n.date)}</span>
                            ${unreadDot}
                        </div>
                        ${avatarHtml}
                        <div style="flex: 1; padding-right: 48px;">
                            <h3 style="font-size: 16px; font-weight: 700; color: #333333; line-height: 1.3; margin: 0 0 4px;">${escapeHtml(n.title)}</h3>
                            <p style="font-size: 14px; color: #666666; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${n.body}</p>
                        </div>
                    </div>
                </div>`;
            });
        });

        list.innerHTML = html;
    },

    openCardDetail(type, context = 'discovery') {
        const modal = document.getElementById('cardDetailModal');
        if (!modal) return;

        let data;
        if (type === 'self') {
            const profile = this.currentUser;
            if (!profile) return;
            data = {
                id: profile.id,
                name: profile.full_name || profile.name,
                role: profile.current_position || profile.title || profile.role || 'Profesional',
                image: profile.avatar_url || profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.name || 'C')}&background=1392ec&color=fff`,
                seniority: profile.experience_level || 'N/A',
                exp: profile.experience_years || 'N/A',
                salary: profile.expected_salary ? `${profile.currency || '$'} ${profile.expected_salary}` : 'A convenir',
                modality: profile.work_modality || profile.modality || 'Flexible',
                languages: profile.languages || ['Español'],
                skills: profile.skills || [],
                softSkills: profile.soft_skills || [],
                benefits: profile.interests || [],
                bio: profile.bio || profile.description || 'Sin descripción disponible.',
                fit: 100, // Own profile always shows 100% fit dynamically
                location: profile.city || profile.country || 'Sin ubicación',
                education: profile.education_level || 'N/A',
                area: profile.professional_area || 'N/A'
            };
        } else if (type === 'candidate') {
            data = this.candidatesDeck[this.currentCandidateIndex];
            if (!data) return;
        }

        if (type === 'self' || type === 'candidate') {
            // Hero image
            const heroImg = document.getElementById('cdHeroImg');
            const imageUrl = data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1392ec&color=fff&size=600`;
            if (heroImg) heroImg.style.backgroundImage = `url("${imageUrl}")`;

            // Name, role, location
            const nameEl = document.getElementById('cdName');
            const roleEl = document.getElementById('cdRole');
            const locText = document.getElementById('cdLocationText');
            if (nameEl) nameEl.textContent = data.name || 'Candidato';
            if (roleEl) roleEl.textContent = data.role || 'Profesional';
            if (locText) locText.textContent = data.location || 'Sin ubicación';

            // Bio
            const bioEl = document.getElementById('cdBio');
            if (bioEl) bioEl.textContent = data.bio || 'Sin descripción disponible.';

            // Skills
            const skillsEl = document.getElementById('cdSkills');
            if (skillsEl) {
                const allSkills = [...(data.skills || []), ...(data.softSkills || [])];
                skillsEl.innerHTML = allSkills.map((s, i) => {
                    const isSoft = i >= (data.skills || []).length;
                    return isSoft
                        ? `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: rgba(19,146,236,0.08); border: 1px solid rgba(19,146,236,0.2);"><span style="font-size: 13px; font-weight: 700; color: #1392ec;">${s}</span></div>`
                        : `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: #e5e7eb; border: 1px solid #d1d5db;"><span style="font-size: 13px; font-weight: 600; color: #1f2937;">${s}</span></div>`;
                }).join('');
            }

            // Experience timeline
            const expEl = document.getElementById('cdExperience');
            if (expEl) {
                expEl.innerHTML = `
                    <div style="position: relative; margin-bottom: 0;">
                        <div style="position: absolute; left: -25px; top: 0; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 2px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <span class="material-icons" style="font-size: 20px; color: #1392ec;">work</span>
                        </div>
                        <div style="padding-left: 24px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a202c;">${data.role || 'Profesional'}</h3>
                            <p style="margin: 2px 0 0; font-size: 13px; font-weight: 700; color: #1392ec;">${data.area || ''}</p>
                            <p style="margin: 2px 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">${data.seniority || ''} ${data.exp ? '• ' + data.exp + ' años' : ''}</p>
                        </div>
                    </div>
                `;
            }

            // Education
            const eduEl = document.getElementById('cdEducation');
            if (eduEl) {
                eduEl.innerHTML = `
                    <div style="position: relative;">
                        <div style="position: absolute; left: -25px; top: 0; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 2px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="font-size: 18px; color: #1392ec;">school</span>
                        </div>
                        <div style="padding-left: 24px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a202c;">${data.education || 'N/A'}</h3>
                        </div>
                    </div>
                `;
            }

            // Preferences
            const salaryEl = document.getElementById('cdSalary');
            const modalityEl = document.getElementById('cdModality');
            if (salaryEl) salaryEl.textContent = data.salary || 'A convenir';
            if (modalityEl) modalityEl.textContent = data.modality || 'Flexible';

            // Show action buttons for candidates
            const actionBtns = document.getElementById('cdActionButtons');
            const matchActionBtns = document.getElementById('cdMatchActionButtons');
            if (context === 'match') {
                if (actionBtns) actionBtns.style.display = 'none';
                if (matchActionBtns) matchActionBtns.style.display = 'block';
            } else if (type === 'self') {
                // Own profile preview - hide action buttons
                if (actionBtns) actionBtns.style.display = 'none';
                if (matchActionBtns) matchActionBtns.style.display = 'none';
            } else {
                if (actionBtns) actionBtns.style.display = 'flex';
                if (matchActionBtns) matchActionBtns.style.display = 'none';
            }

            // Scroll to top
            const scroll = document.getElementById('cardDetailScroll');
            if (scroll) scroll.scrollTop = 0;
        } else {
            // Offer detail - populate same template with offer data
            data = this.currentProfileData || this.profiles[this.currentIndex];
            if (!data) return;

            const heroImg = document.getElementById('cdHeroImg');
            const imageUrl = data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company || data.name)}&background=1392ec&color=fff&size=600`;
            if (heroImg) heroImg.style.backgroundImage = `url("${imageUrl}")`;

            const nameEl = document.getElementById('cdName');
            const roleEl = document.getElementById('cdRole');
            const locText = document.getElementById('cdLocationText');
            if (nameEl) nameEl.textContent = data.name || 'Oferta';
            if (roleEl) roleEl.textContent = data.company || '';
            if (locText) locText.textContent = data.location || '';

            const bioEl = document.getElementById('cdBio');
            if (bioEl) bioEl.textContent = data.description || 'Sin descripción.';

            const skillsEl = document.getElementById('cdSkills');
            if (skillsEl) {
                skillsEl.innerHTML = (data.skills || []).map(s =>
                    `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: #e5e7eb; border: 1px solid #d1d5db;"><span style="font-size: 13px; font-weight: 600; color: #1f2937;">${s}</span></div>`
                ).join('');
            }

            const expEl = document.getElementById('cdExperience');
            if (expEl) expEl.innerHTML = `<p style="padding-left: 24px; color: #94a3b8; font-size: 13px;">—</p>`;
            const eduEl = document.getElementById('cdEducation');
            if (eduEl) eduEl.innerHTML = `<p style="padding-left: 24px; color: #94a3b8; font-size: 13px;">—</p>`;

            const salaryEl = document.getElementById('cdSalary');
            const modalityEl = document.getElementById('cdModality');
            if (salaryEl) salaryEl.textContent = data.salary || 'Competitivo';
            if (modalityEl) modalityEl.textContent = data.modality || 'Remoto';

            // Hide candidate action buttons for offers
            const actionBtns = document.getElementById('cdActionButtons');
            if (actionBtns) actionBtns.style.display = 'none';

            const scroll = document.getElementById('cardDetailScroll');
            if (scroll) scroll.scrollTop = 0;
        }

        modal.style.display = 'flex';

        // Track profile view
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const targetUserId = type === 'offer' ? data.userId : (data.profileId || data.id);
            if (targetUserId && typeof targetUserId === 'string' && targetUserId.includes('-')) {
                window.talentlyBackend.statistics.incrementForUser(targetUserId, 'profile_views').catch(() => { });
            }
        }
    },

    closeCardDetail() {
        const modal = document.getElementById('cardDetailModal');
        if (modal) modal.style.display = 'none';
    },

    markSingleNotificationRead(matchId) {
        const idx = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
        if (idx !== -1 && this.matches[idx].hasUnread) {
            this.matches[idx].hasUnread = false;
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.updateBadge();
        }
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
        const checkBox = element.querySelector('.cf-check');

        // Visual toggle - Stitch style
        if (isSelected) {
            // Check if inside company filters (checkbox pill style) or candidate filters (solid pill)
            if (checkBox) {
                element.style.background = 'rgba(19,146,236,0.08)';
                element.style.color = '#1392ec';
                element.style.borderColor = '#1392ec';
                checkBox.style.background = '#1392ec';
                checkBox.style.borderColor = '#1392ec';
                checkBox.innerHTML = '<span class="material-icons" style="font-size:12px;color:#fff;line-height:16px;">check</span>';
            } else {
                element.style.background = '#1392ec';
                element.style.color = '#ffffff';
                element.style.borderColor = '#1392ec';
            }
        } else {
            if (checkBox) {
                element.style.background = '#ffffff';
                element.style.color = '#475569';
                element.style.borderColor = '#e2e8f0';
                checkBox.style.background = '#ffffff';
                checkBox.style.borderColor = '#cbd5e1';
                checkBox.innerHTML = '';
            } else {
                element.style.background = '#ffffff';
                element.style.color = '#64748b';
                element.style.borderColor = '#e5e7eb';
            }
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
        // Removed auto-apply when toggling a chip so users can select multiple filters
    },

    updateActiveFiltersDisplay() {
        const container = document.getElementById('activeFilters');
        if (!container) return;
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
        if (this._unfilteredProfiles && this._unfilteredProfiles.length > 0) {
            this.profiles = [...this._unfilteredProfiles];
            this.currentIndex = 0;
        }
        this._unfilteredProfiles = null;
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        this.updateActiveFiltersDisplay();
    },

    applyFilters() {
        const type = localStorage.getItem('talently_user_type');
        const isCompany = (type === 'company' || this.profileType === 'company');

        // 1. Collect filters from UI into this.activeFilters
        const filters = { ...this.activeFilters };

        if (isCompany) {
            const sMin = parseInt(document.getElementById('companyFilterSalaryMin')?.value || '0');
            const sMax = parseInt(document.getElementById('companyFilterSalaryMax')?.value || '15000');
            if (sMin > 0) filters.salaryMin = sMin;
            if (sMax < 15000) filters.salaryMax = sMax;
            const loc = document.getElementById('companyFilterLocation')?.value?.trim();
            if (loc) filters.location = loc;
            if (this._selectedExpSegment) filters.experience = this._selectedExpSegment;
            if (this._filterSkills && this._filterSkills.length > 0) filters.skills = [...this._filterSkills];
        } else {
            const salaryMin = document.getElementById('filterSalaryMin')?.value;
            const salaryMax = document.getElementById('filterSalaryMax')?.value;
            if (salaryMin) filters.salaryMin = parseInt(salaryMin);
            if (salaryMax) filters.salaryMax = parseInt(salaryMax);
            const locationText = document.getElementById('filterLocationInput')?.value?.trim();
            if (locationText) filters.location = locationText;
            if (this._selectedFilterExp) filters.experience = this._selectedFilterExp;

            // Nota: Category es manejado vía array de chips en this.activeFilters['category']
        }
        this.activeFilters = filters;

        // 2. Apply filtering to profile cards (company explore view)
        const active = this.activeFilters;
        if (!this._unfilteredProfiles || this._unfilteredProfiles.length === 0) {
            this._unfilteredProfiles = [...this.profiles];
        }
        let filtered = [...this._unfilteredProfiles];

        if (active.salaryMin) {
            filtered = filtered.filter(p => {
                const min = p.salary_min || (p.salary ? parseInt(String(p.salary).replace(/[^0-9]/g, '')) : 0);
                return min >= active.salaryMin;
            });
        }
        if (active.salaryMax) {
            filtered = filtered.filter(p => {
                const max = p.salary_max || (p.salary ? parseInt(String(p.salary).split('-').pop().replace(/[^0-9]/g, '')) : Infinity);
                return max <= active.salaryMax;
            });
        }
        if (active.modality && active.modality.length > 0) {
            filtered = filtered.filter(p => active.modality.some(m => p.modality && p.modality.includes(m)));
        }
        if (active.modalidad && active.modalidad.length > 0) {
            filtered = filtered.filter(p => active.modalidad.some(m => p.modality && p.modality.includes(m)));
        }
        if (active.location) {
            const loc = active.location.toLowerCase();
            filtered = filtered.filter(p => {
                const city = (p.city || '').toLowerCase();
                const country = (p.country || '').toLowerCase();
                return city.includes(loc) || country.includes(loc);
            });
        }
        if (active.experience) {
            filtered = filtered.filter(p => {
                const yrs = parseInt(p.experience_years || p.years_experience || '0');
                const [lo, hi] = active.experience.includes('+') ? [10, 99] : active.experience.split('-').map(Number);
                return yrs >= lo && yrs <= hi;
            });
        }
        if (active.skills && active.skills.length > 0) {
            filtered = filtered.filter(p => {
                const pSkills = (p.skills || p.techStack || p.tech_stack || []).map(s => s.toLowerCase());
                return active.skills.some(s => pSkills.includes(s.toLowerCase()));
            });
        }
        if (active.sector && active.sector.length > 0) {
            filtered = filtered.filter(p => active.sector.some(s => p.sector && p.sector.includes(s)));
        }
        if (active.techStack && active.techStack.length > 0) {
            filtered = filtered.filter(p => {
                const skills = p.skills || p.techStack || [];
                return active.techStack.some(t => skills.includes(t));
            });
        }
        if (active.category) {
            filtered = filtered.filter(p => {
                const category = p.category || p.area || p.area_id || '';
                return category.toString().toLowerCase() === active.category.toLowerCase();
            });
        }

        // --- NATIVE GEOLOCATION DISTANCE FILTER ---
        if (this.filterDistance && this.filterDistance < 200) {
            // Get current active user/company coordinated
            const sourceLat = this.companyProfile?.latitude || this.currentUser?.latitude;
            const sourceLng = this.companyProfile?.longitude || this.currentUser?.longitude;

            if (sourceLat && sourceLng) {
                filtered = filtered.filter(p => {
                    const targetLat = p.latitude;
                    const targetLng = p.longitude;

                    // Accept candidate if they have no location but we want to filter? 
                    // Usually we drop them if we are filtering explicitly by distance.
                    if (!targetLat || !targetLng) return false;

                    const distKm = this.calculateDistance(sourceLat, sourceLng, targetLat, targetLng);
                    return distKm <= this.filterDistance;
                });
            }
        }
        // ------------------------------------------

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
            this.showToast('No se encontraron perfiles en este radio de búsqueda');
        } else {
            this.renderCard();
            this.showToast(`${this.profiles.length} perfiles encontrados`);
        }

        this.closeFilters();
    },

};

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


// STITCH VIEWS INTEGRATION
Object.assign(app, {
    initStitchViews() {
        // swipe buttons
        const sw = document.getElementById('companySwipeView');
        if (sw) {
            const btns = sw.querySelectorAll('.max-w-md.flex.justify-center.items-center.gap-8 button');
            if (btns.length >= 3) {
                btns[0].onclick = () => app.handleStitchSwipe('left');
                btns[1].onclick = () => app.handleStitchSwipe('superlike');
                btns[2].onclick = () => app.handleStitchSwipe('right');
            }
        }
        // modal buttons
        const dm = document.getElementById('candidateDetailModal');
        if (dm) {
            Array.from(dm.querySelectorAll('button')).forEach(b => {
                if (b.textContent.includes('Rechazar')) {
                    b.onclick = () => { dm.classList.add('hidden'); dm.classList.remove('flex'); app.handleStitchSwipe('left'); };
                }
                if (b.textContent.includes('Me Interesa')) {
                    b.onclick = () => { dm.classList.add('hidden'); dm.classList.remove('flex'); app.handleStitchSwipe('right'); };
                }
            });
        }
        // overlay buttons
        const ov = document.getElementById('matchSuccessOverlay');
        if (ov) {
            const ovb = Array.from(ov.querySelectorAll('button'));
            const cbd = ovb.find(b => b.innerHTML.includes('close'));
            const mbd = ovb.find(b => b.textContent.includes('Enviar mensaje'));
            const ebd = ovb.find(b => b.textContent.includes('Seguir explorando'));

            if (cbd) cbd.onclick = () => ov.style.display = 'none';
            if (ebd) ebd.onclick = () => ov.style.display = 'none';
            if (mbd) mbd.onclick = () => {
                ov.style.display = 'none';
                app.showAppSection('chatSection');
            };
        }
    },
    async handleStitchSwipe(dir) {
        if (!window.talentlyBackend || !window.talentlyBackend.swipes) return;
        const mockId = 'd8fbc2e0-0b61-420a-8a18-d73df4b9e28f';
        try {
            const { error, isMutualMatch } = await window.talentlyBackend.swipes.create(mockId, dir);

            // Visual fade out
            const cards = document.querySelectorAll('#companySwipeView .card-item');
            const vc = Array.from(cards).filter(c => c.style.display !== 'none' && c.style.opacity !== '0');
            if (vc.length > 0) {
                vc[0].style.transform = dir === 'left' ? 'translateX(-100vw) rotate(-20deg)' : 'translateX(100vw) rotate(20deg)';
                vc[0].style.opacity = '0';
                setTimeout(() => vc[0].style.display = 'none', 300);
            }

            if (dir === 'right' || dir === 'superlike') {
                const match = Math.random() > 0.5;
                if (match || isMutualMatch) {
                    setTimeout(() => app.showMatchSuccessOverlay(mockId), 500);
                }
            }
        } catch (e) {
            console.error(e);
        }
    },
    showMatchSuccessOverlay(id) {
        const ov = document.getElementById('matchSuccessOverlay');
        if (ov) ov.style.display = 'flex';
    },
    showCompanySwipe() {
        app.showView('companySwipeView');
        app.initStitchViews();
    },

    // ============================================
    // GEOLOCALIZACION Y DISTANCIA (NUEVO)
    // ============================================

    filterDistance: 200,

    updateDistanceFilter(value) {
        this.filterDistance = parseInt(value, 10);
        const display = document.getElementById('distanceFilterValue');
        if (display) {
            display.textContent = this.filterDistance >= 200 ? 'Cualquiera' : `Hasta ${this.filterDistance} km`;
        }

        // Mostrar advertencia si la empresa no tiene ubicación configurada y usa el filtro
        const warning = document.getElementById('distanceFilterWarning');
        if (warning && this.currentUser) {
            const hasLocation = this.currentUser.latitude || this.companyProfile?.latitude;
            warning.style.display = (!hasLocation && this.filterDistance < 200) ? 'block' : 'none';
        }

        // Re-aplicar filtros automáticamente si estamos en la vista de Explorar
        if (typeof this.applyFilters === 'function') {
            this.applyFilters();
        }
    },

    requestDeviceLocation(type = 'candidate') {
        const statusEl = document.getElementById(type === 'company' ? 'cpGeoStatus' : 'userGeoStatus');

        if (!navigator.geolocation) {
            this.showToast('La geolocalización no es soportada por este navegador.', 'error');
            if (statusEl) statusEl.textContent = 'Error: Navegador no soportado';
            return;
        }

        if (statusEl) statusEl.textContent = 'Solicitando permisos...';
        this.showToast('Permite el acceso a tu ubicación...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (statusEl) {
                    statusEl.innerHTML = `<span style="color: #059669;">Guardada (${lat.toFixed(4)}, ${lng.toFixed(4)})</span>`;
                }

                // Inyectar en campos ocultos si es empresa
                if (type === 'company') {
                    const latHidden = document.getElementById('cpLatitude');
                    const lngHidden = document.getElementById('cpLongitude');
                    if (latHidden) latHidden.value = lat;
                    if (lngHidden) lngHidden.value = lng;
                }

                this.showToast('🌍 Ubicación capturada exitosamente', 'success');

                // Si el usuario actual está logueado, guardarlo en la DB de Supabase
                if (this.currentUser && this.currentUser.id && window.supabaseClient) {
                    try {
                        const table = type === 'company' ? 'companies' : 'profiles';
                        const idToUpdate = type === 'company' ? (this.companyProfile?.id || this.currentUser.id) : this.currentUser.id;

                        const { error } = await window.supabaseClient
                            .from(table)
                            .update({ latitude: lat, longitude: lng })
                            .eq('id', idToUpdate);

                        if (!error) {
                            this.currentUser.latitude = lat;
                            this.currentUser.longitude = lng;
                            if (this.companyProfile) {
                                this.companyProfile.latitude = lat;
                                this.companyProfile.longitude = lng;
                            }
                        }
                    } catch (e) {
                        console.error('Error guardando loc:', e);
                    }
                }
            },
            (error) => {
                console.error('Geolocation Error:', error);
                let msg = 'Error obteniendo ubicación';
                if (error.code === 1) msg = 'Permiso de ubicación denegado';
                if (statusEl) statusEl.innerHTML = `<span style="color: #ef4444;">${msg}</span>`;
                this.showToast(msg, 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en km
    },

    // ==========================================
    // NOTIFICATIONS & SETTINGS MODAL
    // ==========================================
    async openSettingsModal() {
        if (!this.currentUser || !this.currentUser.id) {
            this.showToast('Debes iniciar sesión para configurar tus alertas', 'error');
            return;
        }

        const modal = document.getElementById('settingsFullScreen');
        if (!modal) return;

        // Default state fallback
        this.currentSettings = {
            match_alerts: false,
            message_alerts: false,
            marketing_alerts: false
        };

        // Fetch user settings from Supabase
        try {
            const { data, error } = await window.supabaseClient
                .from('user_settings')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
                console.error('Error fetching settings:', error);
                this.showToast('No se pudieron cargar tus preferencias. Usando por defecto.', 'error');
            }

            if (data) {
                this.currentSettings.match_alerts = data.match_alerts || false;
                this.currentSettings.message_alerts = data.message_alerts || false;
                this.currentSettings.marketing_alerts = data.marketing_alerts || false;
            }
        } catch (err) {
            console.error('Exception fetching settings:', err);
        }

        // Set visual state of toggles
        const matchToggle = document.getElementById('matchToggle');
        const messageToggle = document.getElementById('messageToggle');
        const marketingToggle = document.getElementById('marketingToggle');

        if (matchToggle) matchToggle.checked = this.currentSettings.match_alerts;
        if (messageToggle) messageToggle.checked = this.currentSettings.message_alerts;
        if (marketingToggle) marketingToggle.checked = this.currentSettings.marketing_alerts;

        const dmToggle = document.getElementById('settingsDarkModeToggle');
        if (dmToggle) {
            dmToggle.checked = document.body.classList.contains('dark-mode');
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

});
setTimeout(() => { if (typeof app !== 'undefined' && app.initStitchViews) app.initStitchViews(); }, 500);
