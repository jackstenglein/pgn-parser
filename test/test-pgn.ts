import { suite } from 'uvu';
import assert from 'uvu/assert';
import { ParseTree, PgnMove, parseGame } from '../src';
import { tag } from './test-game';

const xtest = (_exampleSkippedTest: string, _p: () => void) => {};
function parsePgn(string: string): PgnMove[] {
    return (<ParseTree>parseGame(string, { startRule: 'pgn' })).moves;
}

const completeWithFirst = suite(
    'When reading complete game starting with the first move'
);
completeWithFirst('should notice white starting and color switching each move', () => {
    const res = parsePgn('1. e4 e5 2. Nf3');
    assert.is(res.length, 3);
    assert.is(res[0].turn, 'w');
    assert.is(res[1].turn, 'b');
    assert.is(res[2].turn, 'w');
});
// This is not possible due to the lax interpretation of PGN with move numbers
// This has to be corrected by the reader later, that has a position as well.
// completeWithFirst('should notice black starting and other colors for moves', () => {
//     const res = parsePgn('1... e5 2. Nf3');
//     assert.is(res.length, 2);
//     assert.is(res[0].turn, 'b');
//     assert.is(res[1].turn, 'w');
// });
completeWithFirst('should read all kind of move numbers without problems', () => {
    const res = parsePgn('1... e4 1... e5 2.. d4 2 . d5 f4 3. f5');
    assert.is(res.length, 6);
    assert.is(res[0].notation.notation, 'e4');
    assert.is(res[0].moveNumber, 1);
    assert.is(res[1].moveNumber, 1);
    assert.is(res[2].moveNumber, 2);
    assert.is(res[3].moveNumber, 2);
    assert.is(res[4].moveNumber, null);
    assert.is(res[5].moveNumber, 3);
});
/* See the comments on https://github.com/mliebelt/pgn-parser/issues/463# to get the context. That is
 * valid from the grammar point of view, so this test is commented out.
 */
// completeWithFirst("should flag an error when move number is not an integer followed by a dot", () => {
xtest('should flag an error when move number is not an integer followed by a dot', () => {
    // const res = parsePgn("aa1. e4")
    const res = parseGame(
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 aa10. d4 Nbd7'
    );
    assert.is(res.moves.length, 20); // Current result is 21, due to the additional move aa1
});
completeWithFirst.run();

const basicNotation = suite('When reading basic notation');
basicNotation('should include full notation', () => {
    const res = parsePgn('1. e4');
    assert.is(res[0].notation.notation, 'e4');
});
basicNotation('should handle piece', () => {
    let res = parsePgn('1. Ra1');
    assert.is(res[0].notation.piece, 'R');

    res = parsePgn('1. Pe4');
    assert.is(res[0].notation.piece, 'P');

    res = parsePgn('1. e4');
    assert.is(res[0].notation.piece, undefined);
});
basicNotation('should handle strike character', () => {
    let res = parsePgn('1. exd5');
    assert.is(res[0].notation.strike, 'x');

    res = parsePgn('1. e4');
    assert.is(res[0].notation.strike, undefined);
});
basicNotation('should handle rank and file', () => {
    let res = parsePgn('1. Ne4');
    assert.is(res[0].notation.rank, '4');
    assert.is(res[0].notation.file, 'e');

    res = parsePgn('1. O-O');
    assert.is(res[0].notation.rank, undefined);
    assert.is(res[0].notation.file, undefined);
});
basicNotation('should handle check character', () => {
    let res = parsePgn('1. Ra1+');
    assert.is(res[0].notation.check, '+');

    res = parsePgn('1. Pe4#');
    assert.is(res[0].notation.check, '#');

    res = parsePgn('1. e4');
    assert.is(res[0].notation.check, undefined);
});

basicNotation.run();

