"""
Train an LSTM forecaster for next-hour Global Active Power using the
UCI Household Power Consumption dataset.

Goal:
- Use past 24 hourly values -> predict next hour Global_active_power (kW)

Outputs (written to this folder):
- energy_model.h5
- scaler.pkl
"""

from __future__ import annotations

import argparse
import math
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras
from tensorflow.keras import layers


@dataclass(frozen=True)
class TrainArtifacts:
    model_path: Path
    scaler_path: Path


def load_and_prepare_hourly_series(dataset_path: Path) -> pd.Series:
    """
    Loads household_power_consumption.txt and returns an hourly-mean series
    for Global_active_power, cleaned and parsed.
    """
    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {dataset_path}\n"
            "Place 'household_power_consumption.txt' next to this script "
            "or pass --dataset_path."
        )

    # UCI dataset is semicolon-separated with missing values as '?'
    df = pd.read_csv(
        dataset_path,
        sep=";",
        low_memory=False,
        na_values=["?"],
    )

    # Combine Date + Time into a single datetime column and set as index
    # Date is in format dd/mm/yyyy, Time is hh:mm:ss
    dt = pd.to_datetime(
        df["Date"].astype(str) + " " + df["Time"].astype(str),
        format="%d/%m/%Y %H:%M:%S",
        errors="coerce",
    )
    df = df.drop(columns=["Date", "Time"])
    df.insert(0, "datetime", dt)
    df = df.dropna(subset=["datetime"]).set_index("datetime").sort_index()

    # Convert numeric columns
    # (na_values already converted '?' -> NaN)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Select target
    target = df["Global_active_power"].dropna()

    # Resample to hourly mean
    hourly = target.resample("1H").mean().dropna()

    # Basic sanity checks
    if len(hourly) < 25:
        raise ValueError(
            "Not enough hourly points after cleaning/resampling. "
            "Need at least 25 hours."
        )

    return hourly


def make_sequences(
    values_1d: np.ndarray, lookback: int = 24
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create supervised learning sequences:
      X: (n_samples, lookback, 1)
      y: (n_samples, 1)
    from a 1D array.
    """
    if values_1d.ndim != 1:
        raise ValueError("values_1d must be a 1D array.")

    X, y = [], []
    for i in range(lookback, len(values_1d)):
        X.append(values_1d[i - lookback : i])
        y.append(values_1d[i])

    X = np.array(X, dtype=np.float32).reshape(-1, lookback, 1)
    y = np.array(y, dtype=np.float32).reshape(-1, 1)
    return X, y


def build_model(lookback: int = 24) -> keras.Model:
    """
    LSTM model with 64 units for next-step forecasting.
    """
    model = keras.Sequential(
        [
            layers.Input(shape=(lookback, 1)),
            layers.LSTM(64),
            layers.Dense(1),
        ]
    )
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse")
    return model


def train(
    dataset_path: Path,
    out_dir: Path,
    epochs: int,
    batch_size: int,
    lookback: int = 24,
) -> TrainArtifacts:
    hourly = load_and_prepare_hourly_series(dataset_path)

    # Split chronologically (80/20)
    split_idx = int(len(hourly) * 0.8)
    train_series = hourly.iloc[:split_idx]
    test_series = hourly.iloc[split_idx:]

    # Fit scaler on train only (best practice)
    scaler = MinMaxScaler(feature_range=(0, 1))
    train_scaled = scaler.fit_transform(train_series.values.reshape(-1, 1)).reshape(-1)
    test_scaled = scaler.transform(test_series.values.reshape(-1, 1)).reshape(-1)

    X_train, y_train = make_sequences(train_scaled, lookback=lookback)
    X_test, y_test = make_sequences(test_scaled, lookback=lookback)

    model = build_model(lookback=lookback)

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="loss", patience=2, restore_best_weights=True
        )
    ]

    model.fit(
        X_train,
        y_train,
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=callbacks,
        shuffle=False,
    )

    # Evaluate on test with MAE / RMSE in original scale (kW)
    y_pred_scaled = model.predict(X_test, verbose=0).reshape(-1, 1)
    y_test_scaled = y_test.reshape(-1, 1)

    y_pred_kw = scaler.inverse_transform(y_pred_scaled).reshape(-1)
    y_test_kw = scaler.inverse_transform(y_test_scaled).reshape(-1)

    mae = mean_absolute_error(y_test_kw, y_pred_kw)
    rmse = math.sqrt(mean_squared_error(y_test_kw, y_pred_kw))

    print("\nEvaluation on test set (original scale):")
    print(f"MAE  (kW): {mae:.4f}")
    print(f"RMSE (kW): {rmse:.4f}\n")

    out_dir.mkdir(parents=True, exist_ok=True)
    model_path = out_dir / "energy_model.h5"
    scaler_path = out_dir / "scaler.pkl"

    # Save without optimizer / training configuration to avoid
    # deserialization issues when loading for inference-only in Flask.
    model.save(model_path, include_optimizer=False)
    joblib.dump(scaler, scaler_path)

    print(f"Saved model to:   {model_path}")
    print(f"Saved scaler to:  {scaler_path}")

    return TrainArtifacts(model_path=model_path, scaler_path=scaler_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train LSTM energy forecaster.")
    parser.add_argument(
        "--dataset_path",
        type=str,
        default=str(Path(__file__).with_name("household_power_consumption.txt")),
        help="Path to household_power_consumption.txt",
    )
    parser.add_argument(
        "--out_dir",
        type=str,
        default=str(Path(__file__).parent),
        help="Output directory for model/scaler.",
    )
    parser.add_argument("--epochs", type=int, default=8, help="Training epochs.")
    parser.add_argument("--batch_size", type=int, default=64, help="Batch size.")
    parser.add_argument("--lookback", type=int, default=24, help="Lookback window.")

    args = parser.parse_args()

    # Ensure TF doesn't spam logs in console
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

    train(
        dataset_path=Path(args.dataset_path),
        out_dir=Path(args.out_dir),
        epochs=args.epochs,
        batch_size=args.batch_size,
        lookback=args.lookback,
    )


if __name__ == "__main__":
    main()

