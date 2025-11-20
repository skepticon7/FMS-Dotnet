# Base runtime (small)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY backend/OcelotGateway/OcelotGateway.Api/OcelotGateway.Api.csproj backend/OcelotGateway/OcelotGateway.Api/
RUN dotnet restore backend/OcelotGateway/OcelotGateway.Api/OcelotGateway.Api.csproj
COPY . .
WORKDIR /src/backend/OcelotGateway/OcelotGateway.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OcelotGateway.Api.dll"]
