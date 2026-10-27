import { BloodGroup, BloodInventoryItem, ForecastItem } from '../types/bloodbank';

// Multipliers based on historical blood group prevalence and emergency frequency
const BLOOD_GROUP_DEMAND_WEIGHTS: Record<BloodGroup, { baseDailyUsage: number; volatility: number }> = {
  'O+': { baseDailyUsage: 6.2, volatility: 0.15 },
  'O-': { baseDailyUsage: 3.8, volatility: 0.35 }, // High volatility due to universal emergency demand
  'A+': { baseDailyUsage: 5.1, volatility: 0.18 },
  'A-': { baseDailyUsage: 1.9, volatility: 0.22 },
  'B+': { baseDailyUsage: 4.2, volatility: 0.20 },
  'B-': { baseDailyUsage: 1.4, volatility: 0.30 },
  'AB+': { baseDailyUsage: 2.1, volatility: 0.14 },
  'AB-': { baseDailyUsage: 0.9, volatility: 0.25 },
};

export function calculateDemandForecast(
  inventory: BloodInventoryItem[],
  horizonDays: 7 | 14 | 30 | 90 = 14
): ForecastItem[] {
  return inventory.map((item) => {
    const config = BLOOD_GROUP_DEMAND_WEIGHTS[item.bloodGroup] || { baseDailyUsage: 3.0, volatility: 0.2 };
    
    // Baseline moving average calculation with seasonal surge factor (+8% autumn/emergency factor)
    const seasonalFactor = 1.08;
    const dailyProjectedRate = config.baseDailyUsage * seasonalFactor;

    const d7 = Math.round(dailyProjectedRate * 7);
    const d14 = Math.round(dailyProjectedRate * 14);
    const d30 = Math.round(dailyProjectedRate * 30);
    const d90 = Math.round(dailyProjectedRate * 90);

    const projectedUsageForHorizon =
      horizonDays === 7 ? d7 :
      horizonDays === 14 ? d14 :
      horizonDays === 30 ? d30 : d90;

    // Assess Shortage Risk
    const stockCoverageDays = item.availableUnits / dailyProjectedRate;
    let shortageRisk: 'CRITICAL' | 'MODERATE' | 'LOW' | 'SAFE' = 'SAFE';
    let urgencyPriority: 'IMMEDIATE' | 'MONITOR' | 'STABLE' = 'STABLE';

    if (item.availableUnits < item.criticalThreshold || stockCoverageDays < (horizonDays * 0.3)) {
      shortageRisk = 'CRITICAL';
      urgencyPriority = 'IMMEDIATE';
    } else if (item.availableUnits < item.minimumThreshold || stockCoverageDays < (horizonDays * 0.6)) {
      shortageRisk = 'MODERATE';
      urgencyPriority = 'MONITOR';
    } else if (stockCoverageDays < horizonDays) {
      shortageRisk = 'LOW';
      urgencyPriority = 'MONITOR';
    } else {
      shortageRisk = 'SAFE';
      urgencyPriority = 'STABLE';
    }

    const recommendedSafetyStock = Math.ceil(dailyProjectedRate * 12); // 12-day buffer buffer

    // Baseline heuristic confidence score
    const confidenceScore = Math.round(92 - config.volatility * 40 - (horizonDays > 30 ? 10 : 0));

    return {
      bloodGroup: item.bloodGroup,
      currentStock: item.availableUnits,
      predictedDemand7Days: d7,
      predictedDemand14Days: d14,
      predictedDemand30Days: d30,
      predictedDemand90Days: d90,
      confidenceScore,
      shortageRisk,
      recommendedSafetyStock,
      urgencyPriority,
    };
  });
}

export interface PythonMlContractSpec {
  modelName: string;
  algorithm: string;
  targetEndpoint: string;
  expectedHeaders: Record<string, string>;
  inputSchemaSample: Record<string, unknown>;
  outputSchemaSample: Record<string, unknown>;
}

export const PYTHON_ML_CONTRACT: PythonMlContractSpec = {
  modelName: 'XGBoost_BloodDemand_Regressor_v2.4',
  algorithm: 'Gradient Boosted Trees (XGBoost) + Bi-LSTM Hybrid Pipeline',
  targetEndpoint: 'POST https://ml-api.bloodlink.org/v1/predict/demand',
  expectedHeaders: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <SECURE_JWT_TOKEN>',
    'X-Facility-ID': 'FAC-METRO-001'
  },
  inputSchemaSample: {
    facility_id: 'FAC-METRO-001',
    forecast_horizon_days: 14,
    historical_window_days: 60,
    features: [
      {
        blood_group: 'O-',
        current_inventory_units: 4,
        avg_daily_consumption_l30d: 3.8,
        dispatches_last_7d: 26,
        unfulfilled_requests_last_7d: 2,
        pending_elective_surgeries: 14,
        regional_trauma_index: 1.42,
        seasonal_holiday_surge_flag: true
      },
      {
        blood_group: 'A+',
        current_inventory_units: 34,
        avg_daily_consumption_l30d: 5.1,
        dispatches_last_7d: 35,
        unfulfilled_requests_last_7d: 0,
        pending_elective_surgeries: 28,
        regional_trauma_index: 1.05,
        seasonal_holiday_surge_flag: true
      }
    ]
  },
  outputSchemaSample: {
    model_version: '2.4.1-xgboost-hybrid',
    trained_timestamp: '2026-10-20T00:00:00Z',
    evaluation_metric: 'MAPE: 5.72%',
    predictions: [
      {
        blood_group: 'O-',
        forecast_horizon_days: 14,
        predicted_demand_units: 54,
        confidence_interval_95: [48, 62],
        shortage_probability: 0.94,
        suggested_safety_stock: 45,
        action_recommendation: 'TRIGGER_EMERGENCY_DONOR_DRIVE'
      },
      {
        blood_group: 'A+',
        forecast_horizon_days: 14,
        predicted_demand_units: 72,
        confidence_interval_95: [66, 79],
        shortage_probability: 0.12,
        suggested_safety_stock: 50,
        action_recommendation: 'NORMAL_SCHEDULED_REPLENISHMENT'
      }
    ]
  }
};
