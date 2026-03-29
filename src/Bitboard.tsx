type BitboardProps = {
  children: string;
};

export const Bitboard = ({ children }: BitboardProps) => {
  const board = [];
  for (const char of children) {
    if (char == ".") {
      board.push(false);
    } else if (char == "X") {
      board.push(true);
    }
  }

  if (board.length != 64) {
    throw Error("Invalid bitboard.");
  }

  return (
    <code>
      <pre>
        {board.map((value, index) => {
          const parts = [];

          if (index % 8 === 0) {
            parts.push(8 - index / 8 + ":");
          }

          parts.push(" ");

          if (value) {
            parts.push("X");
          } else {
            parts.push(".");
          }

          if (index % 8 === 7) {
            parts.push("\n");
          }

          return parts.join("");
        })}
        {"   a b c d e f g h"}
      </pre>
    </code>
  );
};
