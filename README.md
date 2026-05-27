# ClosetPro AI

Plataforma SaaS para que dueños de tiendas boutique y retail gestionen su inventario de forma inteligente y conversen con un copiloto de IA que conoce el estado real de su negocio en tiempo real.

## Demo

> https://closetpro-ai.vercel.app/

## Problema

Las tiendas boutique y retail pequeñas no tienen visibilidad clara de su inventario en tiempo real: no saben cuándo reponer stock, cuáles productos generan más ingresos ni cómo analizar su comportamiento de ventas. ClosetPro AI resuelve esto con un panel centralizado y un asistente de IA que responde preguntas concretas sobre el negocio sin necesidad de exportar Excel ni hacer cálculos manuales.

## Features

- Gestión CRUD completa del catálogo de productos (añadir, editar, eliminar, registrar ventas)
- Dashboard con estadísticas clave e indicadores en tiempo real
- Analíticas avanzadas con gráficos de ventas, stock por categoría y comportamiento financiero
- Alertas automáticas de stock crítico con notificaciones persistentes
- Copiloto de IA (Gemini 1.5 Flash) que responde preguntas en lenguaje natural sobre inventario y ventas
- Motor de fallback conversacional que funciona sin clave API
- Arquitectura Multi-Tenant con aislamiento de datos por usuario (RLS)

## Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 + Recharts + Framer Motion + Lucide React
- **Backend / DB**: Supabase (PostgreSQL) con Row Level Security (RLS)
- **IA**: Gemini 1.5 Flash vía `@google/generative-ai` + motor de fallback basado en reglas
- **Deploy**: Vercel

## Cómo correr local

1. Clonar el repositorio
   ```bash
   git clone https://github.com/CristianBahamon7694/closetpro-ai.git
   cd closetpro-ai
   ```
2. Instalar dependencias
   ```bash
   npm install
   ```
3. Configurar variables de entorno — crea un archivo `.env` en la raíz:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   VITE_GEMINI_API_KEY=tu_api_key_de_gemini  # opcional, hay fallback sin esto
   ```
4. Correr en modo desarrollo
   ```bash
   npm run dev
   ```

## Roadmap

- Exportación de reportes en PDF y Excel
- App mobile nativa (React Native)
- Integración con pasarelas de pago para registrar ventas automáticamente
- Soporte multi-tienda (un usuario, varias sucursales)
- Historial de conversaciones con el copiloto de IA