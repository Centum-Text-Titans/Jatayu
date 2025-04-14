import re
# utils/webscrape.py
import json
import os
import time
import requests
from django.conf import settings
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def clean_rate_text(rate_str):
    """
    Clean the rate string by removing tokens like "%" and "p.a.",
    and return the first numeric value found as a float.
    """
    rate_str = rate_str.replace("%", "").replace("p.a.", "").strip()
    matches = re.findall(r"\d+\.\d+|\d+", rate_str)
    if matches:
        return float(matches[0])
    return None



def get_sbi_fd_rates():
    """
    Scrapes the SBI fixed deposit rates from the target URL using Selenium and returns a dictionary
    with the rates for both “below 3 cr” and “above 3 cr”.
    """
    # Set up Selenium with headless Chrome
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    url = "https://groww.in/fixed-deposit/sbi-fd-interest-rates"
    driver.get(url)
    time.sleep(5)  # Wait for content to load
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    # Find the two tables. (The selector here is based on your original class names)
    tables = soup.find_all("table", class_="tb10Table borderPrimary")[:2]

    # Prepare a data dictionary to hold the fixed deposit rates.
    fd_data = {
        "below 3 cr": [],
        "above 3 cr": []
    }

    def extract_rows(table):
        """
        Helper function to extract header and row values from a table,
        replacing Unicode en-dash (\u2013) with a normal hyphen.
        """
        header_section = table.find("thead")
        headers = [
            th.get_text(" ", strip=True).replace("\u2013", "-")
            for th in header_section.find_all("th")
        ] if header_section else []
        
        rows = []
        tbody = table.find("tbody")
        if tbody:
            for tr in tbody.find_all("tr"):
                row = [td.get_text(" ", strip=True).replace("\u2013", "-") for td in tr.find_all("td")]
                if row:
                    rows.append(row)
        else:
            # Fallback if no <tbody> exists.
            for tr in table.find_all("tr"):
                row = [td.get_text(" ", strip=True).replace("\u2013", "-") for td in tr.find_all("td")]
                if row:
                    rows.append(row)
        return headers, rows

    # Process the first table ("below 3 cr")
    if len(tables) > 0:
        headers, rows = extract_rows(tables[0])
        for row in rows:
            row_obj = dict(zip(headers, row))
            fd_data["below 3 cr"].append(row_obj)

    # Process the second table ("above 3 cr")
    if len(tables) > 1:
        headers, rows = extract_rows(tables[1])
        for row in rows:
            row_obj = dict(zip(headers, row))
            fd_data["above 3 cr"].append(row_obj)

    driver.quit()
    return fd_data

def save_sbi_fd_rates():
    """
    Scrapes the fixed deposit rates and saves the data as JSON in the location:
    {settings.BASE_DIR}/db/jsons/fixed_deposit_rates.json.
    
    Returns the file path where the JSON is saved.
    """
    data = get_sbi_fd_rates()
    
    # Build the file path based on Django settings.
    target_dir = os.path.join(settings.BASE_DIR, "db", "jsons")
    os.makedirs(target_dir, exist_ok=True)  # Create directory if it doesn't exist.
    file_path = os.path.join(target_dir, "fixed_deposit_rates.json")
    
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)
    return file_path




def save_house_loan_to_json ():
    """
    Scrapes house loan rate data from the SBI home loan page and saves it as a JSON file
    in the '{settings.BASE_DIR}/db/jsons' directory. Returns the file path of the saved file.
    
    Raises:
        Exception: If the page can't be retrieved or the expected table isn't found.
    """
    url = "https://www.bankbazaar.com/sbi-home-loan.html"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to retrieve the page; status code: {response.status_code}")

    html_content = response.text
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Locate all tables with the specified class and choose the second one.
    tables = soup.find_all("table", class_="w-full caption-bottom text-sm border")
    if len(tables) < 2:
        raise Exception("Less than 2 tables found with the specified class.")
    
    table = tables[1]
    loan_data = {}

    # Process each row of the selected table.
    rows = table.find_all("tr")
    for row in rows:
        cells = row.find_all(["th", "td"])
        if len(cells) >= 2:
            loan_type = cells[0].get_text(strip=True)
            rate_text = cells[1].get_text(strip=True)
            # Continue only if the rate text contains a digit.
            if not any(char.isdigit() for char in rate_text):
                continue

            # Handle rate ranges, e.g., "10% to 12%"
            if "to" in rate_text:
                parts = rate_text.split("to")
                from_rate = clean_rate_text(parts[0])
                to_rate = clean_rate_text(parts[1])
            else:
                value = clean_rate_text(rate_text)
                from_rate = value
                to_rate = value

            if from_rate is not None and to_rate is not None:
                loan_data[loan_type] = {"from_rate": from_rate, "to_rate": to_rate}

    # Construct the path for the 'db/jsons' directory and ensure it exists.
    db_folder = os.path.join(settings.BASE_DIR, "db", "jsons")
    os.makedirs(db_folder, exist_ok=True)
    
    # Define the JSON file path.
    json_filename = os.path.join(db_folder, "house_loan_rates.json")
    
    # Save the data as a JSON file.
    with open(json_filename, "w") as f:
        json.dump(loan_data, f, indent=4)
    
    return json_filename