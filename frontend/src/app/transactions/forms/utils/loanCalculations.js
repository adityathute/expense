export function calculateLoanDetails({
  principal = 0,
  tenure = 0, // in months
  interestFrequency = "yearly", // "monthly" or "yearly"
  inputType = "rate", // "rate" or "amount"
  interestRate = 0, // yearly interest in percent
  interestAmount = 0,
  disbursedAmount = 0,
  processingFees = 0,
  advancedMode = false,
  totalEmiAmount = 0, // only used in advanced mode
}) {
  principal = Number(principal) || 0;
  tenure = Number(tenure) || 0;
  disbursedAmount = Number(disbursedAmount) || principal;
  interestRate = Number(interestRate) || 0;
  interestAmount = Number(interestAmount) || 0;
  processingFees = Number(processingFees) || 0;
  totalEmiAmount = Number(totalEmiAmount) || 0;

  if (principal <= 0 || tenure <= 0) {
    return {
      EMI: 0,
      totalInterest: 0,
      totalPayable: 0,
      processingFees,
      totalCost: 0,
      effectiveCostPercent: 0,
      calculatedInterestRate: 0,
    };
  }

  let totalInterest = 0;
  let totalPayable = 0;
  let calculatedInterestRate = 0;
  let emi = 0;

  const n = interestFrequency === "monthly" ? 12 : 1;
  const t = tenure / 12; // tenure in years

  if (advancedMode && totalEmiAmount > 0) {
    // Advanced mode with EMI entered
    totalInterest = totalEmiAmount - principal;
    totalPayable = totalEmiAmount + processingFees;
    emi = totalEmiAmount / tenure;
    calculatedInterestRate = (totalInterest / principal / t) * 100;
  } else {
    // Simple mode
    if (inputType === "rate") {
      const r = interestRate / 100;
      totalPayable = principal * Math.pow(1 + r / n, n * t);
      totalInterest = totalPayable - principal;
      calculatedInterestRate = interestRate;
    } else {
      totalInterest = interestAmount;
      totalPayable = principal + totalInterest;
      const periods = n * t;
      const rateDecimal = Math.pow(totalPayable / principal, 1 / periods) - 1;
      calculatedInterestRate =
        interestFrequency === "yearly" ? rateDecimal * 100 : rateDecimal * 100 * 12;
      if (!isFinite(calculatedInterestRate)) calculatedInterestRate = 0;
    }
    emi = 0; // no EMI in simple mode
    totalPayable += processingFees;
  }

  const effectiveCostPercent = ((totalInterest + processingFees) / disbursedAmount) * 100;

  return {
    EMI: parseFloat(emi.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    processingFees,
    totalCost: parseFloat((totalInterest + processingFees).toFixed(2)),
    effectiveCostPercent: parseFloat(effectiveCostPercent.toFixed(2)),
    calculatedInterestRate: parseFloat(calculatedInterestRate.toFixed(2)),
  };
}
