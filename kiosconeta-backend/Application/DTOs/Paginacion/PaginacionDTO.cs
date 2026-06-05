namespace Application.DTOs.Common
{
    // Request — lo que manda el frontend
    public class PaginacionDTO
    {
        public int Pagina { get; set; } = 1;
        public int TamanoPagina { get; set; } = 20;
        public int MaxTamanoPagina { get; set; } = 100;

        public int TamanoReal => Math.Min(TamanoPagina, MaxTamanoPagina);
        public int Skip => (Pagina - 1) * TamanoReal;
    }

    // Response — lo que devuelve el backend
    public class ResultadoPaginadoDTO<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalItems { get; set; }
        public int Pagina { get; set; }
        public int TamanoPagina { get; set; }
        public int TotalPaginas { get; set; }
        public bool TienePaginaAnterior => Pagina > 1;
        public bool TienePaginaSiguiente => Pagina < TotalPaginas;
    }
}