
import glob
import re

def check_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        non_ascii = set(re.findall(r'[^\x00-\x7F]+', content))
        
        if not non_ascii:
            return
            
        print(f"File: {filepath}")
        print(f"  Found {len(non_ascii)} unique non-ascii sequences.")
        # Filter for likely mojibake (weird chars) vs normal spanish (accented vowels)
        # Normal spanish: áéíóúÁÉÍÓÚñÑüÜ¿¡
        # Emojis are also fine.
        # Mojibake often looks like: Ã³, Ã±, etc.
        
        likely_mojibake = [c for c in non_ascii if 'Ã' in c or 'Â' in c or len(c.encode('utf-8')) > 4] 
        # Note: len(char) is 1, but if it was mojibake interpreted as utf-8, it might be 1 char e.g. Ã (C3 83)
        # Actually mojibake is usually 2 chars in the string that represent 1 intended char.
        # e.g. "Ã³".
        
        # Let's just print a sample of non-ascii and let the human (me) decide.
        print(f"  Sample: {list(non_ascii)[:15]}")
        print("-" * 40)

    except Exception as e:
        print(f"Error reading {filepath}: {e}")

files = glob.glob('js/**/*.js', recursive=True) + glob.glob('css/**/*.css', recursive=True)

print(f"Scanning {len(files)} files...")
for f in files:
    check_file(f)
