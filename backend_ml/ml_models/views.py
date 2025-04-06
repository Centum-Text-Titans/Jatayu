import os
import json
import re
import numpy as np
import pandas as pd
import joblib
import pickle
import requests
from bs4 import BeautifulSoup
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from sklearn.preprocessing import StandardScaler, LabelEncoder, PowerTransformer

from datetime import datetime



# Define the model weights directory relative to BASE_DIR
MODEL_DIR = os.path.join(settings.BASE_DIR,'ml_models', 'model_weights')

# Load classification model and scaler once (for best performance)
classification_model = joblib.load(os.path.join(MODEL_DIR, "rf_model.joblib"))
classification_scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.joblib"))

# Load regression model using pickle
with open(os.path.join(MODEL_DIR, "reg_final_model.pkl"), "rb") as f:
    regression_model = pickle.load(f)

# --------------------- Regression Preprocessing Functions ---------------------

def preprocess_input_for_regression(data):
    """
    Preprocess input data to fit the regression model's format.
    Expects a dictionary and returns a processed numpy array.
    """
    df = pd.DataFrame([data])
    
    # Convert columns to integer as needed
    for col in ['BankruptcyHistory', 'PreviousLoanDefaults', 'LoanApproved']:
        df[col] = df[col].astype('int')
    
    # Map categorical features to numerical values
    df['EmploymentStatus'] = df['EmploymentStatus'].replace({
        "Unemployed": 0,
        "Self-Employed": 1,
        "Employed": 2
    })
    df['EducationLevel'] = df['EducationLevel'].replace({
        "High School": 0,
        "Associate": 1,
        "Bachelor": 2,
        "Master": 3,
        "Doctorate": 4
    })
    
    # Label encode specific columns
    label_cols = ['MaritalStatus', 'HomeOwnershipStatus', 'LoanPurpose']
    l = LabelEncoder()
    for col in label_cols:
        df[col] = l.fit_transform(df[col])
    
    # Identify numeric columns and standard scale them
    num_cols = df.select_dtypes(exclude='object').columns.to_list()
    if 'RiskScore' in num_cols:
        num_cols.remove('RiskScore')
    
    s = StandardScaler()
    for col in num_cols:
        df[col] = s.fit_transform(df[[col]])
    
    # Determine which columns are eligible for power transformation (based on rules)
    exclude_cols = [
        'Age', 'Experience', 'PaymentHistory', 'LengthOfCreditHistory', 
        'JobTenure', 'BaseInterestRate', 'InterestRate', 'RiskScore', 
        'LoanApproved', 'ApplicationDate'
    ]
    transform_cols = [col for col in num_cols if col not in exclude_cols]
    transform_cols = [col for col in transform_cols if df[col].nunique() > 1 and not (df[col] <= 0).any()]
    
    p = PowerTransformer(method='yeo-johnson')
    for col in transform_cols:
        try:
            df[col] = p.fit_transform(df[[col]])
        except Exception as e:
            df[col] = np.log1p(df[col])
    
    # Drop columns not required by the regression model
    df = df.drop(columns=['RiskScore', 'LoanApproved', 'ApplicationDate'], errors='ignore')
    return df.values

def risk_assessment_prediction(data):
    """
    Preprocesses input data and predicts a risk score.
    """
    processed_data = preprocess_input_for_regression(data)
    prediction = regression_model.predict(processed_data)[0]
    return prediction

