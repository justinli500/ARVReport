import json
import os
import time
from pathlib import Path
from statistics import mean

import requests
from fpdf import FPDF
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

CONFIG_PATH = Path(__file__).resolve().parent / "config.json"


def generate_arv_report(address: str, state: str, zip_code: str) -> dict:
    """Run the Selenium-based ARV script.

    This integrates the ARV calculation logic provided by the user. The
    function logs into the Matrix MLS, scrapes property details, searches for
    comparable listings, downloads listing photos, and generates a PDF report
    containing the images and prices.
    """
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            config = json.load(f)
    else:
        config = {}

    # Parse the address into number, name and type
    parts = address.split()
    if not parts:
        raise ValueError("address cannot be empty")
    street_num = parts[0]
    street_type = parts[-1]
    street_name = " ".join(parts[1:-1])

    chrome_opts = Options()
    for arg in ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]:
        chrome_opts.add_argument(arg)
    chrome_opts.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(options=chrome_opts)
    wait = WebDriverWait(driver, 15)
    listing_images: dict[str, dict] = {}
    try:
        driver.get("https://austin.clareity.net/clp/login")
        wait.until(EC.presence_of_element_located((By.NAME, "username")))
        driver.find_element(By.NAME, "username").send_keys("831268")
        driver.find_element(By.NAME, "password").send_keys("CheckARV,2025")
        driver.find_element(By.ID, "loginbtn").click()
        wait.until(EC.url_changes("https://austin.clareity.net/clp/login"))

        driver.get(
            "https://matrix.abor.com/Matrix/Home?c=H4sIAAAAAAAEAItWMjc0NlHSySvNyRklyCeUDm*2jFE6PAk9JGMBdsmKSmEBAAA)&f="
        )
        time.sleep(2)

        driver.find_element(By.ID, "Min_Fm67_Ctrl237_TB").send_keys(street_num)
        driver.find_element(By.ID, "Max_Fm67_Ctrl237_TB").send_keys(street_num)
        driver.find_element(By.ID, "Fm67_Ctrl238_TextBox").send_keys(street_name)
        driver.find_element(By.ID, "dropdown_Fm67_Ctrl239_LB").click()
        xpath = f"//input[@type='checkbox' and @data-mtrx-item-text='{street_type}']"
        wait.until(EC.element_to_be_clickable((By.XPATH, xpath))).click()
        driver.find_element(By.XPATH, "//input[@value='Apply']").click()
        driver.find_element(By.ID, "Fm67_Ctrl60_TextBox").send_keys(zip_code)

        search_btn = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button[data-mtx-track='Homepage - Search - Search Click']")
            )
        )
        search_btn.click()

        result_link = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href*='/Matrix/Display/GetDisplay']"))
        )
        result_link.click()

        def _get(field: str, default: str = "") -> str:
            try:
                xpath = (
                    f"//div[normalize-space()='{field}' and contains(@class,'border-bottom')]/"
                    "following-sibling::div[contains(@class,'fw-bold')][1]"
                )
                ele = driver.find_element(By.XPATH, xpath)
                return ele.text.strip().replace(",", "")
            except Exception:
                return default

        def _get_int(field: str, default: int = 0) -> int:
            txt = _get(field, "")
            try:
                return int(txt)
            except Exception:
                return default

        def _get_float(field: str, default: float = 0.0) -> float:
            txt = _get(field, "")
            try:
                return float(txt)
            except Exception:
                return default

        beds = _get_int("# Beds")
        baths = _get_int("# Baths")
        sqft = _get_int("SqFt")
        acres = _get_float("Acres")
        yearbuilt = _get_int("Year Built")

        yr_off = config.get("year_built", {}).get("offset", 5)
        bd_min = beds + config.get("bedrooms", {}).get("min_offset", 0)
        bd_max = beds + config.get("bedrooms", {}).get("max_offset", 0)
        bt_min = baths + config.get("bathrooms", {}).get("min_offset", 0)
        bt_max = baths + config.get("bathrooms", {}).get("max_offset", 0)
        sqft_min = max(0, sqft - config.get("sqft", {}).get("offset", 100))
        sqft_max = sqft + config.get("sqft", {}).get("offset", 100)
        acr_min = max(0, acres - config.get("acres", {}).get("offset", 10))
        acr_max = acres + config.get("acres", {}).get("offset", 10)

        driver.get("https://matrix.abor.com/Matrix/Search/Residential/Residential")
        time.sleep(5)

        active_checkbox = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//label[contains(.,'Active')]/preceding-sibling::input[@type='checkbox']"))
        )
        if not active_checkbox.is_selected():
            active_checkbox.click()
        closed_checkbox = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//label[contains(.,'Closed')]/preceding-sibling::input[@type='checkbox']"))
        )
        if not closed_checkbox.is_selected():
            closed_checkbox.click()

        closed_input = driver.find_element(
            By.XPATH, "//label[normalize-space()='Closed']/following::input[@class='textbox'][1]"
        )
        closed_input.clear()
        closed_input.send_keys("0-360")

        driver.find_element(By.CLASS_NAME, "mapSearchDistance").send_keys("1")
        driver.find_element(By.ID, "Fm23_Ctrl19_TB").send_keys(address)

        time.sleep(2)

        driver.find_element(By.ID, "Fm23_Ctrl55_TB").send_keys(f"{bd_min}-{bd_max}")
        driver.find_element(By.ID, "Fm23_Ctrl56_TB").send_keys(f"{bt_min}-{bt_max}")
        driver.find_element(By.ID, "Fm23_Ctrl59_TB").send_keys(f"{sqft_min}-{sqft_max}")
        driver.find_element(By.ID, "Fm23_Ctrl125_TB").send_keys(f"{acr_min}-{acr_max}")
        driver.find_element(By.ID, "Fm23_Ctrl124_TB").send_keys(f"{yearbuilt-yr_off}-{yearbuilt+yr_off}")

        results_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.ID, "m_ucSearchButtons_m_lbSearch"))
        )
        driver.execute_script("arguments[0].click();", results_button)
        time.sleep(5)

        first_listing_anchor = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "a[data-mtx-track='Results - In-Display Full Link Click']")
            )
        )
        first_listing_anchor.click()

        def _get_price(webdriver_obj, default: str = "N/A") -> str:
            try:
                webdriver_obj.find_element(By.LINK_TEXT, "Listing").click()
            except Exception:
                pass
            xpath = (
                "//td[span[@class='label' and normalize-space(text())='List Price:']]" 
                "/following-sibling::td[1]//span[@class='field']"
            )
            try:
                el = WebDriverWait(webdriver_obj, 5).until(
                    EC.visibility_of_element_located((By.XPATH, xpath))
                )
                return el.text.strip()
            except Exception:
                return default

        def process_current_listing(webdriver_obj, wait_obj):
            price = _get_price(webdriver_obj)
            try:
                photos_btn = wait_obj.until(EC.element_to_be_clickable((By.LINK_TEXT, "Photos")))
                photos_btn.click()
            except TimeoutException:
                pass
            wait_obj.until(EC.presence_of_element_located((By.CSS_SELECTOR, "img.IV_Image.img-responsive")))
            img_urls = [img.get_attribute("src") for img in webdriver_obj.find_elements(By.CSS_SELECTOR, "img.IV_Image.img-responsive")]
            try:
                listing_btn = wait_obj.until(EC.element_to_be_clickable((By.LINK_TEXT, "Listing")))
                listing_btn.click()
            except TimeoutException:
                pass
            return price, img_urls

        max_listings = 10
        for idx in range(1, max_listings + 1):
            price, photos = process_current_listing(driver, wait)
            listing_images[f"Listing_{idx}"] = {"price": price, "photos": photos}
            if idx == max_listings:
                break
            try:
                next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "m_DisplayCore_dpy2")))
                driver.execute_script("arguments[0].click();", next_button)
            except TimeoutException:
                break
            time.sleep(2)

        pdf = FPDF("P", "mm", "Letter")
        pdf.set_auto_page_break(auto=True, margin=10)
        pdf.set_font("Helvetica", "B", 14)
        images_per_page = 12
        img_width = (pdf.w - 40) / 3
        img_height = img_width * 0.75

        for lid, listing_data in listing_images.items():
            urls = listing_data["photos"]
            price = listing_data["price"]
            for i, url in enumerate(urls):
                if i % images_per_page == 0:
                    pdf.add_page()
                    pdf.cell(0, 10, f"Listing ID: {lid}", ln=True, align="C")
                    pdf.cell(0, 10, f"Price: {price}", ln=True, align="C")
                    pdf.ln(5)
                    y_offset = pdf.get_y()
                col = (i % images_per_page) % 3
                row = (i % images_per_page) // 3
                x = 10 + col * (img_width + 5)
                y = y_offset + row * (img_height + 5)
                try:
                    resp = requests.get(url)
                    fn = f"{lid}_{i}.jpg"
                    with open(fn, "wb") as f:
                        f.write(resp.content)
                    pdf.image(fn, x=x, y=y, w=img_width, h=img_height)
                    os.remove(fn)
                except Exception:
                    continue

        output_path = "Listing_Photos_Report.pdf"
        pdf.output(output_path)

        prices = []
        for d in listing_images.values():
            p = d["price"].replace("$", "").replace(",", "").strip()
            if p.isdigit():
                prices.append(int(p))
        estimate = int(mean(prices)) if prices else 0

        return {
            "address": address,
            "state": state,
            "zip": zip_code,
            "estimated_value": estimate,
            "pdf": output_path,
        }

    finally:
        driver.quit()
