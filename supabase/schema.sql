-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table to store additional user data
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet_data table to store pet state for each user
CREATE TABLE public.pet_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  happiness DECIMAL(5,2) DEFAULT 75.0 CHECK (happiness >= 0 AND happiness <= 100),
  hunger DECIMAL(5,2) DEFAULT 25.0 CHECK (hunger >= 0 AND hunger <= 100),
  cleanliness DECIMAL(5,2) DEFAULT 85.0 CHECK (cleanliness >= 0 AND cleanliness <= 100),
  energy DECIMAL(5,2) DEFAULT 80.0 CHECK (energy >= 0 AND energy <= 100),
  coins INTEGER DEFAULT 10 CHECK (coins >= 0),
  last_update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create shop_items table to store available items in the shop
CREATE TABLE public.shop_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT UNIQUE NOT NULL, -- Unique identifier for the item (e.g., 'hat', 'bow')
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'accessories', -- accessories, backgrounds, food, toys, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchased_items table to store user's purchased items
CREATE TABLE public.purchased_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT REFERENCES public.shop_items(item_id) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, item_id) -- Prevent duplicate purchases
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_pet_data_user_id ON public.pet_data(user_id);
CREATE INDEX idx_shop_items_item_id ON public.shop_items(item_id);
CREATE INDEX idx_shop_items_category ON public.shop_items(category);
CREATE INDEX idx_purchased_items_user_id ON public.purchased_items(user_id);
CREATE INDEX idx_purchased_items_item_id ON public.purchased_items(item_id);

-- Row Level Security Policies

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR TRUE);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Pet data policies
CREATE POLICY "Users can view own pet data" ON public.pet_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pet data" ON public.pet_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet data" ON public.pet_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shop items policies (everyone can view, authenticated users can insert)
CREATE POLICY "Anyone can view shop items" ON public.shop_items
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can insert shop items" ON public.shop_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Purchased items policies
CREATE POLICY "Users can view own purchased items" ON public.purchased_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchased items" ON public.purchased_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchased items" ON public.purchased_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_data_updated_at BEFORE UPDATE ON public.pet_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON public.shop_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile and pet data when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
  
  INSERT INTO public.pet_data (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile and pet data
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC to resolve email by username for username-based login
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email
  FROM public.users
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
$$;

-- Function to initialize shop items (run once to populate the shop)
CREATE OR REPLACE FUNCTION public.initialize_shop_items()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.shop_items (item_id, name, emoji, cost, description, category) VALUES
    ('hat', 'Party Hat', '🎩', 15, 'A stylish hat for your pet', 'accessories'),
    ('bow', 'Bow Tie', '🎀', 12, 'Elegant bow tie', 'accessories'),
    ('sunglasses', 'Cool Shades', '🕶️', 20, 'Super cool sunglasses', 'accessories'),
    ('background_beach', 'Beach Scene', '🏖️', 25, 'Tropical background', 'backgrounds'),
    ('crown', 'Royal Crown', '👑', 50, 'Fit for a royal pet', 'accessories'),
    ('scarf', 'Cozy Scarf', '🧣', 18, 'Warm and stylish', 'accessories'),
    ('background_space', 'Space Scene', '🚀', 30, 'Out of this world!', 'backgrounds'),
    ('background_forest', 'Forest Scene', '🌲', 22, 'Nature background', 'backgrounds')
  ON CONFLICT (item_id) DO NOTHING;
$$;

-- Function to purchase an item
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_item RECORD;
  v_current_coins INTEGER;
  v_result JSON;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Get item details
  SELECT * INTO v_item FROM public.shop_items WHERE item_id = p_item_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Check if user already owns this item
  IF EXISTS (SELECT 1 FROM public.purchased_items WHERE user_id = v_user_id AND item_id = p_item_id) THEN
    RETURN json_build_object('success', false, 'error', 'Item already owned');
  END IF;

  -- Get current coins
  SELECT coins INTO v_current_coins FROM public.pet_data WHERE user_id = v_user_id;
  
  IF v_current_coins < v_item.cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Start transaction
  BEGIN
    -- Deduct coins
    UPDATE public.pet_data 
    SET coins = coins - v_item.cost, last_update_time = NOW()
    WHERE user_id = v_user_id;
    
    -- Add purchased item
    INSERT INTO public.purchased_items (user_id, item_id)
    VALUES (v_user_id, p_item_id);
    
    -- Return success
    v_result := json_build_object(
      'success', true,
      'item', json_build_object(
        'id', v_item.item_id,
        'name', v_item.name,
        'emoji', v_item.emoji,
        'cost', v_item.cost
      ),
      'remaining_coins', v_current_coins - v_item.cost
    );
    
    RETURN v_result;
    
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Purchase failed');
  END;
END;
$$;
