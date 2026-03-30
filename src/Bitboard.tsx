import React, { useState } from "react";

type BitboardProps = {
  children: string;
  showBits?: boolean;
  title?: string;
};

const parse = (input: string) => {
  const board = [];
  for (const char of input) {
    if (char == ".") {
      board.push(false);
    } else if (char == "X") {
      board.push(true);
    }
  }

  if (board.length != 64) {
    throw Error("Invalid bitboard.");
  }

  return board;
};

export const Bitboard = (props: BitboardProps) => {
  const board = parse(props.children);

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const renderCell = (index: number, content: string | number) => {
    const isActive = index === hovered || index == selected;

    return (
      <span
        style={{
          cursor: "pointer",
          display: "inline-block",
          borderRadius: "4px",
          backgroundColor: isActive ? "yellow" : "transparent",
          fontWeight: isActive ? "bold" : "normal",
          color: isActive ? "black" : "inherit", // Bright blue
          transform: isActive ? "scale(2)" : undefined,
        }}
        onMouseOver={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => setSelected(index === selected ? null : index)}
      >
        {content}
      </span>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        columnGap: "1em",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {props.title && (
          <code>
            <pre>{props.title}</pre>
          </code>
        )}

        <code>
          <pre>
            {board.map((value, index) => (
              <React.Fragment key={`square-${index}`}>
                {index % 8 === 0 && `${8 - index / 8}:`}{" "}
                {renderCell(index, value ? "X" : "·")}
                {index % 8 === 7 && "\n"}
              </React.Fragment>
            ))}

            {"   a b c d e f g h"}
          </pre>
        </code>
      </div>

      {props.showBits && (
        <code>
          <pre>
            {board.toReversed().map((value, reversedIndex) => {
              const originalIndex = 64 - reversedIndex - 1;

              return (
                <React.Fragment key={`bit-${originalIndex}`}>
                  {renderCell(originalIndex, value ? 1 : 0)}
                  {originalIndex % 8 === 0 && " "}
                </React.Fragment>
              );
            })}
          </pre>
        </code>
      )}
    </div>
  );
};