# --------------------- Main ML Prediction View ---------------------
@csrf_exempt
def ml_prediction_view(request):
    if request.method == "POST":
        try:
            # Check if request is JSON or FormData
            if request.content_type == "application/json":
                data = json.loads(request.body)
            else:
                data = request.POST

            # --------- Classification Input -----------  
            classification_input = {
                'CreditScore': float(data.get('CreditScore', 650)),
                'Geography': int(data.get('Geography', 1)),
                'Gender': int(data.get('Gender', 0)),
                'Age': int(data.get('Age', 40)),
                'Tenure': int(data.get('Tenure', 3)),
                'Balance': float(data.get('Balance', 150000)),
                'NumOfProducts': int(data.get('NumOfProducts', 2)),
                'HasCrCard': int(data.get('HasCrCard', 1)),
                'IsActiveMember': int(data.get('IsActiveMember', 1)),
                'EstimatedSalary': float(data.get('EstimatedSalary', 100000))
            }

            # Process classification input and predict probability
            single_row_class = pd.DataFrame([classification_input])
            single_row_class_scaled = classification_scaler.transform(single_row_class)
            class_prediction_proba = classification_model.predict_proba(single_row_class_scaled)
            CRS = class_prediction_proba[0][0]  # Customer Relationship Strength

            # --------- Regression Input -----------  
            regression_input = {
                "ApplicationDate": data.get("ApplicationDate", "2025-03-28"),
                "Age": int(data.get("Age_reg", 45)),
                "AnnualIncome": float(data.get("AnnualIncome", 60000)),
                "CreditScore": float(data.get("CreditScore_reg", 700)),
                "EmploymentStatus": data.get("EmploymentStatus", "Employed"),
                "EducationLevel": data.get("EducationLevel", "Bachelor"),
                "Experience": int(data.get("Experience", 10)),
                "LoanAmount": float(data.get("LoanAmount", 25000)),
                "LoanDuration": int(data.get("LoanDuration", 5)),
                "MaritalStatus": data.get("MaritalStatus", "Married"),
                "NumberOfDependents": int(data.get("NumberOfDependents", 2)),
                "HomeOwnershipStatus": data.get("HomeOwnershipStatus", "Own"),
                "MonthlyDebtPayments": float(data.get("MonthlyDebtPayments", 800)),
                "CreditCardUtilizationRate": float(data.get("CreditCardUtilizationRate", 0.25)),
                "NumberOfOpenCreditLines": int(data.get("NumberOfOpenCreditLines", 4)),
                "NumberOfCreditInquiries": int(data.get("NumberOfCreditInquiries", 1)),
                "DebtToIncomeRatio": float(data.get("DebtToIncomeRatio", 0.35)),
                "BankruptcyHistory": int(data.get("BankruptcyHistory", 0)),
                "LoanPurpose": data.get("LoanPurpose", "Home Renovation"),
                "PreviousLoanDefaults": int(data.get("PreviousLoanDefaults", 0)),
                "PaymentHistory": float(data.get("PaymentHistory", 0.98)),
                "LengthOfCreditHistory": int(data.get("LengthOfCreditHistory", 15)),
                "SavingsAccountBalance": float(data.get("SavingsAccountBalance", 10000)),
                "CheckingAccountBalance": float(data.get("CheckingAccountBalance", 5000)),
                "TotalAssets": float(data.get("TotalAssets", 200000)),
                "TotalLiabilities": float(data.get("TotalLiabilities", 50000)),
                "MonthlyIncome": float(data.get("MonthlyIncome", 5000)),
                "UtilityBillsPaymentHistory": float(data.get("UtilityBillsPaymentHistory", 0.95)),
                "JobTenure": int(data.get("JobTenure", 8)),
                "NetWorth": float(data.get("NetWorth", 150000)),
                "BaseInterestRate": float(data.get("BaseInterestRate", 0.03)),
                "InterestRate": float(data.get("InterestRate", 0.045)),
                "MonthlyLoanPayment": float(data.get("MonthlyLoanPayment", 500)),
                "TotalDebtToIncomeRatio": float(data.get("TotalDebtToIncomeRatio", 0.4)),
                "LoanApproved": int(data.get("LoanApproved", 1)),
                "RiskScore": float(data.get("RiskScore", 50))
            }

            # Predict risk score and normalize (assuming model outputs a 0-100 score)
            predicted_risk_raw = risk_assessment_prediction(regression_input)
            RAS = predicted_risk_raw / 100.0

            # --------- Base Rate and BPS Calculation -----------  
            base_rate = float(data.get("BaseRate", 8.5))  # Default base rate

            # Market Trend factor (fixed for now)
            MT = 0.30
            # Weights as defined
            w1 = 0.4   # Weight for CRS
            w2 = 0.5   # Weight for (1 - RAS)
            w3 = 0.1   # Weight for (1 - MT)

            # Calculate BPS
            bps = 10 + 90 * (w1 * CRS + w2 * (1 - RAS) + w3 * (1 - MT))
            bps = float(bps)
            bps = max(10, min(100, round(bps, 2)))  # Clamp BPS to [10, 100]
            bps_deduction = bps / 100.0  # Convert bps to percentage deduction
            final_rate = base_rate - bps_deduction

            # Prepare JSON response
            response_data = {
                "Customer Relation Ship Score": CRS,
                "Risk Assessment Score": round(RAS,3),
                "bps discount": bps,
                "bps available for discount": round(bps_deduction, 4),
                "base rate": base_rate,
                "final rate": round(final_rate, 4)
            }
            return JsonResponse(response_data, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "POST method required."}, status=405)



