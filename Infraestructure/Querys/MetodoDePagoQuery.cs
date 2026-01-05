using Application.Interfaces.Querys;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Infraestructure.Querys
{
    public class MetodoDePagoQuery : IMetodoDePagoQuery
    {
        private readonly AppDbContext _context;

        public MetodoDePagoQuery(AppDbContext context)
        {
            _context = context;
        }


        public List<MetodoDePago> GetList()
        {
            return _context.MetodosDePago
                .OrderBy(m => m.Nombre)
                .ToList();
        }

        public MetodoDePago GetMetodoDePago(Guid metodoDePagoId)
        {
            var MetoodoDePaago = _context.MetodosDePago
                .Include(cm => cm.MetodoDePagoID)
                .FirstOrDefault(C => C.ComandaId == comandaId);
            return Comanda;
        }
    }
}
