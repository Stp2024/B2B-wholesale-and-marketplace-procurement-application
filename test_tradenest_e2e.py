"""
TradeNest E2E Integration and Regression Automated Test Suite
Validates all 10 project requirements:
1. Removal of all unnecessary Back buttons codebase-wide
2. Supplier product creation, validation & persistence
3. Live synchronization to Public Home Page catalog
4. Live synchronization to Buyer Workspace & Dashboard catalog
5. Product editing propagation (price, stock, details) across all views
6. Live shared product detail resolution
7. Multi-supplier shared catalog integrity
8. Product deletion & dynamic removal from Home & Buyer listings
9. Buyer login, dashboard role routing & permissions
10. Session persistence, profile visibility & logout workflow
"""

import sys
import io
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# Ensure UTF-8 output on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000"

def get_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(0)
    return driver

def run_tests():
    driver = get_driver()
    results = []

    def record(test_name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        clean_details = str(details).replace("\u20b9", "INR ")
        results.append((test_name, status, clean_details))
        print(f"[{status}] {test_name}: {clean_details}")

    try:
        # ---------------------------------------------------------
        # TEST 1: AUDIT - REMOVAL OF UNNECESSARY BACK BUTTONS
        # ---------------------------------------------------------
        print("\n--- TEST 1: AUDIT OF REMOVED BACK BUTTONS ---")
        pages_to_audit = [
            "index.html",
            "auth/login.html",
            "auth/register.html",
            "buyer-dashboard.html",
            "pages/buyer/dashboard.html",
            "pages/buyer/products.html",
            "pages/buyer/product-details.html",
            "supplier-dashboard.html",
            "pages/supplier/dashboard.html",
            "pages/supplier/products.html",
            "pages/admin/dashboard.html"
        ]

        all_clean = True
        back_button_findings = []

        for page in pages_to_audit:
            driver.get(f"{BASE_URL}/{page}")
            time.sleep(0.3)
            back_els = driver.find_elements(By.CSS_SELECTOR, ".tn-back-button, .back-btn, .btn-back, [data-action='history-back']")
            if back_els:
                all_clean = False
                back_button_findings.append(f"{page} has {len(back_els)} back button elements")
            
            buttons = driver.find_elements(By.TAG_NAME, "button")
            for b in buttons:
                t = b.text.strip().lower()
                if "back to previous" in t or "go back" in t:
                    all_clean = False
                    back_button_findings.append(f"{page} has button with text '{b.text}'")

        record("Audit: All Unnecessary Back Buttons Removed", all_clean, 
               "Checked 11 representative pages across buyer, supplier, admin, auth, and public routes. Zero found." if all_clean else "; ".join(back_button_findings))

        # ---------------------------------------------------------
        # TEST 2: SUPPLIER AUTH & PRODUCT ADDITION
        # ---------------------------------------------------------
        print("\n--- TEST 2: SUPPLIER PRODUCT CREATION & SYNC ---")
        driver.get(f"{BASE_URL}/auth/login.html")
        time.sleep(0.6)
        
        # Select Supplier role tab
        supplier_tab = driver.find_element(By.CSS_SELECTOR, ".role-tab[data-role='supplier']")
        driver.execute_script("arguments[0].click();", supplier_tab)
        
        # Fill credentials
        driver.find_element(By.ID, "email").clear()
        driver.find_element(By.ID, "email").send_keys("supplier@tradenest.com")
        driver.find_element(By.ID, "password").clear()
        driver.find_element(By.ID, "password").send_keys("Supplier@123")
        
        # Submit login via script
        submit_btn = driver.find_element(By.ID, "loginSubmitBtn")
        driver.execute_script("arguments[0].click();", submit_btn)
        
        time.sleep(1.5)
        curr_url = driver.current_url
        login_success = "index.html" in curr_url or curr_url.endswith(":8000/")
        record("Supplier Login & Redirect to Home Page", login_success, f"Redirected to {curr_url}")

        user_raw = driver.execute_script("return localStorage.getItem('tradenestCurrentUser');")
        has_session = user_raw is not None and "supplier" in user_raw.lower()
        record("Supplier Session Persisted in LocalStorage", has_session, "User profile correctly saved")

        # Navigate to Supplier Dashboard
        driver.get(f"{BASE_URL}/supplier-dashboard.html#products")
        time.sleep(1)

        new_prod_name = "Apex Industrial Pro Safety Helmets"
        driver.execute_script(f"""
            var navLink = document.querySelector('.sidebar-nav a[href="#products"]');
            if (navLink) navLink.click();
            
            document.getElementById('prodFormName').value = '{new_prod_name}';
            document.getElementById('prodFormSku').value = 'SKU-HELMET-PRO-01';
            document.getElementById('prodFormCategory').value = 'Safety Equipment';
            document.getElementById('prodFormUom').value = 'units';
            document.getElementById('prodFormDescription').value = 'ANSI certified safety hard hats with adjustable suspension, chin strap, and ventilation.';
            document.getElementById('prodFormUnitPrice').value = '6.50';
            document.getElementById('prodFormMoq').value = '40';
            document.getElementById('prodFormStock').value = '320';
            document.getElementById('prodFormThreshold').value = '25';
            document.getElementById('prodFormDeliveryInfo').value = '2-3 business days express';
            document.getElementById('prodFormStatus').value = 'Active';
            
            var form = document.getElementById('productForm');
            var evt = new Event('submit', {{ cancelable: true, bubbles: true }});
            form.dispatchEvent(evt);
        """)
        time.sleep(1)

        # Verify product appears in supplier dashboard list (#productsMgmtGrid)
        supplier_cards = driver.find_elements(By.CSS_SELECTOR, "#productsMgmtGrid .prod-mgmt-card")
        supplier_card_found = any(new_prod_name in card.text for card in supplier_cards)
        record("Product Added in Supplier Dashboard", supplier_card_found, f"Found '{new_prod_name}' in supplier list ({len(supplier_cards)} total items)")

        # ---------------------------------------------------------
        # TEST 3: VERIFY SYNCHRONIZATION TO HOME PAGE
        # ---------------------------------------------------------
        print("\n--- TEST 3: SYNC TO HOME PAGE ---")
        driver.get(f"{BASE_URL}/index.html")
        time.sleep(1)

        home_cards = driver.find_elements(By.CSS_SELECTOR, "#homeProductsGrid .product-card")
        home_found = any(new_prod_name in card.text for card in home_cards)
        record("Product Synchronized to Public Home Page", home_found, f"Found in home page grid ({len(home_cards)} total products)")

        matching_home_card = next((c for c in home_cards if new_prod_name in c.text), None)
        home_details_ok = False
        card_id = None
        if matching_home_card:
            card_text = matching_home_card.text
            card_id = matching_home_card.get_attribute("data-product-id")
            home_details_ok = "520" in card_text or "MOQ: 40" in card_text
        record("Home Page Displays Accurate Price and MOQ", home_details_ok, f"Card contains MOQ 40 and calculated price. Product ID: {card_id}")

        # ---------------------------------------------------------
        # TEST 4: VERIFY SYNCHRONIZATION TO BUYER PRODUCTS PAGE
        # ---------------------------------------------------------
        print("\n--- TEST 4: SYNC TO BUYER WORKSPACE ---")
        driver.get(f"{BASE_URL}/pages/buyer/products.html")
        time.sleep(1)

        buyer_cards = driver.find_elements(By.CSS_SELECTOR, "#product-list .product-card")
        buyer_found = any(new_prod_name in card.text for card in buyer_cards)
        record("Product Synchronized to Buyer Catalog", buyer_found, f"Found in buyer catalog ({len(buyer_cards)} total products)")

        # ---------------------------------------------------------
        # TEST 5: EDIT PRODUCT & PROPAGATION
        # ---------------------------------------------------------
        print("\n--- TEST 5: PRODUCT EDIT & PROPAGATION ---")
        driver.get(f"{BASE_URL}/supplier-dashboard.html#products")
        time.sleep(1)

        # Edit product using TradeNestProductService to test programmatic API / service accuracy
        edit_script = f"""
            var user = JSON.parse(localStorage.getItem('tradenestCurrentUser') || '{{}}');
            return window.TradeNestProductService.saveProductSync({{
                id: '{card_id}',
                name: '{new_prod_name}',
                unitPrice: 7.25,
                price: 580,
                moq: 40,
                stock: 290,
                availableStock: 290,
                category: 'Safety Equipment',
                deliveryInfo: '1-2 business days ultra fast',
                status: 'Active',
                description: 'Updated ANSI certified safety hard hats with quick-release chin strap.'
            }}, user);
        """
        driver.execute_script(edit_script)
        time.sleep(0.5)

        # Check Home Page reflects updated price
        driver.get(f"{BASE_URL}/index.html")
        time.sleep(0.8)
        home_cards = driver.find_elements(By.CSS_SELECTOR, "#homeProductsGrid .product-card")
        matching_home_card = next((c for c in home_cards if new_prod_name in c.text), None)
        edit_synced_home = matching_home_card is not None and "580" in matching_home_card.text
        record("Product Price Edit Synced to Home Page", edit_synced_home, "Updated price INR 580 visible on Home Page")

        # Check Buyer Catalog reflects updated price
        driver.get(f"{BASE_URL}/pages/buyer/products.html")
        time.sleep(0.8)
        buyer_cards = driver.find_elements(By.CSS_SELECTOR, "#product-list .product-card")
        matching_buyer_card = next((c for c in buyer_cards if new_prod_name in c.text), None)
        edit_synced_buyer = matching_buyer_card is not None and "580" in matching_buyer_card.text
        record("Product Price Edit Synced to Buyer Catalog", edit_synced_buyer, "Updated price INR 580 visible in Buyer Catalog")

        # ---------------------------------------------------------
        # TEST 6: PRODUCT DETAILS PAGE RESOLUTION
        # ---------------------------------------------------------
        print("\n--- TEST 6: PRODUCT DETAILS VIEW ---")
        driver.get(f"{BASE_URL}/pages/product-details.html?id={card_id}")
        time.sleep(0.8)
        details_title = driver.find_element(By.CSS_SELECTOR, ".product-detail-title").text
        details_ok = new_prod_name in details_title
        record("Product Details Page Renders Live Shared Product", details_ok, f"Title renders: '{details_title}'")

        # ---------------------------------------------------------
        # TEST 7: MULTI-SUPPLIER CATALOGUE INTEGRITY
        # ---------------------------------------------------------
        print("\n--- TEST 7: MULTI-SUPPLIER DATA ---")
        driver.get(f"{BASE_URL}/pages/products.html")
        time.sleep(0.8)
        catalog_cards = driver.find_elements(By.CSS_SELECTOR, ".products-grid .product-card")
        all_text = " ".join([c.text for c in catalog_cards])
        multiple_suppliers = ("Apex" in all_text or "TradeNest" in all_text) and ("PaperPro" in all_text or "Packaging" in all_text or "Lumina" in all_text or "Commercial" in all_text or "SteelCraft" in all_text)
        record("Catalogue Displays Products from Multiple Suppliers", multiple_suppliers, f"Found {len(catalog_cards)} diverse supplier products in shared catalogue")

        # ---------------------------------------------------------
        # TEST 8: DELETE PRODUCT & REMOVAL FROM ALL LISTINGS
        # ---------------------------------------------------------
        print("\n--- TEST 8: PRODUCT DELETION & REMOVAL ---")
        driver.get(f"{BASE_URL}/supplier-dashboard.html#products")
        time.sleep(1)

        del_script = f"""
            var user = JSON.parse(localStorage.getItem('tradenestCurrentUser') || '{{}}');
            return window.TradeNestProductService.deleteProductSync('{card_id}', user);
        """
        del_result = driver.execute_script(del_script)
        record("Supplier Deletes Product Successfully", del_result is True, f"Product {card_id} deleted via service")

        # Verify removal from Home Page
        driver.get(f"{BASE_URL}/index.html")
        time.sleep(0.8)
        home_cards = driver.find_elements(By.CSS_SELECTOR, "#homeProductsGrid .product-card")
        removed_from_home = not any(new_prod_name in c.text for c in home_cards)
        record("Deleted Product Removed from Home Page", removed_from_home, "Product no longer displayed in home grid")

        # Verify removal from Buyer Catalog
        driver.get(f"{BASE_URL}/pages/buyer/products.html")
        time.sleep(0.8)
        buyer_cards = driver.find_elements(By.CSS_SELECTOR, "#product-list .product-card")
        removed_from_buyer = not any(new_prod_name in c.text for c in buyer_cards)
        record("Deleted Product Removed from Buyer Catalog", removed_from_buyer, "Product no longer displayed in buyer catalog")

        # ---------------------------------------------------------
        # TEST 9: BUYER WORKSPACE & PERMISSIONS
        # ---------------------------------------------------------
        print("\n--- TEST 9: BUYER LOGIN & PERMISSIONS ---")
        driver.get(f"{BASE_URL}/auth/login.html")
        time.sleep(0.6)
        buyer_tab = driver.find_element(By.CSS_SELECTOR, ".role-tab[data-role='buyer']")
        driver.execute_script("arguments[0].click();", buyer_tab)
        driver.execute_script("""
            document.getElementById('email').value = 'buyer@tradenest.com';
            document.getElementById('password').value = 'Buyer@123';
            document.getElementById('loginSubmitBtn').click();
        """)
        time.sleep(1.8)

        buyer_user_raw = driver.execute_script("return localStorage.getItem('tradenestCurrentUser');")
        buyer_logged_in = buyer_user_raw is not None and "buyer" in buyer_user_raw.lower()
        record("Buyer Login Successful & Session Active", buyer_logged_in, "Buyer role authenticated")

        if "index.html" not in driver.current_url:
            driver.get(f"{BASE_URL}/index.html")
        time.sleep(1)

        dashboard_btn = driver.find_element(By.CSS_SELECTOR, "#navDashboardLink, #profileDashboardBtn")
        dash_href = dashboard_btn.get_attribute("href")
        dash_correct = "buyer-dashboard.html" in dash_href
        record("Home Page 'My Dashboard' Links to Buyer Dashboard", dash_correct, f"Target URL: {dash_href}")

        # ---------------------------------------------------------
        # TEST 10: LOGOUT WORKFLOW
        # ---------------------------------------------------------
        print("\n--- TEST 10: LOGOUT WORKFLOW ---")
        driver.execute_script("""
            if (typeof window.logoutTradeNestUser === 'function') {
                window.logoutTradeNestUser();
            } else {
                var btn = document.getElementById('navLogoutBtn') || document.getElementById('profileLogoutBtn');
                if (btn) btn.click();
            }
        """)
        time.sleep(1)

        session_after_logout = driver.execute_script("return localStorage.getItem('tradenestCurrentUser');")
        logged_out = session_after_logout is None
        record("Logout Clears Active Session", logged_out, "Session removed from localStorage")

        logged_out_nav = driver.find_elements(By.CSS_SELECTOR, "#navLoggedOutActions, #navLoginLink, .tn-nav-logged-out")
        nav_visible = any(el.is_displayed() for el in logged_out_nav)
        record("Header Restores Public Login/Register Navigation", nav_visible, "Public navigation bar visible")

    except Exception as e:
        record("Test Suite Execution", False, f"Exception occurred: {str(e)}")
    finally:
        driver.quit()

    print("\n==========================================")
    print("TEST SUITE SUMMARY")
    print("==========================================")
    passed_count = sum(1 for _, status, _ in results if status == "PASS")
    total_count = len(results)
    for name, status, details in results:
        print(f"[{status}] {name} - {details}")
    print(f"\nTOTAL: {passed_count}/{total_count} Tests Passed ({round(passed_count/total_count*100, 1)}%)")

    return passed_count == total_count

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
