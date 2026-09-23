export type UserRole = 'customer' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type TicketCategory = 'Billing' | 'Technical' | 'General';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_ai_suggested: boolean;
  created_at: string;
  sender?: User;
}

export interface Ticket {
  id: string;
  customer_id: string;
  agent_id?: string | null;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  customer?: User;
  agent?: User | null;
}

export interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: TicketCategory;
  similarity_score?: number;
}

export interface RAGSuggestion {
  suggested_reply: string;
  sources: KBArticle[];
  model_used: string;
  generated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