const gameWithResult = suite('When a game notes a result at the end');
gameWithResult('should have the result as Result in tags', () => {
    const res = parseGame('1. e4 1-0');
    assert.is(res.moves.length, 1);
    assert.is(tag(res, 'Result'), '1-0');
});
gameWithResult('should have all kinds or result: 1-0', () => {
    const res = parseGame('1. e4 1-0');
    assert.is(tag(res, 'Result'), '1-0');
});
gameWithResult('should have all kinds or result: 0-1', () => {
    const res = parseGame('1. e4 0-1');
    assert.is(tag(res, 'Result'), '0-1');
});
gameWithResult('should have all kinds or result: 1/2-1/2', () => {
    const res = parseGame('1. e4  1/2-1/2');
    assert.is(tag(res, 'Result'), '1/2-1/2');
});
gameWithResult('should have all kinds or result: *', () => {
    const res = parseGame('1. e4  *');
    assert.is(tag(res, 'Result'), '*');
});
gameWithResult('should ignore additional white space before or after', () => {
    const res = parseGame('1. e4     *    ');
    assert.is(tag(res, 'Result'), '*');
});
gameWithResult('should ignore additional white space before or after success', () => {
    const res = parseGame('1. e4    1-0    ');
    assert.is(tag(res, 'Result'), '1-0');
});
gameWithResult('should ignore 1 space before or after', () => {
    const res = parseGame('27. Ng2 Qxg2# 0-1 ');
    assert.is(tag(res, 'Result'), '0-1');
});
gameWithResult('should handle variation at the end', () => {
    const res = parseGame('1. e4 (1. d4) 1/2-1/2');
    assert.is(tag(res, 'Result'), '1/2-1/2');
});
gameWithResult('should handle variation at the end even for wins', () => {
    const res = parseGame('1. e4 (1. d4) 1-0');
    assert.is(tag(res, 'Result'), '1-0');
});
gameWithResult(
    'should handle variation at the end even for wins with different format',
    () => {
        const res = parseGame('1. e4 (1. d4) 1-0');
        assert.is(tag(res, 'Result'), '1-0');
    }
);
gameWithResult('should handle variation at the end even for unclear results', () => {
    const res = parseGame('1. e4 (1. d4) *');
    assert.is(tag(res, 'Result'), '*');
});
gameWithResult.run();

const gameWithComments = suite('Reading PGN game with all kinds of comments');
gameWithComments('should read empty comments without problems', () => {
    const res = parsePgn('1. e4 {} e5');
    assert.is(res.length, 2);
});
gameWithComments('should read errornous pgn from #349', () => {
    const res = parseGame(
        '[Setup "1"] [FEN "4r1k1/1q3ppp/p7/8/Q3r3/8/P4PPP/R3R1K1 w - - 0 1"] 1. Qxe8+ {} Rxe8 2. Rxe8# *'
    );
    assert.is(res.moves.length, 3);
    assert.is(res.moves[0].commentAfter, undefined);
});
gameWithComments('should read comments at all locations', () => {
    const res = parsePgn('{First} 1. e4 {third} e5! {fourth}');
    assert.is(res.length, 2);
    assert.is(res[0].commentMove, 'First');
    assert.is(res[0].commentAfter, 'third');
    assert.is(res[1].commentAfter, 'fourth');
});
gameWithComments('should read 2 comments in one location', () => {
    const res = parsePgn('1. e4 {first} {second} e5!');
    assert.is(res.length, 2);
    assert.is(res[0].commentAfter, 'first second');
});

gameWithComments('should read 3 comments in one location', () => {
    const res = parsePgn('1. e4 {first} {second} {third} e5!');
    assert.is(res.length, 2);
    assert.is(res[0].commentAfter, 'first second third');
});

