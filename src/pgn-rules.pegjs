{
    var messages = [];

    function addMessage(json) {
        var o = Object.assign(json, location()); 
        messages.push(o); 
        return o;
    }

    function makeInteger(o) {
        return parseInt(o.join(""), 10);
    }

    function mi(o) {
        return o.join("").match(/\?/) ? o.join("") : makeInteger(o); 
    }

    function merge(array) {
        var ret = {}    
        array.forEach(function(json) {
            for (var key in json) {
                if (Array.isArray(json[key])) {
                    ret[key] = ret[key] ? ret[key].concat(json[key]) : json[key]
                } else {
                    ret[key] = ret[key] ? trimEnd(ret[key]) + " " + trimStart(json[key]) : json[key]
                }
            }
        })
        return ret
    }

    function trimStart(st) {
        if (typeof st !== "string") return st
        var r=/^\s+/
        return st.replace(r, '')
    }

    function trimEnd(st) {
        if (typeof st !== "string") return st
        var r=/\s+$/
        return st.replace(r, '')
    }
}

BOM "Byte Order Mark" = "\uFEFF"

games = BOM? whitespaceOptional games:(
    head:game 
    tail:(whitespaceOptional m:game { return m; })*
    {
        return [head].concat(tail) 
    }
)? {
  return games; 
}

game = BOM? tags:tags? gameComment:comments? moves:pgn
    {
        var mess = messages; 
        messages = [];
        return { tags, gameComment, moves, messages: mess }; 
    }

tags = BOM? whitespaceOptional members:(
      head:tag
      tail:(whitespaceOptional m:tag { return m; })*
      {
        var result = {};
        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });
        return result;
      }
    )? whitespaceOptional
    { 
        if (members === null) return {};
        members.messages = messages; 
        return members;
    }


tag = openBracket whitespaceOptional tag:tagKeyValue whitespaceOptional closeBracket { return tag; }

