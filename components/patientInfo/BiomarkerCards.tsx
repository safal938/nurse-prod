import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

// --- Types ---
export interface ChartPoint {
  date: string;
  value: number;
}

// --- Health Chart Component with Recharts ---
interface HealthChartProps {
  data: ChartPoint[];
  ranges: number[];
  currentValue: number;
}

const HealthChart: React.FC<HealthChartProps> = ({ data, ranges, currentValue }) => {
  const [min, low, high, max] = ranges;
  
  // Calculate adaptive Y-axis range based on actual data
  const dataValues = data.map(d => d.value);
  const minDataValue = Math.min(...dataValues);
  const maxDataValue = Math.max(...dataValues);
  
  // Set Y-axis min to slightly below the lowest value or the low threshold, whichever is lower
  const yMin = Math.max(0, Math.min(minDataValue, low) * 0.8);
  
  // Set Y-axis max to slightly above the highest value, but ensure it shows the high threshold
  const yMax = Math.max(maxDataValue * 1.2, high * 1.3);
  
  const isSafe = currentValue >= low && currentValue <= high;
  
  // Generate adaptive Y-axis ticks
  const generateYTicks = () => {
    const ticks = [];
    
    // Always include the thresholds if they're in range
    if (low >= yMin && low <= yMax) ticks.push(low);
    if (high >= yMin && high <= yMax) ticks.push(high);
    
    // Add min and max data points
    ticks.push(Math.round(yMin * 10) / 10);
    ticks.push(Math.round(yMax * 10) / 10);
    
    // Add current value
    ticks.push(currentValue);
    
    // Add intermediate values for better scale
    const range = yMax - yMin;
    const step = range / 4;
    for (let i = 1; i < 4; i++) {
      const tick = yMin + (step * i);
      ticks.push(Math.round(tick * 10) / 10);
    }
    
    // Remove duplicates and sort
    return [...new Set(ticks)].sort((a, b) => a - b).slice(0, 6); // Limit to 6 ticks
  };

  return (
    <div className="relative w-full bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Trend</h4>
        <div className="flex items-center gap-1">
          <TrendingUp size={10} className={isSafe ? 'text-emerald-500' : 'text-red-500'} />
          <span className="text-[9px] text-gray-400">Last {data.length} readings</span>
        </div>
      </div>
      
      <div className="w-full h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            {/* Only show zones if they're visible in the current range */}
            {low >= yMin && low <= yMax && (
              <ReferenceArea y1={yMin} y2={low} fill="#fee2e2" fillOpacity={0.4} />
            )}
            {low >= yMin && high <= yMax && (
              <ReferenceArea y1={low} y2={high} fill="#dcfce7" fillOpacity={0.6} />
            )}
            {high >= yMin && high <= yMax && (
              <ReferenceArea y1={high} y2={yMax} fill="#fee2e2" fillOpacity={0.4} />
            )}

            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 8, fontWeight: 500 }}
              tickMargin={8}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={[yMin, yMax]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 8, fontWeight: 500 }}
              ticks={generateYTicks()}
              width={45}
            />
            
            <Tooltip 
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              contentStyle={{ 
                borderRadius: '6px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '10px',
                fontWeight: 500,
                padding: '4px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.98)'
              }}
            />
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={isSafe ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={{ r: 3, fill: isSafe ? '#10b981' : '#ef4444', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Range Indicator Component ---
interface RangeIndicatorProps {
  value: number;
  ranges: number[];
  unit: string;
  statusColor?: string;
  showValueLabel?: boolean;
  minimal?: boolean;
}

const RangeIndicator: React.FC<RangeIndicatorProps> = ({ 
  value, 
  ranges, 
  unit, 
  showValueLabel = true,
  minimal = false
}) => {
  const [min, low, high, max] = ranges;

  const getPosition = (val: number) => {
    if (val <= min) return 0;
    if (val >= max) return 100;

    if (val < low) {
      const pct = (val - min) / (low - min);
      return pct * 32;
    } else if (val >= low && val <= high) {
      const pct = (val - low) / (high - low);
      return 34 + (pct * 32);
    } else {
      const pct = (val - high) / (max - high);
      return 68 + (pct * 32);
    }
  };

  const leftPos = getPosition(value);
  const isSafe = value >= low && value <= high;
  const indicatorColorClass = isSafe ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <div className={`w-full relative select-none ${minimal ? 'pt-4 pb-2' : 'pt-7 pb-5'}`}>
      <div 
        className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out z-20"
        style={{ left: `${leftPos}%` }}
      >
        {showValueLabel ? (
          <>
            <div className={`
              px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm tracking-wide
              flex items-center justify-center gap-1 mb-1 transition-colors duration-300
              ${indicatorColorClass} text-white ring-2 ring-white
            `}>
              <span>{value.toFixed(1)}</span>
            </div>
            <div className={`w-0.5 h-2 rounded-full ${indicatorColorClass} opacity-80`}></div>
          </>
        ) : (
          <>
            {/* Arrow pointing down */}
            <svg width="12" height="12" viewBox="0 0 12 12" className="mt-0.5">
              <path 
                d="M6 12 L1 7 L5 7 L5 0 L7 0 L7 7 L11 7 Z" 
                className={`${indicatorColorClass.replace('bg-', 'fill-')}`}
              />
            </svg>
          </>
        )}
      </div>

      <div className={`flex w-full items-center ${minimal ? 'h-1.5 gap-1' : 'h-2.5 gap-1.5'}`}>
         <div className="flex-1 h-full bg-red-100 rounded-l-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-400/90 group-hover:bg-red-500 transition-colors"></div>
         </div>
         
         <div className="flex-1 h-full bg-emerald-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
         </div>

         <div className="flex-1 h-full bg-red-100 rounded-r-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-400/90 group-hover:bg-red-500 transition-colors"></div>
         </div>
      </div>

      {!minimal && (
        <>
          <div className="flex justify-between w-full mt-1.5 text-[8px] font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span className="flex-1 text-left text-red-400/70">Low</span>
            <span className="flex-1 text-center text-emerald-500">Safe Zone</span>
            <span className="flex-1 text-right text-red-400/70">High</span>
          </div>
          
          <div className="flex justify-between w-full mt-0.5 text-[9px] font-bold text-gray-500 tabular-nums">
            <span>{min}</span>
            <span>{low}</span>
            <span>{high}</span>
            <span>{max}</span>
          </div>
        </>
      )}
    </div>
  );
};

// --- Elevated Card Component ---
interface ElevatedCardProps {
  title: string;
  value: number;
  unit: string;
  date: string;
  ranges: number[];
  normalRange?: string;
  chartData?: ChartPoint[];
}

export const ElevatedCard: React.FC<ElevatedCardProps> = ({
  title,
  value,
  unit,
  date,
  ranges,
  normalRange,
  chartData = []
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all hover:shadow-[0_6px_24px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-0">
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Metrics */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] uppercase tracking-wide font-bold self-start w-fit border border-red-100/50">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Elevated</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight leading-tight">{title}</h2>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900 tracking-tighter">{value.toFixed(1)}</span>
            <span className="text-sm text-gray-400 font-medium">{unit}</span>
          </div>

          <div>
            <RangeIndicator 
              value={value} 
              ranges={ranges} 
              unit={unit} 
              statusColor="red" 
              showValueLabel={false}
              minimal={false}
            />
          </div>
          
          {normalRange && (
            <div className="text-[10px] text-gray-500">
              Normal range: <span className="font-semibold">{normalRange}</span>
            </div>
          )}
    
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {chartData.length > 0 ? (
            <HealthChart data={chartData} ranges={ranges} currentValue={value} />
          ) : (
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50 flex items-center justify-center h-full min-h-[140px]">
              <p className="text-xs text-gray-400">No historical data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Optimal Card Component ---
interface OptimalCardProps {
  title: string;
  value: number;
  unit: string;
  ranges: number[];
  normalRange?: string;
}

export const OptimalCard: React.FC<OptimalCardProps> = ({
  title,
  value,
  unit,
  ranges,
  normalRange
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_16px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_6px_24px_rgb(0,0,0,0.04)] transition-all">
      <div className="p-4 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] uppercase tracking-wide font-bold border border-emerald-100 mb-4">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>Optimal</span>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>

        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-3xl font-bold text-gray-900 tracking-tighter">{value.toFixed(1)}</span>
          <span className="text-sm font-medium text-gray-400">{unit}</span>
        </div>

        <div className="w-full mb-3">
          <RangeIndicator 
            value={value} 
            ranges={ranges} 
            unit={unit} 
            statusColor="emerald" 
            showValueLabel={false}
            minimal={true}
          />
        </div>
        
        {normalRange && (
          <div className="text-[10px] text-gray-500">
            Normal: <span className="font-semibold">{normalRange}</span>
          </div>
        )}
      </div>
    </div>
  );
};
