import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { mockedBill } from '../../../billable-services/bill-manager/workspaces/waive-bill-form.test';
import * as usePatientAttributesModule from '../../../hooks/usePatientAttributes';
import * as useRequestStatusModule from '../../../hooks/useRequestStatus';
import * as mpesaResourceModule from '../../../m-pesa/mpesa-resource';
import { RequestStatus } from '../../../types';
import { waitForASecond } from '../../../utils';
import InitiatePaymentDialog from './initiate-payment.component';

jest.mock('../../../m-pesa/mpesa-resource', () => ({
  initiateStkPush: jest.fn(),
}));

const mockedInitiateSTKPushRequest = mpesaResourceModule.initiateStkPush as jest.Mock<
  Promise<string | undefined | 'MISSING-HEALTH-FACILITY-CONFIG'>,
  [mpesaResourceModule.Payload, string]
>;

jest.mock('../../../hooks/usePatientAttributes', () => ({
  usePatientAttributes: jest.fn(),
}));

jest.mock('./../../../hooks/useRequestStatus', () => ({
  useRequestStatus: jest.fn(),
}));

const mockedUseRequestStatus = useRequestStatusModule.useRequestStatus as jest.Mock<
  { requestStatus: RequestStatus | null; referenceCode: string | null },
  [string | null]
>;

describe('initiate-mpesa-payment', () => {
  beforeEach(() => {
    (usePatientAttributesModule.usePatientAttributes as jest.Mock).mockReturnValue({
      phoneNumber: '0712345678',
      isLoading: false,
      error: undefined,
    });
    mockedUseRequestStatus.mockReturnValue({ referenceCode: null, requestStatus: null });
  });

  const user = userEvent.setup();

  test('should not allow user to submit empty or invalid data', async () => {
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;
    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;

    expect(screen.getByText('Bill Payment')).toBeInTheDocument();

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    expect(submitButton).toBeDisabled();

    await user.type(phoneNumberInput, 'RANDOMTEXT');
    expect(screen.getByText('Phone number must be numeric and 10 digits')).toBeInTheDocument();

    await user.type(amountInput, 'RANDOMTEXT');
    expect(screen.getByText('Amount must be numeric')).toBeInTheDocument();

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    expect(submitButton).toBeDisabled();
  });

  test('should show error message if health facility mpesa config data is not available', async () => {
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;
    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    expect(submitButton).toBeDisabled();

    await user.type(phoneNumberInput, '0719428019');
    await user.type(amountInput, '50');

    mockedInitiateSTKPushRequest.mockResolvedValue('MISSING-HEALTH-FACILITY-CONFIG');

    await user.click(submitButton);

    expect(mockedInitiateSTKPushRequest).toBeCalledTimes(1);
    expect(await screen.findByText('Health facility M-PESA data not configured.')).toBeInTheDocument();
  });

  test('it should correctly show the request status to end user', async () => {
    mockedUseRequestStatus.mockReturnValue({ referenceCode: null, requestStatus: 'INITIATED' });
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);
    expect(screen.getByText(mpesaResourceModule.readableStatusMap.get('INITIATED')!)).toBeInTheDocument();

    mockedUseRequestStatus.mockReturnValue({ referenceCode: null, requestStatus: 'NOT-FOUND' });
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);
    expect(screen.getByText(mpesaResourceModule.readableStatusMap.get('NOT-FOUND')!)).toBeInTheDocument();

    mockedUseRequestStatus.mockReturnValue({ referenceCode: null, requestStatus: 'NOT-FOUND' });
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);
    expect(screen.getByText(mpesaResourceModule.readableStatusMap.get('NOT-FOUND')!)).toBeInTheDocument();

    mockedUseRequestStatus.mockReturnValue({ referenceCode: '12345', requestStatus: 'COMPLETE' });
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);
    expect(screen.getByText(mpesaResourceModule.readableStatusMap.get('COMPLETE')!)).toBeInTheDocument();
  });

  test('it should correctly close itself after a successful mpesa transaction', async () => {
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);
    mockedUseRequestStatus.mockReturnValue({ referenceCode: '12345', requestStatus: 'COMPLETE' });
    await waitForASecond();
    await waitForASecond();
    expect(screen.getByText('Bill Payment')).not.toBeInTheDocument();
  });
});
