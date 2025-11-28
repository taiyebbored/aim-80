import { RedactionMode } from '@/utils/redactionEngine';
import { Button } from '@/components/ui/button';
import { Shield, Eye } from 'lucide-react';

interface ModeSelectorProps {
  mode: RedactionMode;
  onModeChange: (mode: RedactionMode) => void;
}

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-lg border border-border">
      <span className="text-sm font-medium text-muted-foreground ml-2">
        Mode:
      </span>
      <Button
        variant={mode === 'redact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('redact')}
        className="gap-2"
      >
        <Shield className="w-4 h-4" />
        Redact
      </Button>
      <Button
        variant={mode === 'mask' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('mask')}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Mask
      </Button>
    </div>
  );
};
