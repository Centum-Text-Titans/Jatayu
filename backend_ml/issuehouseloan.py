import pandas as pd
import numpy as np
import joblib
import pickle
from sklearn.preprocessing import LabelEncoder

# ── LOCAL PATH CONFIGURATION ───────────────────────────────────────────────
TRAIN_CSV_RF   = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\csv\train.csv"
MODEL_PATH_RF  = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\rf_model.joblib"
SCALER_PATH_RF = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\scaler.joblib"
FEATURES_RF    = [
    'CreditScore', 'Geography', 'Gender', 'Age', 'Tenure',
    'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember',
    'EstimatedSalary'
]

TRAIN_CSV_XGB  = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\csv\Loan.csv"
MODEL_PATH_XGB = r"C:\Users\Vishnu\Documents\Gitprojects\Jatayu\backend_ml\ml_models\model_weights\reg_final_model.pkl"
XGB_CAT        = ['MaritalStatus', 'HomeOwnershipStatus', 'LoanPurpose']
EMP_MAP        = {"Unemployed": 0, "Self-Employed": 1, "Employed": 2}
EDU_MAP        = {
    "High School": 0, "Associate": 1, "Bachelor": 2,
    "Master": 3, "Doctorate": 4
}

# ── LOAD MODELS & PREPROCESSORS ─────────────────────────────────────────────
rf_model  = joblib.load(MODEL_PATH_RF)
rf_scaler = joblib.load(SCALER_PATH_RF)
xgb_model = pickle.load(open(MODEL_PATH_XGB, "rb"))

# Preprocess the RF training data: fit label encoders and compute min/max values
rf_df = pd.read_csv(TRAIN_CSV_RF)
le_geo = LabelEncoder().fit(rf_df['Geography'])
le_gen = LabelEncoder().fit(rf_df['Gender'])
rf_df['Geography'] = le_geo.transform(rf_df['Geography'])
rf_df['Gender']    = le_gen.transform(rf_df['Gender'])
feature_min_max_rf = {f: (rf_df[f].min(), rf_df[f].max()) for f in FEATURES_RF}

# Preprocess the XGB training data: map, encode and compute min/max for numeric features
xgb_df = pd.read_csv(TRAIN_CSV_XGB)
xgb_df['EmploymentStatus'] = xgb_df['EmploymentStatus'].map(EMP_MAP)
xgb_df['EducationLevel']   = xgb_df['EducationLevel'].map(EDU_MAP)
xgb_encoders = {}
for c in XGB_CAT:
    le = LabelEncoder().fit(xgb_df[c])
    xgb_df[c] = le.transform(xgb_df[c])
    xgb_encoders[c] = le
feature_min_max_xgb = {
    f: (xgb_df[f].min(), xgb_df[f].max())
    for f in xgb_df.select_dtypes(include=np.number).columns
}

# ── ALLOCATION FUNCTIONS ─────────────────────────────────────────────────────
def compute_scaled_bps(avg_rank, min_bps=10, max_bps=100):
    """Compute total BPS scaled based on the average rank."""
    return np.clip(avg_rank, 1, 100) / 100.0 * (max_bps - min_bps)

def allocate_bps_rf_new(input_data, ndigits=2):
    """Allocate BPS values using the Random Forest model."""
    imp = rf_model.feature_importances_
    imp_share = imp / imp.sum()
    
    df = pd.DataFrame([input_data])
    df['Geography'] = le_geo.transform(df['Geography'])
    df['Gender']    = le_gen.transform(df['Gender'])

    ranks = []
    for f in FEATURES_RF:
        raw = float(df.at[0, f])
        mn, mx = feature_min_max_rf[f]
        r = 1.0 if mx <= mn else 1.0 + (np.clip(raw, mn, mx) - mn) / (mx - mn) * 99.0
        ranks.append(r)
    
    avg_rank = np.mean(ranks)
    total_bps = compute_scaled_bps(avg_rank)
    init_bps = imp_share * total_bps
    final   = np.round(init_bps * np.array(ranks) / 100.0, ndigits)

    drift = round(init_bps.sum() * avg_rank / 100.0, ndigits) - final.sum()
    if abs(drift) >= 10**(-ndigits):
        final[np.argmax(imp_share)] += drift

    return pd.DataFrame({
        'feature':    FEATURES_RF,
        'importance': imp,
        'bps':        final
    })

