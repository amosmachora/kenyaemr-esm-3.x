import React, { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Loading } from '@carbon/react';
import styles from './line-item-modals.scss';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import { processBillItems, processBillPayment } from '../../../billing.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import { processBillItem } from '../../../utils';

export const DeleteLineItem: React.FC<{
  onClose: () => void;
  bill: MappedBill;
  lineItem: LineItem;
}> = ({ onClose, bill, lineItem }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const deleteLineItem = () => {
    const lineItemToBeDeleted = {
      ...lineItem,
      billableService: processBillItem(lineItem),
      item: processBillItem(lineItem),
      paymentStatus: PaymentStatus.CANCELLED,
      voidReason: 'Client deleted this line item',
      voided: true,
    };

    const otherLineItems = bill.lineItems.filter((li) => li.uuid !== lineItem.uuid);

    const billWithDeletedLineItem = {
      cashPoint: bill.cashPointUuid,
      cashier: bill.cashier.uuid,
      lineItems: [lineItemToBeDeleted].filter((li) => li.billableService), //...otherLineItems,
      payments: bill.payments.map((payment) => {
        return {
          amount: payment.amount,
          amountTendered: payment.amountTendered,
          attributes: payment.attributes,
          instanceType: payment.instanceType.uuid,
        };
      }),
      patient: bill.patientUuid,
    };

    setIsLoading(true);
    processBillPayment(billWithDeletedLineItem, bill.uuid)
      .then(() => {
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill'), undefined, {
          revalidate: true,
        });
        showSnackbar({
          title: t('deleteLineItem', 'Delete Line Item'),
          subtitle: 'Item has been successfully deleted.',
          kind: 'success',
          timeoutInMs: 3000,
        });
      })
      .catch((error) => {
        showSnackbar({ title: 'An error occurred trying to delete item', kind: 'error', subtitle: error.message });
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel} closeModal={onClose}>
        Delete bill
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        Are you sure you want to delete this bill? Proceed cautiously.
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button kind="danger" onClick={deleteLineItem}>
          {isLoading ? (
            <div className={styles.loading_wrapper}>
              <Loading className={styles.button_spinner} withOverlay={false} small />
              {t('processingPayment', 'Processing Payment')}
            </div>
          ) : (
            t('delete', 'Delete')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
