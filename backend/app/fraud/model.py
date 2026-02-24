import xgboost as xgb
import shap
import pandas as pd
import numpy as np
import os
import json

MODEL_PATH = "app/models/fraud_model.json"
model = None
explainer = None

def load_model():
    global model, explainer
    if os.path.exists(MODEL_PATH):
        model = xgb.XGBClassifier()
        model.load_model(MODEL_PATH)
        # TreeExplainer is best for XGBoost
        explainer = shap.TreeExplainer(model)
        return True
    return False

def predict_fraud(transaction_data: dict):
    """
    Expects dict with: amount, user_age_days, device_trust_score, velocity_1h, distance_from_home
    Returns: (fraud_score(float), is_fraud(bool), shap_explanations(list))
    """
    if model is None:
        success = load_model()
        if not success:
            raise RuntimeError("Fraud model not initialized or found.")

    df = pd.DataFrame([transaction_data])
    
    # Predict probability
    prob = model.predict_proba(df)[0][1]
    is_fraud = bool(prob > 0.5)
    
    # Generate explanation
    shap_values = explainer.shap_values(df)
    
    # Format explanations
    features = list(transaction_data.keys())
    # shap_values[0] because we passed 1 row. Might be a list of arrays for multiclass, 
    # but binary classification gives one array if objective=binary:logistic
    if isinstance(shap_values, list): # depending on shap version
        sv = shap_values[1][0] 
    else:
        sv = shap_values[0]
        
    explanations = []
    for feature_name, shap_val, feature_val in zip(features, sv, df.iloc[0]):
        explanations.append({
            "feature": feature_name,
            "value": float(feature_val),
            "contribution": float(shap_val)
        })
        
    # Sort by absolute contribution to see the most impactful features
    explanations.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        
    return float(prob), is_fraud, explanations
