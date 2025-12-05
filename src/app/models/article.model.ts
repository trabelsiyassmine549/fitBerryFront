export interface Article {
  id?: number;
  titre: string;
  description: string;
  imageURL?: string;
  auteurId?: number;
  auteurNom?: string;
  auteurPrenom?: string;
}
