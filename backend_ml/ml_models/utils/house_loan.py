import os
import joblib
import pickle
import pandas as pd
from django.conf import settings
from sklearn.preprocessing import StandardScaler, LabelEncoder, PowerTransformer


# -------------------- Original ML Model Setup --------------------
MODEL_DIR = os.path.join(settings.BASE_DIR, 'ml_models', 'model_weights')
classification_model = joblib.load(os.path.join(MODEL_DIR, "rf_model.joblib"))
classification_scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.joblib"))

with open(os.path.join(MODEL_DIR, "reg_final_model.pkl"), "rb") as f:
    regression_model = pickle.load(f)
    
 
 
   
def classification_model_prediction(input_data):
    print("Loading classification model and scaler using joblib...")
    
    # Prepare input from CSV data; assuming input_data has all the required keys.
    classification_input = {
        'CreditScore': input_data['CreditScore'],
        'Geography': input_data['Geography'],
        'Gender': input_data['Gender'],
        'Age': input_data['Age'],
        'Tenure': input_data['Tenure'],
        # Balance is the sum (we already computed this prior to call)
        'Balance': input_data['Balance'],
        'NumOfProducts': input_data['NumOfProducts'],
        'HasCrCard': input_data['HasCrCard'],
        'IsActiveMember': input_data['IsActiveMember'],
        # EstimatedSalary is taken from AnnualIncome in our database.
        'EstimatedSalary': input_data['EstimatedSalary']
    }
    
    single_row_class = pd.DataFrame([classification_input])
    print("Classification input keys:", classification_input.keys())
    single_row_class_scaled = classification_scaler.transform(single_row_class)
    class_prediction_proba = classification_model.predict_proba(single_row_class_scaled)
    CRS = class_prediction_proba[0][0]  # probability of staying (strong relationship)
    print("Customer Strength (CRS) from model:", CRS)
    return CRS


# def preprocess_input_for_regression(data):
#     df = pd.DataFrame([data])

#     # Normalize column names: remove spaces and strip
#     df.columns = df.columns.str.strip().str.replace(" ", "")

#     # Yes/No fields
#     yes_no_columns = ['BankruptcyHistory', 'PreviousLoanDefaults']
#     yes_no_mapping = {"Yes": 1, "No": 0}

#     for col in yes_no_columns:
#         if col in df.columns:
#             df[col] = df[col].replace(yes_no_mapping)
#             try:
#                 df[col] = df[col].astype('int')
#             except Exception as e:
#                 print(f"Error converting {col} to int: {e}")
#                 df[col] = df[col].fillna(0)

#     # Employment Status
#     employment_mapping = {
#         'Employed': 0,
#         'Self-employed': 1,
#         'Unemployed': 2
#     }
#     for col in ['EmploymentStatus', 'Employmentstatus']:  # in case of variation
#         if col in df.columns:
#             df[col] = df[col].map(employment_mapping).fillna(-1)

#     # Education Level
#     if 'EducationLevel' in df.columns:
#         df['EducationLevel'] = df['EducationLevel'].replace({
#             "High School": 0,
#             "Associate": 1,
#             "Bachelor": 2,
#             "Master": 3,
#             "Doctorate": 4
#         }).fillna(-1)

#     # Payment History (same mapping, if categorical)
#     if 'PaymentHistory' in df.columns:
#         if df['PaymentHistory'].dtype == object:
#             df['PaymentHistory'] = df['PaymentHistory'].replace({
#                 "High School": 0,
#                 "Associate": 1,
#                 "Bachelor": 2,
#                 "Master": 3,
#                 "Doctorate": 4
#             }).fillna(-1)

#     # Encode label columns
#     label_cols = ['MaritalStatus', 'HomeOwnershipStatus', 'LoanPurpose']
#     for col in label_cols:
#         if col in df.columns and df[col].dtype == object:
#             le = LabelEncoder()
#             df[col] = le.fit_transform(df[col].astype(str))

#     # Select numeric columns (excluding object types)
#     num_cols = df.select_dtypes(exclude='object').columns.tolist()

#     # Remove unwanted columns if present
#     for col in ['RiskScore', 'LoanApproved', 'ApplicationDate']:
#         if col in num_cols:
#             num_cols.remove(col)

#     # Standard scaling
#     scaler = StandardScaler()
#     for col in num_cols:
#         df[col] = scaler.fit_transform(df[[col]])

#     # Power transformation (only for positive & variable columns)
#     transform_cols = [
#         col for col in num_cols
#         if df[col].nunique() > 1 and not (df[col] <= 0).any()
#         and col not in ['Age', 'Experience', 'PaymentHistory', 'LengthOfCreditHistory',
#                         'JobTenure', 'BaseInterestRate', 'InterestRate',
#                         'LoanApproved', 'ApplicationDate']
#     ]

#     pt = PowerTransformer(method='yeo-johnson')
#     for col in transform_cols:
#         try:
#             df[col] = pt.fit_transform(df[[col]])
#         except Exception as e:
#             print(f"Skipping transformation for '{col}' due to error: {e}")
#             df[col] = np.log1p(df[col].clip(lower=0))

#     # Final cleanup
#     df = df.drop(columns=['RiskScore', 'LoanApproved', 'ApplicationDate'], errors='ignore')
#     print("Columns after regression preprocessing:", df.columns)

#     return df.values





