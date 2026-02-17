using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Application.Services;
using Infraestructure.Persistence;
using Infraestructure.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//custom

var connectionString = builder.Configuration["ConnectionString"];
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

// ========== INYECCIÓN DE DEPENDENCIAS ==========

// Repositories
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
// Aquí irán los demás repositorios cuando los crees:
// builder.Services.AddScoped<IVentaRepository, VentaRepository>();
// builder.Services.AddScoped<IEmpleadoRepository, EmpleadoRepository>();
// etc.

// Services
builder.Services.AddScoped<IProductoService, ProductoService>();
// Aquí irán los demás servicios cuando los crees:
// builder.Services.AddScoped<IVentaService, VentaService>();
// builder.Services.AddScoped<IEmpleadoService, EmpleadoService>();
// etc.

// ========== CORS (Para que tu frontend pueda conectarse) ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:4200") // Ajusta según tu frontend
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ========== ACTIVAR CORS ==========
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();