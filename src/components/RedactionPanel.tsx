import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, FileText } from 'lucide-react';

interface RedactionPanelProps {
  originalText: string;
  redactedText: string;
  onTextChange: (text: string) => void;
}

export const RedactionPanel = ({ 
  originalText, 
  redactedText, 
  onTextChange 
}: RedactionPanelProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original Text */}
      <Card className="p-6 bg-card border-border security-glow">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <Label className="text-lg font-semibold text-foreground">
            Original Text
          </Label>
        </div>
        <Textarea
          value={originalText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste or type sensitive text here for analysis..."
          className="min-h-[400px] font-mono text-sm bg-code-bg border-border focus:border-primary focus:ring-primary resize-none"
        />
      </Card>

      {/* Redacted Output */}
      <Card className="p-6 bg-card border-border security-glow">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-success" />
          <Label className="text-lg font-semibold text-foreground">
            Redacted Output
          </Label>
        </div>
        <div className="min-h-[400px] p-4 bg-code-bg border border-border rounded-md font-mono text-sm text-foreground whitespace-pre-wrap break-words">
          {redactedText || (
            <span className="text-muted-foreground">
              Redacted text will appear here...
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
