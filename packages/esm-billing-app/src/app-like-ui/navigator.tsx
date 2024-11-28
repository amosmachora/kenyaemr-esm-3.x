import React, { useState } from 'react';
import { knownHomeRoutes } from './known-routes';
import { SuperNavigator, SuperNavigatorNode } from './super-navigator';

export const Navigator = () => {
  const homeRoutesNavigator = new SuperNavigator(knownHomeRoutes);
  const [currentOptions, setCurrentOptions] = useState<SuperNavigatorNode[]>(homeRoutesNavigator.getRootChildren());

  return <div>Navigator</div>;
};
