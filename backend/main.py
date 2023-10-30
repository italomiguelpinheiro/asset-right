import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import math
from pandas_datareader import data as pdr
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM, Dropout
import matplotlib.pyplot as plt
from datetime import datetime
from datetime import timedelta

pd.options.mode.chained_assignment = None

import yfinance as yf
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    allow_origins=['http://localhost:3000']
)

@app.get("/analyze-asset")
async def analyze_asset(input_string: str):
    print("called")
    result = str(input_string.upper() + '.SA')
    df = yf.Ticker(result)
    asset_data = df.history(period='2y')
    closing_prices = asset_data['Close'].to_numpy().reshape(-1, 1)
    training_data_size = int(len(closing_prices) * 0.8)

    # Predefined scaled data is easier to handle.

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_training_data = scaler.fit_transform(closing_prices[0: training_data_size, :])
    scaled_test_data = scaler.transform(closing_prices[training_data_size:, :])
    scaled_data = list(scaled_training_data.reshape(len(scaled_training_data))) + list(scaled_test_data.reshape(len(scaled_test_data)))
    scaled_data = np.array(scaled_data).reshape(len(scaled_data), 1)

    training_data = scaled_data[0: training_data_size, :]

    # Data used to generate the result.
    training_x = []
    # Actual stock price.
    training_y = []

    for i in range(60, len(training_data)):
        # Last 60 days.
        training_x.append(training_data[i - 60: i, 0])
        # Stock price.
        training_y.append(training_data[i, 0])

        if i <= 61:
            print(training_x)
            print(training_y)

    # Transform lists into arrays and reshape into 3D.
    training_x, training_y = np.array(training_x), np.array(training_y)
    training_x = training_x.reshape(training_x.shape[0], training_x.shape[1], 1)

    # Hidden layer
    hidden_layer = Sequential()
    hidden_layer.add(Dense(10000, activation='tanh', input_shape=(training_x.shape[1],)))
    hidden_layer.add(Dropout(0.2))
    hidden_layer.add(Dense(60, activation='tanh'))
    hidden_layer.add(Dropout(0.2))

    # Linear Output Layer
    model = Sequential()
    model.add(hidden_layer)
    model.add(Dense(1, activation='linear'))

    model.compile(optimizer="adam", loss="mean_squared_error")
    model.fit(training_x, training_y, batch_size=32, epochs=100)

    test_data = scaled_data[training_data_size - 60:, :]

    test_x = []
    test_y = closing_prices[training_data_size:, :]

    for i in range(60, len(test_data)):
        test_x.append(test_data[i - 60: i, 0])

    test_x = np.array(test_x)
    test_x = test_x.reshape(test_x.shape[0], test_x.shape[1], 1)

    predictions = model.predict(test_x)
    predictions = scaler.inverse_transform(predictions)

    root_mean_square_error = np.sqrt(np.mean(predictions - test_y) ** 2)

    training = asset_data.iloc[:training_data_size, :]

    formatted_data = {}
    for index, row in training.iterrows():
        formatted_date = index.strftime('%Y-%m-%d')
        value = row['Close']
        formatted_data[formatted_date] = value

    training_data_json = json.dumps(formatted_data).replace('\\', '')

    test_df = pd.DataFrame({"Close": asset_data['Close'].iloc[training_data_size:],
                        "predictions": predictions.reshape(len(predictions))})
    print(test_df)

    formatted_test_data = {}
    for index, row in test_df.iterrows():
        formatted_date = index.strftime('%Y-%m-%d')
        value = row['Close']
        formatted_test_data[formatted_date] = value

    test_data_json = json.dumps(formatted_test_data).replace('\\', '')

    formatted_prediction_data = {}
    for index, row in test_df.iterrows():
        formatted_date = index.strftime('%Y-%m-%d')
        value = row['predictions']
        formatted_prediction_data[formatted_date] = value

    prediction_data_json = json.dumps(formatted_prediction_data).replace('\\', '')

    # Calculate accuracy and expected profit mean
    test_df['percentage_change_stock'] = test_df['Close'].pct_change()
    test_df['percentage_change_model'] = test_df['predictions'].pct_change()

    test_df = test_df.dropna()

    test_df['stock_change_bigger_than_zero'] = np.where(test_df['percentage_change_stock'] > 0,
                                                        True, False)
    test_df['model_change_bigger_than_zero'] = np.where(test_df['percentage_change_model'] > 0,
                                                        True, False)

    test_df['correct_direction'] = np.where(test_df['stock_change_bigger_than_zero'] == test_df['model_change_bigger_than_zero']
                                        , True, False)

    test_df['percentage_change_stock_abs'] = test_df['percentage_change_stock'].abs()

    today_date = datetime.now()

    # Prediction

    df = yf.Ticker(result)
    quotes = df.history(period='2y')
    last_60_days = quotes['Close'].iloc[-60:].values.reshape(-1, 1)

    scaled_last_60_days = scaler.transform(last_60_days)

    test_x = []
    test_x.append(scaled_last_60_days)
    test_x = np.array(test_x)
    test_x = test_x.reshape(test_x.shape[0], test_x.shape[1], 1)

    price_prediction = model.predict(test_x)
    price_prediction = scaler.inverse_transform(price_prediction)

    print(price_prediction)

    correct_direction = test_df['correct_direction'].sum() / len(test_df['correct_direction'])
    wrong_direction = 1 - correct_direction

    average_profit = test_df.groupby('correct_direction')['percentage_change_stock_abs'].mean()

    expected_material_profit = (correct_direction * average_profit[1] - average_profit[0] * wrong_direction) * 100

    profit_to_loss_ratio = average_profit[1] / average_profit[0]

    return {"training": training_data_json, "test": test_data_json, "pred": prediction_data_json, "realPred":  str(price_prediction), "assertRight": str(correct_direction), "expProfitAverage": str(expected_material_profit), "rmse": str(root_mean_square_error)}

    
