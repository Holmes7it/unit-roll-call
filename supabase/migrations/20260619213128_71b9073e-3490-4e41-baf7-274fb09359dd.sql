
CREATE TABLE public.soldiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_number TEXT NOT NULL,
  rank TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  nationality TEXT NOT NULL DEFAULT '',
  unit_name TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  date_enlisted TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  blood_type TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  next_of_kin_name TEXT NOT NULL DEFAULT '',
  next_of_kin_phone TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT 'Unassigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soldiers TO anon, authenticated;
GRANT ALL ON public.soldiers TO service_role;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read soldiers" ON public.soldiers FOR SELECT USING (true);
CREATE POLICY "public insert soldiers" ON public.soldiers FOR INSERT WITH CHECK (true);
CREATE POLICY "public update soldiers" ON public.soldiers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete soldiers" ON public.soldiers FOR DELETE USING (true);

CREATE TABLE public.platoons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platoons TO anon, authenticated;
GRANT ALL ON public.platoons TO service_role;
ALTER TABLE public.platoons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read platoons" ON public.platoons FOR SELECT USING (true);
CREATE POLICY "public insert platoons" ON public.platoons FOR INSERT WITH CHECK (true);
CREATE POLICY "public update platoons" ON public.platoons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete platoons" ON public.platoons FOR DELETE USING (true);

CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batches TO anon, authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "public insert batches" ON public.batches FOR INSERT WITH CHECK (true);
CREATE POLICY "public update batches" ON public.batches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete batches" ON public.batches FOR DELETE USING (true);

INSERT INTO public.platoons (name) VALUES ('Alpha'), ('Bravo'), ('Charlie'), ('Delta');
INSERT INTO public.batches (name, code, is_active) VALUES
  ('Intake 2026-Alpha', 'M4-26A', true),
  ('Task Force Echo', 'TF-ECHO', true);

INSERT INTO public.soldiers (service_number, rank, last_name, first_name, date_of_birth, gender, nationality, unit_name, unit, role, date_enlisted, status, blood_type, contact_phone, next_of_kin_name, next_of_kin_phone, notes, batch) VALUES
('GH-2018-001','Sergeant','Mensah','Kwame','1990-04-12','Male','Ghanaian','4 Infantry Battalion','Alpha','Squad Leader','2010-06-01','Active','O+','+233 20 111 0001','Abena Mensah','+233 24 111 0001','Marksmanship instructor.','M4-26A'),
('GH-2019-014','Corporal','Boateng','Yaw','1993-09-22','Male','Ghanaian','4 Infantry Battalion','Alpha','Rifleman','2015-03-15','Deployed','A+','+233 20 111 0002','Akua Boateng','+233 24 111 0002','','M4-26A'),
('GH-2021-077','Private','Asante','Ama','1998-01-30','Female','Ghanaian','4 Infantry Battalion','Alpha','Medic','2021-07-10','On Leave','B+','+233 20 111 0003','Kojo Asante','+233 24 111 0003','Field medic certified.','M4-26A'),
('GH-2017-045','Lieutenant','Owusu','Kofi','1988-11-05','Male','Ghanaian','4 Infantry Battalion','Bravo','Platoon Commander','2009-01-20','Active','AB+','+233 20 111 0004','Esi Owusu','+233 24 111 0004','','TF-ECHO'),
('GH-2020-032','Lance Corporal','Darko','Akosua','1996-06-18','Female','Ghanaian','4 Infantry Battalion','Bravo','Signaller','2018-09-12','Deployed','O-','+233 20 111 0005','Yaa Darko','+233 24 111 0005','','TF-ECHO'),
('GH-2015-009','Staff Sergeant','Adjei','Kwesi','1985-02-14','Male','Ghanaian','4 Infantry Battalion','Bravo','Quartermaster','2005-08-01','Discharged','A-','+233 20 111 0006','Adwoa Adjei','+233 24 111 0006','Honorably discharged 2023.','Unassigned'),
('GH-2016-022','Corporal','Acheampong','Nana','1991-12-03','Male','Ghanaian','4 Infantry Battalion','Charlie','Machine Gunner','2012-05-22','Active','B-','+233 20 111 0007','Efua Acheampong','+233 24 111 0007','','M4-26A'),
('GH-2014-003','Sergeant','Osei','Kwabena','1983-07-19','Male','Ghanaian','4 Infantry Battalion','Charlie','Sniper','2004-04-10','Deceased','O+','+233 20 111 0008','Afia Osei','+233 24 111 0008','KIA — honored in memoriam.','Unassigned');
