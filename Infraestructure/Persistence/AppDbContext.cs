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
        public DbSet<MetodoDePago> MetodosDePago { get; set; } //son colecciones
        public DbSet<TipoDeGasto> TiposDeGasto { get; set; } //son colecciones
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Turno> Turnos { get; set; }
        public DbSet<Kiosco> Kioscos { get; set; }
        public DbSet<Empleado> Empleados { get; set; }





        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Server=localhost;Database=Kiosconeta;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=False");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            new MetodoDePagoConfiguration(modelBuilder.Entity<MetodoDePago>());
            new TipoDeGastoConfiguration(modelBuilder.Entity<TipoDeGasto>());
            new CategoriaConfiguration(modelBuilder.Entity<Categoria>());
            new PermisoConfiguration(modelBuilder.Entity<Permiso>());
            new UsuarioConfiguration(modelBuilder.Entity<Usuario>());
            new TurnoConfiguration(modelBuilder.Entity<Turno>());
            new KioscoConfiguration(modelBuilder.Entity<Kiosco>());
            new EmpleadoConfiguration(modelBuilder.Entity<Empleado>());








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
