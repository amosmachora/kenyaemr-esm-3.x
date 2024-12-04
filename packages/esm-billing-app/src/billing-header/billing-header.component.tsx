import { TagSkeleton } from '@carbon/react';
import { Alarm, Calendar, Location, UserFollow } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClockInStatus } from '../payment-points/use-clock-in-status';
import styles from './billing-header.scss';
import BillingIllustration from './billing-illustration.component';

interface BillingHeaderProps {
  title: string;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const { isClockedIn, globalActiveSheet, isLoading } = useClockInStatus();
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header} data-testid="billing-header">
      <div className={styles['left-justified-items']}>
        <BillingIllustration />
        <div className={styles['page-labels']}>
          <p>{t('billing', 'Billing')}</p>
          <div className={styles.pageNameWrapper}>
            <p className={styles['page-name']}>{title}</p>
            {isLoading ? (
              <TagSkeleton size="md" className={styles.tagSkeleton} style={{ width: '10rem' }} />
            ) : (
              isClockedIn && (
                <div className={styles.clockInInfo}>
                  <Alarm />
                  {globalActiveSheet.display}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles.userContainer}>
          <p>{session?.user?.person?.display}</p>
          <UserFollow size={16} className={styles.userIcon} />
        </div>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};

export default BillingHeader;
