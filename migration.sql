-- ====================================================================
-- ClosetPro AI - Multi-Tenant SaaS Database Migration
-- ====================================================================
-- INSTRUCCIONES:
-- Ejecuta este script en el editor de SQL de tu consola de Supabase.
-- ====================================================================

-- 1. Agregar la columna user_id que apunta al usuario autenticado (auth.users)
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Establecer el valor por defecto de user_id como auth.uid() para mayor comodidad
ALTER TABLE productos 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas previas si existen para evitar conflictos en reinicios de esquema
DROP POLICY IF EXISTS "Users can view their own products" ON productos;
DROP POLICY IF EXISTS "Users can create their own products" ON productos;
DROP POLICY IF EXISTS "Users can update their own products" ON productos;
DROP POLICY IF EXISTS "Users can delete their own products" ON productos;

-- 5. Crear la política de LECTURA (SELECT): Un usuario solo puede ver sus propios productos
CREATE POLICY "Users can view their own products" ON productos
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 6. Crear la política de INSERCIÓN (INSERT): Un usuario solo puede registrar productos con su user_id
CREATE POLICY "Users can create their own products" ON productos
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. Crear la política de ACTUALIZACIÓN (UPDATE): Un usuario solo puede modificar sus propios productos
CREATE POLICY "Users can update their own products" ON productos
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Crear la política de ELIMINACIÓN (DELETE): Un usuario solo puede borrar sus propios productos
CREATE POLICY "Users can delete their own products" ON productos
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ====================================================================
-- 9. Crear la tabla de notificaciones (notifications)
-- ====================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  product_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'low_stock',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 11. Eliminar políticas previas si existen
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- 12. Crear las políticas de seguridad Multi-Tenant
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" ON notifications
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- ¡Migración completada con éxito!
-- ====================================================================
