import { suite } from 'uvu';
import assert from 'uvu/assert';
import { TimeControlKind, parse } from '../src';
import { ParseTree } from '../src';

function parseTags(string: string): ParseTree {
    return parse(string, { startRule: 'tags' });
}

const whenWorkingWithTags = suite('When working with all kind of tags');
whenWorkingWithTags('should read one tag', () => {
    const { tags } = parseTags('[White "Me"]');
    assert.is(Object.keys(tags || {}).length, 1);
    assert.is(tags?.White, 'Me');
});
whenWorkingWithTags('should read all 7 roster tags', () => {
    const { tags } = parseTags(
        '[Event "What a tournament"] [Site "My home town"] [Date "2020.05.16"] ' +
            '[Round "1"] [White "Me"] [Black "Magnus"] [Result "1-0"][WhiteTitle "GM"]'
    );
    assert.is(tags?.Event, 'What a tournament');
    assert.is(tags?.Site, 'My home town');
    assert.is(tags?.Round, '1');
    assert.is(tags?.White, 'Me');
    assert.is(tags?.Black, 'Magnus');
    assert.is(tags?.Result, '1-0');
    assert.is(tags?.Date?.value, '2020.05.16');
});
whenWorkingWithTags('should read all optional player related', () => {
    const { tags } = parseTags(
        '[WhiteTitle "GM"] [BlackTitle "IM"] ' +
            '[WhiteELO "2899"] [BlackELO "700"] [WhiteUSCF "1234"] [BlackUSCF "1234"] [WhiteNA "m.c@norway.com"]' +
            '[BlackNA "me@world.org"] [WhiteType "Human"] [BlackType "Computer"]'
    );
    assert.is(tags?.WhiteTitle, 'GM');
    assert.is(tags?.BlackTitle, 'IM');
    assert.equal(tags?.WhiteElo, { value: '2899', int: 2899 });
    assert.equal(tags?.BlackElo, { value: '700', int: 700 });
    assert.equal(tags?.WhiteUSCF, { value: '1234', int: 1234 });
    assert.equal(tags?.BlackUSCF, { value: '1234', int: 1234 });
    assert.is(tags?.WhiteNA, 'm.c@norway.com');
    assert.is(tags?.BlackNA, 'me@world.org');
    assert.is(tags?.WhiteType, 'Human');
    assert.is(tags?.BlackType, 'Computer');
});
whenWorkingWithTags('should read non-integer ELO', () => {
    const { tags } = parseTags(
        '[WhiteTitle "GM"] [BlackTitle "IM"] ' +
            '[WhiteELO "2899 USCF"] [BlackELO "700"] [WhiteUSCF "1234"] [BlackUSCF "1234"] [WhiteNA "m.c@norway.com"]' +
            '[BlackNA "me@world.org"] [WhiteType "Human"] [BlackType "Computer"]'
    );
    assert.is(tags?.WhiteTitle, 'GM');
    assert.is(tags?.BlackTitle, 'IM');
    assert.equal(tags?.WhiteElo, { value: '2899 USCF', int: 2899 });
    assert.equal(tags?.BlackElo, { value: '700', int: 700 });
    assert.equal(tags?.WhiteUSCF, { value: '1234', int: 1234 });
    assert.equal(tags?.BlackUSCF, { value: '1234', int: 1234 });
    assert.is(tags?.WhiteNA, 'm.c@norway.com');
    assert.is(tags?.BlackNA, 'me@world.org');
    assert.is(tags?.WhiteType, 'Human');
    assert.is(tags?.BlackType, 'Computer');
});
whenWorkingWithTags('should read all event related information', () => {
    const { tags } = parseTags(
        '[EventDate "2020.05.02"] [EventSponsor "USCF"] [Section "A"] ' +
            '[Stage "Final"] [Board "1"]'
    );
    assert.is(tags?.EventDate?.value, '2020.05.02');
    assert.is(tags?.EventSponsor, 'USCF');
    assert.is(tags?.Section, 'A');
    assert.is(tags?.Stage, 'Final');
    assert.equal(tags?.Board, { value: '1', int: 1 });
});
whenWorkingWithTags(
    'should read all opening information (local specific and third party vendors)',
    () => {
        const { tags } = parseTags(
            '[Opening "EPD Opcode v0"] [Variation "EPD Opcode v1"] ' +
                '[SubVariation "EPD Opcode v2"] [ECO "XDD/DD"] [NIC "NIC Variation"]'
        );
        assert.is(tags?.Opening, 'EPD Opcode v0');
        assert.is(tags?.Variation, 'EPD Opcode v1');
        assert.is(tags?.SubVariation, 'EPD Opcode v2');
        assert.is(tags?.ECO, 'XDD/DD');
        assert.is(tags?.NIC, 'NIC Variation');
    }
);
whenWorkingWithTags('should read alternative starting positions', () => {
    const { tags } = parseTags(
        '[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"] [SetUp "1"]'
    );
    assert.is(tags?.SetUp, '1');
    assert.is(tags?.FEN, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
});
whenWorkingWithTags('should read game conclusion and misc', () => {
    const { tags } = parseTags(
        '[Termination "death"] [Annotator "Me"] [Mode "OTB"] [PlyCount "17"]'
    );
    assert.is(tags?.Termination, 'death');
    assert.is(tags?.Annotator, 'Me');
    assert.is(tags?.Mode, 'OTB');
    assert.equal(tags?.PlyCount, { value: '17', int: 17 });
});
whenWorkingWithTags('should handle non-standard date formats', () => {
    const { tags } = parseTags(
        '[Date "2024-06-14"] [EventDate "2020/05/02"] [EventSponsor "USCF"] [Section "A"] ' +
            '[Stage "Final"] [Board "1"]'
    );

    assert.is(tags?.Date?.value, '2024.06.14');
    assert.is(tags?.Date?.year, 2024);
    assert.is(tags?.Date?.month, 6);
    assert.is(tags?.Date?.day, 14);

    assert.is(tags?.EventDate?.value, '2020.05.02');
    assert.is(tags?.EventDate?.year, 2020);
    assert.is(tags?.EventDate?.month, 5);
    assert.is(tags?.EventDate?.day, 2);
});
whenWorkingWithTags.run();

const eloTags = suite('When working with ELO tags');

eloTags('should read integer ELO as integer', () => {
    const { tags } = parseTags('[WhiteElo "1234"]');
    assert.is(tags?.WhiteElo?.value, '1234');
    assert.is(tags?.WhiteElo?.int, 1234);
});

eloTags('should handle unknown ELO', () => {
    const { tags } = parseTags('[WhiteElo "-"]');
    assert.is(tags?.WhiteElo?.value, '-');
    assert.is(tags?.WhiteElo?.int, undefined);
});

eloTags('should handle empty ELO as unknown', () => {
    const { tags } = parseTags('[WhiteElo ""]');
    assert.is(tags?.WhiteElo?.value, '-');
    assert.is(tags?.WhiteElo?.int, undefined);
});

eloTags('should handle non-integer ELO', () => {
    const { tags } = parseTags('[WhiteElo "foo"] [BlackElo "1234 USCF"]');
    assert.equal(tags?.WhiteElo, { value: 'foo', int: NaN });
    assert.equal(tags?.BlackElo, { value: '1234 USCF', int: 1234 });
});

eloTags.run();

const differentFormatDates = suite('When working with different formats for dates');
differentFormatDates('should read the date if well formed', () => {
    const { tags } = parseTags(
        '[Date "2020.06.16"] [EventDate "2020.05.31"] [UTCDate "2021.02.28"]'
    );
    assert.is(tags?.Date?.value, '2020.06.16');
    assert.is(tags?.Date?.year, 2020);
    assert.is(tags?.Date?.month, 6);
    assert.is(tags?.Date?.day, 16);
    assert.is(tags?.EventDate?.value, '2020.05.31');
    assert.is(tags?.UTCDate?.value, '2021.02.28');
});
differentFormatDates('should allow question marks instead of parts of the date', () => {
    const { tags } = parseTags(
        '[Date "2020.??.??"] [EventDate "2020.12.??"] [UTCDate "????.??.??"]'
    );
    assert.is(tags?.Date?.value, '2020.??.??');
    assert.is(tags?.Date?.year, 2020);
    assert.is(tags?.Date?.month, '??');
    assert.is(tags?.EventDate?.value, '2020.12.??');
    assert.is(tags?.UTCDate?.value, '????.??.??');
});
differentFormatDates('should read all time and date related information', () => {
    const { tags } = parseTags('[Time "09:20:15"] [UTCTime "23:59:59"]');
    assert.is(tags?.Time?.value, '09:20:15');
    assert.is(tags?.Time?.hour, 9);
    assert.is(tags?.UTCTime?.value, '23:59:59');
});
differentFormatDates('should collect messages for wrong date or time format', () => {
    let { messages } = parseTags('[Date "2020"]');
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "Date" not correct: "2020"');

    ({ messages } = parseTags('[Date "2020.12"]'));
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "Date" not correct: "2020.12"');

    ({ messages } = parseTags('[Date "2020.12.xx"]'));
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "Date" not correct: "2020.12.xx"');

    ({ messages } = parseTags('[UTCDate "?.12.??"]'));
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "UTCDate" not correct: "?.12.??"');
});
differentFormatDates.run();

const tryDifferentVariations = suite(
    'When trying to find different variations how to write tags'
);
tryDifferentVariations('should read any order (just some examples)', () => {
    const { tags } = parseTags(
        '[Black "Me"] [Round "3"] [White "Magnus"] [Site "Oslo"] ' +
            '[Result "1-0"] [Date "2020.04.28"]'
    );
    assert.is(tags?.White, 'Magnus');
    assert.is(tags?.Site, 'Oslo');
    assert.is(tags?.Date?.value, '2020.04.28');
    assert.is(tags?.Result, '1-0');
    assert.is(tags?.Round, '3');
    assert.is(tags?.Black, 'Me');
});
tryDifferentVariations('should allow duplicate entries, last one winning', () => {
    const { tags } = parseTags(
        '[ECO "ECO0815"] [White "You"] [ECO "ECO1"] [White "Me"] [SetUp "0"]'
    );
    assert.is(tags?.White, 'Me');
    assert.is(tags?.ECO, 'ECO1');
    assert.is(tags?.SetUp, '0');
});
tryDifferentVariations(
    'should allow any kind of whitespace in between, before and after',
    () => {
        const { tags } = parseTags(
            ' \t[White \t\n"Value"] \r\t [Black "Value"] [Site "Value"]\r'
        );
        assert.is(tags?.White, 'Value');
        assert.is(tags?.Black, 'Value');
        assert.is(tags?.Site, 'Value');
    }
);
tryDifferentVariations('should allow some variations in upper- and lowercase', () => {
    const { tags } = parseTags(
        '[white "Me"] [Whiteelo "2400"] [Eventdate "2020.12.24"] [plyCount "23"]'
    );
    assert.is(tags?.White, 'Me');
    assert.equal(tags?.WhiteElo, { value: '2400', int: 2400 });
    assert.is(tags?.EventDate?.value, '2020.12.24');
    assert.equal(tags?.PlyCount, { value: '23', int: 23 });
});
tryDifferentVariations('should allow variations of SetUp and WhiteELO', () => {
    const { tags } = parseTags('[Setup "1"][WhiteElo "2700"]');
    assert.is(tags?.SetUp, '1');
    assert.equal(tags?.WhiteElo, { value: '2700', int: 2700 });
});
tryDifferentVariations.run();

const mixingDifferentTags = suite('When mixing different kinds of tags');
mixingDifferentTags('should understand if tags begin with the same word', () => {
    const { tags } = parseTags('[White "Me"][WhiteELO "1234"]');
    assert.is(tags?.White, 'Me');
    assert.equal(tags?.WhiteElo, { value: '1234', int: 1234 });
});
mixingDifferentTags(
    'should understand if tags begin with the same word for black as well',
    () => {
        const { tags } = parseTags('[Black "Me"][BlackTitle "GM"][BlackELO "1234"]');
        assert.is(tags?.Black, 'Me');
        assert.is(tags?.BlackTitle, 'GM');
        assert.equal(tags?.BlackElo, { value: '1234', int: 1234 });
    }
);
mixingDifferentTags('should understand all mixes of Event in the tags', () => {
    const { tags } = parseTags(
        '[Event "Me"][EventDate "2020.06.05"][EventSponsor "Magnus"]'
    );
    assert.is(tags?.Event, 'Me');
    assert.is(tags?.EventDate?.value, '2020.06.05');
    assert.is(tags?.EventSponsor, 'Magnus');
});
mixingDifferentTags.run();

const unknownKeys = suite('Signal collect tags for unknown keys');
unknownKeys('should record tag and string value for any key not known', () => {
    const { tags } = parseTags('[Bar "Foo"]');
    assert.is(tags?.Bar, 'Foo');
});
unknownKeys('should record lichess puzzle tags', () => {
    const { tags } = parseTags(
        '[PuzzleCategory "Material"]\n' +
            '[PuzzleEngine "Stockfish 13"]\n' +
            '[PuzzleMakerVersion "0.5"]\n' +
            '[PuzzleWinner "White"]'
    );
    assert.is(tags?.PuzzleEngine, 'Stockfish 13');
    assert.is(tags?.PuzzleMakerVersion, '0.5');
    assert.is(tags?.PuzzleCategory, 'Material');
    assert.is(tags?.PuzzleWinner, 'White');
});
unknownKeys.run();

const allowDifferentResults = suite('Allow different kind of results');
allowDifferentResults('should read all kind of results: *', () => {
    const { tags } = parseTags('[Result "*"]');
    assert.is(tags?.Result, '*');
});
allowDifferentResults('should read all kind of results: 1-0', () => {
    const { tags } = parseTags('[Result "1-0"]');
    assert.is(tags?.Result, '1-0');
});
allowDifferentResults('should read all kind of results: 0-1', () => {
    const { tags } = parseTags('[Result "0-1"]');
    assert.is(tags?.Result, '0-1');
});
allowDifferentResults('should read all kind of results: 1/2-1/2', () => {
    let { tags } = parseTags('[Result "1/2-1/2"]');
    assert.is(tags?.Result, '1/2-1/2');

    ({ tags } = parseTags('[Result "1/2"]'));
    assert.is(tags?.Result, '1/2-1/2');
});
allowDifferentResults('should signal error on result: 1:0', () => {
    const { tags, messages } = parseTags('[Result "1:0"]');
    assert.is(tags?.Result, '1:0');
    assert.is(messages.length, 1);
});
allowDifferentResults.run();

const allowTagsLichessTwic = suite('Allow additional tags from lichess and twic');
allowTagsLichessTwic('should understand the variant tag', () => {
    const { tags } = parseTags('[Variant "Crazyhouse"]');
    assert.is(tags?.Variant, 'Crazyhouse');
});
allowTagsLichessTwic('should understand the WhiteRatingDiff tag', () => {
    const { tags } = parseTags('[WhiteRatingDiff "+8"]');
    assert.is(tags?.WhiteRatingDiff, '+8');
});
allowTagsLichessTwic('should understand the BlackRatingDiff tag', () => {
    const { tags } = parseTags('[BlackRatingDiff "+8"]');
    assert.is(tags?.BlackRatingDiff, '+8');
});
allowTagsLichessTwic('should understand the WhiteFideId tag', () => {
    const { tags } = parseTags('[WhiteFideId "1503014"]');
    assert.is(tags?.WhiteFideId, '1503014');
});
allowTagsLichessTwic('should understand the BlackFideId tag', () => {
    const { tags } = parseTags('[BlackFideId "1503014"]');
    assert.is(tags?.BlackFideId, '1503014');
});
allowTagsLichessTwic('should understand the WhiteTeam tag', () => {
    const { tags } = parseTags('[WhiteTeam "Sweden"]');
    assert.is(tags?.WhiteTeam, 'Sweden');
});
allowTagsLichessTwic('should understand the BlackTeam tag', () => {
    const { tags } = parseTags('[BlackTeam "Sweden"]');
    assert.is(tags?.BlackTeam, 'Sweden');
});
allowTagsLichessTwic.run();

const timeControlTags = suite('Understand all possible TimeControl tags');
timeControlTags('should read TimeControl tag at all', () => {
    const { tags } = parseTags('[TimeControl "?"]');
    assert.ok(tags);
});
timeControlTags('should read TimeControl tag of kind unknown', () => {
    const { tags } = parseTags('[TimeControl "?"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.Unknown);
    assert.is(tags?.TimeControl?.items[0].value, '?');
    assert.is(tags?.TimeControl.value, '?');
});
timeControlTags('should read TimeControl tag of kind unlimited', () => {
    const { tags } = parseTags('[TimeControl "-"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.Unlimited);
    assert.is(tags?.TimeControl?.items[0].value, '-');
    assert.is(tags?.TimeControl.value, '-');
});
timeControlTags('should read TimeControl tag of kind movesInSeconds', () => {
    const { tags } = parseTags('[TimeControl "40/9000"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.MovesInSeconds);
    assert.is(tags?.TimeControl?.items[0].moves, 40);
    assert.is(tags?.TimeControl?.items[0].seconds, 9000);
    assert.is(tags?.TimeControl?.items[0].value, '40/9000');
    assert.is(tags?.TimeControl.value, '40/9000');
});
timeControlTags('should read TimeControl tag of kind movesInSecondsIncrement', () => {
    const { tags } = parseTags('[TimeControl "40/9000+30"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(
        tags?.TimeControl?.items[0].kind,
        TimeControlKind.MovesInSecondsWithIncrement
    );
    assert.is(tags?.TimeControl?.items[0].moves, 40);
    assert.is(tags?.TimeControl?.items[0].seconds, 9000);
    assert.is(tags?.TimeControl?.items[0].increment, 30);
    assert.is(tags?.TimeControl?.items[0].value, '40/9000+30');
    assert.is(tags?.TimeControl.value, '40/9000+30');
});
timeControlTags('should read TimeControl tag of kind movesInSecondsDelay', () => {
    const { tags } = parseTags('[TimeControl "40/9000d30"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.MovesInSecondsWithDelay);
    assert.is(tags?.TimeControl?.items[0].moves, 40);
    assert.is(tags?.TimeControl?.items[0].seconds, 9000);
    assert.is(tags?.TimeControl?.items[0].delay, 30);
    assert.is(tags?.TimeControl?.items[0].value, '40/9000d30');
    assert.is(tags?.TimeControl.value, '40/9000d30');
});
timeControlTags('should read TimeControl tag of kind suddenDeath', () => {
    const { tags } = parseTags('[TimeControl "60"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.SuddenDeath);
    assert.is(tags?.TimeControl?.items[0].seconds, 60);
    assert.is(tags?.TimeControl?.items[0].value, '60');
    assert.is(tags?.TimeControl.value, '60');
});
timeControlTags('should read TimeControl tag of kind increment', () => {
    const { tags } = parseTags('[TimeControl "60+1"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.SecondsWithIncrement);
    assert.is(tags?.TimeControl?.items[0].seconds, 60);
    assert.is(tags?.TimeControl?.items[0].increment, 1);
    assert.is(tags?.TimeControl?.items[0].value, '60+1');
    assert.is(tags?.TimeControl.value, '60+1');
});
timeControlTags('should read TimeControl tag of kind delay', () => {
    const { tags } = parseTags('[TimeControl "60d1"]');
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.SecondsWithDelay);
    assert.is(tags?.TimeControl?.items[0].seconds, 60);
    assert.is(tags?.TimeControl?.items[0].delay, 1);
    assert.is(tags?.TimeControl?.items[0].value, '60d1');
    assert.is(tags?.TimeControl?.value, '60d1');
});
timeControlTags('should read TimeControl tag of kind hourglass', () => {
    const { tags } = parseTags('[TimeControl "*60"]');
    assert.ok(tags);
    assert.ok(tags?.TimeControl);
    assert.is(tags?.TimeControl?.items[0].kind, TimeControlKind.Hourglass);
    assert.is(tags?.TimeControl?.items[0].seconds, 60);
    assert.is(tags?.TimeControl?.items[0].value, '*60');
    assert.is(tags?.TimeControl.value, '*60');
});
timeControlTags(
    'should understand common time format: German tournament (no increment)',
    () => {
        const { tags } = parseTags('[TimeControl "40/7200:3600"]');
        assert.ok(tags);
        assert.is(tags?.TimeControl?.items[0]?.kind, TimeControlKind.MovesInSeconds);
        assert.is(tags?.TimeControl?.items[0]?.seconds, 7200);
        assert.is(tags?.TimeControl?.items[0]?.moves, 40);
        assert.is(tags?.TimeControl?.items[0]?.value, '40/7200');
        assert.is(tags?.TimeControl?.items[1]?.kind, TimeControlKind.SuddenDeath);
        assert.is(tags?.TimeControl?.items[1]?.seconds, 3600);
        assert.is(tags?.TimeControl?.items[1]?.value, '3600');
        assert.is(tags?.TimeControl?.value, '40/7200:3600');
    }
);
timeControlTags(
    'should understand common time format: German Bundesliga (with increment)',
    () => {
        const { tags } = parseTags('[TimeControl "40/6000+30:3000+30"]');
        assert.ok(tags);
        assert.is(
            tags?.TimeControl?.items[0].kind,
            TimeControlKind.MovesInSecondsWithIncrement
        );
        assert.is(tags?.TimeControl?.items[0].moves, 40);
        assert.is(tags?.TimeControl?.items[0].seconds, 6000);
        assert.is(tags?.TimeControl?.items[0].increment, 30);
        assert.is(tags?.TimeControl?.items[0].value, '40/6000+30');
        assert.is(tags?.TimeControl?.items[1].seconds, 3000);
        assert.is(tags?.TimeControl?.items[1].increment, 30);
        assert.is(tags?.TimeControl?.items[1].value, '3000+30');
        assert.is(tags?.TimeControl?.value, '40/6000+30:3000+30');
    }
);
timeControlTags('should raise an error for empty time control', () => {
    const { tags, messages } = parseTags('[TimeControl ""]');
    assert.ok(tags);
    assert.is(messages[0]?.message, 'Tag TimeControl has to have a value');
});
timeControlTags('should raise an error for wrong formats', () => {
    let { messages } = parseTags('[TimeControl "+"]');
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "TimeControl" not correct: "+"');

    ({ messages } = parseTags('[TimeControl "400+"]'));
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "TimeControl" not correct: "400+"');

    ({ messages } = parseTags('[TimeControl "400*"]'));
    assert.is(messages.length, 1);
    assert.is(messages[0].message, 'Format of tag: "TimeControl" not correct: "400*"');
});
timeControlTags('should raise an error for all periods with some error in it', () => {
    const { messages } = parseTags('[TimeControl "400+:400*"]');
    assert.is(messages.length, 1);
    assert.is(
        messages[0].message,
        'Format of tag: "TimeControl" not correct: "400+:400*"'
    );
});
timeControlTags('should raise an error for unknown TimeControl', () => {
    const { messages } = parseTags('[TimeControl "60 minutes"]');
    assert.is(messages.length, 1);
    assert.is(
        messages[0].message,
        'Format of tag: "TimeControl" not correct: "60 minutes"'
    );
});
timeControlTags.run();

const clockContext = suite('When reading tags with clock context');
clockContext('should understand the normal Clock format, color White', () => {
    const { tags, messages } = parseTags('[Clock "W/0:45:56"]');
    assert.is(tags?.Clock, 'W/0:45:56');
    assert.is(messages.length, 0);
});
clockContext('should understand the normal Clock format, clock stopped', () => {
    const { tags, messages } = parseTags('[Clock "N/0:45:56"]');
    assert.is(tags?.Clock, 'N/0:45:56');
    assert.is(messages.length, 0);
});
clockContext('should understand the normal WhiteClock format', () => {
    const { tags, messages } = parseTags('[WhiteClock "1:25:50"]');
    assert.is(tags?.WhiteClock, '1:25:50');
    assert.is(messages.length, 0);
});
clockContext('should understand the normal BlackClock format', () => {
    const { tags, messages } = parseTags('[BlackClock "0:05:15"]');
    assert.is(tags?.BlackClock, '0:05:15');
    assert.is(messages.length, 0);
});
clockContext.run();

const readingStrangeFormats = suite('When reading strange formats');
readingStrangeFormats('should understand even tags with special characters', () => {
    const { tags } = parseTags('[Event "Let\'s Play!"]');
    assert.ok(tags);
});
readingStrangeFormats(
    'should understand games with doublequotes inside strings when escaped (#309)',
    () => {
        const { tags } = parseTags(
            '[Event "Bg7 in the Sicilian: 2.Nf3 d6 3.Bc4 - The \\"Closed\\" Dragon"]'
        );
        assert.ok(tags);
    }
);
readingStrangeFormats(
    'should understand all tags even with strange characters (#349)',
    () => {
        const { tags } = parseTags(
            '[Event ""]\n' +
                '[White "зада~~а 1"]\n' +
                '[Black ""]\n' +
                '[Site ""]\n' +
                '[Round ""]\n' +
                '[Annotator ""]\n' +
                '[Result "*"]\n' +
                '[Date "2020.07.12"]\n' +
                '[PlyCount "3"]\n' +
                '[Setup "1"]\n' +
                '[FEN "4r1k1/1q3ppp/p7/8/Q3r3/8/P4PPP/R3R1K1 w - - 0 1"]'
        );
        assert.ok(tags);
    }
);
readingStrangeFormats('should handle BOM on the beginning of games', () => {
    const { tags } = parseTags(
        '\uFEFF[Event ""]\n' +
            '[Setup "1"]\n' +
            '[FEN "4r1k1/1q3ppp/p7/8/Q3r3/8/P4PPP/R3R1K1 w - - 0 1"]\n'
    );
    assert.ok(tags);
});
readingStrangeFormats.run();

const readingCustomTags = suite('When reading custom tags');
readingCustomTags('should understand custom tags', () => {
    const res = parseTags('[CustomFakeTag "Value"]');
    console.log(res);
    assert.is(res.tags?.CustomFakeTag, 'Value');
});
readingCustomTags.run();
