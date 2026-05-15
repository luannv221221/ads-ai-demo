'use client';

import React, { useState } from 'react';
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/components/Dashboard/Dashboard";
import AiAlerts from "@/components/AI/AiAlerts";
import { syncAllAccounts } from '@/app/actions/facebook';

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await syncAllAccounts();
      if (result.success) {
        setRefreshKey(prev => prev + 1);
      } else {
        alert('Đồng bộ thất bại: ' + result.error);
      }
    } catch (error) {
      console.error(error);
    }
    setIsRefreshing(false);
  };

  const handleRangeChange = (value: string) => {
    const [date, type] = value.split('_');
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MainLayout 
      title="Dashboard War Room" 
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onDateChange={handleRangeChange}
      rightSidebarContent={<AiAlerts />}
    >
      <Dashboard key={refreshKey} startDate={dateRange.start} endDate={dateRange.end} />
    </MainLayout>
  );
}
