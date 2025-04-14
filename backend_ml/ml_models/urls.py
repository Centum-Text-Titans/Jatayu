from django.urls import path
from .views import save_house_loan_json,get_house_loan_json_last_modified,add_customer_data, share_house_loan_json,customer_details,get_house_loan_interest_rate,customer_details_by_id,build_faiss_database
from .views import get_fixed_deposit_last_modified ,save_fixed_deposit_json ,share_fixed_deposit_json,get_fixed_deposit_interest_rate

urlpatterns = [
    
    # -------------------- HOUSE LOAN VIEWS --------------------
    path("api/get_house_loan_json/", share_house_loan_json, name="share_house_loan_json"),
    path("api/save_house_loan_json/", save_house_loan_json, name="save__house_loan_json"),
    path("api/house_loan_last_modified/", get_house_loan_json_last_modified, name="get_house_loan_json_last_modified"),
    path("api/house_loan_predict/", get_house_loan_interest_rate, name="house_loan_prediction"),
    
    # -------------------- GENERAL VIEWS -----------------------
    path("api/add-customer/", add_customer_data, name="add_customer_data"),
    path("api/build-faiss/", build_faiss_database, name="build_faiss_database"),
    path("api/customer-details/<str:cid>/", customer_details_by_id, name="customer_details_by_id"),
    path("api/customer-details/", customer_details, name="customer_details"),
    
    
    # -------------------- FIXED DEPOSIT VIEWS -----------------
    path("api/get_fixed_deposit_json/", share_fixed_deposit_json, name="share_fixed_deposit_json"),
    path("api/save_fixed_deposit_json/", save_fixed_deposit_json, name="save_fixed_deposit_json"),
    path("api/fixed_deposit_last_modified/", get_fixed_deposit_last_modified, name="get_fixed_deposit_last_modified"),
    path("api/fixed_deposit_predict/", get_fixed_deposit_interest_rate, name="get_fixed_deposit_interest_rate"),
]
