export type EntityType = 
  | 'PERSON'
  | 'LOCATION'
  | 'EMAIL_ADDRESS'
  | 'IP_ADDRESS'
  | 'PHONE_NUMBER'
  | 'CREDIT_CARD'
  | 'DATE_TIME'
  | 'URL';

export interface DetectedEntity {
  type: EntityType;
  text: string;
  start: number;
  end: number;
}

export type RedactionMode = 'redact' | 'mask';

const PATTERNS: Record<EntityType, RegExp[]> = {
  EMAIL_ADDRESS: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  ],
  IP_ADDRESS: [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  ],
  PHONE_NUMBER: [
    /\+?\d{1,4}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\(\d{3}\)\s?\d{3}-\d{4}/g
  ],
  CREDIT_CARD: [
    /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
  ],
  DATE_TIME: [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{2}:\d{2}(?::\d{2})?\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g
  ],
  URL: [
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    /www\.[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g
  ],
  PERSON: [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z']+)+\b/g
  ],
  LOCATION: [
    /\b(?:New York|London|Paris|Tokyo|Beijing|Sydney|Berlin|Madrid|Rome|Mumbai|Dubai|Singapore|Toronto|Los Angeles|Chicago|San Francisco|Boston|Seattle|Miami|Dallas|Houston|Philadelphia|Phoenix|San Diego|Atlanta|Denver|Minneapolis|Portland|Austin|Nashville|Las Vegas|Washington|Cardiff|Manchester|Birmingham|Edinburgh|Glasgow|Liverpool|Leeds|Sheffield|Bristol|Leicester|Belfast|Dublin|Cork|Galway|Aberdeen|Newcastle|Brighton|Oxford|Cambridge)\b/g
  ]
};

export function detectEntities(text: string): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  
  for (const [entityType, patterns] of Object.entries(PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type: entityType as EntityType,
            text: match[0],
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    }
  }

  // Sort by start position
  return entities.sort((a, b) => a.start - b.start);
}

export function redactText(
  text: string,
  entities: DetectedEntity[],
  mode: RedactionMode = 'redact'
): string {
  if (entities.length === 0) return text;

  // Sort entities in reverse order to maintain correct indices
  const sortedEntities = [...entities].sort((a, b) => b.start - a.start);
  
  let result = text;
  for (const entity of sortedEntities) {
    const before = result.substring(0, entity.start);
    const after = result.substring(entity.end);
    const replacement = mode === 'mask' ? `[${entity.type}]` : '';
    result = before + replacement + after;
  }

  return result;
}

export function calculateMetrics(
  detected: DetectedEntity[],
  expected: DetectedEntity[] = []
): {
  totalDetected: number;
  uniqueTypes: number;
  coverage: number;
} {
  const uniqueTypes = new Set(detected.map(e => e.type)).size;
  const coverage = expected.length > 0 
    ? (detected.length / expected.length) * 100 
    : 0;

  return {
    totalDetected: detected.length,
    uniqueTypes,
    coverage: Math.min(coverage, 100)
  };
}
