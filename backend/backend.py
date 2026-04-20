from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import joblib
import numpy as np
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from tensorflow import keras


# ---------------- Logging ----------------

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("energy-backend")


# ---------------- Config ----------------

@dataclass(frozen=True)
class AppConfig:
    channel_id: str
    read_api_key: Optional[str]
    field_name: str
    thingspeak_timeout_s: float


def load_config() -> AppConfig:
    channel_id = os.getenv("THINGSPEAK_CHANNEL_ID", "").strip()
    if not channel_id:
        raise RuntimeError("THINGSPEAK_CHANNEL_ID missing in .env")

    read_api_key = os.getenv("THINGSPEAK_READ_API_KEY", "").strip() or None
    field_name = os.getenv("THINGSPEAK_FIELD", "field3").strip() or "field3"
    timeout = float(os.getenv("THINGSPEAK_TIMEOUT_S", "8"))

    return AppConfig(channel_id, read_api_key, field_name, timeout)


# ---------------- ThingSpeak ----------------

def thingspeak_url(config: AppConfig, results: int = 24) -> str:
    base = f"https://api.thingspeak.com/channels/{config.channel_id}/feeds.json"
    if config.read_api_key:
        return f"{base}?api_key={config.read_api_key}&results={results}"
    return f"{base}?results={results}"


def fetch_last_readings_kw(config: AppConfig, results: int = 24) -> List[float]:
    url = thingspeak_url(config, results)
    resp = requests.get(url, timeout=config.thingspeak_timeout_s)
    resp.raise_for_status()
    payload = resp.json()

    readings = []
    for f in payload.get("feeds", []):
        val = f.get(config.field_name)
        if val:
            try:
                readings.append(float(val))
            except:
                continue

    readings = readings[-results:]

    if len(readings) < results:
        raise ValueError(f"Need {results} readings but got {len(readings)}")

    return readings


# ---------------- Flask App ----------------

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "message": "Energy Prediction API Running",
            "endpoints": ["/", "/health", "/predict"]
        })

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    model_path = Path("energy_model.h5")
    scaler_path = Path("scaler.pkl")

    model = keras.models.load_model(model_path, compile=False)
    scaler = joblib.load(scaler_path)

    config = load_config()

    @app.route("/predict", methods=["GET"])
    def predict():
        try:
            readings = fetch_last_readings_kw(config, 24)
            x = np.array(readings).reshape(-1, 1)
            x_scaled = scaler.transform(x).reshape(1, 24, 1)
            pred_scaled = model.predict(x_scaled, verbose=0)
            pred = scaler.inverse_transform(pred_scaled)[0][0]
            return jsonify({"next_hour_prediction_kW": float(pred)})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)