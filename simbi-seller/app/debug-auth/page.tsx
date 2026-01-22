// @ts-nocheck
"use client";

import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const { seller, accessToken, loading } = useSellerAuth();
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sellerAccessToken');
      setLocalStorageToken(token);
    }
  }, []);

  const testApiCall = async () => {
    try {
      const { apiClient } = await import('@/lib/apiClient');
      const result = await apiClient.request('/api/seller/dashboard/stats');
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context State:</h2>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Seller:</strong> {seller ? 'Logged in' : 'Not logged in'}</p>
          <p><strong>Access Token:</strong> {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">LocalStorage State:</h2>
          <p><strong>Token in localStorage:</strong> {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'None'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">API Test:</h2>
          <button 
            onClick={testApiCall}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
          {testResult && (
            <pre className="mt-2 bg-white p-2 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}









