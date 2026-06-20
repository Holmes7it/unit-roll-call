CREATE POLICY "No direct soldier reads" ON public.soldiers FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No direct soldier inserts" ON public.soldiers FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No direct soldier updates" ON public.soldiers FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct soldier deletes" ON public.soldiers FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No direct unit reads" ON public.platoons FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No direct unit inserts" ON public.platoons FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No direct unit updates" ON public.platoons FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct unit deletes" ON public.platoons FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No direct batch reads" ON public.batches FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No direct batch inserts" ON public.batches FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No direct batch updates" ON public.batches FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct batch deletes" ON public.batches FOR DELETE TO anon, authenticated USING (false);