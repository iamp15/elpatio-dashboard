# Dashboard de Administración - El Patio

Dashboard web para administradores del sistema El Patio, desarrollado con React y Vite.

## Características

- ✅ Autenticación de administradores
- ✅ Dashboard con estadísticas del sistema
- ✅ Monitoreo en tiempo real (WebSocket)
- ✅ Gestión de transacciones
- ✅ Configuración del sistema
- ✅ Diseño responsive

## Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_BASE_URL=http://localhost:3000
```

## Desarrollo

Ejecutar servidor de desarrollo:
```bash
npm run dev
```

El dashboard estará disponible en `http://localhost:5174`

## Build

Generar build de producción:
```bash
npm run build
```

El contenido estará en la carpeta `dist/`

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Layout principal
│   └── ui/             # Componentes UI básicos
├── pages/              # Páginas principales
├── services/           # Servicios (API, WebSocket, Auth)
├── styles/             # Estilos globales
└── main.jsx           # Punto de entrada
```

## Endpoints Utilizados

- `POST /api/admin/login` - Autenticación
- `GET /api/admin/stats` - Estadísticas globales
- `GET /api/admin/connection-stats` - Estadísticas de conexiones
- `GET /api/transacciones/admin/todas` - Listar transacciones
- `GET /api/transacciones/admin/en-curso` - Transacciones en curso
- Y más...

Ver `docs/ENDPOINTS_DASHBOARD_CREADOS.md` para la lista completa.

## Versionado

Este proyecto inicia en la versión `0.0.0` y se versiona independientemente.
