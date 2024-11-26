import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BillManager from './billable-services/bill-manager/bill-manager.component';
import { ChargeItemsDashboard } from './billable-services/dashboard/dashboard.component';
import { PaymentHistory } from './billable-services/payment-history/payment-history.component';
import { BillingDashboard } from './billing-dashboard/billing-dashboard.component';
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';
import ClaimsManagementPreAuthRequest from './claims/claims-management/main/claims-pre-auth-main.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import PreAuthRequestDashboard from './claims/pre-auth/pre-auth-dashboard.component';
import Invoice from './invoice/invoice.component';
import PaymentModeHome from './payment-modes/payment-mode-home.component';
import { ClockInBoundary } from './payment-points/clock-in-boundary.component';
import { PaymentPoint } from './payment-points/payment-point/payment-point.component';
import { PaymentPoints } from './payment-points/payment-points.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  useEffect(() => {
    const allLinks = Array.from(document.querySelectorAll('a'));

    const hrefs = allLinks.map((link) => link.href);
    // getting the sidebar
    const homesidebar = document.querySelector('[data-extension-slot-name="home-sidebar-slot"]');

    if (homesidebar) {
      homesidebar.remove();
    }

    const firstSection = document.querySelector('section');
    firstSection.style.marginLeft = '0';
  }, []);

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/claims-overview" element={<ClaimsManagementOverview />} />
        <Route path="/preauth-requests" element={<ClaimsManagementPreAuthRequest />} />
        <Route path="/patient/:patientUuid/:billUuid/pre-auth-request" element={<PreAuthRequestDashboard />} />
        <Route
          path="/patient/:patientUuid/:billUuid"
          element={
            <ClockInBoundary>
              <Invoice />
            </ClockInBoundary>
          }
        />
        <Route
          path="/patient/:patientUuid/:billUuid/claims"
          element={
            <ClockInBoundary>
              <ClaimScreen />
            </ClockInBoundary>
          }
        />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-points" element={<PaymentPoints />} />
        <Route path="/payment-points/:paymentPointUUID" element={<PaymentPoint />} />
        <Route path="/bill-manager" element={<BillManager />} />
        <Route path="/charge-items" element={<ChargeItemsDashboard />} />
        <Route path="/payment-modes" element={<PaymentModeHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
