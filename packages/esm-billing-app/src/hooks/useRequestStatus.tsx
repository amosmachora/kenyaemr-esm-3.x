import { useConfig } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { BillingConfig } from '../config-schema';
import { getRequestStatus } from '../m-pesa/mpesa-resource';
import { RequestStatus } from '../types';

/**
 * useRequestStatus
 * @param requestId the request id of the payment request
 * @returns the request status of the request id and a reference code if the request is successful.
 */
export const useRequestStatus = (
  requestId: string | null,
): { requestStatus: RequestStatus | null; referenceCode: string | null } => {
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (requestId && !requestStatus) {
      setRequestStatus('INITIATED');
    }

    if (requestId && !['COMPLETE', 'FAILED', 'NOT-FOUND'].includes(requestStatus)) {
      const fetchStatus = async () => {
        try {
          const { status, referenceCode } = await getRequestStatus(requestId, mpesaAPIBaseUrl);
          setRequestStatus(status);

          if (status === 'COMPLETE') {
            setReferenceCode(referenceCode);
          }

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

  return { requestStatus, referenceCode };
};
