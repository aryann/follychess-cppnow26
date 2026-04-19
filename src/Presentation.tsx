import { Code, Deck, Fragment, Slide, Stack } from "@revealjs/react";
import RevealHighlight from "reveal.js/plugin/highlight";
import "reveal.js/plugin/highlight/monokai.css";
import "reveal.js/reveal.css";
import "reveal.js/theme/night.css";
import { Board } from "./Board";
import "./Presentation.css";
import title from "./assets/title.png";

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-evenly" }}>
    {children}
  </div>
);

export const Presentation = () => {
  return (
    <Deck
      plugins={[RevealHighlight]}
      config={{
        navigationMode: "linear",
        width: 1400,
        height: 800,
        hash: true,
        slideNumber: true,
      }}
    >
      <Slide backgroundImage={title} backgroundSize="contain"></Slide>

      <Slide>
        <h2>From 20 Nanoseconds to One</h2>
        <p>
          Optimizing Bishop, Rook, and Queen
          <br />
          Move Generation in a Chess Engine
        </p>
        <p>♗♖♕ &middot; ♝♜♛</p>
        <p>
          <a href="https://aryan.app">Aryan Naraghi</a>
        </p>
      </Slide>

      <Slide>
        <h2>Agenda</h2>
        <ul>
          <Fragment>
            <li>
              This talk is about <a href="https://follychess.com">FollyChess</a>
              , my C++ chess engine.
            </li>
          </Fragment>
          <Fragment>
            <li>
              Chess programming is a large domain. We can't cover all of it.
            </li>
          </Fragment>
          <Fragment>
            <li>
              Instead, we'll review a tiny sliver: efficient bishop, rook, and
              queen move generation.
            </li>
          </Fragment>
          <Fragment>
            <li>
              But first, we'll cover my motivation and chess engine basics.
            </li>
          </Fragment>
        </ul>
      </Slide>

      <Slide>
        <h2>Part 1</h2>
        <h3>Motivation</h3>
      </Slide>

      <Slide>
        <h2>Why a Chess Engine?</h2>

        <Fragment>
          <p>There is no shortage of chess engines, so why write one?</p>
        </Fragment>

        <Fragment>
          <p>It's a great learning opportunity!</p>
        </Fragment>
      </Slide>

      <Slide>
        <h3>Learning Opportunities</h3>
        <dl>
          <Fragment>
            <dt>Performance</dt>
            <dd>
              Avoiding branches, benchmarking, using <code>consteval</code> &
              templates, maintaining abstractions without compromising
              performance
            </dd>
          </Fragment>
          <Fragment>
            <dt>Search</dt>
            <dd>
              Alpha-beta pruning, iterative deepening, transposition tables
            </dd>
          </Fragment>

          <Fragment>
            <dt>Heuristic Modeling</dt>
            <dd>
              Translating qualitative chess concepts into numerical values
            </dd>
          </Fragment>
          <Fragment>
            <dt>Verification</dt>
            <dd>
              Validating improvements through simulations rather than unit tests
            </dd>
          </Fragment>
        </dl>
      </Slide>

      <Slide>
        <h2>Part 2</h2>
        <h3>Fundamental Data Structures</h3>
      </Slide>

      <Slide>
        <h3>Board</h3>

        <p>An 8 x 8 grid of squares</p>

        <Board>{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
      </Slide>

      <Slide>
        <h3>Rank & File</h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            gap: "1em",
          }}
        >
          <dl>
            <dt>Rank</dt>
            <dd>Rows, labeled 1-8</dd>

            <dt>File</dt>
            <dd>Columns, labeled A-H</dd>
          </dl>

          <Board>{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
        </div>
      </Slide>

      <Slide>
        <h3>Square</h3>

        <p>An index (0-63) representing the intersection of a Rank and File</p>

        <Code language="cpp" lineNumbers>{`enum Square : std::uint8_t {
 // clang-format off
 A8, B8, C8, D8, E8, F8, G8, H8,
 A7, B7, C7, D7, E7, F7, G7, H7,
 A6, B6, C6, D6, E6, F6, G6, H6,
 A5, B5, C5, D5, E5, F5, G5, H5,
 A4, B4, C4, D4, E4, F4, G4, H4,
 A3, B3, C3, D3, E3, F3, G3, H3,
 A2, B2, C2, D2, E2, F2, G2, H2,
 A1, B1, C1, D1, E1, F1, G1, H1,
 // clang-format on
};`}</Code>
      </Slide>

      <Stack>
        <Slide>
          <h3>Bitboard</h3>

          <p>An unsigned 64 bit integer representing piece presence</p>

          <Board showBits>{`8: . . . . . . . .
7: . . . X . . . .
6: . . . . . . . .
5: . X . . X . X .
4: . . . . . . . .
3: . . . . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
        </Slide>

        <Slide>
          <h3>Bitboard</h3>
          <Code language="cpp" lineNumbers="|16">
            {`class [[nodiscard]] Bitboard {
 public:
  constexpr explicit Bitboard(Square square) : data_(1ULL << square) {}

  [[nodiscard]] constexpr bool Get(Square square) const {
    return data_ & 1ULL << square;
  }

  constexpr void Set(Square square) { data_ |= 1ULL << square; }

  constexpr void Clear(Square square) { data_ &= ~(1ULL << square); }
 
  // ...

 private:
  std::uint64_t data_;
};
`}
          </Code>
        </Slide>

        <Slide>
          <h3>Bitboard</h3>
          <Code
            language="cpp"
            lineNumbers="1-12|14-15|17-18|20-21|"
          >{`Bitboard board(D5);

EXPECT_THAT(board,
            EqualsBitboard("8: . . . . . . . ."
                           "7: . . . . . . . ."
                           "6: . . . . . . . ."
                           "5: . . . X . . . ."
                           "4: . . . . . . . ."
                           "3: . . . . . . . ."
                           "2: . . . . . . . ."
                           "1: . . . . . . . ."
                           "   a b c d e f g h"));

EXPECT_THAT(board.Get(A1), IsFalse());
EXPECT_THAT(board.Get(D5), IsTrue());

board.Set(B1);
EXPECT_THAT(board.Get(B1), IsTrue());

board.Clear(B1);
EXPECT_THAT(board.Get(B1), IsFalse());
`}</Code>
        </Slide>
      </Stack>

      <Slide>
        <h3>Piece</h3>

        <Code language="cpp" lineNumbers>
          {`enum Piece : std::uint8_t {
  kPawn,
  kKnight,
  kBishop,
  kRook,
  kQueen,
  kKing,
  kEmptyPiece,
};

constexpr std::size_t kNumPieces = 6;`}
        </Code>
      </Slide>

      <Slide>
        <h3>Side</h3>

        <Code language="cpp" lineNumbers>
          {`enum Side : std::uint8_t {
  kWhite,
  kBlack,
  kEmptySide,
};

constexpr std::size_t kNumSides = 2;`}
        </Code>
      </Slide>

      <Stack>
        <Slide>
          <h3>Position</h3>
          <p>The state of the game at a specific moment:</p>
          <ul>
            <Fragment>
              <li>Arrangement of pieces on the board</li>
            </Fragment>
            <Fragment>
              <li>Castling rights</li>
            </Fragment>
            <Fragment>
              <li>Move counters</li>
            </Fragment>
            <Fragment>
              <li>En-Passant target square</li>
            </Fragment>
            <Fragment>
              <li>Side to move</li>
            </Fragment>
          </ul>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>Text representations</p>

          <Row>
            <Board title="Starting">{`8: r n b q k b n r
7: p p p p p p p p
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: P P P P P P P P
1: R N B Q K B N R
   a b c d e f g h
`}</Board>

            <Board title="Midgame">{`8: . . k r . b n r
7: p . p . p p p p
6: p . P . . q . .
5: . . . P . . . .
4: . . . P . . . .
3: P Q N . . . . .
2: . P . . . P P P
1: R . B . K . . R
   a b c d e f g h
`}</Board>

            <Board title="Endgame">{`8: . . . . . . . .
7: . . p . . . . .
6: . . . p . . . .
5: K P . . . . . r
4: . R . . . p P k
3: . . . . . . . .
2: . . . . P . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
          </Row>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>
            <code>GetPieces(Piece)</code>
          </p>

          <Code language="cpp" lineNumbers>{`EXPECT_THAT(
  starting_position.GetPieces(kPawn),

  EqualsBitboard(
    "8: . . . . . . . ."
    "7: X X X X X X X X"
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: X X X X X X X X"
    "1: . . . . . . . ."
    "   a b c d e f g h"));
    `}</Code>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>
            <code>GetPieces(Side)</code>
          </p>

          <Code language="cpp" lineNumbers>{`EXPECT_THAT(
  starting_position.GetPieces(kWhite),

  EqualsBitboard(
    "8: . . . . . . . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: X X X X X X X X"
    "1: X X X X X X X X"
    "   a b c d e f g h"));
    `}</Code>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>
            <code>GetPieces(Side, Piece)</code>
          </p>

          <Code language="cpp" lineNumbers>{`EXPECT_THAT(
  starting_position.GetPieces(kWhite, kPawn),
  
  EqualsBitboard(
    "8: . . . . . . . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: X X X X X X X X"
    "1: . . . . . . . ."
    "   a b c d e f g h"));
    `}</Code>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <Code language="cpp" lineNumbers="4-5|">
            {`class Position {
 // ...
 private:
  std::array<Bitboard, kNumPieces> pieces_;
  std::array<Bitboard, kNumSides> sides_;

  Side side_to_move_;
  CastlingRights castling_rights_;

  std::optional<Square> en_passant_target_;

  std::uint8_t half_moves_;
  int full_moves_;
};
          `}
          </Code>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>
            <code>GetPieces()</code>
          </p>

          <Code language="cpp" lineNumbers="1-3|5-8|9-11|13-16|">
            {`Bitboard Position::GetPieces(Side side) const {
  return sides_[side];
}

Bitboard Position::GetPieces(Piece type) const {
  return pieces_[type];
}

Bitboard Position::GetPieces() const {
  return sides_[kWhite] | sides_[kBlack];
}

Bitboard Position::GetPieces(Side side, Piece type) const {
  return sides_[side] & pieces_[type];
}`}
          </Code>
        </Slide>
      </Stack>

      <Slide>
        <h2>Part 3</h2>
        <h3>Intro to Move Generation</h3>
      </Slide>

      <Stack>
        <Slide>
          <h3>Shifting Bitboards</h3>

          <p>North example</p>

          <div className="r-stack">
            <Fragment className="fade-out" index={0}>
              <Board
                title="input"
                highlight="d7,b5,e5,h5,d2"
              >{`8: . . . . . . . .
7: . . . X . . . .
6: . . . . . . . .
5: . X . . X . . X
4: . . . . . . . .
3: . . . . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
            </Fragment>

            <Fragment className="current-visible" index={0}>
              <Board
                title="input.Shift<kNorth>()"
                highlight="d8,b6,e6,h6,d3"
              >{`8: . . . X . . . .
7: . . . . . . . .
6: . X . . X . . X
5: . . . . . . . .
4: . . . . . . . .
3: . . . X . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
            </Fragment>
          </div>
        </Slide>

        <Slide>
          <h3>Shifting Bitboards</h3>

          <p>Northwest example</p>

          <div className="r-stack">
            <Fragment className="fade-out" index={0}>
              <Board
                title="input"
                highlight="d7,b5,e5,d2"
                highlightSecondary="h5"
              >{`8: . . . . . . . .
7: . . . X . . . .
6: . . . . . . . .
5: . X . . X . . X
4: . . . . . . . .
3: . . . . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
            </Fragment>

            <Fragment className="current-visible" index={0}>
              <Board
                title="input.Shift<kNorthWest>()"
                highlight="e8,c6,f6,e3"
              >{`8: . . . . X . . .
7: . . . . . . . .
6: . . X . . X . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . X . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
            </Fragment>
          </div>
        </Slide>

        <Slide>
          <h3>Shifting Bitboards</h3>
          <Code language="cpp" lineNumbers="|4|6|8|10|12|14|16|18|">
            {`template <Direction Direction>
constexpr Bitboard Bitboard::Shift() const {

  if constexpr (Direction == kNorth)     { return *this >> 8; }

  if constexpr (Direction == kNorthEast) { return *this >> 7 & ~file::kA; }

  if constexpr (Direction == kEast)      { return *this << 1 & ~file::kA; }

  if constexpr (Direction == kSouthEast) { return *this << 9 & ~file::kA; }

  if constexpr (Direction == kSouth)     { return *this << 8; }

  if constexpr (Direction == kSouthWest) { return *this << 7 & ~file::kH; }

  if constexpr (Direction == kWest)      { return *this >> 1 & ~file::kH; }

  if constexpr (Direction == kNorthWest) { return *this >> 9 & ~file::kH; }

  return kEmptyBoard;
}
`}
          </Code>
        </Slide>
      </Stack>

      <Stack>
        <Slide>
          <h3>Knight Moves</h3>
          <p>Starting position, B1 knight</p>
          <Board highlight="a3,c3" highlightSecondary="b1">{`8: r n b q k b n r
7: p p p p p p p p
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: P P P P P P P P
1: R N B Q K B N R
   a b c d e f g h
`}</Board>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <p>Starting position, B1 knight</p>
          <Code language="c++" lineNumbers>
            {`Bitboard pseudo_attacks = GetKnightAttacks(B1);
Bitboard valid_destinations = ~position.GetPieces(kWhite);
Bitboard moves = pseudo_attacks & valid_destinations;`}
          </Code>

          <Row>
            <Board
              title="position"
              highlight="a3,c3"
              highlightSecondary="b1"
            >{`8: r n b q k b n r
7: p p p p p p p p
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: P P P P P P P P
1: R N B Q K B N R
   a b c d e f g h
`}</Board>

            <Board
              title="pseudo_attacks"
              highlight="a3,c3"
              highlightSecondary="b1"
            >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: X . X . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

            <Board
              title="valid_destinations"
              highlight="a3,c3"
              highlightSecondary="b1"
            >{`8: X X X X X X X X
7: X X X X X X X X
6: X X X X X X X X
5: X X X X X X X X
4: X X X X X X X X
3: X X X X X X X X
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

            <Board
              title="moves"
              highlight="a3,c3"
              highlightSecondary="b1"
            >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: X . X . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
          </Row>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <p>Midgame position, F6 knight</p>
          <Board
            highlight="d5,e4,g4,h5,g8"
            highlightSecondary="f6"
          >{`8: r . . . k . . r
7: P p p p . p p p
6: . b . . . n b N
5: n P . . . . . .
4: B B P . P . . .
3: q . . . . N . .
2: P p . P . . P P
1: R . . Q . R K .
   a b c d e f g h
`}</Board>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <p>Midgame position, F6 knight</p>
          <Code language="c++" lineNumbers>
            {`Bitboard pseudo_attacks = GetKnightAttacks(F6);
Bitboard valid_destinations = ~position.GetPieces(kBlack);
Bitboard moves = pseudo_attacks & valid_destinations;`}
          </Code>

          <Row>
            <Board
              title="position"
              highlight="d5,e4,g4,h5,g8"
              highlightSecondary="f6"
            >{`8: r . . . k . . r
7: P p p p . p p p
6: . b . . . n b N
5: n P . . . . . .
4: B B P . P . . .
3: q . . . . N . .
2: P p . P . . P P
1: R . . Q . R K .
   a b c d e f g h
`}</Board>

            <Board
              title="pseudo_attacks"
              highlight="d5,e4,g4,h5,g8"
              highlightSecondary="f6"
            >{`8: . . . . X . X .
7: . . . X . . . X
6: . . . . . . . .
5: . . . X . . . X
4: . . . . X . X .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

            <Board
              title="valid_destinations"
              highlight="d5,e4,g4,h5,g8"
              highlightSecondary="f6"
            >{`8: . X X X . X X .
7: X . . . X . . .
6: X . X X X . . X
5: . X X X X X X X
4: X X X X X X X X
3: . X X X X X X X
2: X . X X X X X X
1: X X X X X X X X
   a b c d e f g h
`}</Board>

            <Board
              title="moves"
              highlight="d5,e4,g4,h5,g8"
              highlightSecondary="f6"
            >{`8: . . . . . . X .
7: . . . . . . . .
6: . . . . . . . .
5: . . . X . . . X
4: . . . . X . X .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>
          </Row>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <Code
            language="c++"
            lineNumbers="1-4|2|3|6-24|7|9|10|11|12|13|14|15|16|17|18|19|11-19|"
          >
            {`constexpr Bitboard GetKnightAttacks(Square square) {
  static const std::array<Bitboard, kNumSquares> kKnightAttacks = GenerateKnightAttacks();
  return kKnightAttacks[square];
}
         
consteval std::array<Bitboard, kNumSquares> GenerateKnightAttacks() {
 std::array<Bitboard, kNumSquares> attacks;

 for (int square = kFirstSquare; square < kNumSquares; ++square) {
   Bitboard start(static_cast<Square>(square));
   attacks[square] = kEmptyBoard                                  //
                     | start.Shift<kNorth>().Shift<kNorthEast>()  //
                     | start.Shift<kEast>().Shift<kNorthEast>()   //
                     | start.Shift<kEast>().Shift<kSouthEast>()   //
                     | start.Shift<kSouth>().Shift<kSouthEast>()  //
                     | start.Shift<kSouth>().Shift<kSouthWest>()  //
                     | start.Shift<kWest>().Shift<kSouthWest>()   //
                     | start.Shift<kWest>().Shift<kNorthWest>()   //
                     | start.Shift<kNorth>().Shift<kNorthWest>();
 }
 return attacks;
}
`}
          </Code>
        </Slide>
      </Stack>

      <Slide>
        <h3>What About Checks?</h3>

        <p>Some moves place the king in check.</p>

        <p>These moves are filtered later.</p>
      </Slide>

      <Stack>
        <Slide>
          <h3>Sliding Piece Moves</h3>
          <p>
            Bishops, rooks, and queens are sliding pieces that move along rays.
          </p>

          <dl>
            <Fragment>
              <dt>Bishops</dt>
              <dd>4 rays along diagonals</dd>
            </Fragment>
            <Fragment>
              <dt>Rooks</dt>
              <dd>4 rays along ranks and files</dd>
            </Fragment>
            <Fragment>
              <dt>Queens</dt>
              <dd>8 rays along diagonals, ranks, and files</dd>
            </Fragment>
          </dl>
        </Slide>

        <Slide>
          <h3>Sliding Piece Moves</h3>
          <p>Sliding piece paths can be blocked by other pieces.</p>
          <p>This makes their move generation more complex.</p>
        </Slide>

        <Slide>
          <h3>Sliding Piece Moves</h3>
          <p>For each ray:</p>

          <ol>
            <Fragment>
              <li>Raycast until a blocker is hit. Include the blocker.</li>
            </Fragment>
            <Fragment>
              <li>Filter the last square:</li>
            </Fragment>
            <ul>
              <Fragment>
                <li>If empty, include as quiet move.</li>
              </Fragment>
              <Fragment>
                <li>If enemy, include as capturing move.</li>
              </Fragment>
              <Fragment>
                <li>If friendly, exclude.</li>
              </Fragment>
            </ul>
          </ol>
        </Slide>
      </Stack>

      <Stack>
        <Slide>
          <h3>Rook Moves</h3>
          <p>D5 rook with no blockers</p>

          <Code language="cpp" lineNumbers>{`
Bitboard occupied = position.GetPieces();
Bitboard pseudo_moves = GenerateRookMoves(D5, occupied);
Bitboard friendly = position.GetPieces(kWhite);
Bitboard moves = pseudo_moves & ~friendly;
          `}</Code>

          <div className="r-stack">
            <Fragment className="fade-out" index={0} style={{ width: "100%" }}>
              <Row>
                <Board
                  title="position"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . R . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="occupied"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . X . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="pseudo_moves"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: . . . X . . . .
7: . . . X . . . .
6: . . . X . . . .
5: X X X . X X X X
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . X . . . .
   a b c d e f g h
`}</Board>
              </Row>
            </Fragment>

            <Fragment
              className="current-visibile"
              index={0}
              style={{ width: "100%" }}
            >
              <Row>
                <Board
                  title="pseudo_moves"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: . . . X . . . .
7: . . . X . . . .
6: . . . X . . . .
5: X X X . X X X X
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . X . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="~friendly"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: X X X X X X X X
7: X X X X X X X X
6: X X X X X X X X
5: X X X . X X X X
4: X X X X X X X X
3: X X X X X X X X
2: X X X X X X X X
1: X X X X X X X X
   a b c d e f g h
`}</Board>

                <Board
                  title="moves"
                  highlightSecondary="d5"
                  highlight="d8,d7,d6,a5,b5,c5,e5,f5,g5,h5,d4,d3,d2,d1"
                >{`8: . . . X . . . .
7: . . . X . . . .
6: . . . X . . . .
5: X X X . X X X X
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . X . . . .
   a b c d e f g h
`}</Board>
              </Row>
            </Fragment>
          </div>
        </Slide>

        <Slide>
          <h3>Rook Moves</h3>
          <p>B4 rook with blockers</p>

          <Code language="cpp" lineNumbers>{`
Bitboard occupied = position.GetPieces();
Bitboard pseudo_moves = GenerateRookMoves(B4, occupied);
Bitboard friendly = position.GetPieces(kWhite);
Bitboard moves = pseudo_moves & ~friendly;
          `}</Code>

          <div className="r-stack">
            <Fragment className="fade-out" index={0} style={{ width: "100%" }}>
              <Row>
                <Board
                  title="position"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: . . . . . . . .
7: . . p . . . . .
6: . . . p . . . .
5: K P . . . . . r
4: . R . . . p . k
3: . . . . . . . .
2: . . . . P . P .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="occupied"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: . . . . . . . .
7: . . X . . . . .
6: . . . X . . . .
5: X X . . . . . X
4: . X . . . X . X
3: . . . . . . . .
2: . . . . X . X .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="pseudo_moves"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . X . . . . . .
4: X . X X X X . .
3: . X . . . . . .
2: . X . . . . . .
1: . X . . . . . .
   a b c d e f g h
`}</Board>
              </Row>
            </Fragment>

            <Fragment
              className="current-visibile"
              index={0}
              style={{ width: "100%" }}
            >
              <Row>
                <Board
                  title="pseudo_moves"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . X . . . . . .
4: X . X X X X . .
3: . X . . . . . .
2: . X . . . . . .
1: . X . . . . . .
   a b c d e f g h
`}</Board>

                <Board
                  title="~friendly"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: X X X X X X X X
7: X X X X X X X X
6: X X X X X X X X
5: . . X X X X X X
4: X . X X X X X X
3: X X X X X X X X
2: X X X X . X . X
1: X X X X X X X X
   a b c d e f g h
`}</Board>

                <Board
                  title="moves"
                  highlightSecondary="b4"
                  highlight="a4,c4,d4,e4,f4,b3,b2,b1"
                >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: X . X X X X . .
3: . X . . . . . .
2: . X . . . . . .
1: . X . . . . . .
   a b c d e f g h
`}</Board>
              </Row>
            </Fragment>
          </div>
        </Slide>
      </Stack>

      <Slide>
        <h3>Bishop Moves</h3>

        <p>Same as rooks, but on diagonals.</p>
      </Slide>

      <Slide>
        <h3>Queen Moves</h3>

        <p>A queen is just a bishop and rook combined.</p>

        <Code language="cpp">{`Bitboard pseudo_moves = GetBishopMoves(square) | GetRookMoves(square);
        `}</Code>
      </Slide>

      <Stack>
        <Slide>
          <h3>Sliding Piece Moves</h3>

          <Code
            language="cpp"
            lineNumbers
          >{`Bitboard GenerateBishopAttacks(Square from, Bitboard occupied) {
 return GenerateSlidingAttacks<
    kNorthEast, kNorthWest, kSouthEast, kSouthWest>(from, occupied);
} 
            
Bitboard GenerateRookAttacks(Square from, Bitboard occupied) {
 return GenerateSlidingAttacks<
    kNorth, kEast, kSouth, kWest>(from, occupied);
}

Bitboard GenerateQueenAttacks(Square from, Bitboard occupied) {
 return GenerateRookAttacks(from, occupied) | GenerateBishopAttacks(from, occupied);
}
`}</Code>
        </Slide>

        <Slide>
          <h3>Sliding Piece Move Code</h3>

          <Code
            language="cpp"
            lineNumbers="1-4|6-16|8|9|10|11|12|13|"
          >{`template <Direction... Directions>
Bitboard GenerateSlidingAttacks(Square from, Bitboard occupied) {
  return (GenerateRayAttacks<Directions>(from, occupied) | ...);
}

template <Direction Direction>
Bitboard GenerateSlidingAttacks(Square from, Bitboard occupied) {
  Bitboard attacks;
  Bitboard curr(from);
  while (curr) {
    curr = curr.Shift<Direction>();
    attacks |= curr;
    if (curr & occupied) { break; }
  }
  return attacks;
}
`}</Code>
        </Slide>
      </Stack>

      <Slide>
        <h2>Part 4</h2>
        <h3>
          Fast Bishop, Rook, and Queen
          <br /> Move Generation
        </h3>
      </Slide>

      <Slide>
        <h3>Performance</h3>
        <p>Takes ~22-40 nanoseconds per piece</p>

        <p>Too slow when searching millions of positions/second</p>
        <Code
          language="plaintext"
          lineNumbers="10-12"
        >{`Run on (10 X 24 MHz CPU s)
CPU Caches:
 L1 Data 64 KiB
 L1 Instruction 128 KiB
 L2 Unified 4096 KiB (x10)
Load Average: 9.88, 6.90, 5.88
---------------------------------------------------------------------------------------
Benchmark                                                 Time         CPU   Iterations
---------------------------------------------------------------------------------------
BM_GenerateAttacksOnTheFly<kBishop>                    22.2 ns     21.8 ns     33745348
BM_GenerateAttacksOnTheFly<kRook>                      25.2 ns     25.2 ns     28033977
BM_GenerateAttacksOnTheFly<kQueen>                     40.2 ns     40.2 ns     17496982
`}</Code>
      </Slide>

      <Slide>
        <h3>Lookup</h3>

        <p>Map every possible board state to an attack Bitboard.</p>

        <Code language="cpp" lineNumbers>
          {`template <Piece Piece>
Bitboard GetSlidingAttacks(Square square, Bitboard occupied) {
  static_assert(Piece == kBishop || Piece == kRook || Piece == kQueen);

  static const std::array<
    std::array<Bitboard, kNumOccupancies>, 
    kNumSquares> kSlidingAttacks = GenerateSlidingAttacksTable<Piece>();
  
  return kSlidingAttacks[square][occupied];
}`}
        </Code>
      </Slide>

      <Slide>
        <h3>Lookup Table Size</h3>

        <Fragment>
          <p>
            <code>num_squares * num_occupancies * sizeof(Bitboard)</code>
          </p>
        </Fragment>

        <Fragment>
          <p>
            <code>
              64 * ~2<sup>64</sup> * 8 bytes
            </code>
          </p>
        </Fragment>

        <Fragment>
          <p>
            <code>9,444,732,965,739,290,427,392 bytes</code>
          </p>
        </Fragment>

        <Fragment>
          <p>9.44 Zettabytes or ~10% total world storage</p>
        </Fragment>
      </Slide>

      <Slide>
        <h3>Reducing Lookup Table Size</h3>

        <Fragment>
          <p>
            For each sliding piece, only the occupancy of some squares matter.
          </p>
        </Fragment>

        <Fragment>
          <p>Let's examing rooks.</p>
        </Fragment>

        <Fragment>
          <p>The same concept applies to bishops and queens.</p>
        </Fragment>
      </Slide>

      <Stack>
        <Slide>
          <h3>Relevant Squares</h3>

          <p>
            A rook's movement is only affected by pieces on its own Rank and
            File, excluding edges
          </p>
          <Row>
            <Board
              title="D5 Relevant Squares"
              highlightSecondary="d5"
              highlight="d7,d6,d4,d3,d2,b5,c5,e5,f5,g5"
            >{`8: . . . . . . . .
7: . . . X . . . .
6: . . . X . . . .
5: . X X . X X X .
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Board>

            <Board
              title="H1 Relevant Squares"
              highlightSecondary="h1"
              highlight="h7,h6,h5,h4,h3,h2,b1,c1,d1,e1,f1,g1"
            >{`8: . . . . . . . .
7: . . . . . . . X
6: . . . . . . . X
5: . . . . . . . X
4: . . . . . . . X
3: . . . . . . . X
2: . . . . . . . X
1: . X X X X X X .
   a b c d e f g h
`}</Board>
          </Row>
        </Slide>

        <Slide>
          <h3>Relevant Squares</h3>

          <p>For each square, a rook has 10-12 relevant squares.</p>

          <p>Can we ignore the irrelevant squares?</p>
        </Slide>
      </Stack>

      <Stack>
        <Slide>
          <h3>Map</h3>

          <p>Same idea as before, but with a map instead of an array.</p>

          <Code language="cpp" lineNumbers>
            {`Bitboard GetRookAttacks(Square square, Bitboard occupied) {
  static const std::array<
    absl::flat_hash_map<Bitboard, Bitboard>,  // occupancy -> attacks
    kNumSquares> kRookAttacks = GenerateRookAttacksMap();

  Bitboard mask = GetRookRelevantSquares(square);
  occupied &= mask;

  return kRookAttacks[square].find(occupied)->second;
}`}
          </Code>
        </Slide>

        <Slide>
          <h3>Map Size</h3>

          <Fragment>
            <p>
              <code>
                num_squares * num_occupancies * map_overhead * sizeof(Bitboard)
              </code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>
                64 * ~2<sup>12</sup> * ~2 * 8 bytes
              </code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>~4,194,304 bytes</code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>~4 MB</code>
            </p>
          </Fragment>
        </Slide>

        <Slide>
          <h3>Map</h3>

          <Code
            language="plaintext"
            lineNumbers="13-21"
          >{`Run on (10 X 24 MHz CPU s)
CPU Caches:
 L1 Data 64 KiB
 L1 Instruction 128 KiB
 L2 Unified 4096 KiB (x10)
Load Average: 9.88, 6.90, 5.88
---------------------------------------------------------------------------------------
Benchmark                                                 Time         CPU   Iterations
---------------------------------------------------------------------------------------
BM_GenerateAttacksOnTheFly<kBishop>                    22.2 ns     21.8 ns     33745348
BM_GenerateAttacksOnTheFly<kRook>                      25.2 ns     25.2 ns     28033977
BM_GenerateAttacksOnTheFly<kQueen>                     40.2 ns     40.2 ns     17496982
BM_LookupAttacksFrom<absl::flat_hash_map, kBishop>     3.65 ns     3.65 ns    192545730
BM_LookupAttacksFrom<absl::flat_hash_map, kRook>       7.70 ns     7.70 ns     88321389
BM_LookupAttacksFrom<absl::flat_hash_map, kQueen>      33.4 ns     33.4 ns     20735826
BM_LookupAttacksFrom<std::map, kBishop>                26.7 ns     26.6 ns     25801220
BM_LookupAttacksFrom<std::map, kRook>                  59.0 ns     58.9 ns     11554015
BM_LookupAttacksFrom<std::map, kQueen>                  385 ns      385 ns      1702210
BM_LookupAttacksFrom<std::unordered_map, kBishop>      7.97 ns     7.97 ns     88671573
BM_LookupAttacksFrom<std::unordered_map, kRook>        10.5 ns     10.4 ns     66874082
BM_LookupAttacksFrom<std::unordered_map, kQueen>       59.4 ns     59.4 ns     11378537
`}</Code>
        </Slide>
      </Stack>

      <Stack>
        <Slide>
          <h3>Contiguous Bitboards</h3>

          <ul>
            <li>
              The D5 rook can be blocked 2<sup>10</sup> == 1024 unique ways
            </li>
            <li>Store the 1024 attack Bitboards contiguously</li>
            <li>
              Map each occupancy Bitboard to an index in the range{" "}
              <code>[0, 1024)</code>
            </li>
            <li>This way, you can just use an array, no hash map!</li>
          </ul>
        </Slide>

        <Slide>
          <h3>Contiguous Bitboards</h3>

          <p>But the occupancy Bitboards are 64-bit integers!</p>

          <p>Can we extract just the relevant bits?</p>
        </Slide>

        <Slide>
          <h3>Size</h3>

          <Fragment>
            <p>
              <code>num_squares * num_occupancies * sizeof(Bitboard)</code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>
                64 * 2<sup>12</sup> (worst-case) * 8 bytes
              </code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>2,097,152 bytes</code>
            </p>
          </Fragment>

          <Fragment>
            <p>
              <code>~2 MB</code>
            </p>
          </Fragment>
        </Slide>
      </Stack>

      <Slide>
        <h3>PEXT</h3>
      </Slide>

      <Slide>
        <h3>Performance: Microbenchmarks</h3>
        <Code
          language="plaintext"
          lineNumbers="22-24"
        >{`Run on (10 X 24 MHz CPU s)
CPU Caches:
 L1 Data 64 KiB
 L1 Instruction 128 KiB
 L2 Unified 4096 KiB (x10)
Load Average: 9.88, 6.90, 5.88
---------------------------------------------------------------------------------------
Benchmark                                                 Time         CPU   Iterations
---------------------------------------------------------------------------------------
BM_GenerateAttacksOnTheFly<kBishop>                    22.2 ns     21.8 ns     33745348
BM_GenerateAttacksOnTheFly<kRook>                      25.2 ns     25.2 ns     28033977
BM_GenerateAttacksOnTheFly<kQueen>                     40.2 ns     40.2 ns     17496982
BM_LookupAttacksFrom<absl::flat_hash_map, kBishop>     3.65 ns     3.65 ns    192545730
BM_LookupAttacksFrom<absl::flat_hash_map, kRook>       7.70 ns     7.70 ns     88321389
BM_LookupAttacksFrom<absl::flat_hash_map, kQueen>      33.4 ns     33.4 ns     20735826
BM_LookupAttacksFrom<std::map, kBishop>                26.7 ns     26.6 ns     25801220
BM_LookupAttacksFrom<std::map, kRook>                  59.0 ns     58.9 ns     11554015
BM_LookupAttacksFrom<std::map, kQueen>                  385 ns      385 ns      1702210
BM_LookupAttacksFrom<std::unordered_map, kBishop>      7.97 ns     7.97 ns     88671573
BM_LookupAttacksFrom<std::unordered_map, kRook>        10.5 ns     10.4 ns     66874082
BM_LookupAttacksFrom<std::unordered_map, kQueen>       59.4 ns     59.4 ns     11378537
BM_LookupAttacksFromMagicTables<kBishop>               1.19 ns     1.19 ns    600152610
BM_LookupAttacksFromMagicTables<kRook>                 1.25 ns     1.24 ns    572498794
BM_LookupAttacksFromMagicTables<kQueen>                2.03 ns     2.03 ns    362654841
`}</Code>
      </Slide>

      <Stack>
        <Slide>
          <h3>Performance: Depth 10 Best Move Search</h3>

          <Code language="plaintext" lineNumbers="1|2|3|4-14|16|17-27">
            {`
  $ follychess
  position fen r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1
  d
  8: r . . . k . . r
  7: P p p p . p p p
  6: . b . . . n b N
  5: n P . . . . . .
  4: B B P . P . . .
  3: q . . . . N . .
  2: P p . P . . P P
  1: R . . Q . R K .
    a b c d e f g h

    w kq - 0 1

  go depth 10
  info depth 1 score cp -249 nodes 782 nps 19822 pv c4c5 b2a1r b4a3 a1d1 a4d1 b6a7
  info depth 2 score cp -249 nodes 1327 nps 32765 pv c4c5 b2a1q b4a3 a1d1 a4d1 b6a7
  info depth 3 score cp -249 nodes 3481 nps 80588 pv c4c5 b2a1q b4a3 a1d1 a4d1 b6a7
  info depth 4 score cp -274 nodes 13995 nps 261883 pv c4c5 a3b4 c5b6 b2a1q d1a1 b4a4 b6c7 g6e4
  info depth 5 score cp -274 nodes 32034 nps 479990 pv c4c5 a3b4 c5b6 b2a1q d1a1 b4a4 b6c7 g6e4
  info depth 6 score cp -302 nodes 97776 nps 891383 pv c4c5 b6c5 b4c5 a3c5 d2d4 c5b6
  info depth 7 score cp -260 nodes 394057 nps 1737388 pv c4c5 b6c5 b4c5 a3c5 d2d4 b2a1q d1a1 c5a7
  info depth 8 score cp -260 nodes 848622 nps 2321683 pv c4c5 b6c5 b4c5 a3c5 d2d4 b2a1q d1a1 c5a7
  info depth 9 score cp -375 nodes 1458344 nps 2542025 pv c4c5 b6c5 b4c5 a3c5 d2d4 b2a1q d4c5 a1d1 a4d1 g7h6
  info depth 10 score cp -338 nodes 4698200 nps 2509260 pv c4c5 b6c5 b4c5 a3c5 g1h1 h8f8 d2d3 b2a1q d1a1 a5c4
  bestmove c4c5
    `}
          </Code>
        </Slide>

        <Slide>
          <h3>Performance: Depth 10 Best Move Search</h3>
          <p>Million nodes per second</p>

          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Lazy</th>
                <th>Magic</th>
                <th>Speedup</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Initial</td>
                <td>2.192</td>
                <td>2.612</td>
                <td>1.19</td>
              </tr>

              <tr>
                <td>
                  <a href="https://www.chessprogramming.org/Perft_Results#Position_3">
                    Perft 3
                  </a>
                </td>
                <td>2.948</td>
                <td>3.833</td>
                <td>1.30</td>
              </tr>

              <tr>
                <td>
                  <a href="https://www.chessprogramming.org/Perft_Results#Position_4">
                    Perft 4
                  </a>
                </td>
                <td>2.557</td>
                <td>2.808</td>
                <td>1.10</td>
              </tr>

              <tr>
                <td>
                  <a href="https://www.chessprogramming.org/Perft_Results#Position_5">
                    Perft 5
                  </a>
                </td>
                <td>2.169</td>
                <td>2.436</td>
                <td>1.12</td>
              </tr>

              <tr>
                <td>
                  <a href="https://www.chessprogramming.org/Perft_Results#Position_6">
                    Perft 6
                  </a>
                </td>
                <td>2.377</td>
                <td>2.525</td>
                <td>1.06</td>

              </tr>
            </tbody>
          </table>

        </Slide>
      </Stack>

      <Slide>
        <h3>Performance: Perft</h3>

        <p>Generating all positions to depth 5</p>

        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th><a href="https://github.com/aryann/follychess/blob/d1b20cb78c2e8c9dfe3f706af40c1a7870b596c9/benchmarks/moves_benchmark_latest.txt">Lazy</a></th>
              <th><a href="https://github.com/aryann/follychess/blob/47d82da09b75acadbf7ee716d09abccba18be096/benchmarks/moves_benchmark_latest.txt">Magic</a></th>
              <th>Speedup</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Initial</td>
              <td>233 ms</td>
              <td>195 ms</td>
              <td>1.20</td>
            </tr>

            <tr>
              <td>
                <a href="https://www.chessprogramming.org/Perft_Results#Position_2">
                  Perft 2
                </a>
              </td>
              <td>9,014 ms</td>
              <td>7,074 ms</td>
              <td>1.27</td>
            </tr>

            <tr>
              <td>
                <a href="https://www.chessprogramming.org/Perft_Results#Position_5">
                  Perft 5
                </a>
              </td>
              <td>4,536 ms</td>
              <td>3,426 ms</td>
              <td>1.32</td>
            </tr>
          </tbody>
        </table>
      </Slide>

      <Slide>
        <h2>Thank You!</h2>
      </Slide>
    </Deck>
  );
};
