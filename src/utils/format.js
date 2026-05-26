/**
 * Formats a number to Colombian currency (COP) style without decimals.
 * Example: 150000 -> "$150.000"
 * @param {number} price - The price value to format
 * @returns {string} The formatted COP string
 */
export const formatCOP = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '$0';
  }
  
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  
  // Remove non-breaking spaces and regular spaces to ensure direct '$150.000' format
  return formatted.replace(/\s/g, '').replace(/\u00A0/g, '');
};

/**
 * Formats a large number into a compact Colombian currency (COP) style (e.g. $1.08B COP or $1080M COP).
 * Used specifically for dashboard summary cards.
 * @param {number} price - The price value to format
 * @returns {string} The compactly formatted COP string
 */
export const formatCompactCOP = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '$0 COP';
  }
  
  if (price >= 1_000_000_000) {
    const value = price / 1_000_000_000;
    const formattedNum = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
    return `$${formattedNum.replace(/\s/g, '').replace(/\u00A0/g, '')}B COP`;
  }
  
  if (price >= 1_000_000) {
    const value = price / 1_000_000;
    const formattedNum = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
    return `$${formattedNum.replace(/\s/g, '').replace(/\u00A0/g, '')}M COP`;
  }
  
  return formatCOP(price);
};