gameWithComments('should read many comment and annotations in one location', () => {
    const res = parsePgn('1. e4 {first} {[%cal Re4e6] [%csl Rd4]} e5!');
    assert.is(res.length, 2);
    assert.is(res[0].commentAfter, 'first');
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(arrows[0], 'Re4e6');
    assert.is(fields[0], 'Rd4');
});
gameWithComments('should not read additional whitespace when reading comments', () => {
    const res = parsePgn('  {First  } 1....    e4   {  third  } e5! {    fourth  }   ');
    assert.is(res.length, 2);
    assert.is(res[0].commentAfter, 'third');
    assert.is(res[1].commentAfter, 'fourth');
});
gameWithComments('should understand comment annotations: fields', () => {
    const res = parsePgn('1. e4 {[%csl Ye4,Rd4,Ga1,Bh1,Oe1,Cb1]}');
    assert.is.not(res[0].commentDiag, null);
    assert.ok(res[0].commentDiag?.colorFields);
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(fields[0], 'Ye4');
    assert.is(fields[1], 'Rd4');
    assert.is(fields[2], 'Ga1');
    assert.is(fields[3], 'Bh1');
    assert.is(fields[4], 'Oe1');
    assert.is(fields[5], 'Cb1');
});
gameWithComments('should understand comment annotations: arrows', () => {
    const res = parsePgn('1. e4 {[%cal Ye4e8,Rd4a4,Ga1h8,Bh1c7,Oc1c7,Ch1h7]}');
    assert.ok(res[0].commentDiag);
    let arrows = res[0].commentDiag?.colorArrows || [];
    assert.ok(res[0].commentDiag.colorArrows);
    assert.is(arrows[0], 'Ye4e8');
    assert.is(arrows[1], 'Rd4a4');
    assert.is(arrows[2], 'Ga1h8');
    assert.is(arrows[3], 'Bh1c7');
    assert.is(arrows[4], 'Oc1c7');
    assert.is(arrows[5], 'Ch1h7');
});
gameWithComments('should understand combination of comment and arrows', () => {
    const res = parsePgn('1. e4 { [%cal Ye4e8] comment}');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorArrows);

    assert.is(res[0].commentAfter, 'comment');
    let arrows = res[0].commentDiag?.colorArrows || [];
    assert.is(arrows[0], 'Ye4e8');
});
gameWithComments('should understand empty comments (cal)', () => {
    const res = parsePgn('1. e4{[%csl Ge5][%cal ]}');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorFields);
});
gameWithComments('should understand empty comments (csl)', () => {
    const res = parsePgn('1. e4{[%csl ][%cal Ye4e8]}');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorArrows);
});
gameWithComments('should understand empty comments (csl and cal)', () => {
    const res = parsePgn('1. e4{[%csl ][%cal ]}');
    assert.ok(res[0].commentDiag);
});
gameWithComments('should understand combination of comment, arrows and fields', () => {
    const res = parsePgn('1. e4 { [%cal Ye4e8] [%csl Rd4] comment }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorArrows);
    assert.ok(res[0].commentDiag.colorFields);

    assert.is(res[0].commentAfter, 'comment');
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(arrows[0], 'Ye4e8');
    assert.is(fields[0], 'Rd4');
});
gameWithComments(
    'should understand combination of comment, arrows and fields with a comment',
    () => {
        const res = parsePgn('1. e4 { comment1 } { [%cal Ye4e8] [%csl Rd4] comment2 }');
        assert.ok(res[0].commentDiag);
        assert.ok(res[0].commentDiag.colorArrows);
        assert.ok(res[0].commentDiag.colorFields);
        assert.ok(res[0].commentAfter);

        assert.is(res[0].commentAfter, 'comment1 comment2');
        let arrows = res[0].commentDiag?.colorArrows || [];
        let fields = res[0].commentDiag?.colorFields || [];
        assert.is(arrows[0], 'Ye4e8');
        assert.is(fields[0], 'Rd4');
    }
);
gameWithComments(
    'should understand combination of comment, arrows and fields, and comment again',
    () => {
        // Currently not supported, order of normal comments  and arrows / fields is restricted.
        const res = parsePgn(
            '1. e4 { comment1 } { [%cal Ye4e8] [%csl Rd4] } { comment2 }'
        );
        assert.ok(res[0].commentDiag);
        assert.ok(res[0].commentDiag.colorArrows);
        assert.ok(res[0].commentDiag.colorFields);
        assert.ok(res[0].commentAfter);
        let arrows = res[0].commentDiag?.colorArrows || [];
        let fields = res[0].commentDiag?.colorFields || [];
        assert.is(res[0].commentAfter, 'comment1 comment2');
        assert.is(arrows[0], 'Ye4e8');
        assert.is(fields[0], 'Rd4');
    }
);
gameWithComments('should understand permutations of comment, arrows and fields', () => {
    const res = parsePgn('1. e4 { [%csl Rd4] [%cal Ye4e8] comment }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorArrows);
    assert.ok(res[0].commentDiag.colorFields);

    assert.is(res[0].commentAfter, 'comment');
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(arrows[0], 'Ye4e8');
    assert.is(fields[0], 'Rd4');
});
gameWithComments('should understand combination of fields and arrows', () => {
    const res = parsePgn('1. e4 { [%cal Ye4e8] [%csl Rd4] }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorFields);
    assert.ok(res[0].commentDiag.colorArrows);
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(fields[0], 'Rd4');
    assert.is(arrows[0], 'Ye4e8');
});
gameWithComments('should understand permutations of fields and arrows', () => {
    const res = parsePgn('1. e4 { [%csl Rd4] [%cal Ye4e8]  }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorFields);
    assert.ok(res[0].commentDiag.colorArrows);
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(fields[0], 'Rd4');
    assert.is(arrows[0], 'Ye4e8');
});
gameWithComments('should understand whitespace when adding fields and arrows', () => {
    const res = parsePgn('1. e4 { [%csl   Rd4 ] [%cal   Ye4e8  ,  Gd1d3]  }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorFields);
    assert.ok(res[0].commentDiag.colorArrows);
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(fields[0], 'Rd4');
    assert.is(arrows[0], 'Ye4e8');
    assert.is(arrows[1], 'Gd1d3');
});
gameWithComments('should understand game comment with arrows', () => {
    const res = parseGame('{ [%cal Ge2e4,Ge2g4,Ge2c4] } e4');
    assert.ok(res);
    assert.ok(res.gameComment?.colorArrows);
    assert.is(res.gameComment?.colorArrows?.length, 3);
});
// Does not meet the supplement specification, which requires (at least) one whitespace
// gameWithComments("should understand lack of whitespace when adding fields and arrows", () => {
xtest('should understand lack of whitespace when adding fields and arrows', () => {
    const res = parsePgn('1. e4 { [%cslRd4] [%calYe4e8,Gd1d3] }');
    assert.ok(res[0].commentDiag);
    assert.ok(res[0].commentDiag.colorFields);
    assert.ok(res[0].commentDiag.colorArrows);
    let arrows = res[0].commentDiag?.colorArrows || [];
    let fields = res[0].commentDiag?.colorFields || [];
    assert.is(fields[0], 'Rd4');
    assert.is(arrows[0], 'Ye4e8');
    assert.is(arrows[1], 'Gd1d3');
});
gameWithComments('should understand one clock annotation per move', () => {
    // [ clk|egt|emt|mct  00:01:17 ]
    const res = parsePgn('c4 {[%clk 2:10:30]} Nf6 {[%egt 2:10:31]}');
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.clk, '2:10:30');
    assert.is(res[1].commentDiag?.egt, '2:10:31');
});
// Not allowed due to the spec
// gameWithComments("should understand clock annotations without whitespace", () => {
xtest('should understand clock annotations without whitespace', () => {
    const res = parsePgn('c4 {[%clk2:10:30]} Nf6 {[%egt2:10:31]}');
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.clk, '2:10:30');
    assert.is(res[1].commentDiag?.egt, '2:10:31');
});
gameWithComments('should understand many clock annotations in one move only', () => {
    const res = parsePgn(
        'c4 {[%clk 0:10:10] [%egt 0:10:10] [%emt 0:08:08] [%mct 1:10:11]}'
    );
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.clk, '0:10:10');
    assert.is(res[0].commentDiag.egt, '0:10:10');
    assert.is(res[0].commentDiag.emt, '0:08:08');
    assert.is(res[0].commentDiag.mct, '1:10:11');
});
gameWithComments('should understand mix of clock comments and normal comments', () => {
    const res = parsePgn('c4 {Start [%clk 0:10:10] comment [%egt 0:10:10] up to end}');
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.clk, '0:10:10');
    assert.is(res[0].commentDiag.egt, '0:10:10');
    assert.is(res[0].commentAfter, 'Start comment up to end');
});
gameWithComments(
    'should understand mix of clock comment and other annotation comment',
    () => {
        const res = parsePgn('1. e4 { First move } { [%cal Gd2d4] } { [%clk 0:02:00] }');
        assert.ok(res[0].commentDiag);
        assert.is(res[0].commentDiag.clk, '0:02:00');
        let arrows = res[0].commentDiag?.colorArrows || [];
        assert.is(arrows[0], 'Gd2d4');
        assert.is(res[0].commentAfter, 'First move');
    }
);
gameWithComments('should understand end-of-line comment', () => {
    let input = `c4 ; This is ignored up to end of line
c5 Nf3`;
    const res = parsePgn(input);
    assert.is(res.length, 3);
    assert.is(res[0].commentAfter, ' This is ignored up to end of line');
});
gameWithComments('should parse both eol and normal comments', () => {
    let input = `c4 { normal } c5;symmetrical move
Nf3 Nf6 { black stays symmetric }`;
    const res = parsePgn(input);
    assert.is(res.length, 4);
    assert.is(res[0].commentAfter, 'normal');
    assert.is(res[1].commentAfter, 'symmetrical move');
    assert.is(res[3].commentAfter, 'black stays symmetric');
});
gameWithComments(
    'should ignore in eol comment all other characters, even comments',
    () => {
        let input = `c3 ; ignore other comments like { comment } and ; eol comment
c6 {strange moves}`;
        const res = parsePgn(input);
        assert.is(res.length, 2);
        assert.is(
            res[0].commentAfter,
            ' ignore other comments like { comment } and ; eol comment'
        );
    }
);
gameWithComments('should ignore an eol comment inside a normal comment', () => {
    let input = `c3 { start; not an eol comment
does this work?? } c6`;
    const res = parsePgn(input);
    assert.is(res.length, 2);
    assert.is(res[0].commentAfter, 'start; not an eol comment\ndoes this work??');
});
gameWithComments('should keep commands it cannot parse inside comments', () => {
    const res = parsePgn('1. e4 { [%foo 1.0] [%bar any,string] }');
    assert.is(res.length, 1);
    const commentDiag = res[0].commentDiag;
    assert.is(commentDiag?.foo, '1.0');
    assert.is(commentDiag?.bar, 'any,string');
});
gameWithComments('should keep commands sprinkled in comments it cannot parse', () => {
    const res = parsePgn('1. e4 { [%foo 1.0] } { [%bar any,string] }');
    assert.is(res.length, 1);
    const commentDiag = res[0].commentDiag;
    assert.is(commentDiag?.foo, '1.0');
    assert.is(commentDiag?.bar, 'any,string');
});
gameWithComments('should keep commands it cannot parse, read diag comments', () => {
    const res = parsePgn('1. e4 { [%foo 1.0] } { [%clk 0:02:00] }');
    assert.is(res.length, 1);
    const commentDiag = res[0].commentDiag;
    assert.is(commentDiag?.foo, '1.0');
    assert.is(res[0].commentDiag?.clk, '0:02:00');
});
gameWithComments(
    'should ignore commands it cannot parse inside comments, but read other comments',
    () => {
        const res = parsePgn(
            '1. e4 { first comment [%foo 1.0] second comment [%bar any,string] }'
        );
        assert.is(res.length, 1);
        const commentDiag = res[0].commentDiag;
        assert.is(commentDiag?.foo, '1.0');
        assert.is(commentDiag?.bar, 'any,string');
        assert.is(res[0].commentAfter, ' first comment second comment');
    }
);
gameWithComments('should read eval command', () => {
    const res = parsePgn('1. e4 { [%eval -1.02] }');
    assert.is(res.length, 1);
    assert.is(res[0].commentDiag?.eval, -1.02);
});
gameWithComments('should read comment from issue #203 (of PgnViewerJS)', () => {
    let input = '1. d4 d5 2. Nf3 { Here black & white look good }';
    const res = parsePgn(input)[0];
    assert.ok(res);
});
gameWithComments(
    'should read action comments, and avoid text comment on only whitespace',
    () => {
        const res = parsePgn('e5 { [%csl Gf6] }');
        assert.ok(res);
        let fields = res[0].commentDiag?.colorFields || [];
        assert.is(fields.length, 1);
        assert.is(fields[0], 'Gf6');
        assert.is(res[0].commentAfter, undefined);
    }
);
gameWithComments('should read unknown action comments', () => {
    const res = parsePgn(
        '1. d4 {[%depth20 +0.35] [%depth1 +0.34]} Nf6 {[%depth20 +0.24] [%depth1 +0.13]}'
    );
    assert.ok(res);
    assert.is(res[0].commentDiag?.depth20, '+0.35');
    assert.is(res[1].commentDiag?.depth1, '+0.13');
});
gameWithComments('should read action comment with underscore (#362)', () => {
    const res = parsePgn(
        '1. e4 e5 2. Nf3 Nc6 3. d4 Nf6 { [%c_effect f6;square;f6;type;Inaccuracy;persistent;true] } 4. dxe5'
    );
    assert.ok(res);
    assert.is(
        res[5].commentDiag?.c_effect,
        'f6;square;f6;type;Inaccuracy;persistent;true'
    );
});
gameWithComments('should understand evals mixed with normal comments', function () {
    const game = parseGame(
        "{ [%cal Rg4f5] (-5.03 → -2.48) Blunder. Rxh1 was best. [%eval -2.48] (player's move was Bf5) } 22. Rdg1  0-1"
    );
    assert.ok(game);
    assert.ok(game.gameComment);
    const arrows = game.gameComment?.colorArrows || [];
    assert.is(arrows[0], 'Rg4f5');
    assert.is(game.gameComment?.eval, -2.48);
    assert.is(
        game.gameComment?.comment,
        "(-5.03 → -2.48) Blunder. Rxh1 was best. (player's move was Bf5)"
    );
});
gameWithComments('should have undefined for move with no comments', () => {
    const res = parsePgn('1. e4');
    assert.ok(res);
    assert.is(res[0].commentDiag, undefined);
    assert.is(res[0].commentMove, undefined);
    assert.is(res[0].commentAfter, undefined);
});
gameWithComments('should understand commands without values', () => {
    const res = parsePgn('1. e4 {[%EOG]}');
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.EOG, true);
});
gameWithComments('should understand commands with and without values', () => {
    const res = parsePgn('1. e4 {[%emt 0:19:00] [%EOG]}');
    assert.ok(res[0].commentDiag);
    assert.is(res[0].commentDiag.emt, '0:19:00');
    assert.is(res[0].commentDiag.EOG, true);
});
gameWithComments.run();

