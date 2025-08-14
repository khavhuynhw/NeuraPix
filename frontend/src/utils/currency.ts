// Currency utility functions
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatVNDShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K VND`;
  }
  return `${amount.toLocaleString('vi-VN')} VND`;
};

// Convert USD to VND (approximate rate, should be updated from API in production)
export const usdToVnd = (usdAmount: number): number => {
  const exchangeRate = 24000; // Approximate USD to VND rate
  return usdAmount * exchangeRate;
};