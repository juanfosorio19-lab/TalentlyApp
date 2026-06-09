# 📱 Talently — Guía de App Móvil (Android / Google Play)

Talently corre como app nativa Android usando **Capacitor 8** (WebView que empaqueta la app React/Vite). El mismo código de `Talently_v2/` sirve para web y móvil.

- **appId**: `com.talently.app`
- **appName**: `Talently`
- **webDir**: `dist` (build de Vite)
- Config: `Talently_v2/capacitor.config.json`

---

## 0. Requisitos (ya instalados en esta máquina ✅)

| Herramienta | Versión | Estado |
|---|---|---|
| Node | 22.11 | ✅ (Capacitor pide 22.12+, funciona con warning) |
| JDK | 21 | ✅ |
| Android SDK | — | ✅ (`ANDROID_HOME` configurado) |
| Android Studio | — | ✅ |

> Recomendación menor: actualizar Node a 22.12+ para silenciar el warning EBADENGINE (`nvm install 22.12` o descargar de nodejs.org).

---

## 1. Flujo de desarrollo (cada vez que cambias código)

```bash
cd Talently_v2

# 1. Build del web
npm run build

# 2. Copiar el build al proyecto Android nativo
npx cap sync android

# 3a. Generar APK debug (para probar en tu teléfono)
cd android
./gradlew.bat assembleDebug          # Windows
# ./gradlew assembleDebug            # Mac/Linux

# 3b. O abrir en Android Studio para correr en emulador/dispositivo
npx cap open android
```

El APK debug queda en:
```
Talently_v2/android/app/build/outputs/apk/debug/app-debug.apk
```

### Probar el APK en tu teléfono
1. Activar **Opciones de desarrollador** en el teléfono (tocar 7× "Número de compilación" en Ajustes → Acerca del teléfono).
2. Activar **Depuración USB**.
3. Conectar por USB y: `adb install app-debug.apk` (adb está en `%ANDROID_HOME%\platform-tools`).
4. O copiar el `.apk` al teléfono y abrirlo (permitir "instalar apps de orígenes desconocidos").

### Live reload en desarrollo (opcional, muy útil)
```bash
# En capacitor.config.json agregar temporalmente:
#   "server": { "url": "http://TU_IP_LOCAL:5173", "cleartext": true }
npm run dev -- --host        # expone Vite en la red local
npx cap run android          # corre con hot reload
# ⚠️ Quitar el server.url antes de buildear para producción
```

---

## 2. Login con Google (OAuth) — config externa pendiente ⚠️

El código ya está listo (`src/lib/oauth.js` + deep link en AuthContext + intent-filter en AndroidManifest). **Pero el OAuth nativo NO funcionará hasta completar esta config en consolas externas:**

### 2.1 Obtener el SHA-1 del keystore
```bash
# Debug (para pruebas):
cd Talently_v2/android
./gradlew.bat signingReport
# Buscar el SHA1 de la variant "debug"

# Release (para producción) — después de crear el keystore (sección 4):
keytool -list -v -keystore talently-release.keystore -alias talently
```

