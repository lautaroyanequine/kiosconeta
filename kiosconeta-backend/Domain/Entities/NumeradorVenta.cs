using Domain.Entities;

public class NumeradorVenta
{
    public int NumeradorVentaId { get; set; }

    public int KioscoId { get; set; }

    public int UltimoNumero { get; set; }

    public DateTime UltimaActualizacion { get; set; }

    public Kiosco Kiosco { get; set; } = null!;
}