
---

# 📊 Dynamic Pricing for Financial Products - FD & Home Loans

## Introduction

In the competitive landscape of banking services, pricing plays a critical role in customer retention and profitability. Traditionally, banks offer **Fixed Deposits (FD)** and **Home Loans** with interest rates determined by predefined slab tables. However, this static approach limits banks' ability to customize offerings based on individual customer profiles and market dynamics.

This project introduces **Dynamic Pricing of Financial Products**, leveraging **Machine Learning (ML)**, **Django**, and **MERN Stack** to recommend personalized interest rates for Fixed Deposits and Home Loans. This solution empowers banks to dynamically suggest rates that reflect customer profiles, market trends, and risk factors, ensuring both competitiveness and risk mitigation.

---

## 📌 Business Use Case

### Current Process
Banks currently rely on rigid, pre-approved slab tables to determine interest rates for FD and Home Loans. This static pricing:
- Lacks personalization.
- Misses opportunities to offer better deals to loyal or low-risk customers.
- Increases chances of loan defaults due to generalized risk assessment.

### Proposed Solution
This project implements a **Dynamic Pricing Model** that considers:
- Customer's Credit History.
- Risk Rating (calculated based on financial behavior and loan repayment history).
- Age Factor (customer lifecycle stage).
- Customer’s tenure with the bank.
- Past transaction history and financial product engagement.
- Current market trends and economic indicators.

Based on these inputs, the **ML Model** dynamically suggests optimized interest rates, offering:
- **Premium Discounts** (ranging from **10 to 100 basis points**) to trustworthy customers.
- **Risk-Based Premium Loading** for high-risk customers, safeguarding the bank's interests.

---

## 💻 Technology Stack

| Layer           | Technology                    |
|------------------|---------------------|
| Frontend        | **MERN Stack (React, Express, Node, MongoDB)** |
| Backend (ML)   | **Django REST Framework** |
| Machine Learning | **Python (scikit-learn, pandas, numpy)** |
| Deployment      | **Docker & Cloud (optional)** |

---

## 🧰 Project Architecture

```
+------------------------------------------------+
|            Frontend (React)                    |
| - Customer Dashboard (Interest Rate Check)    |
| - Admin Dashboard (Rate Customization, Audit) |
+------------------------------------------------+
                  |
                  v
+------------------------------------------------+
|            Backend (Express.js)                 |
| - API Gateway                                   |
| - Authentication                               |
+------------------------------------------------+
                  |
                  v
+------------------------------------------------+
|      ML Model Backend (Django)                  |
| - Customer Risk Scoring                        |
| - Dynamic Rate Prediction                      |
| - Rate Adjustment Rules (Premium/Discount)     |
+------------------------------------------------+
                  |
                  v
+------------------------------------------------+
|            MongoDB Database                    |
| - Customer Profiles                            |
| - Product Transactions                        |
| - Pricing History                              |
+------------------------------------------------+
```

---

## 📊 Key Features

✅ Customer Dashboard to check personalized FD/Home Loan rates.  
✅ Admin Portal to review applied rates, monitor premium/discount patterns, and audit model performance.  
✅ Dynamic Rate Calculation using real-time customer data and market trends.  
✅ Risk-Based Pricing to ensure financial safety for the bank.  
✅ Seamless Integration between React UI, Express API Gateway, and Django ML Service.  
✅ Historical Pricing Logs to maintain transparency and compliance.

---

## 📉 Machine Learning Model

### Key Inputs
- Credit Score
- Past Defaults/Delinquencies
- Account Age
- Monthly Income vs. Commitments
- Transaction Volumes (Savings, FD, Loans)
- Market Interest Rates & Inflation Trends
- Age and Risk Profile

### Model Techniques
- Classification (Risk Category Prediction)
- Regression (Dynamic Rate Recommendation)
- Time Series Analysis (Market Trend Monitoring)

### Output
- **Recommended Interest Rate (FD/Loan)** for the customer.
- Risk Justification (to explain why discount/premium is applied).

---

## 🏗️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd dynamic-pricing
```

### 2️⃣ Backend - Django Setup (ML Service)
```bash
cd backend-ml
python -m venv venv
source venv/bin/activate  # For Windows use venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3️⃣ Backend - Express API Gateway Setup
```bash
cd api-gateway
npm install
npm start
```

### 4️⃣ Frontend - React App Setup
```bash
cd frontend
npm install
npm run dev
```

### 5️⃣ Database Setup
- Start MongoDB service.
- Use connection string in `api-gateway/config/db.js`.

---

## 📦 Folder Structure

```
dynamic-pricing/
├── backend-ml/        # Django ML Service
├── api-gateway/       # Express API Gateway
├── frontend/          # React Frontend
├── docs/               # Documentation & Reports
└── README.md           # Project Documentation
```

---

## ⚙️ API Flow

| Component  | Function  | Technology |
|---|---|---|
| Customer UI  | Show Rates & History  | React |
| API Gateway  | Request Handler & Routing | Express.js |
| ML Service  | Rate Calculation & Risk Analysis  | Django (Python) |
| Database  | Data Storage  | MongoDB |

---

## 📈 Sample Flow Diagram

1. Customer requests Home Loan rate.
2. Frontend sends request to API Gateway.
3. API Gateway forwards request to Django ML Service.
4. ML Service calculates rate based on customer data & returns response.
5. API Gateway saves pricing log & returns rate to frontend.
6. Customer sees personalized rate.

---

## 🌐 Future Enhancements

🚀 Integrate external financial data (inflation, repo rate, housing index).  
🚀 Add real-time market monitoring using third-party APIs.  
🚀 Advanced XAI (Explainable AI) module for transparent rate justification.  
🚀 Enable policy override by bank admins (manual adjustment).  
🚀 Add support for other products (Auto Loans, Credit Cards).

---

## 🤝 Contributors

| Name         | Role                        |
|--------------|-------------------|
| Team Member 1| Full Stack Developer  |
| Team Member 2| Machine Learning Engineer |
| Team Member 3| DevOps & Deployment   |
| Team Member 4| Business Analyst |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For inquiries or collaboration, reach out at:  
**Email:** your.email@domain.com  
**LinkedIn:** [Your LinkedIn Profile](https://www.linkedin.com/in/your-profile)

---

