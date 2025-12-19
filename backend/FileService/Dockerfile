# ============================
# 1. Build Stage
# ============================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files for build caching
COPY backend/FileService/src/FileService.Domain/*.csproj FileService.Domain/
COPY backend/FileService/src/FileService.Infrastructure/*.csproj FileService.Infrastructure/
COPY backend/FileService/src/FileService.Application/*.csproj FileService.Application/
COPY backend/FileService/src/FileService.Api/*.csproj FileService.Api/

# Restore dependencies
RUN dotnet restore FileService.Api/FileService.Api.csproj


# Copy all source files AFTER restore for proper caching
COPY backend/FileService/src/ ./


# Publish the application (Release)
RUN dotnet publish FileService.Api/FileService.Api.csproj -c Release -o /app/publish


# ============================
# 2. Runtime Stage
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

EXPOSE 8082
EXPOSE 8083

# Copy published build artifacts
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "FileService.Api.dll"]
