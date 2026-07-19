/**
 * Curated starter pools for the taste journey.
 *
 * Hand-maintained seed set (posters from TMDB). The spec calls for these to be
 * replaced by a live TMDB fetch in production; this module is the single seam
 * where that swap happens.
 */

export type GenreId = number;

export type Title = {
  title: string;
  year: number;
  // TMDB genre ids. The trailing comment on each title spells them out.
  genreIds: GenreId[];
  hiddenGem: boolean;
  tmdbId: number;
  poster: string | null;
};

export const MOVIES: Title[] = [
  {
    title: 'Interstellar',
    year: 2014,
    genreIds: [878, 18, 12], // Science Fiction, Drama, Adventure
    hiddenGem: false,
    tmdbId: 157336,
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
  },
  {
    title: 'Parasite',
    year: 2019,
    genreIds: [18, 53, 35], // Drama, Thriller, Comedy
    hiddenGem: false,
    tmdbId: 496243,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    genreIds: [28, 80, 18], // Action, Crime, Drama
    hiddenGem: false,
    tmdbId: 155,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    title: 'La La Land',
    year: 2016,
    genreIds: [10749, 18, 10402], // Romance, Drama, Music
    hiddenGem: false,
    tmdbId: 313369,
    poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
  },
  {
    title: 'Dune',
    year: 2021,
    genreIds: [878, 12, 18], // Science Fiction, Adventure, Drama
    hiddenGem: false,
    tmdbId: 438631,
    poster: 'https://image.tmdb.org/t/p/w500/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg',
  },
  {
    title: 'Everything Everywhere All at Once',
    year: 2022,
    genreIds: [878, 28, 35], // Science Fiction, Action, Comedy
    hiddenGem: false,
    tmdbId: 545611,
    poster: 'https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
  },
  {
    title: 'Mad Max: Fury Road',
    year: 2015,
    genreIds: [28, 12, 878], // Action, Adventure, Science Fiction
    hiddenGem: false,
    tmdbId: 76341,
    poster: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
  },
  {
    title: 'Spirited Away',
    year: 2001,
    genreIds: [16, 14], // Animation, Fantasy
    hiddenGem: false,
    tmdbId: 129,
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    title: 'The Godfather',
    year: 1972,
    genreIds: [80, 18], // Crime, Drama
    hiddenGem: false,
    tmdbId: 238,
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
  {
    title: 'Pulp Fiction',
    year: 1994,
    genreIds: [80, 53, 35], // Crime, Thriller, Comedy
    hiddenGem: false,
    tmdbId: 680,
    poster: 'https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg',
  },
  {
    title: 'Back to the Future',
    year: 1985,
    genreIds: [878, 35, 12], // Science Fiction, Comedy, Adventure
    hiddenGem: false,
    tmdbId: 105,
    poster: 'https://image.tmdb.org/t/p/w500/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg',
  },
  {
    title: 'The Lord of the Rings',
    year: 2001,
    genreIds: [14, 12, 18], // Fantasy, Adventure, Drama
    hiddenGem: false,
    tmdbId: 120,
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  },
  {
    title: 'Titanic',
    year: 1997,
    genreIds: [10749, 18], // Romance, Drama
    hiddenGem: false,
    tmdbId: 597,
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
  },
  {
    title: 'Get Out',
    year: 2017,
    genreIds: [27, 9648, 53], // Horror, Mystery, Thriller
    hiddenGem: false,
    tmdbId: 419430,
    poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
  },
  {
    title: "Schindler's List",
    year: 1993,
    genreIds: [36, 18, 10752], // History, Drama, War
    hiddenGem: false,
    tmdbId: 424,
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  },
  {
    title: 'Django Unchained',
    year: 2012,
    genreIds: [37, 18], // Western, Drama
    hiddenGem: false,
    tmdbId: 68718,
    poster: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
  },
  {
    title: 'Coherence',
    year: 2013,
    genreIds: [878, 9648, 53], // Science Fiction, Mystery, Thriller
    hiddenGem: true,
    tmdbId: 220289,
    poster: 'https://image.tmdb.org/t/p/w500/ezUtb9m5DeLwL2gxi4gktzNCvQv.jpg',
  },
  {
    title: 'The Fall',
    year: 2006,
    genreIds: [12, 14, 18], // Adventure, Fantasy, Drama
    hiddenGem: true,
    tmdbId: 14784,
    poster: 'https://image.tmdb.org/t/p/w500/ez7xavvDr5yDz4sSvI55xDp0BoU.jpg',
  },
  {
    title: 'Blue Ruin',
    year: 2013,
    genreIds: [53, 80, 18], // Thriller, Crime, Drama
    hiddenGem: true,
    tmdbId: 188166,
    poster: 'https://image.tmdb.org/t/p/w500/q0itEsso2drJXqH9kfdidxIT5dF.jpg',
  },
  {
    title: 'A Ghost Story',
    year: 2017,
    genreIds: [18, 14], // Drama, Fantasy
    hiddenGem: true,
    tmdbId: 428449,
    poster: 'https://image.tmdb.org/t/p/w500/rp5JPIyZi9sMob15l46zNQLe5cO.jpg',
  },
  {
    title: 'Whiplash',
    year: 2014,
    genreIds: [10402, 18], // Music, Drama
    hiddenGem: true,
    tmdbId: 244786,
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
  },
  {
    title: 'Moon',
    year: 2009,
    genreIds: [878, 18, 9648], // Science Fiction, Drama, Mystery
    hiddenGem: true,
    tmdbId: 17431,
    poster: 'https://image.tmdb.org/t/p/w500/35IU0Mq0zFsN1mYwDGts5mKc77n.jpg',
  },
  {
    title: 'The Handmaiden',
    year: 2016,
    genreIds: [53, 10749, 18], // Thriller, Romance, Drama
    hiddenGem: true,
    tmdbId: 290098,
    poster: 'https://image.tmdb.org/t/p/w500/dLlH4aNHdnmf62umnInL8xPlPzw.jpg',
  },
  {
    title: 'Hereditary',
    year: 2018,
    genreIds: [27, 18, 9648], // Horror, Drama, Mystery
    hiddenGem: true,
    tmdbId: 493922,
    poster: 'https://image.tmdb.org/t/p/w500/4GFPuL14eXi66V96xBWY73Y9PfR.jpg',
  },
];

export const SERIES: Title[] = [
  {
    title: 'Breaking Bad',
    year: 2008,
    genreIds: [18, 80], // Drama, Crime
    hiddenGem: false,
    tmdbId: 1396,
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
  },
  {
    title: 'The Last of Us',
    year: 2023,
    genreIds: [18], // Drama
    hiddenGem: false,
    tmdbId: 100088,
    poster: 'https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
  },
  {
    title: 'Succession',
    year: 2018,
    genreIds: [18, 35], // Drama, Comedy
    hiddenGem: false,
    tmdbId: 76331,
    poster: 'https://image.tmdb.org/t/p/w500/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
  },
  {
    title: 'Severance',
    year: 2022,
    genreIds: [18, 878, 9648], // Drama, Science Fiction, Mystery
    hiddenGem: false,
    tmdbId: 95396,
    poster: 'https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
  },
  {
    title: 'The Bear',
    year: 2022,
    genreIds: [35, 18], // Comedy, Drama
    hiddenGem: false,
    tmdbId: 136315,
    poster: 'https://image.tmdb.org/t/p/w500/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg',
  },
  {
    title: 'House of the Dragon',
    year: 2022,
    genreIds: [878, 18, 28], // Science Fiction, Drama, Action
    hiddenGem: false,
    tmdbId: 94997,
    poster: 'https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg',
  },
  {
    title: 'Squid Game',
    year: 2021,
    genreIds: [28, 9648, 18], // Action, Mystery, Drama
    hiddenGem: false,
    tmdbId: 93405,
    poster: 'https://image.tmdb.org/t/p/w500/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg',
  },
  {
    title: 'True Detective',
    year: 2014,
    genreIds: [80, 18, 9648], // Crime, Drama, Mystery
    hiddenGem: false,
    tmdbId: 46648,
    poster: 'https://image.tmdb.org/t/p/w500/dC7jkj2g1aU8sxKqM6D4g44xA6w.jpg',
  },
  {
    title: 'Game of Thrones',
    year: 2011,
    genreIds: [14, 18, 12], // Fantasy, Drama, Adventure
    hiddenGem: false,
    tmdbId: 1399,
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  },
  {
    title: 'Stranger Things',
    year: 2016,
    genreIds: [878, 27, 9648], // Science Fiction, Horror, Mystery
    hiddenGem: false,
    tmdbId: 66732,
    poster: 'https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
  },
  {
    title: 'The Sopranos',
    year: 1999,
    genreIds: [80, 18], // Crime, Drama
    hiddenGem: false,
    tmdbId: 1398,
    poster: 'https://image.tmdb.org/t/p/w500/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg',
  },
  {
    title: 'The Wire',
    year: 2002,
    genreIds: [80, 18], // Crime, Drama
    hiddenGem: false,
    tmdbId: 1438,
    poster: 'https://image.tmdb.org/t/p/w500/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
  },
  {
    title: 'The Office',
    year: 2005,
    genreIds: [35], // Comedy
    hiddenGem: false,
    tmdbId: 2316,
    poster: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
  },
  {
    title: 'Friends',
    year: 1994,
    genreIds: [35, 10749], // Comedy, Romance
    hiddenGem: false,
    tmdbId: 1668,
    poster: 'https://image.tmdb.org/t/p/w500/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg',
  },
  {
    title: 'Sherlock',
    year: 2010,
    genreIds: [80, 9648, 18], // Crime, Mystery, Drama
    hiddenGem: false,
    tmdbId: 19885,
    poster: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
  },
  {
    title: 'Arcane',
    year: 2021,
    genreIds: [16, 28, 12], // Animation, Action, Adventure
    hiddenGem: false,
    tmdbId: 94605,
    poster: 'https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQeRr7do.jpg',
  },
  {
    title: 'Dark',
    year: 2017,
    genreIds: [80, 18, 9648, 878], // Crime, Drama, Mystery, Science Fiction
    hiddenGem: true,
    tmdbId: 70523,
    poster: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
  },
  {
    title: 'Fleabag',
    year: 2016,
    genreIds: [35, 18], // Comedy, Drama
    hiddenGem: true,
    tmdbId: 67070,
    poster: 'https://image.tmdb.org/t/p/w500/27vEYsRKa3eAniwmoccOoluEXQ1.jpg',
  },
  {
    title: 'Chernobyl',
    year: 2019,
    genreIds: [18, 36], // Drama, History
    hiddenGem: true,
    tmdbId: 87108,
    poster: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
  },
  {
    title: 'Shogun',
    year: 2024,
    genreIds: [18, 36], // Drama, History
    hiddenGem: true,
    tmdbId: 126308,
    poster: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
  },
  {
    title: 'Band of Brothers',
    year: 2001,
    genreIds: [10752, 18, 36], // War, Drama, History
    hiddenGem: true,
    tmdbId: 4613,
    poster: 'https://image.tmdb.org/t/p/w500/pGzV187ogXzgJrvPRy2YPi29ofH.jpg',
  },
  {
    title: 'The Leftovers',
    year: 2014,
    genreIds: [18, 9648, 14], // Drama, Mystery, Fantasy
    hiddenGem: true,
    tmdbId: 54344,
    poster: 'https://image.tmdb.org/t/p/w500/NKJdryIFHr245Umq6gXsf7oULW.jpg',
  },
  {
    title: 'Mr. Robot',
    year: 2015,
    genreIds: [18, 80, 53], // Drama, Crime, Thriller
    hiddenGem: true,
    tmdbId: 62560,
    poster: 'https://image.tmdb.org/t/p/w500/kv1nRqgebSsREnd7vdC2pSGjpLo.jpg',
  },
  {
    title: 'BoJack Horseman',
    year: 2014,
    genreIds: [16, 35, 18], // Animation, Comedy, Drama
    hiddenGem: true,
    tmdbId: 61222,
    poster: 'https://image.tmdb.org/t/p/w500/6JFWzlChcGgLiIUo2COgNlWGFKy.jpg',
  },
];
