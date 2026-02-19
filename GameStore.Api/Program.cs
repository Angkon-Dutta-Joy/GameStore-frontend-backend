using GameStore.Api.Data;
using GameStore.Api.EndPoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidation(); // Add validation services to the dependency injection container, enabling the use of data annotations for validating incoming request data in the API endpoints.

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



builder.AddGameStoreDb(); // Call the AddGameStoreDb extension method to configure the application's database context (GameStoreContext) and set up the connection string for the SQLite database. This method also includes seeding logic to populate the database with initial data if necessary.
var app = builder.Build();

app.MigrateDb(); // Call the MigrateDb extension method to apply any pending migrations to the database. This ensures that the database schema is up to date with the latest changes defined in the application's Entity Framework Core migrations.

app.UseCors();

app.MapGamesEndPoints();

app.MapGenreEndPoints();

app.Run();
