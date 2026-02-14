# Plan de Mejoras de Negocio - API Pacífico

Documentación de las 6 fases de mejoras para el sistema POS.

---

## Estado General

| Fase | Funcionalidad | Estado | Tiempo Est. |
|------|---------------|--------|-------------|
| 1 | Unidades de Medida | ✅ Completada | 2-3 días |
| 2 | Gestión de Caja/Arqueo | ✅ Completada | 3-4 días |
| 3 | Devoluciones Parciales | ✅ Completada | 2-3 días |
| 4 | Reportes y Analytics | ⏳ Pendiente | 3-4 días |
| 5 | Alertas de Stock Bajo | ⏳ Pendiente | 1-2 días |
| 6 | Exportación PDF/Excel | ⏳ Pendiente | 2-3 días |

**Tiempo total estimado:** 13-19 días

---

## Fase 1: Unidades de Medida ✅

### Descripción
Soporte para diferentes unidades de medida (kg, litros, unidades, metros) permitiendo ventas por peso/volumen.

### Cambios Realizados
- Nueva entidad `UnidadMedida` con tipos: unidad, peso, volumen, longitud
- Campos `stock`, `stockMinimo`, `cantidad` cambiados de `int` a `decimal(10,3)`
- Nuevo módulo CRUD completo en `/unidades-medida`

### Endpoints Disponibles
```
POST   /unidades-medida          - Crear unidad
GET    /unidades-medida          - Listar con paginación
GET    /unidades-medida/activas  - Listar solo activas
GET    /unidades-medida/:id      - Obtener por ID
PATCH  /unidades-medida/:id      - Actualizar
DELETE /unidades-medida/:id      - Eliminar
POST   /unidades-medida/seed     - Crear unidades básicas (kg, g, l, ml, etc.)
```

### Migración
```bash
# Ya ejecutada
npm run migration:run
```

---

## Fase 2: Gestión de Caja/Arqueo ✅

### Descripción
Control de efectivo por turno con apertura, cierre y arqueo de caja.

### Cambios Realizados
- Nueva entidad `Caja` con estados: abierta, cerrada
- Nueva entidad `MovimientoCaja` con tipos: venta, devolucion, retiro, deposito
- Nuevo módulo CRUD completo en `/caja`
- Migración `1771047400000-AddCajaArqueo.ts` creada

### Endpoints Disponibles
```
POST   /caja/abrir           - Apertura con monto inicial
POST   /caja/cerrar          - Cierre con arqueo
GET    /caja/actual          - Estado de caja abierta del usuario
POST   /caja/movimiento      - Registrar retiro/depósito manual
GET    /caja/historial       - Historial de cajas cerradas
GET    /caja/:id/movimientos - Movimientos de una caja específica
GET    /caja/:id             - Obtener caja por ID
```

### Migración
```bash
# Ejecutar migración
npm run migration:run
```

### Entidades Creadas

#### `Caja`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| usuarioId | uuid | Usuario que abrió la caja |
| fechaApertura | timestamp | Fecha/hora de apertura |
| fechaCierre | timestamp | Fecha/hora de cierre (null si está abierta) |
| montoInicial | decimal(10,2) | Monto con el que se abre |
| montoFinal | decimal(10,2) | Monto al cerrar (conteo real) |
| montoEsperado | decimal(10,2) | Monto calculado por el sistema |
| diferencia | decimal(10,2) | Diferencia (faltante/sobrante) |
| estado | varchar | 'abierta', 'cerrada' |
| observaciones | text | Notas del arqueo |

#### `MovimientoCaja`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| cajaId | uuid | Caja asociada |
| tipo | varchar | 'venta', 'devolucion', 'retiro', 'deposito' |
| monto | decimal(10,2) | Monto del movimiento |
| concepto | varchar | Descripción del movimiento |
| referenciaId | uuid | ID de venta/devolución relacionada |
| usuarioId | uuid | Usuario que realizó el movimiento |
| fecha | timestamp | Fecha del movimiento |

### Reglas de Negocio Implementadas
- Solo puede haber una caja abierta por usuario a la vez
- Las ventas deben registrar automáticamente un movimiento de tipo 'venta'
- Al cerrar, calcular diferencia entre monto esperado y monto real
- Validar que exista caja abierta antes de permitir ventas (configurable)

---

## Fase 3: Devoluciones Parciales ✅

### Descripción
Flujo de devolución de productos que permite devolver parcialmente una venta.

### Cambios Realizados
- Nuevas entidades `Devolucion` y `DetalleDevolucion`
- Nuevo módulo CRUD completo en `/devoluciones`
- Lógica de negocio para validación de stock y cantidades
- Integración automática con Inventario (retorno de stock)
- Integración automática con Caja (registro de egreso de dinero)
- Migración `AddDevoluciones` creada y ejecutada

### Endpoints Disponibles
```
POST   /devoluciones                    - Crear devolución (parcial o total)
GET    /devoluciones                    - Listar devoluciones (filtros por fecha, venta, estado)
GET    /devoluciones/:id                - Detalle de devolución
GET    /devoluciones/venta/:ventaId     - Devoluciones de una venta
GET    /devoluciones/venta/:ventaId/disponible - Productos disponibles para devolver
```