def preprocess_input_for_regression(data):
    df = pd.DataFrame([data])

    # Normalize column names: remove spaces and strip
    df.columns = df.columns.str.strip().str.replace(" ", "")

    # Yes/No fields (from health_mapping)
    yes_no_columns = ['BankruptcyHistory', 'PreviousLoanDefaults', 'HasCrCard', 'IsActiveMember']
    yes_no_mapping = {"Yes": 1, "No": 0}

    for col in yes_no_columns:
        if col in df.columns:
            df[col] = df[col].replace(yes_no_mapping)
            try:
                df[col] = df[col].astype('int')
            except Exception as e:
                print(f"Error converting {col} to int: {e}")
                df[col] = df[col].fillna(0)

    # EmploymentStatus Mapping (from health_mapping)
    employment_mapping = {
        "Full-Time Employed": 0,
        "Government Employee": 0,
        "Self-Employed": 1,
        "Part-Time/Freelance": 2,
        "Unemployed": 3
    }
    for col in ['EmploymentStatus', 'Employmentstatus']:  # just in case
        if col in df.columns:
            df[col] = df[col].map(employment_mapping).fillna(-1)

    # EducationLevel Mapping (from health_mapping)
    education_mapping = {
        "Doctorate/Master's": 3,
        "Bachelor's Degree": 2,
        "Diploma/High School": 1,
        "Below High School": 0
    }
    if 'EducationLevel' in df.columns:
        df['EducationLevel'] = df['EducationLevel'].map(education_mapping).fillna(-1)

    # PaymentHistory Mapping (from health_mapping)
    payment_history_mapping = {
        "High": 2,
        "Middle": 1,
        "Low": 0
    }
    if 'PaymentHistory' in df.columns:
        if df['PaymentHistory'].dtype == object:
            df['PaymentHistory'] = df['PaymentHistory'].map(payment_history_mapping).fillna(-1)

    # MaritalStatus Mapping (from health_mapping)
    marital_status_mapping = {
        "Married": 2,
        "Single": 1,
        "Divorced/Separated": 0
    }
    if 'MaritalStatus' in df.columns:
        df['MaritalStatus'] = df['MaritalStatus'].map(marital_status_mapping).fillna(-1)

    # HomeOwnershipStatus Mapping (from health_mapping)
    home_ownership_mapping = {
        "Own Home": 2,
        "Mortgage": 1,
        "Renting": 0
    }
    if 'HomeOwnershipStatus' in df.columns:
        df['HomeOwnershipStatus'] = df['HomeOwnershipStatus'].map(home_ownership_mapping).fillna(-1)

    # LoanPurpose Mapping (from health_mapping)
    loan_purpose_mapping = {
        "Home Purchase": 5,
        "Education Loan": 4,
        "Car Loan": 3,
        "Medical Loan": 2,
        "Personal Loan": 1,
        "Vacation/Leisure Loan": 0
    }
    if 'LoanPurpose' in df.columns:
        df['LoanPurpose'] = df['LoanPurpose'].map(loan_purpose_mapping).fillna(-1)

    # Select numeric columns (excluding object types)
    num_cols = df.select_dtypes(exclude='object').columns.tolist()

    # Remove unwanted columns if present
    for col in ['RiskScore', 'LoanApproved', 'ApplicationDate']:
        if col in num_cols:
            num_cols.remove(col)

    # Standard scaling
    scaler = StandardScaler()
    for col in num_cols:
        df[col] = scaler.fit_transform(df[[col]])

    # Power transformation (only for positive & variable columns)
    transform_cols = [
        col for col in num_cols
        if df[col].nunique() > 1 and not (df[col] <= 0).any()
        and col not in ['Age', 'Experience', 'PaymentHistory', 'LengthOfCreditHistory',
                        'JobTenure', 'BaseInterestRate', 'InterestRate',
                        'LoanApproved', 'ApplicationDate']
    ]

    pt = PowerTransformer(method='yeo-johnson')
    for col in transform_cols:
        try:
            df[col] = pt.fit_transform(df[[col]])
        except Exception as e:
            print(f"Skipping transformation for '{col}' due to error: {e}")
            df[col] = np.log1p(df[col].clip(lower=0))

    # Final cleanup
    df = df.drop(columns=['RiskScore', 'LoanApproved', 'ApplicationDate'], errors='ignore')
    print("Columns after regression preprocessing:", df.columns)

    return df.values


def risk_assessment_prediction(input_data):
    processed_data = preprocess_input_for_regression(input_data)
    prediction = regression_model.predict(processed_data)[0]
    return prediction


def regression_model_prediction(input_data):
    regression_input = input_data  # modify as needed if remapping is required
    predicted_risk_raw = risk_assessment_prediction(regression_input)
    RAS = predicted_risk_raw / 100.0  # Normalize the risk score if needed
    print(f"Predicted Risk Assessment Score (normalized): {RAS:.4f}")
    return RAS

def calculate_house_loan_bps(CRS_value, RAS_normalized,base_rate):
    MT = 0.30  # Fixed market trend value
    w1 = 0.5   # Weight for CRS
    w2 = 0.4   # Weight for risk (using 1 - RAS)
    w3 = 0.1   # Weight for market trends (using 1 - MT)
    # base_rate = 8.5  # Base interest rate in percent
    print(CRS_value,RAS_normalized)
    
    bps = 10 + 90 * (w1 * CRS_value + w2 * (1 - RAS_normalized) + w3 * (1 - MT))
    bps = max(10, min(100, round(float(bps), 2)))
    
    bps_deduction = bps / 100.0  # Convert to percentage
    # final_rate = base_rate - bps_deduction
    final_rate = round(base_rate - bps_deduction, 2) 
    print(f"Calculated BPS: {bps} bps")
    print(f"BPS Deduction: {bps_deduction:.2f}%")
    print(f"Final Home Loan Interest Rate: {final_rate:.2f}%")
    return bps, bps_deduction, final_rate

