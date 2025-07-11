import { supabase } from '@/integrations/supabase/client';

interface SubscriptionRequest {
  id: string;
  channelName: string;
  table: string;
  callback: () => void;
  retryCount: number;
  priority: number;
  timestamp: number;
}

interface ActiveSubscription {
  id: string;
  channel: any;
  table: string;
  channelName: string;
}

export class SubscriptionCoordinator {
  private static instance: SubscriptionCoordinator;
  private subscriptionQueue: SubscriptionRequest[] = [];
  private activeSubscriptions: Map<string, ActiveSubscription> = new Map();
  private processingQueue = false;
  private maxRetries = 3;
  private retryDelay = 1000;
  private subscriptionTimeout = 30000; // 30 seconds timeout

  static getInstance(): SubscriptionCoordinator {
    if (!SubscriptionCoordinator.instance) {
      SubscriptionCoordinator.instance = new SubscriptionCoordinator();
    }
    return SubscriptionCoordinator.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  // Add subscription request to queue
  addSubscriptionRequest(
    table: string,
    callback: () => void,
    priority: number = 1,
    channelPrefix: string = 'coordinated'
  ): string {
    const requestId = `${channelPrefix}-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channelName = `${requestId}`;

    // Check if similar subscription already exists or is queued
    const existingActiveKey = Array.from(this.activeSubscriptions.keys()).find(key => 
      key.includes(table) && key.includes(channelPrefix)
    );
    
    if (existingActiveKey) {
      console.log(`Subscription for ${table} already active:`, existingActiveKey);
      return existingActiveKey;
    }

    const existingInQueue = this.subscriptionQueue.find(req => 
      req.table === table && req.id.includes(channelPrefix)
    );
    
    if (existingInQueue) {
      console.log(`Subscription for ${table} already queued:`, existingInQueue.id);
      return existingInQueue.id;
    }

    const request: SubscriptionRequest = {
      id: requestId,
      channelName,
      table,
      callback,
      retryCount: 0,
      priority,
      timestamp: Date.now()
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.subscriptionQueue.findIndex(req => req.priority < priority);
    if (insertIndex === -1) {
      this.subscriptionQueue.push(request);
    } else {
      this.subscriptionQueue.splice(insertIndex, 0, request);
    }

    console.log(`Queued subscription request: ${requestId} for table: ${table}`);
    this.processQueue();
    
    return requestId;
  }

  // Remove subscription request from queue or active subscriptions
  removeSubscriptionRequest(requestId: string): void {
    // Remove from queue
    this.subscriptionQueue = this.subscriptionQueue.filter(req => req.id !== requestId);
    
    // Remove from active subscriptions
    const activeSubscription = this.activeSubscriptions.get(requestId);
    if (activeSubscription) {
      try {
        supabase.removeChannel(activeSubscription.channel);
        console.log(`Removed active subscription: ${requestId}`);
      } catch (error) {
        console.warn(`Error removing channel ${requestId}:`, error);
      }
      this.activeSubscriptions.delete(requestId);
    }
  }

  // Process the subscription queue
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.subscriptionQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.subscriptionQueue.length > 0) {
        const request = this.subscriptionQueue.shift()!;
        
        // Check if subscription was cancelled while in queue
        if (this.activeSubscriptions.has(request.id)) {
          continue;
        }

        try {
          await this.createSubscription(request);
          // Add small delay between subscriptions to prevent conflicts
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to create subscription ${request.id}:`, error);
          this.handleSubscriptionError(request, error);
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  // Create actual subscription
  private async createSubscription(request: SubscriptionRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Creating subscription: ${request.id} for table: ${request.table}`);
      
      let timeoutId: NodeJS.Timeout;
      let subscriptionCreated = false;

      try {
        const channel = supabase
          .channel(request.channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: request.table
            },
            (payload) => {
              console.log(`Received change for ${request.table}:`, payload);
              request.callback();
            }
          )
          .subscribe((status) => {
            console.log(`Subscription ${request.id} status:`, status);
            
            if (status === 'SUBSCRIBED' && !subscriptionCreated) {
              subscriptionCreated = true;
              clearTimeout(timeoutId);
              
              // Store active subscription
              this.activeSubscriptions.set(request.id, {
                id: request.id,
                channel,
                table: request.table,
                channelName: request.channelName
              });
              
              console.log(`Successfully created subscription: ${request.id}`);
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              clearTimeout(timeoutId);
              if (!subscriptionCreated) {
                reject(new Error(`Subscription failed with status: ${status}`));
              }
            }
          });

        // Set timeout for subscription creation
        timeoutId = setTimeout(() => {
          if (!subscriptionCreated) {
            console.warn(`Subscription ${request.id} timed out`);
            try {
              supabase.removeChannel(channel);
            } catch (err) {
              console.warn('Error removing timed out channel:', err);
            }
            reject(new Error('Subscription timed out'));
          }
        }, this.subscriptionTimeout);

      } catch (error) {
        console.error(`Error creating subscription ${request.id}:`, error);
        reject(error);
      }
    });
  }

  // Handle subscription errors with retry logic
  private handleSubscriptionError(request: SubscriptionRequest, error: any): void {
    if (request.retryCount < this.maxRetries) {
      request.retryCount++;
      const delay = this.retryDelay * Math.pow(2, request.retryCount - 1); // Exponential backoff
      
      console.log(`Retrying subscription ${request.id} in ${delay}ms (attempt ${request.retryCount})`);
      
      setTimeout(() => {
        // Re-add to front of queue with higher priority
        this.subscriptionQueue.unshift({ ...request, priority: request.priority + 1 });
        this.processQueue();
      }, delay);
    } else {
      console.error(`Max retries exceeded for subscription ${request.id}:`, error);
    }
  }

  // Get queue status for debugging
  getQueueStatus(): { queueLength: number; activeCount: number; processing: boolean } {
    return {
      queueLength: this.subscriptionQueue.length,
      activeCount: this.activeSubscriptions.size,
      processing: this.processingQueue
    };
  }

  // Clear all subscriptions and queue
  clearAll(): void {
    console.log('Clearing all subscriptions and queue');
    
    // Clear queue
    this.subscriptionQueue = [];
    
    // Remove all active subscriptions
    this.activeSubscriptions.forEach((subscription) => {
      try {
        supabase.removeChannel(subscription.channel);
      } catch (error) {
        console.warn(`Error removing channel ${subscription.id}:`, error);
      }
    });
    
    this.activeSubscriptions.clear();
    this.processingQueue = false;
  }

  // Conflict detection - check if table is already being monitored
  hasActiveSubscriptionForTable(table: string): boolean {
    return Array.from(this.activeSubscriptions.values()).some(sub => sub.table === table);
  }

  // Get active subscriptions for debugging
  getActiveSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions.keys());
  }
}

export const subscriptionCoordinator = SubscriptionCoordinator.getInstance();