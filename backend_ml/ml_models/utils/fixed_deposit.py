import numpy as np

def min_max_normalize(value, min_val, max_val):
    value = float(value)
    min_val = float(min_val)
    max_val = float(max_val)
    if max_val - min_val == 0:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def calculate_fd_bps(CRS, deposit_amount, tenure, base_rate,
                     deposit_amount_range=(0, 100000000), tenure_range=(0, 10)):
    """
    Calculates the bonus basis points (BPS) and the final fixed deposit interest rate.
    
    Parameters:
        CRS (float): Customer Relationship Strength, assumed on a scale of 0–100.
        deposit_amount (float): The fixed deposit amount.
        tenure (float): Customer’s relationship duration (e.g., years with the bank).
        market_factor (float): A factor (0–1) reflecting market conditions; lower implies more favorable.
        deposit_amount_range (tuple): The assumed min and max values for deposit amounts.
        tenure_range (tuple): The assumed min and max values for tenure.
    
    Returns:
        bonus_bps (float): Calculated bonus in basis points.
        final_fd_rate (float): Final fixed deposit interest rate after applying bonus.
    """
    # Normalize CRS to a 0-1 range.
    CRS_norm = CRS / 100.0
    

    # Normalize deposit amount and tenure using preset min–max ranges.
    deposit_norm = min_max_normalize(deposit_amount, deposit_amount_range[0], deposit_amount_range[1])
    tenure_norm = min_max_normalize(tenure, tenure_range[0], tenure_range[1])
    
    # Calculate Deposit Stability (DS) as the average of deposit amount and tenure normalized scores.
    DS_norm = (deposit_norm + tenure_norm) / 2.0

    # Weights for each component (you can adjust these based on your business insights):
    w1 = 0.5  # Weight for CRS.
    w2 = 0.3  # Weight for Deposit Stability.
    w3 = 0.2  # Weight for market conditions (applied on the complement, i.e., 1 - market_factor).
    market_factor = 0.3       # Example market factor (0–1), where lower means better market conditions.
    

    # Define lower and upper bounds for the bonus basis points.
    min_bps = 10
    max_bps = 100

    # Calculate a weighted bonus score.
    weighted_score = w1 * CRS_norm + w2 * DS_norm + w3 * (1 - market_factor)
    
    # Compute bonus in basis points (BPS) within the set boundaries.
    bonus_bps = min_bps + (max_bps - min_bps) * weighted_score
    bonus_bps = round(float(np.clip(bonus_bps, min_bps, max_bps)), 2)
    
    bps = bonus_bps/100
    
    # Derive the final rate by adding the bonus (expressed as percentage points, i.e., BPS/100).
    final_fd_rate = base_rate + bonus_bps / 100.0
    final_fd_rate = round(final_fd_rate, 2)
    
    return bps, bonus_bps, final_fd_rate


