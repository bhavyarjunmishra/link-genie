CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  referrer TEXT,
  device TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX links_user_id_idx ON public.links(user_id);
CREATE INDEX clicks_link_id_idx ON public.clicks(link_id);
CREATE INDEX clicks_created_at_idx ON public.clicks(created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT SELECT ON public.links TO anon;
GRANT ALL ON public.links TO service_role;
GRANT SELECT, INSERT ON public.clicks TO authenticated;
GRANT INSERT ON public.clicks TO anon;
GRANT ALL ON public.clicks TO service_role;

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can resolve active links" ON public.links FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Owners can view their links" ON public.links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can create links" ON public.links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their links" ON public.links FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete their links" ON public.links FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can record a click" ON public.clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners can view clicks on their links" ON public.clicks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.links l WHERE l.id = clicks.link_id AND l.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER links_set_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();