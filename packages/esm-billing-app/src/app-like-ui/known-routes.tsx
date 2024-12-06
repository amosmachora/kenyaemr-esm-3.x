import { IbmLpa, Keyboard, ScreenMap } from '@carbon/react/icons';
import { Route } from './utils';

export const knownSystemAdministrationRoutes: Route[] = [
  {
    icon: IbmLpa,
    link: '/openmrs/spa/system-administration',
    text: 'System Administration',
  },
];

export const knownDispensingRoutes: Route[] = [
  {
    icon: ScreenMap,
    link: '/openmrs/spa/dispensing',
    text: 'Dispensing',
  },
];

export const knownFastDataEntryRoutes: Route[] = [
  {
    icon: Keyboard,
    link: '/openmrs/spa/forms',
    text: 'Fast Data Entry',
  },
];
