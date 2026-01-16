import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  cacheData,
  getCachedData,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueueItem,
  getSyncQueueCount,
  setLastSync,
  updateCachedItem,
  deleteCachedItem,
} from '@/lib/offlineDB';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  syncNow: () => Promise<void>;
  refreshCache: () => Promise<void>;
  lastSyncTime: Date | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

type CacheableTable = 'products' | 'categories' | 'customers' | 'suppliers' | 'invoices' | 'invoice_items' | 'expenses' | 'expense_categories' | 'purchase_orders' | 'purchase_order_items';

const CACHE_TABLES: CacheableTable[] = [
  'products',
  'categories',
  'customers',
  'suppliers',
  'invoices',
  'invoice_items',
  'expenses',
  'expense_categories',
  'purchase_orders',
  'purchase_order_items',
];

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update pending changes count
  const updatePendingCount = useCallback(async () => {
    const count = await getSyncQueueCount();
    setPendingChanges(count);
  }, []);

  // Cache all data from Supabase
  const refreshCache = useCallback(async () => {
    if (!isOnline) return;

    try {
      for (const table of CACHE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          await cacheData(table, data);
        }
      }
      await setLastSync(Date.now());
      setLastSyncTime(new Date());
      console.log('Offline cache refreshed');
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  }, [isOnline]);

  // Sync pending changes to server
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const queue = await getSyncQueue();
      
      for (const item of queue) {
        try {
          const { table, operation, data } = item;
          
          switch (operation) {
            case 'INSERT':
              await (supabase.from as any)(table).insert(data);
              break;
            case 'UPDATE':
              await (supabase.from as any)(table).update(data).eq('id', data.id);
              break;
            case 'DELETE':
              await (supabase.from as any)(table).delete().eq('id', data.id);
              break;
          }
          
          if (item.id !== undefined) {
            await clearSyncQueueItem(item.id);
          }
        } catch (error) {
          console.error(`Failed to sync ${item.operation} on ${item.table}:`, error);
          // Keep in queue for retry
        }
      }

      await updatePendingCount();
      await refreshCache();
      toast.success('Changes synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync some changes');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount, refreshCache]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing changes...');
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Changes will be synced when back online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow]);

  // Initial cache refresh
  useEffect(() => {
    if (isOnline) {
      refreshCache();
    }
    updatePendingCount();
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingChanges,
        syncNow,
        refreshCache,
        lastSyncTime,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

// Helper hook for offline-first data operations
export function useOfflineData<T extends Record<string, any>>(
  table: CacheableTable,
  queryFn: () => Promise<{ data: T[] | null; error: any }>
) {
  const { isOnline } = useOffline();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from server
        const result = await queryFn();
        if (result.error) {
          throw result.error;
        }
        if (result.data) {
          setData(result.data);
          // Cache the data
          await cacheData(table, result.data);
        }
      } else {
        // Use cached data
        const cached = await getCachedData(table);
        setData(cached as T[]);
      }
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err);
      // Fallback to cache on error
      const cached = await getCachedData(table);
      setData(cached as T[]);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, table, queryFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insert = async (newData: Partial<T>) => {
    const itemWithId = {
      ...newData,
      id: (newData as any).id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as T;

    // Update local state immediately
    setData(prev => [...prev, itemWithId]);
    
    // Update cache
    await updateCachedItem(table, itemWithId);

    if (isOnline) {
      // Try to sync immediately
      const { error } = await supabase.from(table).insert(itemWithId as any);
      if (error) {
        await addToSyncQueue(table, 'INSERT', itemWithId);
      }
    } else {
      // Queue for later sync
      await addToSyncQueue(table, 'INSERT', itemWithId);
    }

    return itemWithId;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const updatedItem = {
      ...data.find(item => item.id === id),
      ...updates,
      updated_at: new Date().toISOString(),
    } as T;

    // Update local state immediately
    setData(prev => prev.map(item => item.id === id ? updatedItem : item));
    
    // Update cache
    await updateCachedItem(table, updatedItem);

    if (isOnline) {
      const { error } = await supabase.from(table).update(updates as any).eq('id', id);
      if (error) {
        await addToSyncQueue(table, 'UPDATE', updatedItem);
      }
    } else {
      await addToSyncQueue(table, 'UPDATE', updatedItem);
    }

    return updatedItem;
  };

  const remove = async (id: string) => {
    // Update local state immediately
    setData(prev => prev.filter(item => item.id !== id));
    
    // Update cache
    await deleteCachedItem(table, id);

    if (isOnline) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        await addToSyncQueue(table, 'DELETE', { id });
      }
    } else {
      await addToSyncQueue(table, 'DELETE', { id });
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    insert,
    update,
    remove,
  };
}
