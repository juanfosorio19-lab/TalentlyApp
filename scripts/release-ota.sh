#!/usr/bin/env bash
# release-ota.sh — Publica una actualización OTA de la capa web.
# Lo ejecuta el asistente (Claude) cuando hay cambios JS/CSS/React a publicar.
#
# Pasos:
#   1. Build de producción (Talently_v2/dist)
#   2. Zip del contenido de dist (index.html en la raíz del zip)
#   3. Sube el zip como asset de un GitHub Release (host público)
#   4. Imprime la URL del asset y la versión, para registrar en Supabase app_bundles
#
# Después del script, registrar el bundle en Supabase (vía MCP execute_sql):
#   INSERT INTO public.app_bundles (version, url, notes)
#   VALUES ('<VERSION>', '<URL>', '<notas>');
#
# Requisitos: gh CLI autenticado (scope repo), zip, npm.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/Talently_v2"
REPO="juanfosorio19-lab/TalentlyApp"

cd "$APP"
echo "▶ Build..."
npm run build >/dev/null 2>&1

VERSION="$(git -C "$ROOT" rev-parse --short HEAD)"
ZIP="ota-$VERSION.zip"

echo "▶ Empaquetando dist → $ZIP"
( cd dist && zip -r "../$ZIP" . >/dev/null )

echo "▶ Publicando GitHub Release ota-$VERSION..."
if gh release view "ota-$VERSION" --repo "$REPO" >/dev/null 2>&1; then
    gh release upload "ota-$VERSION" "$ZIP" --repo "$REPO" --clobber
else
    gh release create "ota-$VERSION" "$ZIP" --repo "$REPO" \
        --title "OTA $VERSION" --notes "Bundle web OTA (auto-update)"
fi

URL="https://github.com/$REPO/releases/download/ota-$VERSION/$ZIP"
echo ""
echo "✅ Bundle publicado:"
echo "   version: $VERSION"
echo "   url:     $URL"
echo ""
echo "Ahora registrar en Supabase app_bundles:"
echo "   INSERT INTO public.app_bundles (version, url, notes) VALUES ('$VERSION', '$URL', 'OTA');"

# Limpieza del zip local (ya está en el release)
rm -f "$ZIP"
