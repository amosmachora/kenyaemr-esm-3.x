import {
  CalendarHeatMap,
  CarbonIconType,
  Home,
  ListChecked,
  Microscope,
  QueryQueue,
  WatsonHealthStudyTransfer,
} from '@carbon/react/icons';

export const openmrsBase = window.getOpenmrsSpaBase();

export type Route = {
  link: string; // this is the full link. openmrs base and everything
  icon: CarbonIconType | string;
  text: string;
};

export const iconsMap = new Map<string, CarbonIconType>();

iconsMap.set(`${openmrsBase}home`, Home);
iconsMap.set(`${openmrsBase}home/wards`, WatsonHealthStudyTransfer);
iconsMap.set(`${openmrsBase}home/patient-lists`, ListChecked);
iconsMap.set(`${openmrsBase}home/service-queues`, QueryQueue);
iconsMap.set(`${openmrsBase}home/appointments`, CalendarHeatMap);
iconsMap.set(`${openmrsBase}home/laboratory`, Microscope);
