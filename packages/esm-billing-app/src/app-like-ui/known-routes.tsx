import {
  CarbonIconType,
  DataCategorical,
  Events,
  Home,
  IbmCloudSysdigSecure,
  IbmCloudVirtualServerClassic,
  ImageReference,
  Money,
  PiggyBank,
  QueryQueue,
  RecentlyViewed,
  TwoFactorAuthentication,
  Wallet,
  WatsonxData,
} from '@carbon/react/icons';

const openmrsBase = window.getOpenmrsSpaBase();

export type KnownRoute = {
  link: string; // this is the full link. openmrs base and everything
  icon: CarbonIconType;
  text: string;
};

export const knownHomeRoutes: KnownRoute[] = [
  {
    link: `${openmrsBase}home`,
    icon: Home,
    text: 'Home',
  },
  {
    link: `${openmrsBase}home/providers`,
    icon: Events,
    text: 'Providers',
  },
  {
    link: `${openmrsBase}home/laboratory`,
    icon: WatsonxData,
    text: 'Laboratory',
  },
  {
    link: `${openmrsBase}home/service-queues`,
    icon: QueryQueue,
    text: 'Service Queues',
  },
  {
    link: `${openmrsBase}home/imaging-orders`,
    icon: ImageReference,
    text: 'Imaging Orders',
  },
  {
    link: `${openmrsBase}home/pharmacy`,
    icon: ImageReference,
    text: 'Community Pharmacy',
  },
  {
    link: `${openmrsBase}home/lab-manifest`,
    icon: ImageReference,
    text: 'Manifests',
  },
  {
    link: `${openmrsBase}home/lab-manifest/overview`,
    icon: ImageReference,
    text: 'Overview',
  },
  {
    link: `${openmrsBase}home/procedure`,
    icon: ImageReference,
    text: 'Procedures',
  },
  {
    link: `${openmrsBase}home/case-management`,
    icon: ImageReference,
    text: 'Case Management',
  },
  {
    link: `${openmrsBase}home/peer-calendar`,
    icon: ImageReference,
    text: 'Peer Calendar',
  },
  {
    link: `${openmrsBase}home/billing`,
    icon: Money,
    text: 'Billing',
  },
  {
    link: `${openmrsBase}home/billing/payment-history`,
    icon: RecentlyViewed,
    text: 'Payment History',
  },
  {
    link: `${openmrsBase}home/billing/payment-points`,
    icon: IbmCloudSysdigSecure,
    text: 'Payment points',
  },
  {
    link: `${openmrsBase}home/billing/payment-modes`,
    icon: Wallet,
    text: 'Payment Modes',
  },
  {
    link: `${openmrsBase}home/billing/bill-manager`,
    icon: PiggyBank,
    text: 'Bill Manager',
  },
  {
    link: `${openmrsBase}home/billing/charge-items`,
    icon: DataCategorical,
    text: 'Charge Items',
  },
  {
    link: `${openmrsBase}home/claims-overview`,
    icon: IbmCloudVirtualServerClassic,
    text: 'Claims Overview',
  },
  {
    link: `${openmrsBase}home/preauth-requests`,
    icon: TwoFactorAuthentication,
    text: 'Pre auth requests',
  },
  {
    link: `${openmrsBase}home/appointments`,
    icon: TwoFactorAuthentication,
    text: 'Appointments',
  },
  {
    link: `${openmrsBase}home/referrals`,
    icon: TwoFactorAuthentication,
    text: 'Referrals',
  },
];
