/** The names of the seven-tag roster in order. */
export const SevenTagRoster = [
    'Event',
    'Site',
    'Date',
    'Round',
    'White',
    'Black',
    'Result',
];

/** The names of the seven-tag roster that have string values. */
export type SevenTagRosterStringKeys =
    | 'Event'
    | 'Site'
    | 'Round'
    | 'White'
    | 'Black'
    | 'Result';

/** Tags from the seven-tag roster. */
export type SevenRosterTags = { [key in SevenTagRosterStringKeys]: string } & {
    Date?: PgnDate;
};

/** The names of tags related to player information. */
export type PlayerTagKeys =
    | 'WhiteTitle'
    | 'BlackTitle'
    | 'WhiteNA'
    | 'BlackNA'
    | 'WhiteType'
    | 'BlackType';

/** The names of tags related to event information. */
export type EventTagKeys = 'EventSponsor' | 'Section' | 'Stage' | 'Board';

/** The names of tags related to openings. */
export type OpeningTagKeys = 'Opening' | 'Variation' | 'SubVariation' | 'ECO' | 'NIC';

/** The names of tags related to starting positions. */
export type AlternativeStartingKeys = 'SetUp' | 'FEN';

/** The names of tags related to the conclusion of the game. */
export type GameConclusionTagKeys = 'Termination';

/** The names of miscellaneous tags. */
export type MiscTagKeys = 'Annotator' | 'Mode' | 'PlyCount';

/** The names of tags used by Lichess. */
export type LichessTagKeys =
    | 'PuzzleEngine'
    | 'PuzzleMakerVersion'
    | 'PuzzleCategory'
    | 'PuzzleWinner'
    | 'Variant'
    | 'WhiteRatingDiff'
    | 'BlackRatingDiff'
    | 'WhiteFideId'
    | 'BlackFideId'
    | 'WhiteTeam'
    | 'BlackTeam'
    | 'Orientation';

/** The names of tags related to the clock. */
export type ClockTagKeys = 'Clock' | 'WhiteClock' | 'BlackClock';

/** The names of all tags known by the pgn-types library that have a string value type. */
export type StringTagKeys =
    | SevenTagRosterStringKeys
    | PlayerTagKeys
    | EventTagKeys
    | OpeningTagKeys
    | AlternativeStartingKeys
    | GameConclusionTagKeys
    | MiscTagKeys
    | LichessTagKeys
    | ClockTagKeys;

/** The names of tags related to the time control. */
export type TimeControlKeys = 'TimeControl';

/** The set of values for the kind of time control. */
export enum TimeControlKind {
    /** The time control is unknown. */
    Unknown = 'unknown',

    /** There was unlimited time for the time control. */
    Unlimited = 'unlimited',

    /** The time control specifies a certain amount of time for a certain number of moves. */
    MovesInSeconds = 'movesInSeconds',

    /** The time control specifies a certain amount of time plus an increment for a certain number of moves. */
    MovesInSecondsWithIncrement = 'movesInSecondsIncrement',

    /** The time control specifies a starting amount of time plus an increment. */
    SecondsWithIncrement = 'increment',

    /** The time control specifies a single amount of time in the period. */
    SuddenDeath = 'suddenDeath',

    /** The time control specifies an hourglass type control. */
    Hourglass = 'hourglass',
}

/** The value of the time control tag, as computed by the PGN parser. */
export type TimeControl = {
    /** The raw value in the PGN header. */
    value?: string;

    /** The kind of time control. */
    kind?: TimeControlKind;

    /** The number of moves the time control applies for. */
    moves?: number;

    /** The amount of seconds allocated for the time control. */
    seconds?: number;

    /** The amount of incremental seconds for the time control. */
    increment?: number;
};

/** The names of tags related to the date of the game. */
export type DateTagKeys = 'Date' | 'EventDate' | 'UTCDate';

/** The value of the date tags, as computed by the PGN parser. */
export type PgnDate = {
    /** The raw value in the PGN header. */
    value?: string;

    /** The year the game was played. */
    year?: number;

    /** The month the game was played. */
    month?: number;

    /** The day the game was played. */
    day?: number;
};

/** The names of tags related to the time the game was played. */
export type TimeTagKeys = 'Time' | 'UTCTime';

/** The value of the time tags, as computed by the PGN parser. */
export type PgnTime = {
    /** The raw value in the PGN header. */
    value?: string;

    /** The hour extracted from the PGN header. */
    hour?: number;

    /** The minute extracted from the PGN header. */
    minute?: number;

    /** The second extracted from the PGN header. */
    second?: number;
};

/** The names of tags related to player ELO. */
export type EloTagKeys = 'WhiteElo' | 'BlackElo' | 'WhiteUSCF' | 'BlackUSCF';

/** The value of an ELO tag, as computed by the PGN parser. */
export type Elo = {
    /** The raw value in the PGN header. */
    value?: string;

    /** The value parsed to an int, if possible. */
    int?: number;
};

/** The value of all the tags, as computed by the PGN parser. */
export type Tags = { [key in StringTagKeys]?: string } & {
    [key in DateTagKeys]?: PgnDate;
} & { [key in TimeTagKeys]?: PgnTime } & { [key in TimeControlKeys]?: TimeControl } & {
    [key in EloTagKeys]?: Elo;
} & {
    [key: string]: string | PgnDate | PgnTime | TimeControl;
};

export type TagKeys = keyof Tags;

/** A message emitted by the PGN parser while parsing. */
export type Message = { key: string; value: string; message: string };
export type MessagesObject = { messages: Message[] };

export type GameComment = {
    comment?: string;
    colorArrows?: string[];
    colorFields?: string[];
    clk?: string;
    egt?: string;
    emt?: string;
    mct?: string;
    eval?: string;
};
export type PgnMove = {
    drawOffer: boolean;
    moveNumber: number;
    notation: {
        fig?: string | null;
        strike?: 'x' | null;
        col: string;
        row: string;
        check?: string;
        promotion: string | null;
        notation: string;
        disc?: string;
        drop?: boolean;
    };
    variations: PgnMove[][];
    nag: string[];
    commentDiag: GameComment;
    commentMove?: string;
    commentAfter?: string;
    turn: 'w' | 'b';
};

/* From pgn-writer */
export const PROMOTIONS = {
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
};

export const prom_short = ['q', 'r', 'b', 'n'] as const;
export type PROMOTIONS_SHORT = (typeof prom_short)[number];

export const colors = ['white', 'black'] as const;
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type File = (typeof files)[number];
export type Rank = (typeof ranks)[number];
export type Field = 'a0' | `${File}${Rank}`;

export type Color = 'w' | 'b';

export type StartRule = 'pgn' | 'game' | 'tags' | 'games' | undefined;
export type PgnOptions<SR extends StartRule> = { startRule: SR; fen?: string };

/** The response type of the parse functions. */
export type ParseResponseType<SR extends StartRule> = SR extends 'games'
    ? ParseTree[]
    : ParseTree;

export type ParseTree = {
    tags?: Tags;
    gameComment?: GameComment;
    moves: PgnMove[];
} & MessagesObject;
export type Turn = 'w' | 'b';