def clean_rate_text(rate_str):
    """
    Clean the rate string by removing tokens like "%" and "p.a.",
    and return the first numeric value found as a float.
    """
    rate_str = rate_str.replace("%", "").replace("p.a.", "").strip()
    matches = re.findall(r"\d+\.\d+|\d+", rate_str)
    if matches:
        return float(matches[0])
    return None


@csrf_exempt
def get_loan_rates(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)
    
    csv_folder = os.path.join(settings.BASE_DIR, "db", "houseloan")
    csv_path = os.path.join(csv_folder, "sample_data.csv")  # Adjust this path
    if not os.path.exists(csv_path):
        return JsonResponse({"error": "CSV file not found"}, status=404)
    
    try:
        df = pd.read_csv(csv_path)
        json_data = df.to_dict(orient='records')  # Converts the DataFrame to a list of dictionaries
        return JsonResponse({"details": json_data}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_house_loan_json_last_modified(request):
    """
    Returns the last modified date for the house loan JSON file.
    Endpoint: GET /get-house-loan-json-last-modified/
    """
    # Construct the JSON file path
    json_filename = os.path.join(settings.BASE_DIR, "db", "jsons", "house_loan_rates.json")
    
    if not os.path.exists(json_filename):
        return JsonResponse({"error": "JSON file does not exist."}, status=404)
    
    # Get the last modified timestamp and convert it to a datetime object
    last_modified_timestamp = os.path.getmtime(json_filename)
    last_modified_datetime = datetime.fromtimestamp(last_modified_timestamp)
    formatted_date = last_modified_datetime.strftime("%Y-%m-%d %H:%M:%S")
    
    return JsonResponse({"last_modified": formatted_date})



@csrf_exempt
def save_house_loan_json(request):
    """
    Scrape loan rate data and save it as a JSON file in the 'db' directory.
    
    Endpoint: GET /save-house-loan-json/
    """
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)

    url = "https://www.bankbazaar.com/sbi-home-loan.html"
    response = requests.get(url)
    if response.status_code != 200:
        return JsonResponse(
            {"error": f"Failed to retrieve the page; status code: {response.status_code}"},
            status=response.status_code
        )

    html_content = response.text
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Locate all tables with the specified class and choose the second one.
    tables = soup.find_all("table", class_="w-full caption-bottom text-sm border")
    if len(tables) < 2:
        return JsonResponse({"error": "Less than 2 tables found with the specified class."}, status=404)
    
    table = tables[1]
    loan_data = {}
    
    # Process each row of the selected table.
    rows = table.find_all("tr")
    for row in rows:
        cells = row.find_all(["th", "td"])
        if len(cells) >= 2:
            loan_type = cells[0].get_text(strip=True)
            rate_text = cells[1].get_text(strip=True)
            if not any(char.isdigit() for char in rate_text):
                continue

            # Handle rate ranges, e.g., "10% to 12%"
            if "to" in rate_text:
                parts = rate_text.split("to")
                from_rate = clean_rate_text(parts[0])
                to_rate = clean_rate_text(parts[1])
            else:
                value = clean_rate_text(rate_text)
                from_rate = value
                to_rate = value

            if from_rate is not None and to_rate is not None:
                loan_data[loan_type] = {"from_rate": from_rate, "to_rate": to_rate}

    # Construct the path for the 'db' directory and ensure it exists.
    db_folder = os.path.join(settings.BASE_DIR, "db","jsons")  # Adjust if your intended path is "backend_ml/backend_ml/db"
    os.makedirs(db_folder, exist_ok=True)
    
    # Define the JSON file path.
    json_filename = os.path.join(db_folder, "house_loan_rates.json")
    
    # Save the data as a JSON file.
    try:
        with open(json_filename, "w") as f:
            json.dump(loan_data, f, indent=4)
    except Exception as e:
        return JsonResponse({"error": f"Failed to save JSON file: {str(e)}"}, status=500)
    
    return JsonResponse({"message": f"Loan data successfully saved to '{json_filename}'."})


