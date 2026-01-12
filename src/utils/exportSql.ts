import { supabase } from "@/integrations/supabase/client";

// Helper to escape SQL string values
const escapeSqlValue = (value: unknown): string => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  // For objects/arrays, serialize to JSON
  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
};

// Generate UPSERT statements for a table (INSERT ... ON CONFLICT UPDATE)
const generateUpserts = (tableName: string, rows: Record<string, unknown>[], primaryKey: string = "id"): string => {
  if (!rows || rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  const updateColumns = columns.filter(col => col !== primaryKey);
  
  const lines: string[] = [
    `-- Table: ${tableName}`,
    `-- Records: ${rows.length}`,
    ""
  ];

  for (const row of rows) {
    const values = columns.map((col) => escapeSqlValue(row[col]));
    const updateSet = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(", ");
    
    lines.push(
      `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT (${primaryKey}) DO UPDATE SET ${updateSet};`
    );
  }

  lines.push("");
  return lines.join("\n");
};

export const exportDatabaseAsSql = async (): Promise<string> => {
  // Fetch all tables data in parallel
  const [
    categoriesRes,
    expenseCategoriesRes,
    customersRes,
    suppliersRes,
    productsRes,
    invoicesRes,
    invoiceItemsRes,
    expensesRes,
    purchaseOrdersRes,
    purchaseOrderItemsRes,
    storeSettingsRes,
  ] = await Promise.all([
    supabase.from("categories").select("*"),
    supabase.from("expense_categories").select("*"),
    supabase.from("customers").select("*"),
    supabase.from("suppliers").select("*"),
    supabase.from("products").select("*"),
    supabase.from("invoices").select("*"),
    supabase.from("invoice_items").select("*"),
    supabase.from("expenses").select("*"),
    supabase.from("purchase_orders").select("*"),
    supabase.from("purchase_order_items").select("*"),
    supabase.from("store_settings").select("*"),
  ]);

  const header = `-- ============================================
-- E-Trends Explorer Database Export
-- Generated: ${new Date().toISOString()}
-- ============================================
--
-- This file contains UPSERT statements for all data.
-- Records are inserted if new, or updated if they already exist.
-- Safe to run multiple times - NO DUPLICATES will be created.
--
-- IMPORTANT: Make sure your target database has the same schema
-- You can use the database_full_migration.sql file for the schema.
-- ============================================

-- Disable foreign key checks during import (PostgreSQL)
SET session_replication_role = replica;

`;

  const footer = `
-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- ============================================
-- Export Complete - Safe to run multiple times
-- ============================================
`;

  // Generate SQL in correct order (parent tables first due to foreign keys)
  const sql = [
    header,
    generateUpserts("categories", categoriesRes.data || []),
    generateUpserts("expense_categories", expenseCategoriesRes.data || []),
    generateUpserts("customers", customersRes.data || []),
    generateUpserts("suppliers", suppliersRes.data || []),
    generateUpserts("products", productsRes.data || []),
    generateUpserts("invoices", invoicesRes.data || []),
    generateUpserts("invoice_items", invoiceItemsRes.data || []),
    generateUpserts("expenses", expensesRes.data || []),
    generateUpserts("purchase_orders", purchaseOrdersRes.data || []),
    generateUpserts("purchase_order_items", purchaseOrderItemsRes.data || []),
    generateUpserts("store_settings", storeSettingsRes.data || []),
    footer,
  ].join("\n");

  return sql;
};

export const downloadSqlExport = async (): Promise<void> => {
  const sql = await exportDatabaseAsSql();
  const blob = new Blob([sql], { type: "text/sql" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `e-trends-data-export-${new Date().toISOString().split("T")[0]}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
