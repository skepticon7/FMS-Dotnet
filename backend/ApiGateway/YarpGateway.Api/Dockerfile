FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project file - FIXED PATH
COPY ["backend/ApiGateway/YarpGateway.Api/YarpGateway.Api.csproj", "backend/ApiGateway/YarpGateway.Api/"]
RUN dotnet restore "backend/ApiGateway/YarpGateway.Api/YarpGateway.Api.csproj"

COPY . .
WORKDIR "/src/backend/ApiGateway/YarpGateway.Api"
RUN dotnet build "YarpGateway.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "YarpGateway.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YarpGateway.Api.dll"]