### Reglas de Negocio Implementadas
- Implementada validación: cantidad a devolver ≤ cantidad vendida - cantidad ya devuelta
- Al procesar devolución:
  - Se registra entrada de inventario (TipoMovimiento.ENTRADA)
  - Se registra movimiento de caja tipo 'devolucion' (Egreso)
  - Se valida que exista caja abierta (opcional, registra si existe)
- Soporte para múltiples devoluciones parciales de una misma venta
- Generación automática de código de devolución (D240214-0001)

---

## Fase 4: Reportes y Analytics ⏳

### Descripción
Dashboard y reportes para análisis del negocio.

### Endpoints a Implementar

#### Dashboard General
```
GET /reportes/dashboard
```
Respuesta:
```json
{
  "ventasHoy": 15000.00,
  "ventasSemana": 85000.00,
  "ventasMes": 320000.00,
  "ticketPromedio": 450.00,
  "productosVendidosHoy": 45,
  "productosStockBajo": 8,
  "productosAgotados": 2
}
```

#### Ventas por Período
```
GET /reportes/ventas?fechaInicio=2024-01-01&fechaFin=2024-01-31&agrupar=dia
```
Respuesta con datos agrupados por día/semana/mes.

#### Productos Más Vendidos
```
GET /reportes/productos-mas-vendidos?limite=10&fechaInicio=2024-01-01
```
Respuesta:
```json
[
  {
    "productoId": "uuid",
    "nombre": "Producto X",
    "cantidadVendida": 150,
    "totalVentas": 45000.00,
    "porcentajeVentas": 12.5
  }
]
```

#### Ventas por Categoría
```
GET /reportes/ventas-por-categoria?fechaInicio=2024-01-01
```

#### Margen de Ganancia
```
GET /reportes/margen-ganancia?fechaInicio=2024-01-01
```
Respuesta:
```json
{
  "ingresosTotales": 500000.00,
  "costoProductos": 350000.00,
  "margenBruto": 150000.00,
  "porcentajeMargen": 30.0
}
```

#### Comparativa de Períodos
```
GET /reportes/comparativa?periodo=mes
```
Compara mes actual vs mes anterior.

---

## Fase 5: Alertas de Stock Bajo ⏳

### Descripción
Sistema de notificaciones para productos con stock bajo.

### Entidad a Crear

#### `Alerta`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| tipo | varchar | 'stock_bajo', 'stock_agotado', 'descuento_expira' |
| titulo | varchar | Título de la alerta |
| mensaje | text | Descripción detallada |
| entidadId | uuid | ID del producto/descuento relacionado |
| entidadTipo | varchar | 'producto', 'descuento' |
| leida | boolean | Si fue vista |
| fechaCreacion | timestamp | Cuándo se generó |

### Endpoints a Implementar
```
GET    /alertas                - Listar alertas pendientes
GET    /alertas/no-leidas      - Contador de alertas no leídas
PATCH  /alertas/:id/leer       - Marcar como leída
PATCH  /alertas/leer-todas     - Marcar todas como leídas
DELETE /alertas/:id            - Eliminar alerta
```

### Implementación
- Job programado (cron) que verifica stock diariamente
- Integración con nodemailer para envío de emails (opcional)
- Endpoint para obtener productos con stock bajo sin crear alertas

---

## Fase 6: Exportación PDF/Excel ⏳

### Descripción
Generación de reportes descargables.

### Dependencias a Instalar
```bash
npm install pdfkit exceljs
npm install -D @types/pdfkit
```

### Endpoints a Implementar
```
GET /exportar/ventas/pdf?fechaInicio=X&fechaFin=Y         - Reporte ventas PDF
GET /exportar/ventas/excel?fechaInicio=X&fechaFin=Y       - Reporte ventas Excel
GET /exportar/inventario/pdf                              - Inventario actual PDF
GET /exportar/inventario/excel                            - Inventario actual Excel
GET /ventas/:id/factura/pdf                               - Factura individual
GET /exportar/productos-stock-bajo/excel                  - Productos bajo stock
```

### Estructura de Archivos
```
src/exportar/
├── exportar.module.ts
├── exportar.controller.ts
├── services/
│   ├── pdf.service.ts
│   └── excel.service.ts
└── templates/
    ├── factura.template.ts
    └── reporte-ventas.template.ts
```

---

## Orden de Implementación Recomendado

```
Fase 1 ✅ → Fase 2 ✅ → Fase 3 ✅ → Fase 4 → Fase 5 → Fase 6
             │         │         │
             │         │         └── Reportes necesarios para exportar
             │         └── Devoluciones afectan reportes
             └── Caja necesaria para devoluciones
```

---

## Comandos Útiles

```bash
# Generar migración
npm run migration:generate -- src/migrations/NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show

# Compilar proyecto
npm run build

# Iniciar en desarrollo
npm run start:dev
```

---

## Notas de Implementación

1. **Transacciones**: Usar `QueryRunner` para operaciones que afecten múltiples tablas
2. **Validación**: Todos los DTOs deben tener validadores de class-validator
3. **Documentación**: Agregar decoradores de Swagger a todos los endpoints
4. **Roles**: Usar decorador `@Roles()` para proteger endpoints administrativos
5. **Errores**: Usar `handleDBErrors()` del helper común para manejo consistente
