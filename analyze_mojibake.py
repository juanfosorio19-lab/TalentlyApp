
from collections import Counter
import re

file_path = "talently-TODAS-LAS-FEATURES.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all non-ascii characters (or sequences starting with them)
# Actually, let's find sequences of non-ascii
non_ascii_seqs = re.findall(r'[^\x00-\x7F]+', content)

counter = Counter(non_ascii_seqs)

print("Top 50 non-ascii sequences:")
for seq, count in counter.most_common(50):
    try:
        # Try to guess what it should be
        fixed = seq.encode('cp1252').decode('utf-8')
        print(f"{repr(seq)} ({count}) -> {fixed}")
    except:
        print(f"{repr(seq)} ({count}) -> [Cannot simple-fix]")