const clockCommands = suite('Parsing PGN with clockCommands with unusual format');
clockCommands('should emmit messages for mct with 1 hour digit', () => {
    const res = parseGame('e5 { [%mct 1:10:42] }');
    assert.ok(res);
    assert.is(res.moves[0].commentDiag?.mct, '1:10:42');
    assert.is(res.messages[0].message, 'Only 2 digits for hours normally used');
});
clockCommands('should emmit messages for egt, emt, clk with 2 hour digit', () => {
    let res = parseGame('e5 { [%egt 01:10:42] }');
    assert.ok(res);
    assert.is(res.moves[0].commentDiag?.egt, '01:10:42');
    assert.is(res.messages[0].message, 'Only 1 digit for hours normally used');
    res = parseGame('e5 { [%emt 01:10:42] }');
    assert.ok(res);
    assert.is(res.moves[0].commentDiag?.emt, '01:10:42');
    assert.is(res.messages[0].message, 'Only 1 digit for hours normally used');
    res = parseGame('e5 { [%clk 01:10:42] }');
    assert.ok(res);
    assert.is(res.moves[0].commentDiag?.clk, '01:10:42');
    assert.is(res.messages[0].message, 'Only 1 digit for hours normally used');
});
clockCommands(
    'should emmit a message for incomplete 1 hour digit commands: only seconds',
    () => {
        const res = parseGame('e5 { [%emt 42] }');
        assert.ok(res);
        assert.is(res.moves[0].commentDiag?.emt, '42');
        assert.is(res.messages[0].message, 'Hours and minutes missing');
    }
);
clockCommands(
    'should emmit a message for incomplete 1 hour digit commands: hours missing',
    () => {
        const res = parseGame('e5 { [%emt 12:42] }');
        assert.ok(res);
        assert.is(res.moves[0].commentDiag?.emt, '12:42');
        assert.is(res.messages[0].message, 'No hours found');
    }
);
clockCommands(
    'should emmit a message for incomplete 1 hour digit commands: 1 digit minutes',
    () => {
        const res = parseGame('e5 { [%emt 2:42] }');
        assert.ok(res);
        assert.is(res.moves[0].commentDiag?.emt, '2:42');
        assert.is(res.messages[0].message, 'No hours found');
    }
);
clockCommands('should emmit a message for use of millis', () => {
    const res = parseGame('e5 {[%clk 0:00:59.8]}');
    assert.ok(res);
    assert.is(res.moves[0].commentDiag?.clk, '0:00:59.8');
    assert.is(res.messages[0].message, 'Unusual use of millis in clock value');
});
clockCommands.run();

