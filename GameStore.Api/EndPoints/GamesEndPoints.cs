using System;
using GameStore.Api.Data;
using GameStore.Api.Dtos;
using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.EndPoints;

public static class GamesEndPoints
{
    
    const string GetGameEndpointName = "GetGame";

    public static void MapGamesEndPoints(this WebApplication app)
    {

        var group = app.MapGroup("/games");
        // GET /games
        group.MapGet("/", async(GameStoreContext dbContext) 
          => await dbContext.Games
                                   .Include(game => game.Genre)
                                   .Select(game => new GameSummaryDto(
                                        game.Id,
                                        game.Name,
                                        game.Genre!.Name,
                                        game.Price,
                                        game.ReleaseDate
                                   ))
                                   .AsNoTracking()
                                   .ToListAsync());           //no need to write /games here because we are already in the /games group, this endpoint will return the list of all games in the in-memory list when a GET request is made to /games

        // GET /games/l
        group.MapGet("/{id}", async (int id, GameStoreContext dbContext) => 
        { 
            var game = await dbContext.Games.FindAsync(id);  // Use the FindAsync method to search for a game with the specified id in the database context. This will return the game if found, or null if not found.

            return game is null ? Results.NotFound() : Results.Ok(

                new GameDetailsDto(
                    game.Id,
                    game.Name,
                    game.GenreId,
                    game.Price,
                    game.ReleaseDate
                )
            );  // Return the game if found, otherwise return a 404 Not Found response
        })
            .WithName(GetGameEndpointName);  // MapGet endpoint to retrieve a game by its id, using the Find method to search the games list for a game with the matching id. The endpoint is named using WithName for use in the CreatedAtRoute response of the POST endpoint.

        // POST /games
        group.MapPost("/", async (CreateGameDto newGame, GameStoreContext dbContext) => {
                Game game= new()
                {
                    Name = newGame.Name,
                    GenreId = newGame.GenreId,
                    Price = newGame.Price,
                    ReleaseDate = newGame.ReleaseDate
                };

            dbContext.Games.Add(game);  // Add the new game to the database context
            await dbContext.SaveChangesAsync();    // Save changes to the database, which will generate an Id for the new game
 
            GameDetailsDto gameDto = new(
                game.Id,
                game.Name,
                game.GenreId,
                game.Price,
                game.ReleaseDate
            );
            return Results.CreatedAtRoute(GetGameEndpointName, new { id = gameDto.Id }, gameDto); // Return a 201 Created response with the location of the new game and the game data in the response body
        });


        // Put /games/1
        group.MapPut("/{id}", async (int id, UpdateGameDto updatedGame, GameStoreContext dbContext) =>     // MapPut endpoint to update an existing game with the specified id using the data from the UpdateGameDto
        {
            var existingGame = await dbContext.Games.FindAsync(id);  // Use the FindAsync method to search for the existing game with the specified id in the database context. This will return the game if found, or null if not found.
            if (existingGame is null) 
            {
                return Results.NotFound();           // If the game is not found, return a 404 Not Found response
            }  
  
            existingGame.Name = updatedGame.Name;  // Update the properties of the existing game with the values from the UpdateGameDto
            existingGame.GenreId = updatedGame.GenreId; 
            existingGame.Price = updatedGame.Price;
            existingGame.ReleaseDate = updatedGame.ReleaseDate;
            
            await dbContext.SaveChangesAsync();  // Save changes to the database context, which will update the existing game in the database
            return Results.NoContent();  // Return a 204 No Content response to indicate the update was successful
        }); 


        // DELETE /games/1
        group.MapDelete("/{id}", async (int id, GameStoreContext dbContext) =>  // MapDelete endpoint to delete a game with the specified id
        {
            await dbContext.Games.Where(game => game.Id == id).ExecuteDeleteAsync();  // Use the Where method to filter the games in the database context for the game with the matching id, and then call ExecuteDeleteAsync to delete it from the database. This will return the number of rows affected by the delete operation.
            return Results.NoContent();  // Return a 204 No Content response to indicate the deletion was successful
        });
    }
}

