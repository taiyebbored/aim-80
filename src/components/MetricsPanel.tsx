import { Card } from '@/components/ui/card';
import { BarChart3, Target, CheckCircle2 } from 'lucide-react';

interface MetricsPanelProps {
  totalDetected: number;
  uniqueTypes: number;
  coverage: number;
}

export const MetricsPanel = ({ 
  totalDetected, 
  uniqueTypes, 
  coverage 
}: MetricsPanelProps) => {
  const metrics = [
    {
      label: 'Total Entities',
      value: totalDetected,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      label: 'Unique Types',
      value: uniqueTypes,
      icon: Target,
      color: 'text-success',
    },
    {
      label: 'Detection Rate',
      value: `${totalDetected > 0 ? '100' : '0'}%`,
      icon: CheckCircle2,
      color: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index}
            className="p-6 bg-card border-border security-glow hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <Icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
