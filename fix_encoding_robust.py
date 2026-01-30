
import codecs

file_path = "talently-TODAS-LAS-FEATURES.html"

# Custom error handler for cp1252 encoding
# Maps characters that fail (like \x8f) to their byte values directly
def cp1252_fallback_handler(error):
    # The 'object' attribute of the exception contains the string being encoded
    # The 'start' and 'end' attributes indicate the range of the error
    chunk = error.object[error.start:error.end]
    replacement = b""
    for char in chunk:
        # If it's one of the undefined cp1252 controls, use its ord value as byte
        if ord(char) in [0x81, 0x8d, 0x8f, 0x90, 0x9d]:
            replacement += bytes([ord(char)])
        else:
            # Fallback to ? if it's something truly weird (shouldn't happen for Mojibake usually)
            replacement += b"?"
            print(f"Warning: Unknown char {repr(char)} replaced with ?")
    
    return (replacement, error.end)

codecs.register_error("cp1252_fallback", cp1252_fallback_handler)

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Encode back to bytes using our robust cp1252
    # This recovers the original UTF-8 bytes that were misinterpeted
    original_bytes = content.encode('cp1252', errors='cp1252_fallback')
    
    # 2. Decode using UTF-8 to get the correct text
    fixed_content = original_bytes.decode('utf-8')
    
    # 3. Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
        
    print("Successfully fixed encoding with robust handler.")
    
except Exception as e:
    print(f"Error during robust fix: {e}")
