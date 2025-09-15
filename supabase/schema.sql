-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table to store additional user data
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_pet_data_user_id ON public.pet_data(user_id);

-- Row Level Security Policies

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

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

-- Function to create user profile and pet data when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  
  INSERT INTO public.pet_data (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile and pet data
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
