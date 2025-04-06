from django.urls import path
from .views import save_house_loan_json,get_house_loan_json_last_modified, interest_rate_view, share_house_loan_json,get_loan_rates,ml_prediction_view

urlpatterns = [
    path("api/save-json/", save_house_loan_json, name="save_json"),
    path("api/loan-last-modified/", get_house_loan_json_last_modified, name="get_house_loan_json_last_modified"),
    path("api/interest-rate/", interest_rate_view, name="interest_rate"),
    path("api/loan-json/", share_house_loan_json, name="loan_json"),
    path("api/customer-details/", get_loan_rates, name="customer_details"),
    path("api/house-loan-predict/", ml_prediction_view, name="house_loan_prediction"),
]
