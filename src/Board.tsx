import React, { type ReactNode, useState } from "react";

const CodeBlock = (props: { children: ReactNode }) => (
  <code>
    <pre style={{ marginLeft: 0, marginRight: 0 }}>{props.children}</pre>
  </code>
);

type BoardProps = {
  children: string;
  showBits?: boolean;
  showLabels?: boolean;
  title?: string;
  highlight?: string;
  highlightSecondary?: string;
};

const parseHighlight = (input?: string): Set<number> => {
  if (!input) {
    return new Set();
  }

  const squares = input.split(",").map((s) => s.trim());
  const indices = new Set<number>();
  for (const square of squares) {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = parseInt(square[1]);
    const row = 8 - rank;
    indices.add(row * 8 + file);
  }
  return indices;
};

const parse = (input: string): string[] => {
  const result: string[] = [];
  for (const char of input) {
    if (char === "." || /[A-Za-z]/.test(char)) {
      result.push(char);
    }

    if (result.length === 64) {
      break;
    }
  }

  return result;
};

export const Board = (props: BoardProps) => {
  const board = parse(props.children);
  const highlighted = parseHighlight(props.highlight);
  const highlightedSecondary = parseHighlight(props.highlightSecondary);

  const [selected, setSelected] = useState<number | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

  const renderCell = (
    index: number,
    content: string | number,
    width?: number,
  ) => {
    const isHighlighted = highlighted.has(index);
    const isHighlightedSecondary = highlightedSecondary.has(index);
    const isActive =
      index === selected ||
      Math.floor(index / 8) === selectedRank ||
      index % 8 === selectedFile;

    let bg = "transparent";
    if (isHighlighted) {
      bg = "white";
    } else if (isHighlightedSecondary) {
      bg = "cyan";
    }
    if (isActive) {
      bg = "yellow";
    }

    const fg =
      isActive || isHighlighted || isHighlightedSecondary ? "black" : "inherit";

    return (
      <span
        style={{
          cursor: "pointer",
          display: "inline-block",
          backgroundColor: bg,
          color: fg,
          width: width ? `${width}px` : undefined,
          textAlign: "center",
        }}
        onMouseOver={() => setSelected(index)}
        onMouseLeave={() => setSelected(null)}
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
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {props.title && <CodeBlock>{props.title}</CodeBlock>}

        <CodeBlock>
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
                      {renderCell(index, board[index], 24)}
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
        </CodeBlock>
      </div>

      {props.showBits && (
        <CodeBlock>
          {board.toReversed().map((char, reversedIndex) => {
            const originalIndex = 64 - reversedIndex - 1;

            return (
              <React.Fragment key={`bit-${originalIndex}`}>
                {renderCell(
                  originalIndex,
                  char === "." ? 0 : props.showLabels ? char : 1,
                )}
                {originalIndex % 8 === 0 && originalIndex !== 0 && " "}
              </React.Fragment>
            );
          })}
        </CodeBlock>
      )}
    </div>
  );
};

type IntegerProps = {
  children: string;
};

export const Integer = (props: IntegerProps) => {
  const parse = (input: string): string[] => {
    const result: string[] = [];
    for (const char of input) {
      if (char !== " ") {
        result.push(char);
      }
    }

    return result;
  };

  const bits = parse(props.children);

  const [selected, setSelected] = useState<number | null>(null);

  const renderCell = (index: number, content: string) => {
    const isHighlighted = content != "0" && content != "_" && content != ".";
    const isActive = index === selected;

    let bg = "transparent";
    if (isHighlighted) {
      bg = "white";
    }
    if (isActive) {
      bg = "yellow";
    }

    const fg = isActive || isHighlighted ? "black" : "inherit";

    return (
      <span
        style={{
          cursor: "pointer",
          display: "inline-block",
          backgroundColor: bg,
          color: fg,
          textAlign: "center",
        }}
        onMouseOver={() => setSelected(index)}
        onMouseLeave={() => setSelected(null)}
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
      }}
    >
      <CodeBlock>
        {bits.map((char, index) => {
          return (
            <React.Fragment key={`bit-${index}`}>
              {renderCell(index, char)}
              {index % 8 === 7 && index !== 63 && " "}
            </React.Fragment>
          );
        })}
      </CodeBlock>
    </div>
  );
};
