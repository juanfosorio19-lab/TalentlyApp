# zip-dist.ps1 — Empaqueta el contenido de una carpeta en un .zip con entradas
# usando separador "/" (forward slash), como exige el formato ZIP y como
# necesita el unzip nativo de Android/Capgo.
#
# IMPORTANTE: NO usar Compress-Archive en Windows PowerShell 5.1 — genera
# entradas con "\" (backslash), y el unzip de Android las trata como nombres
# de archivo literales (assets\x.js en la raíz) → el bundle queda roto (404 en
# /assets/*, pantalla en blanco).
#
# Uso: powershell -File zip-dist.ps1 -SourceDir dist -ZipPath ota-<sha>.zip
param(
    [Parameter(Mandatory=$true)][string]$SourceDir,
    [Parameter(Mandatory=$true)][string]$ZipPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null

$src = (Resolve-Path $SourceDir).Path
if (Test-Path $ZipPath) { [System.IO.File]::Delete((Resolve-Path $ZipPath).Path) }

$bs = [char]92   # \
$fws = [char]47  # /
$fs = [System.IO.File]::Open($ZipPath, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $base = $src.TrimEnd($bs, $fws) + $bs
    Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {
        $rel = ($_.FullName.Substring($base.Length)).Replace($bs, $fws)
        $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
        $out = $entry.Open()
        $in = [System.IO.File]::OpenRead($_.FullName)
        try { $in.CopyTo($out) } finally { $in.Dispose(); $out.Dispose() }
    }
} finally {
    $zip.Dispose(); $fs.Dispose()
}
Write-Output "zip OK: $ZipPath ($($zip.Entries.Count) entradas)"
