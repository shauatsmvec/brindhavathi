-- Fix RLS policies for all business tables
-- All tables should only be accessible by authenticated users

-- 1. Drop existing permissive policies and create proper ones for SUPPLIERS
DROP POLICY IF EXISTS "Allow public read access" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public insert access" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public update access" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public delete access" ON public.suppliers;

CREATE POLICY "Authenticated users can view suppliers"
ON public.suppliers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert suppliers"
ON public.suppliers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suppliers"
ON public.suppliers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete suppliers"
ON public.suppliers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix INVOICES table
DROP POLICY IF EXISTS "Allow public read access" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert access" ON public.invoices;
DROP POLICY IF EXISTS "Allow public update access" ON public.invoices;
DROP POLICY IF EXISTS "Allow public delete access" ON public.invoices;

CREATE POLICY "Authenticated users can view invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix PURCHASE_ORDERS table
DROP POLICY IF EXISTS "Allow public read access" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow public insert access" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow public update access" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow public delete access" ON public.purchase_orders;

CREATE POLICY "Authenticated users can view purchase orders"
ON public.purchase_orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert purchase orders"
ON public.purchase_orders FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update purchase orders"
ON public.purchase_orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete purchase orders"
ON public.purchase_orders FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix EXPENSES table
DROP POLICY IF EXISTS "Allow public read access" ON public.expenses;
DROP POLICY IF EXISTS "Allow public insert access" ON public.expenses;
DROP POLICY IF EXISTS "Allow public update access" ON public.expenses;
DROP POLICY IF EXISTS "Allow public delete access" ON public.expenses;

CREATE POLICY "Authenticated users can view expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expenses"
ON public.expenses FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix PRODUCTS table
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow public update access" ON public.products;
DROP POLICY IF EXISTS "Allow public delete access" ON public.products;

CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Fix INVOICE_ITEMS table
DROP POLICY IF EXISTS "Allow public read access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public insert access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public update access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public delete access" ON public.invoice_items;

CREATE POLICY "Authenticated users can view invoice items"
ON public.invoice_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert invoice items"
ON public.invoice_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice items"
ON public.invoice_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete invoice items"
ON public.invoice_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Fix PURCHASE_ORDER_ITEMS table
DROP POLICY IF EXISTS "Allow public read access" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow public insert access" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow public update access" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow public delete access" ON public.purchase_order_items;

CREATE POLICY "Authenticated users can view purchase order items"
ON public.purchase_order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert purchase order items"
ON public.purchase_order_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update purchase order items"
ON public.purchase_order_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete purchase order items"
ON public.purchase_order_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Fix CUSTOMERS table
DROP POLICY IF EXISTS "Allow public read access" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert access" ON public.customers;
DROP POLICY IF EXISTS "Allow public update access" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete access" ON public.customers;

CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert customers"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
ON public.customers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Fix CATEGORIES table
DROP POLICY IF EXISTS "Allow public read access" ON public.categories;
DROP POLICY IF EXISTS "Allow public insert access" ON public.categories;
DROP POLICY IF EXISTS "Allow public update access" ON public.categories;
DROP POLICY IF EXISTS "Allow public delete access" ON public.categories;

CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON public.categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Fix EXPENSE_CATEGORIES table
DROP POLICY IF EXISTS "Allow public read access" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow public insert access" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow public update access" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow public delete access" ON public.expense_categories;

CREATE POLICY "Authenticated users can view expense categories"
ON public.expense_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert expense categories"
ON public.expense_categories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expense categories"
ON public.expense_categories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expense categories"
ON public.expense_categories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));