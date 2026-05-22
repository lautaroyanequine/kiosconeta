using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Application.Services;
using Infraestructure.Persistence;
using Infraestructure.Repository;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Esto le dice al driver que deje de ser tan estricto con el Kind
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// ========== SWAGGER CON SOPORTE JWT ==========
// Esto agrega el botón "Authorize" en Swagger para que puedas probar endpoints protegidos
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "KIOSCONETA API", Version = "v1" });

    // Configurar JWT en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresá el token así: Bearer {tu_token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ========== BASE DE DATOS ==========
// Lee DATABASE_URL (Railway) o ConnectionString (local/appsettings)
var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration["ConnectionString"]
    ?? throw new InvalidOperationException("No se encontró connection string");

string connectionString;
if (rawConnection.StartsWith("postgresql://") || rawConnection.StartsWith("postgres://"))
{
    var uri = new Uri(rawConnection);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = rawConnection;
}
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ========== JWT AUTHENTICATION ==========
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key no configurada");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,        // Verificar expiración
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });

builder.Services.AddAuthorization();

// // =================== REPOSITORIES ==========
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<IMetodoDePagoRepository, MetodoDePagoRepository>();
builder.Services.AddScoped<IEmpleadoRepository, EmpleadoRepository>();
builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IProductoVentaRepository, ProductoVentaRepository>();
builder.Services.AddScoped<ICajaRepository, CajaRepository>();

builder.Services.AddScoped<ICierreTurnoRepository, CierreTurnoRepository>();
builder.Services.AddScoped<IGastoRepository, GastoRepository>();
builder.Services.AddScoped<ITipoDeGastoRepository, TipoDeGastoRepository>();
builder.Services.AddScoped<IPermisoRepository, PermisoRepository>();     
builder.Services.AddScoped<ITurnoRepository, TurnoRepository>();
builder.Services.AddScoped<IAuditoriaRepository, AuditoriaRepository>();
builder.Services.AddScoped<IKioscoRepository, KioscoRepository>();
builder.Services.AddScoped<IPromocionRepository, PromocionRepository>();

// ========== SERVICES ==========
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<ICategoriaService, CategoriaService>();
builder.Services.AddScoped<IMetodoDePagoService, MetodoDePagoService>();
builder.Services.AddScoped<IEmpleadoService, EmpleadoService>();
builder.Services.AddScoped<IVentaService, VentaService>();
builder.Services.AddScoped<IKioscoService, KioscoService>();
builder.Services.AddScoped<ICierreTurnoService, CierreTurnoService>();
builder.Services.AddScoped<IGastoService, GastoService>();
builder.Services.AddScoped<ITipoDeGastoService, TipoDeGastoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IPermisoService, PermisoService>();
builder.Services.AddScoped<INumeradorRepository, NumeradorRepository>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();
builder.Services.AddScoped<ICajaService, CajaService>();

builder.Services.AddScoped<IPromocionService, PromocionService>();

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            var allowedOrigins = builder.Configuration["AllowedOrigins"]
                ?.Split(",") ?? [];
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();

            if (allowedOrigins.Length > 0)
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
        });
});

var app = builder.Build();

 app.UseSwagger();
  app.UseSwaggerUI();


if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowFrontend");

// ⚠️ IMPORTANTE: El orden es Authentication SIEMPRE antes de Authorization
app.UseAuthentication();    // ← Verifica el token
app.UseAuthorization();     // ← Verifica los permisos

app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();