export type KeywordId = `${string}_${number}`; // GenreName_KeywordTMDBId

export type Keyword = {
  id: KeywordId;
  label: string;
};

export type TasteGenre = {
  id: number;
  name: string;
  emoji: string;
  mediaType: 'movie' | 'series' | 'shared';
  keywords: Keyword[];
};

export const TASTE_GENRES: TasteGenre[] = [
  {
    id: 28,
    name: 'Action',
    emoji: '💥',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Action_2343',
        label: 'Magic',
      },
      {
        id: 'Action_9715',
        label: 'Superhero',
      },
      {
        id: 'Action_10292',
        label: 'Gore',
      },
      {
        id: 'Action_188955',
        label: 'Hand to hand combat',
      },
      {
        id: 'Action_269233',
        label: 'Good versus evil',
      },
      {
        id: 'Action_33637',
        label: 'Super power',
      },
      {
        id: 'Action_155030',
        label: 'Superhero team',
      },
      {
        id: 'Action_1501',
        label: 'Allegory',
      },
      {
        id: 'Action_2095',
        label: 'Anti hero',
      },
      {
        id: 'Action_10085',
        label: 'Betrayal',
      },
    ],
  },
  {
    id: 12,
    name: 'Adventure',
    emoji: '🏕️',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Adventure_2343',
        label: 'Magic',
      },
      {
        id: 'Adventure_9715',
        label: 'Superhero',
      },
      {
        id: 'Adventure_3289',
        label: 'Villain',
      },
      {
        id: 'Adventure_9882',
        label: 'Space',
      },
      {
        id: 'Adventure_11477',
        label: 'Anthropomorphism',
      },
      {
        id: 'Adventure_6054',
        label: 'Friendship',
      },
      {
        id: 'Adventure_3801',
        label: 'Space travel',
      },
      {
        id: 'Adventure_155030',
        label: 'Superhero team',
      },
      {
        id: 'Adventure_33637',
        label: 'Super power',
      },
      {
        id: 'Adventure_180734',
        label: 'Masked superhero',
      },
    ],
  },
  {
    id: 14,
    name: 'Fantasy',
    emoji: '🧙‍♂️',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Fantasy_2343',
        label: 'Magic',
      },
      {
        id: 'Fantasy_616',
        label: 'Witch',
      },
      {
        id: 'Fantasy_269233',
        label: 'Good versus evil',
      },
      {
        id: 'Fantasy_177912',
        label: 'Wizard',
      },
      {
        id: 'Fantasy_3289',
        label: 'Villain',
      },
      {
        id: 'Fantasy_162846',
        label: 'Ghost',
      },
      {
        id: 'Fantasy_336530',
        label: 'Teen fantasy',
      },
      {
        id: 'Fantasy_170362',
        label: 'Fantasy world',
      },
      {
        id: 'Fantasy_14643',
        label: 'Battle',
      },
      {
        id: 'Fantasy_6054',
        label: 'Friendship',
      },
    ],
  },
  {
    id: 36,
    name: 'History',
    emoji: '🏛️',
    mediaType: 'movie',
    keywords: [
      {
        id: 'History_1956',
        label: 'World war ii',
      },
      {
        id: 'History_5565',
        label: 'Biography',
      },
      {
        id: 'History_192772',
        label: 'Historical drama',
      },
      {
        id: 'History_12995',
        label: 'Historical fiction',
      },
      {
        id: 'History_15060',
        label: 'Period drama',
      },
      {
        id: 'History_207883',
        label: '1940s',
      },
      {
        id: 'History_697',
        label: 'Loss of loved one',
      },
      {
        id: 'History_11001',
        label: 'Religion',
      },
      {
        id: 'History_9725',
        label: 'Sword fight',
      },
      {
        id: 'History_158718',
        label: 'LGBT',
      },
    ],
  },
  {
    id: 27,
    name: 'Horror',
    emoji: '👻',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Horror_256183',
        label: 'Supernatural horror',
      },
      {
        id: 'Horror_6152',
        label: 'Supernatural',
      },
      {
        id: 'Horror_295907',
        label: 'Psychological horror',
      },
      {
        id: 'Horror_315058',
        label: 'Horror',
      },
      {
        id: 'Horror_9826',
        label: 'Murder',
      },
      {
        id: 'Horror_1299',
        label: 'Monster',
      },
      {
        id: 'Horror_4720',
        label: 'Ritual',
      },
      {
        id: 'Horror_50009',
        label: 'Survival horror',
      },
      {
        id: 'Horror_10714',
        label: 'Serial killer',
      },
      {
        id: 'Horror_12339',
        label: 'Slasher',
      },
    ],
  },
  {
    id: 10402,
    name: 'Music',
    emoji: '🎸',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Music_4344',
        label: 'Musical',
      },
      {
        id: 'Music_4048',
        label: 'Musician',
      },
      {
        id: 'Music_6029',
        label: 'Concert',
      },
      {
        id: 'Music_10229',
        label: 'Singer',
      },
      {
        id: 'Music_325761',
        label: 'Admiring',
      },
      {
        id: 'Music_5565',
        label: 'Biography',
      },
      {
        id: 'Music_246',
        label: 'Dancing',
      },
      {
        id: 'Music_3490',
        label: 'Pop star',
      },
      {
        id: 'Music_242',
        label: 'New york city',
      },
      {
        id: 'Music_578',
        label: "Rock 'n' roll",
      },
    ],
  },
  {
    id: 10749,
    name: 'Romance',
    emoji: '💖',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Romance_9673',
        label: 'Love',
      },
      {
        id: 'Romance_158713',
        label: 'Bdsm',
      },
      {
        id: 'Romance_324429',
        label: 'Romantic',
      },
      {
        id: 'Romance_304976',
        label: 'Romantic drama',
      },
      {
        id: 'Romance_1664',
        label: 'Eroticism',
      },
      {
        id: 'Romance_3691',
        label: 'Forbidden love',
      },
      {
        id: 'Romance_10614',
        label: 'Tragedy',
      },
      {
        id: 'Romance_267122',
        label: 'Sex',
      },
      {
        id: 'Romance_697',
        label: 'Loss of loved one',
      },
      {
        id: 'Romance_34094',
        label: 'Extramarital affair',
      },
    ],
  },
  {
    id: 878,
    name: 'Science Fiction',
    emoji: '👽',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Science Fiction_9715',
        label: 'Superhero',
      },
      {
        id: 'Science Fiction_4565',
        label: 'Dystopia',
      },
      {
        id: 'Science Fiction_33637',
        label: 'Super power',
      },
      {
        id: 'Science Fiction_3801',
        label: 'Space travel',
      },
      {
        id: 'Science Fiction_9882',
        label: 'Space',
      },
      {
        id: 'Science Fiction_155030',
        label: 'Superhero team',
      },
      {
        id: 'Science Fiction_242',
        label: 'New york city',
      },
      {
        id: 'Science Fiction_310',
        label: 'Artificial intelligence (a.i.)',
      },
      {
        id: 'Science Fiction_348204',
        label: 'Dystopian',
      },
      {
        id: 'Science Fiction_1308',
        label: 'Secret identity',
      },
    ],
  },
  {
    id: 10770,
    name: 'TV Movie',
    emoji: '📺',
    mediaType: 'movie',
    keywords: [
      {
        id: 'TV Movie_4344',
        label: 'Musical',
      },
      {
        id: 'TV Movie_6270',
        label: 'High school',
      },
      {
        id: 'TV Movie_65',
        label: 'Holiday',
      },
      {
        id: 'TV Movie_2343',
        label: 'Magic',
      },
      {
        id: 'TV Movie_3289',
        label: 'Villain',
      },
      {
        id: 'TV Movie_10683',
        label: 'Coming of age',
      },
      {
        id: 'TV Movie_10244',
        label: 'Based on cartoon',
      },
      {
        id: 'TV Movie_931',
        label: 'Jealousy',
      },
      {
        id: 'TV Movie_703',
        label: 'Detective',
      },
      {
        id: 'TV Movie_264598',
        label: 'Tv special',
      },
    ],
  },
  {
    id: 53,
    name: 'Thriller',
    emoji: '🤯',
    mediaType: 'movie',
    keywords: [
      {
        id: 'Thriller_5265',
        label: 'Espionage',
      },
      {
        id: 'Thriller_10292',
        label: 'Gore',
      },
      {
        id: 'Thriller_10085',
        label: 'Betrayal',
      },
      {
        id: 'Thriller_9826',
        label: 'Murder',
      },
      {
        id: 'Thriller_314730',
        label: 'Suspenseful',
      },
      {
        id: 'Thriller_10349',
        label: 'Survival',
      },
      {
        id: 'Thriller_50009',
        label: 'Survival horror',
      },
      {
        id: 'Thriller_12377',
        label: 'Zombie',
      },
      {
        id: 'Thriller_207268',
        label: 'Neo_noir',
      },
      {
        id: 'Thriller_6149',
        label: 'Police',
      },
    ],
  },
  {
    id: 10752,
    name: 'War',
    emoji: '⚔️',
    mediaType: 'movie',
    keywords: [
      {
        id: 'War_1956',
        label: 'World war ii',
      },
      {
        id: 'War_207883',
        label: '1940s',
      },
      {
        id: 'War_13065',
        label: 'Soldier',
      },
      {
        id: 'War_5565',
        label: 'Biography',
      },
      {
        id: 'War_273967',
        label: 'War',
      },
      {
        id: 'War_2652',
        label: 'Nazi',
      },
      {
        id: 'War_2957',
        label: 'Vietnam war',
      },
      {
        id: 'War_6092',
        label: 'Army',
      },
      {
        id: 'War_162365',
        label: 'Military',
      },
      {
        id: 'War_1701',
        label: 'Hero',
      },
    ],
  },
  {
    id: 10759,
    name: 'Action & Adventure',
    emoji: '🦸‍♂️',
    mediaType: 'series',
    keywords: [
      {
        id: 'Action & Adventure_33637',
        label: 'Super power',
      },
      {
        id: 'Action & Adventure_207826',
        label: 'Shounen',
      },
      {
        id: 'Action & Adventure_322942',
        label: 'Adventure',
      },
      {
        id: 'Action & Adventure_9715',
        label: 'Superhero',
      },
      {
        id: 'Action & Adventure_779',
        label: 'Martial arts',
      },
      {
        id: 'Action & Adventure_9951',
        label: 'Alien',
      },
      {
        id: 'Action & Adventure_2343',
        label: 'Magic',
      },
      {
        id: 'Action & Adventure_293198',
        label: 'Fantasy',
      },
      {
        id: 'Action & Adventure_10292',
        label: 'Gore',
      },
      {
        id: 'Action & Adventure_6152',
        label: 'Supernatural',
      },
    ],
  },
  {
    id: 10762,
    name: 'Kids',
    emoji: '🧸',
    mediaType: 'series',
    keywords: [
      {
        id: 'Kids_6513',
        label: 'Cartoon',
      },
      {
        id: 'Kids_9715',
        label: 'Superhero',
      },
      {
        id: 'Kids_6054',
        label: 'Friendship',
      },
      {
        id: 'Kids_259376',
        label: 'Playful',
      },
      {
        id: 'Kids_178898',
        label: 'Cartoon dog',
      },
      {
        id: 'Kids_2343',
        label: 'Magic',
      },
      {
        id: 'Kids_3289',
        label: 'Villain',
      },
      {
        id: 'Kids_18257',
        label: 'Educational',
      },
      {
        id: 'Kids_164246',
        label: 'Nostalgic',
      },
      {
        id: 'Kids_18035',
        label: 'Family',
      },
    ],
  },
  {
    id: 10763,
    name: 'News',
    emoji: '📰',
    mediaType: 'series',
    keywords: [
      {
        id: 'News_6078',
        label: 'Politics',
      },
      {
        id: 'News_169086',
        label: 'Political satire',
      },
      {
        id: 'News_193164',
        label: 'Current affairs',
      },
      {
        id: 'News_242216',
        label: 'Late_night show',
      },
      {
        id: 'News_191509',
        label: 'News',
      },
      {
        id: 'News_13384',
        label: 'Morning show',
      },
      {
        id: 'News_3741',
        label: 'Talk show',
      },
      {
        id: 'News_239647',
        label: 'Magazine show',
      },
      {
        id: 'News_195207',
        label: 'Panel show',
      },
      {
        id: 'News_33847',
        label: 'British politics',
      },
    ],
  },
  {
    id: 10764,
    name: 'Reality',
    emoji: '🎥',
    mediaType: 'series',
    keywords: [
      {
        id: 'Reality_194610',
        label: 'Variety show',
      },
      {
        id: 'Reality_271',
        label: 'Competition',
      },
      {
        id: 'Reality_250845',
        label: 'Reality competition',
      },
      {
        id: 'Reality_291807',
        label: 'Reality show',
      },
      {
        id: 'Reality_4325',
        label: 'Game show',
      },
      {
        id: 'Reality_15479',
        label: 'Fashion',
      },
      {
        id: 'Reality_167198',
        label: 'Fashion show',
      },
      {
        id: 'Reality_6383',
        label: 'Music competition',
      },
      {
        id: 'Reality_186120',
        label: 'Singing competition',
      },
      {
        id: 'Reality_40870',
        label: 'Race',
      },
    ],
  },
  {
    id: 10765,
    name: 'Sci-Fi & Fantasy',
    emoji: '🚀',
    mediaType: 'series',
    keywords: [
      {
        id: 'Sci-Fi & Fantasy_6152',
        label: 'Supernatural',
      },
      {
        id: 'Sci-Fi & Fantasy_33637',
        label: 'Super power',
      },
      {
        id: 'Sci-Fi & Fantasy_207826',
        label: 'Shounen',
      },
      {
        id: 'Sci-Fi & Fantasy_322942',
        label: 'Adventure',
      },
      {
        id: 'Sci-Fi & Fantasy_779',
        label: 'Martial arts',
      },
      {
        id: 'Sci-Fi & Fantasy_293198',
        label: 'Fantasy',
      },
      {
        id: 'Sci-Fi & Fantasy_2343',
        label: 'Magic',
      },
      {
        id: 'Sci-Fi & Fantasy_9951',
        label: 'Alien',
      },
      {
        id: 'Sci-Fi & Fantasy_10292',
        label: 'Gore',
      },
      {
        id: 'Sci-Fi & Fantasy_315058',
        label: 'Horror',
      },
    ],
  },
  {
    id: 10766,
    name: 'Soap',
    emoji: '🧼',
    mediaType: 'series',
    keywords: [
      {
        id: 'Soap_199262',
        label: 'Telenovela',
      },
      {
        id: 'Soap_291959',
        label: 'Soap opera',
      },
      {
        id: 'Soap_11612',
        label: 'Hospital',
      },
      {
        id: 'Soap_316421',
        label: 'Drama',
      },
      {
        id: 'Soap_13005',
        label: 'Doctor',
      },
      {
        id: 'Soap_208788',
        label: 'Medical drama',
      },
      {
        id: 'Soap_193400',
        label: 'Teen drama',
      },
      {
        id: 'Soap_237462',
        label: 'Wealthy family',
      },
      {
        id: 'Soap_9840',
        label: 'Romance',
      },
      {
        id: 'Soap_11157',
        label: 'Sibling rivalry',
      },
    ],
  },
  {
    id: 10767,
    name: 'Talk',
    emoji: '💬',
    mediaType: 'series',
    keywords: [
      {
        id: 'Talk_3741',
        label: 'Talk show',
      },
      {
        id: 'Talk_242216',
        label: 'Late_night show',
      },
      {
        id: 'Talk_6562',
        label: 'Celebrity',
      },
      {
        id: 'Talk_234957',
        label: 'Celebrity interview',
      },
      {
        id: 'Talk_320420',
        label: 'Hilarious',
      },
      {
        id: 'Talk_198299',
        label: 'Live music',
      },
      {
        id: 'Talk_276775',
        label: 'Irreverent',
      },
      {
        id: 'Talk_325830',
        label: 'Informative',
      },
      {
        id: 'Talk_225273',
        label: 'K_pop',
      },
      {
        id: 'Talk_197715',
        label: 'Talk',
      },
    ],
  },
  {
    id: 10768,
    name: 'War & Politics',
    emoji: '⚖️',
    mediaType: 'series',
    keywords: [
      {
        id: 'War & Politics_162365',
        label: 'Military',
      },
      {
        id: 'War & Politics_6078',
        label: 'Politics',
      },
      {
        id: 'War & Politics_1956',
        label: 'World war ii',
      },
      {
        id: 'War & Politics_192772',
        label: 'Historical drama',
      },
      {
        id: 'War & Politics_273967',
        label: 'War',
      },
      {
        id: 'War & Politics_15126',
        label: 'Historical',
      },
      {
        id: 'War & Politics_10046',
        label: 'Mecha',
      },
      {
        id: 'War & Politics_321464',
        label: 'Intense',
      },
      {
        id: 'War & Politics_13015',
        label: 'Terrorism',
      },
      {
        id: 'War & Politics_264792',
        label: 'Political',
      },
    ],
  },
  {
    id: 16,
    name: 'Animation',
    emoji: '🐭',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Animation_3289',
        label: 'Villain',
      },
      {
        id: 'Animation_207826',
        label: 'Shounen',
      },
      {
        id: 'Animation_6054',
        label: 'Friendship',
      },
      {
        id: 'Animation_779',
        label: 'Martial arts',
      },
      {
        id: 'Animation_11477',
        label: 'Anthropomorphism',
      },
      {
        id: 'Animation_293198',
        label: 'Fantasy',
      },
      {
        id: 'Animation_6152',
        label: 'Supernatural',
      },
      {
        id: 'Animation_2343',
        label: 'Magic',
      },
      {
        id: 'Animation_161919',
        label: 'Adult animation',
      },
      {
        id: 'Animation_322942',
        label: 'Adventure',
      },
    ],
  },
  {
    id: 35,
    name: 'Comedy',
    emoji: '😂',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Comedy_193171',
        label: 'Sitcom',
      },
      {
        id: 'Comedy_18035',
        label: 'Family',
      },
      {
        id: 'Comedy_325765',
        label: 'Amused',
      },
      {
        id: 'Comedy_320420',
        label: 'Hilarious',
      },
      {
        id: 'Comedy_6054',
        label: 'Friendship',
      },
      {
        id: 'Comedy_3289',
        label: 'Villain',
      },
      {
        id: 'Comedy_325782',
        label: 'Cheerful',
      },
      {
        id: 'Comedy_380',
        label: 'Sibling relationship',
      },
      {
        id: 'Comedy_11477',
        label: 'Anthropomorphism',
      },
      {
        id: 'Comedy_242',
        label: 'New york city',
      },
    ],
  },
  {
    id: 80,
    name: 'Crime',
    emoji: '🕵️‍♂️',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Crime_6149',
        label: 'Police',
      },
      {
        id: 'Crime_703',
        label: 'Detective',
      },
      {
        id: 'Crime_9826',
        label: 'Murder',
      },
      {
        id: 'Crime_268067',
        label: 'Police procedural',
      },
      {
        id: 'Crime_242',
        label: 'New york city',
      },
      {
        id: 'Crime_9748',
        label: 'Revenge',
      },
      {
        id: 'Crime_12670',
        label: 'Los angeles, california',
      },
      {
        id: 'Crime_10291',
        label: 'Organized crime',
      },
      {
        id: 'Crime_207268',
        label: 'Neo_noir',
      },
      {
        id: 'Crime_3149',
        label: 'Gangster',
      },
    ],
  },
  {
    id: 99,
    name: 'Documentary',
    emoji: '📜',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Documentary_4434',
        label: 'Interview',
      },
      {
        id: 'Documentary_18330',
        label: 'Nature',
      },
      {
        id: 'Documentary_33722',
        label: 'True crime',
      },
      {
        id: 'Documentary_159290',
        label: 'Sports documentary',
      },
      {
        id: 'Documentary_282080',
        label: 'Documentary',
      },
      {
        id: 'Documentary_221355',
        label: 'Nature documentary',
      },
      {
        id: 'Documentary_246377',
        label: 'Music documentary',
      },
      {
        id: 'Documentary_325761',
        label: 'Admiring',
      },
      {
        id: 'Documentary_13042',
        label: 'Football (soccer)',
      },
      {
        id: 'Documentary_155477',
        label: 'Softcore',
      },
    ],
  },
  {
    id: 18,
    name: 'Drama',
    emoji: '💔',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Drama_268067',
        label: 'Police procedural',
      },
      {
        id: 'Drama_189402',
        label: 'Crime investigation',
      },
      {
        id: 'Drama_242',
        label: 'New york city',
      },
      {
        id: 'Drama_6149',
        label: 'Police',
      },
      {
        id: 'Drama_157241',
        label: 'Criminal investigation',
      },
      {
        id: 'Drama_703',
        label: 'Detective',
      },
      {
        id: 'Drama_311315',
        label: 'Dramatic',
      },
      {
        id: 'Drama_9673',
        label: 'Love',
      },
      {
        id: 'Drama_15060',
        label: 'Period drama',
      },
      {
        id: 'Drama_9715',
        label: 'Superhero',
      },
    ],
  },
  {
    id: 10751,
    name: 'Family',
    emoji: '🏡',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Family_3289',
        label: 'Villain',
      },
      {
        id: 'Family_6054',
        label: 'Friendship',
      },
      {
        id: 'Family_193171',
        label: 'Sitcom',
      },
      {
        id: 'Family_18035',
        label: 'Family',
      },
      {
        id: 'Family_11477',
        label: 'Anthropomorphism',
      },
      {
        id: 'Family_10683',
        label: 'Coming of age',
      },
      {
        id: 'Family_325782',
        label: 'Cheerful',
      },
      {
        id: 'Family_6513',
        label: 'Cartoon',
      },
      {
        id: 'Family_2343',
        label: 'Magic',
      },
      {
        id: 'Family_18165',
        label: 'Animals',
      },
    ],
  },
  {
    id: 9648,
    name: 'Mystery',
    emoji: '🧚‍♀️',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Mystery_703',
        label: 'Detective',
      },
      {
        id: 'Mystery_9826',
        label: 'Murder',
      },
      {
        id: 'Mystery_6152',
        label: 'Supernatural',
      },
      {
        id: 'Mystery_6149',
        label: 'Police',
      },
      {
        id: 'Mystery_5340',
        label: 'Investigation',
      },
      {
        id: 'Mystery_161982',
        label: 'Murder investigation',
      },
      {
        id: 'Mystery_315058',
        label: 'Horror',
      },
      {
        id: 'Mystery_10714',
        label: 'Serial killer',
      },
      {
        id: 'Mystery_256183',
        label: 'Supernatural horror',
      },
      {
        id: 'Mystery_207046',
        label: 'Murder mystery',
      },
    ],
  },
  {
    id: 37,
    name: 'Western',
    emoji: '🤠',
    mediaType: 'shared',
    keywords: [
      {
        id: 'Western_207928',
        label: '19th century',
      },
      {
        id: 'Western_155573',
        label: 'Wild west',
      },
      {
        id: 'Western_2752',
        label: 'Ranch',
      },
      {
        id: 'Western_10322',
        label: 'Native american',
      },
      {
        id: 'Western_798',
        label: 'Sheriff',
      },
      {
        id: 'Western_1556',
        label: 'Texas',
      },
      {
        id: 'Western_801',
        label: 'Bounty hunter',
      },
      {
        id: 'Western_75',
        label: 'Gunslinger',
      },
      {
        id: 'Western_155291',
        label: 'Cowboy',
      },
      {
        id: 'Western_9503',
        label: 'Outlaw',
      },
    ],
  },
];
