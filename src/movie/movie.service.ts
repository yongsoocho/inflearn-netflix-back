import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '@lib/prisma';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMovieDto: CreateMovieDto) {
    return 'This action adds a new movie';
  }

  findAll() {
    return `This action returns all movie`;
  }

  addMovieToList(profileId, movieId) {
    return this.prisma.myList
      .create({
        data: {
          profileId,
          movieId,
        },
      })
      .then(() => 'ADD');
  }

  deleteMovie(profileId, movieId) {
    return this.prisma.myList
      .delete({
        where: {
          profileId_movieId: {
            profileId,
            movieId,
          },
        },
      })
      .then(() => 'DEL');
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
