import api from './client';
import {
  Ticket,
  TicketDetail,
  TicketMessage,
  RAGSuggestion,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../types';

export interface CreateTicketParams {
  title: string;
  description: string;
}

export interface UpdateTicketParams {
  status?: TicketStatus;
  agent_id?: string | null;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export const getTicketsApi = async (params?: {
  status?: string;
  category?: string;
}): Promise<Ticket[]> => {
  const response = await api.get<Ticket[]>('/tickets', { params });
  return response.data;
};

export const getTicketDetailApi = async (id: string): Promise<TicketDetail> => {
  const response = await api.get<TicketDetail>(`/tickets/${id}`);
  return response.data;
};

export const createTicketApi = async (data: CreateTicketParams): Promise<TicketDetail> => {
  const response = await api.post<TicketDetail>('/tickets', data);
  return response.data;
};

export const updateTicketApi = async (
  id: string,
  data: UpdateTicketParams
): Promise<TicketDetail> => {
  const response = await api.patch<TicketDetail>(`/tickets/${id}`, data);
  return response.data;
};

export const postMessageApi = async (
  ticketId: string,
  message: string,
  is_ai_suggested: boolean = false
): Promise<TicketMessage> => {
  const response = await api.post<TicketMessage>(`/tickets/${ticketId}/messages`, {
    message,
    is_ai_suggested,
  });
  return response.data;
};

export const getAiSuggestionApi = async (ticketId: string): Promise<RAGSuggestion> => {
  const response = await api.get<RAGSuggestion>(`/tickets/${ticketId}/suggest-reply`);
  return response.data;
};

