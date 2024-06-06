import { parseGame, parseGames, ParseTree } from '../src';
import { TagKeys } from '@mliebelt/pgn-types';
import should = require('should');

let tag = function (pt: ParseTree, tag: TagKeys): string {
    if (!pt.tags) {
        return '';
    }
    if (pt.tags && pt.tags[tag]) {
        return pt.tags[tag];
    }
    return '';
};

// The following test cases test everything about a game, with the exception of game moves, and tags.
describe('When working with one game', function () {
    it('should read a complete game inclusive tags', function () {
        let res = parseGame('[White "Me"] [Black "Magnus"] 1. f4 e5 2. g4 Qh4#');
        // console.log(JSON.stringify(res, null, 4))
        should.exist(res);
        should.exist(res.tags);
        should.exist(res.moves);
        should(tag(res, 'White')).equal('Me');
        should(tag(res, 'Black')).equal('Magnus');
        should(res.moves.length).equal(4);
        should.exist(res.moves[0]);
        should(res.moves[0].notation.notation).equal('f4');
    });

    it('should read unusual spacing of tags', function () {
        let res = parseGame(' [ White    "Me"   ]  [  Black  "Magnus"   ] 1. e4');
        should.exist(res);
        should.exist(res.tags);
        should.exist(res.moves);
    });

    it('should read tags without notation', function () {
        let res = parseGame('[White "Me"] [Black "Magnus"] *');
        should.exist(res);
        should.exist(res.tags);
        should.exist(res.moves);
        should(res.moves.length).equal(0); // end game
        should(tag(res, 'White')).equal('Me');
        should(tag(res, 'Black')).equal('Magnus');
    });

    it('should read moves without tags without game termination marker', function () {
        let res = parseGame('1. f4 e5 2. g4 Qh4#');
        should.exist(res);
        should.exist(res.tags);
        should.exist(res.moves);
        let tags = res.tags ? res.tags : [];
        should(Object.keys(tags).length).equal(0);
        should(res.moves.length).equal(4);
        should.exist(res.moves[0]);
        should(res.moves[0].notation.notation).equal('f4');
    });
    it('should read moves without tags with game termination marker ignored', function () {
        let res = parseGame('1. f4 e5 2. g4 Qh4# 0-1');
        should.exist(res);
        should.exist(res.tags);
        should.exist(res.moves);
        // Game result is converted to tag
        let tags = res.tags ? res.tags : [];
        should(Object.keys(tags).length).equal(1);
        should(tag(res, 'Result')).equal('0-1');
        should(res.moves.length).equal(4);
        should.exist(res.moves[0]);
        should(res.moves[0].notation.notation).equal('f4');
        //should(res.moves[4]).equal("0-1")
    });
    it('should read comments without moves', function () {
        let res = parseGame('{ [%csl Ya4,Gh8,Be1] } *');
        should.exist(res);
        should.exist(res.gameComment);
        should.exist(res.gameComment?.colorFields);
        should(res.gameComment?.colorFields?.length).equal(3);
    });
});

describe('When reading one game be more robust', function () {
    it('when reading 1 space at the beginning', function () {
        let res = parseGame(' 1. e4');
        should.exist(res);
        should.exist(res.moves);
        should(res.moves[0].notation.notation).equal('e4');
    });

    it('when reading more spaces at the beginning', function () {
        let res = parseGame('  1. e4');
        should.exist(res);
        should.exist(res.moves);
        should(res.moves[0].notation.notation).equal('e4');
    });

    it('when reading game ending', function () {
        let res = parseGame('37. cxb7 Rxh3#{Wunderschön!}');
        should.exist(res);
        should(res.moves[1].commentAfter).equal('Wunderschön!');
        res = parseGame('37. cxb7 Rxh3# { Wunderschön!}');
        should.exist(res);
        should(res.moves[1].commentAfter).equal('Wunderschön!');
        res = parseGame('37. cxb7 Rxh3# { Wunderschön! } 0-1 ');
        should.exist(res);
        should(res.moves[1].commentAfter).equal('Wunderschön!');
        //should(res.moves[2]).equal("0-1")
    });

    it('should read result including whitespace', function () {
        let res = parseGame('27. Ng2 Qxg2# 0-1 ');
        should.exist(res);
        //should(res.moves[2]).equal("0-1")
    });
});

describe('When reading a game with gameComment', function () {
    it('should read normal comment at the beginning', function () {
        let res = parseGame('{test} 1. e4');
        should.exist(res);
        should.exist(res.moves);
        should.exist(res.gameComment);
        should(res.gameComment?.comment).equal('test');
    });
    it('should read arrows and circles in game comment', function () {
        let res = parseGame('{ [%cal Ye4e8] [%csl Rd4] } 1. e4');
        should.exist(res);
        should.exist(res.gameComment);
        let arrows = res.gameComment?.colorArrows || [];
        should(arrows.length).equal(1);
        should(arrows[0]).equal('Ye4e8');
        let fields = res.gameComment?.colorFields || [];
        should(fields.length).equal(1);
        should(fields[0]).equal('Rd4');
    });
    it('should read arrows and circles in two game comments', function () {
        let res = parseGame('{ [%cal Ye4e8] } { [%csl Rd4] } 1. e4');
        should.exist(res);
        should.exist(res.gameComment);
        let arrows = res.gameComment?.colorArrows || [];
        should(arrows.length).equal(1);
        should(arrows[0]).equal('Ye4e8');
        let fields = res.gameComment?.colorFields || [];
        should(fields.length).equal(1);
        should(fields[0]).equal('Rd4');
    });
    it('should read mix of arrows and circles with other comments', function () {
        let res = parseGame('{comment1 [%cal Ye4e8] } {comment2 [%csl Rd4] } 1. e4');
        should.exist(res);
        should.exist(res.gameComment);
        let arrows = res.gameComment?.colorArrows || [];
        should(arrows.length).equal(1);
        should(arrows[0]).equal('Ye4e8');
        let fields = res.gameComment?.colorFields || [];
        should(fields.length).equal(1);
        should(fields[0]).equal('Rd4');
        should(res.gameComment?.comment).equal('comment1 comment2');
    });

    it('should read comments with newlines', function () {
        let res = parseGame('{comment1\nTest newline } 1. e4');
        should.exist(res);
        should.exist(res.gameComment);
        should(res.gameComment?.comment).equal('comment1\nTest newline');
    });
});

