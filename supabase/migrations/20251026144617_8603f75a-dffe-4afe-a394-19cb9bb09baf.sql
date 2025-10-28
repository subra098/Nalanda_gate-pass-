-- Allow security guards to delete gate logs
CREATE POLICY "Security guards can delete logs"
ON gate_logs
FOR DELETE
USING (has_role(auth.uid(), 'security_guard'::app_role));