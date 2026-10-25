import os
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--window-size=1400,900")

driver = webdriver.Chrome(options=chrome_options)
try:
    print("1. Opening supplier dashboard with default seed data...")
    driver.get("http://localhost:8000/pages/supplier/dashboard.html#payments")
    time.sleep(2)

    # Check KPI cards values
    tot = driver.find_element(By.ID, "finTotalVolume").text
    esc = driver.find_element(By.ID, "finEscrowProtected").text
    rel = driver.find_element(By.ID, "finReleased").text
    pen = driver.find_element(By.ID, "finPendingCount").text
    print(f"Default KPI Cards: Total={tot}, Escrow={esc}, Released={rel}, Pending={pen}")

    # Check table rows count
    rows = driver.find_elements(By.CSS_SELECTOR, "#paymentsTableBody tr")
    print(f"Table rows count: {len(rows)}")

    # Click cardFinEscrow
    print("2. Clicking TradeShield In-Escrow card...")
    driver.find_element(By.ID, "cardFinEscrow").click()
    time.sleep(1)
    esc_rows = driver.find_elements(By.CSS_SELECTOR, "#paymentsTableBody tr")
    print(f"Escrow filtered rows count: {len(esc_rows)}")

    # Click Release Funds button on first escrow row
    release_btns = driver.find_elements(By.CSS_SELECTOR, ".btn-release-escrow-action")
    if release_btns:
        print("3. Clicking 'Release Funds' on first escrow transaction...")
        release_btns[0].click()
        time.sleep(1)
        
        # Check updated KPI Cards
        tot2 = driver.find_element(By.ID, "finTotalVolume").text
        esc2 = driver.find_element(By.ID, "finEscrowProtected").text
        rel2 = driver.find_element(By.ID, "finReleased").text
        print(f"After Release KPI Cards: Total={tot2}, Escrow={esc2}, Released={rel2}")

    # Reset filter to all
    driver.find_element(By.ID, "cardFinTotal").click()
    time.sleep(1)

    # Take screenshot of Payments view
    screenshot_path = r"C:\Users\VAISHNAVI A\.gemini\antigravity-ide\brain\562438f6-46af-46e2-96ab-10d56e61958e\payments_dashboard_dynamic.png"
    driver.save_screenshot(screenshot_path)
    print(f"Saved screenshot to {screenshot_path}")

    # Now test with a new supplier with 0 initial payments
    print("4. Testing newly registered supplier profile...")
    new_user = {
        "id": "TN-SUPP-9999",
        "supplierId": "TN-SUPP-9999",
        "email": "newsupplier@test.com",
        "role": "supplier",
        "isNewSupplier": True,
        "businessName": "Apex Test Supply Co."
    }
    driver.execute_script("localStorage.setItem('tradenestCurrentUser', JSON.stringify(arguments[0]));", new_user)
    driver.get("http://localhost:8000/pages/supplier/dashboard.html#payments")
    time.sleep(2)

    new_tot = driver.find_element(By.ID, "finTotalVolume").text
    new_esc = driver.find_element(By.ID, "finEscrowProtected").text
    new_rel = driver.find_element(By.ID, "finReleased").text
    new_pen = driver.find_element(By.ID, "finPendingCount").text
    print(f"New Supplier KPI Cards: Total={new_tot}, Escrow={new_esc}, Released={new_rel}, Pending={new_pen}")

    # Check empty state button
    sim_btns = driver.find_elements(By.CSS_SELECTOR, ".btn-seed-demo-payment")
    print(f"Simulate button present: {len(sim_btns) > 0}")
    if sim_btns:
        print("Clicking 'Simulate Escrow Order' button...")
        sim_btns[0].click()
        time.sleep(1)
        sim_tot = driver.find_element(By.ID, "finTotalVolume").text
        sim_esc = driver.find_element(By.ID, "finEscrowProtected").text
        print(f"After Simulating Escrow Order: Total={sim_tot}, Escrow={sim_esc}")

    screenshot_path2 = r"C:\Users\VAISHNAVI A\.gemini\antigravity-ide\brain\562438f6-46af-46e2-96ab-10d56e61958e\payments_new_supplier_simulated.png"
    driver.save_screenshot(screenshot_path2)
    print(f"Saved second screenshot to {screenshot_path2}")

    # Clean up test user
    driver.execute_script("localStorage.removeItem('tradenestCurrentUser');")
    print("Test passed successfully!")

finally:
    driver.quit()
