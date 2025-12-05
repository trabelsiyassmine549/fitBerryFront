import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, Article, Role } from '../models/admin.model';
import { NotificationDTO } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = '/api/admin';
  private notificationApiUrl = '/api/notifications';

  private _users = signal<User[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  users = computed(() => this._users());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // ===== USER MANAGEMENT =====

  loadAllUsers(): Observable<User[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(users => {
        this._users.set(users);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Error loading users');
        return this.handleError(error);
      })
    );
  }

  getUserById(userId: number): Observable<User> {
    this._loading.set(true);
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Error loading user');
        return this.handleError(error);
      })
    );
  }

  // Backend only supports email and role updates
  updateUser(userId: number, userDetails: { email: string; role: Role }): Observable<User> {
    this._loading.set(true);
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userDetails).pipe(
      tap(updatedUser => {
        this._users.update(users => users.map(u => u.id === userId ? updatedUser : u));
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Error updating user');
        return this.handleError(error);
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(u => u.id !== userId));
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Error deleting user');
        return this.handleError(error);
      })
    );
  }

  // User creation must use signup endpoints
  createUser(userData: any): Observable<any> {
    const endpoint = userData.role === Role.NUTRITIONNISTE
      ? '/api/auth/signup/nutritionniste'
      : '/api/auth/signup/client';

    const payload = {
      email: userData.email,
      motDePasse: userData.motDePasse,
      prenom: userData.prenom,
      nom: userData.nom
    };

    return this.http.post<any>(endpoint, payload)
      .pipe(
        tap(() => {
          // Reload users after creation
          this.loadAllUsers().subscribe();
        }),
        catchError(err => this.handleError(err))
      );
  }

  getUserByIdLocal(id: number): User | undefined {
    return this._users().find(u => u.id === id);
  }

  // ===== ARTICLE MANAGEMENT =====

  // Admin endpoints for articles
  adminGetAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>('/api/articles/admin/all')
      .pipe(catchError(err => this.handleError(err)));
  }

  adminUpdateArticle(articleId: number, data: { titre: string; description: string; imageURL?: string | null }): Observable<Article> {
    return this.http.put<Article>(`/api/articles/admin/${articleId}`, {
      titre: data.titre,
      description: data.description,
      imageURL: data.imageURL || null
    }).pipe(catchError(err => this.handleError(err)));
  }

  adminDeleteArticle(articleId: number): Observable<void> {
    return this.http.delete<void>(`/api/articles/admin/${articleId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Create article requires nutritionniste ID
  createArticle(payload: { titre: string; description: string; imageURL?: string | null }, nutritionnisteId: number): Observable<Article> {
    return this.http.post<Article>(`/api/articles/nutritionniste/${nutritionnisteId}`, payload)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Update article (for both admin and nutritionniste)
  updateArticle(articleId: number, payload: { titre: string; description: string; imageURL?: string | null }): Observable<Article> {
    return this.http.put<Article>(`/api/articles/admin/${articleId}`, payload)
      .pipe(catchError(err => this.handleError(err)));
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`/api/articles/upload-image`, formData)
      .pipe(catchError(err => this.handleError(err)));
  }

  // ===== COMMENT MANAGEMENT =====

  adminGetAllCommentaires(): Observable<any[]> {
    return this.http.get<any[]>('/api/articles/admin/commentaires')
      .pipe(catchError(err => this.handleError(err)));
  }

  adminDeleteCommentaire(commentaireId: number): Observable<void> {
    return this.http.delete<void>(`/api/articles/admin/commentaires/${commentaireId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getCommentairesByArticle(articleId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/articles/admin/${articleId}/commentaires`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // ===== NOTIFICATIONS =====

  getAllNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.notificationApiUrl}/me`)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.notificationApiUrl}/${notificationId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteAllNotificationsByUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.notificationApiUrl}/user/${userId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  clearError(): void {
    this._error.set(null);
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.error?.message || `Error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
