import api from './client';
import { KBArticle } from '../types';

export const getKbArticlesApi = async (category?: string): Promise<KBArticle[]> => {
  const response = await api.get<KBArticle[]>('/kb/articles', {
    params: category ? { category } : undefined,
  });
  return response.data;
};

export const createKbArticleApi = async (data: {
  title: string;
  category: string;
  content: string;
}): Promise<KBArticle> => {
  const response = await api.post<KBArticle>('/kb/articles', data);
  return response.data;
};

export const deleteKbArticleApi = async (articleId: string): Promise<void> => {
  await api.delete(`/kb/articles/${articleId}`);
};

export const syncKbVectorsApi = async (): Promise<{
  status: string;
  synced: number;
  total: number;
  message: string;
}> => {
  const response = await api.post('/kb/sync');
  return response.data;
};
