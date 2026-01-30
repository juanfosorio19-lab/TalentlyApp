
# Test strings from the file
samples = [
    "SesiÃ³n",          # Should be Sesión
    "MÃºltiples",       # Should be Múltiples
    "ContraseÃ±a",      # Should be Contraseña
    "âœ—",             # Should be ✗ (Check mark) - Wait, let's verify what this becomes
    "âœ“",             # Should be ✓
    "â—‹",             # Should be ○
    "Â¿",              # Should be ¿
]

print("Original -> Fixed")
print("-" * 20)

for s in samples:
    try:
        # The common mojibake is UTF-8 decoded as Windows-1252 (or Latin-1)
        # To fix: encode back to windows-1252 (getting the original utf-8 bytes), then decode as utf-8
        
        # Try cp1252 first as it's common on Windows
        fixed = s.encode('cp1252').decode('utf-8')
        print(f"{s} -> {fixed}")
    except Exception as e:
        print(f"{s} -> Error with cp1252: {e}")
        try:
            fixed = s.encode('latin1').decode('utf-8')
            print(f"{s} -> {fixed} (using latin1)")
        except Exception as e2:
             print(f"{s} -> Error with latin1: {e2}")

