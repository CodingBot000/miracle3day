export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    complexity?: string;
    apiCalls?: number;
    iteration?: number;
  };
}

export interface UITexts {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  typing: string;
  greeting: string;
  suggestions: string[];
  error: string;
}
