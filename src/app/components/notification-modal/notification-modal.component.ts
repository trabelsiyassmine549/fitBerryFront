import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.css']
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: NotificationDTO[] = [];
  unreadCount = 0;
  isLoading = false;
  private subscription?: Subscription;

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notifications = this.notificationService.notifications();
    this.unreadCount = this.notificationService.unreadCount();
    this.isLoading = this.notificationService.loading();

    this.subscription = this.notificationService.startPolling().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.length;
      },
      error: (error) => {
        console.error('Error polling notifications:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleModal(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.refreshNotifications();
    }
  }

  closeModal(): void {
    this.isOpen = false;
  }

  refreshNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.length;
      },
      error: (error) => {
        console.error('Error refreshing notifications:', error);
      }
    });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();

    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notificationService.notifications();
        this.unreadCount = this.notificationService.unreadCount();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  clearAllNotifications(): void {
    if (this.notifications.length === 0) return;

    if (confirm('Are you sure you want to delete all notifications?')) {
      this.notificationService.clearAllNotifications();
      this.notifications = [];
      this.unreadCount = 0;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notification-container');

    if (!clickedInside && this.isOpen) {
      this.closeModal();
    }
  }

  getNotificationIcon(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('bienvenue') || lowerDesc.includes('welcome')) {
      return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    } else if (lowerDesc.includes('connexion') || lowerDesc.includes('login')) {
      return 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1';
    } else if (lowerDesc.includes('article')) {
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    } else if (lowerDesc.includes('commentaire') || lowerDesc.includes('comment')) {
      return 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z';
    } else if (lowerDesc.includes('profil') || lowerDesc.includes('profile')) {
      return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    } else if (lowerDesc.includes('inscrit') || lowerDesc.includes('registered')) {
      return 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z';
    }

    return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  formatNotificationTime(notification: NotificationDTO): string {
    return 'Just now';
  }

  trackByNotificationId(index: number, notification: NotificationDTO): number {
    return notification.id;
  }
}
