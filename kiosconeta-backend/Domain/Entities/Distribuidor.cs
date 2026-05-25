using Domain.Entities;

public class Distribuidor
{
    public int DistribuidorId { get; set; }
    public string Nombre { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Notas { get; set; }
    public int KioscoId { get; set; }
    public Kiosco Kiosco { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public IList<Producto> Productos { get; set; }
}