tagKeyValue = eventKey whitespaceOptional value:string { return { name: 'Event', value: value }; }
	/ siteKey whitespaceOptional value:string  { return { name: 'Site', value: value }; }
	/ dateKey whitespaceOptional value:dateString  { return { name: 'Date', value: value }; }
	/ roundKey whitespaceOptional value:string  { return { name: 'Round', value: value }; }
	/ whiteTitleKey whitespaceOptional value:string  { return { name: 'WhiteTitle', value: value }; }
	/ blackTitleKey whitespaceOptional value:string  { return { name: 'BlackTitle', value: value }; }
	/ whiteEloKey whitespaceOptional value:integerOrDashString  { return { name: 'WhiteElo', value: value }; }
	/ blackEloKey whitespaceOptional value:integerOrDashString  { return { name: 'BlackElo', value: value }; }
	/ whiteUSCFKey whitespaceOptional value:integerQuoted  { return { name: 'WhiteUSCF', value: value }; }
	/ blackUSCFKey whitespaceOptional value:integerQuoted  { return { name: 'BlackUSCF', value: value }; }
	/ whiteNAKey whitespaceOptional value:string  { return { name: 'WhiteNA', value: value }; }
	/ blackNAKey whitespaceOptional value:string  { return { name: 'BlackNA', value: value }; }
	/ whiteTypeKey whitespaceOptional value:string  { return { name: 'WhiteType', value: value }; }
	/ blackTypeKey whitespaceOptional value:string  { return { name: 'BlackType', value: value }; }
	/ whiteKey whitespaceOptional value:string  { return { name: 'White', value: value }; }
	/ blackKey whitespaceOptional value:string  { return { name: 'Black', value: value }; }
	/ resultKey whitespaceOptional value:resultQuoted  { return { name: 'Result', value: value }; }
	/ eventDateKey whitespaceOptional value:dateString  { return { name: 'EventDate', value: value }; }
	/ eventSponsorKey whitespaceOptional value:string  { return { name: 'EventSponsor', value: value }; }
	/ sectionKey whitespaceOptional value:string  { return { name: 'Section', value: value }; }
	/ stageKey whitespaceOptional value:string  { return { name: 'Stage', value: value }; }
	/ boardKey whitespaceOptional value:integerQuoted  { return { name: 'Board', value: value }; }
	/ openingKey whitespaceOptional value:string  { return { name: 'Opening', value: value }; }
	/ variationKey whitespaceOptional value:string  { return { name: 'Variation', value: value }; }
	/ subVariationKey whitespaceOptional value:string  { return { name: 'SubVariation', value: value }; }
	/ ecoKey whitespaceOptional value:string  { return { name: 'ECO', value: value }; }
	/ nicKey whitespaceOptional value:string  { return { name: 'NIC', value: value }; }
	/ timeKey whitespaceOptional value:timeString  { return { name: 'Time', value: value }; }
	/ utcTimeKey whitespaceOptional value:timeString  { return { name: 'UTCTime', value: value }; }
	/ utcDateKey whitespaceOptional value:dateString  { return { name: 'UTCDate', value: value }; }
	/ timeControlKey whitespaceOptional value:timeControlQuoted  { return { name: 'TimeControl', value: value }; }
	/ setUpKey whitespaceOptional value:string  { return { name: 'SetUp', value: value }; }
	/ fenKey whitespaceOptional value:string  { return { name: 'FEN', value: value }; }
	/ terminationKey whitespaceOptional value:string  { return { name: 'Termination', value: value }; }
	/ annotatorKey whitespaceOptional value:string  { return { name: 'Annotator', value: value }; }
	/ modeKey whitespaceOptional value:string  { return { name: 'Mode', value: value }; }
	/ plyCountKey whitespaceOptional value:integerQuoted  { return { name: 'PlyCount', value: value }; }
	/ variantKey whitespaceOptional value:string { return { name: 'Variant', value: value }; }
	/ whiteRatingDiffKey whitespaceOptional value:string { return { name: 'WhiteRatingDiff', value: value }; }
	/ blackRatingDiffKey whitespaceOptional value:string { return { name: 'BlackRatingDiff', value: value }; }
	/ whiteFideIdKey whitespaceOptional value:string { return { name: 'WhiteFideId', value: value }; }
	/ blackFideIdKey whitespaceOptional value:string { return { name: 'BlackFideId', value: value }; }
	/ whiteTeamKey whitespaceOptional value:string { return { name: 'WhiteTeam', value: value }; }
	/ blackTeamKey whitespaceOptional value:string { return { name: 'BlackTeam', value: value }; }
	/ clockKey whitespaceOptional value:colorClockTimeQuoted { return { name: 'Clock', value: value }; }
	/ whiteClockKey whitespaceOptional value:clockTimeQuoted { return { name: 'WhiteClock', value: value }; }
	/ blackClockKey whitespaceOptional value:clockTimeQuoted { return { name: 'BlackClock', value: value }; }
	/ & validatedKey a:anyKey whitespaceOptional value:string
        { 
            addMessage( {key: a, value: value, message: `Format of tag: "${a}" not correct: "${value}"`} );
	        return { name: a, value: value }; 
        }
	/ ! validatedKey a:anyKey whitespaceOptional value:string
	    { 
            addMessage( {key: a, value: value, message: `Tag: "${a}" not known: "${value}"`} );
	        return { name: a, value: value }; 
        }

validatedKey  = dateKey / whiteEloKey / blackEloKey / whiteUSCFKey / blackUSCFKey / resultKey / eventDateKey / boardKey /
        timeKey / utcTimeKey / utcDateKey / timeControlKey / plyCountKey / clockKey / whiteClockKey / blackClockKey

