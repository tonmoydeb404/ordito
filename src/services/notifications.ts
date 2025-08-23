import { ApiService } from './api';
import { NotificationSettings } from '../types';

export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted = false;
  private settings: NotificationSettings = {
    schedule_success: true,
    schedule_failure: true,
    schedule_warnings: true,
    execution_success: false, // Less noisy by default
    execution_failure: true,
    system_alerts: true,
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    try {
      this.permissionGranted = await ApiService.checkNotificationPermission();
      console.log('Notification permission:', this.permissionGranted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Failed to check notification permission:', error);
    }
  }

  public async requestPermission(): Promise<boolean> {
    try {
      await ApiService.requestNotificationPermission();
      this.permissionGranted = await ApiService.checkNotificationPermission();
      return this.permissionGranted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  public updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public isPermissionGranted(): boolean {
    return this.permissionGranted;
  }

  public async sendTestNotification(title: string = 'Test Notification', body: string = 'This is a test notification from Ordito'): Promise<boolean> {
    if (!this.permissionGranted) {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      await ApiService.sendTestNotification(title, body);
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  // These methods would be called by the stores when events occur
  public async notifyScheduleSuccess(scheduleName: string): Promise<void> {
    if (!this.permissionGranted || !this.settings.schedule_success) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'Schedule Completed',
        `"${scheduleName}" executed successfully`
      );
    } catch (error) {
      console.error('Failed to send schedule success notification:', error);
    }
  }

  public async notifyScheduleFailure(scheduleName: string, error: string): Promise<void> {
    if (!this.permissionGranted || !this.settings.schedule_failure) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'Schedule Failed',
        `"${scheduleName}" failed: ${error}`
      );
    } catch (error) {
      console.error('Failed to send schedule failure notification:', error);
    }
  }

  public async notifyScheduleWarning(scheduleName: string, nextExecution: string): Promise<void> {
    if (!this.permissionGranted || !this.settings.schedule_warnings) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'Schedule Starting Soon',
        `"${scheduleName}" will execute at ${nextExecution}`
      );
    } catch (error) {
      console.error('Failed to send schedule warning notification:', error);
    }
  }

  public async notifyExecutionSuccess(commandName: string): Promise<void> {
    if (!this.permissionGranted || !this.settings.execution_success) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'Command Completed',
        `"${commandName}" executed successfully`
      );
    } catch (error) {
      console.error('Failed to send execution success notification:', error);
    }
  }

  public async notifyExecutionFailure(commandName: string, exitCode: number): Promise<void> {
    if (!this.permissionGranted || !this.settings.execution_failure) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'Command Failed',
        `"${commandName}" failed with exit code ${exitCode}`
      );
    } catch (error) {
      console.error('Failed to send execution failure notification:', error);
    }
  }

  public async notifySystemAlert(message: string): Promise<void> {
    if (!this.permissionGranted || !this.settings.system_alerts) {
      return;
    }

    try {
      await ApiService.sendTestNotification(
        'System Alert',
        message
      );
    } catch (error) {
      console.error('Failed to send system alert notification:', error);
    }
  }
}