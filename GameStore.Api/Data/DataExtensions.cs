using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Data;

public static class DataExtensions
{
    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbcontext = scope.ServiceProvider.GetRequiredService<GameStoreContext>();

        // Apply migrations
        dbcontext.Database.Migrate();

        // Seed only if empty
        if (!dbcontext.Set<Genre>().Any())
        {
            dbcontext.Set<Genre>().AddRange(
                new Genre { Name = "Fighting" },
                new Genre { Name = "RPG" },
                new Genre { Name = "Platformer" },
                new Genre { Name = "Racing" },
                new Genre { Name = "Sports" }
            );

            dbcontext.SaveChanges();
        }
    }

    public static void AddGameStoreDb(this WebApplicationBuilder builder)
    {
        var connString = builder.Configuration.GetConnectionString("GameStore")
            ?? throw new InvalidOperationException(
                "Connection string 'GameStore' not found.");
        
        // DbContext has a Scoped service lifetime because:
        // 1. It ensures that a new instance of DbContext is created per request
        // 2. DB connections are a limited and expensive resource
        // 3. Dncontext is not thread-safe. Scoped avoids to concurrency issues
        // 4. Makes it easier to manage transactions and ensure data consistency
        // 5. Reusing a DbContext instance can lead to increased memory usage
        builder.Services.AddSqlite<GameStoreContext>(connString);
    }
}
