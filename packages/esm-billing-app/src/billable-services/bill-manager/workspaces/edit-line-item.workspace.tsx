import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, NumberInput, Layer, Loading } from '@carbon/react';
import styles from './waive-bill-form.scss';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash-es/isEqual';
import { DefaultWorkspaceProps, showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { processBillItems } from '../../../billing.resource';
import { processBillItem } from '../../../utils';

type FormData = {
  quantity: string;
};

const schema = z.object({
  quantity: z
    .string({ required_error: 'Quantity amount is required' })
    .refine((n) => parseInt(n) > 0, { message: 'Quantity should be greater than zero' }),
});

export const EditLineItem: React.FC<DefaultWorkspaceProps & { bill: MappedBill; lineItem: LineItem }> = ({
  bill,
  lineItem,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = { quantity: lineItem.quantity.toString() };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const inputQuantity = watch('quantity');

  const inputDataAsObject = { quantity: inputQuantity };
  const isUnchanged = isEqual(inputDataAsObject, defaultValues);

  const onSubmit: SubmitHandler<FormData> = ({ quantity }) => {
    const lineItemToBeEdited = {
      item: processBillItem(lineItem),
      quantity: parseInt(quantity),
      price: lineItem.price,
      priceName: lineItem.priceName,
      priceUuid: lineItem.priceUuid,
      lineItemOrder: lineItem.lineItemOrder,
      paymentStatus: PaymentStatus.ADJUSTED,
      billableService: processBillItem(lineItem),
    };

    const billWithRefund = {
      cashPoint: bill.cashPointUuid,
      cashier: bill.cashier.uuid,
      lineItems: [lineItemToBeEdited],
      payments: bill.payments,
      patient: bill.patientUuid,
      status: bill.status,
    };

    setIsLoading(true);
    processBillItems(billWithRefund)
      .then(() => {
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill'), undefined, {
          revalidate: true,
        });
        showSnackbar({
          title: t('editLineItem', 'Edit Item'),
          subtitle: 'Item has been successfully edited.',
          kind: 'success',
          timeoutInMs: 3000,
        });
      })
      .catch((error) => {
        showSnackbar({ title: 'An error occurred trying to edit item', kind: 'error', subtitle: error.message });
      })
      .finally(() => {
        setIsLoading(false);
        closeWorkspace();
      });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="quantity"
        render={({ field }) => (
          <Layer>
            <NumberInput
              {...field}
              size="md"
              label={'quantity'}
              placeholder={'quantity'}
              invalid={!!errors.quantity}
              invalidText={errors.quantity?.message}
              className={styles.editFormInput}
              min={1}
              helperText={'Enter the new quantity of the line item'}
              id="quantity"
              hideSteppers
              disableWheel
            />
          </Layer>
        )}
      />
      <ButtonSet>
        <Button className={styles.button} kind="secondary" type={'button'} onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || isUnchanged}>
          {isLoading ? (
            <div className={styles.loading_wrapper}>
              <Loading className={styles.button_spinner} withOverlay={false} small />
              {t('processingPayment', 'Processing Payment')}
            </div>
          ) : (
            t('submit', 'Submit')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};
