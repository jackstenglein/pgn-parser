import PegParser from './_pgn-parser.js';
import {
    ParseTree,
    ParseOptions,
    Turn,
    PgnMove,
    StartRule,
    ParseResponseType,
} from './types';

/**
 * General parse function, that accepts all `startRule`s. Calls then the more specific ones, so that the
 * postParse processing can now rely on the same structure all the time.
 * @param input - the PGN string that will be parsed according to the `startRule` given
 * @param options - the parameters that have to include the `startRule`
 * @returns a ParseTree or an array of ParseTrees, depending on the startRule
 */
export function parse<SR extends StartRule>(
    input: string,
    options?: ParseOptions<SR>
): ParseResponseType<SR> {
    if (!options || options.startRule === 'games') {
        return parseGames(input, options) as ParseResponseType<SR>;
    } else {
        return parseGame(input, options) as ParseResponseType<SR>;
    }
}

/**
 * Parses multiple games.
 * @param input The PGN string to parse, which can contain multiple games.
 * @param options the optional parameters (not used at the moment)
 * @returns An array of ParseTrees, one for each game included in the PGN.
 */
export function parseGames<SR extends StartRule>(
    input: string,
    options: ParseOptions<SR> = { startRule: 'games' as SR }
): ParseTree[] {
    try {
        const gamesOptions = Object.assign({ startRule: 'games' }, options);
        const result = PegParser.parse(input, gamesOptions) as ParseTree[];
        if (!result || !Array.isArray(result) || result.length === 0) {
            return [];
        }

        // Removes potentially empty parse tree at the end of the input
        const last: ParseTree | undefined = result.pop();
        if (last && (last.tags !== undefined || last.moves.length > 0)) {
            result.push(last);
        }

        result.forEach((pt) => postParseGame(pt, gamesOptions));
        return result;
    } catch (err) {
        throw parseError(input, err);
    }
}

/**
 * Special parse function to parse one game only, options may be omitted.
 * @param input - the PGN string that will be parsed
 * @param options - object with additional parameters
 * @returns a ParseTree with the defined structure
 */
export function parseGame<SR extends StartRule>(
    input: string,
    options: ParseOptions<SR> = { startRule: 'game' as SR }
): ParseTree {
    try {
        input = input.trim();
        const result = PegParser.parse(input, options);
        let res2: ParseTree = { moves: [] as PgnMove[], messages: [] };

        if (options.startRule === 'pgn') {
            res2.moves = result;
        } else if (options.startRule === 'tags') {
            res2.tags = result.tags;
            res2.messages = result.messages;
        } else {
            res2 = result;
        }

        return postParseGame(res2, options);
    } catch (err) {
        throw parseError(input, err);
    }
}

/**
 * Processes the result from parseGame in order to set the result as a tag
 * and set the turn of all moves in the ParseTree.
 * @param parseTree The ParseTree to process.
 * @param options The options passed to parseGame.
 * @returns The updated ParseTree.
 */
function postParseGame<SR extends StartRule>(
    parseTree: ParseTree,
    options: { startRule: SR } & ParseOptions<SR>
): ParseTree {
    parseTree = handleGameResult(parseTree, options);
    if (!parseTree.moves) {
        return parseTree;
    }

    const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const fen = options.fen || parseTree.tags?.FEN || START;
    let currentTurn = getTurnFromFEN(fen);

    parseTree.moves.forEach(
        (move) => (currentTurn = setTurnRecursive(move, currentTurn))
    );
    return parseTree;
}

/**
 * Updates the given ParseTree to ensure that the result of a game is stored only as a tag
 * and not in the moves array. If options.startRule is `tags`, this function is a no-op.
 * @param parseTree The ParseTree to update.
 * @param options The parse options.
 * @returns The updated ParseTree.
 */
function handleGameResult<SR extends StartRule>(
    parseTree: ParseTree,
    options: ParseOptions<SR>
) {
    if (options.startRule === 'tags') {
        return parseTree;
    }

    const move: PgnMove = parseTree.moves[parseTree.moves.length - 1];
    if (typeof move !== 'string') {
        return parseTree;
    }

    parseTree.moves.pop();
    if (parseTree.tags) {
        const tmp = parseTree.tags['Result'];
        if (tmp && move !== tmp) {
            parseTree.messages.push({
                key: 'Result',
                value: tmp,
                message: 'Result in tags is different to result in SAN',
            });
        }
        parseTree.tags['Result'] = move;
    }
    return parseTree;
}

/**
 * Returns the opposite of the provided current turn.
 * @param currentTurn The current turn to get the opposite of.
 * @returns The opposite of the current turn.
 */
function switchTurn(currentTurn: Turn): Turn {
    return currentTurn === 'w' ? 'b' : 'w';
}

/**
 * Returns current turn from the given FEN.
 * @param fen The FEN to get the current turn from.
 * @returns The current turn from the FEN.
 */
function getTurnFromFEN(fen: string): Turn {
    return fen.split(/\s+/)[1] as Turn;
}

/**
 * Sets the turn for the provided move to the provided value, and recursively
 * sets the turn for the move's variations.
 * @param move The move to set the turn for.
 * @param currentTurn The turn to set on the move.
 * @returns The turn of the next move.
 */
function setTurnRecursive(move: PgnMove, currentTurn: Turn): Turn {
    move.turn = currentTurn;
    move.variations.forEach((variation) => {
        let varTurn = currentTurn;
        variation.forEach((varMove) => (varTurn = setTurnRecursive(varMove, varTurn)));
    });

    return switchTurn(currentTurn);
}

/**
 * Handles parsing errors and enhances the error object with a detailed error hint.
 * @param pgn The PGN string that was being parsed
 * @param error The error that occurred during parsing
 * @returns The enhanced error object
 */
function parseError(pgn: string, error: any): any {
    if (!error?.location?.start) {
        error.hint = `Error parsing PGN (no location information available): ${error.message || 'Unknown error'}`;
        return error;
    }

    const line = error.location.start.line;
    const column = error.location.start.column;

    const lines = pgn.split('\n');

    // Create context with a few lines before and after the error
    const contextStart = Math.max(0, line - 3);
    const contextEnd = Math.min(lines.length, line + 2);
    const contextLines: string[] = [];

    for (let i = contextStart; i < contextEnd; i++) {
        const lineNum = i + 1;
        let lineContent = lines[i] || '';

        // If this is the error line, mark the error position
        if (lineNum === line) {
            if (column <= lineContent.length) {
                // Insert ** before the character at the error position
                lineContent =
                    lineContent.substring(0, column - 1) +
                    '**' +
                    lineContent.substring(column - 1);
            } else {
                // Error is at the end of the line
                lineContent += '**';
            }
        }

        contextLines.push(`${lineNum}: ${lineContent}`);
    }

    // Create the error hint
    error.errorHint = `Error at line ${line}, column ${column}:\n${contextLines.join('\n')}`;

    return error;
}
