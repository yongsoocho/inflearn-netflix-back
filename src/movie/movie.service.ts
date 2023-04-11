import { Inject, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '@lib/prisma';
import { RedisService } from '@lib/redis';
import { ISearchMovie } from './dto/search-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redis: RedisService,
  ) {}

  async getMovies(cates: string[], profileId?: string) {
    const query = cates.map((cate: string) =>
      this.prisma.cateMovie.findMany({
        where: {
          categoryName: cate,
        },
        take: 20,
        select: {
          movie: true,
        },
      }),
    );

    const watchingMovies = this.prisma.myWatching.findMany({
      where: {
        profileId,
      },
      take: 20,
      select: {
        movie: true,
      },
    });

    const result = await Promise.all(
      profileId ? [watchingMovies].concat(query) : query,
    );

    const mainScreen = await this.prisma.movie.findFirst({
      skip: Math.round(Math.random() * 2000) + 11,
      include: {
        detailInfo: true,
      },
    });

    const data = {};

    if (profileId) data['My watching'] = result[0].map((e) => e.movie);
    data['mainScreen'] = mainScreen;

    cates.forEach(
      (cate: string, index) =>
        (data[cate] = result[profileId ? index + 1 : index].map(
          (e) => e.movie,
        )),
    );

    return data;
  }

  getMoviesInMainPage(user) {
    const cates: string[] = [
      'TV Shows Based on Real Life',
      'Period Pieces',
      'Action & Adventure',
      'Reality TV',
      'Crime TV Shows',
      'Horror Movies',
    ];

    return this.getMovies(cates, user.profileId);
  }

  /**
   * Canadian
   * Family Watch Together TV
   * Hip-Hop
   * Reality TV
   * TV Cartoons
   * Movies Based on Books
   * Korean
   */
  getMoviesInMoviePage() {
    const cates: string[] = [
      'Canadian',
      'Family Watch Together TV',
      'Hip-Hop',
      'Reality TV',
      'TV Cartoons',
      'Movies Based on Books',
      'Korean',
    ];

    return this.getMovies(cates);
  }

  getMovieWithDetail(movieId: number) {
    return this.prisma.movie.findUnique({
      where: {
        movieId,
      },
      include: {
        detailInfo: true,
      },
    });
  }

  async getMoviesWithPagnation(q: ISearchMovie) {
    const r = await this.redis.get(`${q.query}:${q.page}:${q.take}`);

    if (r) return JSON.parse(r);

    const [_, movies] = await Promise.all([
      this.prisma.movie.count({
        where: {
          OR: [
            {
              title: {
                contains: q.query,
              },
            },
            {
              detailInfo: {
                description: {
                  contains: q.query,
                },
              },
            },
            {
              detailInfo: {
                casts: {
                  has: q.query,
                },
              },
            },
          ],
        },
      }),
      this.prisma.movie.findMany({
        where: {
          OR: [
            {
              title: {
                contains: q.query,
              },
            },
            {
              detailInfo: {
                description: {
                  contains: q.query,
                },
              },
            },
            {
              detailInfo: {
                casts: {
                  has: q.query,
                },
              },
            },
          ],
        },
        take: q.take,
        skip: q.take * (q.page - 1),
      }),
    ]);

    await this.redis.set(
      `${q.query}:${q.page}:${q.take}`,
      JSON.stringify(movies),
      '600',
    );

    return {
      movies,
      maxPage: Math.ceil(_ / q.take),
      currentPage: q.page,
      take: q.take,
    };
  }

  async getMyList(user, page = 1, take = 10) {
    const [_, movies] = await Promise.all([
      this.prisma.myList.count({
        where: {
          profileId: user.profileId,
        },
      }),
      this.prisma.myList.findMany({
        where: {
          profileId: user.profileId,
        },
        take,
        skip: take * (page - 1),
      }),
    ]);

    return {
      movies,
      maxPage: Math.ceil(_ / take),
    };
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
}
