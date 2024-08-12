import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import InitiatePaymentDialog from './initiate-payment.component';
import { mockedBill } from '../../../billable-services/bill-manager/workspaces/waive-bill-form.test';
import { initiateStkPush } from '../../../m-pesa/mpesa-resource';
import { usePatientAttributes } from '../../../hooks/usePatientAttributes';

jest.mock('../../../hooks/usePatientAttributes');
jest.mock('../../../m-pesa/mpesa-resource', () => ({ initiateStkPush: jest.fn() }));

const mockedInitiateSTKPushRequest = initiateStkPush as jest.MockedFunction<typeof initiateStkPush>;
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

  test('should not allow user to submit empty data or invalid data', async () => {
    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;
    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;

    expect(screen.getByText('Bill Payment')).toBeInTheDocument();

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    expect(submitButton).toBeDisabled();

    await user.type(phoneNumberInput, 'RANDOMTEXT');
    expect(screen.getByText('Phone number must be numeric and 10 digits')).toBeInTheDocument();
  });

  test('should show error message if health facility mpesa config data is not available', async () => {
    const originalFetch = global.fetch;

    const mockedFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    global.fetch = mockedFetch;

    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;
    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;

    await user.clear(amountInput);
    await user.clear(phoneNumberInput);
    await user.type(phoneNumberInput, '0719428019');
    await user.type(amountInput, '50');

    mockedInitiateSTKPushRequest.mockResolvedValue(undefined);

    await user.click(submitButton);

    expect(mockedInitiateSTKPushRequest).toBeCalledTimes(1);
    expect(await screen.findByText('Health facility M-PESA data not configured.')).toBeInTheDocument();
    global.fetch = originalFetch;
  });

  test('should show generic error message for any other status code', async () => {
    const originalFetch = global.fetch;

    const mockedFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    global.fetch = mockedFetch;

    render(<InitiatePaymentDialog closeModal={() => {}} bill={mockedBill} />);

    const amountInput = screen.getByTestId('amountInput') as HTMLInputElement;
    const submitButton = screen.getByTestId('submitButton') as HTMLButtonElement;
    const phoneNumberInput = screen.getByTestId('phoneNumberInput') as HTMLInputElement;

    await user.type(phoneNumberInput, '0719428019');
    await user.type(amountInput, '50');

    mockedInitiateSTKPushRequest.mockResolvedValue(undefined);

    await user.click(submitButton);
    expect(mockedInitiateSTKPushRequest).toBeCalledTimes(1);
    expect(await screen.findByText('Unable to initiate Lipa Na Mpesa, please try again later.')).toBeInTheDocument();

    global.fetch = originalFetch;
  });
});
