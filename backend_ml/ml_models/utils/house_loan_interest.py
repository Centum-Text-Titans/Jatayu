import pandas as pd
feature_bps = {
    "PreviousLoanDefaults": 13.837,
    "Age": 9.548,
    "EstimatedSalary": 6.981,
    "CreditScore": 6.456,
    "NumOfProducts": 5.913,
    "DebtToIncomeRatio": 5.706,
    "NetWorth": 5.453,
    "Balance": 4.724,
    "MonthlyIncome": 5.245,
    "Tenure": 3.162,
    "TotalDebtToIncomeRatio": 3.87,
    "EmploymentStatus": 3.667,
    "AnnualIncome": 2.834,
    "IsActiveMember": 1.921,
    "Gender": 0.747,
    "CreditCardUtilizationRate": 0.719,
    "TotalAssets": 0.671,
    "HasCrCard": 0.549,
    "EducationLevel": 0.527,
    "LoanDuration": 0.325,
    "LoanAmount": 0.255,
    "SavingsAccountBalance": 0.169,
    "NumberOfOpenCreditLines": 0.166,
    "HomeOwnershipStatus": 0.165,
    "TotalLiabilities": 0.157,
    "MonthlyDebtPayments": 0.155,
    "PaymentHistory": 0.152,
    "UtilityBillsPaymentHistory": 0.151,
    "JobTenure": 0.145,
    "CheckingAccountBalance": 0.138,
    "NumberOfCreditInquiries": 0.137,
    "MaritalStatus": 0.131,
    "LoanPurpose": 0.121,
    "NumberOfDependents": 0.106
}


feature_bps_fd = {
    "Age": 20.0,
    "EstimatedSalary": 14.9,
    "CreditScore": 13.781,
    "NumOfProducts": 12.621,
    "Balance": 10.082,
    "Tenure": 6.75,
    "IsActiveMember": 4.101,
    "Gender": 1.595,
    "HasCrCard": 1.171
}

