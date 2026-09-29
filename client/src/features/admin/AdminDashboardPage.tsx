import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Flag, ListChecks, Shield, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';
import { formatRelativeTime } from '@/lib/utils';

const chartTooltipStyle = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

export function AdminDashboardPage() {
  const metricsQuery = useQuery({ queryKey: ['admin-metrics'], queryFn: adminService.getMetrics });
  const trendQuery = useQuery({ queryKey: ['admin-trend'], queryFn: adminService.getSubmissionTrend });
  const distributionQuery = useQuery({
    queryKey: ['admin-distribution'],
    queryFn: adminService.getCategoryDistribution,
  });
  const recentQuery = useQuery({
    queryKey: ['admin-recent-submissions'],
    queryFn: adminService.getRecentSubmissions,
  });

  const isLoading =
    metricsQuery.isLoading || trendQuery.isLoading || distributionQuery.isLoading || recentQuery.isLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading operations center..." />
      </PageContainer>
    );
  }

  const metrics = metricsQuery.data!;

  return (
    <PageContainer className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-secondary-hover)]">
          Operations Center
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={metrics.users.toLocaleString()} accent="secondary" />
        <StatCard icon={Flag} label="Challenges" value={String(metrics.challenges)} accent="secondary" />
        <StatCard icon={ListChecks} label="Submissions" value={metrics.submissions.toLocaleString()} accent="secondary" />
        <StatCard icon={Shield} label="Teams" value={String(metrics.teams)} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submissions — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendQuery.data}>
                <defs>
                  <linearGradient id="submissionsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="var(--color-secondary)"
                  fill="url(#submissionsFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challenges by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionQuery.data}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--color-surface-hover)' }} />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {recentQuery.data?.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="text-sm">
                  <span className="font-medium text-[var(--color-text-primary)]">{sub.username}</span>
                  <span className="text-[var(--color-text-muted)]"> → {sub.challengeTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={sub.correct ? 'success' : 'error'}>{sub.correct ? 'Correct' : 'Wrong'}</Badge>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {formatRelativeTime(sub.submittedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
