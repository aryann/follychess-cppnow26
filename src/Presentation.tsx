import { Code, Deck, Fragment, Slide } from "@revealjs/react";
import RevealHighlight from "reveal.js/plugin/highlight";
import "reveal.js/plugin/highlight/monokai.css";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";
import "./Presentation.css";

export const Presentation = () => {
  return (
    <Deck plugins={[RevealHighlight]} config={{ hash: true }}>
      <Slide>
        <h2>From 20 Nanoseconds to One</h2>
        <p>
          Optimizing Bishop, Rook, and Queen Move Generation in a Chess Engine
        </p>
        <p>Aryan Naraghi</p>
      </Slide>

      <Slide>
        <h2>Bitboard</h2>
        <Code language="cpp" lineNumbers="1-11|12-24">
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

  [[nodiscard]] constexpr bool Get(Square square) const { return data_ & 1ULL << square; }
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
        <h2>Position</h2>
        <p style={{ textAlign: "left" }}>
          The state of the game at a specific moment:
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
        </p>
      </Slide>

      <Slide>
        <h2>Position</h2>

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

constexpr std::size_t kNumSides = 2;

class Position {
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
        <h2>Shifting Bitboards</h2>
        <Code language="cpp" lineNumbers="|3|4|5|6|7|8|9|10|">
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
    </Deck>
  );
};
