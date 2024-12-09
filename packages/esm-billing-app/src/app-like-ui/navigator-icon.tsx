import { CarbonIconType } from '@carbon/react/icons';
import React, { lazy, Suspense } from 'react';
import { SuperNavigatorIcon } from './super-navigator';

const loadIcon = (iconName: string) => {
  return lazy(() =>
    import('@carbon/react/icons').then((module) => {
      const Icon = module[iconName];
      if (!Icon) {
        throw new Error(`Icon "${iconName}" does not exist in @carbon/react/icons.`);
      }
      return { default: Icon as CarbonIconType };
    }),
  );
};

export const NavigatorIcon = ({ icon }: { icon: SuperNavigatorIcon }) => {
  if (icon.type === 'hard-coded' || icon.type === 'svg') {
    return <icon.icon />;
  }

  if (icon.type === 'letter') {
    return <p>{icon.icon as string}</p>;
  }

  const IconComponent = loadIcon(icon.icon as string);

  return (
    <Suspense fallback={<div>Loading Icon...</div>}>
      <IconComponent />
    </Suspense>
  );
};
