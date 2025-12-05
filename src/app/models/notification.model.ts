export interface Notification {
  id: number;
  description: string;
  userId: number;
}

export interface CreateNotificationRequest {
  userId: number;
  description: string;
}

export interface NotificationDTO {
  id: number;
  description: string;
  userId: number;
}
