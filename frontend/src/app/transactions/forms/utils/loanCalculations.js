export function calculateLoanDetails({
  principal = 0,
  tenure = 0, // in months
  interestFrequency = "yearly", // "monthly" or "yearly"
  inputType = "rate", // "rate" or "amount"
  interestRate = 0, // yearly interest in percent
  interestAmount = 0,
  disbursedAmount = 0,
}) {
  principal = Number(principal) || 0;
  tenure = Number(tenure) || 0;
  disbursedAmount = Number(disbursedAmount) || principal;
  interestRate = Number(interestRate) || 0;
  interestAmount = Number(interestAmount) || 0;

  if (principal <= 0 || tenure <= 0) {
    return {
      EMI: 0,
      totalInterest: 0,
      totalPayable: 0,
      processingFees: 0,
      totalCost: 0,
      effectiveCostPercent: 0,
      calculatedInterestRate: 0,
    };
  }

  let totalInterest = 0;
  let totalPayable = 0;
  let calculatedInterestRate = 0;

  // Compounding periods per year
  const n = interestFrequency === "monthly" ? 12 : 1;
  const t = tenure / 12; // convert months to years

  if (inputType === "rate") {
    const r = interestRate / 100; // yearly rate
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

  const effectiveCostPercent = (totalInterest / disbursedAmount) * 100;

  return {
    EMI: 0, // Simple mode → no EMI
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    processingFees: 0,
    totalCost: parseFloat(totalInterest.toFixed(2)),
    effectiveCostPercent: parseFloat(effectiveCostPercent.toFixed(2)),
    calculatedInterestRate: parseFloat(calculatedInterestRate.toFixed(2)),
  };
}
