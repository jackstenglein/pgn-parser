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

/** The key type of the computed Tags. */
export type TagKeys = keyof Tags;

/** The player with the move. */
export type Turn = 'w' | 'b';

/** The type of custom commands left on a PGN move (Ex: %depth1). */
export type CustomCommands = {
    [key: string]: string;
};

/** A comment with arrows, highlights and other commands. */
export type DiagramComment = {
    /** The text portion of the comment. Only present for game comments. */
    comment?: string;

    /** Arrows drawn on the board. */
    colorArrows?: string[];

    /** Squares highlighted on the board. */
    colorFields?: string[];

    /** The value of the %clk command. */
    clk?: string;

    /** The value of the %egt command. */
    egt?: string;

    /** The value of the %emt command. */
    emt?: string;

    /** The value of the %mct command. */
    mct?: string;

    /** The value of the %eval command. */
    eval?: string;
} & CustomCommands;

/** A single move in the PGN */
export type PgnMove = {
    /** The number of the move. */
    moveNumber: number;

    /** The player who made this move. */
    turn: Turn;

    /** The notation of the move. */
    notation: {
        /** The full value of the notation in the PGN. */
        notation: string;

        /**
         * The piece moved. Only present if included in the PGN notation.
         * IE: for O-O and e4, it will not be present.
         */
        piece?: 'R' | 'N' | 'B' | 'Q' | 'K' | 'P';

        /** The PGN character notation for capturing. Only included if present in the PGN. */
        strike?: 'x';

        /**
         * The rank the piece was moved to. Only present if included in the PGN notation.
         * IE: for O-O and O-O-O, it will not be present.
         */
        rank?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

        /**
         * The file the piece was moved to. Only present if included in the PGN notation.
         * IE: for O-O and O-O-O, it will not be present.
         */
        file?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

        /** The symbol for check or checkmate. */
        check?: '+' | '#';

        /** The promotion of the move. IE: `=Q` */
        promotion?: string;

        /** The piece discriminator if it was present in the PGN. Ex: `a` in `Rae1` */
        discriminator?: string;

        /** Whether the piece was dropped. Only present/true for Crazyhouse. */
        drop?: boolean;
    };

    /** Variations of this move in the PGN. */
    variations: PgnMove[][];

    /** Whether a draw was offered on the move. */
    drawOffer?: boolean;

    /** NAGs on this move in the PGN. */
    nags?: string[];

    /** Diagram comments left on this move. */
    commentDiag?: DiagramComment;

    /** Comments left before the move. */
    commentMove?: string;

    /** Comments left after the move. */
    commentAfter?: string;
};

/** A message emitted by the PGN parser while parsing. */
export type Message = { key: string; value: string; message: string };

/** The types of strings that can be parsed by the parse functions. */
export type StartRule = 'pgn' | 'game' | 'tags' | 'games' | undefined;

/** The options that can be passed to the parse functions. */
export type ParseOptions<SR extends StartRule> = { startRule: SR; fen?: string };

/** The response type of the parse functions. */
export type ParseResponseType<SR extends StartRule> = SR extends 'games'
    ? ParseTree[]
    : ParseTree;

/** The result of running the parser on a single PGN. */
export type ParseTree = {
    /** The tags, if they were present in the PGN. */
    tags?: Tags;

    /** The game comment (comment before the first move), if it exists in the PGN. */
    gameComment?: DiagramComment;

    /** The moves in the PGN. */
    moves: PgnMove[];

    /** Messages emitted during parsing. */
    messages: Message[];
};
