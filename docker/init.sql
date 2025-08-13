DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'todo_user') THEN

      CREATE ROLE todo_user LOGIN PASSWORD 'todo_password_123';
   END IF;
END
$do$;

GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  category TEXT CHECK (category IN ('work', 'personal', 'shopping', 'health', 'other')) NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT ALL PRIVILEGES ON TABLE todos TO todo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todo_user;

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
