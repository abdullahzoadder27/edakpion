import React from 'react';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { DashboardOverview } from './DashboardOverview';

export function UserDashboard() {
  return (
    <UserDashboardLayout>
      <DashboardOverview />
    </UserDashboardLayout>
  );
}
