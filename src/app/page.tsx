'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/components/Dashboard/Dashboard";
import AiAlerts from "@/components/AI/AiAlerts";
import { syncAllAccounts } from '@/app/actions/facebook';
import { getAdAccounts } from '@/app/actions/dashboard';
import { createLastDaysDateRange, type DateRange } from '@/lib/dateRange';

interface AdAccountSummary {
  id: string;
  name?: string;
  account_id?: string;
}

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accounts, setAccounts] = useState<AdAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>(() => createLastDaysDateRange(30));

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

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MainLayout 
      title="Dashboard War Room" 
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      dateRange={dateRange}
      onDateRangeChange={handleRangeChange}
      showDateRange
      showAccountSelect
      dataStatus="live"
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
