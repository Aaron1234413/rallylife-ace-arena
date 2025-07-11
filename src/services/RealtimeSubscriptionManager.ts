import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  schema?: string;
}

interface Subscription {
  id: string;
  config: SubscriptionConfig;
  callbacks: Set<Function>;
  channel: RealtimeChannel | null;
  isActive: boolean;
}

class RealtimeSubscriptionManager {
  private subscriptions = new Map<string, Subscription>();
  private isInitialized = false;

  // Generate unique subscription key
  private getSubscriptionKey(config: SubscriptionConfig): string {
    const { table, event, filter = '', schema = 'public' } = config;
    return `${schema}:${table}:${event}:${filter}`;
  }

  // Initialize the manager
  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('🔄 RealtimeSubscriptionManager initialized');
  }

  // Subscribe to a table with callback
  subscribe(config: SubscriptionConfig, callback: Function): string {
    this.initialize();
    
    const key = this.getSubscriptionKey(config);
    const subscriptionId = `${key}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔔 Subscribing to: ${key}`);
    
    // Get or create subscription
    let subscription = this.subscriptions.get(key);
    
    if (!subscription) {
      subscription = {
        id: key,
        config,
        callbacks: new Set(),
        channel: null,
        isActive: false
      };
      this.subscriptions.set(key, subscription);
    }
    
    // Add callback
    subscription.callbacks.add(callback);
    
    // Create or reuse channel
    if (!subscription.isActive) {
      this.createChannel(subscription);
    }
    
    return subscriptionId;
  }

  // Unsubscribe a specific callback
  unsubscribe(subscriptionId: string, callback: Function) {
    // Find subscription by callback
    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.callbacks.has(callback)) {
        subscription.callbacks.delete(callback);
        console.log(`🔕 Unsubscribed callback from: ${key}`);
        
        // If no more callbacks, cleanup channel
        if (subscription.callbacks.size === 0) {
          this.cleanupSubscription(key);
        }
        break;
      }
    }
  }

  // Create channel for subscription
  private createChannel(subscription: Subscription) {
    try {
      const { table, event, filter, schema = 'public' } = subscription.config;
      
      // Create unique channel name to avoid conflicts
      const channelName = `rtm-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      console.log(`📡 Creating channel: ${channelName} for ${subscription.id}`);
      
      const channel = supabase.channel(channelName);
      
      const changeConfig: any = {
        event,
        schema,
        table
      };
      
      if (filter) {
        changeConfig.filter = filter;
      }
      
      channel.on('postgres_changes', changeConfig, (payload) => {
        console.log(`📨 Received change for ${subscription.id}:`, payload);
        
        // Call all callbacks for this subscription
        subscription.callbacks.forEach(callback => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        });
      });
      
      channel.subscribe((status, error) => {
        if (error) {
          console.error(`❌ Subscription error for ${subscription.id}:`, error);
          subscription.isActive = false;
        } else if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${subscription.id}`);
          subscription.isActive = true;
        } else if (status === 'CLOSED') {
          console.log(`🔒 Subscription closed for ${subscription.id}`);
          subscription.isActive = false;
        }
      });
      
      subscription.channel = channel;
      subscription.isActive = true;
      
    } catch (error) {
      console.error(`❌ Failed to create channel for ${subscription.id}:`, error);
      subscription.isActive = false;
    }
  }

  // Cleanup specific subscription
  private cleanupSubscription(key: string) {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;
    
    console.log(`🧹 Cleaning up subscription: ${key}`);
    
    if (subscription.channel) {
      try {
        supabase.removeChannel(subscription.channel);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
    }
    
    subscription.isActive = false;
    subscription.channel = null;
    this.subscriptions.delete(key);
  }

  // Cleanup all subscriptions
  cleanup() {
    console.log('🧹 Cleaning up all subscriptions');
    
    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.channel) {
        try {
          supabase.removeChannel(subscription.channel);
        } catch (error) {
          console.warn('Error removing channel:', error);
        }
      }
    }
    
    this.subscriptions.clear();
    this.isInitialized = false;
  }

  // Get active subscriptions count (for debugging)
  getActiveSubscriptionsCount(): number {
    return Array.from(this.subscriptions.values()).filter(s => s.isActive).length;
  }

  // Get subscription info (for debugging)
  getSubscriptionInfo() {
    return Array.from(this.subscriptions.entries()).map(([key, sub]) => ({
      key,
      isActive: sub.isActive,
      callbackCount: sub.callbacks.size,
      table: sub.config.table
    }));
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeSubscriptionManager();

// Export hook for easy usage  
export function useRealtimeSubscription(
  config: SubscriptionConfig,
  callback: Function,
  enabled = true
) {
  const React = require('react');
  const { useEffect, useRef } = React;
  
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  const subscriptionIdRef = useRef(null) as React.MutableRefObject<string | null>;
  
  useEffect(() => {
    if (!enabled) return;
    
    const wrappedCallback = (...args: any[]) => {
      callbackRef.current(...args);
    };
    
    subscriptionIdRef.current = realtimeManager.subscribe(config, wrappedCallback);
    
    return () => {
      if (subscriptionIdRef.current) {
        realtimeManager.unsubscribe(subscriptionIdRef.current, wrappedCallback);
      }
    };
  }, [enabled, config.table, config.event, config.filter, config.schema]);
}