const parsingVariations = suite('Parsing PGN game with all kinds of variation');
parsingVariations('should read 0 variation', () => {
    const res = parsePgn('1. e4 e5');
    assert.is(res.length, 2);
    assert.equal(res[0].variations, []);
    assert.equal(res[1].variations, []);
});
parsingVariations('should read 1 variation', () => {
    const res = parsePgn('1. e4 e5 (1... c5 2. Nf3) 2. Nf3 Nc6');
    assert.is(res.length, 4);
    assert.is(res[0].variations.length, 0);
    assert.is(res[1].variations.length, 1);
    assert.is(res[1].variations[0].length, 2);
    assert.is(res[1].variations[0][0].notation.notation, 'c5');
});
parsingVariations('should read 1 variation at the first move', () => {
    const res = parsePgn('1. e4 (1. d4) 1... e5');
    assert.is(res.length, 2);
    assert.is(res[0].variations.length, 1);
    assert.is(res[1].variations.length, 0);
    assert.is(res[0].variations[0].length, 1);
    assert.is(res[0].variations[0][0].notation.notation, 'd4');
});
parsingVariations('should read many variation', () => {
    const res = parsePgn('1. e4 e5 (1... c5 2. Nf3) (1... c6) (e6) 2. Nf3 Nc6');
    assert.is(res[1].variations.length, 3);
    assert.is(res[1].variations[1][0].notation.notation, 'c6');
    assert.is(res[1].variations[2][0].notation.notation, 'e6');
});
parsingVariations('should read hierarchical variation', () => {
    const res = parsePgn('1. e4 e5 (1... c5 2. Nf3 (2. d4? cxd4 3. Qxd4)) 2. Nf3 Nc6');
    assert.is(res[1].variations[0][0].notation.notation, 'c5');
    assert.is(res[1].variations[0][1].variations[0][0].notation.notation, 'd4');
    assert.is(res[1].variations[0][1].variations[0][1].notation.notation, 'cxd4');
});
parsingVariations.run();

