import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanNutritionnel } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private baseUrl = '/api/plans';

  constructor(private http: HttpClient) {}

  generatePlan(): Observable<PlanNutritionnel> {
    return this.http.post<PlanNutritionnel>(`${this.baseUrl}/generate`, {});
  }

  getMyPlans(): Observable<PlanNutritionnel[]> {
    return this.http.get<PlanNutritionnel[]>(`${this.baseUrl}/my-plans`);
  }

  getPlanById(planId: number): Observable<PlanNutritionnel> {
    return this.http.get<PlanNutritionnel>(`${this.baseUrl}/${planId}`);
  }

  downloadPlanPDF(planId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${planId}/download`, {
      responseType: 'blob'
    });
  }

  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${planId}`);
  }

  getAllPlansForAdmin(): Observable<PlanNutritionnel[]> {
    return this.http.get<PlanNutritionnel[]>(`${this.baseUrl}/admin/all`);
  }

  adminDeletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/${planId}`);
  }
}
