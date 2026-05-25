public class DistribuidorResponseDTO
{
    public int DistribuidorId { get; set; }
    public string Nombre { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Notas { get; set; }
    public bool Activo { get; set; }
    public int CantidadProductos { get; set; }
}

public class CreateDistribuidorDTO
{
    public string Nombre { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Notas { get; set; }
}

public class UpdateDistribuidorDTO : CreateDistribuidorDTO
{
    public int DistribuidorId { get; set; }
    public bool Activo { get; set; }
}