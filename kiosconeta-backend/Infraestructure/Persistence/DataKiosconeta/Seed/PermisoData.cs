using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class PermisoData
    {
        public static void Seed(EntityTypeBuilder<Permiso> entity)
        {
            entity.HasData(
                // ════════════════════════════════════════════════
                // PRODUCTOS (8 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 1, Nombre = "productos.ver", Descripcion = "Ver listado de productos" },
                new Permiso { PermisoID = 2, Nombre = "productos.crear", Descripcion = "Crear nuevos productos" },
                new Permiso { PermisoID = 3, Nombre = "productos.editar", Descripcion = "Editar productos existentes" },
                new Permiso { PermisoID = 4, Nombre = "productos.eliminar", Descripcion = "Eliminar productos" },
                new Permiso { PermisoID = 5, Nombre = "productos.activar_desactivar", Descripcion = "Activar o desactivar productos" },
                new Permiso { PermisoID = 6, Nombre = "productos.ajustar_stock", Descripcion = "Ajustar stock manualmente" },
                new Permiso { PermisoID = 7, Nombre = "productos.ver_stock_bajo", Descripcion = "Ver productos con stock bajo" },
                new Permiso { PermisoID = 8, Nombre = "productos.editar_precios", Descripcion = "Editar precios de venta y costo" },

                // ════════════════════════════════════════════════
                // CATEGORÍAS (4 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 9, Nombre = "categorias.ver", Descripcion = "Ver categorías" },
                new Permiso { PermisoID = 10, Nombre = "categorias.crear", Descripcion = "Crear categorías" },
                new Permiso { PermisoID = 11, Nombre = "categorias.editar", Descripcion = "Editar categorías" },
                new Permiso { PermisoID = 12, Nombre = "categorias.eliminar", Descripcion = "Eliminar categorías" },

                // ════════════════════════════════════════════════
                // VENTAS (6 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 13, Nombre = "ventas.crear", Descripcion = "Crear ventas (usar POS)" },
                new Permiso { PermisoID = 14, Nombre = "ventas.ver_todas", Descripcion = "Ver todas las ventas del kiosco" },
                new Permiso { PermisoID = 15, Nombre = "ventas.ver_propias", Descripcion = "Ver solo sus propias ventas" },
                new Permiso { PermisoID = 16, Nombre = "ventas.ver_detalle", Descripcion = "Ver detalle completo de ventas" },
                new Permiso { PermisoID = 17, Nombre = "ventas.anular", Descripcion = "Anular ventas" },
                new Permiso { PermisoID = 18, Nombre = "ventas.ver_por_empleado", Descripcion = "Ver ventas por empleado" },

                // ════════════════════════════════════════════════
                // GASTOS (6 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 19, Nombre = "gastos.crear", Descripcion = "Registrar gastos" },
                new Permiso { PermisoID = 20, Nombre = "gastos.ver_todos", Descripcion = "Ver todos los gastos" },
                new Permiso { PermisoID = 21, Nombre = "gastos.ver_propios", Descripcion = "Ver solo sus propios gastos" },
                new Permiso { PermisoID = 22, Nombre = "gastos.editar", Descripcion = "Editar gastos" },
                new Permiso { PermisoID = 23, Nombre = "gastos.eliminar", Descripcion = "Eliminar gastos" },
                new Permiso { PermisoID = 24, Nombre = "gastos.gestionar_tipos", Descripcion = "Crear y editar tipos de gasto" },

                // ════════════════════════════════════════════════
                // TURNOS (6 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 25, Nombre = "turnos.abrir", Descripcion = "Abrir turnos" },
                new Permiso { PermisoID = 26, Nombre = "turnos.cerrar", Descripcion = "Cerrar turnos" },
                new Permiso { PermisoID = 27, Nombre = "turnos.ver_todos", Descripcion = "Ver todos los turnos del kiosco" },
                new Permiso { PermisoID = 28, Nombre = "turnos.ver_propio", Descripcion = "Ver solo su turno actual" },
                new Permiso { PermisoID = 29, Nombre = "turnos.ver_historial", Descripcion = "Ver historial de turnos" },
                new Permiso { PermisoID = 30, Nombre = "turnos.ajustar", Descripcion = "Ajustar diferencias en cierres" },

                // ════════════════════════════════════════════════
                // EMPLEADOS (6 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 31, Nombre = "empleados.ver", Descripcion = "Ver listado de empleados" },
                new Permiso { PermisoID = 32, Nombre = "empleados.crear", Descripcion = "Crear nuevos empleados" },
                new Permiso { PermisoID = 33, Nombre = "empleados.editar", Descripcion = "Editar empleados" },
                new Permiso { PermisoID = 34, Nombre = "empleados.eliminar", Descripcion = "Eliminar empleados" },
                new Permiso { PermisoID = 35, Nombre = "empleados.asignar_permisos", Descripcion = "Asignar y quitar permisos a empleados" },
                new Permiso { PermisoID = 36, Nombre = "empleados.ver_rendimiento", Descripcion = "Ver estadísticas de rendimiento" },

                // ════════════════════════════════════════════════
                // REPORTES (5 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 37, Nombre = "reportes.dashboard_completo", Descripcion = "Ver dashboard completo" },
                new Permiso { PermisoID = 38, Nombre = "reportes.dashboard_basico", Descripcion = "Ver dashboard básico del día" },
                new Permiso { PermisoID = 39, Nombre = "reportes.ventas", Descripcion = "Ver reportes de ventas" },
                new Permiso { PermisoID = 40, Nombre = "reportes.productos", Descripcion = "Ver reportes de productos" },
                new Permiso { PermisoID = 41, Nombre = "reportes.financiero", Descripcion = "Ver reportes financieros" },

                // ════════════════════════════════════════════════
                // MÉTODOS DE PAGO (3 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 42, Nombre = "metodos_pago.ver", Descripcion = "Ver métodos de pago" },
                new Permiso { PermisoID = 43, Nombre = "metodos_pago.crear", Descripcion = "Crear métodos de pago" },
                new Permiso { PermisoID = 44, Nombre = "metodos_pago.editar", Descripcion = "Editar métodos de pago" },

                // ════════════════════════════════════════════════
                // CONFIGURACIÓN (2 permisos)
                // ════════════════════════════════════════════════
                new Permiso { PermisoID = 45, Nombre = "configuracion.kiosco", Descripcion = "Configurar datos del kiosco" },
                new Permiso { PermisoID = 46, Nombre = "configuracion.respaldos", Descripcion = "Crear respaldos de datos" }
            );
        }
    }
}