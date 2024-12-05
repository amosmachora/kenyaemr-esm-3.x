/* eslint-disable no-console */
import { HeaderGlobalAction } from '@carbon/react';
import { Workspace } from '@carbon/react/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import styles from './navigation-launcher.scss';
import { Navigator } from './navigator';

export const SuperNavigationLauncher = () => {
  const { t } = useTranslation();
  const [isShowingNavigator, setIsShowingNavigator] = useState(false);

  useEffect(() => {
    // TODO you can remove the sidebar uing some sidebar configuration
    const homesidebar = document.querySelector('[data-extension-slot-name="home-sidebar-slot"]');

    if (homesidebar) {
      // homesidebar.remove();
    }

    const firstSection = document.querySelector('section');
    // firstSection.style.marginLeft = '0';

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
