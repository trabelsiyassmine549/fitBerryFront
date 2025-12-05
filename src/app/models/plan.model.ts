export interface PlanNutritionnel {
  id: number;
  clientId: number;
  titre: string;
  description: string;
  recommendations: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  createdAt: string;
}

export interface GeneratePlanRequest {
  age: number;
  sexe: string;
  poids: number;
  taille: number;
  objectifs?: string;
  allergies?: string;
  maladiesChroniques?: string;
  niveauActivite?: string;
}