### 2.2 Google Cloud Console
1. [console.cloud.google.com](https://console.cloud.google.com) → tu proyecto (el mismo del OAuth web)
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
3. Application type: **Android**
4. Package name: `com.talently.app`
5. SHA-1: el del paso 2.1 (agregar tanto el de debug como el de release)

### 2.3 Supabase Dashboard
1. **Authentication → URL Configuration → Redirect URLs** → agregar:
   ```
   com.talently.app://auth/callback
   ```
2. El provider Google ya debe estar habilitado (igual que para web).

> **Mientras tanto**: el login con **email + contraseña funciona perfecto en el APK** sin ninguna config extra. Es el camino recomendado para el primer release / pruebas internas.

---

## 3. Iconos y Splash Screen

El proyecto trae iconos genéricos de Capacitor. Para los tuyos:

```bash
cd Talently_v2
npm install -D @capacitor/assets

# Colocar en Talently_v2/resources/:
#   icon.png        (1024×1024, logo Talently)
#   splash.png      (2732×2732, fondo + logo centrado)

npx capacitor-assets generate --android
npx cap sync android
```

Esto regenera todos los tamaños de íconos (`mipmap-*`) y splash screens. El color de fondo del splash (`#1392EC`) ya está en `capacitor.config.json`.

---

## 4. APK / AAB de RELEASE firmado (para Google Play)

Google Play requiere un **AAB** (Android App Bundle), no APK, y debe estar **firmado**.

### 4.1 Crear el keystore (UNA sola vez — guárdalo MUY bien)
```bash
cd Talently_v2/android/app
keytool -genkey -v -keystore talently-release.keystore \
  -alias talently -keyalg RSA -keysize 2048 -validity 10000
# Te pide una contraseña y datos. ANÓTALOS — si pierdes el keystore
# NO podrás actualizar la app en Play Store nunca más.
```

> ⚠️ **NUNCA** commitees el `.keystore` ni las contraseñas a git. Guárdalos en un gestor de contraseñas + backup offline.

### 4.2 Configurar la firma en Gradle
Crear `Talently_v2/android/keystore.properties` (NO versionar):
```properties
storeFile=talently-release.keystore
storePassword=TU_PASSWORD
keyAlias=talently
keyPassword=TU_PASSWORD
```

En `Talently_v2/android/app/build.gradle`, dentro de `android { }`:
```gradle
def keystoreProps = new Properties()
def keystorePropsFile = rootProject.file("keystore.properties")
if (keystorePropsFile.exists()) {
    keystoreProps.load(new FileInputStream(keystorePropsFile))
}

signingConfigs {
    release {
        storeFile file("app/" + keystoreProps['storeFile'])
        storePassword keystoreProps['storePassword']
        keyAlias keystoreProps['keyAlias']
        keyPassword keystoreProps['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
    }
}
```

### 4.3 Generar el AAB
```bash
cd Talently_v2
npm run build
npx cap sync android
cd android
./gradlew.bat bundleRelease
# Resultado: android/app/build/outputs/bundle/release/app-release.aab
```

(Para un APK release firmado: `./gradlew.bat assembleRelease` → `apk/release/app-release.apk`.)

---

## 5. Subir a Google Play

1. **Cuenta de desarrollador**: [play.google.com/console](https://play.google.com/console) — pago único de **$25 USD**.
2. **Create app** → nombre "Talently", idioma, tipo "App", gratis.
3. **Internal testing** (recomendado para empezar): subir el `app-release.aab`, agregar testers por email. Disponible en minutos.
4. Completar las fichas obligatorias antes de producción:
   - Descripción corta y larga
   - Screenshots (teléfono: mín. 2, hasta 8)
   - Icono 512×512, feature graphic 1024×500
   - **Política de privacidad** (URL pública — tienes `/privacy` en la app, súbela a un dominio)
   - Content rating (cuestionario)
   - Data safety (qué datos recolectas: email, perfil, etc.)
   - Target audience
5. **Producción**: cuando el internal testing esté ok, promover a producción. Primera revisión de Google: ~días.

> Google Play usa **Play App Signing**: subes tu AAB firmado con tu keystore "de upload", y Google re-firma con su propia clave. El SHA-1 que registras en Google Cloud (sección 2) debe incluir **el de Play App Signing** (lo ves en Play Console → Setup → App signing) además del tuyo.

---

## 6. Consideraciones técnicas específicas de Talently

| Tema | Estado |
|---|---|
| Email/password login | ✅ Funciona out-of-the-box |
| Google OAuth | ⚠️ Requiere config externa (sección 2) |
| Supabase realtime (mensajes) | ✅ Funciona en WebView |
| Supabase anon key | ✅ Hardcoded como fallback en `supabase.js` (funciona sin `.env` en build) |
| Routing (BrowserRouter) | ✅ Funciona (cold start siempre carga index.html) |
| Dark mode | ✅ |
| Material Symbols + Inter | ✅ (bundled vía npm, no CDN) |

### Pendientes recomendados para v2 móvil (no bloqueantes)
- **Push notifications** (`@capacitor/push-notifications` + Firebase Cloud Messaging) para "¡Nuevo match!" y mensajes. ~1 día de setup.
- **Camera nativa** (`@capacitor/camera`) para avatar/CV en vez del input web.
- **Code splitting**: el bundle JS es ~900 KB. Con `React.lazy()` en las rutas de `App.jsx` se puede reducir el tiempo de arranque.
- **iOS**: `npx cap add ios` — requiere Mac + Xcode + cuenta Apple Developer ($99/año).

---

## 7. Estructura de archivos generada

```
Talently_v2/
├── capacitor.config.json     ← config de Capacitor (versionado)
├── android/                  ← proyecto nativo Android (parcialmente versionado)
│   ├── app/
│   │   ├── build.gradle      ← config de firma (editar para release)
│   │   ├── src/main/AndroidManifest.xml  ← intent-filter del deep link
│   │   └── build/outputs/    ← APK/AAB generados (NO versionar)
│   ├── keystore.properties   ← credenciales de firma (NO versionar)
│   └── *.keystore            ← clave de firma (NO versionar, backup offline)
├── dist/                     ← build de Vite (NO versionar)
└── src/lib/oauth.js          ← helper OAuth web/nativo
```

---

## 8. Auto-actualización OTA (Over-The-Air) — capa web

Desde que el APK incluye `@capgo/capacitor-updater`, **las actualizaciones de la
capa web (React/JS/CSS) llegan solas, sin reinstalar el APK**. La app, al abrir,
chequea si hay un bundle nuevo, lo descarga en background y lo aplica en el
siguiente arranque (silencioso).

### Qué se actualiza por OTA y qué no
| Cambio | OTA |
|---|---|
| React / JS / CSS / lógica / vistas / fixes | ✅ Sí |
| Migraciones Supabase (backend) | ✅ Sí (no depende del APK) |
| Plugins nativos, permisos, capacitor.config, splash/icono | ❌ No → regenerar APK |

### Arquitectura
- **Manifest**: tabla Supabase `public.app_bundles` (version, url, mandatory). La app
  lee la fila más reciente. INSERT solo `service_role` (anti-inyección).
- **Archivos**: el `dist.zip` de cada versión se aloja en **GitHub Releases**
  (`ota-<sha>`). URL pública de descarga.
- **Cliente**: `src/lib/otaUpdate.js` — `notifyAppReady()` (rollback si el bundle
  nuevo crashea) + descarga al abrir + aplica al salir de la app.

### Publicar una actualización OTA (lo ejecuta el asistente)
```bash
bash scripts/release-ota.sh
# imprime version + url; luego registrar en Supabase:
#   INSERT INTO public.app_bundles (version, url, notes) VALUES ('<sha>', '<url>', 'OTA');
```
La próxima vez que abras la app, baja el bundle; al reabrir, ya está actualizada.

### Seguridad
- La app solo **lee** `app_bundles` (anon select) y descarga un zip público.
- Publicar un bundle requiere (a) acceso de escritura al repo GitHub (subir el
  release) y (b) `service_role` de Supabase (insertar la fila) → un atacante con
  la anon key NO puede inyectar un bundle.
- `notifyAppReady()` + `appReadyTimeout` hacen rollback automático si un bundle
  nuevo no arranca → no te quedas con una app rota.

### Setup inicial (una sola vez)
El APK debe generarse **una vez** con el plugin ya instalado (este commit). A
partir de ahí, las actualizaciones web son OTA. Regenerar el APK solo es
necesario para cambios nativos.
