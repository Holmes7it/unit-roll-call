-- Remove all public/anon access. Keep RLS enabled with no policies so only
-- service_role (used by server functions) can read or write. All app access
-- now goes through server functions that verify the admin password.

DROP POLICY IF EXISTS "public read soldiers" ON public.soldiers;
DROP POLICY IF EXISTS "public insert soldiers" ON public.soldiers;
DROP POLICY IF EXISTS "public update soldiers" ON public.soldiers;
DROP POLICY IF EXISTS "public delete soldiers" ON public.soldiers;

DROP POLICY IF EXISTS "public read platoons" ON public.platoons;
DROP POLICY IF EXISTS "public insert platoons" ON public.platoons;
DROP POLICY IF EXISTS "public update platoons" ON public.platoons;
DROP POLICY IF EXISTS "public delete platoons" ON public.platoons;

DROP POLICY IF EXISTS "public read batches" ON public.batches;
DROP POLICY IF EXISTS "public insert batches" ON public.batches;
DROP POLICY IF EXISTS "public update batches" ON public.batches;
DROP POLICY IF EXISTS "public delete batches" ON public.batches;

REVOKE ALL ON public.soldiers FROM anon, authenticated;
REVOKE ALL ON public.platoons FROM anon, authenticated;
REVOKE ALL ON public.batches  FROM anon, authenticated;

GRANT ALL ON public.soldiers TO service_role;
GRANT ALL ON public.platoons TO service_role;
GRANT ALL ON public.batches  TO service_role;

-- RLS stays enabled; no policies = no access for anon/authenticated even via Data API.
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches  ENABLE ROW LEVEL SECURITY;