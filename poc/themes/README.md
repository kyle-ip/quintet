# Sketch theme

The PoC uses a single hand-drawn **Kraft Paper** card face (`sketch-paper`) on a white page background.

## Files

```
themes/
  Sketch.tsx           # Card face component
  styles/sketch.css    # Card face styles
  config.ts            # DEFAULT_THEME_ID = "sketch-paper"
  applyTheme.ts        # Sets data-sketch-theme on <html>
```

UI tokens live in `src/styles/sketch-ui.css`.

Legacy theme files (`MinimalFlat`, `LeteleClassic`, etc.) remain on disk but are not registered.

## Layout

Cards use a **5:7 aspect ratio** and scale with `--cell-size` (grid and pool).
