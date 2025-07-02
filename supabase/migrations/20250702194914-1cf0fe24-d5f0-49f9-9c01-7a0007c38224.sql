-- Add missing foreign key constraint for session_participants -> profiles
ALTER TABLE public.session_participants 
ADD CONSTRAINT session_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Add missing foreign key constraint for sessions -> profiles  
ALTER TABLE public.sessions
ADD CONSTRAINT sessions_creator_id_fkey
FOREIGN KEY (creator_id) REFERENCES public.profiles(id);