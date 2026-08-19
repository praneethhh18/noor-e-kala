'use client';

import type { Personalise } from '@/lib/personalise';

const STYLE_FONT: Record<Personalise['style'], string> = {
  engraved: '"Fraunces", serif',
  script: '"Caveat", cursive',
  letters: '"Fraunces", serif',
};

export type Personalisation = { text: string; colour: string };

/**
 * Shows the buyer their own wording before they order.
 *
 * The first version drew the text straight onto the product photo, which failed
 * badly: those photos already carry somebody else's name, so you saw "Meera"
 * sitting on top of "Hafsa", and on the couple letters the new text was
 * illegible over the existing "S&M". So the wording now gets its own panel
 * beside the photo — honest about being a preview of the lettering rather than
 * a fake composite of the finished piece.
 *
 * If a piece has a clean, unlettered photo set as `previewImage`, the text is
 * laid over that instead, which does work.
 */
export function PersonalisePanel({
  image,
  config,
  value,
  onChange,
}: {
  image: string;
  config: Personalise;
  value: Personalisation;
  onChange: (next: Personalisation) => void;
}) {
  const shown = value.text || config.placeholder;
  const isPlaceholder = !value.text;
  const finish = config.colours.find((colour) => colour.value === value.colour);
  const overlay = config.previewImage;

  return (
    <div className="pz">
      <div className={`pz-stage${overlay ? ' pz-stage-overlay' : ''}`}>
        {overlay ? (
          <div className="pz-overlay-wrap">
            <img src={overlay} alt="" />
            <span
              className={`pz-word pz-${config.style}${isPlaceholder ? ' pz-ghost' : ''}`}
              style={{
                left: `${config.position?.x ?? 50}%`,
                top: `${config.position?.y ?? 50}%`,
                color: value.colour,
                fontFamily: STYLE_FONT[config.style],
              }}
            >
              {shown}
            </span>
          </div>
        ) : (
          <>
            <figure className="pz-ref">
              <img src={image} alt="" />
              <figcaption>The piece</figcaption>
            </figure>
            <figure className="pz-card">
              <div className="pz-card-face">
                <span
                  className={`pz-word pz-${config.style}${isPlaceholder ? ' pz-ghost' : ''}`}
                  style={{ color: value.colour, fontFamily: STYLE_FONT[config.style] }}
                >
                  {shown}
                </span>
              </div>
              <figcaption>{isPlaceholder ? 'Your wording appears here' : `Your wording · ${finish?.name}`}</figcaption>
            </figure>
          </>
        )}
      </div>

      <div className="pz-controls">
        <label className="pz-field">
          <span>
            {config.label}
            <em>
              {value.text.length}/{config.max}
            </em>
          </span>
          <input
            type="text"
            maxLength={config.max}
            placeholder={config.placeholder}
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
          />
        </label>

        <div className="pz-colours">
          <span>Finish</span>
          <div>
            {config.colours.map((colour) => (
              <button
                key={colour.value}
                type="button"
                className={`pz-swatch${value.colour === colour.value ? ' on' : ''}`}
                style={{ background: colour.value }}
                aria-label={colour.name}
                aria-pressed={value.colour === colour.value}
                title={colour.name}
                onClick={() => onChange({ ...value, colour: colour.value })}
              />
            ))}
            <em>{finish?.name}</em>
          </div>
        </div>

        {config.hint ? <p className="pz-hint">{config.hint}</p> : null}
        <p className="pz-note">
          This shows your wording and finish — the photo alongside is a previous piece. Exact placement and flourishes
          are mine to judge, so it always looks its best.
        </p>
      </div>
    </div>
  );
}
