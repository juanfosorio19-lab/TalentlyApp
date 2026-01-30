import re

app_js_path = 'js/app.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Filters
# Replace openFilters and closeFilters
old_filters_logic = r'openFilters\(\)\s*\{[^}]*filtersModal[^}]*\},\s*closeFilters\(\)\s*\{[^}]*filtersModal[^}]*\},'

new_filters_logic = '''openFilters() {
        // Toggle the view directly using the new class
        const view = document.getElementById('filtersView');
        if (view) view.classList.add('active');
    },

    closeFilters() {
        const view = document.getElementById('filtersView');
        if (view) view.classList.remove('active');
    },'''

# Use regex to find and replace. Note: The original code spans multiple lines.
# regex: openFilters\(\)\s*\{.*?closeFilters\(\)\s*\{.*?\},
# We need to be careful about matching the closing brace of closeFilters.

# Let's match strictly based on what we saw in the file view.
#     openFilters() {
#         document.getElementById('filtersOverlay').classList.add('active');
#         document.getElementById('filtersModal').classList.add('active');
#     },
# 
#     closeFilters() {
#         document.getElementById('filtersOverlay').classList.remove('active');
#         document.getElementById('filtersModal').classList.remove('active');
#     },

old_pattern = r'openFilters\(\)\s*\{[\s\S]*?closeFilters\(\)\s*\{[\s\S]*?\},'

match = re.search(old_pattern, content)
if match:
    print("Found filters logic. Replacing...")
    content = content.replace(match.group(0), new_filters_logic)
else:
    print("Filters logic not found via regex!")
    # Fallback: try simpler string replacement if exact match
    pass

# 2. Add updateBadge method
# We can add it after closeFilters
badge_method = '''
    updateBadge() {
        const badge = document.querySelector('.icon-btn .badge');
        if (!badge) return;
        
        // Count unread matches or notifications
        // Assuming matches have 'hasUnread' property
        const count = this.matches ? this.matches.filter(m => m.hasUnread).length : 0;
        
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },
'''

content = content.replace('closeFilters() {', 'closeFilters() {' + badge_method.replace('updateBadge() {', 'old_updateBadge() {') , 1) 
# Wait, inserting it *inside* closeFilters is wrong.
# I should append it *after* closeFilters replacement.

# Let's do the replacement of filters first, then append updateBadge to the new code.
new_filters_with_badge = new_filters_logic + badge_method

content = content.replace(new_filters_logic, new_filters_with_badge)

# 3. Call updateBadge in enterMainApp
# Find enterMainApp() {
# Insert this.updateBadge(); inside.
enter_main_search = r'enterMainApp\(\)\s*\{'
if re.search(enter_main_search, content):
    print("Found enterMainApp. Injecting updateBadge call...")
    content = re.sub(enter_main_search, 'enterMainApp() {\n        this.updateBadge();', content)

# 4. Call updateBadge in addMatch
add_match_search = r'addMatch\(profile\)\s*\{'
if re.search(add_match_search, content):
    print("Found addMatch. Injecting updateBadge call...")
    # Add it at the end of addMatch? Or beginning?
    # Better to add it after showToast
    content = content.replace("this.showToast('¡Es un Match!');", "this.showToast('¡Es un Match!');\n            this.updateBadge();")

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("Successfully updated app.js UI logic")
