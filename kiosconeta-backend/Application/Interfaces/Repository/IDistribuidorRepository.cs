public interface IDistribuidorRepository
{
    Task<IEnumerable<Distribuidor>> GetByKioscoAsync(int kioscoId);
    Task<Distribuidor?> GetByIdAsync(int id);
    Task<Distribuidor> CreateAsync(Distribuidor distribuidor);
    Task<Distribuidor> UpdateAsync(Distribuidor distribuidor);
    Task<bool> DeleteAsync(int id);
}