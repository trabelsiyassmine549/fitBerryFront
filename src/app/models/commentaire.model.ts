export interface Commentaire {
  id?: number;
  titre: string;
  description: string;
  userId: number;
  articleId: number;
  createdAt?: string;
}
