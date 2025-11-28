import { useState, useEffect } from 'react';
import { Shield, Download, AlertCircle } from 'lucide-react';
import { RedactionPanel } from '@/components/RedactionPanel';
import { EntityTable } from '@/components/EntityTable';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ModeSelector } from '@/components/ModeSelector';
import { Button } from '@/components/ui/button';
import { 
  detectEntities, 
  redactText, 
  calculateMetrics,
  type RedactionMode 
} from '@/utils/redactionEngine';
import { toast } from 'sonner';

const SAMPLE_TEXT = `At exactly 06:12 on 03/01/2024, Martin O'Neil checked into a hotel in Cardiff after booking a room through https://www.staybookingdemo.com. The reservation confirmation was sent to martin.oneil@travel-mock.net. The system recorded his access from IP 81.22.144.19. Hotel staff later called +44 7811 220099 to confirm a payment using card number 4485-9901-6622-3300.`;

const Index = () => {
  const [originalText, setOriginalText] = useState(SAMPLE_TEXT);
  const [redactionMode, setRedactionMode] = useState<RedactionMode>('redact');
  const [entities, setEntities] = useState<ReturnType<typeof detectEntities>>([]);
  const [redactedText, setRedactedText] = useState('');
  const [metrics, setMetrics] = useState({ totalDetected: 0, uniqueTypes: 0, coverage: 0 });

  useEffect(() => {
    if (originalText.trim()) {
      const detected = detectEntities(originalText);
      setEntities(detected);
      
      const redacted = redactText(originalText, detected, redactionMode);
      setRedactedText(redacted);
      
      const calculatedMetrics = calculateMetrics(detected);
      setMetrics(calculatedMetrics);
    } else {
      setEntities([]);
      setRedactedText('');
      setMetrics({ totalDetected: 0, uniqueTypes: 0, coverage: 0 });
    }
  }, [originalText, redactionMode]);

  const handleExport = () => {
    const exportData = {
      originalText,
      redactedText,
      entities,
      metrics,
      mode: redactionMode,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redaction-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  SecureRedact
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Sensitive Data Protection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeSelector mode={redactionMode} onModeChange={setRedactionMode} />
              <Button 
                onClick={handleExport}
                variant="outline"
                className="gap-2"
                disabled={entities.length === 0}
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Cybersecurity Redaction Challenge
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This system detects and redacts 8 types of sensitive entities: PERSON, LOCATION, 
                EMAIL_ADDRESS, IP_ADDRESS, PHONE_NUMBER, CREDIT_CARD, DATE_TIME, and URL.
              </p>
            </div>
          </div>

          {/* Metrics */}
          <MetricsPanel {...metrics} />

          {/* Redaction Panels */}
          <RedactionPanel
            originalText={originalText}
            redactedText={redactedText}
            onTextChange={setOriginalText}
          />

          {/* Entity Table */}
          <EntityTable entities={entities} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Built for Cybersecurity Hackathon 2024 • Privacy-First Design</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