const parsingDifferentNotations = suite('Parsing PGN game with different notations used');
parsingDifferentNotations('should read SAN (short algebraic notation)', () => {
    const res = parsePgn(
        'e4 d5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Nxf7 Bxf2+ Kxf2 Nxe4 Kg1 Qh4 Nxh8 Qf2#'
    );
    assert.is(res.length, 16);
});
parsingDifferentNotations('should read LAN (long algebraic notation)', () => {
    const res = parsePgn('e2-e4 e7-e5 Ng1-f3 Nb8-c6 Bf1-c4 Ng8-f6');
    assert.is(res.length, 6);
});
parsingDifferentNotations('should read variants of LAN (long algebraic notation)', () => {
    const res = parsePgn('e2e4 e7xe5 g1-f3 b8c6 Bf1-c4 Ng8-f6');
    assert.is(res.length, 6);
});
parsingDifferentNotations('should read short and long castling', () => {
    const res = parsePgn('1. O-O 2. O-O-O');
    assert.is(res.length, 2);
    assert.is(res[0].notation.notation, 'O-O');
    assert.is(res[1].notation.notation, 'O-O-O');
});
parsingDifferentNotations.run();

const parsingMoveNumbers = suite('Parsing PGN game with all kinds of move numbers in it');

parsingMoveNumbers('should parse no move numbers', () => {
    const res = parsePgn('e4 e5 Nf3 Nc6');
    assert.is(res.length, 4);
    assert.is(res[0].notation.notation, 'e4');
});
parsingMoveNumbers('should parse normal move numbers', () => {
    const res = parsePgn('1. e4 e5 2. Nf3 Nc6');
    assert.is(res.length, 4);
    assert.is(res[0].notation.notation, 'e4');
});
parsingMoveNumbers('should parse additional move numbers without a problem', () => {
    const res = parsePgn('1. e4 1. e5 2. Nf3 2. Nc6');
    assert.is(res.length, 4);
    assert.is(res[0].notation.notation, 'e4');
});
parsingMoveNumbers(
    'should parse move numbers with additional dots and whitespaces',
    () => {
        const res = parsePgn('1... e4 1.....     e5 2......     Nf3 2   .... Nc6');
        assert.is(res.length, 4);
        assert.is(res[0].notation.notation, 'e4');
    }
);
parsingMoveNumbers(
    'should parse move numbers with wrong move number with dots and whitespaces',
    () => {
        const res = parsePgn('1. ... e4 1 e5 2 Nf3 2.  ... Nc6');
        assert.is(res.length, 4);
        assert.is(res[0].notation.notation, 'e4');
    }
);
parsingMoveNumbers.run();

