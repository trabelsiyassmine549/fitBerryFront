import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ClientProfile, UpdateClientProfileRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  getClientProfile(clientId: number): Observable<ClientProfile> {
  // Use the /me/profile endpoint that automatically uses the authenticated user
  const url = `${this.baseUrl}/me/profile`;
  console.log('Getting current client profile from:', url);
  return this.http.get<ClientProfile>(url);
}

updateClientProfile(clientId: number, request: UpdateClientProfileRequest): Observable<ClientProfile> {
  // Use the /me/profile endpoint that automatically uses the authenticated user
  const url = `${this.baseUrl}/me/profile`;
  console.log('Updating current client profile at:', url, 'with data:', request);
  return this.http.put<ClientProfile>(url, request);
}
  // Use API Gateway route instead of direct backend URL
  private baseUrl = '/api/clients';

  constructor(private http: HttpClient) {
    console.log('ClientService initialized with baseUrl:', this.baseUrl);
  }

  // auth.service.ts - Update the login method
  login(credentials: any): Observable<any> {
    return this.http.post('/api/users/login', credentials).pipe(
      tap((response: any) => {
        if (response.accessToken && response.refreshToken) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          // Store user ID from the response
          if (response.user && response.user.id) {
            localStorage.setItem('user_id', response.user.id.toString());
          }

        }
      })
    );
  }

  // Add method to get current user ID
  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }
  
}
