export const normalizeLineEndings = (str: string, normalized = '\n'): string =>
    str.replace(/\r?\n/g, normalized);

type TagString = string;
type PgnString = string;
export type SplitGame = { tags: TagString; pgn: PgnString; all: string };

/**
 * Returns an array of SplitGames, which are objects that may contain tags and / or pgn strings.
 * The split function expects well formed export format strings (see
 * [8.1 Tag pair section](https://github.com/mliebelt/pgn-spec-commented/blob/main/pgn-specification.md#81-tag-pair-section),
 * statement "a single empty line follows the last tag pair"). So the split function only works
 * when tags are separated from the move text by a single empty line, and the next game is separated
 * by at least one empty line as well.
 * @param input - The PGN string that may contain multiple games.
 * @returns An array of SplitGame.
 */
export function split(input: string): SplitGame[] {
    const parts = normalizeLineEndings(input).split(/\n\n+/);
    const res: SplitGame[] = [];

    let g: SplitGame = { tags: '', pgn: '', all: '' };
    parts.forEach((part) => {
        if (part.startsWith('[')) {
            g.tags = part;
        } else if (part) {
            g.pgn = part;
            g.all = g.tags ? g.tags + '\n\n' + g.pgn : g.pgn;
            res.push(g);
            g = { tags: '', pgn: '', all: '' };
        }
    });
    return res;
}