# --- Health Mapping for each feature ---
health_mapping = {
    "CreditScore": [
        (750, float('inf'), 100),
        (700, 750, 75),
        (650, 700, 50),
        (float('-inf'), 650, 20)
    ],
    "Age": [
        (30, 55, 100),
        (25, 30, 70),
        (55, 65, 70),
        (float('-inf'), 25, 30),
        (65, float('inf'), 30)
    ],
    "Tenure": [
        (7, float('inf'), 100),
        (4, 7, 75),
        (1, 4, 40),
        (float('-inf'), 1, 20)
    ],
    "Balance": [
        (100000, float('inf'), 100),
        (50000, 100000, 80),
        (10000, 50000, 60),
        (float('-inf'), 10000, 30)
    ],
    "NumOfProducts": [
        (4, 4, 100),
        (3, 3, 90),
        (2, 2, 75),
        (1, 1, 50)
    ],
    "HasCrCard": [
        ("Yes", "Yes", 80),
        ("No", "No", 50)
    ],
    "IsActiveMember": [
        ("Yes", "Yes", 100),
        ("No", "No", 40)
    ],
    "EstimatedSalary": [
        (150000, float('inf'), 100),
        (100000, 150000, 80),
        (50000, 100000, 60),
        (float('-inf'), 50000, 30)
    ],
    "LoanPurpose": [
        ("Home Purchase", "Home Purchase", 100),
        ("Education Loan", "Education Loan", 85),
        ("Car Loan", "Car Loan", 70),
        ("Medical Loan", "Medical Loan", 50),
        ("Personal Loan", "Personal Loan", 30),
        ("Vacation/Leisure Loan", "Vacation/Leisure Loan", 10)
    ],
    "HomeOwnershipStatus": [
        ("Own Home", "Own Home", 100),
        ("Mortgage", "Mortgage", 80),
        ("Renting", "Renting", 40)
    ],
    "MaritalStatus": [
        ("Married", "Married", 100),
        ("Single", "Single", 70),
        ("Divorced/Separated", "Divorced/Separated", 40)
    ],
    "EducationLevel": [
        ("Doctorate/Master's", "Doctorate/Master's", 100),
        ("Bachelor's Degree", "Bachelor's Degree", 80),
        ("Diploma/High School", "Diploma/High School", 50),
        ("Below High School", "Below High School", 20)
    ],
    "EmploymentStatus": [
        ("Full-Time Employed", "Full-Time Employed", 100),
        ("Government Employee", "Government Employee", 100),
        ("Self-Employed", "Self-Employed", 70),
        ("Part-Time/Freelance", "Part-Time/Freelance", 50),
        ("Unemployed", "Unemployed", 0)
    ],
    "DebtToIncomeRatio": [
        (0, 20, 100),
        (20, 35, 62),
        (35, float('inf'), 0)
    ],
    "AnnualIncome": [
        (100000, float('inf'), 100),
        (50000, 100000, 70),
        (30000, 50000, 40),
        (float('-inf'), 30000, 0)
    ],
    "Experience (Years)": [
        (10, float('inf'), 100),
        (5, 10, 70),
        (2, 5, 40),
        (float('-inf'), 2, 0)
    ],
    "LoanAmount": [
        (0, 0.3, 100),
        (0.3, 0.5, 60),
        (0.5, float('inf'), 0)
    ],
    "LoanDuration (Months)": [
        (0, 36, 100),
        (36, 60, 70),
        (60, float('inf'), 40)
    ],
    "NumberOfDependents": [
        (0, 2, 100),
        (2, 4, 70),
        (4, float('inf'), 40)
    ],
    "MonthlyDebtPayments": [
        (0, 15, 100),
        (15, 30, 60),
        (30, float('inf'), 20)
    ],
    "CreditCardUtilizationRate": [
        (0, 30, 100),
        (30, 50, 60),
        (50, float('inf'), 0)
    ],
    "NumberOfOpenCreditLines": [
        (3, 7, 100),
        (1, 3, 70),
        (7, 10, 70),
        (float('-inf'), 1, 30),
        (10, float('inf'), 30)
    ],
    "NumberOfCreditInquiries": [
        (0, 2, 100),
        (2, 4, 50),
        (4, float('inf'), 0)
    ],
    "BankruptcyHistory": [
        ("No", "No", 100),
        ("Yes", "Yes", 0)
    ],
    "PreviousLoanDefaults": [
        (0, 1, 100),
        (1, 3, 50),
        (3, float('inf'), 0)
    ],
    "PaymentHistory": [
        ("High", "High", 100),
        ("Middle", "Middle", 60),
        ("Low", "Low", 0)
    ],
    "LengthOfCreditHistory (Years)": [
        (10, float('inf'), 100),
        (5, 10, 60),
        (float('-inf'), 5, 20)
    ],
    "SavingsAccountBalance": [
        (10000, float('inf'), 100),
        (2000, 10000, 60),
        (float('-inf'), 2000, 0)
    ],
    "CheckingAccountBalance": [
        (5000, float('inf'), 100),
        (1000, 5000, 60),
        (float('-inf'), 1000, 0)
    ],
    "TotalAssets": [
        (100000, float('inf'), 100),
        (30000, 100000, 60),
        (float('-inf'), 30000, 0)
    ],
    "TotalLiabilities": [
        (0, 0.5, 100),
        (0.5, 0.8, 50),
        (0.8, float('inf'), 0)
    ],
    "MonthlyIncome": [
        (8000, float('inf'), 100),
        (4000, 8000, 70),
        (float('-inf'), 4000, 30)
    ],
    "UtilityBillsPaymentHistory": [
        (0.9, float('inf'), 100),
        (0.7, 0.9, 70),
        (float('-inf'), 0.7, 30)
    ],
    "JobTenure": [
        (5, float('inf'), 100),
        (2, 5, 70),
        (float('-inf'), 2, 30)
    ],
    "NetWorth": [
        (100000, float('inf'), 100),
        (30000, 100000, 60),
        (float('-inf'), 30000, 0)
    ],
    "TotalDebtToIncomeRatio": [
        (0, 30, 100),
        (30, 50, 50),
        (50, float('inf'), 0)
    ],
    "Gender": [
        ("Male", "Male", 100),
        ("Female", "Female", 100)
    ]
}