const parsingSpecialMoveCharacter = suite(
    'Parsing PGN game with all kinds of special move character'
);

parsingSpecialMoveCharacter(
    'should understand all sorts of additional notation (without NAGs and promotion)',
    () => {
        const res = parsePgn('1. e4+ dxe5 2. Nf3# Nc6+');
        assert.is(res.length, 4);
        assert.is(res[0].notation.notation, 'e4+');
        assert.is(res[0].notation.check, '+');
        assert.is(res[1].notation.notation, 'dxe5');
        assert.is(res[1].notation.strike, 'x');
        assert.is(res[2].notation.notation, 'Nf3#');
        assert.is(res[2].notation.check, '#');
    }
);
parsingSpecialMoveCharacter.run();

const parsingNAGs = suite('Parsing PGN game with all kinds of NAGs');
parsingNAGs('should return undefined for no NAGs', () => {
    const res = parsePgn('1. e4');
    assert.is(res[0].nags, undefined);
});
parsingNAGs('should translate the standard NAGs to their canonical form', () => {
    const res = parsePgn('1. e4? e5! 2. d4?? d5!!');
    assert.is(res.length, 4);
    assert.ok(res[0].nags);
    assert.is(res[0].nags.length, 1);
    assert.is(res[0].nags[0], '$2');
    assert.ok(res[1].nags);
    assert.is(res[1].nags.length, 1);
    assert.is(res[1].nags[0], '$1');
    assert.ok(res[2].nags);
    assert.is(res[2].nags.length, 1);
    assert.is(res[2].nags[0], '$4');
    assert.ok(res[3].nags);
    assert.is(res[3].nags.length, 1);
    assert.is(res[3].nags[0], '$3');
});
parsingNAGs('should understand multiple NAGs', () => {
    const res = parsePgn('e4 $1$2$5 d5 $12 $23 $47');
    assert.is(res.length, 2);
    assert.is(res[0].nags?.length, 3);
    assert.is(res[0].nags?.[0], '$1');
    assert.is(res[0].nags?.[1], '$2');
    assert.is(res[0].nags?.[2], '$5');
    assert.is(res[1].nags?.length, 3);
    assert.is(res[1].nags?.[0], '$12');
    assert.is(res[1].nags?.[1], '$23');
    assert.is(res[1].nags?.[2], '$47');
});
parsingNAGs('should understand non-standard NAGs', () => {
    const res = parsePgn('1. Nbd7 += Qh4 =+');
    assert.is(res.length, 2);

    assert.is(res[0].nags?.length, 1);
    assert.is(res[0].nags?.[0], '$14');
    assert.is(res[1].nags?.length, 1);
    assert.is(res[1].nags?.[0], '$15');
});
parsingNAGs.run();

