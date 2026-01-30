
import re
import codecs

file_path = "talently-TODAS-LAS-FEATURES.html"

# Common robust fix logic
def cp1252_fallback_handler(error):
    chunk = error.object[error.start:error.end]
    replacement = b""
    for char in chunk:
        if ord(char) in [0x81, 0x8d, 0x8f, 0x90, 0x9d]:
            replacement += bytes([ord(char)])
        else:
            replacement += b"?" # Should not happen for valid Mojibake parts
    return (replacement, error.end)

codecs.register_error("cp1252_fallback", cp1252_fallback_handler)

def try_fix(text):
    try:
        # Encode to bytes using Sloppy Cp1252, then decode as UTF-8
        # If text is "Ã³", bytes are C3 B3. Decode utf-8 -> "ó"
        # If text is "ó" (correct), bytes are F3 (in cp1252). Decode utf-8(F3) -> Error!
        fixed = text.encode('cp1252', errors='cp1252_fallback').decode('utf-8')
        return fixed
    except UnicodeDecodeError:
        return None
    except Exception as e:
        return None

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all unique non-ascii sequences
    sequences = set(re.findall(r'[^\x00-\x7F]+', content))
    
    replacements = {}
    
    print(f"Found {len(sequences)} unique non-ascii sequences.")
    
    for seq in sequences:
        fixed = try_fix(seq)
        if fixed:
            # Heuristic: If fix is different and likely valid
            # Also prevent accidentally changing single chars that map to themselves?
            # e.g. "ñ" -> F1 -> error in utf-8 decode. So correct chars usually return None.
            # So if it returns a string, it means it IS valid utf-8 when interpreted as bytes.
            # Since input was likely NOT intended to be those bytes (it was Mojibake), this is the fix.
            if fixed != seq:
                replacements[seq] = fixed
                # print(f"Fixing: {repr(seq)} -> {fixed}")

    # Perform replacements
    # Sort by length descending to avoid partial replacements breaking longer ones
    sorted_seqs = sorted(replacements.keys(), key=len, reverse=True)
    
    new_content = content
    count = 0
    for seq in sorted_seqs:
        # Check if actually present (regex found it, so yes)
        if seq in new_content:
            new_content = new_content.replace(seq, replacements[seq])
            count += 1
            
    print(f"Applied {count} patterns of replacements.")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Done.")

except Exception as e:
    print(f"Error: {e}")
