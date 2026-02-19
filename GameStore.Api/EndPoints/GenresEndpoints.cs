using System;
using GameStore.Api.Data;
using GameStore.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.EndPoints;

public static class GenresEndpoints
{
      public static void MapGenreEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("/genres");
        // GET /genres
        group.MapGet("/", async(GameStoreContext dbContext) 
          => await dbContext.Genres
                                   .Select(genre => new GenreDto(
                                        genre.Id,
                                        genre.Name
                                   ))
                                   .AsNoTracking()
                                   .ToListAsync());           //no need to write /genres here because we are already in the /genres group, this endpoint will return the list of all genres in the in-memory list when a GET request is made to /genres
    }
}
