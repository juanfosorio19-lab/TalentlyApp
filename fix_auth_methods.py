import re

app_js_path = 'js/app.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define revisions
# 1. Login -> handleLogin
login_pattern = r'async login\(\)\s*\{'
login_replacement = '''async handleLogin(e) {
        if (e) e.preventDefault();
        
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('loginPassword'); // Matches HTML ID

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        // Real Backend Login
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signIn(email, password);
                if (error) throw error;
                
                this.showToast('¡Bienvenido de nuevo!');
                this.enterMainApp();
            } catch (err) {
                console.error('Login Error:', err);
                this.showToast('Error al iniciar sesión: ' + err.message, 'error');
            }
            return;
        }

        // LEGACY MOCK LOGIN (Fallback)
        console.warn('Using Mock Login (Backend not ready)');
        if (email.includes('@') && password.length > 5) {
            this.currentUser = { name: 'Demo User', email };
            localStorage.setItem('talently_logged_in', 'true');
            this.showToast('¡Bienvenido de nuevo! (Demo)');
            this.enterMainApp();
        } else {
            this.showToast('Credenciales incorrectas (Demo)', 'error');
        }
    },

    // OLD LOGIN WAS HERE (REPLACED)
    _unused_login() {'''

# We need to be careful. The regex finds the start. We need to replace the WHOLE function.
# But capturing the whole function with regex in JS is hard (nested braces).
# Instead, since we know the structure from previous `view_file` (lines 333-370), we can validly assume
# it ends before `async signup() {` or `loginWithGoogle() {` ?
# Actually, looking at the file:
# 370:     },
# 371: 
# 372:     async signup() {

# So we can replace from `async login() {` up to `async signup() {` exclusive.

# Construct regex to capture everything between login and signup
full_pattern = r'async login\(\)\s*\{(.*?)async signup\(\)'
# DOTALL to match newlines
match = re.search(full_pattern, content, re.DOTALL)

if match:
    print("Found login block.")
    # The replacement logic needs to be cleaner.
    # We will replace the found block with the new login code + "async handleRegisterClick(e) {" 
    # effectively modifying both.
    
    new_code = '''async handleLogin(e) {
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
                this.showToast('¡Bienvenido de nuevo!');
                this.enterMainApp();
            } catch (err) {
                console.error('Login Error:', err);
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
        if(e) e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signUp(email, password);
                if (error) throw error;
                this.showToast('Cuenta creada exitosamente');
                this.showView('onboardingStep1');
            } catch (err) {
                console.error('Signup Error:', err);
                this.showToast('Error al registrarse: ' + err.message, 'error');
            }
            return;
        }

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

    _unused_signup() {
        // Placeholder to absorb the rest of the old signup function if any remains
        return; 
    },
    
    // Continue with next function
    loginWithGoogle()'''
    
    # We need to find where `signup()` ends to properly stitch.
    # `signup` ends around line 417, followed by `loginWithGoogle`.
    # Let's search for `loginWithGoogle` to anchor the end.
    
    anchor_pattern = r'async login\(\)\s*\{.*loginWithGoogle\(\)'
    # This captures everything from login start to loginWithGoogle start
    
    # Let's use string split/join strategy which is safer if we have unique anchors.
    # Anchor 1: `async login() {`
    # Anchor 2: `loginWithGoogle() {`
    
    parts = content.split('async login() {')
    if len(parts) < 2:
        print("Could not find start anchor")
        exit(1)
        
    pre_login = parts[0]
    rest = parts[1]
    
    parts2 = rest.split('loginWithGoogle() {')
    if len(parts2) < 2:
        print("Could not find end anchor")
        exit(1)
        
    post_signup = parts2[1]
    
    # Now valid_code = pre_login + NEW_CODE + 'loginWithGoogle() {' + post_signup
    
    # Note: `loginWithGoogle` is NOT async in the original file, it was `loginWithGoogle() {`
    
    final_content = pre_login + new_code + ' {' + post_signup
    
    with open(app_js_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
        print("Successfully replaced login/signup with handleLogin/handleRegisterClick")

else:
    print("Regex match failed")
