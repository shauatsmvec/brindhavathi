import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDBSchema extends DBSchema {
  products: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  categories: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  customers: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  suppliers: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  invoices: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  invoice_items: {
    key: string;
    value: Record<string, any>;
  };
  expenses: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  expense_categories: {
    key: string;
    value: Record<string, any>;
  };
  purchase_orders: {
    key: string;
    value: Record<string, any>;
    indexes: { 'by-updated': string };
  };
  purchase_order_items: {
    key: string;
    value: Record<string, any>;
  };
  sync_queue: {
    key: number;
    value: {
      id?: number;
      table: string;
      operation: 'INSERT' | 'UPDATE' | 'DELETE';
      data: Record<string, any>;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  meta: {
    key: string;
    value: {
      key: string;
      lastSync: number;
      isOnline: boolean;
    };
  };
}

type CacheableTable = 'products' | 'categories' | 'customers' | 'suppliers' | 'invoices' | 'invoice_items' | 'expenses' | 'expense_categories' | 'purchase_orders' | 'purchase_order_items';

const DB_NAME = 'brindhavathi-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null;

export const getOfflineDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const store = db.createObjectStore('categories', { keyPath: 'id' });
          store.createIndex('by-updated', 'created_at');
        }

        // Customers store
        if (!db.objectStoreNames.contains('customers')) {
          const store = db.createObjectStore('customers', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Suppliers store
        if (!db.objectStoreNames.contains('suppliers')) {
          const store = db.createObjectStore('suppliers', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Invoices store
        if (!db.objectStoreNames.contains('invoices')) {
          const store = db.createObjectStore('invoices', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Invoice items store
        if (!db.objectStoreNames.contains('invoice_items')) {
          db.createObjectStore('invoice_items', { keyPath: 'id' });
        }

        // Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Expense categories store
        if (!db.objectStoreNames.contains('expense_categories')) {
          db.createObjectStore('expense_categories', { keyPath: 'id' });
        }

        // Purchase orders store
        if (!db.objectStoreNames.contains('purchase_orders')) {
          const store = db.createObjectStore('purchase_orders', { keyPath: 'id' });
          store.createIndex('by-updated', 'updated_at');
        }

        // Purchase order items store
        if (!db.objectStoreNames.contains('purchase_order_items')) {
          db.createObjectStore('purchase_order_items', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const store = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-timestamp', 'timestamp');
        }

        // Meta store
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

// Generic cache operations
export const cacheData = async (
  table: CacheableTable,
  data: Record<string, any>[]
) => {
  const db = await getOfflineDB();
  const tx = db.transaction(table, 'readwrite');
  const store = tx.objectStore(table);
  
  // Clear existing data and add new
  await store.clear();
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
};

export const getCachedData = async (
  table: CacheableTable
): Promise<Record<string, any>[]> => {
  const db = await getOfflineDB();
  return db.getAll(table);
};

export const getCachedItem = async (
  table: CacheableTable,
  id: string
): Promise<Record<string, any> | undefined> => {
  const db = await getOfflineDB();
  return db.get(table, id);
};

export const updateCachedItem = async (
  table: CacheableTable,
  data: Record<string, any>
) => {
  const db = await getOfflineDB();
  await db.put(table, data);
};

export const deleteCachedItem = async (
  table: CacheableTable,
  id: string
) => {
  const db = await getOfflineDB();
  await db.delete(table, id);
};

// Sync queue operations
export const addToSyncQueue = async (
  table: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data: Record<string, any>
) => {
  const db = await getOfflineDB();
  await db.add('sync_queue', {
    table,
    operation,
    data,
    timestamp: Date.now(),
  });
};

export const getSyncQueue = async () => {
  const db = await getOfflineDB();
  return db.getAllFromIndex('sync_queue', 'by-timestamp');
};

export const clearSyncQueueItem = async (id: number) => {
  const db = await getOfflineDB();
  await db.delete('sync_queue', id);
};

export const clearAllSyncQueue = async () => {
  const db = await getOfflineDB();
  await db.clear('sync_queue');
};

export const getSyncQueueCount = async () => {
  const db = await getOfflineDB();
  return db.count('sync_queue');
};

// Meta operations
export const setLastSync = async (timestamp: number) => {
  const db = await getOfflineDB();
  await db.put('meta', { key: 'sync', lastSync: timestamp, isOnline: true });
};

export const getLastSync = async () => {
  const db = await getOfflineDB();
  const meta = await db.get('meta', 'sync');
  return meta?.lastSync || 0;
};
