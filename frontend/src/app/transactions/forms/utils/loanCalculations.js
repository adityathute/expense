export function calculateLoanDetails({
  principal = 0,
  interestRate = 0,
  tenure = 0,
  interestFrequency = "yearly",
  disbursedAmount = 0,
  processingFees = null,
  totalEmiAmount = 0,
}) {
  principal = Number(principal) || 0;
  tenure = Number(tenure) || 0;
  disbursedAmount = Number(disbursedAmount) || 0;
  totalEmiAmount = Number(totalEmiAmount) || 0;

  // Auto-calc processing fees when not provided
  const finalProcessingFees =
    processingFees !== null && processingFees !== undefined
      ? Math.max(Number(processingFees) || 0, 0)
      : Math.max(principal - disbursedAmount, 0);

  let totalInterest = 0;
  let totalPayable = 0;
  let EMI = 0;

  if (totalEmiAmount > 0 && principal > 0) {
    totalPayable = totalEmiAmount;
    totalInterest = Math.max(totalPayable - principal, 0);
  } else if (principal > 0 && tenure > 0 && interestRate > 0) {
    const monthlyRate =
      interestFrequency === "yearly"
        ? (Number(interestRate) || 0) / 100 / 12
        : (Number(interestRate) || 0) / 100;

    if (monthlyRate > 0) {
      EMI =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);
      totalPayable = EMI * tenure;
      totalInterest = Math.max(totalPayable - principal, 0);
    }
  }

  const totalCost = totalInterest + finalProcessingFees;
  const effectiveCostPercent =
    disbursedAmount > 0 ? (totalCost / disbursedAmount) * 100 : 0;

  const interestPercentSimple =
    principal > 0 ? (totalInterest / principal) * 100 : 0;
  const annualizedInterestPercent =
    tenure > 0 ? interestPercentSimple * (12 / tenure) : interestPercentSimple;

  return {
    EMI: Math.round(EMI),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
    processingFees: Math.round(finalProcessingFees),
    totalCost: Math.round(totalCost),
    effectiveCostPercent: parseFloat(effectiveCostPercent.toFixed(2)),
    interestPercentSimple: parseFloat(interestPercentSimple.toFixed(2)),
    annualizedInterestPercent: parseFloat(annualizedInterestPercent.toFixed(2)),
  };
}
