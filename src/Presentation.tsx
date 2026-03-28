import { Deck, Slide, Stack } from "@revealjs/react";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

export const Presentation = () => {
  return (
    <Deck>
      <Slide>
        <h1>From 20 Nanoseconds to One</h1>
        <h2>
          Optimizing Bishop, Rook, and Queen Move Generation in a Chess Engine
        </h2>
        <p>Aryan Naraghi</p>
      </Slide>

      <Stack>
        <Slide background="#111827">
          <h2>Second slide</h2>
        </Slide>
      </Stack>
    </Deck>
  );
};