# --- Functions for Calculation ---
def get_health_percent(feature_name, value):
    if feature_name not in health_mapping:
        return 100
    for lower, upper, health in health_mapping[feature_name]:
        if isinstance(lower, (int, float)):
            if lower <= value < upper:
                return health
        else:
            if value == lower:
                return health
    return 0

def calculate_final_bps(customer_data):
    total_bps = 0
    detailed = {}
    health={}
    for feat, val in customer_data.items():
        base = feature_bps.get(feat, 0)
        h = get_health_percent(feat, val)
        earned = base * h / 100
        total_bps += earned
        detailed[feat] = earned
        health[feat]=h
    return total_bps, detailed,health

def calculate_final_bps_fd(customer_data):
    total_bps = 0
    detailed = {}
    health={}
    for feat, val in customer_data.items():
        base = feature_bps_fd.get(feat, 0)
        h = get_health_percent(feat, val)
        earned = base * h / 100
        total_bps += earned
        detailed[feat] = earned
        health[feat]=h
    return total_bps, detailed,health



def process_customer_house_loan(csv_path, customer_id, base_rate=10.0):
    import pandas as pd

    df = pd.read_csv(csv_path)
    row = df[df['CustomerID'] == (str(customer_id))]
    if row.empty:
        print(f"CustomerID {customer_id} not found.")
        return
    row = row.iloc[0]
    
    # Build only the features we care about
    cust_data = {}
    for feat in feature_bps:
        if feat in row:
            if not pd.isna(row[feat]):  # <-- correct check
                cust_data[feat] = row[feat]
            else:
                cust_data[feat] = 0
                print(f"Warning: '{feat}' is empty—using 0.")
        else:
            cust_data[feat] = 0
            print(f"Warning: '{feat}' missing—using 0.")
    
    # Calculate BPS
    total_bps, bps_details,health = calculate_final_bps(cust_data)
    final_rate = base_rate - total_bps / 100

    print(f"\nTotal BPS Earned: {total_bps:.2f}")
    print(f"Final Interest Rate: {final_rate:.2f}%\n")
    print("Feature-wise Contribution:")

    # Prepare enriched details
    enriched_details = []
    for f, bps in bps_details.items():
        enriched_details.append({
            "parameter": f,
            "value": int(cust_data.get(f, 0)) if isinstance(cust_data.get(f, 0), (int, float)) else str(cust_data.get(f, 0)),
            "bps": float(bps),
            "health": float(health[f])
        })
    
    print(f"\nSum of Contributions: {sum(bps_details.values()):.2f} bps")
    
    return enriched_details, total_bps






def process_customer_fixed_deposit(csv_path, customer_id, base_rate=10.0):
    import pandas as pd

    df = pd.read_csv(csv_path)
    row = df[df['CustomerID'] == (str(customer_id))]
    if row.empty:
        print(f"CustomerID {customer_id} not found.")
        return
    row = row.iloc[0]
    
    # Build only the features we care about
    cust_data = {}
    for feat in feature_bps_fd:
        if feat in row:
            if not pd.isna(row[feat]):  # <-- correct check
                cust_data[feat] = row[feat]
            else:
                cust_data[feat] = 0
                print(f"Warning: '{feat}' is empty—using 0.")
        else:
            cust_data[feat] = 0
            print(f"Warning: '{feat}' missing—using 0.")
    
    # Calculate BPS
    total_bps, bps_details,health = calculate_final_bps_fd(cust_data)
    final_rate = base_rate - total_bps / 100

    print(f"\nTotal BPS Earned: {total_bps:.2f}")
    print(f"Final Interest Rate: {final_rate:.2f}%\n")
    print("Feature-wise Contribution:")

    # Prepare enriched details
    enriched_details = []
    for f, bps in bps_details.items():
        enriched_details.append({
            "parameter": f,
            "value": int(cust_data.get(f, 0)) if isinstance(cust_data.get(f, 0), (int, float)) else str(cust_data.get(f, 0)),
            "bps": float(bps),
            "health": float(health[f])
        })
    
    print(f"\nSum of Contributions: {sum(bps_details.values()):.2f} bps")
    
    return enriched_details, total_bps
