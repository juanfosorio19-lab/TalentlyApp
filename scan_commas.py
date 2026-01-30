
import re

def check_missing_commas(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Heuristic:
    # If a line ends with '}' (potentially closing a method or object)
    # And the next non-empty line starts with a property name or method name
    # Then the previous line should likely have a comma.
    
    # We ignore if the next line starts with '}' (closing the parent object)
    # We ignore comments.
    
    potential_errors = []
    
    for i in range(len(lines) - 1):
        line = lines[i].strip()
        next_line = lines[i+1].strip()
        
        # Skip empty lines or comments
        j = i + 1
        while j < len(lines) and (not lines[j].strip() or lines[j].strip().startswith('//')):
            j += 1
        
        if j >= len(lines):
            break
            
        next_real_line = lines[j].strip()
        
        # Case 1: End of method definition
        # matches lines like "    }," or "    }"
        if line.endswith('}') and not line.endswith('},'):
            # If next line starts with a property or method
            # Regex for property: identifier followed by : or (
            if re.match(r'^[a-zA-Z0-9_$]+(\s*:|\s*\()', next_real_line):
                # Also check if it's NOT a keyword like else, catch, etc.
                if not next_real_line.startswith(('else', 'catch', 'finally', 'while')):
                     potential_errors.append((i + 1, line, next_real_line))

    if potential_errors:
        print(f"Found {len(potential_errors)} potential missing commas:")
        for ln, content, next_content in potential_errors:
            print(f"Line {ln}: {content}  (Next: {next_content})")
    else:
        print("No obvious missing commas found.")

if __name__ == '__main__':
    check_missing_commas('js/app.js')
