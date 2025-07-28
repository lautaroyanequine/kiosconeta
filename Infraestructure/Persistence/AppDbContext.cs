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

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<MetodoDePago> MetodosDePago { get; set; } //son colecciones
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Server=localhost;Database=Restaurante;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=False");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            new MetodoDePagoConfiguration(modelBuilder.Entity<MetodoDePago>());

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
