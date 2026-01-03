using Domain.Entities;
using Infraestructure.Persistence.Config;
using Microsoft.EntityFrameworkCore;


namespace Infraestructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext()
        {
        }
        // ===== Seguridad / Usuarios =====
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<EmpleadoPermiso> EmpleadoPermisos { get; set; } // tabla intermedia

        // ===== Estructura del kiosco =====
        public DbSet<Kiosco> Kioscos { get; set; }
        public DbSet<Turno> Turnos { get; set; }

        // ===== Ventas =====
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<MetodoDePago> MetodosDePago { get; set; }
        public DbSet<CierreTurno> CierresTurno { get; set; }
        public DbSet<CierreTurnoEmpleado> CierreTurnoEmpleados { get; set; } // intermedia

        // ===== Productos =====
        public DbSet<Producto> Productos { get; set; }
        public DbSet<ProductoVenta> ProductosVenta { get; set; } // intermedia
        public DbSet<Categoria> Categorias { get; set; }

        // ===== Gastos =====
        public DbSet<Gasto> Gastos { get; set; }
        public DbSet<TipoDeGasto> TiposDeGasto { get; set; }





        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //optionsBuilder.UseSqlServer(@"Server=localhost;Database=Kiosconeta;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=False");
            optionsBuilder.UseSqlServer(@"Server=.\SQLEXPRESS;Database=Kiosconeta;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=False");

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
    // 1️⃣ Catálogos / Base
    // =========================
    new PermisoConfiguration(modelBuilder.Entity<Permiso>());
            new TipoDeGastoConfiguration(modelBuilder.Entity<TipoDeGasto>());
            new CategoriaConfiguration(modelBuilder.Entity<Categoria>());
            new MetodoDePagoConfiguration(modelBuilder.Entity<MetodoDePago>());
            new TurnoConfiguration(modelBuilder.Entity<Turno>());

            // =========================
            // 2️⃣ Seguridad / Usuarios
            // =========================
            new UsuarioConfiguration(modelBuilder.Entity<Usuario>());
            new EmpleadoConfiguration(modelBuilder.Entity<Empleado>());

            // =========================
            // 3️⃣ Core del negocio
            // =========================
            new KioscoConfiguration(modelBuilder.Entity<Kiosco>());
            new ProductoConfiguration(modelBuilder.Entity<Producto>());

            // =========================
            // 4️⃣ Relaciones intermedias
            // =========================
            new ProductoVentaConfiguration(modelBuilder.Entity<ProductoVenta>());
            new EmpleadoPermisoConfiguration(modelBuilder.Entity<EmpleadoPermiso>());
            new CierreTurnoEmpleadoConfiguration(modelBuilder.Entity<CierreTurnoEmpleado>());

            // =========================
            // 5️⃣ Operaciones / Movimientos
            // =========================
            new VentaConfiguration(modelBuilder.Entity<Venta>());
            new GastoConfiguration(modelBuilder.Entity<Gasto>());
            new CierreTurnoConfiguration(modelBuilder.Entity<CierreTurno>());









            base.OnModelCreating(modelBuilder);

        }


        /* public DbSet<Mercaderia> Mercaderias { get; set; }
         public DbSet<ComandaMercaderia> ComandaMercaderias { get; set; }
         public DbSet<FormaEntrega> FormaEntregas { get; set; }
         public DbSet<Comanda> Comandas { get; set; }

         protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
         {
             optionsBuilder.UseSqlServer(@"Server=localhost;Database=Restaurante;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=False");
         }

         protected override void OnModelCreating(ModelBuilder modelBuilder)
         {
             new ComandaConfiguration(modelBuilder.Entity<Comanda>());
             new ComandaMercaderiaConfiguration(modelBuilder.Entity<ComandaMercaderia>());
             new MercaderiaConfiguration(modelBuilder.Entity<Mercaderia>());
             new TipoMercaderiaConfiguration(modelBuilder.Entity<TipoMercaderia>());
             new FormaEntregaConfiguration(modelBuilder.Entity<FormaEntrega>());
             new FormaEntregaData(modelBuilder.Entity<FormaEntrega>());
             new MercaderiaData(modelBuilder.Entity<Mercaderia>());
             new TipoMercaderiaData(modelBuilder.Entity<TipoMercaderia>());



             base.OnModelCreating(modelBuilder);
         }*/
    }
}
