import os
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

workspace_dir = r"c:\Users\VAISHNAVI A\OneDrive\Documents\Assignment\Assignment\B2B-wholesale-and-marketplace-procurement-application-main"

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--window-size=1400,900")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    user = {
        "id": "supplier-001",
        "email": "supplier@tradenest.com",
        "fullName": "Akul Gowda",
        "businessName": "Indian Traders",
        "role": "supplier",
        "accountType": "supplier"
    }

    driver.get(f"file:///{workspace_dir.replace(os.sep, '/')}/index.html")
    driver.execute_script("localStorage.setItem('tradenestCurrentUser', JSON.stringify(arguments[0]));", user)
    driver.refresh()
    time.sleep(1.5)

    # Check notification element
    notif_wrappers = driver.find_elements(By.ID, "tnNotifWrapper")
    notif_btns = driver.find_elements(By.ID, "tnNotifBtn")

    print(f"Notification wrappers found in navbar: {len(notif_wrappers)}")
    print(f"Notification buttons found in navbar: {len(notif_btns)}")

    assert len(notif_wrappers) == 0, "Notification wrapper should NOT be present in navbar"
    assert len(notif_btns) == 0, "Notification button should NOT be present in navbar"

    # Verify other nav elements are intact
    profile_btn = driver.find_element(By.ID, "navProfileBtn")
    dash_link = driver.find_element(By.ID, "navDashboardLink")
    logout_btn = driver.find_element(By.ID, "navLogoutBtn")

    print(f"Profile button present: {profile_btn is not None}")
    print(f"Dashboard link text: {dash_link.text}")
    print(f"Logout button text: {logout_btn.text}")

    # Take screenshot of the top navigation bar
    header_el = driver.find_element(By.CLASS_NAME, "tn-site-header")
    screenshot_path = os.path.join(workspace_dir, "navbar_no_notification.png")
    header_el.screenshot(screenshot_path)
    print(f"Navbar screenshot saved to: {screenshot_path}")

    print("\nNAVBAR NOTIFICATION REMOVAL VERIFIED SUCCESSFULLY!")

finally:
    driver.quit()
