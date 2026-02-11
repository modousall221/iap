/**
 * Mock Payment Service for MVP
 * Simulates local payment processing (Orange Money, MTN, etc.)
 * Real integration with local PSP in Phase 2
 */

interface MockPaymentRequest {
  investmentId: string;
  amount: number;
  phoneNumber?: string;
  method?: 'mobile_money' | 'bank_transfer' | 'card';
}

interface MockPaymentResponse {
  success: boolean;
  paymentReference: string;
  message: string;
  redirectUrl?: string;
}

/**
 * Generate unique payment reference for mock payments
 * Format: PAY-YYYYMMDD-XXXXXX (e.g., PAY-20250211-ABC123)
 */
export const generatePaymentReference = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${dateStr}-${randomStr}`;
};

/**
 * Simulate payment processing (mock)
 * In real implementation, this would call Orange Money, MTN, etc. API
 *
 * For MVP testing:
 * - All payments are approved if amount > 0
 * - Payment immediately marked as "payment_confirmed"
 * - For Phase 2: integrate real PSP with callback webhooks
 */
export const processPayment = async (
  request: MockPaymentRequest
): Promise<MockPaymentResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const paymentRef = generatePaymentReference();

      // Mock validation
      if (request.amount <= 0) {
        resolve({
          success: false,
          paymentReference: '',
          message: 'Invalid payment amount',
        });
        return;
      }

      // Simulate successful payment
      resolve({
        success: true,
        paymentReference: paymentRef,
        message: `Payment of ${request.amount} FCFA initiated successfully`,
        // In real implementation, this would redirect to payment provider
        redirectUrl: `/investment/${request.investmentId}/confirm?ref=${paymentRef}`,
      });
    }, 1000); // 1 second delay to simulate API call
  });
};

/**
 * Verify payment status (mock)
 * In real implementation, query PSP for transaction status
 *
 * For MVP: always returns success if reference exists
 */
export const verifyPayment = async (
  paymentReference: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In real implementation, verify with PSP
      // For MVP, any valid reference is confirmed
      const isValid = paymentReference.startsWith('PAY-');
      resolve(isValid);
    }, 500);
  });
};

/**
 * Get payment details (mock)
 */
export const getPaymentDetails = async (
  paymentReference: string
): Promise<{ amount: number; status: string; date: string } | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock response
      if (paymentReference.startsWith('PAY-')) {
        resolve({
          amount: 1000000, // Mock amount
          status: 'completed',
          date: new Date().toISOString(),
        });
      } else {
        resolve(null);
      }
    }, 300);
  });
};

export default {
  generatePaymentReference,
  processPayment,
  verifyPayment,
  getPaymentDetails,
};
