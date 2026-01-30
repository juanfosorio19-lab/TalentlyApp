
import shutil
import os

file_path = "talently-TODAS-LAS-FEATURES.html"
backup_path = file_path + ".bak"

# 1. Create backup
if not os.path.exists(backup_path):
    print(f"Creating backup at {backup_path}")
    shutil.copy(file_path, backup_path)

# 2. Read and Fix
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply fix
    # We assume the content is currently "Mojibake" (UTF-8 bytes interpreted as CP1252)
    # So we encode back to bytes using cp1252 to get the original UTF-8 bytes
    # Then decode as UTF-8 to get the correct string
    fixed_content = content.encode('cp1252').decode('utf-8')
    
    # Basic check to ensure we didn't empty the file or corrupt it significantly
    if len(fixed_content) == 0:
        raise Exception("Fixed content is empty!")
    
    # 3. Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
        
    print("Successfully fixed encoding.")
    
except UnicodeEncodeError as e:
    print(f"Error during encoding fix (maybe file is mixed?): {e}")
except UnicodeDecodeError as e:
    print(f"Error during decoding fix: {e}")
except Exception as e:
    print(f"General error: {e}")
