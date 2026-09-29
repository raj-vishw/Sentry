import { useQuery } from '@tanstack/react-query';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';

const PIE_COLORS = [
  'var(--color-accent)',
  'var(--color-secondary)',
  '#34d399',
  '#fbbf24',
  '#fb923c',
  '#f87171',
  '#60a5fa',
  '#c084fc',
];

const chartTooltipStyle = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

export function AdminStatisticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-distribution'],
    queryFn: adminService.getCategoryDistribution,
  });

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Statistics
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Platform-wide breakdowns. Live metrics arrive with Phase 2.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="category" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {data?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
