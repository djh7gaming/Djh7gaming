export type Role = 'user' | 'model';

export type AppMode = 'nexus' | 'coder' | 'scholar' | 'studio' | 'human' | 'analyst' | 'coach' | 'lexicon' | 'polyglot' | 'motion';

export type Language = 'en' | 'es' | 'fr' | 'hi' | 'zh';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface Attachment {
  file?: File;
  previewUrl: string;
  base64?: string;
  mimeType: string;
  isGenerated?: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  groundingMetadata?: GroundingMetadata;
  attachment?: Attachment;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  mode: AppMode;
}