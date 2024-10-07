import { useConfig } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { BillingConfig } from '../config-schema';
import { getRequestStatus } from '../m-pesa/mpesa-resource';
import { RequestStatus } from '../types';

type RequestData = {
  requestId: string;
  requestStatus: RequestStatus | null;
  amount: string | null;
};

/**
 * useRequestStatus
 * @param requestId the request id of the payment request
 * @returns the request status of the request id.
 */
export const useRequestStatus = (requestId: string | null): RequestStatus => {
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (requestId && !requestStatus) {
      setRequestStatus('INITIATED');
    }

    if (requestId && !['COMPLETE', 'FAILED', 'NOT-FOUND'].includes(requestStatus)) {
      const fetchStatus = async () => {
        try {
          const status = await getRequestStatus(requestId, mpesaAPIBaseUrl);
          setRequestStatus(status);
          if (status === 'FAILED' || status === 'NOT-FOUND' || status === 'COMPLETE') {
            clearInterval(interval);
          }
        } catch (error) {
          clearInterval(interval);
        }
      };

      interval = setInterval(fetchStatus, 2000);

      return () => clearInterval(interval);
    }
  }, [mpesaAPIBaseUrl, requestId, requestStatus]);

  return requestStatus;
};