eventKey 				=  'Event' / 'event'
siteKey 				=  'Site' / 'site'
dateKey 				=  'Date' / 'date'
roundKey				=  'Round' / 'round'
whiteKey 				=  'White' / 'white'
blackKey 				=  'Black' / 'black'
resultKey 				=  'Result' / 'result'
whiteTitleKey           =  'WhiteTitle' / 'Whitetitle' / 'whitetitle' / 'whiteTitle'
blackTitleKey           =  'BlackTitle' / 'Blacktitle' / 'blacktitle' / 'blackTitle'
whiteEloKey             =  'WhiteELO' / 'WhiteElo' / 'Whiteelo' / 'whiteelo' / 'whiteElo'
blackEloKey             =  'BlackELO' / 'BlackElo' / 'Blackelo' / 'blackelo' / 'blackElo'
whiteUSCFKey            =  'WhiteUSCF' / 'WhiteUscf' / 'Whiteuscf' / 'whiteuscf' / 'whiteUscf'
blackUSCFKey            =  'BlackUSCF' / 'BlackUscf' / 'Blackuscf' / 'blackuscf' / 'blackUscf'
whiteNAKey              =  'WhiteNA' / 'WhiteNa' / 'Whitena' / 'whitena' / 'whiteNa' / 'whiteNA'
blackNAKey              =  'BlackNA' / 'BlackNa' / 'Blackna' / 'blackna' / 'blackNA' / 'blackNa'
whiteTypeKey            =  'WhiteType' / 'Whitetype' / 'whitetype' / 'whiteType'
blackTypeKey            =  'BlackType' / 'Blacktype' / 'blacktype' / 'blackType'
eventDateKey            =  'EventDate' / 'Eventdate' / 'eventdate' / 'eventDate'
eventSponsorKey         =  'EventSponsor' / 'Eventsponsor' / 'eventsponsor' / 'eventSponsor'
sectionKey              =  'Section' / 'section'
stageKey                =  'Stage' / 'stage'
boardKey                =  'Board' / 'board'
openingKey              =  'Opening' / 'opening'
variationKey            =  'Variation' / 'variation'
subVariationKey         =  'SubVariation' / 'Subvariation' / 'subvariation' / 'subVariation'
ecoKey                  =  'ECO' / 'Eco' / 'eco'
nicKey                  =  'NIC' / 'Nic' / 'nic'
timeKey                 =  'Time' / 'time'
utcTimeKey              =  'UTCTime' / 'UTCtime' / 'UtcTime' / 'Utctime' / 'utctime' / 'utcTime'
utcDateKey              =  'UTCDate' / 'UTCdate' / 'UtcDate' / 'Utcdate' / 'utcdate' / 'utcDate'
timeControlKey          =  'TimeControl' / 'Timecontrol' / 'timecontrol' / 'timeControl'
setUpKey                =  'SetUp' / 'Setup' / 'setup' / 'setUp'
fenKey                  =  'FEN' / 'Fen' / 'fen'
terminationKey          =  'Termination'  / 'termination'
annotatorKey             =  'Annotator'  / 'annotator'
modeKey                 =  'Mode' / 'mode'
plyCountKey             =  'PlyCount'  / 'Plycount' / 'plycount' / 'plyCount'
variantKey              =  'Variant' / 'variant'
whiteRatingDiffKey      =  'WhiteRatingDiff'
blackRatingDiffKey      =  'BlackRatingDiff'
whiteFideIdKey          =  'WhiteFideId'
blackFideIdKey          =  'BlackFideId'
whiteTeamKey            =  'WhiteTeam'
blackTeamKey            =  'BlackTeam'
clockKey                =  'Clock'
whiteClockKey           =  'WhiteClock'
blackClockKey           =  'BlackClock'
anyKey                  =  stringNoQuote


whitespaceOptional "whitespace" = [ \t\n\r]*
whitespaceRequired "whitespace" = [ \t\n\r]+
eol "end of line" = [\n\r]+

esc_quotation
  = '\\"' { return  '\"'; }

stringNoQuote
  = chars:[-a-zA-Z0-9_.]* { return chars.join(""); }

quotationMark
  = '"'

string
  = '"' _ stringContent:stringChar* _ '"' {  return stringContent.map(c => c.char || c).join('') }

