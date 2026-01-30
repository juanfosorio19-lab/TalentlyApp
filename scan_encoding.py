
import glob
import re
import os

def check_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Look for suspicious sequences common in Mojibake (e.g., Ã followed by something)
        # But simply looking for non-ascii is a good start to see what's there
        non_ascii = set(re.findall(r'[^\x00-\x7F]+', content))
        
        if not non_ascii:
            return
            
        print(f"File: {filepath}")
        print(f"  Found {len(non_ascii)} unique non-ascii sequences.")
        # Print a sample
        sample = list(non_ascii)[:10]
        print(f"  Sample: {sample}")
        
        # Heuristic for Mojibake: 
        # If we see 'Ã' (C3) frequently followed by other chars, it's a strong indicator.
        mojibake_indicators = [c for c in non_ascii if 'Ã' in c or 'Â' in c]
        if mojibake_indicators:
             print(f"  !!! POSSIBLE MOJIBAKE DETECTED !!!: {mojibake_indicators[:5]}")
        print("-" * 40)

    except Exception as e:
        print(f"Error reading {filepath}: {e}")

types = ('**/*.html', '**/*.css', '**/*.js')
files = []
for t in types:
    files.extend(glob.glob(t, recursive=True))

print(f"Scanning {len(files)} files...")
for f in files:
    if "node_modules" in f: continue
    check_file(f)
