FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["apps/print-agent/Restaurant.PrintAgent/Restaurant.PrintAgent.csproj", "apps/print-agent/Restaurant.PrintAgent/"]
RUN dotnet restore "apps/print-agent/Restaurant.PrintAgent/Restaurant.PrintAgent.csproj"

COPY . .
RUN dotnet publish "apps/print-agent/Restaurant.PrintAgent/Restaurant.PrintAgent.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Restaurant.PrintAgent.dll"]
