import { Code, Deck, Fragment, Slide, Stack } from "@revealjs/react";
import RevealHighlight from "reveal.js/plugin/highlight";
import "reveal.js/plugin/highlight/monokai.css";
import "reveal.js/reveal.css";
import "reveal.js/theme/night.css";
import { Bitboard } from "./Bitboard";
import "./Presentation.css";
import title from "./assets/title.png";

export const Presentation = () => {
  return (
    <Deck
      plugins={[RevealHighlight]}
      config={{
        navigationMode: "linear",
        width: 1400,
        height: 800,
        hash: true,
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
        <h3>Agenda</h3>
        <ul>
          <Fragment>
            <li>Part 1: Motivation</li>
          </Fragment>
          <Fragment>
            <li>Part 2: Fundamental Chess Engine Data Structures</li>
          </Fragment>
          <Fragment>
            <li>Part 3: Intro to Move Generation </li>
          </Fragment>
          <Fragment>
            <li>Part 4: Speeding Up Bishop, Rook, and Queen Move Generation</li>
          </Fragment>
        </ul>
      </Slide>

      <Slide>
        <h2>Part 1</h2>
        <h3>Motivation</h3>
      </Slide>

      <Slide>
        <h2>Motivation</h2>

        <p>
          This presentation is based on{" "}
          <a href="https://follychess.com">FollyChess</a>, <br />a C++ chess
          engine I've been writing.
        </p>

        <p></p>
      </Slide>

      <Slide>
        <h2>Motivation</h2>

        <Fragment>
          <p>There is no shortage of chess engines, so why write one?</p>
        </Fragment>

        <Fragment>
          <p>It's a great learning opportunity!</p>
        </Fragment>
      </Slide>

      <Slide>
        <h2>Learning Opportunities</h2>
        <h3>Performance</h3>
        <p>
          Using branchless algorithms, benchmarking, profiling, and advanced C++
          features such as <code>consteval</code> and templates.
        </p>
      </Slide>

      <Slide>
        <h2>Learning Opportunities</h2>
        <h3>Search</h3>
        <p>
          Applying Alpha-Beta pruning, iterative deepening, move ordering, and
          transposition tables to manage a{" "}
          <a href="https://en.wikipedia.org/wiki/Branching_factor">branching</a>{" "}
          factor of ~35.
        </p>
      </Slide>

      <Slide>
        <h2>Learning Opportunities</h2>
        <h3>Complexity Management</h3>
        <p>
          Maintaining acceptable abstractions without compromising performance.
        </p>
      </Slide>

      <Slide>
        <h2>Learning Opportunities</h2>
        <h3>Heuristic Modeling</h3>
        <p>
          Translating qualitative chess concepts (e.g., "king safety") into
          numerical features for the engine to evaluate.
        </p>
      </Slide>

      <Slide>
        <h2>Learning Opportunities</h2>
        <h3>Verification</h3>
        <p>
          Validating search logic improvements through simulations rather than
          unit tests.
        </p>
      </Slide>

      <Slide>
        <h2>Scope of This Talk</h2>
        <ul>
          <Fragment>
            <li>
              There is <em>a lot</em> we can cover.
            </li>
          </Fragment>
          <Fragment>
            <li>This talk focuses on a narrow sliver.</li>
          </Fragment>
          <Fragment>
            <li>
              We'll discuss efficient move generation for bishops, rooks, and
              queens.
            </li>
          </Fragment>
          <Fragment>
            <li>
              Before we begin, we'll need to introduce some core concepts...
            </li>
          </Fragment>
        </ul>
      </Slide>

      <Slide>
        <h2>Part 2</h2>
        <h3>Fundamental Chess Engine Data Structures</h3>
      </Slide>

      <Slide>
        <h3>Terminology</h3>
        <dl>
          <Fragment>
            <dt>Board</dt>
            <dd>The 8 x 8 grid</dd>
          </Fragment>

          <Fragment>
            <dt>File</dt>
            <dd>Columns on the board, labeled A-H</dd>
          </Fragment>

          <Fragment>
            <dt>Rank</dt>
            <dd>Rows on the board, labeled 1-8</dd>
          </Fragment>

          <Fragment>
            <dt>Square</dt>
            <dd>
              An index (0-63) representing an intersection of Rank and File
            </dd>
          </Fragment>

          <Fragment>
            <dt>Bitboard</dt>
            <dd>A 64 bit integer representing piece presence</dd>
          </Fragment>
        </dl>
      </Slide>

      <Slide>
        <h3>Square</h3>

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
          <Code language="cpp" lineNumbers="1-11|12-32">
            {`// Represents an 8x8 chess board.
//
//   8:   0   1   2   3   4   5   6   7
//   7:   8   9  10  11  12  13  14  15
//   6:  16  17  18  19  20  21  22  23
//   5:  24  25  26  27  28  29  30  31
//   4:  32  33  34  35  36  37  38  39
//   3:  40  41  42  43  44  45  46  47
//   2:  48  49  50  51  52  53  54  55
//   1:  56  57  58  59  60  61  62  63
//       a   b   c   d   e   f   g   h
class Bitboard {
 public:
  constexpr explicit Bitboard(Square square) : data_(1ULL << square) {}

  [[nodiscard]] constexpr bool Get(Square square) const {
    return data_ & 1ULL << square;
  }

  constexpr void Set(Square square) {
    data_ |= 1ULL << square;
  }

  constexpr void Clear(Square square) {
    data_ &= ~(1ULL << square);
  }

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

        <Slide>
          <h3>Bitboard</h3>
          <Bitboard showBits>{`8: . . . . . . . .
7: . . . X . . . .
6: . . . . . . . .
5: . X . . X . X .
4: . . . . . . . .
3: . . . . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
        </Slide>
      </Stack>

      <Slide>
        <h3>Piece & Side</h3>

        <Code language="cpp" lineNumbers="1-9|11|13-17|19|21-34">
          {`enum Piece : std::uint8_t {
  kPawn,
  kKnight,
  kBishop,
  kRook,
  kQueen,
  kKing,
  kEmptyPiece,
};

constexpr std::size_t kNumPieces = 6;

enum Side : std::uint8_t {
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
          <p>Getting pieces</p>
          <Code
            language="cpp"
            lineNumbers="1-12|14-26|28-40|42-54|56-68|70-82|84-96|98-110|112-124|126-138"
          >{`Position position = MakePosition(
    "8: r n b q k b n r"
    "7: p p p p p p p p"
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: P P P P P P P P"
    "1: R N B Q K B N R"
    "   a b c d e f g h"
    //
    "   w KQkq - 0 1");
                   
// Get all pawns:                                 
EXPECT_THAT(
  position.GetPieces(kPawn),
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

// Get all bishops:
EXPECT_THAT(
  position.GetPieces(kBishop),
  EqualsBitboard(
    "8: . . X . . X . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: . . X . . X . ."
    "   a b c d e f g h"));

// Get all knights:
EXPECT_THAT(
  position.GetPieces(kKnight),
  EqualsBitboard(
    "8: . X . . . . X ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: . X . . . . X ."
    "   a b c d e f g h"));

// Get all rooks:
EXPECT_THAT(
  position.GetPieces(kRook),
  EqualsBitboard(
    "8: X . . . . . . X"
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: X . . . . . . X"
    "   a b c d e f g h"));

// Get all queens:
EXPECT_THAT(
  position.GetPieces(kQueen),
  EqualsBitboard(
    "8: . . . X . . . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: . . . X . . . ."
    "   a b c d e f g h"));

// Get all kings:
EXPECT_THAT(
  position.GetPieces(kKing),
  EqualsBitboard(
    "8: . . . . X . . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: . . . . X . . ."
    "   a b c d e f g h"));

// Get all white pieces:
EXPECT_THAT(
  position.GetPieces(kWhite),
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

// Get all black pieces:
EXPECT_THAT(
  position.GetPieces(kBlack),
  EqualsBitboard(
    "8: X X X X X X X X"
    "7: X X X X X X X X"
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . . . . . ."
    "1: . . . . . . . ."
    "   a b c d e f g h"));

// Get all white pawns:
EXPECT_THAT(
  position.GetPieces(kWhite, kPawn),
  EqualsBitboard(
    "8: . . . . . . . ."
    "7: . . . . . . . ."
    "6: . . . . . . . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: X X X X X X X X"
    "1: . . . . . . . ."
    "   a b c d e f g h"));`}</Code>
        </Slide>

        <Slide>
          <h3>Position</h3>
          <p>GetPieces() implementation</p>

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

          <Code language="cpp" lineNumbers="2-11|11|13-22">{` 
EXPECT_THAT(
  MakeBitboard(
    "8: . . . . . . . ."
    "7: . . . X . . . ."
    "6: . . . . . . . ."
    "5: . X . . X . . X"
    "4: . . . . . . . ."
    "3: . . . . . . . ."
    "2: . . . X . . . ."
    "1: . . . . . . . ."
    "   a b c d e f g h").Shift<kNorthWest>(),

  EqualsBitboard(
    "8: . . . . X . . ."
    "7: . . . . . . . ."
    "6: . . X . . X . ."
    "5: . . . . . . . ."
    "4: . . . . . . . ."
    "3: . . . . X . . ."
    "2: . . . . . . . ."
    "1: . . . . . . . ."
    "   a b c d e f g h"));    
    `}</Code>
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
          <Code language="c++" lineNumbers="|9">
            {`Position position = MakePosition(
  "8: r n b q k b n r"
  "7: p p p p p p p p"
  "6: . . . . . . . ."
  "5: . . . . . . . ."
  "4: . . . . . . . ."
  "3: . . . . . . . ."
  "2: P P P P P P P P"
  "1: R N B Q K B N R"
  "   a b c d e f g h"
  //
  "   w KQkq - 0 1");`}
          </Code>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <p>Starting position, B1 knight</p>
          <Code language="c++" lineNumbers>
            {`Bitboard pseudo_attacks = GetKnightAttacks(B1);
Bitboard valid_destinations = ~position.GetPieces(kWhite);
Bitboard moves = pseudo_attacks & valid_destinations;`}
          </Code>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Fragment>
              <Bitboard title="pseudo_attacks" highlight="a3,c3" highlightSecondary="b1">{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: X . X . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
            </Fragment>

            <Fragment>
              <Bitboard title="valid_destinations" highlight="a3,c3" >{`8: X X X X X X X X
7: X X X X X X X X
6: X X X X X X X X
5: X X X X X X X X
4: X X X X X X X X
3: X X X X X X X X
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
            </Fragment>

            <Fragment>
              <Bitboard title="moves" highlight="a3,c3" >{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: X . X . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
            </Fragment>
          </div>
        </Slide>
      </Stack>

      <Stack>
        <Slide>
          <h3>Knight Moves</h3>
          <p>Midgame position, F6 knight</p>
          <Code language="c++" lineNumbers="|4">
            {`Position position = MakePosition(
  "8: r . . . k . . r"
  "7: P p p p . p p p"
  "6: . b . . . n b N"
  "5: n P . . . . . ."
  "4: B B P . P . . ."
  "3: q . . . . N . ."
  "2: P p . P . . P P"
  "1: R . . Q . R K ."
  "   a b c d e f g h"
  //
  "   w kq - 0 1");`}
          </Code>
        </Slide>

        <Slide>
          <h3>Knight Moves</h3>
          <p>Midgame position, F1 knight</p>
          <Code language="c++" lineNumbers>
            {`Bitboard pseudo_attacks = GetKnightAttacks(F1);
Bitboard valid_destinations = ~position.GetPieces(kBlack);
Bitboard moves = pseudo_attacks & valid_destinations;`}
          </Code>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Fragment>
              <Bitboard title="pseudo_attacks">{`8: . . . . X . X .
7: . . . X . . . X
6: . . . . . . . .
5: . . . X . . . X
4: . . . . X . X .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
            </Fragment>

            <Fragment>
              <Bitboard title="valid_destinations">{`8: . X X X . X X .
7: X . . . X . . .
6: X . X X X . . X
5: . X X X X X X X
4: X X X X X X X X
3: . X X X X X X X
2: X . X X X X X X
1: X X X X X X X X
   a b c d e f g h
`}</Bitboard>
            </Fragment>

            <Fragment>
              <Bitboard title="moves">{`8: . . . . . . X .
7: . . . . . . . .
6: . . . . . . . .
5: . . . X . . . X
4: . . . . X . X .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
            </Fragment>
          </div>
        </Slide>
      </Stack>

      <Slide>
        <h3>Knight Moves</h3>
        <Code
          language="c++"
          lineNumbers="1-4|2|3|6-24|7|9|10|11|12|13|14|15|16|17|18|19|11-19|"
        >
          {`constexpr Bitboard GetKnightAttacks(Square square) {
  static std::array<Bitboard, kNumSquares> kKnightAttacks = GenerateKnightAttacks();
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

      <Stack>
        <Slide>
          <h3>Generating Rook Moves</h3>
          <p>D5 rook with no blockers</p>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Bitboard title="rook">{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . X . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>

            <Bitboard title="blockers">{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . . . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>

            <Bitboard title="pseudo-attacks">{`8: . . . X . . . .
7: . . . X . . . .
6: . . . X . . . .
5: X X X . X X X X
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . X . . . .
   a b c d e f g h
`}</Bitboard>
          </div>
        </Slide>

        <Slide>
          <h3>Generating Rook Moves</h3>
          <p>D5 rook with blockers</p>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Bitboard title="start">{`8: . . . . . . . .
7: . . . . . . . .
6: . . . . . . . .
5: . . . X . . . .
4: . . . . . . . .
3: . . . . . . . .
2: . . . . . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>

            <Bitboard title="blockers">{`8: . . . . . . . .
7: . . . X . . . .
6: . . . . . . . .
5: . X . . X . X .
4: . . . . . . . .
3: . . . . . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>

            <Bitboard title="pseudo-attacks">{`8: . . . . . . . .
7: . . . X . . . .
6: . . . X . . . .
5: . X X . X . . .
4: . . . X . . . .
3: . . . X . . . .
2: . . . X . . . .
1: . . . . . . . .
   a b c d e f g h
`}</Bitboard>
          </div>
        </Slide>
      </Stack>

      <Slide>
        <h2>Part 4</h2>
        <h3>Speeding Up Bishop, Rook, and Queen Move Generation</h3>
      </Slide>

      <Slide>
        <h3>Performance</h3>
        <p>On-the-fly move generation takes ~22-40 nanoseconds</p>
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
        <h3>Final Performance</h3>
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
    </Deck>
  );
};
