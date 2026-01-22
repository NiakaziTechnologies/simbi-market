// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import { formatUSD } from "@/lib/currency";
import { apiClient } from "@/lib/apiClient";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TopProductDatum = {
  name: string;
  value: number;
  units?: number;
};

const COLORS = [
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#EC4899', // pink-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
];

export function TopProductsDonut({ data, range }: { data?: TopProductDatum[], range?: any }) {
  const [chartData, setChartData] = useState<TopProductDatum[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load top products data from API
  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setLoading(true);
        // Get auth token from localStorage
        const token = localStorage.getItem('sellerAccessToken');
        if (!token) {
          console.log("No authentication token found - user not logged in");
          setChartData([]);
          setHasLoaded(true);
          setLoading(false);
          return;
        }

        const response = await apiClient.request<{ success: boolean; message: string; data?: any[] }>(
          '/api/seller/dashboard/top-products?limit=10',
          {
            method: 'GET',
          }
        );

        // Check if data exists and is an array with items
        const products = response.data && Array.isArray(response.data) ? response.data : [];
        
        if (response.success && products.length > 0) {
          const productsData = products.map((product: any) => ({
            name: product.productName || product.name || 'Unknown Product',
            value: product.revenue || product.value || 0,
            units: product.quantitySold || product.units || 0
          }));
          setChartData(productsData);
        } else {
          // Empty array when there are no products
          setChartData([]);
        }
        
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to load top products:", error);
        setChartData([]);
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadTopProducts();
  }, []);

  // Update chart data when data prop changes
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      setHasLoaded(true);
      setLoading(false);
    } else if (data && data.length === 0) {
      // Explicitly empty array
      setChartData([]);
      setHasLoaded(true);
      setLoading(false);
    }
  }, [data]);

  // Prepare chart data for ApexCharts
  const chartConfig = useMemo(() => {
    const displayData = chartData.slice(0, 10).sort((a, b) => (b.value || 0) - (a.value || 0));
    const labels = displayData.map(item => {
      // Truncate long names
      const name = item.name || 'Unknown';
      return name.length > 25 ? name.substring(0, 25) + '...' : name;
    });
    const values = displayData.map(item => item.value || 0);
    const colors = displayData.map((_, index) => COLORS[index % COLORS.length]);

    return {
      series: [{
        name: 'Revenue',
        data: values
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: {
            show: false
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 4,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: number) {
            return formatUSD(val);
          },
          offsetY: -20,
          style: {
            fontSize: '11px',
            colors: ['#6B7280']
          }
        },
        xaxis: {
          categories: labels,
          labels: {
            style: {
              fontSize: '11px',
              colors: '#6B7280'
            },
            rotate: -45,
            rotateAlways: false
          }
        },
        yaxis: {
          labels: {
            formatter: function(val: number) {
              return '$' + (val / 1000).toFixed(0) + 'k';
            },
            style: {
              fontSize: '11px',
              colors: '#6B7280'
            }
          }
        },
        fill: {
          colors: colors,
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function(val: number, opts: any) {
              const item = displayData[opts.dataPointIndex];
              const units = item?.units ? ` • ${item.units} units` : '';
              return formatUSD(val) + units;
            }
          }
        },
        grid: {
          borderColor: '#E5E7EB',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        }
      }
    };
  }, [chartData]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [chartData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500">Loading top products...</p>
      </div>
    );
  }

  // No data state
  if (hasLoaded && chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-700 mb-1">No data yet</p>
        <p className="text-sm text-gray-500 text-center">Start making sales to see your top products here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Container */}
      <div className="w-full">
        {typeof window !== 'undefined' && (
          <Chart
            options={chartConfig.options}
            series={chartConfig.series}
            type="bar"
            height={350}
          />
        )}
      </div>

      {/* Legend/Summary */}
      <div className="space-y-2 mt-4">
        <div className="grid grid-cols-1 gap-1.5">
          {chartData.slice(0, 10).sort((a, b) => (b.value || 0) - (a.value || 0)).map((item, index) => {
            const percentage = total > 0 ? Math.round(((item.value || 0) / total) * 100) : 0;
            return (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700 truncate">
                    {item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-500">{formatUSD(item.value)}</span>
                  <span className="text-emerald-600 font-semibold w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
