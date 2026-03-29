import { Code, Deck, Slide, Stack } from "@revealjs/react";
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

      <Stack>
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
      </Stack>

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
