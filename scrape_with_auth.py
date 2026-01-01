from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from datetime import datetime, timedelta, timezone
import pytz
import re
import requests
import json
import hashlib
from zoneinfo import ZoneInfo  # Python 3.9+

# URL to scrape
url = "https://app.wellnesscoach.live/challenge/68938ec5c53924ac556d2579?inTeamsSSO=true&from=CHALLENGE_LISTING_BANNER&select_my_steps=1"

firefox_options = FirefoxOptions()
# Replace with your actual Firefox profile path (see about:profiles in Firefox)
firefox_options.profile = r"C:\Users\colli\AppData\Roaming\Mozilla\Firefox\Profiles\31b1l19z.default-release"

driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=firefox_options)

driver.get(url)

time.sleep(3)

try:
    wait = WebDriverWait(driver, 15)
    # Find all nav buttons
    nav_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".challenge-component--nav--button"))
    )
    print(f"Found {len(nav_buttons)} nav buttons.")
    for idx, btn in enumerate(nav_buttons):
        print(f"Button {idx}: '{btn.text}', active: {'active' in btn.get_attribute('class')}")
    # Click the second button (index 1), assuming it's the leaderboard
    if len(nav_buttons) > 1:
        driver.execute_script("arguments[0].scrollIntoView(true);", nav_buttons[1])
        time.sleep(0.5)
        nav_buttons[1].click()
        print("Clicked on the second navigation button (likely leaderboard).")
        time.sleep(2)
    else:
        print("Not enough navigation buttons found.")
except Exception as e:
    print("Could not click navigation button:", e)

# Example: Get the leaderboard HTML by class name
try:
    leaderboard = driver.find_element("css selector", ".challenge-leaderboard")
    print("Leaderboard HTML:")
    print(leaderboard.get_attribute("outerHTML"))
except Exception as e:
    print("Could not find leaderboard:", e)

# Get current date in CST
cst = pytz.timezone('US/Central')
current_cst_date = datetime.now(cst).strftime("%Y-%m-%d")

# Load previous steps and date if available
previous_steps = {}
previous_date = None
json_filename = "leaderboard_data.json"
if os.path.exists(json_filename):
    try:
        with open(json_filename, 'r', encoding='utf-8') as f:
            previous_data = json.load(f)
            if previous_data and len(previous_data) > 0:
                previous_date = previous_data[0].get("Date", None)
                for entry in previous_data:
                    previous_steps[entry["Name"]] = entry["Total Steps"]
    except Exception:
        pass

# Check if the date is older than today (CST)
date_changed = previous_date is not None and previous_date < current_cst_date

# Log all step values with corresponding names from leaderboard items
leaderboard_data = []
try:
    name_elements = driver.find_elements(By.CSS_SELECTOR, ".challenge-leaderboard--list--item--name")
    step_elements = driver.find_elements(By.CSS_SELECTOR, ".challenge-leaderboard--list--item--steps")
    print("Leaderboard:")
    for idx, (name_elem, step_elem) in enumerate(zip(name_elements, step_elements)):
        name = name_elem.text
        # Remove all non-digit characters (including commas, spaces, and text)
        step_text = re.sub(r"[^\d]", "", step_elem.text)
        try:
            steps = int(step_text)
        except ValueError:
            print(f"Skipping entry '{name}' due to invalid steps value: '{step_elem.text}'")
            continue
        
        # Calculate steps today based on previous data
        prev_steps = previous_steps.get(name, steps)
        if date_changed:
            steps_today = 0
        else:
            steps_today = steps - prev_steps
        
        # Assign teams based on odd/even player position (1-indexed)
        player_number = idx + 1
        team_assignment = "red" if player_number % 2 == 1 else "blue"
        team_name = "Fire Walkers" if team_assignment == "red" else "Storm Striders"
        
        # Generate unique ID for player (you can modify this logic as needed)
        player_id = hashlib.sha256(name.encode()).hexdigest()
        
        leaderboard_data.append({
            "ID": player_id,
            "Name": name, 
            "Date": current_cst_date,
            "StepsToday": steps_today,
            "TotalSteps": steps,
            "TeamAssignment": team_assignment,
            "TeamName": team_name,
            "PlayerNumber": player_number,
            "LastUpdated": datetime.now(cst).isoformat()
        })
        print(f"{player_number}: {name} - {steps} steps (Team: {team_name})")
except Exception as e:
    print("Could not find name or step elements:", e)

driver.quit()

# Save current data for next run
with open(json_filename, 'w', encoding='utf-8') as f:
    json.dump(leaderboard_data, f, indent=2)

# Send JSON to the endpoint
invoke_url = "https://4nlhblvzyg.execute-api.us-east-1.amazonaws.com/Dev"

data = {"body": leaderboard_data}
    
try:
    response = requests.post(
        invoke_url,
        json=data,  # send JSON payload
        headers={"Content-Type": "application/json"}
    )
    print("POST response status:", response.status_code)
    print("POST response body:", response.text)
except Exception as e:
    print("Failed to POST JSON data:", e)