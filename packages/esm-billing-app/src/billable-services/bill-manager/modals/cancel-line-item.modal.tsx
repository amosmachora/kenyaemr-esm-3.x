import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import styles from './cancel-line-item.scss';
import { useTranslation } from 'react-i18next';

export const CancelLineItem: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel} closeModal={onClose}>
        {t('cancelLineItem', 'Cancel Line Item')}
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        {t('cancelLineItemDescription', 'Are you sure you want to cancel this item? Proceed cautiously.')}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger">{t('continue', 'Continue')}</Button>
      </ModalFooter>
    </React.Fragment>
  );
};
