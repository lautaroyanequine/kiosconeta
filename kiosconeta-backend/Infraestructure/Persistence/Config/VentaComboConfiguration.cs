using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Configurations
{
    public class VentaComboConfiguration
    {
        public VentaComboConfiguration(EntityTypeBuilder<VentaCombo> builder)
        {
            builder.HasKey(vc => vc.VentaComboId);

            builder.Property(vc => vc.PromocionNombre)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(vc => vc.PrecioCombo)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(vc => vc.Venta)
                .WithMany(v => v.VentaCombos)
                .HasForeignKey(vc => vc.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Nullable y SetNull: si se borra la promoción, el registro histórico de la
            // venta queda (con PromocionNombre como snapshot), no se pierde ni se bloquea
            // el borrado de la promo.
            builder.HasOne(vc => vc.Promocion)
                .WithMany()
                .HasForeignKey(vc => vc.PromocionId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}