stringChar
  = [^"\\\r\n]
  / Escape
    sequence:(
        "\\" { return {type: "char", char: "\\"}; }
      / '"' { return {type: "char", char: '"'}; }
    )
    { return sequence; }

_ "whitespace"
  = [ \t\n\r]*

Escape
  = "\\"

dateString = quotationMark year:([0-9\?] [0-9\?] [0-9\?] [0-9\?]) '.' month:([0-9\?] [0-9\?]) '.' day:([0-9\?] [0-9\?]) quotationMark
	{ 
        let val = "" + year.join("") + '.' + month.join("") + '.' + day.join("");
	    return { value: val, year: mi(year), month: mi(month), day: mi(day) }; 
    }

timeString = quotationMark hour:([0-9]+) ':' minute:([0-9]+) ':' second:([0-9]+) millis:millis? quotationMark
    { 
        let val = hour.join("") + ':' + minute.join("") + ':' + second.join(""); 
        let ms = 0;
        if (millis) {
            val = val + '.' + millis;
            addMessage({ message: `Unusual use of millis in time: ${val}` });
            ms = mi(millis);
        }
        return { value: val, hour: mi(hour), minute: mi(minute), second: mi(second), millis: ms }; 
    }

millis = '.' millis:([0-9]+) 
    { 
        return millis.join(""); 
    }

colorClockTimeQuoted = quotationMark value:colorClockTime quotationMark { return value; }
colorClockTime = c:clockColor '/' t:clockTime { return c + '/' + t; }
clockColor = 'B' / 'W' / 'N'

clockTimeQuoted = quotationMark value:clockTime quotationMark { return value; }
clockTime = value:clockValue1D { return value; }

timeControlQuoted = quotationMark res:timeControls quotationMark
    { 
        if (!res) { 
            addMessage({ message: "Tag TimeControl has to have a value" }); 
            return ""; 
        }
        return res; 
    }

timeControls = tcnqs:(
    head:timeControl
    tail:(':' m:timeControl { return m; })*
    { 
        let ret = [head].concat(tail); 
        ret.value = ret.map(ret => ret.value).join(':');
        return ret;
    }
)? { return tcnqs; }

timeControl = '?' { return { kind: 'unknown', value: '?' }; }
    / '-' { return { kind: 'unlimited', value: '-' }; }
    / moves:integer "/" seconds:integer '+' incr:integer { return { kind: 'movesInSecondsIncrement', moves: moves, seconds: seconds, increment: incr, value: '' + moves + '/' + seconds + '+' + incr }; }
    / moves:integer "/" seconds:integer { return { kind: 'movesInSeconds', moves: moves, seconds: seconds, value: '' + moves + '/' + seconds }; }
    / seconds:integer '+' incr:integer { return { kind: 'increment', seconds: seconds, increment: incr, value: '' + seconds + '+' + incr }; }
    / seconds:integer { return { kind: 'suddenDeath', seconds: seconds, value: '' + seconds }; }
    / '*' seconds:integer { return { kind: 'hourglass', seconds: seconds, value: '*' + seconds }; }

resultQuoted = quotationMark res:result quotationMark { return res; }
result =
	"1-0"
    / "1 - 0" { return "1-0" }
    / "0-1"
    / "0 - 1" { return "0-1" }
    / "1/2-1/2"
    / "1/2 - 1/2" { return "1/2-1/2" }
    / "1/2" { return "1/2-1/2" }
    / "*"

integerOrDashString =
 	v:integerQuoted { return v }
    / quotationMark '-' quotationMark { return 0 }
    / quotationMark quotationMark { 
        addMessage({ message: 'Use "-" for an unknown value'}); 
        return 0
    }

integerQuoted =
	quotationMark digits:[0-9]+ quotationMark { return makeInteger(digits); }

pgn
  = BOM? whitespaceOptional cm:comments? whitespaceOptional mn:moveNumber? whitespaceOptional hm:halfMove whitespaceOptional nag:nags? dr:drawOffer? whitespaceOptional ca:comments? whitespaceOptional vari:variation? all:pgn?
    { 
        var arr = (all ? all : []);
        var move = {}; 
        move.moveNumber = mn; 
        move.notation = hm;
        if (ca) { move.commentAfter = ca.comment };
        if (cm) { move.commentMove = cm.comment };
        if (dr) { move.drawOffer = true };
        move.variations = (vari ? vari : []); 
        move.nag = (nag ? nag : null);
        arr.unshift(move); 
        move.commentDiag = ca;
        return arr; 
    }
  / whitespaceOptional e:endGame whitespaceOptional { return e; }

drawOffer
  = openParenthesis '=' closeParenthesis

endGame
  = eg:result { return [eg]; }

comments
  = cf:comment cfl:(whitespaceOptional c:comment { return c })*
  { return merge([cf].concat(cfl)) }

comment
  = openBrace closeBrace { return; }
  / openBrace cm:innerComment closeBrace { return cm;}
  / cm:commentEndOfLine { return { comment: cm}; }

innerComment
    = whitespaceOptional openBracket "%csl" whitespaceRequired cf:colorFields? whitespaceOptional closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { return merge([{ colorFields: cf }].concat(tail[0])) }
    / whitespaceOptional openBracket "%cal" whitespaceRequired ca:colorArrows? whitespaceOptional closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { return merge([{ colorArrows: ca }].concat(tail[0])) }
    / whitespaceOptional openBracket "%" cc:clockCommand1D whitespaceRequired cv:clockValue1D whitespaceOptional closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { var ret = {}; ret[cc]= cv; return merge([ret].concat(tail[0])) }
    / whitespaceOptional openBracket "%" cc:clockCommand2D whitespaceRequired cv:clockValue2D whitespaceOptional closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { var ret = {}; ret[cc]= cv; return merge([ret].concat(tail[0])) }
    / whitespaceOptional openBracket "%eval" whitespaceRequired ev:stringNoQuote whitespaceOptional closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { var ret = {};  ret["eval"]= parseFloat(ev); return merge([ret].concat(tail[0])) }
    / whitespaceOptional openBracket "%" ac:stringNoQuote whitespaceRequired val:nbr+ closeBracket whitespaceOptional tail:(ic:innerComment { return ic })*
        { var ret = {}; ret[ac]= val.join(""); return merge([ret].concat(tail[0])) }
    / c:nonCommand+ tail:(whitespaceOptional ic:innerComment { return ic })*
        { 
            if (tail.length > 0) { 
                return merge([{ comment: trimEnd(c.join("")) }].concat(trimStart(tail[0]))) 
            }
            return { comment: c.join("").trim() } 
        }

nonCommand
  = !"[%" !"}" ch:. { return ch; }

nbr
  = !closeBracket ch:. { return ch; }

commentEndOfLine
  = semicolon cm:[^\n\r]* eol { return cm.join(""); }

colorFields
  = cf:colorField whitespaceOptional cfl:("," whitespaceOptional colorField)*
  { var arr = []; arr.push(cf); for (var i=0; i < cfl.length; i++) { arr.push(cfl[i][2])}; return arr; }

colorField
  = col:color f:field { return col + f; }

colorArrows
  = cf:colorArrow whitespaceOptional cfl:("," whitespaceOptional colorArrow)*
  { var arr = []; arr.push(cf); for (var i=0; i < cfl.length; i++) { arr.push(cfl[i][2])}; return arr; }

colorArrow
  = col:color ff:field ft:field { return col + ff + ft; }

color
  = "Y" { return "Y"; } // yellow
  / "G" { return "G"; } // green
  / "R" { return "R"; } // red
  / "B" { return "B"; } // blue
  / "O" { return "O"; } // orange
  / "C" { return "C"; } // magenta

field
  = col:column row:row { return col + row; }

openBrace = '{'

closeBrace = '}'

openBracket = '['

closeBracket = ']'

semicolon = ';'

clockCommand
  = "clk" { return "clk"; }
  / "egt" { return "egt"; }
  / "emt" { return "emt"; }
  / "mct" { return "mct"; }

clockCommand1D
  = "clk" { return "clk"; }
  / "egt" { return "egt"; }
  / "emt" { return "emt"; }

clockCommand2D
  = "mct" { return "mct"; }

clockValue1D
  = hm:hoursMinutes? s1:digit s2:digit? millis:millis?
  { let ret = s1;
    if (!hm) { addMessage({ message: `Hours and minutes missing`}) } else { ret = hm + ret }
    if (hm && ((hm.match(/:/g) || []).length == 2)) {
          if (hm.search(':') == 2) { addMessage({ message: `Only 1 digit for hours normally used`}) }
        }
    if (!s2) { addMessage({ message: `Only 2 digit for seconds normally used`}) } else { ret += s2 }
    if (millis) { addMessage({ message: `Unusual use of millis in clock value`}); ret += '.' + millis }
    return ret; }

clockValue2D
  = hm:hoursMinutes? s1:digit s2:digit?
  { let ret = s1;
    if (!hm) { addMessage({ message: `Hours and minutes missing`}) } else { ret = hm + ret }
    if (hm && ((hm.match(/:/g) || []).length == 2)) {
      if (hm.search(':') == 1) { addMessage({ message: `Only 2 digits for hours normally used`}) }
    }
    if (!s2) { addMessage({ message: `Only 2 digit for seconds normally used`}) } else { ret += s2 }
    return ret; }

hoursMinutes
  = hours:hoursClock minutes:minutesClock?
    { if (!minutes) {
          addMessage({ message: `No hours found`}); return hours }
      return hours + minutes; }

hoursClock
  = h1:digit h2:digit? ":"
  { let ret = h1;
    if (h2) {
      ret += h2 + ":";
    } else { ret += ":" }
    return ret; }

minutesClock
  = m1:digit m2:digit? ":"
  { let ret = m1;
    if (m2) { ret += m2 + ":"; }
    else { ret += ":"; addMessage({ message: `Only 2 digits for minutes normally used`}) }
    return ret; }

digit
  = d:[0-9] { return d; }

variation
  = openParenthesis vari:pgn closeParenthesis whitespaceOptional all:variation?
    { var arr = (all ? all : []); arr.unshift(vari); return arr; }

openParenthesis = '('

closeParenthesis = ')'

moveNumber
    = num:integer space* dot* space* dot* { return num; }

dot = "."

integer "integer"
    = digits:[0-9]+ { return makeInteger(digits); }

space
    = " "+ { return ''; }

halfMove
  = fig:figure? & checkdisc disc:discriminator str:strike?
    col:column row:row pr:promotion? ch:check? whitespaceOptional 'e.p.'?
    { var hm = {}; hm.fig = (fig ? fig : null); hm.disc =  (disc ? disc : null); hm.strike = (str ? str : null);
    hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.promotion = pr;
    hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
    return hm; }
  / fig:figure? cols:column rows:row str:strikeOrDash? col:column row:row pr:promotion? ch:check?
    { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str =='x' ? str : null); hm.col = col; hm.row = row;
    hm.notation = (fig && (fig!=='P') ? fig : "") + cols + rows + (str=='x' ? str : "-") + col  + row + (pr ? pr : "") + (ch ? ch : "");
    hm.check = (ch ? ch : null); hm.promotion = pr; return hm; }
  / fig:figure? str:strike? col:column row:row pr:promotion? ch:check?
    { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str ? str : null); hm.col = col;
    hm.row = row; hm.check = (ch ? ch : null); hm.promotion = pr;
    hm.notation = (fig ? fig : "") + (str ? str : "") + col  + row + (pr ? pr : "") + (ch ? ch : ""); return hm; }
  / 'O-O-O' ch:check? { var hm = {}; hm.notation = 'O-O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; }
  / 'O-O' ch:check? { var hm = {}; hm.notation = 'O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; }
  / fig:figure '@' col:column row:row
    { var hm = {}; hm.fig = fig; hm.drop = true; hm.col = col; hm.row = row; hm.notation = fig + '@' + col + row; return hm; }
  / "Z0"
     { var hm = {}; hm.notation = "Z0"; return hm; }

check
  = ch:(! '+-' '+') { return ch[1]; }
  / ch:(! '$$$' '#') { return ch[1]; }

promotion
  = '='? f:promFigure { return '=' + f; }

nags
  = nag:nag whitespaceOptional nags:nags? { var arr = (nags ? nags : []); arr.unshift(nag); return arr; }

nag
  = '$' num:integer { return '$' + num; }
  / '!!' { return '$3'; }
  / '??' { return '$4'; }
  / '!?' { return '$5'; }
  / '?!' { return '$6'; }
  / '!' { return '$1'; }
  / '?' { return '$2'; }
  / '‼' { return '$3'; }
  / '⁇' { return '$4'; }
  / '⁉' { return '$5'; }
  / '⁈' { return '$6'; }
  / '□' { return '$7'; }
  / '=' { return '$10'; }
  / '∞' { return '$13'; }
  / '⩲' { return '$14'; }
  / '⩱' { return '$15';}
  / '±' { return '$16';}
  / '∓' { return '$17';}
  / '+-' { return '$18';}
  / '-+' { return '$19';}
  / '⨀' { return '$22'; }
  / '⟳' { return '$32'; }
  / '→' { return '$36'; }
  / '↑' { return '$40'; }
  / '⇆' { return '$132'; }
  / 'D' { return '$220'; }

discriminator
  = column
  / row


checkdisc
  = discriminator strike? column row

figure
  = [RNBQKP]

promFigure
  = [RNBQ]

column
  = [a-h]

row
  = [1-8]

strike
  = 'x'

strikeOrDash
  = 'x'
  / '-'
