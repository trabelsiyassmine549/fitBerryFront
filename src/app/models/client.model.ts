export interface ClientProfile {
  id?: number;
  email?: string;
  age: number | null;
  sexe: string;
  poids: number | null;
  taille: number | null;
  objectifs?: string;
  allergies?: string;
  maladiesChroniques?: string;
  niveauActivite?: string;
  imc?: number;
  categorieImc?: string;
  profilComplet?: boolean;
}

export interface UpdateClientProfileRequest {
  age: number;
  sexe: string;
  poids: number;
  taille: number;
  objectifs?: string;
  allergies?: string;
  maladiesChroniques?: string;
  niveauActivite?: string;
}




