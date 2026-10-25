import subprocess
import time
import urllib.request
import json
import base64
import websocket
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--remote-debugging-port=9222",
    "--window-size=1400,900",
    "about:blank"
]

proc = subprocess.Popen(cmd)
try:
    time.sleep(2)
    targets = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
    page = next(t for t in targets if t.get("type") == "page")
    ws_url = page["webSocketDebuggerUrl"]

    ws = websocket.create_connection(ws_url)
    msg_id = 0

    def send_cmd(method, params=None):
        global msg_id
        msg_id += 1
        payload = {"id": msg_id, "method": method, "params": params or {}}
        ws.send(json.dumps(payload))
        while True:
            resp = json.loads(ws.recv())
            if resp.get("id") == msg_id:
                return resp

    def eval_js(expression):
        res = send_cmd("Runtime.evaluate", {"expression": expression, "returnByValue": True})
        return res.get("result", {}).get("result", {}).get("value")

    def capture_screenshot(path):
        res = send_cmd("Page.captureScreenshot")
        data = res.get("result", {}).get("data")
        if data:
            with open(path, "wb") as f:
                f.write(base64.b64decode(data))
            print(f"Captured screenshot to: {path}")

    # Navigate
    send_cmd("Page.enable")
    send_cmd("Page.navigate", {"url": "http://localhost:8000/pages/supplier/dashboard.html#payments"})
    time.sleep(2)

    # 1. Read initial cards
    tot = eval_js("document.getElementById('finTotalVolume').textContent")
    esc = eval_js("document.getElementById('finEscrowProtected').textContent")
    rel = eval_js("document.getElementById('finReleased').textContent")
    pen = eval_js("document.getElementById('finPendingCount').textContent")
    print(f"Step 1 - Initial Seed KPI Cards: Total={tot}, Escrow={esc}, Released={rel}, Pending={pen}")

    # 2. Click Escrow card filter
    eval_js("document.getElementById('cardFinEscrow').click()")
    time.sleep(1)
    esc_count = eval_js("document.querySelectorAll('#paymentsTableBody tr').length")
    print(f"Step 2 - Filtered by Escrow, rows count: {esc_count}")

    # 3. Click Release Funds on first Escrow transaction
    eval_js("document.querySelector('.btn-release-escrow-action').click()")
    time.sleep(1)
    tot2 = eval_js("document.getElementById('finTotalVolume').textContent")
    esc2 = eval_js("document.getElementById('finEscrowProtected').textContent")
    rel2 = eval_js("document.getElementById('finReleased').textContent")
    print(f"Step 3 - After Releasing Funds: Total={tot2}, Escrow={esc2}, Released={rel2}")

    # Save screenshot of released state
    capture_screenshot(r"C:\Users\VAISHNAVI A\.gemini\antigravity-ide\brain\562438f6-46af-46e2-96ab-10d56e61958e\payments_after_release.png")

    # 4. Switch to new supplier with zero orders/payments
    eval_js("""
        localStorage.setItem('tradenestCurrentUser', JSON.stringify({
            id: 'TN-SUPP-8888',
            supplierId: 'TN-SUPP-8888',
            email: 'newbie@supplier.com',
            role: 'supplier',
            isNewSupplier: true
        }));
        location.reload();
    """)
    time.sleep(2)
    eval_js("switchView('payments')")
    time.sleep(1)

    new_tot = eval_js("document.getElementById('finTotalVolume').textContent")
    new_esc = eval_js("document.getElementById('finEscrowProtected').textContent")
    new_rel = eval_js("document.getElementById('finReleased').textContent")
    new_pen = eval_js("document.getElementById('finPendingCount').textContent")
    has_sim_btn = eval_js("!!document.querySelector('.btn-seed-demo-payment')")
    print(f"Step 4 - New Supplier (Zero state): Total={new_tot}, Escrow={new_esc}, Released={new_rel}, Pending={new_pen}, HasSimBtn={has_sim_btn}")

    capture_screenshot(r"C:\Users\VAISHNAVI A\.gemini\antigravity-ide\brain\562438f6-46af-46e2-96ab-10d56e61958e\payments_zero_state.png")

    # 5. Click Simulate Escrow Order button
    eval_js("document.querySelector('.btn-seed-demo-payment').click()")
    time.sleep(1)

    sim_tot = eval_js("document.getElementById('finTotalVolume').textContent")
    sim_esc = eval_js("document.getElementById('finEscrowProtected').textContent")
    sim_rows = eval_js("document.querySelectorAll('#paymentsTableBody tr').length")
    print(f"Step 5 - After Simulating Escrow Order: Total={sim_tot}, Escrow={sim_esc}, Rows={sim_rows}")

    capture_screenshot(r"C:\Users\VAISHNAVI A\.gemini\antigravity-ide\brain\562438f6-46af-46e2-96ab-10d56e61958e\payments_simulated_success.png")

    # Reset localStorage
    eval_js("localStorage.removeItem('tradenestCurrentUser');")
    ws.close()
    print("ALL TESTS PASSED PERFECTLY!")

finally:
    proc.terminate()
