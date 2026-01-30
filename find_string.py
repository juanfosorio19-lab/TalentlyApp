import re

file_path = "c:\\Users\\Juan Osorio\\Talently-Project\\index.html"
search_term = "messagesChatView"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if search_term in line:
                print(f"Found '{search_term}' on line {i}: {line.strip()}")
except Exception as e:
    print(f"Error: {e}")
