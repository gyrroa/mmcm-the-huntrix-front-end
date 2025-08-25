'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/dashboard/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ReferenceDot,
} from 'recharts';

type Datum = { month: string; points: number };

export interface PointsHistoryCardProps {
  data: Datum[];
  title?: string;
  subtitle?: string;
  /** Chart height in px (default 320) */
  height?: number;
  className?: string;
}

const num = (n: number) => n.toLocaleString();

const PointsHistoryCard: React.FC<PointsHistoryCardProps> = ({
  data,
  title = 'Points History',
  subtitle = 'Growth over the past year',
  height = 320,
  className,
}) => {
  const { total, avg, best, bestIdx } = useMemo(() => {
    if (!data?.length) return { total: 0, avg: 0, best: 0, bestIdx: -1 };
    const t = data.reduce((s, d) => s + d.points, 0);
    const b = Math.max(...data.map((d) => d.points));
    const i = data.findIndex((d) => d.points === b);
    return { total: t, avg: t / data.length, best: b, bestIdx: i };
  }, [data]);

  return (
    <Card
      className={[
        'p-6 sm:p-8 border border-[#E8EEF8] bg-[white] rounded-2xl sm:rounded-[30px]',
        'shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)]',
        className || '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-[#5C7188] mt-1">{subtitle}</p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E8EEF8] bg-[#F5F8FF] px-2.5 py-1 text-xs">
              <span className="text-[#5C7188]">Total</span>
              <b className="text-[#002353]">{num(total)}</b>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E8EEF8] bg-[#F5F8FF] px-2.5 py-1 text-xs">
              <span className="text-[#5C7188]">Avg / mo</span>
              <b className="text-[#002353]">{num(Math.round(avg))}</b>
            </span>
            {bestIdx >= 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#FFE7C2] bg-[#FFF6E8] px-2.5 py-1 text-xs">
                <span className="text-[#7A4A00]">Best</span>
                <b className="text-[#7A4A00]">
                  {data[bestIdx].month}: {num(best)}
                </b>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="points-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#71AAF9" />
                <stop offset="100%" stopColor="#3871C1" />
              </linearGradient>
              <linearGradient id="points-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#71AAF9" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF8" />
            <XAxis
              dataKey="month"
              stroke="#5C7188"
              fontSize={12}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#5C7188"
              fontSize={12}
              width={36}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: '#CFE0FF', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #E8EEF8',
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                outline: 'none',
              }}
              wrapperStyle={{ outline: 'none' }}
              labelStyle={{ color: '#5C7188' }}
              itemStyle={{ color: '#002353' }}
              formatter={(val) => [num(val as number) + ' pts', 'Points']}
            />

            {/* soft area under the line */}
            <Area
              type="monotone"
              dataKey="points"
              stroke="none"
              fill="url(#points-area)"
              fillOpacity={1}
              isAnimationActive
              hide
            />

            <Line
              type="monotone"
              dataKey="points"
              stroke="url(#points-line)"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: '#3871C1' }}
              activeDot={{ r: 6, stroke: '#3871C1', strokeWidth: 2 }}
              isAnimationActive
            />

            {/* highlight best month */}
            {bestIdx >= 0 && (
              <ReferenceDot
                x={data[bestIdx].month}
                y={best}
                r={5}
                fill="#FFB545"
                stroke="#D6902A"
                ifOverflow="visible"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PointsHistoryCard;
