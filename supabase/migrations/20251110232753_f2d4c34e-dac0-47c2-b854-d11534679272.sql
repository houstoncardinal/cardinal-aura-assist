-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.organization_id = organizations.id
      AND user_roles.user_id = auth.uid()
    )
  );

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces in their organizations"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.organization_id = workspaces.organization_id
      AND user_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces in their organizations"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.organization_id = workspaces.organization_id
      AND user_roles.user_id = auth.uid()
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations in their workspaces"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.user_roles ur ON ur.organization_id = w.organization_id
      WHERE w.id = conversations.workspace_id
      AND ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations in their workspaces"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.user_roles ur ON ur.organization_id = w.organization_id
      WHERE w.id = conversations.workspace_id
      AND ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.workspaces w ON w.id = c.workspace_id
      JOIN public.user_roles ur ON ur.organization_id = w.organization_id
      WHERE c.id = messages.conversation_id
      AND ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.workspaces w ON w.id = c.workspace_id
      JOIN public.user_roles ur ON ur.organization_id = w.organization_id
      WHERE c.id = messages.conversation_id
      AND ur.user_id = auth.uid()
    )
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_workspaces_org ON public.workspaces(organization_id);
CREATE INDEX idx_conversations_workspace ON public.conversations(workspace_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();