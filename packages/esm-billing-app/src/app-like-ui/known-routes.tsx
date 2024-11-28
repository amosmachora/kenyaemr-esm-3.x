import {
  CarbonIconType,
  DataCategorical,
  Events,
  Home,
  IbmCloudSysdigSecure,
  IbmCloudVirtualServerClassic,
  Money,
  PiggyBank,
  RecentlyViewed,
  TwoFactorAuthentication,
  Wallet,
} from '@carbon/react/icons';

const openmrsBase = window.getOpenmrsSpaBase();

export type KnownRoute = {
  link: string;
  icon: CarbonIconType;
  text: string;
};

export const knownHomeRoutes: KnownRoute[] = [
  {
    link: `${openmrsBase}openmrs/spa/home`,
    icon: Home,
    text: 'Home',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/providers`,
    icon: Events,
    text: 'Events',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/`,
    icon: Money,
    text: 'Billing',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/payment-history`,
    icon: RecentlyViewed,
    text: 'Payment History',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/payment-points`,
    icon: IbmCloudSysdigSecure,
    text: 'Payment points',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/payment-modes`,
    icon: Wallet,
    text: 'Payment Modes',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/bill-manager`,
    icon: PiggyBank,
    text: 'Bill Manager',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/charge-items`,
    icon: DataCategorical,
    text: 'Charge Items',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/claims-overview`,
    icon: IbmCloudVirtualServerClassic,
    text: 'Claims Overview',
  },
  {
    link: `${openmrsBase}openmrs/spa/home/billing/preauth-requests`,
    icon: TwoFactorAuthentication,
    text: 'Pre auth requests',
  },
];
