# importing modules
import os
import json
import requests
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt



# Importing key Functions 
from .utils.fiass import build_faiss_index_from_pdf
from .utils.house_loan_rag import rag_predict_scores,rag_crs_predict_scores
from .utils.web_scrape import save_sbi_fd_rates ,save_house_loan_to_json
from .utils.extract_data import map_columns_with_llm , extract_text_from_pdf ,extract_customer_data_from_pdf
from .utils.house_loan import classification_model_prediction , regression_model_prediction ,calculate_house_loan_bps
from .utils.fixed_deposit import calculate_fd_bps



LOCAL_SCHEMA_COLUMNS = ["CustomerID", "CustomerName", "Tenure", "Age", "Gender", "MaritalStatus", "AnnualIncome", "MonthlyIncome", "CreditScore", "EmploymentStatus", "EducationLevel", "Experience", "LoanAmount", "LoanDuration", "NumberOfDependents", "HomeOwnershipStatus", "MonthlyDebtPayments", "CreditCardUtilizationRate", "NumberOfOpenCreditLines", "NumberOfCreditInquiries", "DebtToIncomeRatio", "BankruptcyHistory", "LoanPurpose", "PreviousLoanDefaults", "PaymentHistory", "LengthOfCreditHistory", "SavingsAccountBalance", "CheckingAccountBalance", "TotalAssets", "TotalLiabilities", "UtilityBillsPaymentHistory", "JobTenure", "NetWorth", "BaseInterestRate", "InterestRate", "MonthlyLoanPayment", "TotalDebtToIncomeRatio", "Geography", "NumOfProducts", "HasCrCard", "IsActiveMember"]




# -------------------- HOUSE LOAN VIEWS --------------------

