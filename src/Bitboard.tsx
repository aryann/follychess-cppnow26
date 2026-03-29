import React from "react";

type BitboardProps = {
  children: string;
  showBits?: boolean;
};

export const Bitboard = (props: BitboardProps) => {
  const board = [];
  for (const char of props.children) {
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
        {board.map((value, index) => (
          <React.Fragment key={`cell-${index}`}>
            {index % 8 === 0 && `${8 - index / 8}:`}{" "}
            <span>{value ? "X" : "."}</span>
            {index % 8 === 7 && "\n"}
          </React.Fragment>
        ))}

        {"   a b c d e f g h"}

        {props.showBits && "\n\n"}

        {props.showBits &&
          board.toReversed().map((value, index) => (
            <React.Fragment key={`cell-${index}`}>
              <span>{value ? 1 : 0}</span>
              {index % 8 === 7 && "\n"}
            </React.Fragment>
          ))}
      </pre>
    </code>
  );
};
