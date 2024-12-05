import { getAssignedExtensions, useConfig } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BillingConfig } from '../config-schema';
import styles from './navigator.scss';
import { SuperNavigator, SuperNavigatorNode } from './super-navigator';
import { iconsMap, openmrsBase, Route } from './utils';

export const Navigator = ({ closeNavigator }: { closeNavigator: () => void }) => {
  const { extraRouteExtensions } = useConfig<BillingConfig>();
  const assignedExtensions = getAssignedExtensions('homepage-dashboard-slot');
  console.log('assignedExtensions', assignedExtensions);

  const homePageRoutes: Route[] = assignedExtensions.map((ext) => {
    const extensionMetaName = ext.meta.name.toLowerCase();

    const link = extensionMetaName.includes('home')
      ? openmrsBase + extensionMetaName
      : openmrsBase + 'home/' + extensionMetaName;
    return {
      icon: iconsMap.get(link) ?? 'String',
      link,
      text: ext.meta.name,
    };
  });

  const extraRoutes = extraRouteExtensions.map((ext) => getAssignedExtensions(ext));

  console.log('routes', homePageRoutes);
  console.log('extra routes', extraRoutes);

  const homeRoutesNavigator = new SuperNavigator([]);
  const [currentOptions, setCurrentOptions] = useState<SuperNavigatorNode[]>([
    homeRoutesNavigator.root,
    ...homeRoutesNavigator.root.children,
  ]);

  // TODO fix bug on clicking routes with children. You currently cannot be redirected to the route
  return (
    <div className={styles.container}>
      <div className={styles.linkContainer}>
        {currentOptions.map((option) => {
          if (option.children.length >= 1) {
            return (
              <div
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentOptions([option, ...option.children]);
                  }
                }}
                onClick={() => setCurrentOptions([option, ...option.children])}
                tabIndex={0}
                role="button">
                {<option.icon />}
                {option.text}
              </div>
            );
          }
          return (
            <Link to={option.link} onClick={closeNavigator}>
              {<option.icon />}
              {option.text}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