def allocate_bps_xgb_new(input_data, ndigits=2, imp_type='gain'):
    """Allocate BPS values using the XGB model."""
    scores = xgb_model.get_booster().get_score(importance_type=imp_type)
    total_imp = sum(scores.values()) or 1.0
    imp_share = {f: w / total_imp for f, w in scores.items()}

    raw_vals = {}
    for f in scores:
        if f == 'EmploymentStatus':
            raw_vals[f] = EMP_MAP[input_data[f]]
        elif f == 'EducationLevel':
            raw_vals[f] = EDU_MAP[input_data[f]]
        elif f in XGB_CAT:
            le = xgb_encoders[f]
            v  = input_data[f]
            raw_vals[f] = le.transform([v if v in le.classes_ else le.classes_[0]])[0]
        else:
            raw_vals[f] = float(input_data.get(f, 0.0))

    ranks = {}
    for f, (mn, mx) in feature_min_max_xgb.items():
        if f in scores:
            ranks[f] = 1.0 if mx <= mn else 1.0 + (np.clip(raw_vals[f], mn, mx) - mn) / (mx - mn) * 99.0

    avg_rank = np.mean(list(ranks.values()))
    total_bps = compute_scaled_bps(avg_rank)
    init_bps = {f: imp_share[f] * total_bps for f in scores}
    
    final = {f: round(init_bps[f] * ranks[f] / 100.0, ndigits) for f in scores}
    drift = round(sum(init_bps.values()) * avg_rank / 100.0, ndigits) - sum(final.values())
    if abs(drift) >= 10**(-ndigits):
        top = max(imp_share, key=imp_share.get)
        final[top] += drift

    return pd.DataFrame({
        'feature':    list(final.keys()),
        'importance': [scores[f] for f in final],
        'bps':        [final[f] for f in final]
    })

def merge_bps(df1, df2):
    """Merge the BPS allocations from RF and XGB models."""
    c = pd.concat([df1[['feature', 'bps']], df2[['feature', 'bps']]])
    m = c.groupby('feature', as_index=False)['bps'].sum()
    return m

def get_factor_bps(input_data):
    """
    Returns a dictionary mapping each feature to its combined (RF+XGB) BPS,
    plus a key 'total_bps' for the total across features.
    """
    rf_df  = allocate_bps_rf_new(input_data)
    xgb_df = allocate_bps_xgb_new(input_data)
    merged = merge_bps(rf_df, xgb_df)
    
    bps_dict = {row.feature: row.bps for row in merged.itertuples()}
    bps_dict['total_bps'] = float(merged['bps'].sum())
    return bps_dict

