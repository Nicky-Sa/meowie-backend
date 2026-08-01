// The hand-picked titles the taste wizard runs on. Every title needs a poster:
// the app has no artwork of its own to fall back on.

export type GenreId = number;

export type Title = {
  title: string;
  year: number;
  mainGenreId: GenreId;
  tmdbId: number;
  poster: string;
};

// Two titles per genre. The genre never reaches the app — it only spreads the
// deck and names the cat card.
//
// Order matters: the deck is shuffled one round at a time, so the list runs one
// title per genre (broadest genre first) before it repeats. Keep it that way —
// grouping a genre's two titles together would drop genres out of round one.

export const MOVIES: Title[] = [
  {
    title: 'The Shawshank Redemption',
    year: 1994,
    mainGenreId: 18, // Drama
    tmdbId: 278,
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
  },
  {
    title: 'The Grand Budapest Hotel',
    year: 2014,
    mainGenreId: 35, // Comedy
    tmdbId: 120467,
    poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    mainGenreId: 28, // Action
    tmdbId: 155,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    title: 'Parasite',
    year: 2019,
    mainGenreId: 53, // Thriller
    tmdbId: 496243,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    title: 'Interstellar',
    year: 2014,
    mainGenreId: 878, // Science Fiction
    tmdbId: 157336,
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
  },
  {
    title: 'The Godfather',
    year: 1972,
    mainGenreId: 80, // Crime
    tmdbId: 238,
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
  {
    title: 'Raiders of the Lost Ark',
    year: 1981,
    mainGenreId: 12, // Adventure
    tmdbId: 85,
    poster: 'https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg',
  },
  {
    title: 'Titanic',
    year: 1997,
    mainGenreId: 10749, // Romance
    tmdbId: 597,
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
  },
  {
    title: 'The Lord of the Rings',
    year: 2001,
    mainGenreId: 14, // Fantasy
    tmdbId: 120,
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  },
  {
    title: 'Spirited Away',
    year: 2001,
    mainGenreId: 16, // Animation
    tmdbId: 129,
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    title: 'Get Out',
    year: 2017,
    mainGenreId: 27, // Horror
    tmdbId: 419430,
    poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
  },
  {
    title: 'Knives Out',
    year: 2019,
    mainGenreId: 9648, // Mystery
    tmdbId: 546554,
    poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
  },
  {
    title: 'Toy Story',
    year: 1995,
    mainGenreId: 10751, // Family
    tmdbId: 862,
    poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
  },
  {
    title: 'Saving Private Ryan',
    year: 1998,
    mainGenreId: 10752, // War
    tmdbId: 857,
    poster: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg',
  },
  {
    title: "Schindler's List",
    year: 1993,
    mainGenreId: 36, // History
    tmdbId: 424,
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  },
  {
    title: 'Bohemian Rhapsody',
    year: 2018,
    mainGenreId: 10402, // Music
    tmdbId: 424694,
    poster: 'https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
  },
  {
    title: 'Free Solo',
    year: 2018,
    mainGenreId: 99, // Documentary
    tmdbId: 515042,
    poster: 'https://image.tmdb.org/t/p/w500/v4QfYZMACODlWul9doN9RxE99ag.jpg',
  },
  {
    title: 'Django Unchained',
    year: 2012,
    mainGenreId: 37, // Western
    tmdbId: 68718,
    poster: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
  },
  {
    title: 'Forrest Gump',
    year: 1994,
    mainGenreId: 18, // Drama
    tmdbId: 13,
    poster: 'https://image.tmdb.org/t/p/w500/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg',
  },
  {
    title: 'Barbie',
    year: 2023,
    mainGenreId: 35, // Comedy
    tmdbId: 346698,
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
  },
  {
    title: 'Mad Max: Fury Road',
    year: 2015,
    mainGenreId: 28, // Action
    tmdbId: 76341,
    poster: 'https://image.tmdb.org/t/p/w500/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg',
  },
  {
    title: 'Blue Ruin',
    year: 2014,
    mainGenreId: 53, // Thriller
    tmdbId: 188166,
    poster: 'https://image.tmdb.org/t/p/w500/q0itEsso2drJXqH9kfdidxIT5dF.jpg',
  },
  {
    title: 'Dune',
    year: 2021,
    mainGenreId: 878, // Science Fiction
    tmdbId: 438631,
    poster: 'https://image.tmdb.org/t/p/w500/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg',
  },
  {
    title: 'Pulp Fiction',
    year: 1994,
    mainGenreId: 80, // Crime
    tmdbId: 680,
    poster: 'https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg',
  },
  {
    title: 'Back to the Future',
    year: 1985,
    mainGenreId: 12, // Adventure
    tmdbId: 105,
    poster: 'https://image.tmdb.org/t/p/w500/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg',
  },
  {
    title: 'The Handmaiden',
    year: 2016,
    mainGenreId: 10749, // Romance
    tmdbId: 290098,
    poster: 'https://image.tmdb.org/t/p/w500/dLlH4aNHdnmf62umnInL8xPlPzw.jpg',
  },
  {
    title: "Pan's Labyrinth",
    year: 2006,
    mainGenreId: 14, // Fantasy
    tmdbId: 1417,
    poster: 'https://image.tmdb.org/t/p/w500/z7xXihu5wHuSMWymq5VAulPVuvg.jpg',
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    mainGenreId: 16, // Animation
    tmdbId: 324857,
    poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
  },
  {
    title: 'Hereditary',
    year: 2018,
    mainGenreId: 27, // Horror
    tmdbId: 493922,
    poster: 'https://image.tmdb.org/t/p/w500/4GFPuL14eXi66V96xBWY73Y9PfR.jpg',
  },
  {
    title: 'Memento',
    year: 2000,
    mainGenreId: 9648, // Mystery
    tmdbId: 77,
    poster: 'https://image.tmdb.org/t/p/w500/nzlv62aC0octS5AklAiWpXLX9Z0.jpg',
  },
  {
    title: 'Paddington 2',
    year: 2017,
    mainGenreId: 10751, // Family
    tmdbId: 346648,
    poster: 'https://image.tmdb.org/t/p/w500/1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg',
  },
  {
    title: '1917',
    year: 2019,
    mainGenreId: 10752, // War
    tmdbId: 530915,
    poster: 'https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg',
  },
  {
    title: 'Oppenheimer',
    year: 2023,
    mainGenreId: 36, // History
    tmdbId: 872585,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  {
    title: 'Whiplash',
    year: 2014,
    mainGenreId: 10402, // Music
    tmdbId: 244786,
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
  },
  {
    title: 'Searching for Sugar Man',
    year: 2012,
    mainGenreId: 99, // Documentary
    tmdbId: 84334,
    poster: 'https://image.tmdb.org/t/p/w500/ucM98HuBHSWmn44oiE83hIDc6VB.jpg',
  },
  {
    title: 'The Good, the Bad and the Ugly',
    year: 1966,
    mainGenreId: 37, // Western
    tmdbId: 429,
    poster: 'https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
  },
];

// Series carry movie genre ids, the same as the chips — the feed translates
// them for TV. Only genres with a TV counterpart are used here, so a picked
// series can never lock a genre that does nothing for series.
export const SERIES: Title[] = [
  {
    title: 'Breaking Bad',
    year: 2008,
    mainGenreId: 18, // Drama
    tmdbId: 1396,
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
  },
  {
    title: 'The Office',
    year: 2005,
    mainGenreId: 35, // Comedy
    tmdbId: 2316,
    poster: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
  },
  {
    title: 'The Sopranos',
    year: 1999,
    mainGenreId: 80, // Crime
    tmdbId: 1398,
    poster: 'https://image.tmdb.org/t/p/w500/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg',
  },
  {
    title: 'Stranger Things',
    year: 2016,
    mainGenreId: 878, // Science Fiction
    tmdbId: 66732,
    poster: 'https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
  },
  {
    title: 'Sherlock',
    year: 2010,
    mainGenreId: 9648, // Mystery
    tmdbId: 19885,
    poster: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
  },
  {
    title: 'Squid Game',
    year: 2021,
    mainGenreId: 28, // Action
    tmdbId: 93405,
    poster: 'https://image.tmdb.org/t/p/w500/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg',
  },
  {
    title: 'Game of Thrones',
    year: 2011,
    mainGenreId: 14, // Fantasy
    tmdbId: 1399,
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  },
  {
    title: 'Arcane',
    year: 2021,
    mainGenreId: 16, // Animation
    tmdbId: 94605,
    poster: 'https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQeRr7do.jpg',
  },
  {
    title: 'The Mandalorian',
    year: 2019,
    mainGenreId: 12, // Adventure
    tmdbId: 82856,
    poster: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
  },
  {
    title: 'The Simpsons',
    year: 1989,
    mainGenreId: 10751, // Family
    tmdbId: 456,
    poster: 'https://image.tmdb.org/t/p/w500/uWpG7GqfKGQqX4YMAo3nv5OrglV.jpg',
  },
  {
    title: 'Planet Earth',
    year: 2006,
    mainGenreId: 99, // Documentary
    tmdbId: 1044,
    poster: 'https://image.tmdb.org/t/p/w500/bNcNxUtZ520d5de5s78onoiSiwQ.jpg',
  },
  {
    title: 'Band of Brothers',
    year: 2001,
    mainGenreId: 10752, // War
    tmdbId: 4613,
    poster: 'https://image.tmdb.org/t/p/w500/pGzV187ogXzgJrvPRy2YPi29ofH.jpg',
  },
  {
    title: 'Yellowstone',
    year: 2018,
    mainGenreId: 37, // Western
    tmdbId: 73586,
    poster: 'https://image.tmdb.org/t/p/w500/vOYfRZ0NpUK5hG2CB2dJFnYJlGe.jpg',
  },
  {
    title: 'Succession',
    year: 2018,
    mainGenreId: 18, // Drama
    tmdbId: 76331,
    poster: 'https://image.tmdb.org/t/p/w500/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
  },
  {
    title: 'Fleabag',
    year: 2016,
    mainGenreId: 35, // Comedy
    tmdbId: 67070,
    poster: 'https://image.tmdb.org/t/p/w500/27vEYsRKa3eAniwmoccOoluEXQ1.jpg',
  },
  {
    title: 'The Wire',
    year: 2002,
    mainGenreId: 80, // Crime
    tmdbId: 1438,
    poster: 'https://image.tmdb.org/t/p/w500/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
  },
  {
    title: 'Severance',
    year: 2022,
    mainGenreId: 878, // Science Fiction
    tmdbId: 95396,
    poster: 'https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
  },
  {
    title: 'Dark',
    year: 2017,
    mainGenreId: 9648, // Mystery
    tmdbId: 70523,
    poster: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
  },
  {
    title: 'The Boys',
    year: 2019,
    mainGenreId: 28, // Action
    tmdbId: 76479,
    poster: 'https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg',
  },
  {
    title: 'House of the Dragon',
    year: 2022,
    mainGenreId: 14, // Fantasy
    tmdbId: 94997,
    poster: 'https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg',
  },
  {
    title: 'BoJack Horseman',
    year: 2014,
    mainGenreId: 16, // Animation
    tmdbId: 61222,
    poster: 'https://image.tmdb.org/t/p/w500/6JFWzlChcGgLiIUo2COgNlWGFKy.jpg',
  },
  {
    title: 'Avatar: The Last Airbender',
    year: 2005,
    mainGenreId: 12, // Adventure
    tmdbId: 246,
    poster: 'https://image.tmdb.org/t/p/w500/yaGt4GIutpbXHsv48tWceWg6s56.jpg',
  },
  {
    title: 'Anne with an E',
    year: 2017,
    mainGenreId: 10751, // Family
    tmdbId: 70785,
    poster: 'https://image.tmdb.org/t/p/w500/6P6tXhjT5tK3qOXzxF9OMLlG7iz.jpg',
  },
  {
    title: "Chef's Table",
    year: 2015,
    mainGenreId: 99, // Documentary
    tmdbId: 62391,
    poster: 'https://image.tmdb.org/t/p/w500/2aTdai1vsWr2NjdYEBDxA2hffXb.jpg',
  },
  {
    title: 'The Pacific',
    year: 2010,
    mainGenreId: 10752, // War
    tmdbId: 16997,
    poster: 'https://image.tmdb.org/t/p/w500/x9Y1IMFdY8Ma222KcQadFEau0EB.jpg',
  },
  {
    title: 'Deadwood',
    year: 2004,
    mainGenreId: 37, // Western
    tmdbId: 1406,
    poster: 'https://image.tmdb.org/t/p/w500/fWwxYAuqY4Na7fKI3Qq2nFWCwG8.jpg',
  },
];

// Movie and series ids live in separate TMDB namespaces and can collide, so
// each pool keeps its own set.
export const MOVIE_IDS = new Set(MOVIES.map((title) => title.tmdbId));
export const SERIES_IDS = new Set(SERIES.map((title) => title.tmdbId));
