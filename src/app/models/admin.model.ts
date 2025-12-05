// src/app/models/admin.model.ts

export enum Role {
  CLIENT = 'CLIENT',
  NUTRITIONNISTE = 'NUTRITIONNISTE',
  ADMIN = 'ADMIN'
}

// Base User matching backend User entity
export interface User {
  id?: number;
  email: string;
  motDePasse?: string;
  role: Role;
}

// Client interface
export interface Client extends User {
  prenom?: string;
  nom?: string;
  age?: number;
  sexe?: string;
  poids?: number;
  taille?: number;
  objectifs?: string;
  allergies?: string;
  maladiesChroniques?: string;
  niveauActivite?: string;
  actif?: boolean;
}

// Nutritionniste with optional extra fields
export interface Nutritionniste extends User {
  prenom?: string;
  nom?: string;
  specialite?: string;
  telephone?: string;
  nombreArticles?: number;
  actif?: boolean;
}

// For display purposes in admin dashboard
export type UserDisplay = Client | Nutritionniste;

// Article entity
export interface Article {
  id?: number;
  titre: string;
  description: string;
  imageURL?: string;
  auteurId?: number;
  auteurEmail?: string;
  auteurPrenom?: string;
  auteurNom?: string;
  dateCreation?: Date;
}

// Commentaire entity - FIXED to match backend
export interface Commentaire {
  id?: number;
  titre: string;
  description: string;
  userId: number;
  articleId?: number;
  utilisateurNom?: string;
  createdAt?: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalNutritionistes: number;
  totalArticles: number;
  totalClients: number;
  totalCommentaires: number;
  newUsersThisMonth: number;
  articlesThisMonth: number;
}

// Optional: for stat cards
export interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle: string;
}