# ── SAMPLE EXECUTION ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Define a sample profile (adjust these values as needed):
    sample_profile = {
        'CreditScore': 900,
        'Geography': 'Germany',
        'Gender': 'Male',
        'Age': 60,
        'Tenure': 15,
        'Balance': 300000,
        'NumOfProducts': 1,
        'HasCrCard': 1,
        'IsActiveMember': 1,
        'EstimatedSalary': 200000,
        'EmploymentStatus': 'Employed',
        'EducationLevel': 'Doctorate',
        'MaritalStatus': 'Married',
        'HomeOwnershipStatus': 'Own',
        'LoanPurpose': 'Home Purchase',
        'LoanAmount': 100000,
        'LoanDuration': 10,
        'PreviousLoanDefaults': 0,
        'BankruptcyHistory': 0,
        'PaymentHistory': 1.00,
        'LengthOfCreditHistory': 40,
        'JobTenure': 30,
        'MonthlyLoanPayment': 2000,
        'MonthlyDebtPayments': 500,
        'NumberOfOpenCreditLines': 2,
        'NumberOfCreditInquiries': 0,
        'AnnualIncome': 250000,
        'CreditCardUtilizationRate': 0.05,
        'DebtToIncomeRatio': 0.10,
        'TotalDebtToIncomeRatio': 0.08,
        'SavingsAccountBalance': 150000,
        'CheckingAccountBalance': 30000,
        'TotalAssets': 500000,
        'TotalLiabilities': 50000,
        'MonthlyIncome': 10000
    }
    
    bad = {
        'CreditScore':300,'Geography':'Spain','Gender':'Female','Age':22,'Tenure':0,
        'Balance':0,'NumOfProducts':4,'HasCrCard':0,'IsActiveMember':0,
        'EstimatedSalary':20000,'EmploymentStatus':'Unemployed','EducationLevel':'High School',
        'MaritalStatus':'Single','HomeOwnershipStatus':'Rent','LoanPurpose':'Debt Consolidation',
        'LoanAmount':5000,'LoanDuration':2,'PreviousLoanDefaults':2,'BankruptcyHistory':1,
        'PaymentHistory':0.60,'LengthOfCreditHistory':1,'JobTenure':0,'MonthlyLoanPayment':300,
        'MonthlyDebtPayments':1000,'NumberOfOpenCreditLines':8,'NumberOfCreditInquiries':5,
        'AnnualIncome':18000,'CreditCardUtilizationRate':0.90,'DebtToIncomeRatio':0.75,
        'TotalDebtToIncomeRatio':0.80,'SavingsAccountBalance':500,'CheckingAccountBalance':200,
        'TotalAssets':1000,'TotalLiabilities':15000,'MonthlyIncome':5000
    }
    # Best profile
    best = {
        'CreditScore':900,'Geography':'Germany','Gender':'Male','Age':60,'Tenure':15,
        'Balance':300000,'NumOfProducts':1,'HasCrCard':1,'IsActiveMember':1,
        'EstimatedSalary':200000,'EmploymentStatus':'Employed','EducationLevel':'Doctorate',
        'MaritalStatus':'Married','HomeOwnershipStatus':'Own','LoanPurpose':'Home Purchase',
        'LoanAmount':100000,'LoanDuration':10,'PreviousLoanDefaults':0,'BankruptcyHistory':0,
        'PaymentHistory':1.00,'LengthOfCreditHistory':40,'JobTenure':30,'MonthlyLoanPayment':2000,
        'MonthlyDebtPayments':500,'NumberOfOpenCreditLines':2,'NumberOfCreditInquiries':0,
        'AnnualIncome':250000,'CreditCardUtilizationRate':0.05,'DebtToIncomeRatio':0.10,
        'TotalDebtToIncomeRatio':0.08,'SavingsAccountBalance':150000,'CheckingAccountBalance':30000,
        'TotalAssets':500000,'TotalLiabilities':50000,'MonthlyIncome':10000
    }
    
    
    new_customer_no_history = {
        'CreditScore': 300,                        # No credit history
        'Geography': 'Germany',                  # Still use favorable geography
        'Gender': 'Male',
        'Age': 28,
        'Tenure': 0,                             # No banking relationship
        'Balance': 0.0,
        'NumOfProducts': 0,
        'HasCrCard': 0,
        'IsActiveMember': 1,
        'EstimatedSalary': 70000,

        'EmploymentStatus': 'Employed',
        'EducationLevel': 'Bachelor',
        'MaritalStatus': 'Single',
        'HomeOwnershipStatus': 'Rent',
        'LoanPurpose': 'Personal Loan',

        'LoanAmount': 20000,
        'LoanDuration': 5,
        'PreviousLoanDefaults': 0,
        'BankruptcyHistory': 0,
        'PaymentHistory': 0.0,                   # No credit repayment history
        'LengthOfCreditHistory': 0,
        'JobTenure': 2,
        'MonthlyLoanPayment': 400,
        'MonthlyDebtPayments': 400,
        'NumberOfOpenCreditLines': 0,
        'NumberOfCreditInquiries': 1,
        'AnnualIncome': 70000,
        'CreditCardUtilizationRate': 0.0,        # No credit usage
        'DebtToIncomeRatio': 0.15,
        'TotalDebtToIncomeRatio': 0.15,
        'SavingsAccountBalance': 0.0,
        'CheckingAccountBalance': 0.0,
        'TotalAssets': 5000,
        'TotalLiabilities': 5000,
        'MonthlyIncome': 5800
    }

    # Call the function to get factor BPS and print the result
    factor_bps = get_factor_bps(sample_profile)
    print("Combined Factor BPS:")
    for feature, bps in factor_bps.items():
        print(f"{feature}: {bps}")
