# Partner logos

`assets/js/config.js` → `PARTNER_LOGOS` drives the looping logo marquee in the
home page's "Working alongside" section.

| Partner             | File                                        | Tone   |
| ------------------- | ------------------------------------------- | ------ |
| Tata Steel          | `tata-steel-logo.png`                       | `ink`  |
| Tata Communications | `Tata Communications Logo White.svg`        | `ink`  |
| NTPC                | `NTPC.png`                                  | colour |

- `tone: "ink"` inks white/monochrome artwork so it stays visible on the light
  section. Drop it for full-colour logos (like NTPC).
- Transparent background, roughly 2.25rem (36px) tall artwork. The marquee
  scales logos down to fit the pills automatically.
- A missing file falls back to the partner's name as a text wordmark, so the
  strip never shows a broken image.
- To add or reorder partners, edit the `PARTNER_LOGOS` array — no markup
  changes needed.
