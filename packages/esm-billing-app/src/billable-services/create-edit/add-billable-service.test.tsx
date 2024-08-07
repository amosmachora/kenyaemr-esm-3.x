import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBillableService from './add-billable-service.component';
import {
  useBillableServices,
  usePaymentModes,
  useServiceTypes,
  createBillableService,
  useConceptsSearch,
} from '../billable-service.resource';
import { FetchResponse, navigate, showSnackbar } from '@openmrs/esm-framework';

const mockUseBillableServices = useBillableServices as jest.MockedFunction<typeof useBillableServices>;
const mockUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;
const mockUseServiceTypes = useServiceTypes as jest.MockedFunction<typeof useServiceTypes>;
const mockCreateBillableService = createBillableService as jest.MockedFunction<typeof createBillableService>;
const mockUseConceptsSearch = useConceptsSearch as jest.MockedFunction<typeof useConceptsSearch>;
const mockNavigate = navigate as jest.MockedFunction<typeof navigate>;
const mockShowSnackbar = showSnackbar as jest.MockedFunction<typeof showSnackbar>;

jest.mock('../billable-service.resource', () => ({
  useBillableServices: jest.fn(),
  usePaymentModes: jest.fn(),
  useServiceTypes: jest.fn(),
  createBillableService: jest.fn(),
  useConceptsSearch: jest.fn(),
}));

const mockPaymentModes = [
  { uuid: '63eff7a4-6f82-43c4-a333-dbcc58fe9f74', name: 'Cash', description: 'Cash Payment', retired: false },
  {
    uuid: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
    name: 'Insurance',
    description: 'Insurance method of payment',
    retired: false,
  },
  {
    uuid: '28989582-e8c3-46b0-96d0-c249cb06d5c6',
    name: 'MPESA',
    description: 'Mobile money method of payment',
    retired: false,
  },
];

const mockServiceTypes = [
  { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa13e6', display: 'Lab service' },
  { uuid: 'b75e466f-a6f5-4d5e-849a-84424d3c85cd', display: 'Pharmacy service' },
  { uuid: 'ce914b2d-44f6-4b6c-933f-c57a3938e35b', display: 'Peer educator service' },
  { uuid: 'c23d3224-2218-4007-8f22-e1f3d5a8e58a', display: 'Nutrition service' },
  { uuid: '65487ff4-63b3-452a-8985-6a1f4a0cc08d', display: 'TB service' },
  { uuid: '9db142d5-5cc4-4c05-9f83-06ed294caa67', display: 'Family planning service' },
  { uuid: 'a487a743-62ce-4f93-a66b-c5154ee8987d', display: 'Adherence counselling  service' },
];

const mockConcepts = [
  {
    concept: { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa13e6', display: 'test' },
    conceptName: { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa1334', display: 'test2' },
    display: 'Lab service',
  },
];

describe('AddBillableService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should render billable services form and generate correct payload', async () => {
    const user = userEvent.setup();
    mockUseBillableServices.mockReturnValue({
      billableServices: [],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
      isValidating: false,
    });
    mockUsePaymentModes.mockReturnValue({ paymentModes: mockPaymentModes, error: null, isLoading: false });
    mockUseServiceTypes.mockReturnValue({ serviceTypes: mockServiceTypes, error: false, isLoading: false });
    mockUseConceptsSearch.mockReturnValue({ searchResults: mockConcepts, error: undefined, isSearching: false });
    render(<AddBillableService />);

    const formTitle = screen.getByRole('heading', { name: /Add Billable Services/i });
    expect(formTitle).toBeInTheDocument();

    const serviceNameTextInp = screen.getByRole('textbox', { name: /Service Name/i });
    expect(serviceNameTextInp).toBeInTheDocument();

    const serviceShortNameTextInp = screen.getByRole('textbox', { name: /Short Name/i });
    expect(serviceShortNameTextInp).toBeInTheDocument();

    await user.type(serviceNameTextInp, 'Test Service Name');
    await user.type(serviceShortNameTextInp, 'Test Short Name');

    expect(serviceNameTextInp).toHaveValue('Test Service Name');
    expect(serviceShortNameTextInp).toHaveValue('Test Short Name');

    const serviceTypeComboBox = screen.getByRole('combobox', { name: /Service Type/i });
    expect(serviceTypeComboBox).toBeInTheDocument();
    await user.click(serviceTypeComboBox);
    const serviceTypeOptions = screen.getByRole('option', { name: /Lab service/i });
    expect(serviceTypeOptions).toBeInTheDocument();
    await user.click(serviceTypeOptions);

    const addPaymentMethodBtn = screen.getByRole('button', { name: /Add payment option/i });
    expect(addPaymentMethodBtn).toBeInTheDocument();

    await user.click(addPaymentMethodBtn);

    const paymentMethodComboBox = screen.getByRole('combobox', { name: /Payment Mode/i });
    expect(paymentMethodComboBox).toBeInTheDocument();
    await user.click(paymentMethodComboBox);
    const paymentMethodOptions = screen.getByRole('option', { name: /Cash/i });
    expect(paymentMethodOptions).toBeInTheDocument();
    await user.click(paymentMethodOptions);

    const priceTextInp = screen.getByRole('textbox', { name: /Price/i });
    expect(priceTextInp).toBeInTheDocument();
    await user.type(priceTextInp, '1000');

    // Should be able to add multiple payment methods and delete them
    await user.click(addPaymentMethodBtn);
    const deleteBtn0 = screen.getByRole('img', { name: /delete_0/i });
    expect(deleteBtn0).toBeInTheDocument();
    const deleteBtn1 = screen.getByRole('img', { name: /delete_1/i });

    // Delete payment method on index 1
    await user.click(deleteBtn1);

    mockCreateBillableService.mockReturnValue(Promise.resolve({} as FetchResponse<any>));
    const saveBtn = screen.getByRole('button', { name: /Save/i });

    expect(saveBtn).toBeInTheDocument();
    await user.click(saveBtn);
  });

  test("should navigate back to billable services dashboard when 'Cancel' button is clicked", async () => {
    const user = userEvent.setup();
    mockUseBillableServices.mockReturnValue({
      billableServices: [],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
      isValidating: false,
    });
    mockUsePaymentModes.mockReturnValue({ paymentModes: mockPaymentModes, error: null, isLoading: false });
    mockUseServiceTypes.mockReturnValue({ serviceTypes: mockServiceTypes, error: false, isLoading: false });
    mockUseConceptsSearch.mockReturnValue({ searchResults: mockConcepts, error: undefined, isSearching: false });
    render(<AddBillableService />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelBtn).toBeInTheDocument();
    await user.click(cancelBtn);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/openmrs/spa/billable-services' });
  });
});
