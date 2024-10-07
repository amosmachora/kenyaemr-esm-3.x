import { processBillItem } from '../invoice/payments/utils';
import { LineItem, MappedBill, PaymentStatus, RequestStatus } from '../types';

export const readableStatusMap = new Map<RequestStatus, string>();
readableStatusMap.set('COMPLETE', 'Complete');
readableStatusMap.set('FAILED', 'Failed');
readableStatusMap.set('INITIATED', 'Waiting for user...');
readableStatusMap.set('NOT-FOUND', 'Request not found');

type Payload = {
  PhoneNumber: string;
  Amount: string;
  AccountReference: string;
};

export const initiateStkPush = async (
  payload: Payload,
  MPESA_PAYMENT_API_BASE_URL: string,
): Promise<string | undefined | 'MISSING-HEALTH-FACILITY-CONFIG'> => {
  const url = `${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/stk-push`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: payload.PhoneNumber,
      amount: payload.Amount,
      accountReference: payload.AccountReference,
    }),
  });

  if (res.ok) {
    const response: { requestId: string } = await res.json();
    return response.requestId;
  }

  if (!res.ok && res.status === 403) {
    return 'MISSING-HEALTH-FACILITY-CONFIG';
  }

  if (!res.ok) {
    throw new Error();
  }
};

export const getRequestStatus = async (
  requestId: string,
  MPESA_PAYMENT_API_BASE_URL: string,
): Promise<RequestStatus> => {
  const requestResponse = await fetch(`${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/check-payment-state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId,
    }),
  });

  if (!requestResponse.ok) {
    const error = new Error(`HTTP error! status: ${requestResponse.status}`);

    if (requestResponse.statusText) {
      error.message = requestResponse.statusText;
    }
    throw error;
  }

  const requestStatus: { status: RequestStatus } = await requestResponse.json();

  return requestStatus.status;
};

export const getErrorMessage = (err: { message: string }, t) => {
  if (err.message) {
    return err.message;
  }

  return t('unKnownErrorMsg', 'An unknown error occurred');
};

export const createMobileMoneyPaymentPayload = (
  bill: MappedBill,
  amount: number,
  mobileMoneyInstanceTypeUUID: string,
) => {
  const { cashier } = bill;
  const totalAmount = bill?.totalAmount;
  const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + amount);
  const paymentStatus = amountDue <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

  const previousPayments = bill.payments.map((payment) => ({
    amount: payment.amount,
    amountTendered: payment.amountTendered,
    attributes: [],
    instanceType: payment.instanceType.uuid,
  }));

  const newPayment = {
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(amount.toFixed(2)),
    attributes: [],
    instanceType: mobileMoneyInstanceTypeUUID,
  };

  const updatedPayments = [...previousPayments, newPayment];

  const updatedLineItems: LineItem[] = [];

  let remainder = amount;

  for (let i = 0; i < bill.lineItems.length; i++) {
    const lineItem = bill.lineItems[i];
    const totalLineItemAmount = lineItem.price * lineItem.quantity;
    const newLineItem: LineItem = {
      ...lineItem,
      billableService: processBillItem(lineItem),
      item: processBillItem(lineItem),
    };

    if (remainder >= totalLineItemAmount) {
      remainder -= totalLineItemAmount;
      updatedLineItems.push({ ...newLineItem, paymentStatus: PaymentStatus.PAID });
    } else {
      updatedLineItems.push(newLineItem);
    }
  }

  const newBillPaymentStatus = updatedLineItems.some((item) => item.paymentStatus === PaymentStatus.PENDING)
    ? PaymentStatus.PENDING
    : PaymentStatus.PAID;

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: updatedLineItems,
    payments: updatedPayments,
    patient: bill.patientUuid,
    status: updatedLineItems.length > 0 ? newBillPaymentStatus : paymentStatus,
  };

  return processedPayment;
};
