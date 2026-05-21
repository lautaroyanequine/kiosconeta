# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar todos los proyectos
COPY KIOSCONETA.sln .
COPY KIOSCONETA/KIOSCONETA.csproj KIOSCONETA/
COPY Application/Application.csproj Application/
COPY Domain/Domain.csproj Domain/
COPY Infraestructure/Infraestructure.csproj Infraestructure/

# Restaurar dependencias
RUN dotnet restore

# Copiar todo el código fuente
COPY . .

# Publicar
RUN dotnet publish KIOSCONETA/KIOSCONETA.csproj -c Release -o /app/out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "KIOSCONETA.dll"]