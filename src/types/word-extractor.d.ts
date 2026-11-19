declare module 'word-extractor' {
  export interface ExtractedDocument {
    getBody(options?: { includeHeadersAndFooters?: boolean }): string;
    getHeaders(options?: { includeFooters?: boolean }): string;
    getFooters(): string;
    getFootnotes(): string;
    getEndnotes(): string;
  }

  export default class WordExtractor {
    extract(filePathOrBuffer: string | Buffer): Promise<ExtractedDocument>;
  }
}
