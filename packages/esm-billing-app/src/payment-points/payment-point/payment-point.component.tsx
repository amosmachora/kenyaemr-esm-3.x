import React from 'react';
import { useParams } from 'react-router-dom';
import { PaymentHistoryViewer } from '../../billable-services/payment-history/payment-history-viewer.component';
import BillingHeader from '../../billing-header/billing-header.component';
import { usePaymentPoints } from '../payment-points.resource';
import { useClockInStatus } from '../use-clock-in-status';

export const headers = [
  { header: 'Date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

export const PaymentPoint = () => {
  const { paymentPointUUID } = useParams();
  const { paymentPoints, isLoading, error } = usePaymentPoints();
  const { isClockedIn, globalActiveSheet } = useClockInStatus(paymentPointUUID);

  const paymentPoint = paymentPoints?.find((point) => point.uuid === paymentPointUUID);

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <div>
      <BillingHeader title={`Payment Points / ${paymentPoint.name}`} />
      <PaymentHistoryViewer />
    </div>
  );
};
