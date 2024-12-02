import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { knownHomeRoutes } from './known-routes';
import styles from './navigator.scss';
import { SuperNavigator, SuperNavigatorNode } from './super-navigator';

export const Navigator = ({ closeNavigator }: { closeNavigator: () => void }) => {
  const homeRoutesNavigator = new SuperNavigator(knownHomeRoutes);
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