describe('When reading games with incorrect format', function () {
    it('should emmit warnings in games', function () {
        let res = parseGame('[Date "xx"] *');
        should.exist(res);
        should(res.moves.length).equal(0);
        should(res.messages.length).equal(1);
        should(res.messages[0].key).equal('Date');
        should(res.messages[0].value).equal('xx');
        should(res.messages[0].message).equal('Format of tag: "Date" not correct: "xx"');
    });
});

describe('When doing post processing of one game', function () {
    it('should handle turn correct', function () {
        let res = parseGame('1. e4 e5');
        should.exist(res);
        should(res.moves.length).equal(2);
        should(res.moves[0].turn).equal('w');
        should(res.moves[1].turn).equal('b');
    });
    it('should handle turn correct for variations', function () {
        let res = parseGame('1. e4 e5 (1... d5 2. Nc3)');
        should.exist(res);
        should(res.moves.length).equal(2);
        should(res.moves[0].turn).equal('w');
        should(res.moves[1].turn).equal('b');
        should(res.moves[1].variations[0][0].turn).equal('b');
        should(res.moves[1].variations[0][1].turn).equal('w');
    });
    it('should handle correct turn for black with FEN given', function () {
        let res = parseGame(
            '[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"] Nc6 3. d4'
        );
        should.exist(res);
        should(res.moves.length).equal(2);
        should(res.moves[0].turn).equal('b');
        should(res.moves[1].turn).equal('w');
    });
    it('should handle correct turn for white with FEN given', function () {
        let res = parseGame(
            '[FEN "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"] 3. d4 exd4'
        );
        should.exist(res);
        should(res.moves.length).equal(2);
        should(res.moves[0].turn).equal('w');
        should(res.moves[1].turn).equal('b');
    });
    it('should handle correct turn for white with FEN given by option', function () {
        let res = <ParseTree>parseGame('3. d4 exd4', {
            startRule: 'game',
            fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        });
        should.exist(res);
        should(res.moves.length).equal(2);
        should(res.moves[0].turn).equal('w');
        should(res.moves[1].turn).equal('b');
    });
    it('should handle result both in tags and SAN', function () {
        let res = parseGame('[Result "1-0"] 1. e4 1-0');
        should.exist(res);
        should(res.moves.length).equal(1);
        should(tag(res, 'Result')).equal('1-0');
        should(res.messages.length).equal(0);
    });
    it('should handle result from SAN as tag', function () {
        let res = parseGame('1. e4 1-0');
        should.exist(res);
        should(res.moves.length).equal(1);
        should(tag(res, 'Result')).equal('1-0');
        should(res.messages.length).equal(0);
    });
    it('should handle different result from SAN as tag', function () {
        let res = parseGame('[Result "0-1"] 1. e4 1-0');
        should.exist(res);
        should(res.moves.length).equal(1);
        should(tag(res, 'Result')).equal('1-0');
        should(res.messages.length).equal(1);
        should(res.messages[0].message).equal(
            'Result in tags is different to result in SAN'
        );
    });
});

describe('When reading additional notation', function () {
    it('should understand a draw offer after a move', function () {
        let res = parseGame('1. e4 e5 2. f4 d4 (=) 3. exd5');
        should.exist(res);
        should(res.moves.length).equal(5);
        should(res.moves[3].drawOffer).equal(true);
        should(res.moves[4].drawOffer).undefined();
    });
    it('should understand a draw offer after move with comments after it', function () {
        let res = parseGame('1. e4 e5 2. f4 d4 (=) {Why now???} 3. exd5');
        should(res.moves.length).equal(5);
        should(res.moves[3].drawOffer).true();
        should(res.moves[3].commentAfter).equal('Why now???');
    });
});

describe('When reading failure games', function () {
    it('should handle variants and comments (discussion 271)', function () {
        let res = parseGame(
            '1. e3 h5 ( 1... f6 ) 2. Bc4 d6 3. Bb5+ Qd7 4. h3 f5 5. e4 g5 6. Qxh5+ { test } Kd8 7. Bc4 b6 8. Be6 a5 9. Bxd7 b5 10. Qe8#'
        );
        should(res.moves.length).equal(19);
    });
    it('should handle BOM on the beginning of games', function () {
        let res = parseGame(
            '\uFEFF[Event ""]\n' +
                '[Setup "1"]\n' +
                '[FEN "4r1k1/1q3ppp/p7/8/Q3r3/8/P4PPP/R3R1K1 w - - 0 1"]\n' +
                '1. Qxe8+ {} Rxe8 2. Rxe8# *\n'
        );
        should.exist(res);
        should(res.moves.length).equal(3);
    });
});

describe('When reading games with error', function () {});
