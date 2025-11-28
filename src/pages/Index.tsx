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

const SAMPLE_TEXT = `At exactly 06:12 on 03/01/2024, Martin O'Neil checked into a hotel in Cardiff after booking a room through https://www.staybooking-demo.com. The reservation confirmation was sent to martin.oneil@travel-mock.net. The system recorded his access from IP 81.22.144.19. Hotel staff later called +44 7811 220099 to confirm a payment using card number 4485-9901-6622-3300.
A system alert triggered at 14:44 on 09/01/2024 when Nadia Rahman attempted to sign in from Croydon using http://secure-login.internal-test. Her login email was nadia.rahman@securemock.org and her IP address appeared as 203.45.18.77. A verification call was made to (646) 555-2207 before unlocking the account tied to credit card 4929-1100-3344-7788.
Customer interview log:
 Name: Samuel Brooks
 Location: Bath
 Date: 12/01/2024, 10:05
 Profile URL: https://profiles.demoapp.io/sbrooks
 Registered Email: samuel.brooks@demoapp.net
 Phone: +1-202-555-9033
 Access IP: 172.20.14.9
 Billing Card: 5105-8822-1199-3399
On the evening of 19/01/2024, during a live webinar hosted from Exeter, Jessica Moore joined the stream via https://stream.education-test.org at 20:18. Her signup email jessica.moore@edu-demo.com was validated from IP 94.177.62.118. Conference organizers contacted her later at +44 7900 661144 regarding a failed payment on credit card 4556-1022-3321-7789.
Courier delivery record shows Ravi Patel collected a secure package in Watford on 23/01/2024 at 08:40. His confirmation URL was http://delivery.auth-mock.net/ravi. The tracking confirmation was sent to ravi.patel@couriers-demo.com. A driver contacted (408) 555-7744 upon arrival. The service fee was billed to 6011-4422-7700-1100.
On 28/01/2024, while accessing https://api.finance-sandbox.org, Helen Carter from Epsom submitted financial reports from IP 104.221.90.17 at 17:55. The automated system emailed helen.carter@fin-demo.org and triggered an SMS alert to +44 7300 998877. Her corporate card 3412-993344-77001 was used for monthly processing.
Emergency access log – 02/02/2024 at 04:05:
 User: Tomás Pereira
 City: Hounslow
 Authentication URL: http://auth.emergency-test.net
 IP Source: 192.168.33.92
 Contact Email: tomas.pereira@testauth.org
 Phone Verified: (917) 555-0982
 Temporary Billing Card: 3530-4488-1199-7755
On the afternoon of 07/02/2024 at 15:47, Alina Kovács checked analytics data from Newport using https://analytics.internal-demo.com. The system registered her email alina.kovacs@data-test.org and the IP address 199.68.144.6. Support later called +44 7122 330011 after detecting a charge on credit card 4009-7788-2011-6633.
The maintenance ticket submitted by Marcus Liu from Salford entered the queue on 10/02/2024, 22:09. His form was submitted via http://tickets.sys-monitor-test.net and linked to marcus.liu@monitor-demo.com. IP logs showed 66.44.18.203. The finance department confirmed the support plan on card 5555-0022-4499-7788 and followed up at (312) 555-1190.
A customer satisfaction survey was completed in Stockport by Rachel Thompson on 14/02/2024 at 09:30 using https://survey.feedback-test.org. Confirmation went to rachel.thompson@feedback-demo.net. Her access IP was logged as 145.90.212.41 and a reminder call was placed to +44 7888 991122. The incentive reward used credit card 4222-9900-4411-3322.
Audit trail:
 On 18/02/2024 at 13:55, Ismail Hassan accessed http://partners.portal-mock.org from Burnley.
 Email used: ismail.hassan@partner-demo.org
 Phone recorded: (646) 555-4098
 IP address: 72.14.114.55
 Payment reference card: 5244-8811-0066-3399
Late-night access was flagged on 22/02/2024 at 23:58 for Sophie Laurent in Chesterfield. She visited https://nightshift.admin-test.net from IP 88.112.76.91. Her registered email sophie.laurent@night-demo.org and mobile +44 7055 661188 were verified before authorizing credit card 4916-2200-5511-8899.
On Sunday morning, 25/02/2024 at 07:12, Omar Farouk from Dagenham connected to http://community.volunteer-test.org. Confirmation was sent to omar.farouk@volunteer-demo.com. A helpdesk agent called +1-212-555-6029. Donations were routed to credit card 6011-0088-2277-4411. IP logs showed 193.99.4.121.
Digital classroom attendance log:
 Student: Linda Morales
 City: Brentwood
 Login Time: 01/03/2024, 11:00
 Classroom URL: https://learn.virtualclass-demo.com
 Email: linda.morales@vc-demo.org
 IP: 52.144.209.18
 Emergency Phone: (408) 555-3377
 Tuition Card: 4532-6655-2188-9900
At 16:22 on 06/03/2024, Noah Richardson placed an order from Gravesend using https://orders.shop-test.net. The receipt was sent to noah.richardson@shop-demo.com. A verification text went to +44 7700 445566. His IP appeared as 91.198.164.7 and the order was settled through credit card 5100-3311-4422-7788.
Security incident summary – 10/03/2024, 02:33:
 Subject: Fatima Zayed
 Location: Harrow
 Accessed URL: http://security.audit-mock.net
 IP: 109.155.21.90
 Contact Email: fatima.zayed@audit-demo.org
 Callback Number: (315) 555-8893
 Suspicious Card: 3782-110022-33119
On 14/03/2024 at 19:10, the events portal https://events.booking-demo.io was accessed by Gareth Price from Redhill. His confirmation was mailed to gareth.price@events-demo.net. Calls were routed to +44 7999 554411. Server logs recorded IP address 34.201.100.88 and the booking utilized card 4000-9988-1111-6633.
By mid-April, 19/04/2024 at 12:45, Yuki Tanaka completed identity verification in Barnet via http://verify.identity-mock.net. The confirmation email yuki.tanaka@verify-demo.org and IP 192.88.33.71 were recorded. A follow-up call to (917) 555-7721 confirmed a small charge to credit card 4557-0011-9933-4488.
At 21:04 on 23/04/2024, Abdul Rahim from Walthamstow submitted a dispute form using https://disputes.fin-test.org. Alert copies went to abdul.rahim@fin-demo.com. The originating IP was 77.91.202.61 and case updates were delivered to +44 7333 901122. The refundable charge was tied to 5425-4410-2088-7700.`;

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
