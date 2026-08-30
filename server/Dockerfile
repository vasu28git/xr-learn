FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["XrCodingLab.Server.csproj", "./"]
RUN dotnet restore "XrCodingLab.Server.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "XrCodingLab.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port and start the app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "XrCodingLab.Server.dll"]
