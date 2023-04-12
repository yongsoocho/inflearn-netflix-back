import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { MovieService } from "./movie.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { User } from "src/common/decorator/jwt.decorator";
import { JwtGuard } from "src/common/guard/jwt.guard";
import { SearchMovieDto } from "./dto/search-movie.dto";

@Controller("movie")
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get("error")
  getError() {
    // return '안녕하세요 Nestjs';
    throw new HttpException("에러 발생~!", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get("main")
  // @UseGuards(JwtGuard)
  getMoviesInMainPage() {
    return this.movieService.getMoviesInMainPage({ profileId: "profileId" });
  }

  @Get()
  getMoviesInMoviePage() {
    return this.movieService.getMoviesInMoviePage();
  }

  @Get("search")
  getMoviesWithPagnation(@Query() q) {
    return this.movieService.getMoviesWithPagnation(SearchMovieDto(q));
  }

  @Get(":movieId")
  getMovieWithDetail(@Param("movieId") movieId: number) {
    return this.movieService.getMovieWithDetail(+movieId);
  }

  @Get("my-list")
  @UseGuards(JwtGuard)
  getMyList(
    @User() user,
    @Query("page") page: number,
    @Query("take") take: number,
  ) {
    return this.movieService.getMyList(user, +page, Number(take));
  }

  @Post("my-list")
  @UseGuards(JwtGuard)
  addMovieToList(@User() user, @Body("movieId") movieId) {
    return this.movieService.addMovieToList(user, Number(movieId));
  }

  @Delete("my-list")
  @UseGuards(JwtGuard)
  deleteMovie(@User() user, @Body("movieId") movieId) {
    return this.movieService.deleteMovie(user, Number(movieId));
  }
}
