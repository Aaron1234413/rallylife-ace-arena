-- Create merchandise orders table
CREATE TABLE public.merchandise_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_price_usd NUMERIC NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cash_amount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  
  -- Shipping address
  shipping_name TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',
  
  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  -- Order tracking
  supplier_order_id TEXT,
  tracking_number TEXT,
  estimated_delivery DATE,
  
  -- Metadata
  order_metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchandise_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.merchandise_orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" 
ON public.merchandise_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- System can update orders (for status updates)
CREATE POLICY "System can update orders" 
ON public.merchandise_orders 
FOR UPDATE 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_merchandise_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_merchandise_orders_updated_at
BEFORE UPDATE ON public.merchandise_orders
FOR EACH ROW
EXECUTE FUNCTION update_merchandise_orders_updated_at();