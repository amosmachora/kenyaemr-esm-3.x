/* eslint-disable no-console */
import { HeaderGlobalAction } from '@carbon/react';
import { Workspace } from '@carbon/react/icons';
import { useConfig } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { BillingConfig } from '../config-schema';
import styles from './navigation-launcher.scss';
import { Navigator } from './navigator';

export const SuperNavigationLauncher = () => {
  const { t } = useTranslation();
  const [isShowingNavigator, setIsShowingNavigator] = useState(false);
  const { extraRoutes, isExclusive } = useConfig<BillingConfig>();

  useEffect(() => {
    const firstSection = document.querySelector('section');
    if (isExclusive) {
      // TODO you can remove the sidebar uing some sidebar configuration
      // const homesidebar = document.querySelector('[data-extension-slot-name="home-sidebar-slot"]');

      // if (homesidebar) {
      //   homesidebar.remove();
      // }

      firstSection.style.marginLeft = '0';
    } else {
      firstSection.style.marginLeft = '16rem';
    }
  }, [isExclusive]);

  useEffect(() => {
    const hasShownNavigatorForTheFirstTime = sessionStorage.getItem('has-shown-navigator');
    if (hasShownNavigatorForTheFirstTime !== 'true') {
      setIsShowingNavigator(true);
      sessionStorage.setItem('has-shown-navigator', 'true');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsShowingNavigator((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {isShowingNavigator && (
        <BrowserRouter>
          <Navigator closeNavigator={() => setIsShowingNavigator(false)} />
        </BrowserRouter>
      )}
      <HeaderGlobalAction
        aria-label={t('superNavigation', 'Super Navigation')}
        enterDelayMs={500}
        name="Super Navigation"
        onClick={() => setIsShowingNavigator(true)}
        className={styles.navLauncher}>
        <Workspace size={20} />
      </HeaderGlobalAction>
    </>
  );
};
