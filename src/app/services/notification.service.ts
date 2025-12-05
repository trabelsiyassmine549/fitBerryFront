import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, interval } from 'rxjs';
import { tap, catchError, switchMap, startWith } from 'rxjs/operators';
import { Notification, CreateNotificationRequest, NotificationDTO } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';
  private pollingInterval = 30000;

  private _notifications = signal<NotificationDTO[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _unreadCount = signal<number>(0);

  notifications = computed(() => this._notifications());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  unreadCount = computed(() => this._unreadCount());
  hasNotifications = computed(() => this._notifications().length > 0);

  constructor(private http: HttpClient) {}

  createNotification(request: CreateNotificationRequest): Observable<NotificationDTO> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<NotificationDTO>(this.apiUrl, request).pipe(
      tap(notification => {
        this._notifications.update(notifications => [notification, ...notifications]);
        this._unreadCount.update(count => count + 1);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to create notification');
        return this.handleError(error);
      })
    );
  }

  getNotificationsByUser(userId: number): Observable<NotificationDTO[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(notifications => {
        this._notifications.set(notifications);
        this._unreadCount.set(notifications.length);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to load notifications');
        return this.handleError(error);
      })
    );
  }

  getMyNotifications(): Observable<NotificationDTO[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/me`).pipe(
      tap(notifications => {
        this._notifications.set(notifications);
        this._unreadCount.set(notifications.length);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to load notifications');
        return this.handleError(error);
      })
    );
  }

  getNotificationById(notificationId: number): Observable<NotificationDTO> {
    return this.http.get<NotificationDTO>(`${this.apiUrl}/${notificationId}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        this._notifications.update(notifications =>
          notifications.filter(n => n.id !== notificationId)
        );
        this._unreadCount.update(count => Math.max(0, count - 1));
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to delete notification');
        return this.handleError(error);
      })
    );
  }

  deleteAllNotificationsByUser(userId: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(() => {
        this._notifications.set([]);
        this._unreadCount.set(0);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to delete all notifications');
        return this.handleError(error);
      })
    );
  }

  deleteMyNotifications(): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/me`).pipe(
      tap(() => {
        this._notifications.set([]);
        this._unreadCount.set(0);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set('Failed to delete notifications');
        return this.handleError(error);
      })
    );
  }

  startPolling(): Observable<NotificationDTO[]> {
    return interval(this.pollingInterval).pipe(
      startWith(0),
      switchMap(() => this.getMyNotifications())
    );
  }

  stopPolling(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  clearError(): void {
    this._error.set(null);
  }

  markAsRead(notificationId: number): void {
    this.deleteNotification(notificationId).subscribe({
      next: () => console.log('Notification marked as read'),
      error: (error) => console.error('Error marking notification as read:', error)
    });
  }

  clearAllNotifications(): void {
    this.deleteMyNotifications().subscribe({
      next: () => console.log('All notifications cleared'),
      error: (error) => console.error('Error clearing notifications:', error)
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Notification service error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error: ${error.status} - ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
