using Domain.Entities;

namespace Application.Interfaces.Querys
{
    public interface ICategoriaQuery
    {
        Categoria GetCategoria(int categoriaId);
        public List<Categoria> GetList();

    }
}
