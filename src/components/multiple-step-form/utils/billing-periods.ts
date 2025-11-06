/**
 * Utility functions for generating billing period options
 */

interface BillingPeriodOption {
  value: string;
  label: string;
}

/**
 * Generate billing period options for the last 18 months
 * Starting from the current month and going back 18 months
 *
 * @returns Array of billing period options sorted from newest to oldest
 */
export function generateBillingPeriodOptions(): BillingPeriodOption[] {
  const options: BillingPeriodOption[] = [];
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  // Generate periods going backwards from the previous month (last complete month)
  // Each period is 12 months long, and we generate periods going back 18 months
  for (let i = 0; i < 18; i++) {
    // Calculate the end month for this period (going backwards from previous month)
    const endMonthIndex = currentMonth - 1 - i;
    const endYear = currentYear + Math.floor(endMonthIndex / 12);
    const endMonth = ((endMonthIndex % 12) + 12) % 12;

    // Start month is 11 months before the end month
    const startMonthIndex = endMonthIndex - 11;
    const startYear = currentYear + Math.floor(startMonthIndex / 12);
    const startMonth = ((startMonthIndex % 12) + 12) % 12;

    // Format the value (e.g., "2024-11_2025-10")
    const value = `${startYear}-${String(startMonth + 1).padStart(
      2,
      "0"
    )}_${endYear}-${String(endMonth + 1).padStart(2, "0")}`;

    // Format the label (e.g., "November 2024 bis Oktober 2025")
    const label = `${getMonthName(startMonth)} ${startYear} bis ${getMonthName(
      endMonth
    )} ${endYear}`;

    options.push({ value, label });
  }

  return options;
}

/**
 * Calculate the billing period that is N years before a given period
 *
 * @param periodValue - The period value (e.g., "2025-10_2026-09")
 * @param yearsBack - Number of years to go back (1 or 2)
 * @returns The calculated period value
 */
export function calculatePreviousPeriod(
  periodValue: string,
  yearsBack: number
): string {
  if (!periodValue || !periodValue.includes("_")) {
    return "";
  }

  const [startPart, endPart] = periodValue.split("_");
  const [startYear, startMonth] = startPart.split("-").map(Number);
  const [endYear, endMonth] = endPart.split("-").map(Number);

  // Subtract years from both start and end
  const newStartYear = startYear - yearsBack;
  const newEndYear = endYear - yearsBack;

  return `${newStartYear}-${String(startMonth).padStart(
    2,
    "0"
  )}_${newEndYear}-${String(endMonth).padStart(2, "0")}`;
}

/**
 * Format a billing period value to a human-readable label
 *
 * @param periodValue - The period value (e.g., "2025-10_2026-09")
 * @returns The formatted label
 */
export function formatPeriodLabel(periodValue: string): string {
  if (!periodValue || !periodValue.includes("_")) {
    return "";
  }

  const [startPart, endPart] = periodValue.split("_");
  const [startYear, startMonth] = startPart.split("-").map(Number);
  const [endYear, endMonth] = endPart.split("-").map(Number);

  return `${getMonthName(startMonth - 1)} ${startYear} bis ${getMonthName(
    endMonth - 1
  )} ${endYear}`;
}

/**
 * Get German month name
 *
 * @param monthIndex - Month index (0-11)
 * @returns German month name
 */
function getMonthName(monthIndex: number): string {
  const months = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  return months[monthIndex] || "";
}
