using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Querys
{
    public interface IMetodoDePagoQuery
    {
        MetodoDePago GetMetodoDePago(Guid metodoDePagoId);
        public List<MetodoDePago> GetList(string? fecha);

    }
}
