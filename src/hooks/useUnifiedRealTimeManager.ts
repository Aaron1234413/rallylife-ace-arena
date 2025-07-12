import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { UnifiedSession } from './useUnifiedSessions';

interface RealTimeSubscription {
  channel: any;
  tables: string[];
  filters?: string[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastActivity: Date;
  retryCount: number;
  maxRetries: number;
}

interface ConflictResolution {
  sessionId: string;
  conflictType: 'participant_count' | 'status' | 'data';
  localVersion: any;
  serverVersion: any;
  resolvedVersion?: any;
  timestamp: Date;
}

interface UseUnifiedRealTimeManagerOptions {
  onSessionUpdate?: (session: UnifiedSession) => void;
  onParticipantUpdate?: (sessionId: string, participantData?: any) => void;
  onStatusChange?: (sessionId: string, oldStatus: string, newStatus: string) => void;
  onConflictResolved?: (resolution: ConflictResolution) => void;
  enableConflictResolution?: boolean;
  subscriptionTimeout?: number;
  maxRetries?: number;
}

export function useUnifiedRealTimeManager(options: UseUnifiedRealTimeManagerOptions = {}) {
  const { user } = useAuth();
  const {
    onSessionUpdate,
    onParticipantUpdate,
    onStatusChange,
    onConflictResolved,
    enableConflictResolution = true,
    subscriptionTimeout = 30000,
    maxRetries = 3
  } = options;

  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Map<string, RealTimeSubscription>>(new Map());
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  
  // Refs for stable references
  const subscriptionsRef = useRef<Map<string, RealTimeSubscription>>(new Map());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<Map<string, any>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when state changes
  useEffect(() => {
    subscriptionsRef.current = subscriptions;
  }, [subscriptions]);

  // Conflict resolution with optimistic updates
  const resolveConflict = useCallback((conflict: ConflictResolution): any => {
    if (!enableConflictResolution) return conflict.serverVersion;

    const { conflictType, localVersion, serverVersion } = conflict;
    let resolvedVersion: any;

    switch (conflictType) {
      case 'participant_count':
        // Server data wins for participant count (authoritative)
        resolvedVersion = {
          ...localVersion,
          participant_count: serverVersion.participant_count,
          current_participants: serverVersion.current_participants
        };
        break;

      case 'status':
        // Use timestamp to determine which status is newer
        const localTime = new Date(localVersion.updated_at || 0).getTime();
        const serverTime = new Date(serverVersion.updated_at || 0).getTime();
        
        resolvedVersion = serverTime >= localTime ? serverVersion : localVersion;
        break;

      case 'data':
      default:
        // Server data wins by default, but preserve optimistic user changes
        resolvedVersion = {
          ...serverVersion,
          // Preserve any local optimistic updates that don't conflict
          ...(localVersion.optimisticUpdates || {})
        };
        break;
    }

    const resolution: ConflictResolution = {
      ...conflict,
      resolvedVersion,
      timestamp: new Date()
    };

    setConflicts(prev => [...prev.slice(-10), resolution]); // Keep last 10 conflicts
    onConflictResolved?.(resolution);

    return resolvedVersion;
  }, [enableConflictResolution, onConflictResolved]);

  // Enhanced change handler with conflict detection
  const handleTableChange = useCallback((table: string, payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const recordId = newRecord?.id || oldRecord?.id;

    if (!recordId) return;

    const cacheKey = `${table}_${recordId}`;
    const lastData = lastDataRef.current.get(cacheKey);

    // Detect conflicts
    if (lastData && newRecord && enableConflictResolution) {
      const hasConflict = 
        (lastData.participant_count !== newRecord.participant_count) ||
        (lastData.status !== newRecord.status) ||
        (JSON.stringify(lastData) !== JSON.stringify(newRecord));

      if (hasConflict) {
        const conflictType: ConflictResolution['conflictType'] = 
          lastData.participant_count !== newRecord.participant_count ? 'participant_count' :
          lastData.status !== newRecord.status ? 'status' : 'data';

        const conflict: ConflictResolution = {
          sessionId: recordId,
          conflictType,
          localVersion: lastData,
          serverVersion: newRecord,
          timestamp: new Date()
        };

        const resolvedRecord = resolveConflict(conflict);
        payload.new = resolvedRecord;
      }
    }

    // Update cache
    if (newRecord) {
      lastDataRef.current.set(cacheKey, { ...newRecord });
    }

    // Table-specific handlers
    switch (table) {
      case 'sessions':
        if (eventType === 'UPDATE' && newRecord && oldRecord) {
          // Status change notifications
          if (newRecord.status !== oldRecord.status) {
            onStatusChange?.(newRecord.id, oldRecord.status, newRecord.status);
            showStatusChangeNotification(newRecord.status, oldRecord.status, newRecord);
          }
          onSessionUpdate?.(newRecord as UnifiedSession);
        } else if (eventType === 'INSERT' && newRecord) {
          onSessionUpdate?.(newRecord as UnifiedSession);
        }
        break;

      case 'session_participants':
        const sessionId = newRecord?.session_id || oldRecord?.session_id;
        if (sessionId) {
          onParticipantUpdate?.(sessionId, newRecord);
        }
        break;
    }
  }, [enableConflictResolution, resolveConflict, onSessionUpdate, onParticipantUpdate, onStatusChange]);

  // Enhanced status change notifications
  const showStatusChangeNotification = useCallback(async (newStatus: string, oldStatus: string, session: any) => {
    if (!user || !session) return;

    // Check if user is involved in this session
    const isInvolved = await isUserInSession(session.id);
    if (!isInvolved) return;

    const sessionName = session.session_type || 'Session';

    switch (newStatus) {
      case 'active':
        if (oldStatus === 'waiting' || oldStatus === 'open') {
          toast.success(`🎾 ${sessionName} started! Get ready to play!`, {
            duration: 5000,
            description: session.location || 'Good luck!'
          });
        } else if (oldStatus === 'paused') {
          toast.info(`▶️ ${sessionName} resumed`, { duration: 3000 });
        }
        break;
        
      case 'paused':
        toast.info(`⏸️ ${sessionName} paused`, { duration: 3000 });
        break;
        
      case 'completed':
        toast.success(`🏁 ${sessionName} completed! Great game!`, {
          duration: 5000,
          description: session.winner_id ? 'Congratulations to the winner!' : undefined
        });
        break;
        
      case 'cancelled':
        toast.error(`❌ ${sessionName} has been cancelled`, {
          duration: 5000,
          description: session.cancellation_reason || 'Contact the organizer for details'
        });
        break;
        
      case 'waiting':
        if (oldStatus === 'open') {
          toast.info(`⏳ ${sessionName} is now waiting to start`, { duration: 3000 });
        }
        break;
    }
  }, [user]);

  // Check user session involvement
  const isUserInSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const [sessionResponse, participantResponse] = await Promise.all([
        supabase
          .from('sessions')
          .select('creator_id')
          .eq('id', sessionId)
          .single(),
        supabase
          .from('session_participants')
          .select('id')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .single()
      ]);
      
      return sessionResponse.data?.creator_id === user.id || !!participantResponse.data;
    } catch {
      return false;
    }
  }, [user]);

  // Create subscription with enhanced error handling
  const createSubscription = useCallback((subscriptionId: string, tables: string[], filters?: string[]) => {
    if (subscriptionsRef.current.has(subscriptionId)) {
      console.log(`Subscription ${subscriptionId} already exists`);
      return;
    }

    console.log(`Creating subscription: ${subscriptionId} for tables: ${tables.join(', ')}`);

    const channel = supabase.channel(`unified-${subscriptionId}-${Date.now()}`);

    // Add listeners for each table
    tables.forEach(table => {
      let changeListener = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        (payload) => handleTableChange(table, payload)
      );

      // Apply filters if provided
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          changeListener = channel.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter
            },
            (payload) => handleTableChange(table, payload)
          );
        });
      }
    });

    const subscription: RealTimeSubscription = {
      channel,
      tables,
      filters,
      status: 'connecting',
      lastActivity: new Date(),
      retryCount: 0,
      maxRetries
    };

    // Subscribe with timeout handling
    const subscribePromise = channel.subscribe((status) => {
      console.log(`Subscription ${subscriptionId} status:`, status);
      
      setSubscriptions(prev => {
        const newMap = new Map(prev);
        if (newMap.has(subscriptionId)) {
          const sub = newMap.get(subscriptionId)!;
          sub.status = status === 'SUBSCRIBED' ? 'connected' : 
                      status === 'CLOSED' ? 'disconnected' : 
                      status === 'CHANNEL_ERROR' ? 'error' : 'connecting';
          sub.lastActivity = new Date();
          if (status === 'SUBSCRIBED') {
            sub.retryCount = 0;
          }
        }
        return newMap;
      });

      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        scheduleReconnect(subscriptionId);
      }
    });

    setSubscriptions(prev => new Map(prev).set(subscriptionId, subscription));

    // Set up subscription timeout
    setTimeout(() => {
      const currentSub = subscriptionsRef.current.get(subscriptionId);
      if (currentSub && currentSub.status === 'connecting') {
        console.warn(`Subscription ${subscriptionId} timeout, retrying...`);
        scheduleReconnect(subscriptionId);
      }
    }, subscriptionTimeout);

  }, [handleTableChange, maxRetries, subscriptionTimeout]);

  // Reconnection logic with exponential backoff
  const scheduleReconnect = useCallback((subscriptionId: string) => {
    const subscription = subscriptionsRef.current.get(subscriptionId);
    if (!subscription || subscription.retryCount >= subscription.maxRetries) {
      console.error(`Max retries reached for subscription ${subscriptionId}`);
      return;
    }

    const backoffDelay = Math.min(1000 * Math.pow(2, subscription.retryCount), 30000);
    console.log(`Scheduling reconnect for ${subscriptionId} in ${backoffDelay}ms`);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting reconnect for ${subscriptionId}`);
      
      // Remove old subscription
      removeSubscription(subscriptionId);
      
      // Create new subscription with incremented retry count
      const newSubscription = { ...subscription, retryCount: subscription.retryCount + 1 };
      setSubscriptions(prev => new Map(prev).set(subscriptionId, newSubscription));
      
      createSubscription(subscriptionId, subscription.tables, subscription.filters);
    }, backoffDelay);
  }, [createSubscription]);

  // Remove subscription
  const removeSubscription = useCallback((subscriptionId: string) => {
    const subscription = subscriptionsRef.current.get(subscriptionId);
    if (subscription) {
      console.log(`Removing subscription: ${subscriptionId}`);
      supabase.removeChannel(subscription.channel);
      setSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(subscriptionId);
        return newMap;
      });
    }
  }, []);

  // Cleanup all subscriptions
  const cleanup = useCallback(() => {
    console.log('Cleaning up all real-time subscriptions');
    
    subscriptionsRef.current.forEach((subscription, id) => {
      supabase.removeChannel(subscription.channel);
    });
    
    setSubscriptions(new Map());
    setIsConnected(false);
    lastDataRef.current.clear();
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Initialize main session subscriptions
  const initializeSessionSubscriptions = useCallback(() => {
    if (!user) return;

    console.log('Initializing unified session subscriptions');
    
    // Primary sessions subscription
    createSubscription('sessions', ['sessions', 'session_participants']);
    
    // User-specific subscription for personalized updates
    createSubscription(
      'user-sessions', 
      ['sessions', 'session_participants'],
      [`creator_id=eq.${user.id}`, `user_id=eq.${user.id}`]
    );
  }, [user, createSubscription]);

  // Heartbeat to monitor connection health
  useEffect(() => {
    if (!isConnected) return;

    heartbeatIntervalRef.current = setInterval(() => {
      const now = new Date();
      let hasStaleConnections = false;

      subscriptionsRef.current.forEach((subscription, id) => {
        const timeSinceActivity = now.getTime() - subscription.lastActivity.getTime();
        
        if (timeSinceActivity > 60000) { // 1 minute threshold
          console.warn(`Stale subscription detected: ${id}`);
          hasStaleConnections = true;
          scheduleReconnect(id);
        }
      });

      if (hasStaleConnections) {
        setIsConnected(false);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isConnected, scheduleReconnect]);

  // Initialize and cleanup
  useEffect(() => {
    initializeSessionSubscriptions();
    return cleanup;
  }, [initializeSessionSubscriptions, cleanup]);

  // Connection status monitoring
  const connectionStatus = useMemo(() => {
    const totalSubs = subscriptions.size;
    const connectedSubs = Array.from(subscriptions.values()).filter(s => s.status === 'connected').length;
    const errorSubs = Array.from(subscriptions.values()).filter(s => s.status === 'error').length;

    return {
      isFullyConnected: totalSubs > 0 && connectedSubs === totalSubs,
      isPartiallyConnected: connectedSubs > 0 && connectedSubs < totalSubs,
      hasErrors: errorSubs > 0,
      totalSubscriptions: totalSubs,
      connectedSubscriptions: connectedSubs,
      errorSubscriptions: errorSubs
    };
  }, [subscriptions]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    subscriptions: Array.from(subscriptions.entries()),
    
    // Conflict resolution
    conflicts,
    
    // Manual controls
    createSubscription,
    removeSubscription,
    cleanup,
    
    // Health monitoring
    lastActivity: Math.max(...Array.from(subscriptions.values()).map(s => s.lastActivity.getTime())),
    
    // Utilities
    isUserInSession
  };
}