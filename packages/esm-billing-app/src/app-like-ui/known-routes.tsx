import { IbmLpa, Keyboard, ScreenMap } from '@carbon/react/icons';
import { Route } from './utils';

export const knownSystemAdministrationRoutes: Route[] = [
  {
    icon: IbmLpa,
    link: '/openmrs/spa/system-administration',
    text: 'System Administration',
    iconType: 'hard-coded',
  },
];

export const knownDispensingRoutes: Route[] = [
  {
    icon: ScreenMap,
    link: '/openmrs/spa/dispensing',
    text: 'Dispensing',
    iconType: 'hard-coded',
  },
];

export const knownFastDataEntryRoutes: Route[] = [
  {
    icon: Keyboard,
    link: '/openmrs/spa/forms',
    text: 'Fast Data Entry',
    iconType: 'hard-coded',
  },
];
