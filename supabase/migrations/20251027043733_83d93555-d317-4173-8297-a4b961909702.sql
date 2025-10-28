-- Allow security guards to view all profiles
CREATE POLICY "Security guards can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'security_guard'::app_role));