@csrf_exempt
def interest_rate_view(request):
    """
    View 2: Calculate and return the applicable interest rate for a given loan type
    and credit score via linear interpolation.
    
    Query Parameters:
      - loan_type (string): The type of loan as identified in the JSON.
      - credit_score (number): The applicant's credit score.
    
    Endpoint example (GET): /interest-rate/?loan_type=Standard&credit_score=700
    """
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)
    
    loan_type = request.GET.get("loan_type")
    credit_score = request.GET.get("credit_score")
    
    if not loan_type or not credit_score:
        return JsonResponse(
            {"error": "Missing required parameters: 'loan_type' and/or 'credit_score'."},
            status=400
        )
    
    try:
        credit_score = float(credit_score)
    except ValueError:
        return JsonResponse({"error": "'credit_score' must be a number."}, status=400)
    
    # Load the saved JSON data.
    json_filename = os.path.join(settings.BASE_DIR, "myapp", "sbi_hl_rates.json")
    if not os.path.exists(json_filename):
        return JsonResponse(
            {"error": "JSON data file not found. Please call the save-json endpoint first."},
            status=404
        )
    
    try:
        with open(json_filename, "r") as f:
            loan_data = json.load(f)
    except Exception as e:
        return JsonResponse({"error": f"Failed to load JSON data: {str(e)}"}, status=500)
    
    if loan_type not in loan_data:
        return JsonResponse(
            {"error": f"Loan type '{loan_type}' not found in the data."},
            status=404
        )
    
    slab = loan_data[loan_type]
    from_rate = slab["from_rate"]
    to_rate   = slab["to_rate"]

    # Define credit score boundaries (FICO scores).
    min_score = 300
    max_score = 850
    # Clamp the provided credit score within the boundaries.
    credit_score = max(min_score, min(credit_score, max_score))
    
    # Compute the interest rate using linear interpolation.
    factor = (max_score - credit_score) / (max_score - min_score)
    interest_rate = from_rate + factor * (to_rate - from_rate)
    interest_rate = round(interest_rate, 2)
    
    return JsonResponse({
        "loan_type": loan_type,
        "credit_score": credit_score,
        "calculated_interest_rate": interest_rate
    })

@csrf_exempt
def share_house_loan_json(request):
    """
    Endpoint: GET /share-json/
    Returns a JSON response with each loan's "to_rate" only.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)

    json_filepath = os.path.join(settings.BASE_DIR, "db", "jsons", "house_loan_rates.json")
    if not os.path.exists(json_filepath):
        return JsonResponse({"error": "JSON data file not found."}, status=404)

    try:
        with open(json_filepath, "r") as f:
            loan_data = json.load(f)
    except Exception as e:
        return JsonResponse({"error": f"Failed to load JSON data: {str(e)}"}, status=500)

    # Create a new dictionary with only the "to_rate" for each loan
    result = {loan: details.get("to_rate") for loan, details in loan_data.items()}
    
    return JsonResponse(result)