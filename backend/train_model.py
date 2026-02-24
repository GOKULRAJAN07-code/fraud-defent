import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import os

# Create dummy transaction dataset
def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    # Features: amount, user_age_days, device_trust_score, velocity_1h, distance_from_home
    amount = np.random.exponential(scale=100, size=num_samples)
    user_age_days = np.random.randint(1, 3650, size=num_samples)
    device_trust = np.random.uniform(0.1, 1.0, size=num_samples)
    velocity_1h = np.random.poisson(lam=2, size=num_samples)
    distance = np.random.exponential(scale=50, size=num_samples)

    df = pd.DataFrame({
        'amount': amount,
        'user_age_days': user_age_days,
        'device_trust_score': device_trust,
        'velocity_1h': velocity_1h,
        'distance_from_home': distance
    })

    # Simple logic for fraud: High amount + high velocity + far away + low device trust
    fraud_prob = (
        (df['amount'] > 500).astype(int) * 0.3 + 
        (df['velocity_1h'] > 5).astype(int) * 0.3 + 
        (df['distance_from_home'] > 500).astype(int) * 0.2 + 
        (df['device_trust_score'] < 0.3).astype(int) * 0.4
    )
    
    # Add some noise
    fraud_prob += np.random.normal(0, 0.1, size=num_samples)
    df['is_fraud'] = (fraud_prob > 0.6).astype(int)
    
    return df

def train_and_save():
    print("Generating synthetic data...")
    df = generate_synthetic_data(10000)
    
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy on test set: {accuracy:.4f}")
    
    os.makedirs('app/models', exist_ok=True)
    model_path = 'app/models/fraud_model.json'
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save()
