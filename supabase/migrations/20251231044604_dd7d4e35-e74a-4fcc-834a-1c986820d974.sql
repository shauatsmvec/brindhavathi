-- Add additional security question columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS security_question_2 text,
ADD COLUMN IF NOT EXISTS security_answer_2 text,
ADD COLUMN IF NOT EXISTS security_question_3 text,
ADD COLUMN IF NOT EXISTS security_answer_3 text;

-- Create store_settings table for admin settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'E-Trends Explorer',
  store_email text,
  store_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage store settings
CREATE POLICY "Admins can manage store settings" ON public.store_settings
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  low_stock_alerts boolean NOT NULL DEFAULT true,
  new_order_notifications boolean NOT NULL DEFAULT true,
  payment_confirmations boolean NOT NULL DEFAULT true,
  daily_summary_reports boolean NOT NULL DEFAULT false,
  weekly_analytics_digest boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- Update the verify_security_answer function to support multiple questions
CREATE OR REPLACE FUNCTION public.verify_security_answers(
  user_email text, 
  answer_1 text, 
  answer_2 text DEFAULT NULL, 
  answer_3 text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  correct_count integer := 0;
  required_count integer := 0;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check question 1
  IF profile_record.security_question IS NOT NULL THEN
    required_count := required_count + 1;
    IF LOWER(profile_record.security_answer) = LOWER(answer_1) THEN
      correct_count := correct_count + 1;
    END IF;
  END IF;
  
  -- Check question 2
  IF profile_record.security_question_2 IS NOT NULL AND answer_2 IS NOT NULL THEN
    required_count := required_count + 1;
    IF LOWER(profile_record.security_answer_2) = LOWER(answer_2) THEN
      correct_count := correct_count + 1;
    END IF;
  END IF;
  
  -- Check question 3
  IF profile_record.security_question_3 IS NOT NULL AND answer_3 IS NOT NULL THEN
    required_count := required_count + 1;
    IF LOWER(profile_record.security_answer_3) = LOWER(answer_3) THEN
      correct_count := correct_count + 1;
    END IF;
  END IF;
  
  -- All answers must be correct
  RETURN correct_count = required_count AND required_count > 0;
END;
$$;

-- Get all security questions for a user
CREATE OR REPLACE FUNCTION public.get_security_questions(user_email text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT security_question, security_question_2, security_question_3 
  INTO profile_record 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN json_build_object(
    'question_1', profile_record.security_question,
    'question_2', profile_record.security_question_2,
    'question_3', profile_record.security_question_3
  );
END;
$$;

-- Update handle_new_user to store multiple security questions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    security_question, 
    security_answer,
    security_question_2,
    security_answer_2,
    security_question_3,
    security_answer_3
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'security_question',
    NEW.raw_user_meta_data ->> 'security_answer',
    NEW.raw_user_meta_data ->> 'security_question_2',
    NEW.raw_user_meta_data ->> 'security_answer_2',
    NEW.raw_user_meta_data ->> 'security_question_3',
    NEW.raw_user_meta_data ->> 'security_answer_3'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();