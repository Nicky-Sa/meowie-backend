// The hand-picked titles the taste wizard runs on. Every title needs a poster:
// the app has no artwork of its own to fall back on.
//
// Titles are picked to divide people, not to be the best films ever made —
// a title everybody likes says nothing about the person rating it.

export type GenreId = number;

export type Title = {
  title: string;
  year: number;
  mainGenreId: GenreId;
  tmdbId: number;
  poster: string;
};

// Grouped by genre for reading only — the deck is dealt one title per genre at
// a time, so the order here doesn't decide what the user sees first.

export const MOVIES: Title[] = [
  {
    title: 'Nomadland',
    year: 2021,
    mainGenreId: 18, // Drama
    tmdbId: 581734,
    poster: 'https://image.tmdb.org/t/p/w500/8Vc5EOUEIF1EUXuX9eLFf7BvN3P.jpg',
  },
  {
    title: 'Joker',
    year: 2019,
    mainGenreId: 18, // Drama
    tmdbId: 475557,
    poster: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
  },
  {
    title: 'Marriage Story',
    year: 2019,
    mainGenreId: 18, // Drama
    tmdbId: 492188,
    poster: 'https://image.tmdb.org/t/p/w500/2JRyCKaRKyJAVpsIHeLvPw5nHmw.jpg',
  },
  {
    title: 'Manchester by the Sea',
    year: 2016,
    mainGenreId: 18, // Drama
    tmdbId: 334541,
    poster: 'https://image.tmdb.org/t/p/w500/o9VXYOuaJxCEKOxbA86xqtwmqYn.jpg',
  },
  {
    title: 'Whiplash',
    year: 2014,
    mainGenreId: 18, // Drama
    tmdbId: 244786,
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
  },
  {
    title: 'The Tree of Life',
    year: 2011,
    mainGenreId: 18, // Drama
    tmdbId: 8967,
    poster: 'https://image.tmdb.org/t/p/w500/l8cwuB5WJSoj4uMAsnzuHBOMaSJ.jpg',
  },
  {
    title: 'Requiem for a Dream',
    year: 2000,
    mainGenreId: 18, // Drama
    tmdbId: 641,
    poster: 'https://image.tmdb.org/t/p/w500/9BTwsLaMVHOGFlmsSlx5QYCaXb.jpg',
  },
  {
    title: 'Forrest Gump',
    year: 1994,
    mainGenreId: 18, // Drama
    tmdbId: 13,
    poster: 'https://image.tmdb.org/t/p/w500/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg',
  },
  {
    title: 'Killers of the Flower Moon',
    year: 2023,
    mainGenreId: 80, // Crime
    tmdbId: 466420,
    poster: 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
  },
  {
    title: 'Uncut Gems',
    year: 2019,
    mainGenreId: 80, // Crime
    tmdbId: 473033,
    poster: 'https://image.tmdb.org/t/p/w500/6XN1vxHc7kUSqNWtaQKN45J5x2v.jpg',
  },
  {
    title: 'Nightcrawler',
    year: 2014,
    mainGenreId: 80, // Crime
    tmdbId: 242582,
    poster: 'https://image.tmdb.org/t/p/w500/j9HrX8f7GbZQm1BrBiR40uFQZSb.jpg',
  },
  {
    title: 'The Wolf of Wall Street',
    year: 2013,
    mainGenreId: 80, // Crime
    tmdbId: 106646,
    poster: 'https://image.tmdb.org/t/p/w500/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg',
  },
  {
    title: 'Drive',
    year: 2011,
    mainGenreId: 80, // Crime
    tmdbId: 64690,
    poster: 'https://image.tmdb.org/t/p/w500/602vevIURmpDfzbnv5Ubi6wIkQm.jpg',
  },
  {
    title: 'No Country for Old Men',
    year: 2007,
    mainGenreId: 80, // Crime
    tmdbId: 6977,
    poster: 'https://image.tmdb.org/t/p/w500/uB7RDZby43Wvu8SKGHHTwGyTDBX.jpg',
  },
  {
    title: 'Scarface',
    year: 1983,
    mainGenreId: 80, // Crime
    tmdbId: 111,
    poster: 'https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg',
  },
  {
    title: 'The Godfather',
    year: 1972,
    mainGenreId: 80, // Crime
    tmdbId: 238,
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
  {
    title: 'Barbie',
    year: 2023,
    mainGenreId: 35, // Comedy
    tmdbId: 346698,
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
  },
  {
    title: 'Jojo Rabbit',
    year: 2019,
    mainGenreId: 35, // Comedy
    tmdbId: 515001,
    poster: 'https://image.tmdb.org/t/p/w500/1mqL7VG4Ix8wmxwypmCA1HTHBky.jpg',
  },
  {
    title: 'The Death of Stalin',
    year: 2017,
    mainGenreId: 35, // Comedy
    tmdbId: 402897,
    poster: 'https://image.tmdb.org/t/p/w500/AqH7q89NxGRDAyRWKqsL3OBtYfV.jpg',
  },
  {
    title: 'Superbad',
    year: 2007,
    mainGenreId: 35, // Comedy
    tmdbId: 8363,
    poster: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg',
  },
  {
    title: 'Borat',
    year: 2006,
    mainGenreId: 35, // Comedy
    tmdbId: 496,
    poster: 'https://image.tmdb.org/t/p/w500/7g9kBHMN2KTr5KUf8aen187Mdn.jpg',
  },
  {
    title: 'Napoleon Dynamite',
    year: 2004,
    mainGenreId: 35, // Comedy
    tmdbId: 8193,
    poster: 'https://image.tmdb.org/t/p/w500/6Iv6Uwa2SBLN0dSGM00rdrwN4MJ.jpg',
  },
  {
    title: 'Anchorman: The Legend of Ron Burgundy',
    year: 2004,
    mainGenreId: 35, // Comedy
    tmdbId: 8699,
    poster: 'https://image.tmdb.org/t/p/w500/mhZIcRePT7U8viFQVjt1ZjYIsR4.jpg',
  },
  {
    title: 'The Big Lebowski',
    year: 1998,
    mainGenreId: 35, // Comedy
    tmdbId: 115,
    poster: 'https://image.tmdb.org/t/p/w500/3bv6WAp6BSxxYvB5ozKFUYuRA8C.jpg',
  },
  {
    title: 'Midsommar',
    year: 2019,
    mainGenreId: 27, // Horror
    tmdbId: 530385,
    poster: 'https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg',
  },
  {
    title: 'Hereditary',
    year: 2018,
    mainGenreId: 27, // Horror
    tmdbId: 493922,
    poster: 'https://image.tmdb.org/t/p/w500/4GFPuL14eXi66V96xBWY73Y9PfR.jpg',
  },
  {
    title: 'Get Out',
    year: 2017,
    mainGenreId: 27, // Horror
    tmdbId: 419430,
    poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
  },
  {
    title: 'The Witch',
    year: 2016,
    mainGenreId: 27, // Horror
    tmdbId: 310131,
    poster: 'https://image.tmdb.org/t/p/w500/zap5hpFCWSvdWSuPGAQyjUv2wAC.jpg',
  },
  {
    title: 'It Follows',
    year: 2015,
    mainGenreId: 27, // Horror
    tmdbId: 270303,
    poster: 'https://image.tmdb.org/t/p/w500/iwnQ1JH1wdWrGYkgWySptJ5284A.jpg',
  },
  {
    title: 'The Babadook',
    year: 2014,
    mainGenreId: 27, // Horror
    tmdbId: 242224,
    poster: 'https://image.tmdb.org/t/p/w500/qt3fqapeo94TfvMyld8P7gkpXLz.jpg',
  },
  {
    title: 'Saw',
    year: 2004,
    mainGenreId: 27, // Horror
    tmdbId: 176,
    poster: 'https://image.tmdb.org/t/p/w500/rLNSOudrayDBo1uqXjrhxcjODIC.jpg',
  },
  {
    title: 'The Shining',
    year: 1980,
    mainGenreId: 27, // Horror
    tmdbId: 694,
    poster: 'https://image.tmdb.org/t/p/w500/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg',
  },
  {
    title: 'Everything Everywhere All at Once',
    year: 2022,
    mainGenreId: 878, // Science Fiction
    tmdbId: 545611,
    poster: 'https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
  },
  {
    title: 'Dune',
    year: 2021,
    mainGenreId: 878, // Science Fiction
    tmdbId: 438631,
    poster: 'https://image.tmdb.org/t/p/w500/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg',
  },
  {
    title: 'Tenet',
    year: 2020,
    mainGenreId: 878, // Science Fiction
    tmdbId: 577922,
    poster: 'https://image.tmdb.org/t/p/w500/aCIFMriQh8rvhxpN1IWGgvH0Tlg.jpg',
  },
  {
    title: 'Annihilation',
    year: 2018,
    mainGenreId: 878, // Science Fiction
    tmdbId: 300668,
    poster: 'https://image.tmdb.org/t/p/w500/4YRplSk6BhH6PRuE9gfyw9byUJ6.jpg',
  },
  {
    title: 'Blade Runner 2049',
    year: 2017,
    mainGenreId: 878, // Science Fiction
    tmdbId: 335984,
    poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
  },
  {
    title: 'Interstellar',
    year: 2014,
    mainGenreId: 878, // Science Fiction
    tmdbId: 157336,
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
  },
  {
    title: 'Under the Skin',
    year: 2013,
    mainGenreId: 878, // Science Fiction
    tmdbId: 698232,
    poster: 'https://image.tmdb.org/t/p/w500/kX41SU4XFBbeXvVzEb0vbzpkGgO.jpg',
  },
  {
    title: 'Iron Man',
    year: 2008,
    mainGenreId: 878, // Science Fiction
    tmdbId: 1726,
    poster: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
  },
  {
    title: 'Alien',
    year: 1979,
    mainGenreId: 878, // Science Fiction
    tmdbId: 348,
    poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
  },
  {
    title: 'Star Wars',
    year: 1977,
    mainGenreId: 878, // Science Fiction
    tmdbId: 11,
    poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
  },
  {
    title: 'The Green Knight',
    year: 2021,
    mainGenreId: 14, // Fantasy
    tmdbId: 559907,
    poster: 'https://image.tmdb.org/t/p/w500/if4hw3Ou5Sav9Em7WWHj66mnywp.jpg',
  },
  {
    title: "Pan's Labyrinth",
    year: 2006,
    mainGenreId: 14, // Fantasy
    tmdbId: 1417,
    poster: 'https://image.tmdb.org/t/p/w500/z7xXihu5wHuSMWymq5VAulPVuvg.jpg',
  },
  {
    title: 'The Fall',
    year: 2006,
    mainGenreId: 14, // Fantasy
    tmdbId: 14784,
    poster: 'https://image.tmdb.org/t/p/w500/ez7xavvDr5yDz4sSvI55xDp0BoU.jpg',
  },
  {
    title: 'The Lord of the Rings',
    year: 2001,
    mainGenreId: 14, // Fantasy
    tmdbId: 120,
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    year: 2001,
    mainGenreId: 14, // Fantasy
    tmdbId: 671,
    poster: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
  },
  {
    title: 'Edward Scissorhands',
    year: 1990,
    mainGenreId: 14, // Fantasy
    tmdbId: 162,
    poster: 'https://image.tmdb.org/t/p/w500/e0FqKFvGPdQNWG8tF9cZBtev9Em.jpg',
  },
  {
    title: 'Baby Driver',
    year: 2017,
    mainGenreId: 28, // Action
    tmdbId: 339403,
    poster: 'https://image.tmdb.org/t/p/w500/tYzFuYXmT8LOYASlFCkaPiAFAl0.jpg',
  },
  {
    title: 'Mad Max: Fury Road',
    year: 2015,
    mainGenreId: 28, // Action
    tmdbId: 76341,
    poster: 'https://image.tmdb.org/t/p/w500/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg',
  },
  {
    title: 'John Wick',
    year: 2014,
    mainGenreId: 28, // Action
    tmdbId: 245891,
    poster: 'https://image.tmdb.org/t/p/w500/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg',
  },
  {
    title: 'The Raid',
    year: 2012,
    mainGenreId: 28, // Action
    tmdbId: 94329,
    poster: 'https://image.tmdb.org/t/p/w500/Abnm1Ws3JH0ReCfEhLMPwPcMcGO.jpg',
  },
  {
    title: 'Fast Five',
    year: 2011,
    mainGenreId: 28, // Action
    tmdbId: 51497,
    poster: 'https://image.tmdb.org/t/p/w500/gEfQjjQwY7fh5bI4GlG0RrBu7Pz.jpg',
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    mainGenreId: 28, // Action
    tmdbId: 155,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    title: 'Kill Bill: Vol. 1',
    year: 2003,
    mainGenreId: 28, // Action
    tmdbId: 24,
    poster: 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
  },
  {
    title: 'Parasite',
    year: 2019,
    mainGenreId: 53, // Thriller
    tmdbId: 496243,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    title: 'Gone Girl',
    year: 2014,
    mainGenreId: 53, // Thriller
    tmdbId: 210577,
    poster: 'https://image.tmdb.org/t/p/w500/ts996lKsxvjkO2yiYG0ht4qAicO.jpg',
  },
  {
    title: 'Prisoners',
    year: 2013,
    mainGenreId: 53, // Thriller
    tmdbId: 146233,
    poster: 'https://image.tmdb.org/t/p/w500/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg',
  },
  {
    title: 'Black Swan',
    year: 2010,
    mainGenreId: 53, // Thriller
    tmdbId: 44214,
    poster: 'https://image.tmdb.org/t/p/w500/viWheBd44bouiLCHgNMvahLThqx.jpg',
  },
  {
    title: 'Inception',
    year: 2010,
    mainGenreId: 53, // Thriller
    tmdbId: 27205,
    poster: 'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
  },
  {
    title: 'Zodiac',
    year: 2007,
    mainGenreId: 53, // Thriller
    tmdbId: 1949,
    poster: 'https://image.tmdb.org/t/p/w500/6YmeO4pB7XTh8P8F960O1uA14JO.jpg',
  },
  {
    title: 'Fight Club',
    year: 1999,
    mainGenreId: 53, // Thriller
    tmdbId: 550,
    poster: 'https://image.tmdb.org/t/p/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
  },
  {
    title: 'The Silence of the Lambs',
    year: 1991,
    mainGenreId: 53, // Thriller
    tmdbId: 274,
    poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg',
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    mainGenreId: 16, // Animation
    tmdbId: 324857,
    poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
  },
  {
    title: 'The Lego Movie',
    year: 2014,
    mainGenreId: 16, // Animation
    tmdbId: 137106,
    poster: 'https://image.tmdb.org/t/p/w500/lbctonEnewCYZ4FYoTZhs8cidAl.jpg',
  },
  {
    title: 'Coraline',
    year: 2009,
    mainGenreId: 16, // Animation
    tmdbId: 14836,
    poster: 'https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg',
  },
  {
    title: 'WALL·E',
    year: 2008,
    mainGenreId: 16, // Animation
    tmdbId: 10681,
    poster: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg',
  },
  {
    title: 'Persepolis',
    year: 2007,
    mainGenreId: 16, // Animation
    tmdbId: 2011,
    poster: 'https://image.tmdb.org/t/p/w500/aU8i2QAdTyRR1nYb36Gq51xXP8p.jpg',
  },
  {
    title: 'The Simpsons Movie',
    year: 2007,
    mainGenreId: 16, // Animation
    tmdbId: 35,
    poster: 'https://image.tmdb.org/t/p/w500/s3b8TZWwmkYc2KoJ5zk77qB6PzY.jpg',
  },
  {
    title: 'Spirited Away',
    year: 2001,
    mainGenreId: 16, // Animation
    tmdbId: 129,
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    title: 'The Revenant',
    year: 2015,
    mainGenreId: 12, // Adventure
    tmdbId: 281957,
    poster: 'https://image.tmdb.org/t/p/w500/ji3ecJphATlVgWNY0B0RVXZizdf.jpg',
  },
  {
    title: 'Life of Pi',
    year: 2012,
    mainGenreId: 12, // Adventure
    tmdbId: 87827,
    poster: 'https://image.tmdb.org/t/p/w500/iLgRu4hhSr6V1uManX6ukDriiSc.jpg',
  },
  {
    title: 'Into the Wild',
    year: 2007,
    mainGenreId: 12, // Adventure
    tmdbId: 5915,
    poster: 'https://image.tmdb.org/t/p/w500/jnLnLYP5pGDfri04gxtAqAvkHMw.jpg',
  },
  {
    title: 'Cast Away',
    year: 2000,
    mainGenreId: 12, // Adventure
    tmdbId: 8358,
    poster: 'https://image.tmdb.org/t/p/w500/7lLJgKnAicAcR5UEuo8xhSMj18w.jpg',
  },
  {
    title: 'The Beach',
    year: 2000,
    mainGenreId: 12, // Adventure
    tmdbId: 1907,
    poster: 'https://image.tmdb.org/t/p/w500/4y7LxD8TSi6AtsM2xSYqUm1gu7u.jpg',
  },
  {
    title: 'Raiders of the Lost Ark',
    year: 1981,
    mainGenreId: 12, // Adventure
    tmdbId: 85,
    poster: 'https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg',
  },
  {
    title: 'Knives Out',
    year: 2019,
    mainGenreId: 9648, // Mystery
    tmdbId: 546554,
    poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
  },
  {
    title: 'Shutter Island',
    year: 2010,
    mainGenreId: 9648, // Mystery
    tmdbId: 11324,
    poster: 'https://image.tmdb.org/t/p/w500/nrmXQ0zcZUL8jFLrakWc90IR8z9.jpg',
  },
  {
    title: 'The Prestige',
    year: 2006,
    mainGenreId: 9648, // Mystery
    tmdbId: 1124,
    poster: 'https://image.tmdb.org/t/p/w500/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg',
  },
  {
    title: 'Memento',
    year: 2000,
    mainGenreId: 9648, // Mystery
    tmdbId: 77,
    poster: 'https://image.tmdb.org/t/p/w500/nzlv62aC0octS5AklAiWpXLX9Z0.jpg',
  },
  {
    title: 'Se7en',
    year: 1995,
    mainGenreId: 9648, // Mystery
    tmdbId: 807,
    poster: 'https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg',
  },
  {
    title: 'Past Lives',
    year: 2023,
    mainGenreId: 10749, // Romance
    tmdbId: 666277,
    poster: 'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg',
  },
  {
    title: 'Call Me by Your Name',
    year: 2017,
    mainGenreId: 10749, // Romance
    tmdbId: 398818,
    poster: 'https://image.tmdb.org/t/p/w500/mZ4gBdfkhP9tvLH1DO4m4HYtiyi.jpg',
  },
  {
    title: 'La La Land',
    year: 2016,
    mainGenreId: 10749, // Romance
    tmdbId: 313369,
    poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
  },
  {
    title: '(500) Days of Summer',
    year: 2009,
    mainGenreId: 10749, // Romance
    tmdbId: 19913,
    poster: 'https://image.tmdb.org/t/p/w500/qXAuQ9hF30sQRsXf40OfRVl0MJZ.jpg',
  },
  {
    title: 'Twilight',
    year: 2008,
    mainGenreId: 10749, // Romance
    tmdbId: 8966,
    poster: 'https://image.tmdb.org/t/p/w500/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg',
  },
  {
    title: 'Titanic',
    year: 1997,
    mainGenreId: 10749, // Romance
    tmdbId: 597,
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
  },
  {
    title: 'Elvis',
    year: 2022,
    mainGenreId: 10402, // Music
    tmdbId: 614934,
    poster: 'https://image.tmdb.org/t/p/w500/qBOKWqAFbveZ4ryjJJwbie6tXkQ.jpg',
  },
  {
    title: 'Rocketman',
    year: 2019,
    mainGenreId: 10402, // Music
    tmdbId: 504608,
    poster: 'https://image.tmdb.org/t/p/w500/f4FF18ia7yTvHf2izNrHqBmgH8U.jpg',
  },
  {
    title: 'Bohemian Rhapsody',
    year: 2018,
    mainGenreId: 10402, // Music
    tmdbId: 424694,
    poster: 'https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
  },
  {
    title: 'A Star Is Born',
    year: 2018,
    mainGenreId: 10402, // Music
    tmdbId: 332562,
    poster: 'https://image.tmdb.org/t/p/w500/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg',
  },
  {
    title: 'Amadeus',
    year: 1984,
    mainGenreId: 10402, // Music
    tmdbId: 279,
    poster: 'https://image.tmdb.org/t/p/w500/gQRfiyfGvr1az0quaYyMram3Aqt.jpg',
  },
  {
    title: 'Oppenheimer',
    year: 2023,
    mainGenreId: 36, // History
    tmdbId: 872585,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  {
    title: 'The Favourite',
    year: 2018,
    mainGenreId: 36, // History
    tmdbId: 375262,
    poster: 'https://image.tmdb.org/t/p/w500/cwBq0onfmeilU5xgqNNjJAMPfpw.jpg',
  },
  {
    title: 'Gladiator',
    year: 2000,
    mainGenreId: 36, // History
    tmdbId: 98,
    poster: 'https://image.tmdb.org/t/p/w500/wN2xWp1eIwCKOD0BHTcErTBv1Uq.jpg',
  },
  {
    title: 'Braveheart',
    year: 1995,
    mainGenreId: 36, // History
    tmdbId: 197,
    poster: 'https://image.tmdb.org/t/p/w500/or1gBugydmjToAEq7OZY0owwFk.jpg',
  },
  {
    title: "Schindler's List",
    year: 1993,
    mainGenreId: 36, // History
    tmdbId: 424,
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  },
  {
    title: '1917',
    year: 2019,
    mainGenreId: 10752, // War
    tmdbId: 530915,
    poster: 'https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg',
  },
  {
    title: 'Dunkirk',
    year: 2017,
    mainGenreId: 10752, // War
    tmdbId: 374720,
    poster: 'https://image.tmdb.org/t/p/w500/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg',
  },
  {
    title: 'American Sniper',
    year: 2014,
    mainGenreId: 10752, // War
    tmdbId: 190859,
    poster: 'https://image.tmdb.org/t/p/w500/i1U46OwMc6vlm7OoSUKfqUH615e.jpg',
  },
  {
    title: 'Full Metal Jacket',
    year: 1987,
    mainGenreId: 10752, // War
    tmdbId: 600,
    poster: 'https://image.tmdb.org/t/p/w500/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg',
  },
  {
    title: 'Apocalypse Now',
    year: 1979,
    mainGenreId: 10752, // War
    tmdbId: 28,
    poster: 'https://image.tmdb.org/t/p/w500/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg',
  },
  {
    title: 'The Power of the Dog',
    year: 2021,
    mainGenreId: 37, // Western
    tmdbId: 600583,
    poster: 'https://image.tmdb.org/t/p/w500/kEy48iCzGnp0ao1cZbNeWR6yIhC.jpg',
  },
  {
    title: 'The Hateful Eight',
    year: 2015,
    mainGenreId: 37, // Western
    tmdbId: 273248,
    poster: 'https://image.tmdb.org/t/p/w500/jIywvdPjia2t3eKYbjVTcwBQlG8.jpg',
  },
  {
    title: 'Django Unchained',
    year: 2012,
    mainGenreId: 37, // Western
    tmdbId: 68718,
    poster: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
  },
  {
    title: 'True Grit',
    year: 2010,
    mainGenreId: 37, // Western
    tmdbId: 44264,
    poster: 'https://image.tmdb.org/t/p/w500/tCrB8pcjadZjsDk7rleGJaIv78k.jpg',
  },
  {
    title: 'Once Upon a Time in the West',
    year: 1968,
    mainGenreId: 37, // Western
    tmdbId: 335,
    poster: 'https://image.tmdb.org/t/p/w500/qbYgqOczabWNn2XKwgMtVrntD6P.jpg',
  },
  {
    title: 'My Octopus Teacher',
    year: 2020,
    mainGenreId: 99, // Documentary
    tmdbId: 682110,
    poster: 'https://image.tmdb.org/t/p/w500/hvTVZb7hBC8tZAGoEhH5eiMJu2B.jpg',
  },
  {
    title: 'Fyre',
    year: 2019,
    mainGenreId: 99, // Documentary
    tmdbId: 567860,
    poster: 'https://image.tmdb.org/t/p/w500/yFsP0BAJhAH3RTXCAnGvI1CtaUb.jpg',
  },
  {
    title: 'Free Solo',
    year: 2018,
    mainGenreId: 99, // Documentary
    tmdbId: 515042,
    poster: 'https://image.tmdb.org/t/p/w500/v4QfYZMACODlWul9doN9RxE99ag.jpg',
  },
  {
    title: "Won't You Be My Neighbor?",
    year: 2018,
    mainGenreId: 99, // Documentary
    tmdbId: 490003,
    poster: 'https://image.tmdb.org/t/p/w500/8qE8NZjiP2M884baH0VoLF828Vp.jpg',
  },
  {
    title: 'Blackfish',
    year: 2013,
    mainGenreId: 99, // Documentary
    tmdbId: 158999,
    poster: 'https://image.tmdb.org/t/p/w500/kCk4mDFE96Mn1AYfEcbxkIiw7ND.jpg',
  },
  {
    title: 'Paddington 2',
    year: 2017,
    mainGenreId: 10751, // Family
    tmdbId: 346648,
    poster: 'https://image.tmdb.org/t/p/w500/1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg',
  },
  {
    title: 'Matilda',
    year: 1996,
    mainGenreId: 10751, // Family
    tmdbId: 10830,
    poster: 'https://image.tmdb.org/t/p/w500/wYoDpWInsBEVSmWStnRH06ddoyk.jpg',
  },
  {
    title: 'Home Alone',
    year: 1990,
    mainGenreId: 10751, // Family
    tmdbId: 771,
    poster: 'https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg',
  },
  {
    title: 'Rocky',
    year: 1976,
    mainGenreId: 10751, // Family
    tmdbId: 1366,
    poster: 'https://image.tmdb.org/t/p/w500/aYtBYWqCdUqcnoodWJdcTG3pFev.jpg',
  },
  {
    title: 'Willy Wonka & the Chocolate Factory',
    year: 1971,
    mainGenreId: 10751, // Family
    tmdbId: 252,
    poster: 'https://image.tmdb.org/t/p/w500/vmpsZkrs4Uvkp9r1atL8B3frA63.jpg',
  },
];

export const SERIES: Title[] = [
  {
    title: 'Euphoria',
    year: 2019,
    mainGenreId: 18, // Drama
    tmdbId: 85552,
    poster: 'https://image.tmdb.org/t/p/w500/ypmtwojDd751Peszi62DVLytqqC.jpg',
  },
  {
    title: 'Succession',
    year: 2018,
    mainGenreId: 18, // Drama
    tmdbId: 76331,
    poster: 'https://image.tmdb.org/t/p/w500/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
  },
  {
    title: "The Handmaid's Tale",
    year: 2017,
    mainGenreId: 18, // Drama
    tmdbId: 69478,
    poster: 'https://image.tmdb.org/t/p/w500/eGUT7j3n3rn5yGihlCgwUnD70HV.jpg',
  },
  {
    title: 'This Is Us',
    year: 2016,
    mainGenreId: 18, // Drama
    tmdbId: 67136,
    poster: 'https://image.tmdb.org/t/p/w500/huxmY6Dmzwpv5Q2hnNft0UMK7vf.jpg',
  },
  {
    title: 'Mr. Robot',
    year: 2015,
    mainGenreId: 18, // Drama
    tmdbId: 62560,
    poster: 'https://image.tmdb.org/t/p/w500/kv1nRqgebSsREnd7vdC2pSGjpLo.jpg',
  },
  {
    title: 'The Sopranos',
    year: 1999,
    mainGenreId: 18, // Drama
    tmdbId: 1398,
    poster: 'https://image.tmdb.org/t/p/w500/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg',
  },
  {
    title: 'You',
    year: 2018,
    mainGenreId: 80, // Crime
    tmdbId: 78191,
    poster: 'https://image.tmdb.org/t/p/w500/oANi0vEE92nuijiZQgPZ88FSxqQ.jpg',
  },
  {
    title: 'Ozark',
    year: 2017,
    mainGenreId: 80, // Crime
    tmdbId: 69740,
    poster: 'https://image.tmdb.org/t/p/w500/pCGyPVrI9Fzw6rE1Pvi4BIXF6ET.jpg',
  },
  {
    title: 'Narcos',
    year: 2015,
    mainGenreId: 80, // Crime
    tmdbId: 63351,
    poster: 'https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg',
  },
  {
    title: 'Peaky Blinders',
    year: 2013,
    mainGenreId: 80, // Crime
    tmdbId: 60574,
    poster: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
  },
  {
    title: 'Breaking Bad',
    year: 2008,
    mainGenreId: 80, // Crime
    tmdbId: 1396,
    poster: 'https://image.tmdb.org/t/p/w500/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
  },
  {
    title: 'Ted Lasso',
    year: 2020,
    mainGenreId: 35, // Comedy
    tmdbId: 97546,
    poster: 'https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg',
  },
  {
    title: 'Fleabag',
    year: 2016,
    mainGenreId: 35, // Comedy
    tmdbId: 67070,
    poster: 'https://image.tmdb.org/t/p/w500/27vEYsRKa3eAniwmoccOoluEXQ1.jpg',
  },
  {
    title: 'The Office',
    year: 2005,
    mainGenreId: 35, // Comedy
    tmdbId: 2316,
    poster: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
  },
  {
    title: "It's Always Sunny in Philadelphia",
    year: 2005,
    mainGenreId: 35, // Comedy
    tmdbId: 2710,
    poster: 'https://image.tmdb.org/t/p/w500/o0tMMK33JqmtpcWw0H41cEr9xQB.jpg',
  },
  {
    title: 'Seinfeld',
    year: 1989,
    mainGenreId: 35, // Comedy
    tmdbId: 1400,
    poster: 'https://image.tmdb.org/t/p/w500/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg',
  },
  {
    title: 'Severance',
    year: 2022,
    mainGenreId: 878, // Science Fiction
    tmdbId: 95396,
    poster: 'https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
  },
  {
    title: 'Foundation',
    year: 2021,
    mainGenreId: 878, // Science Fiction
    tmdbId: 93740,
    poster: 'https://image.tmdb.org/t/p/w500/tg9I5pOY4M9CKj8U0cxVBTsm5eh.jpg',
  },
  {
    title: 'Stranger Things',
    year: 2016,
    mainGenreId: 878, // Science Fiction
    tmdbId: 66732,
    poster: 'https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
  },
  {
    title: 'Westworld',
    year: 2016,
    mainGenreId: 878, // Science Fiction
    tmdbId: 63247,
    poster: 'https://image.tmdb.org/t/p/w500/ALlSU9du9iRiKIIoY1sREGNqQ5.jpg',
  },
  {
    title: 'Black Mirror',
    year: 2011,
    mainGenreId: 878, // Science Fiction
    tmdbId: 42009,
    poster: 'https://image.tmdb.org/t/p/w500/seN6rRfN0I6n8iDXjlSMk1QjNcq.jpg',
  },
  {
    title: 'The Lord of the Rings',
    year: 2022,
    mainGenreId: 14, // Fantasy
    tmdbId: 84773,
    poster: 'https://image.tmdb.org/t/p/w500/kf5Hz70tjNAHg4swGDzOr9BfoZ1.jpg',
  },
  {
    title: 'The Witcher',
    year: 2019,
    mainGenreId: 14, // Fantasy
    tmdbId: 71912,
    poster: 'https://image.tmdb.org/t/p/w500/AoGsDM02UVt0npBA8OvpDcZbaMi.jpg',
  },
  {
    title: 'His Dark Materials',
    year: 2019,
    mainGenreId: 14, // Fantasy
    tmdbId: 68507,
    poster: 'https://image.tmdb.org/t/p/w500/g6tIKGc3f1H5QMz1dcgCwADKpZ7.jpg',
  },
  {
    title: 'Game of Thrones',
    year: 2011,
    mainGenreId: 14, // Fantasy
    tmdbId: 1399,
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  },
  {
    title: 'Squid Game',
    year: 2021,
    mainGenreId: 28, // Action
    tmdbId: 93405,
    poster: 'https://image.tmdb.org/t/p/w500/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg',
  },
  {
    title: 'The Boys',
    year: 2019,
    mainGenreId: 28, // Action
    tmdbId: 76479,
    poster: 'https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg',
  },
  {
    title: 'The Mandalorian',
    year: 2019,
    mainGenreId: 28, // Action
    tmdbId: 82856,
    poster: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
  },
  {
    title: 'Lost',
    year: 2004,
    mainGenreId: 28, // Action
    tmdbId: 4607,
    poster: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
  },
  {
    title: 'Dark',
    year: 2017,
    mainGenreId: 9648, // Mystery
    tmdbId: 70523,
    poster: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
  },
  {
    title: 'True Detective',
    year: 2014,
    mainGenreId: 9648, // Mystery
    tmdbId: 46648,
    poster: 'https://image.tmdb.org/t/p/w500/dC7jkj2g1aU8sxKqM6D4g44xA6w.jpg',
  },
  {
    title: 'The Killing',
    year: 2011,
    mainGenreId: 9648, // Mystery
    tmdbId: 34415,
    poster: 'https://image.tmdb.org/t/p/w500/3yiwAUNGn1rsPSVmFgVwPVJFtYf.jpg',
  },
  {
    title: 'Sherlock',
    year: 2010,
    mainGenreId: 9648, // Mystery
    tmdbId: 19885,
    poster: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
  },
  {
    title: 'Arcane',
    year: 2021,
    mainGenreId: 16, // Animation
    tmdbId: 94605,
    poster: 'https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQeRr7do.jpg',
  },
  {
    title: 'BoJack Horseman',
    year: 2014,
    mainGenreId: 16, // Animation
    tmdbId: 61222,
    poster: 'https://image.tmdb.org/t/p/w500/6JFWzlChcGgLiIUo2COgNlWGFKy.jpg',
  },
  {
    title: 'Rick and Morty',
    year: 2013,
    mainGenreId: 16, // Animation
    tmdbId: 60625,
    poster: 'https://image.tmdb.org/t/p/w500/owhkU6KRqdXoUQpjV8uyZGPtX58.jpg',
  },
  {
    title: 'Attack on Titan',
    year: 2013,
    mainGenreId: 16, // Animation
    tmdbId: 1429,
    poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
  },
  {
    title: 'Avatar: The Last Airbender',
    year: 2005,
    mainGenreId: 16, // Animation
    tmdbId: 246,
    poster: 'https://image.tmdb.org/t/p/w500/yaGt4GIutpbXHsv48tWceWg6s56.jpg',
  },
  {
    title: 'The Simpsons',
    year: 1989,
    mainGenreId: 16, // Animation
    tmdbId: 456,
    poster: 'https://image.tmdb.org/t/p/w500/uWpG7GqfKGQqX4YMAo3nv5OrglV.jpg',
  },
  {
    title: 'Shōgun',
    year: 2024,
    mainGenreId: 36, // History
    tmdbId: 126308,
    poster: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
  },
  {
    title: 'Chernobyl',
    year: 2019,
    mainGenreId: 36, // History
    tmdbId: 87108,
    poster: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
  },
  {
    title: 'The Crown',
    year: 2016,
    mainGenreId: 36, // History
    tmdbId: 65494,
    poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
  },
  {
    title: 'Vikings',
    year: 2013,
    mainGenreId: 36, // History
    tmdbId: 44217,
    poster: 'https://image.tmdb.org/t/p/w500/bQLrHIRNEkE3PdIWQrZHynQZazu.jpg',
  },
  {
    title: 'Rome',
    year: 2005,
    mainGenreId: 36, // History
    tmdbId: 1891,
    poster: 'https://image.tmdb.org/t/p/w500/1A1BwgWO3Sw379VEhR0vkTuE3XW.jpg',
  },
  {
    title: 'SAS Rogue Heroes',
    year: 2022,
    mainGenreId: 10752, // War
    tmdbId: 93870,
    poster: 'https://image.tmdb.org/t/p/w500/Tc1mRuP5QrGaetGKcitZkhTU9g.jpg',
  },
  {
    title: 'The Pacific',
    year: 2010,
    mainGenreId: 10752, // War
    tmdbId: 16997,
    poster: 'https://image.tmdb.org/t/p/w500/x9Y1IMFdY8Ma222KcQadFEau0EB.jpg',
  },
  {
    title: 'Generation Kill',
    year: 2008,
    mainGenreId: 10752, // War
    tmdbId: 17035,
    poster: 'https://image.tmdb.org/t/p/w500/wiihoYOODwh82xVzPoiaztlg6c9.jpg',
  },
  {
    title: 'Band of Brothers',
    year: 2001,
    mainGenreId: 10752, // War
    tmdbId: 4613,
    poster: 'https://image.tmdb.org/t/p/w500/pGzV187ogXzgJrvPRy2YPi29ofH.jpg',
  },
  {
    title: 'M*A*S*H',
    year: 1972,
    mainGenreId: 10752, // War
    tmdbId: 918,
    poster: 'https://image.tmdb.org/t/p/w500/6rhuM3oMoEWKxAdrm7IyM8oq8cC.jpg',
  },
  {
    title: 'The Last of Us',
    year: 2023,
    mainGenreId: 27, // Horror
    tmdbId: 100088,
    poster: 'https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
  },
  {
    title: 'Midnight Mass',
    year: 2021,
    mainGenreId: 27, // Horror
    tmdbId: 97400,
    poster: 'https://image.tmdb.org/t/p/w500/3eVSQJdiBin6A7F7nsg62eJFf0Y.jpg',
  },
  {
    title: 'The Haunting of Hill House',
    year: 2018,
    mainGenreId: 27, // Horror
    tmdbId: 72844,
    poster: 'https://image.tmdb.org/t/p/w500/nWPZb800NCGiDPNGsKCfY0w44Z2.jpg',
  },
  {
    title: 'American Horror Story',
    year: 2011,
    mainGenreId: 27, // Horror
    tmdbId: 1413,
    poster: 'https://image.tmdb.org/t/p/w500/x2c3AvZeTyNehRZXabTojAxfDuR.jpg',
  },
  {
    title: 'The Walking Dead',
    year: 2010,
    mainGenreId: 27, // Horror
    tmdbId: 1402,
    poster: 'https://image.tmdb.org/t/p/w500/aN29llVoCFtBTwDZFtqdD9d8dHb.jpg',
  },
  {
    title: '1883',
    year: 2021,
    mainGenreId: 37, // Western
    tmdbId: 118357,
    poster: 'https://image.tmdb.org/t/p/w500/waLbm384SQDwLTCn6ttPqQS5kfV.jpg',
  },
  {
    title: 'Yellowstone',
    year: 2018,
    mainGenreId: 37, // Western
    tmdbId: 73586,
    poster: 'https://image.tmdb.org/t/p/w500/vOYfRZ0NpUK5hG2CB2dJFnYJlGe.jpg',
  },
  {
    title: 'Godless',
    year: 2017,
    mainGenreId: 37, // Western
    tmdbId: 73467,
    poster: 'https://image.tmdb.org/t/p/w500/ePOD0ofGWFDTbZR84QhM7kpYMPX.jpg',
  },
  {
    title: 'Hell on Wheels',
    year: 2011,
    mainGenreId: 37, // Western
    tmdbId: 1401,
    poster: 'https://image.tmdb.org/t/p/w500/ckC9pL9yeYpOoK5aJ7GbYYWheK7.jpg',
  },
  {
    title: 'Deadwood',
    year: 2004,
    mainGenreId: 37, // Western
    tmdbId: 1406,
    poster: 'https://image.tmdb.org/t/p/w500/fWwxYAuqY4Na7fKI3Qq2nFWCwG8.jpg',
  },
  {
    title: 'Tiger King',
    year: 2020,
    mainGenreId: 99, // Documentary
    tmdbId: 100698,
    poster: 'https://image.tmdb.org/t/p/w500/dXQCEjVth8P8L47XIsoRt0oL8Gw.jpg',
  },
  {
    title: 'The Last Dance',
    year: 2020,
    mainGenreId: 99, // Documentary
    tmdbId: 79525,
    poster: 'https://image.tmdb.org/t/p/w500/oVf4xGGbDtwVHiKn8uTuSriY7PH.jpg',
  },
  {
    title: 'Making a Murderer',
    year: 2015,
    mainGenreId: 99, // Documentary
    tmdbId: 64439,
    poster: 'https://image.tmdb.org/t/p/w500/sy2nV3rCcJQaRK5M0NWvvTU7CBx.jpg',
  },
  {
    title: "Chef's Table",
    year: 2015,
    mainGenreId: 99, // Documentary
    tmdbId: 62391,
    poster: 'https://image.tmdb.org/t/p/w500/2aTdai1vsWr2NjdYEBDxA2hffXb.jpg',
  },
  {
    title: 'Planet Earth',
    year: 2006,
    mainGenreId: 99, // Documentary
    tmdbId: 1044,
    poster: 'https://image.tmdb.org/t/p/w500/bNcNxUtZ520d5de5s78onoiSiwQ.jpg',
  },
  {
    title: 'Heartstopper',
    year: 2022,
    mainGenreId: 10749, // Romance
    tmdbId: 124834,
    poster: 'https://image.tmdb.org/t/p/w500/dQc0QbDiHjGmWxTfKtBgYtS4bj5.jpg',
  },
  {
    title: 'Normal People',
    year: 2020,
    mainGenreId: 10749, // Romance
    tmdbId: 89905,
    poster: 'https://image.tmdb.org/t/p/w500/c4mk4EQVIM11yd3W43DDdqDazDU.jpg',
  },
  {
    title: 'Bridgerton',
    year: 2020,
    mainGenreId: 10749, // Romance
    tmdbId: 91239,
    poster: 'https://image.tmdb.org/t/p/w500/uXTg565ahu9RwonCX1V2Hex1NU6.jpg',
  },
  {
    title: 'Modern Love',
    year: 2019,
    mainGenreId: 10749, // Romance
    tmdbId: 91602,
    poster: 'https://image.tmdb.org/t/p/w500/cP9CJ9nvPT3cnnBSlGFgwq7odIR.jpg',
  },
  {
    title: 'Outlander',
    year: 2014,
    mainGenreId: 10749, // Romance
    tmdbId: 56570,
    poster: 'https://image.tmdb.org/t/p/w500/oftZNfyTVNU7IfOqoGLoT8MGvNs.jpg',
  },
];

// Movie and series ids live in separate TMDB namespaces and can collide, so
// each pool keeps its own set.
export const MOVIE_IDS = new Set(MOVIES.map((title) => title.tmdbId));
export const SERIES_IDS = new Set(SERIES.map((title) => title.tmdbId));
