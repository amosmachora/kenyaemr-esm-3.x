import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../../config-schema';
import { PaymentMethod } from '../../types';

const swrOption = {
  errorRetryCount: 2,
};

export const usePaymentModes = () => {
  const { excludedPaymentMode } = useConfig<BillingConfig>();
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(
    url,
    openmrsFetch,
    swrOption,
  );
  const allowedPaymentModes =
    excludedPaymentMode?.length > 0
      ? data?.data?.results.filter((mode) => !excludedPaymentMode.some((excluded) => excluded.uuid === mode.uuid)) ?? []
      : data?.data?.results ?? [];
  return {
    paymentModes: allowedPaymentModes,
    isLoading,
    mutate,
    error,
  };
};
