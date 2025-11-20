# ============================
# 1. Build stage
# ============================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only csproj files first for caching
COPY backend/UserService/src/UserService.Domain/*.csproj src/UserService.Domain/
COPY backend/UserService/src/UserService.Infrastructure/*.csproj src/UserService.Infrastructure/
COPY backend/UserService/src/UserService.Application/*.csproj src/UserService.Application/
COPY backend/UserService/src/UserService.Api/*.csproj src/UserService.Api/

# Restore
RUN dotnet restore src/UserService.Api/UserService.Api.csproj

# Copy the remaining project files
COPY . .

# Publish in Release mode
RUN dotnet publish backend/UserService/src/UserService.Api/UserService.Api.csproj -c Release -o /app/publish


# ============================
# 2. Runtime stage
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

EXPOSE 8080
EXPOSE 8081

# Copy published output
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "UserService.Api.dll"]
