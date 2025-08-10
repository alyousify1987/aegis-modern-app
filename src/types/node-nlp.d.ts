declare module 'node-nlp' {
  export interface NlpEntity {
    entity: string;
    sourceText: string;
    start: number;
    end: number;
  }

  export interface NlpResult {
    intent: string;
    score: number;
    entities?: NlpEntity[];
  }

  export class NlpManager {
    constructor(options?: { languages?: string[] });
    addNamedEntityText(entityName: string, entityValue: string, languages: string[], texts: string[]): void;
    train(): Promise<void>;
    process(language: string, text: string): Promise<NlpResult>;
  }
}