@csrf_exempt
def get_house_loan_interest_rate(request):
    if request.method == "POST":
        try:
            # Determine if data is sent as JSON or FormData.
            if request.content_type == "application/json":
                data = json.loads(request.body)
            else:
                data = request.POST

            # Extract minimal data from the request.
            customer_id = data.get('customer_id', None)
            loan_amount = data.get('LoanAmount', None)
            loan_duration = data.get('LoanDuration', None)
            base_rate = data.get('BaseRate', None)
            print(customer_id)
            print(loan_amount)
            print(loan_duration)
            print(base_rate)
            if not customer_id:
                return JsonResponse({"error": "customer_id is required."}, status=400)
            if loan_amount is None or loan_duration is None or base_rate is None:
                return JsonResponse({"error": "LoanAmount, LoanDuration, and BaseRate are required."}, status=400)

            # Load the customer data from CSV
            db_path = os.path.join(settings.BASE_DIR, 'db', 'houseloan','sample_data.csv')
            df = pd.read_csv(db_path)
            df["CustomerID"] = df["CustomerID"].astype(str).str.replace('\ufeff', '').str.strip()
            customer_id = str(customer_id).strip()

            # Now match the row
            row = df[df["CustomerID"] == customer_id]
            

            if row.empty:
                raise ValueError(f"No customer with ID {customer_id}")


            customer_row = row.iloc[0]
            geography_value = customer_row['Geography']
            geography_encoded = pd.Categorical([geography_value]).codes[0]
            gender_value = customer_row['Gender']
            gender_encoded = pd.Categorical([gender_value]).codes[0]
            cr_value = customer_row['HasCrCard']
            cr_encoded = pd.Categorical([cr_value]).codes[0]
            active_value = customer_row['IsActiveMember']
            active_value_encoded = pd.Categorical([active_value]).codes[0]
            crs_input = {
                'CreditScore': customer_row['CreditScore'],
                'Geography': geography_encoded,
                'Gender': gender_encoded,
                'Age': customer_row['Age'],
                'Tenure': customer_row['Tenure'],
                # Sum Checking and Savings balances to get the total Balance for the model.
                'Balance': customer_row['SavingsAccountBalance'] + customer_row['CheckingAccountBalance'],
                'NumOfProducts': customer_row['NumOfProducts'],
                'HasCrCard': cr_encoded,
                'IsActiveMember': active_value_encoded,
                # Use AnnualIncome as EstimatedSalary as per your mapping.
                'EstimatedSalary': customer_row['AnnualIncome']
            }
            missing_crs = [k for k, v in crs_input.items() if v is None or pd.isnull(v)]
            print("Missing CRS fields:", missing_crs)

            # Assemble RAS inputs...
            payment_value = customer_row['PaymentHistory']
            payment_value_encoded = pd.Categorical([payment_value]).codes[0]
            utility_payment_value = customer_row['UtilityBillsPaymentHistory']
            utility_payment_value_encoded = pd.Categorical([utility_payment_value]).codes[0]
            ras_input = {
                'Age': customer_row['Age'],
                'AnnualIncome': customer_row['AnnualIncome'],  # Assuming AnnualIncome is monthly
                'CreditScore': customer_row['CreditScore'],
                'EmploymentStatus': customer_row['EmploymentStatus'],
                'EducationLevel': customer_row['EducationLevel'],
                'Experience': customer_row['Experience'],
                'LoanAmount': loan_amount,
                'LoanDuration': loan_duration,
                'MaritalStatus': customer_row['MaritalStatus'],
                'NumberOfDependents': customer_row['NumberOfDependents'],
                'HomeOwnershipStatus': customer_row['HomeOwnershipStatus'],
                'MonthlyDebtPayments': customer_row['MonthlyDebtPayments'],
                'CreditCardUtilizationRate': customer_row['CreditCardUtilizationRate'],
                'NumberOfOpenCreditLines': customer_row['NumberOfOpenCreditLines'],
                'NumberOfCreditInquiries': customer_row['NumberOfCreditInquiries'],
                'DebtToIncomeRatio': customer_row['DebtToIncomeRatio'],
                'BankruptcyHistory': customer_row['BankruptcyHistory'],
                'LoanPurpose': customer_row['LoanPurpose'],
                'PreviousLoanDefaults': customer_row['PreviousLoanDefaults'],
                'PaymentHistory': payment_value_encoded,
                'LengthOfCreditHistory': customer_row['LengthOfCreditHistory'],
                'SavingsAccountBalance': customer_row['SavingsAccountBalance'],
                'CheckingAccountBalance': customer_row['CheckingAccountBalance'],
                'TotalAssets': customer_row['TotalAssets'],
                'TotalLiabilities': customer_row['TotalLiabilities'],
                'MonthlyIncome': customer_row['MonthlyIncome'],
                'UtilityBillsPaymentHistory': utility_payment_value_encoded,
                'JobTenure': customer_row['JobTenure'],
                'NetWorth': customer_row['NetWorth'],
                'BaseInterestRate': customer_row['BaseInterestRate'],
                'InterestRate': customer_row['InterestRate'],
                'MonthlyLoanPayment': customer_row['MonthlyLoanPayment'],
                'TotalDebtToIncomeRatio': customer_row['TotalDebtToIncomeRatio']
            }
            missing_ras = [k for k, v in ras_input.items() if v is None or pd.isnull(v)]
            print("Missing RAS fields:", missing_ras)

            # Predict CRS and RAS scores using the appropriate models.
            if not missing_crs or not missing_ras:
                crs_score = classification_model_prediction(crs_input)
                ras_score = regression_model_prediction(ras_input)
            else:
                print(f"[WARN] Missing CRS fields {missing_crs}, using fallback.")
                print(f"[WARN] Missing RAS fields {missing_ras}, using fallback.")
                score = rag_predict_scores(ras_input,crs_input)
                print("gemini response",score)
                crs_score = score['CRS']
                ras_score = score['RAS']

            # Compute BPS and the final interest rate.
            bps, deduction, final_rate = calculate_house_loan_bps(crs_score, ras_score,base_rate)

            response_data = {
                "CRS": crs_score,
                "RAS": ras_score,
                "base_rate" :base_rate,
                "BPS": bps,
                "BPS_Deduction": deduction,
                "loan_amount": loan_amount,
                "loan_duration": loan_duration,
                "FinalRate": final_rate
            }

            print("Response:", response_data)
            return JsonResponse(response_data, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "POST method required."}, status=405)

