
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.task_platform AS ENUM ('facebook','instagram','tiktok','youtube','x');
CREATE TYPE public.task_type AS ENUM ('like','follow','subscribe','share','comment');
CREATE TYPE public.submission_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.withdrawal_status AS ENUM ('pending','approved','rejected','paid');
CREATE TYPE public.withdrawal_method AS ENUM ('bank','opay','palmpay','kuda');
CREATE TYPE public.ledger_source AS ENUM ('task','referral','withdrawal','bonus','adjustment');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text,'-',''),1,8)),
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform task_platform NOT NULL,
  task_type task_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  reward_naira NUMERIC(12,2) NOT NULL CHECK (reward_naira >= 0),
  slots_total INT NOT NULL DEFAULT 100,
  slots_filled INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_url TEXT,
  screenshot_url TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Earnings ledger
CREATE TABLE public.earnings_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_naira NUMERIC(12,2) NOT NULL,
  source ledger_source NOT NULL,
  ref_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.earnings_ledger TO authenticated;
GRANT ALL ON public.earnings_ledger TO service_role;
ALTER TABLE public.earnings_ledger ENABLE ROW LEVEL SECURITY;

-- Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referee_id)
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Withdrawals
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_naira NUMERIC(12,2) NOT NULL CHECK (amount_naira > 0),
  method withdrawal_method NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Settings
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.settings(key,value) VALUES
  ('signup_bonus','200'::jsonb),
  ('referral_bonus','300'::jsonb),
  ('min_withdrawal','1500'::jsonb);

-- Policies
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_select_self_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "tasks_select_active_or_admin" ON public.tasks FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "tasks_admin_all" ON public.tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "submissions_select_own_or_admin" ON public.submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions_admin_update" ON public.submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "ledger_select_own_or_admin" ON public.earnings_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "referrals_select_involved_or_admin" ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referee_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "withdrawals_select_own_or_admin" ON public.withdrawals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "withdrawals_insert_own" ON public.withdrawals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "withdrawals_admin_update" ON public.withdrawals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "settings_select_all_auth" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger: create profile on signup + credit referrer if referral code provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  referrer UUID;
  bonus NUMERIC;
BEGIN
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  IF ref_code IS NOT NULL AND ref_code <> '' THEN
    SELECT id INTO referrer FROM public.profiles WHERE referral_code = upper(ref_code) LIMIT 1;
  END IF;

  INSERT INTO public.profiles(id, full_name, username, phone, referred_by)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone',
    referrer
  );

  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF referrer IS NOT NULL THEN
    SELECT (value)::text::numeric INTO bonus FROM public.settings WHERE key='referral_bonus';
    INSERT INTO public.referrals(referrer_id, referee_id, bonus_paid) VALUES (referrer, NEW.id, COALESCE(bonus,0));
    IF COALESCE(bonus,0) > 0 THEN
      INSERT INTO public.earnings_ledger(user_id, amount_naira, source, ref_id, note)
        VALUES (referrer, bonus, 'referral', NEW.id, 'Referral bonus');
      INSERT INTO public.notifications(user_id, title, body)
        VALUES (referrer, 'Referral bonus credited', 'You earned ₦'||bonus||' from a new referral.');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tasks_touch BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Helpful indexes
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_ledger_user ON public.earnings_ledger(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_tasks_active ON public.tasks(active, platform);
