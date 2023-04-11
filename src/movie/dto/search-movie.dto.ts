export interface ISearchMovie {
  query: string;
  page: number;
  take: number;
}

export function SearchMovieDto(q: ISearchMovie): ISearchMovie {
  return {
    query: q.query,
    page: +q.page,
    take: +q.take,
  };
}
