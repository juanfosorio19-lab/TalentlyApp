
try:
    with open("talently-TODAS-LAS-FEATURES.html", 'r', encoding='utf-8') as f:
        content = f.read()
    
    pos = 111671
    start = max(0, pos - 50)
    end = min(len(content), pos + 50)
    
    context = content[start:end]
    char_at_pos = content[pos]
    
    print(f"Character at {pos}: {repr(char_at_pos)}")
    print(f"Context: {repr(context)}")
    
except Exception as e:
    print(f"Error: {e}")
