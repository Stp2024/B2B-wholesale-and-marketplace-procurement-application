import os
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

workspace_dir = r"c:\Users\VAISHNAVI A\OneDrive\Documents\Assignment\Assignment\B2B-wholesale-and-marketplace-procurement-application-main"

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--window-size=1400,1000")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    # 1. Setup new supplier user in localStorage
    supplier_user = {
        "id": "TN-SUPP-INDIAN-TRADERS",
        "username": "indiantraders@example.com",
        "email": "indiantraders@example.com",
        "role": "supplier",
        "accountType": "supplier",
        "fullName": "Akul Gowda",
        "businessName": "Indian Traders",
        "phone": "+91 98765 43210",
        "business": {
            "name": "Indian Traders",
            "type": "Manufacturer & Wholesaler",
            "registrationNumber": "1234576",
            "gst": "29ABCDE1234F1Z5",
            "year": "2024",
            "category": "Industrial Supplies",
            "subcategory": "Safety Equipment",
            "website": "https://indiantraders.com"
        },
        "address": {
            "address": "# 56 Tumkur",
            "country": "India",
            "state": "karnataka",
            "city": "Tumkur",
            "pincode": "562149",
            "locationType": "Warehouse"
        },
        "profileCreated": True,
        "registrationDate": "2026-10-25T12:00:00.000Z",
        "status": "active",
        "trustScore": 0,
        "verificationStatus": "Pending Verification",
        "tier": "New Supplier (Unranked)",
        "isNewSupplier": True
    }

    # Open blank page to inject localStorage
    driver.get(f"file:///{workspace_dir.replace(os.sep, '/')}/pages/supplier/dashboard.html")
    driver.execute_script(f"""
        localStorage.setItem('tradenestCurrentUser', JSON.stringify({json.dumps(supplier_user)}));
        localStorage.setItem('tradenestUsers', JSON.stringify([{json.dumps(supplier_user)}]));
    """)
    driver.refresh()
    time.sleep(1.5)

    # Navigate to Business Profile module
    driver.execute_script("location.hash = '#business-profile';")
    time.sleep(1)

    # Verify Business Profile Module
    comp_name = driver.find_element(By.ID, "bizProfileCompanyName").text.strip()
    ver_badge = driver.find_element(By.ID, "bizProfileVerificationBadge").text.strip()
    trust_val = driver.find_element(By.ID, "bizProfileTrustScoreVal").text.strip()
    trust_pill = driver.find_element(By.ID, "bizProfileTrustScoreBadge").text.strip()

    print(f"Company Name: {comp_name}")
    print(f"Verification Badge: {ver_badge}")
    print(f"Trust Score Value: {trust_val}")
    print(f"Trust Badge Pill: {trust_pill}")

    assert comp_name == "Indian Traders", f"Expected Indian Traders, got {comp_name}"
    assert "pending verification" in ver_badge.lower(), f"Expected Pending Verification, got {ver_badge}"
    assert trust_val == "0/100", f"Expected 0/100, got {trust_val}"
    assert trust_pill.lower() == "new supplier", f"Expected New Supplier, got {trust_pill}"

    # Take screenshot of business profile module
    screenshot_path = os.path.join(workspace_dir, "new_supplier_profile_zero_trust.png")
    driver.save_screenshot(screenshot_path)
    print(f"Screenshot saved to: {screenshot_path}")

    # Verify Performance & Trust Score Module
    driver.execute_script("location.hash = '#performance';")
    time.sleep(1)

    perf_trust_num = driver.find_element(By.ID, "perfTrustScoreNum").text.strip()
    perf_tier = driver.find_element(By.ID, "perfTierBadge").text.strip()
    perf_completed = driver.find_element(By.ID, "metricCompletedOrders").text.strip()

    print(f"Performance Trust Score: {perf_trust_num}")
    print(f"Performance Tier Badge: {perf_tier}")
    print(f"Performance Completed Orders: {perf_completed}")

    assert perf_trust_num == "0", f"Expected 0, got {perf_trust_num}"
    assert "NEW SUPPLIER" in perf_tier, f"Expected NEW SUPPLIER, got {perf_tier}"
    assert perf_completed == "0", f"Expected 0 completed orders, got {perf_completed}"

    # Verify Public Suppliers Directory
    driver.get(f"file:///{workspace_dir.replace(os.sep, '/')}/pages/suppliers.html")
    time.sleep(1.5)
    page_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Indian Traders" in page_text, "Indian Traders should be listed in public suppliers directory"
    assert "0 / 100" in page_text or "0/100" in page_text, "Trust score 0 / 100 should be displayed for Indian Traders"
    print("Public Suppliers directory verified: 0 / 100 trust score and Pending Verification displayed!")

    # Verify Public Supplier Details Page
    driver.get(f"file:///{workspace_dir.replace(os.sep, '/')}/pages/supplier-details.html?id=TN-SUPP-INDIAN-TRADERS")
    time.sleep(1.5)
    detail_title = driver.find_element(By.CLASS_NAME, "supplier-detail-title").text
    detail_trust = driver.find_element(By.ID, "supplierDetailTrustVal").text
    print("Supplier details title:", detail_title)
    print("Supplier details trust score:", detail_trust)
    assert "Indian Traders" in detail_title, f"Expected Indian Traders, got {detail_title}"
    assert detail_trust == "0/100", f"Expected 0/100, got {detail_trust}"
    print("Public Supplier Details page verified: 0/100 trust score displayed!")

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

finally:
    driver.quit()
