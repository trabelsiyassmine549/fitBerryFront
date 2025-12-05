import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Article } from '../models/article.model';
import { Commentaire } from '../models/commentaire.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private baseUrl = '/api/articles';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.baseUrl);
  }

  getAllByNutritionniste(nutritionnisteId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/nutritionniste/${nutritionnisteId}`);
  }

  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  create(article: Article, nutritionnisteId: number): Observable<Article> {
    return this.http.post<Article>(`${this.baseUrl}/nutritionniste/${nutritionnisteId}`, article).pipe(
      tap((createdArticle) => {
        console.log('Article created successfully:', createdArticle);
        this.notificationService.getMyNotifications().subscribe();
      })
    );
  }

  update(id: number, article: Article, nutritionnisteId: number): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/${id}/nutritionniste/${nutritionnisteId}`, article);
  }

  delete(id: number, nutritionnisteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/nutritionniste/${nutritionnisteId}`);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.baseUrl}/upload-image`, formData);
  }

  createWithFile(article: Article, file: File | null, nutritionnisteId: number): Observable<Article> {
    const formData = new FormData();
    formData.append('titre', article.titre);
    formData.append('description', article.description);

    if (file) {
      formData.append('image', file);
    } else if (article.imageURL) {
      formData.append('imageURL', article.imageURL);
    }

    return this.http.post<Article>(`${this.baseUrl}/nutritionniste/${nutritionnisteId}`, formData).pipe(
      tap((createdArticle) => {
        console.log('Article created with file successfully:', createdArticle);
        this.notificationService.getMyNotifications().subscribe();
      })
    );
  }

  updateWithFile(id: number, article: Article, file: File | null, nutritionnisteId: number): Observable<Article> {
    const formData = new FormData();
    formData.append('titre', article.titre);
    formData.append('description', article.description);

    if (file) {
      formData.append('image', file);
    } else if (article.imageURL) {
      formData.append('imageURL', article.imageURL);
    }

    return this.http.put<Article>(`${this.baseUrl}/${id}/nutritionniste/${nutritionnisteId}`, formData);
  }

  getAllForClient(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/client/all`);
  }

  getByIdForClient(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  getByNutritionnisteForClient(nutritionnisteId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/client/nutritionniste/${nutritionnisteId}`);
  }

  getCommentaires(articleId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.baseUrl}/${articleId}/commentaires`);
  }

  addCommentaire(articleId: number, commentaire: any): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.baseUrl}/${articleId}/commentaires`, commentaire).pipe(
      tap((addedComment) => {
        console.log('Comment added successfully:', addedComment);
        this.notificationService.getMyNotifications().subscribe({
          next: () => {
            console.log('Notifications refreshed after comment');
          },
          error: (error) => {
            console.error('Error refreshing notifications:', error);
          }
        });
      })
    );
  }

  deleteCommentaire(commentaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/commentaires/${commentaireId}`);
  }
}
