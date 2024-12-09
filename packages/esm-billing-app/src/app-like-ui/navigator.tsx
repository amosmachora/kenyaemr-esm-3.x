import { useConfig } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BillingConfig } from '../config-schema';
import { NavigatorIcon } from './navigator-icon';
import styles from './navigator.scss';
import { SuperNavigator, SuperNavigatorNode } from './super-navigator';
import { iconsMap, openmrsBase, Route } from './utils';

export const Navigator = ({ closeNavigator }: { closeNavigator: () => void }) => {
  const { superNavigatorIcons } = useConfig<BillingConfig>();

  const allLinks = Array.from(document.querySelectorAll('a'));
  const routes = allLinks
    .map((link) => link.href)
    .filter((link) => Boolean(link))
    .filter((link) => link.includes('/patient') === false);

  const homePageRoutes: Route[] = Array.from(new Set(routes)).map((link) => {
    const splitLink = link.split('/').filter((s) => Boolean(s));
    const name = splitLink.at(-1);
    const linkIcon = superNavigatorIcons.find((icon) => icon.leftPanelName.toLowerCase() === name);
    const linkWithoutHostName = link.substring(link.indexOf(openmrsBase));
    const hardCodedIcon = iconsMap.get(linkWithoutHostName);

    return {
      icon: linkIcon?.carbonIcon ?? linkIcon?.svgString ?? hardCodedIcon ?? name.at(0),
      link: linkWithoutHostName.endsWith('/') ? linkWithoutHostName.slice(0, -1) : linkWithoutHostName,
      text: name,
      iconType: linkIcon?.carbonIcon ? 'loaded' : linkIcon?.svgString ? 'svg' : hardCodedIcon ? 'hard-coded' : 'letter',
    };
  });

  const homeRoutesNavigator = new SuperNavigator(homePageRoutes);

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
                <NavigatorIcon icon={option.icon} />
                {option.text}
              </div>
            );
          }
          return (
            <Link to={option.link} onClick={closeNavigator}>
              <NavigatorIcon icon={option.icon} />
              {option.text}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
