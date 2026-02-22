using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IAuthRepository
    {
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario?> GetByIdAsync(int id);
        Task<bool> ExistsEmailAsync(string email);
        Task<Usuario> CreateAsync(Usuario usuario);
        Task<Usuario> UpdateAsync(Usuario usuario);
        Task CreateUsuarioConEmpleadoAsync(Usuario usuario, Empleado empleado);

    }
}