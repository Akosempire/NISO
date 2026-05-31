/**
 * NISO Notification Engine
 * Handles in-app, email, SMS delivery with queue, retry, and hybrid sync
 */

class NotificationEngine {
  constructor(config = {}) {
    this.config = {
      cloudUrl: config.cloudUrl || 'https://api.niso.ng',
      localDb: config.localDb || null,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 5000,
      batchSize: config.batchSize || 10,
      ...config
    };
    
    this.queue = [];
    this.history = [];
    this.isOnline = navigator.onLine;
    this.wsConnection = null;
    
    this.initializeListeners();
    this.loadQueueFromStorage();
  }

  initializeListeners() {
    // Online/offline detection
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Process queue periodically
    setInterval(() => this.processQueue(), 10000);
  }

  loadQueueFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('niso_notification_queue');
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load notification queue:', e);
      }
    }
  }

  saveQueueToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('niso_notification_queue', JSON.stringify(this.queue));
      } catch (e) {
        console.error('Failed to save notification queue:', e);
      }
    }
  }

  /**
   * Queue a notification for delivery
   */
  queue_notification(notification) {
    const queueItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'PENDING',
      nextRetry: Date.now()
    };
    
    this.queue.push(queueItem);
    this.saveQueueToStorage();
    
    // Try to send immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
    
    return queueItem.id;
  }

  /**
   * Create & queue interruption notification
   */
  notify_interruption(data) {
    return this.queue_notification({
      type: 'INTERRUPTION',
      title: `⚠️ Equipment Down: ${data.equipment}`,
      message: `${data.equipment} interrupted at ${data.tripTime}. Cause: ${data.cause}`,
      recipients: data.recipients || [],
      channels: ['in_app', 'email', 'sms'],
      priority: 'HIGH',
      metadata: {
        equipment: data.equipment,
        cause: data.cause,
        tripTime: data.tripTime,
        recordId: data.recordId
      },
      actionUrl: `/interruptions/${data.recordId}`
    });
  }

  /**
   * Create & queue SLA warning
   */
  notify_sla_warning(data) {
    return this.queue_notification({
      type: 'SLA_WARNING',
      title: `⚠️ SLA Alert: Hour ${String(data.hour).padStart(2, '0')}:00`,
      message: `Difference ${data.difference}MW exceeds tolerance. Forecast: ${data.forecast}MW, Actual: ${data.actual}MW`,
      recipients: data.recipients || [],
      channels: ['in_app', 'email'],
      priority: 'MEDIUM',
      metadata: {
        hour: data.hour,
        difference: data.difference,
        forecast: data.forecast,
        actual: data.actual
      }
    });
  }

  /**
   * Create & queue approval notification
   */
  notify_pending_approval(data) {
    return this.queue_notification({
      type: 'APPROVAL_REQUIRED',
      title: `📋 Approval Pending: ${data.module}`,
      message: `${data.submittedBy} submitted a ${data.module} correction requiring your approval.`,
      recipients: [data.approverId],
      channels: ['in_app', 'email'],
      priority: 'HIGH',
      metadata: {
        module: data.module,
        recordId: data.recordId,
        submittedBy: data.submittedBy
      },
      actionUrl: `/approvals/${data.recordId}`
    });
  }

  /**
   * Create & queue month seal notification
   */
  notify_month_seal(data) {
    return this.queue_notification({
      type: 'MONTH_SEAL',
      title: `🔒 Month Seal: ${data.month}/${data.year}`,
      message: `Month is now ${data.state}. ${data.recordCount} records affected.`,
      recipients: data.recipients || [],
      channels: ['in_app', 'email'],
      priority: 'MEDIUM',
      metadata: {
        month: data.month,
        year: data.year,
        state: data.state,
        recordCount: data.recordCount
      }
    });
  }

  /**
   * Process queue: attempt to deliver all pending notifications
   */
  async processQueue() {
    const now = Date.now();
    const pending = this.queue.filter(item => 
      item.status === 'PENDING' && item.nextRetry <= now
    );

    for (const item of pending.slice(0, this.config.batchSize)) {
      await this.deliverNotification(item);
    }

    this.saveQueueToStorage();
  }

  /**
   * Deliver a single notification via all configured channels
   */
  async deliverNotification(item) {
    const results = {};

    // In-app notification (always succeeds if online)
    if (item.channels.includes('in_app')) {
      results.in_app = await this.deliverInApp(item);
    }

    // Email delivery
    if (item.channels.includes('email') && this.isOnline) {
      results.email = await this.deliverEmail(item);
    }

    // SMS delivery
    if (item.channels.includes('sms') && this.isOnline) {
      results.sms = await this.deliverSMS(item);
    }

    // Determine overall status
    const allSucceeded = Object.values(results).every(r => r.success);

    if (allSucceeded) {
      item.status = 'DELIVERED';
      item.deliveredAt = new Date().toISOString();
      item.deliveryResults = results;
      
      // Log to history
      this.history.push({
        ...item,
        historyId: `history-${Date.now()}`
      });
    } else if (item.attempts < this.config.retryAttempts) {
      item.attempts++;
      item.lastAttempt = new Date().toISOString();
      item.nextRetry = now + (this.config.retryDelay * Math.pow(2, item.attempts - 1)); // exponential backoff
      item.status = 'PENDING';
    } else {
      item.status = 'FAILED';
      item.failedAt = new Date().toISOString();
      item.deliveryResults = results;
    }
  }

  /**
   * Deliver via in-app notification bell
   */
  async deliverInApp(item) {
    try {
      // Store in IndexedDB or localStorage
      const inAppNotifs = JSON.parse(localStorage.getItem('niso_in_app_notifications') || '[]');
      inAppNotifs.unshift({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        priority: item.priority,
        createdAt: item.createdAt,
        read: false,
        actionUrl: item.actionUrl
      });
      localStorage.setItem('niso_in_app_notifications', JSON.stringify(inAppNotifs.slice(0, 50))); // keep last 50
      
      // Dispatch custom event for UI to react
      window.dispatchEvent(new CustomEvent('niso:notification', { 
        detail: { id: item.id, title: item.title, message: item.message }
      }));
      
      return { success: true, method: 'in-app' };
    } catch (e) {
      console.error('In-app notification failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Deliver via email (via cloud API)
   */
  async deliverEmail(item) {
    try {
      const response = await fetch(`${this.config.cloudUrl}/api/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: item.recipients,
          title: item.title,
          message: item.message,
          type: item.type,
          metadata: item.metadata
        })
      });

      if (response.ok) {
        return { success: true, method: 'email', sent: item.recipients.length };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (e) {
      console.error('Email notification failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Deliver via SMS (via cloud API)
   */
  async deliverSMS(item) {
    try {
      const response = await fetch(`${this.config.cloudUrl}/api/notifications/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: item.recipients,
          message: item.message,
          type: item.type
        })
      });

      if (response.ok) {
        return { success: true, method: 'sms', sent: item.recipients.length };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (e) {
      console.error('SMS notification failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Handle coming online: retry failed notifications
   */
  handleOnline() {
    this.isOnline = true;
    console.log('[NISO] Coming online — retrying notifications');
    this.processQueue();
  }

  /**
   * Handle going offline: queue persists locally
   */
  handleOffline() {
    this.isOnline = false;
    console.log('[NISO] Going offline — notifications queued locally');
  }

  /**
   * Get notification history
   */
  getHistory(filters = {}) {
    let results = this.history;
    
    if (filters.type) {
      results = results.filter(n => n.type === filters.type);
    }
    if (filters.status) {
      results = results.filter(n => n.status === filters.status);
    }
    if (filters.since) {
      results = results.filter(n => new Date(n.createdAt) >= new Date(filters.since));
    }
    
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get in-app notifications (unread first)
   */
  getInAppNotifications() {
    try {
      const notifs = JSON.parse(localStorage.getItem('niso_in_app_notifications') || '[]');
      return notifs;
    } catch (e) {
      return [];
    }
  }

  /**
   * Mark in-app notification as read
   */
  markAsRead(notificationId) {
    try {
      const notifs = JSON.parse(localStorage.getItem('niso_in_app_notifications') || '[]');
      const idx = notifs.findIndex(n => n.id === notificationId);
      if (idx >= 0) {
        notifs[idx].read = true;
        localStorage.setItem('niso_in_app_notifications', JSON.stringify(notifs));
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(q => q.status === 'PENDING').length,
      delivered: this.queue.filter(q => q.status === 'DELIVERED').length,
      failed: this.queue.filter(q => q.status === 'FAILED').length,
      isOnline: this.isOnline
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationEngine;
}
