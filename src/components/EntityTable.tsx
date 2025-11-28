import { DetectedEntity } from '@/utils/redactionEngine';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

interface EntityTableProps {
  entities: DetectedEntity[];
}

const ENTITY_COLORS: Record<string, string> = {
  PERSON: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  LOCATION: 'bg-green-500/20 text-green-400 border-green-500/50',
  EMAIL_ADDRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  IP_ADDRESS: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  PHONE_NUMBER: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  CREDIT_CARD: 'bg-red-500/20 text-red-400 border-red-500/50',
  DATE_TIME: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  URL: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
};

export const EntityTable = ({ entities }: EntityTableProps) => {
  return (
    <Card className="p-6 bg-card border-border security-glow">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Detected Entities
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {entities.length} found
        </Badge>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-foreground font-semibold">Entity Type</TableHead>
              <TableHead className="text-foreground font-semibold">Extracted Text</TableHead>
              <TableHead className="text-foreground font-semibold text-right">Start</TableHead>
              <TableHead className="text-foreground font-semibold text-right">End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No entities detected yet. Enter some text to begin analysis.
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity, index) => (
                <TableRow key={index} className="hover:bg-secondary/30">
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={ENTITY_COLORS[entity.type] || 'bg-gray-500/20 text-gray-400'}
                    >
                      {entity.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{entity.text}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{entity.start}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{entity.end}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
