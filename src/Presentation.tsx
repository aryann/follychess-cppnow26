import { Deck, Slide, Stack } from "@revealjs/react";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

export const Presentation = () => {
  return (
    <Deck>
      <Slide>
        <h1>Hello World!</h1>
        <p>My first Reveal deck in React.</p>
      </Slide>

      <Stack>
        <Slide background="#111827">
          <h2>Second slide</h2>
        </Slide>
      </Stack>
    </Deck>
  );
};
