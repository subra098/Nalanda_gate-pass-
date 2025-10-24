-- Drop the overly restrictive "Only superintendents can manage roles" policy
DROP POLICY IF EXISTS "Only superintendents can manage roles" ON user_roles;

-- Create specific policies for each operation
CREATE POLICY "Users can insert their own role on signup"
ON user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only superintendents can update roles"
ON user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'superintendent'));

CREATE POLICY "Only superintendents can delete roles"
ON user_roles
FOR DELETE
USING (has_role(auth.uid(), 'superintendent'));