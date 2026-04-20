import pandas as pd
import requests
import json
from datetime import datetime, timedelta

CHANNEL_ID = "3262059"
WRITE_API_KEY = "E1BSNI8VU65PFFWN"

# Load dataset
df = pd.read_csv("household_power_consumption.txt", sep=";", low_memory=False)

# Clean power column
df["Global_active_power"] = pd.to_numeric(df["Global_active_power"], errors="coerce")
df = df.dropna(subset=["Global_active_power"])

# Take first 800 rows (safe bulk size)
values = df["Global_active_power"].head(800).tolist()

# Prepare bulk data
bulk_data = []
start_time = datetime.utcnow()

for i, value in enumerate(values):
    entry = {
        "created_at": (start_time + timedelta(minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "field3": value
    }
    bulk_data.append(entry)

payload = {
    "write_api_key": WRITE_API_KEY,
    "updates": bulk_data
}

url = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/bulk_update.json"

response = requests.post(url, json=payload)

print("Status Code:", response.status_code)
print("Response:", response.text)