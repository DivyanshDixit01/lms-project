import React, { useEffect } from "react";
import { useGetPaymentStatsQuery, useGetAllPaymentsQuery } from "../features/api/paymentApi";
import { useGetAnalyticsSummaryQuery } from "../features/api/analyticsApi";

const DebugAPI = () => {
  // Test payment stats
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetPaymentStatsQuery();
  
  // Test all payments
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useGetAllPaymentsQuery({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
  });

  // Test analytics summary
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useGetAnalyticsSummaryQuery();

  useEffect(() => {
    console.log("=== DEBUG API ===");
    console.log("Payment Stats:", { data: statsData, loading: statsLoading, error: statsError });
    console.log("All Payments:", { data: paymentsData, loading: paymentsLoading, error: paymentsError });
    console.log("Analytics Summary:", { data: analyticsData, loading: analyticsLoading, error: analyticsError });
  }, [statsData, paymentsData, analyticsData, statsLoading, paymentsLoading, analyticsLoading]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", margin: "20px" }}>
      <h2>🔍 API Debug Console</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Payment Stats</h3>
        <button onClick={() => refetchStats()}>Refetch Stats</button>
        <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
          {JSON.stringify({ data: statsData, loading: statsLoading, error: statsError }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>All Payments</h3>
        <button onClick={() => refetchPayments()}>Refetch Payments</button>
        <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
          {JSON.stringify({ data: paymentsData, loading: paymentsLoading, error: paymentsError }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Analytics Summary</h3>
        <button onClick={() => refetchAnalytics()}>Refetch Analytics</button>
        <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
          {JSON.stringify({ data: analyticsData, loading: analyticsLoading, error: analyticsError }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugAPI;
