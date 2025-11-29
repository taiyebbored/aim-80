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

// Enhanced regex patterns for better coverage
const PATTERNS: Record<EntityType, RegExp[]> = {
  EMAIL_ADDRESS: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    /\b[A-Za-z0-9]+[._]?[A-Za-z0-9]+[@][A-Za-z0-9]+[.][A-Za-z]{2,6}\b/g
  ],
  IP_ADDRESS: [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    /\b(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}\b/g // IPv6
  ],
  PHONE_NUMBER: [
    /\+?\d{1,4}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\(\d{3}\)\s?\d{3}-\d{4}/g,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\+\d{1,3}\s?\d{1,14}/g // International format
  ],
  CREDIT_CARD: [
    /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    /\b\d{13,19}\b/g, // Card numbers without separators
    /\b(?:4\d{3}|5[1-5]\d{2}|6011|3[47]\d{2})[-\s]?\d{4,6}[-\s]?\d{4,5}[-\s]?\d{3,4}\b/g // Visa, MC, Discover, Amex
  ],
  DATE_TIME: [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
    /\b\d{2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b/gi,
    /\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)?\b/g, // ISO format
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi
  ],
  URL: [
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    /www\.[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    /\b[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}\b/g // Domain names
  ],
  PERSON: [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z']+)+\b/g,
    /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z']+)*\b/g, // With titles
    /\b[A-Z]\.\s?[A-Z][a-z]+\b/g // Initials + last name
  ],
  LOCATION: [
    /\b(?:New York|London|Paris|Tokyo|Beijing|Sydney|Berlin|Madrid|Rome|Mumbai|Dubai|Singapore|Toronto|Los Angeles|Chicago|San Francisco|Boston|Seattle|Miami|Dallas|Houston|Philadelphia|Phoenix|San Diego|Atlanta|Denver|Minneapolis|Portland|Austin|Nashville|Las Vegas|Washington|Cardiff|Manchester|Birmingham|Edinburgh|Glasgow|Liverpool|Leeds|Sheffield|Bristol|Leicester|Belfast|Dublin|Cork|Galway|Aberdeen|Newcastle|Brighton|Oxford|Cambridge)\b/g,
    /\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct)\b/g, // Street addresses
    /\b[A-Z][a-z]+,\s+[A-Z]{2}\b/g // City, State
  ]
};

// ML model cache
let mlModelCache: any = null;
let isMLModelLoading = false;

// Regex-based detection (fast, rule-based)
function detectEntitiesWithRegex(text: string): DetectedEntity[] {
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

  return entities;
}

// ML-based detection (accurate, context-aware)
async function detectEntitiesWithML(text: string): Promise<DetectedEntity[]> {
  try {
    // Lazy load the transformers library
    if (!mlModelCache && !isMLModelLoading) {
      isMLModelLoading = true;
      const { pipeline } = await import('@huggingface/transformers');
      
      // Use a lightweight NER model optimized for browser
      mlModelCache = await pipeline(
        'token-classification',
        'Xenova/bert-base-NER',
        { device: 'webgpu', dtype: 'fp32' }
      );
      isMLModelLoading = false;
    }

    if (!mlModelCache) {
      return []; // Model still loading
    }

    const result = await mlModelCache(text);
    const entities: DetectedEntity[] = [];

    // Map ML labels to our entity types
    const labelMap: Record<string, EntityType> = {
      'PER': 'PERSON',
      'LOC': 'LOCATION',
      'B-PER': 'PERSON',
      'I-PER': 'PERSON',
      'B-LOC': 'LOCATION',
      'I-LOC': 'LOCATION',
    };

    let currentEntity: DetectedEntity | null = null;

    for (const item of result) {
      const mappedType = labelMap[item.entity];
      if (!mappedType) continue;

      if (item.entity.startsWith('B-') || !currentEntity || currentEntity.type !== mappedType) {
        // Start new entity
        if (currentEntity) {
          entities.push(currentEntity);
        }
        currentEntity = {
          type: mappedType,
          text: item.word.replace('##', ''),
          start: item.start,
          end: item.end
        };
      } else {
        // Continue current entity
        currentEntity.text += item.word.replace('##', '');
        currentEntity.end = item.end;
      }
    }

    if (currentEntity) {
      entities.push(currentEntity);
    }

    return entities;
  } catch (error) {
    console.error('ML detection error:', error);
    return []; // Fallback to regex-only if ML fails
  }
}

// Merge and deduplicate entities from both methods
function mergeEntities(regexEntities: DetectedEntity[], mlEntities: DetectedEntity[]): DetectedEntity[] {
  const merged = [...regexEntities];
  
  for (const mlEntity of mlEntities) {
    // Check if this ML entity overlaps with any regex entity
    const hasOverlap = regexEntities.some(re => 
      (mlEntity.start >= re.start && mlEntity.start < re.end) ||
      (mlEntity.end > re.start && mlEntity.end <= re.end) ||
      (mlEntity.start <= re.start && mlEntity.end >= re.end)
    );
    
    if (!hasOverlap) {
      merged.push(mlEntity);
    }
  }
  
  // Sort by start position
  return merged.sort((a, b) => a.start - b.start);
}

// Hybrid detection (combines regex and ML)
export async function detectEntities(text: string, useML: boolean = true): Promise<DetectedEntity[]> {
  // Always run regex detection (fast)
  const regexEntities = detectEntitiesWithRegex(text);
  
  // Optionally add ML detection (more accurate but slower)
  if (useML) {
    const mlEntities = await detectEntitiesWithML(text);
    return mergeEntities(regexEntities, mlEntities);
  }
  
  return regexEntities;
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
