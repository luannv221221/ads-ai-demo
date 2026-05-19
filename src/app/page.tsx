'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/components/Dashboard/Dashboard";
import AiAlerts from "@/components/AI/AiAlerts";
import { syncAllAccounts } from '@/app/actions/facebook';
import { getAdAccounts } from '@/app/actions/dashboard';

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days ago to show spend
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function loadAccounts() {
      const result = await getAdAccounts();
      if (result.success && result.data) {
        setAccounts(result.data);
      }
    }
    loadAccounts();
  }, [refreshKey]);

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
      accounts={accounts}
      selectedAccountId={selectedAccountId}
      onAccountChange={(id) => {
        setSelectedAccountId(id);
        setRefreshKey(prev => prev + 1);
      }}
      rightSidebarContent={<AiAlerts />}
    >
      <Dashboard 
        key={refreshKey} 
        startDate={dateRange.start} 
        endDate={dateRange.end} 
        adAccountId={selectedAccountId}
      />
    </MainLayout>
  );
}

