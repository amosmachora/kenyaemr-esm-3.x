import {
  Button,
  Form,
  InlineNotification,
  Layer,
  Loading,
  ModalBody,
  ModalHeader,
  NumberInputSkeleton,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { processBillPayment } from '../../../billing.resource';
import { BillingConfig } from '../../../config-schema';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { usePatientAttributes } from '../../../hooks/usePatientAttributes';
import { useRequestStatus } from '../../../hooks/useRequestStatus';
import { createMobileMoneyPaymentPayload, initiateStkPush, readableStatusMap } from '../../../m-pesa/mpesa-resource';
import { MappedBill } from '../../../types';
import { extractErrorMessagesFromResponse, waitForASecond } from '../../../utils';
import { usePaymentModes } from '../payments.resource';
import { formatPhoneNumber } from '../utils';
import styles from './initiate-payment.scss';

const initiatePaymentSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty({ message: 'Phone number is required' })
    .regex(/^\d{10}$/, { message: 'Phone number must be numeric and 10 digits' }),
  billAmount: z
    .string()
    .nonempty({ message: 'Amount is required' })
    .regex(/^\d+(\.\d+)?$/, { message: 'Amount must be numeric' }),
});

type FormData = z.infer<typeof initiatePaymentSchema>;

export interface InitiatePaymentDialogProps {
  closeModal: () => void;
  bill: MappedBill;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill }) => {
  const { t } = useTranslation();
  const { phoneNumber, isLoading: isLoadingPhoneNumber } = usePatientAttributes(bill.patientUuid);
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { requestStatus, referenceCode } = useRequestStatus(requestId);
  const { paymentModes } = usePaymentModes();
  const mobileMoneyPaymentMethodInstanceTypeUUID = paymentModes?.find((method) => method.name === 'Mobile Money')?.uuid;
  const paymentReferenceUUID = paymentModes
    ?.find((mode) => mode.name === 'Mobile Money')
    ?.attributeTypes?.find((type) => type.description === 'Reference Number').uuid;

  const pendingAmount = bill.totalAmount - bill.tenderedAmount;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      billAmount: pendingAmount.toString(),
      phoneNumber: phoneNumber,
    },
    resolver: zodResolver(initiatePaymentSchema),
  });

  const watchedPhoneNumber = watch('phoneNumber');
  const watchedAmount = watch('billAmount');

  useEffect(() => {
    if (!watchedPhoneNumber && phoneNumber) {
      reset({ phoneNumber: watchedPhoneNumber });
    }
  }, [watchedPhoneNumber, setValue, phoneNumber, reset]);

  useEffect(() => {
    if (!requestStatus) {
      return;
    }
    if (requestStatus === 'INITIATED') {
      setNotification({ type: 'success', message: readableStatusMap.get(requestStatus) });
    }

    if (requestStatus === 'FAILED' || requestStatus === 'NOT-FOUND') {
      setNotification({ type: 'error', message: readableStatusMap.get(requestStatus) });
    }

    if (requestStatus === 'COMPLETE') {
      const mobileMoneyPayload = createMobileMoneyPaymentPayload(
        bill,
        parseInt(watchedAmount),
        mobileMoneyPaymentMethodInstanceTypeUUID,
        { uuid: paymentReferenceUUID, value: referenceCode },
      );

      processBillPayment(mobileMoneyPayload, bill.uuid).then(
        () => {
          showSnackbar({
            title: t('billPayment', 'Bill payment'),
            subtitle: 'Bill payment processing has been successful',
            kind: 'success',
            timeoutInMs: 3000,
          });
          const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
          mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
          setNotification({ type: 'success', message: readableStatusMap.get(requestStatus) });
          waitForASecond().then(() => {
            closeModal();
          });
        },
        (error) => {
          showSnackbar({
            title: t('failedBillPayment', 'Bill payment failed'),
            subtitle: `An unexpected error occurred while processing your bill payment. Please contact the system administrator and provide them with the following error details: ${extractErrorMessagesFromResponse(
              error.responseBody,
            )}`,
            kind: 'error',
            timeoutInMs: 3000,
          });
        },
      );
    }
  }, [
    bill,
    closeModal,
    mobileMoneyPaymentMethodInstanceTypeUUID,
    paymentReferenceUUID,
    referenceCode,
    requestStatus,
    t,
    watchedAmount,
  ]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const phoneNumber = formatPhoneNumber(data.phoneNumber);
    const amountBilled = data.billAmount;
    const accountReference = `${mflCodeValue}#${bill.receiptNumber}`;

    const payload = {
      AccountReference: accountReference,
      PhoneNumber: phoneNumber,
      Amount: amountBilled,
    };

    setIsLoading(true);
    try {
      const res = await initiateStkPush(payload, mpesaAPIBaseUrl);
      if (res === 'MISSING-HEALTH-FACILITY-CONFIG') {
        setNotification({
          message: 'Health facility M-PESA data not configured.',
          type: 'error',
        });
        return;
      }
      setRequestId(res);
    } catch (error) {
      setNotification({
        message: 'Unable to initiate Lipa Na Mpesa, please try again later.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} />
      <ModalBody>
        <Form className={styles.form}>
          <h4>{t('paymentPayment', 'Bill Payment')}</h4>
          {notification && (
            <InlineNotification
              kind={notification.type}
              title={notification.message}
              onCloseButtonClick={() => setNotification(null)}
              data-testid="mpesaErrorNotification"
            />
          )}
          {isLoadingPhoneNumber ? (
            <NumberInputSkeleton className={styles.section} />
          ) : (
            <section className={styles.section}>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field }) => (
                  <Layer>
                    <TextInput
                      {...field}
                      size="md"
                      labelText={t('Phone Number', 'Phone Number')}
                      placeholder={t('Phone Number', 'Phone Number')}
                      invalid={!!errors.phoneNumber}
                      invalidText={errors.phoneNumber?.message}
                      data-testid="phoneNumberInput"
                      id="phoneNumberInput"
                    />
                  </Layer>
                )}
              />
            </section>
          )}
          <section className={styles.section}>
            <Controller
              control={control}
              name="billAmount"
              render={({ field }) => (
                <Layer>
                  <TextInput
                    {...field}
                    size="md"
                    labelText={t('billAmount', 'Bill Amount')}
                    placeholder={t('billAmount', 'Bill Amount')}
                    invalid={!!errors.billAmount}
                    invalidText={errors.billAmount?.message}
                    data-testid="amountInput"
                    id="amountInput"
                  />
                </Layer>
              )}
            />
          </section>
          <section>
            <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className={styles.button}
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading || (requestStatus && requestStatus !== 'COMPLETE')}
              data-testid="submitButton">
              {isLoading ? (
                <>
                  <Loading className={styles.button_spinner} withOverlay={false} small />{' '}
                  {t('processingPayment', 'Processing Payment')}
                </>
              ) : (
                t('initiatePay', 'Initiate Payment')
              )}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