const parsingPromotions = suite('Parsing PGN game with all kinds of promotions');
parsingPromotions('should understand all promotions for white and black', () => {
    const res = parsePgn('e4=Q e5=R f3=B c6=N c4 c5');
    //const res = parsePgn("e4=Q e5=R f3=B c6=N c4=P c5=K")
    assert.is(res.length, 6);
    assert.is(res[0].notation.promotion, '=Q');
    assert.is(res[1].notation.promotion, '=R');
    assert.is(res[2].notation.promotion, '=B');
    assert.is(res[3].notation.promotion, '=N');
    assert.is.not(res[4].notation.promotion, '=P');
    assert.is.not(res[5].notation.promotion, '=K');
});
parsingPromotions('should throw an exception if promoting to king or pawn', () => {
    assert.throws(() => {
        parsePgn('c8=P');
    });
    assert.throws(() => {
        parsePgn('c8=K');
    });
});
parsingPromotions("should allow promotion with and without '=' sign", () => {
    const res = parsePgn('e4Q e5R f3B c6N c4 c5');
    //const res = parsePgn("e4=Q e5=R f3=B c6=N c4=P c5=K")
    assert.is(res.length, 6);
    assert.is(res[0].notation.promotion, '=Q');
    assert.is(res[1].notation.promotion, '=R');
    assert.is(res[2].notation.promotion, '=B');
    assert.is(res[3].notation.promotion, '=N');
    assert.is.not(res[4].notation.promotion, '=P');
    assert.is.not(res[5].notation.promotion, '=K');
});
parsingPromotions.run();

const parsingDiscriminators = suite('Parsing PGN game with all kinds of discriminators');
parsingDiscriminators('should detect discriminators', () => {
    const res = parsePgn('exg4 Nce5 B4f3');
    assert.is(res.length, 3);
    assert.is(res[0].notation.discriminator, 'e');
    assert.is(res[1].notation.discriminator, 'c');
    assert.is(res[2].notation.discriminator, '4');
});
parsingDiscriminators.run();

const followLawsOfChess = suite("Parsing PGN games which follow 'Laws of Chess'");
followLawsOfChess("should allow 'e.p.' in the notation", () => {
    const res = parsePgn('exd6 e.p.');
    assert.is(res.length, 1);
    assert.is(res[0].notation.notation, 'exd6');
});
followLawsOfChess.run();

const parsingNullMoves = suite('Parsing pgn notation with null moves');
parsingNullMoves('should allow null moves inserted', () => {
    const res: PgnMove[] = parsePgn('1. e4 e5 2. Z0 Nc6 3. Z0 Nf6');
    assert.ok(res);
    assert.is(res.length, 6);
    assert.is(res[2].notation.notation, 'Z0');
    assert.is(res[4].notation.notation, 'Z0');
});
parsingNullMoves('should allow alternate null moves inserted', () => {
    const res: PgnMove[] = parsePgn('1. e4 e5 2. -- Nc6 3. -- Nf6');
    assert.ok(res);
    assert.is(res.length, 6);
    assert.is(res[2].notation.notation, 'Z0');
    assert.is(res[4].notation.notation, 'Z0');
});
parsingNullMoves.run();

const parsingCrazyhouse = suite('Parsing Crazyhouse notation');
parsingCrazyhouse('should understand drop notation', () => {
    const res = parsePgn('12... B@e7 {[%clk 0:00:45]}');
    assert.ok(res);
    assert.ok(res[0].notation);
    let move = res[0].notation;
    assert.is(move.piece, 'B');
    assert.is(move.file, 'e');
    assert.is(move.rank, '7');
    assert.is(move.drop, true);
    assert.is(move.notation, 'B@e7');
});
parsingCrazyhouse.run();

const postProcessing = suite('When doing post processing of one game (only pgn)');
postProcessing('should handle turn correct', () => {
    const res = parsePgn('1. e4 e5');
    assert.ok(res);
    assert.is(res[0].turn, 'w');
    assert.is(res[1].turn, 'b');
});
postProcessing('should handle turn correct for black with fen', () => {
    const res = (<ParseTree>parseGame('2... Nc6 3. d4', {
        startRule: 'pgn',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    })).moves;
    assert.ok(res);
    assert.is(res[0].turn, 'b');
    assert.is(res[1].turn, 'w');
});
postProcessing('should handle turn correct for white with fen', () => {
    const res = (<ParseTree>parseGame('3. d4 exd4', {
        startRule: 'pgn',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    })).moves;
    assert.ok(res);
    assert.is(res[0].turn, 'w');
    assert.is(res[1].turn, 'b');
});
postProcessing('should understand all variations well', () => {
    const res = parsePgn(
        '1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3'
    );
    assert.ok(res);
    assert.is(res[1].variations[0][0].turn, 'b');
    assert.is(res[1].variations[0][1].turn, 'w');
    assert.is(res[1].variations[0][2].turn, 'b');
    assert.is(res[1].variations[1][0].turn, 'b');
    assert.is(res[1].variations[1][1].turn, 'w');
    assert.is(res[1].variations[1][2].turn, 'b');
});
postProcessing.run();
