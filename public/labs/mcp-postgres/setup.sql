-- Run only in a NEW disposable lab database as its owner, never a production project.
BEGIN;
CREATE TABLE public.lab_products (
  id integer PRIMARY KEY,
  name text NOT NULL CHECK (length(name) <= 100),
  category text NOT NULL CHECK (length(category) <= 50),
  price_cents integer NOT NULL CHECK (price_cents >= 0)
);
INSERT INTO public.lab_products VALUES
  (1, 'Blue notebook', 'stationery', 500),
  (2, 'Green pencil', 'stationery', 100),
  (3, 'Travel mug', 'kitchen', 1500);
-- Provision a login password separately with your database's secret-management workflow.
CREATE ROLE lab_reader LOGIN;
GRANT USAGE ON SCHEMA public TO lab_reader;
GRANT SELECT ON public.lab_products TO lab_reader;
ALTER ROLE lab_reader SET default_transaction_read_only = on;
COMMIT;
