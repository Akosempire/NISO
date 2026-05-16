// src/services/notification.service.ts

export class NotificationService {
  static async sendInterruptionAlert(data: {
    interruptionId: string;
    equipmentIds: string[];
    tripTime: Date;
  }) {
    // Implement notification service
    // This could integrate with email, SMS, WebSocket, etc.
    console.log('Sending interruption alert:', data);
  }

  static async sendRestorationAlert(data: {
    interruptionId: string;
    equipmentName: string;
  }) {
    // Implement restoration notification
    console.log('Sending restoration alert:', data);
  }

  static async sendMonthSealedNotification(data: {
    year: number;
    month: number;
    sealedBy: string;
  }) {
    // Implement month sealed notification
    console.log('Sending month sealed notification:', data);
  }
}
