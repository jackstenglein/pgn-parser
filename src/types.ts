import {
    GameComment,
    PgnMove,
    Tags as BaseTags,
    MessagesObject,
    PgnDate,
    PgnTime,
    TimeControl,
} from '@mliebelt/pgn-types';

export type Tags = BaseTags & { [key: string]: string | PgnDate | PgnTime | TimeControl };
export type StartRule = 'pgn' | 'game' | 'tags' | 'games';
export type PgnOptions = { startRule: StartRule; fen?: string };
export type ParseTree = {
    tags?: Tags;
    gameComment?: GameComment;
    moves: PgnMove[];
} & MessagesObject;
export type Turn = 'w' | 'b';
