// @ts-nocheck
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: LucideIcon;
  className?: string;
  miniChart?: {
    data: number[];
    color: string;
  };
  progress?: {
    value: number;
    max: number;
    color: string;
  };
}

export function MetricCard({ title, value, change, icon: Icon, className, miniChart, progress }: MetricCardProps) {
   const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
     switch (type) {
       case 'increase': return 'text-emerald-600 dark:text-emerald-400';
       case 'decrease': return 'text-red-600 dark:text-red-400';
       default: return 'text-slate-500 dark:text-slate-400';
     }
   };

   const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
     switch (type) {
       case 'increase': return <TrendingUp className="w-4 h-4" />;
       case 'decrease': return <TrendingDown className="w-4 h-4" />;
       default: return <Minus className="w-4 h-4" />;
     }
   };

   const MiniChart = ({ data, color }: { data: number[], color: string }) => {
     const max = Math.max(...data);
     const min = Math.min(...data);
     const range = max - min || 1;

     return (
       <div className="flex items-end gap-1 h-8">
         {data.map((value, index) => (
           <div
             key={index}
             className="bg-current rounded-sm opacity-60"
             style={{
               height: `${((value - min) / range) * 100}%`,
               width: '3px',
               color: color
             }}
           />
         ))}
       </div>
     );
   };

   const ProgressRing = ({ value, max, color }: { value: number, max: number, color: string }) => {
     const percentage = (value / max) * 100;
     const radius = 20;
     const circumference = 2 * Math.PI * radius;
     const strokeDasharray = circumference;
     const strokeDashoffset = circumference - (percentage / 100) * circumference;

     return (
       <div className="relative h-12 w-12">
         <svg className="h-12 w-12 transform -rotate-90" viewBox="0 0 48 48">
           <circle
             cx="24"
             cy="24"
             r={radius}
             stroke="currentColor"
             strokeWidth="3"
             fill="none"
             className="text-slate-200"
           />
           <circle
             cx="24"
             cy="24"
             r={radius}
             stroke={color}
             strokeWidth="3"
             fill="none"
             strokeDasharray={strokeDasharray}
             strokeDashoffset={strokeDashoffset}
             strokeLinecap="round"
             className="transition-all duration-500"
           />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xs font-bold" style={{ color }}>
             {Math.round(percentage)}%
           </span>
         </div>
       </div>
     );
   };

   return (
     <Card className={cn("group relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in glass-card border-0 hover:scale-[1.02] z-10", className)}>
       <CardContent className="p-4 relative">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-sky-500/5 to-blue-500/5 rounded-full -translate-y-3 translate-x-3 group-hover:scale-110 transition-transform duration-300"></div>
 
         <div className="relative">
           {/* Header with title and trend */}
           <div className="flex items-center justify-between mb-3">
             <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</p>
             {change && (
               <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold", getChangeColor(change.type))}>
                 {getChangeIcon(change.type)}
                 <span>{change.value}</span>
               </div>
             )}
           </div>
 
           {/* Main content area */}
           <div className="flex items-center justify-between">
             <div className="space-y-2 flex-1">
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
 
               {/* Mini chart or progress ring */}
               <div className="flex items-center gap-3">
                 {miniChart && (
                   <div className="flex items-center gap-2">
                     <MiniChart data={miniChart.data} color={miniChart.color} />
                     <span className="text-xs text-slate-500">7d trend</span>
                   </div>
                 )}
                 {progress && (
                   <ProgressRing value={progress.value} max={progress.max} color={progress.color} />
                 )}
               </div>
             </div>
 
             {/* Icon */}
             <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center ml-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
               <Icon className="h-6 w-6 text-white" />
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }