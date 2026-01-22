// @ts-nocheck
import React from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, BarChart } from "recharts";
import { formatUSD } from "@/lib/currency";

type Series = { year: number; data: any[] };

export default function YearComparisonChart({ series, compareMode = 'yearly', chartType = 'line', seriesRender = {} }: { series: Series[]; compareMode?: 'yearly' | 'month'; chartType?: 'line' | 'bar' | 'mixed'; seriesRender?: Record<number, 'bar' | 'line'> }) {
  const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  function LegendContent({ payload, series, seriesRender, colors, chartType }: any) {
    // payload from Recharts has { value, color, payload }
    if (!payload || payload.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-3 items-center">
        {payload.map((p: any, idx: number) => {
          const label = p.value || (p.payload && p.payload.name) || `Series ${idx+1}`;
          const match = label && String(label).match(/\d{4}/);
          const year = match ? match[0] : label;
          const color = p.color || colors[idx % (colors.length || 1)];
          const mode = seriesRender && seriesRender[Number(year)] ? seriesRender[Number(year)] : undefined;
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: color }} aria-hidden="true" />
              <span className="text-sm">{label}{mode ? ` — ${mode}` : ''}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSeriesComponents() {
    return series.map((s, idx) => {
      const key = String(s.year);
      const mode = seriesRender && seriesRender[s.year] ? seriesRender[s.year] : (chartType === 'mixed' ? (idx === 0 ? 'bar' : 'line') : chartType);
      const color = colors[idx % colors.length];
      if (mode === 'bar') return <Bar key={key} dataKey={key} fill={color} name={chartType === 'mixed' ? `${s.year} (bar)` : String(s.year)} />;
      return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} name={chartType === 'mixed' ? `${s.year} (line)` : String(s.year)} />;
    });
  }

  if (compareMode === 'yearly') {
    const months = Array.from({ length: 12 }).map((_, i) => ({ month: i + 1, label: new Date(0, i).toLocaleString("en-US", { month: "short" }) }));
    const merged = months.map((m) => {
      const row: any = { month: m.label };
      series.forEach((s) => {
        const item = s.data.find((d) => d.month === m.month);
        row[String(s.year)] = item ? item.revenue : 0;
      });
      return row;
    });

    if (chartType === 'line') {
      return (
        <div className="h-80 bg-card rounded p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={merged} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
              <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
              <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
              {series.map((s, idx) => (
                <Line key={s.year} type="monotone" dataKey={String(s.year)} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} name={String(s.year)} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="h-80 bg-card rounded p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={merged} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
              <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
              <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
              {series.map((s, idx) => (
                <Bar key={s.year} dataKey={String(s.year)} fill={colors[idx % colors.length]} name={String(s.year)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // mixed
    return (
      <div className="h-80 bg-card rounded p-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
            <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
            <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
            {renderSeriesComponents()}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // month compare (daily series)
  const maxDays = Math.max(...series.map((s) => s.data.length));
  const mergedDays = Array.from({ length: maxDays }).map((_, i) => {
    const row: any = { day: i + 1 };
    series.forEach((s) => {
      const item = s.data[i];
      row[String(s.year)] = item ? item.revenue : 0;
    });
    return row;
  });

  if (chartType === 'line') {
    return (
      <div className="h-80 bg-card rounded p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedDays} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
            <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
            <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
            {series.map((s, idx) => (
              <Line key={s.year} type="monotone" dataKey={String(s.year)} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} name={String(s.year)} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'bar') {
    return (
      <div className="h-80 bg-card rounded p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mergedDays} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
            <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
            <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
            {series.map((s, idx) => (
              <Bar key={s.year} dataKey={String(s.year)} fill={colors[idx % colors.length]} name={String(s.year)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // mixed
  return (
    <div className="h-80 bg-card rounded p-3">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={mergedDays} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis tickFormatter={(v) => formatUSD(Number(v))} />
          <Tooltip formatter={(v: any) => (typeof v === 'number' ? formatUSD(v) : v)} />
          <Legend content={(props)=> <LegendContent {...props} series={series} seriesRender={seriesRender} colors={colors} chartType={chartType} />} />
          {renderSeriesComponents()}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
