import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { mockedBill } from '../../../billable-services/bill-manager/workspaces/waive-bill-form.test';
import { usePatientAttributes } from '../../../hooks/usePatientAttributes';
import { initiateStkPush } from '../../../m-pesa/mpesa-resource';
import InitiatePaymentDialog from './initiate-payment.component';

jest.mock('../../../hooks/usePatientAttributes');
jest.mock('../../../m-pesa/mpesa-resource', () => ({ initiateStkPush: jest.fn() }));

const mockedUsePatientAttributes = usePatientAttributes as jest.Mock;

describe('initiate-mpesa-payment', () => {
  beforeEach(() => {
    mockedUsePatientAttributes.mockReturnValue({
      phoneNumber: '0712345678',
      isLoading: false,
      error: undefined,
    });
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

    // ensure that user can`t type strings in the phone number input
    await user.type(phoneNumberInput, 'RANDOMTEXT');
    expect(screen.getByText('Phone number must be numeric and 10 digits')).toBeInTheDocument();

    // ensure that user can`t type strings in the amount input
    await user.type(amountInput, 'RANDOMTEXT');
    expect(screen.getByText('Amount must be numeric')).toBeInTheDocument();

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    expect(submitButton).toBeDisabled();
  });

  test('should show error message if health facility mpesa config data is not available', async () => {
    const mockedInitiateSTKPushRequest = initiateStkPush as jest.MockedFunction<typeof initiateStkPush>;
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;
    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    await user.type(phoneNumberInput, '0719428019');
    await user.type(amountInput, '50');

    mockedInitiateSTKPushRequest.mockResolvedValue('MISSING-HEALTH-FACILITY-CONFIG');

    await user.click(submitButton);

    expect(mockedInitiateSTKPushRequest).toBeCalledTimes(1);
    expect(await screen.findByText('Health facility M-PESA data not configured.')).toBeInTheDocument();
  });
});
