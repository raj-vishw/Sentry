import { Activity, Radio, Flag } from 'lucide-react';

const stats = [
  { icon: Activity, label: 'System status', value: 'ONLINE', color: 'text-[var(--color-success)]' },
  { icon: Radio, label: 'Network', value: 'STABLE', color: 'text-[var(--color-accent)]' },
  { icon: Flag, label: 'Challenges', value: '086', color: 'text-[var(--color-secondary-hover)]' },
];

export function SystemStatusPanel() {
  return (
    <div className="glass-panel flex h-full flex-col justify-between rounded-[var(--radius-xl)] p-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          System Telemetry
        </p>
        <div className="mt-6 flex flex-col gap-5">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between border-b border-[var(--color-glass-border)] pb-4 last:border-0">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Icon className={`size-4 ${color}`} aria-hidden="true" />
                {label}
              </div>
              <span className={`font-mono text-sm font-medium ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]">
        All access attempts are logged. Unauthorized entry into restricted
        systems is monitored under platform security policy.
      </p>
    </div>
  );
}