@csrf_exempt
def save_house_loan_json(request):
    print("im called")
    """
    Scrape loan rate data and save it as a JSON file.
    
    Endpoint: GET /save-house-loan-json/
    """
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)
    try:
        json_file_path = save_house_loan_to_json()
        return JsonResponse({
            "message": f"Loan data successfully saved to '{json_file_path}'."
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
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


# -------------------- GENERAL VIEWS -----------------------


@csrf_exempt
def customer_details(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)

    csv_folder = os.path.join(settings.BASE_DIR, "db", "houseloan")
    csv_path = os.path.join(csv_folder, "sample_data.csv")  # Adjust this path if needed
    if not os.path.exists(csv_path):
        return JsonResponse({"error": "CSV file not found"}, status=404)

    try:
        df = pd.read_csv(csv_path)
        json_data = df.to_dict(orient='records')  # Convert the DataFrame to a list of dictionaries

        # Loop over each record and replace null values with "Not Obtained"
        for record in json_data:
            for key, value in record.items():
                # Use pandas isna to catch NaN values as well as None
                if pd.isna(value):
                    record[key] = "Not Obtained"

        return JsonResponse({"details": json_data}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def customer_details_by_id(request, cid):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)

    csv_folder = os.path.join(settings.BASE_DIR, "db", "houseloan")
    csv_path = os.path.join(csv_folder, "sample_data.csv")

    if not os.path.exists(csv_path):
        return JsonResponse({"error": "CSV file not found"}, status=404)

    try:
        df = pd.read_csv(csv_path)
        df["CustomerID"] = df["CustomerID"].astype(str)

        customer = df[df["CustomerID"] == str(cid)]
        if customer.empty:
            return JsonResponse({"error": "Customer not found"}, status=404)

        customer_dict = customer.iloc[0].to_dict()

        # Replace nulls with "Not Obtained"
        for key in customer_dict:
            if pd.isna(customer_dict[key]):
                customer_dict[key] = "Not Obtained"

        minimal_data = {
            "CustomerID": customer_dict.get("CustomerID"),
            "CustomerName": customer_dict.get("CustomerName"),
            "Age": customer_dict.get("Age"),
            "CreditScore": customer_dict.get("CreditScore"),
            "MaritalStatus": customer_dict.get("MaritalStatus"),
            "EducationLevel": customer_dict.get("EducationLevel"),
            "AnnualIncome": customer_dict.get("AnnualIncome"),
            "HomeOwnershipStatus": customer_dict.get("HomeOwnershipStatus")
        }

        return JsonResponse(minimal_data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def build_faiss_database(request):
    if request.method == "POST":
        try:
            if 'pdf' not in request.FILES:
                return JsonResponse({"error": "PDF file is required."}, status=400)

            pdf_file = request.FILES['pdf']

            # Save to temp file
            temp_pdf_path = os.path.join(settings.BASE_DIR, 'temp_upload.pdf')
            with open(temp_pdf_path, 'wb+') as destination:
                for chunk in pdf_file.chunks():
                    destination.write(chunk)

            num_chunks = build_faiss_index_from_pdf(temp_pdf_path)

            os.remove(temp_pdf_path)  # Clean up temp file

            return JsonResponse({
                "message": "FAISS index built successfully.",
                "chunks_indexed": num_chunks,
                "index_path": "saved in db check in fs"
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST method required."}, status=405)

@csrf_exempt 
def add_customer_data(request):
    try:
        if request.method != 'POST':
            print("Non-POST request received")
            return JsonResponse({"error": "Only POST requests are allowed."}, status=405)

        # Retrieve the "addedBy" value from the POST data.
        added_by = request.POST.get('addedBy', 'admin')
        print("added_by:", added_by)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            print("No file uploaded.")
            return JsonResponse({"error": "No file uploaded."}, status=400)

        print("Uploaded file name:", uploaded_file.name)
        filename = uploaded_file.name.lower()

        if filename.endswith(('.csv', '.xlsx')):
            try:
                if filename.endswith('.csv'):
                    df = pd.read_csv(uploaded_file)
                else:
                    df = pd.read_excel(uploaded_file)
                print("DataFrame loaded successfully:")
                print(df.head())  # Print first few rows for debugging
            except Exception as e:
                print("Error reading file:", e)
                return JsonResponse({"error": "Error reading file: " + str(e)}, status=400)

            uploaded_columns = list(df.columns)
            print("Uploaded columns:", uploaded_columns)

            # Exclude 'AddedBy' before mapping
            expected_columns = [col for col in LOCAL_SCHEMA_COLUMNS if col != 'AddedBy']

            if set(uploaded_columns) != set(expected_columns):
                mapping = map_columns_with_llm(uploaded_columns, expected_columns)
                print("Mapping applied:", mapping)
                df.rename(columns=mapping, inplace=True)
                df = df[[col for col in expected_columns if col in df.columns]]
                print("DataFrame after renaming columns:")
                print(df.head())

            # Append the addedBy value separately.
            df['AddedBy'] = added_by
            print("DataFrame after appending AddedBy:")
            print(df.head())

            local_db_path = os.path.join(settings.BASE_DIR, 'db', 'houseloan', 'sample_data.csv')
            
            if os.path.exists(local_db_path):
                df.to_csv(local_db_path, mode='a', header=False, index=False)
                print("CSV appended to existing file.")
            else:
                df.to_csv(local_db_path, index=False)
                print("CSV created as new file.")

            return JsonResponse({"message": "File processed and data saved.", "addedBy": added_by})

        elif filename.endswith('.pdf'):
            try:
                # Process the PDF file to extract text.
                pdf_text = extract_text_from_pdf(uploaded_file)
                print("Extracted PDF text:")
                print(pdf_text)
            except Exception as e:
                print("Error processing PDF:", e)
                return JsonResponse({"error": "Error processing PDF: " + str(e)}, status=400)

            # Use the LLM to extract the relevant customer data; note "AddedBy" is excluded.
            customer_data = extract_customer_data_from_pdf(pdf_text, LOCAL_SCHEMA_COLUMNS)
            if not customer_data:
                print("No customer data extracted from PDF.")
                return JsonResponse({"error": "Unable to extract customer data from the PDF."}, status=400)

            print("Extracted customer data from PDF:", customer_data)
            # Append the addedBy value.
            customer_data['AddedBy'] = added_by

            df_pdf = pd.DataFrame([customer_data])
            print("DataFrame created from PDF data:")
            print(df_pdf.head())

            local_db_path = os.path.join(settings.BASE_DIR, 'db', 'houseloan', 'sample_data.csv')
            
            if os.path.exists(local_db_path):
                df_pdf.to_csv(local_db_path, mode='a', header=False, index=False)
                print("PDF data appended to existing CSV.")
            else:
                df_pdf.to_csv(local_db_path, index=False)
                print("PDF data written to new CSV.")

            return JsonResponse({"message": "PDF processed and customer data saved.", "addedBy": added_by})
        else:
            print("Unsupported file type:", filename)
            return JsonResponse({"error": "File type not supported for processing."}, status=400)

    except Exception as e:
        print("Unexpected error:", e)
        return JsonResponse({"error": "An unexpected error occurred: " + str(e)}, status=500)




# -------------------- FIXED DEPOSIT VIEWS -----------------




@csrf_exempt
def save_fixed_deposit_json(request):
    """
    A Django view that triggers the scraping utility to fetch fixed deposit rates,
    saves the JSON file, and returns the data.
    This endpoint requires a POST request.
    """
    if request.method == "POST":
        try:
            # Scrape and save the fixed deposit JSON data.
            json_file_path = save_sbi_fd_rates()

            # Load the saved JSON data.
            with open(json_file_path, "r") as f:
                data = json.load(f)

            return JsonResponse({
                "status": "success",
                "file_path": json_file_path,
                "data": data
            })
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=500)
    return JsonResponse({
        "status": "error",
        "message": "POST method required"
    }, status=405)


@csrf_exempt
def share_fixed_deposit_json(request):
    """
    Endpoint: GET /share-json/
    Returns a JSON response with the fixed deposit rates data.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed."}, status=405)

    json_filepath = os.path.join(settings.BASE_DIR, "db", "jsons", "fixed_deposit_rates.json")
    
    if not os.path.exists(json_filepath):
        return JsonResponse({"error": "JSON data file not found."}, status=404)
    
    try:
        with open(json_filepath, "r") as f:
            loan_data = json.load(f)
    except Exception as e:
        return JsonResponse({"error": f"Failed to load JSON data: {str(e)}"}, status=500)

    return JsonResponse(loan_data)

@csrf_exempt
def get_fixed_deposit_last_modified(request):
    """
    Returns the last modified date for the house loan JSON file.
    Endpoint: GET /get-house-loan-json-last-modified/
    """
    # Construct the JSON file path
    json_filename = os.path.join(settings.BASE_DIR, "db", "jsons", "fixed_deposit_rates.json")
    print(json_filename)
    
    if not os.path.exists(json_filename):
        return JsonResponse({"error": "JSON file does not exist."}, status=404)
    
    # Get the last modified timestamp and convert it to a datetime object
    last_modified_timestamp = os.path.getmtime(json_filename)
    last_modified_datetime = datetime.fromtimestamp(last_modified_timestamp)
    formatted_date = last_modified_datetime.strftime("%Y-%m-%d %H:%M:%S")
    
    return JsonResponse({"last_modified": formatted_date})


@csrf_exempt
def get_fixed_deposit_interest_rate(request):
    if request.method == "POST":
        try:
            # Determine if data is sent as JSON or FormData.
            if request.content_type == "application/json":
                data = json.loads(request.body)
            else:
                data = request.POST

            # Extract minimal data from the request.
            customer_id = data.get('customer_id', None)
            loan_amount = data.get('LoanAmount', None)
            loan_duration = data.get('LoanDuration', None)
            base_rate = data.get('BaseRate', None)
            print(customer_id)
            print(loan_amount)
            print(loan_duration)
            print(base_rate)
            if not customer_id:
                return JsonResponse({"error": "customer_id is required."}, status=400)
            if loan_amount is None or loan_duration is None or base_rate is None:
                return JsonResponse({"error": "LoanAmount, LoanDuration, and BaseRate are required."}, status=400)

            # Load the customer data from CSV
            db_path = os.path.join(settings.BASE_DIR, 'db', 'houseloan','sample_data.csv')
            df = pd.read_csv(db_path)
            df["CustomerID"] = df["CustomerID"].astype(str).str.replace('\ufeff', '').str.strip()
            customer_id = str(customer_id).strip()

            # Now match the row
            row = df[df["CustomerID"] == customer_id]
            

            if row.empty:
                raise ValueError(f"No customer with ID {customer_id}")


            customer_row = row.iloc[0]
            geography_value = customer_row['Geography']
            geography_encoded = pd.Categorical([geography_value]).codes[0]
            gender_value = customer_row['Gender']
            gender_encoded = pd.Categorical([gender_value]).codes[0]
            cr_value = customer_row['HasCrCard']
            cr_encoded = pd.Categorical([cr_value]).codes[0]
            active_value = customer_row['IsActiveMember']
            active_value_encoded = pd.Categorical([active_value]).codes[0]
            crs_input = {
                'CreditScore': customer_row['CreditScore'],
                'Geography': geography_encoded,
                'Gender': gender_encoded,
                'Age': customer_row['Age'],
                'Tenure': customer_row['Tenure'],
                # Sum Checking and Savings balances to get the total Balance for the model.
                'Balance': customer_row['SavingsAccountBalance'] + customer_row['CheckingAccountBalance'],
                'NumOfProducts': customer_row['NumOfProducts'],
                'HasCrCard': cr_encoded,
                'IsActiveMember': active_value_encoded,
                # Use AnnualIncome as EstimatedSalary as per your mapping.
                'EstimatedSalary': customer_row['AnnualIncome']
            }
            missing_crs = [k for k, v in crs_input.items() if v is None or pd.isnull(v)]
            print("Missing CRS fields:", missing_crs)

          

            # Predict CRS and RAS scores using the appropriate models.
            if not missing_crs :
                crs_score = classification_model_prediction(crs_input)
            else:
                print(f"[WARN] Missing CRS fields {missing_crs}, using fallback.")
                score = rag_crs_predict_scores(crs_input)
                print("gemini response",score)
                crs_score = score['CRS']

            # Compute BPS and the final interest rate.
            norm_crs = crs_score *100
            bps, bonus_bps, final_rate = calculate_fd_bps(norm_crs,loan_amount,loan_duration ,base_rate )
            print("bps",bps)
            print("bonus_bps",bonus_bps)
            print("final_rate",final_rate)

            response_data = {
                "CRS": crs_score,
                "base_rate" :base_rate,
                "BPS": bps,
                "Bonus_bps": bonus_bps,
                "loan_amount": loan_amount,
                "loan_duration": loan_duration,
                "FinalRate": final_rate
            }

            print("Response:", response_data)
            return JsonResponse(response_data, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "POST method required."}, status=405)
