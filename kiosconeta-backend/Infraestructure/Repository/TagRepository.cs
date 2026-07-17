using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class TagRepository : ITagRepository
    {
        private readonly AppDbContext _context;
        public TagRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Tag>> GetByKioscoIdAsync(int kioscoId) =>
            await _context.Tags
                .Where(t => t.KioscoId == kioscoId && t.Activo)
                .OrderBy(t => t.Nombre)
                .ToListAsync();

        public async Task<Tag?> GetByIdAsync(int id) =>
            await _context.Tags.FindAsync(id);

        public async Task<Tag> CreateAsync(Tag tag)
        {
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return false;
            tag.Activo = false; // soft delete, igual que Producto
            await _context.SaveChangesAsync();
            return true;
        }
    }
}