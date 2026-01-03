namespace Domain.Entities
{
    public class TipoDeGasto
    {
        public int TipoDeGastoId { get; set; }

        public string Nombre { get; set; }
        public string Descripcion { get; set; }

        public bool Activo { get; set; }

        public IList<Gasto> Gastos { get; set; }
    }


}
