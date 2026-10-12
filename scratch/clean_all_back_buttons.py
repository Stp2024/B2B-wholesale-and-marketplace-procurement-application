import os
import re

workspace = r"c:\Users\VAISHNAVI A\OneDrive\Documents\Assignment\New folder"

count = 0
for root, dirs, files in os.walk(workspace):
    # skip .git
    if ".git" in root or "node_modules" in root:
        continue
    for fname in files:
        if fname.endswith(".html"):
            fpath = os.path.join(root, fname)
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            orig = content
            
            # Remove embedded style blocks for tn-back-button
            content = re.sub(r"(?s)\s*\.tn-back-button\s*\{[^}]*\}\s*\.tn-back-button:hover\s*\{[^}]*\}\s*\.tn-back-button:active\s*\{[^}]*\}", "", content)
            content = re.sub(r"(?s)\s*\.tn-back-button\s*\{[^}]*\}", "", content)
            
            # Remove buttons with class tn-back-button, back-btn, btn-back or data-action='history-back'
            content = re.sub(r'(?s)\s*<button[^>]*class="[^"]*(?:tn-back-button|back-btn|btn-back)[^"]*"[^>]*>.*?</button>', '', content)
            content = re.sub(r'(?s)\s*<button[^>]*data-action="history-back"[^>]*>.*?</button>', '', content)
            
            # Remove any standalone button whose inner text is strictly Back / Go Back / Back to ...
            # but preserve cancel buttons
            def remove_back_btn(match):
                btn_code = match.group(0)
                # If it's a modal close or cancel or submit button, keep it
                if 'cancel' in btn_code.lower() or 'close' in btn_code.lower() or 'dismiss' in btn_code.lower():
                    return btn_code
                inner = re.sub(r'<[^>]+>', '', btn_code).strip().lower()
                if inner in ['back', 'go back', 'back to previous', 'back to products', 'back to suppliers', 'go back to dashboard overview']:
                    return ''
                if 'back to previous' in inner or 'go back' in inner:
                    return ''
                return btn_code

            content = re.sub(r'(?s)<button\b[^>]*>.*?</button>', remove_back_btn, content)

            if content != orig:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(content)
                count += 1
                print(f"Cleaned: {fname}")

print(f"Total HTML files cleaned: {count}")
