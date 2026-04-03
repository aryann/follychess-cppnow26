import React, { useState } from "react";

type BitboardProps = {
  children: string;
  showBits?: boolean;
  title?: string;
};

const parse = (input: string): boolean[] => {
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
  const [board, setBoard] = useState<boolean[]>(parse(props.children));

  const [selected, setSelected] = useState<number | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

  const renderCell = (
    index: number,
    content: string | number,
    width?: number,
  ) => {
    const isActive =
      index === selected ||
      Math.floor(index / 8) === selectedRank ||
      index % 8 === selectedFile;

    return (
      <span
        style={{
          cursor: "pointer",
          display: "inline-block",
          backgroundColor: isActive ? "yellow" : "transparent",
          color: isActive ? "black" : "inherit",
          width: width ? `${width}px` : undefined,
          textAlign: "center",
        }}
        onMouseOver={() => setSelected(index)}
        onMouseLeave={() => setSelected(null)}
        onClick={() => setBoard(board.with(index, !board[index]))}
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
        userSelect: "none",
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
            {Array.from({ length: 8 }, (_, rank) => {
              const isActive = selectedRank == rank;

              return (
                <span
                  key={rank}
                  style={{
                    cursor: "pointer",
                    backgroundColor: isActive ? "yellow" : "transparent",
                    color: isActive ? "black" : "inherit",
                  }}
                >
                  <span
                    onMouseOver={() => setSelectedRank(rank)}
                    onMouseLeave={() => setSelectedRank(null)}
                  >
                    {8 - rank}:
                  </span>
                  {Array.from({ length: 8 }, (_, file) => {
                    const index = rank * 8 + file;

                    return (
                      <span key={index}>
                        {renderCell(index, board[index] ? "X" : ".", 24)}
                      </span>
                    );
                  })}
                  {"\n"}
                </span>
              );
            })}

            {"  "}
            {Array.from({ length: 8 }, (_, file) => {
              const isActive = selectedFile == file;

              return (
                <span
                  key={file}
                  style={{
                    cursor: "pointer",
                    display: "inline-block",
                    width: "24px",
                    textAlign: "center",
                    backgroundColor: isActive ? "yellow" : "transparent",
                    color: isActive ? "black" : "inherit",
                  }}
                  onMouseOver={() => setSelectedFile(file)}
                  onMouseLeave={() => setSelectedFile(null)}
                >
                  {String.fromCharCode("a".charCodeAt(0) + file)}
                </span>
              );
            })}
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
