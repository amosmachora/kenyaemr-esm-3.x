import React, { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Loading } from '@carbon/react';
import styles from './line-item-modals.scss';
import { LineItem, MappedBill } from '../../../types';
import { processBillItems } from '../../../billing.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';

export const DeleteLineItem: React.FC<{
  onClose: () => void;
  bill: MappedBill;
  lineItem: LineItem;
}> = ({ onClose, bill, lineItem }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const deleteLineItem = () => {
    const lineItemToBeDeleted = {
      item: lineItem.item,
      quantity: lineItem.quantity,
      price: lineItem.price,
      priceName: lineItem.priceName,
      priceUuid: lineItem.priceUuid,
      lineItemOrder: lineItem.lineItemOrder,
      billableService: lineItem.billableService.split(':').at(0),
      paymentStatus: 'CANCELLED', //TODO use PaymentStatus
      voidReason: 'Client deleted this line item',
      voided: true,
    };

    const billWithRefund = {
      cashPoint: bill.cashPointUuid,
      cashier: bill.cashier.uuid,
      lineItems: [lineItemToBeDeleted],
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
