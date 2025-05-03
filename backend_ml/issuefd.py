import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder

# ── LOCAL PATH CONFIGURATION ───────────────────────────────────────────────
TRAIN_CSV_RF   = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\csv\train.csv"
MODEL_PATH_RF  = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\rf_model.joblib"
SCALER_PATH_RF = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\scaler.joblib"
FEATURES_RF    = [
    'CreditScore','Geography','Gender','Age','Tenure',
    'Balance','NumOfProducts','HasCrCard','IsActiveMember',
    'EstimatedSalary'
]

# ── LOAD MODEL & PREPROCESSOR ───────────────────────────────────────────────────
rf_model   = joblib.load(MODEL_PATH_RF)
rf_scaler  = joblib.load(SCALER_PATH_RF)  # Use this if you need to scale your inputs

# ── FIT ENCODERS + COMPUTE MIN/MAX FOR RF FEATURES ──────────────────────────────
rf_df = pd.read_csv(TRAIN_CSV_RF)
le_geo = LabelEncoder().fit(rf_df['Geography'])
le_gen = LabelEncoder().fit(rf_df['Gender'])
rf_df['Geography'] = le_geo.transform(rf_df['Geography'])
rf_df['Gender']    = le_gen.transform(rf_df['Gender'])
feature_min_max_rf = {f: (rf_df[f].min(), rf_df[f].max()) for f in FEATURES_RF}

# ── BPS ALLOCATION FOR RF ────────────────────────────────────────────────────────
def compute_scaled_bps(avg_rank, min_bps=10, max_bps=100):
    """
    Compute the total BPS scaled based on the average rank.
    """
    return np.clip(avg_rank, 1, 100) / 100.0 * (max_bps - min_bps) + min_bps

def allocate_bps_rf(input_data, ndigits=2):
    """
    Given a dict of input_data, returns a DataFrame with columns:
     - feature
     - importance (from the RF model)
     - bps (final bps factor for each feature)
    """
    # Get feature importances and calculate the relative importance share.
    imp = rf_model.feature_importances_
    imp_share = imp / imp.sum()

    # Prepare a one‑row DataFrame and encode categorical variables.
    df = pd.DataFrame([input_data])
    df['Geography'] = le_geo.transform(df['Geography'])
    df['Gender']    = le_gen.transform(df['Gender'])

    # Compute normalized ranks [1–100] for each feature based on the training min/max.
    ranks = []
    for f in FEATURES_RF:
        raw = float(df.at[0, f])
        mn, mx = feature_min_max_rf[f]
        if mx <= mn:
            r = 1.0
        else:
            r = 1.0 + (np.clip(raw, mn, mx) - mn) / (mx - mn) * 99.0
        ranks.append(r)

    avg_rank  = np.mean(ranks)
    total_bps = compute_scaled_bps(avg_rank)

    # Initial BPS allocation by importance share, then adjusted by rank.
    init_bps = imp_share * total_bps
    final = np.round(init_bps * np.array(ranks) / 100.0, ndigits)

    # Adjust for any rounding drift by adding the remainder to the most important feature.
    drift = round(init_bps.sum() * avg_rank / 100.0, ndigits) - final.sum()
    if abs(drift) >= 10**(-ndigits):
        final[np.argmax(imp_share)] += drift

    return pd.DataFrame({
        'feature':    FEATURES_RF,
        'importance': imp,
        'bps':        final
    })

# ── HELPER FUNCTION TO RETURN FACTOR‑WISE BPS DICT + TOTAL ───────────────────────
def get_factor_bps(input_data):
    """
    Returns a dictionary mapping each RF feature to its BPS,
    plus 'total_bps' = sum of all feature BPS (multiplied by 2 as an example scaling).
    """
    df_rf = allocate_bps_rf(input_data)
    bps_dict = {row.feature: float(row.bps) for row in df_rf.itertuples()}
    bps_dict['total_bps'] = float(df_rf['bps'].sum()) * 2
    return bps_dict

# ── USAGE EXAMPLE ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    bad_profile = {
        'CreditScore': 800,
        'Geography': 'Spain',
        'Gender': 'Female',
        'Age': 32,
        'Tenure': 6,
        'Balance': 455,
        'NumOfProducts': 6,
        'HasCrCard': 1,
        'IsActiveMember': 1,
        'EstimatedSalary': 20000
    }

    result = get_factor_bps(bad_profile)
    print("Combined Factor BPS:")
    print(result)
    # Example output:
    # {'CreditScore': 12.34, 'Geography': 15.67, ... , 'total_bps': 100.00}
