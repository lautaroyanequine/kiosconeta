using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class CierreTurnoEmpleadoConfiguration
    {
        public CierreTurnoEmpleadoConfiguration(EntityTypeBuilder<CierreTurnoEmpleado> entityBuilder)
        {
            entityBuilder.ToTable("CierreTurnoEmpleado");

            // PK compuesta
            entityBuilder.HasKey(cte => new { cte.CierreTurnoId, cte.EmpleadoId });



        }

    }
}
