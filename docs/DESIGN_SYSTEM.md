# WPP CRM Design System

The application theme is centralized in `src/app/globals.css`. New records created by users are rendered by the existing themed components and automatically inherit this system.

## Rules for future UI work

- Use the existing Tailwind color families instead of hardcoded hex values.
- Use `indigo` for primary actions and selected states.
- Use `amber` for premium highlights and warnings.
- Use `emerald` or `green` for success states.
- Use `red` for destructive and error states.
- Use `blue`, `cyan`, or `teal` for informational states.
- Use `slate` for surfaces, borders, and text.
- Use `purple`, `rose`, or `pink` only for brand-category accents; they are intentionally mapped to the WPP mauve palette.
- Do not add component-level hardcoded colors unless a third-party visualization requires them.

The dark studio sidebar, layered CRM canvas, card depth, form controls, status colors and button treatments are all managed globally so new pages remain visually consistent.
