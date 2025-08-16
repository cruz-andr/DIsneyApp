import * as Notifications from 'expo-notifications';
import { WaitTimeAlert, WaitTime } from '../types';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private alerts: Map<string, WaitTimeAlert> = new Map();

  async initialize(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async createWaitTimeAlert(attractionName: string, targetWaitTime: number, attractionId: string): Promise<string | null> {
    try {
      const alertId = `${attractionId}-${targetWaitTime}`;
      
      const alert: WaitTimeAlert = {
        id: alertId,
        attractionId,
        targetWaitTime,
        isEnabled: true,
        createdAt: new Date()
      };

      this.alerts.set(alertId, alert);
      
      // Schedule a repeating notification check (expo doesn't support condition-based notifications)
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Disney Wait Time Alert',
          body: `We'll notify you when ${attractionName} has a wait time of ${targetWaitTime} minutes or less!`,
          data: { alertId, attractionId, targetWaitTime },
        },
        trigger: null, // Show immediately as confirmation
      });

      return alertId;
    } catch (error) {
      console.error('Error creating wait time alert:', error);
      return null;
    }
  }

  async removeWaitTimeAlert(alertId: string): Promise<void> {
    try {
      this.alerts.delete(alertId);
      // Cancel any scheduled notifications for this alert
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const alertNotifications = allNotifications.filter(
        notification => notification.content.data?.alertId === alertId
      );
      
      for (const notification of alertNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error removing wait time alert:', error);
    }
  }

  async checkWaitTimeAlerts(waitTimes: WaitTime[], attractionNames: Map<string, string>): Promise<void> {
    const currentTime = new Date();
    
    for (const [alertId, alert] of this.alerts) {
      if (!alert.isEnabled) continue;
      
      const waitTime = waitTimes.find(wt => wt.attractionId === alert.attractionId);
      if (!waitTime || waitTime.waitTime === -1) continue;
      
      // Check if wait time meets the alert criteria
      if (waitTime.waitTime <= alert.targetWaitTime) {
        // Check if we haven't sent this alert recently (avoid spam)
        const timeSinceLastAlert = alert.triggeredAt 
          ? currentTime.getTime() - alert.triggeredAt.getTime() 
          : Infinity;
        
        // Only send alert if it's been more than 30 minutes since the last one
        if (timeSinceLastAlert > 30 * 60 * 1000) {
          const attractionName = attractionNames.get(alert.attractionId) || 'Unknown Attraction';
          
          await this.sendWaitTimeAlert(attractionName, waitTime.waitTime, alert.targetWaitTime);
          
          // Update the triggered time
          alert.triggeredAt = currentTime;
          this.alerts.set(alertId, alert);
        }
      }
    }
  }

  private async sendWaitTimeAlert(attractionName: string, currentWaitTime: number, targetWaitTime: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎢 Wait Time Alert!',
          body: `${attractionName} is now ${currentWaitTime} minutes (target: ${targetWaitTime} min)`,
          data: { type: 'wait_time_alert', attractionName, currentWaitTime, targetWaitTime },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending wait time alert:', error);
    }
  }

  getActiveAlerts(): WaitTimeAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.isEnabled);
  }

  getAlertForAttraction(attractionId: string): WaitTimeAlert | undefined {
    return Array.from(this.alerts.values()).find(alert => 
      alert.attractionId === attractionId && alert.isEnabled
    );
  }

  async sendParkStatusNotification(message: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏰 Disney Parks Update',
          body: message,
          data: { type: 'park_status' },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending park status notification:', error);
    }
  }
}

export const notificationService = new NotificationService();