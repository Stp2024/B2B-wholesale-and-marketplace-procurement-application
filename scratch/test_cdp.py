import subprocess
import time
import urllib.request
import json
import base64

# Start Chrome in background
cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--remote-debugging-port=9222",
    "--window-size=1400,900",
    "http://localhost:8000/pages/supplier/dashboard.html#payments"
]

proc = subprocess.Popen(cmd)
try:
    time.sleep(3)
    # Get page target
    targets = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
    page = next(t for t in targets if t.get("type") == "page")
    ws_url = page["webSocketDebuggerUrl"]
    print("Connected to Chrome via CDP:", ws_url)

    import urllib.request
    import websocket # check if websocket is available or use raw socket

except Exception as e:
    print("CDP test error:", e)
finally:
    proc.terminate()
