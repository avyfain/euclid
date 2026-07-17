"use client";

import { useId, useState } from "react";
import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./data/book-2-figure-data";

const toneClass = (tone: SceneTone = "line") => `euclid-scene-${tone}`;

function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const point = (degrees: number) => {
    const radians = degrees * Math.PI / 180;
    return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
  };
  const a = point(start), b = point(end);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${Math.abs(end - start) > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

function Primitive({ primitive, stage }: { primitive: ScenePrimitive; stage: number }) {
  if ((primitive.stage ?? 0) > stage) return null;
  const className = toneClass("tone" in primitive ? primitive.tone : undefined);
  switch (primitive.kind) {
    case "line":
      return <line className={className} x1={primitive.x1} y1={primitive.y1} x2={primitive.x2} y2={primitive.y2} />;
    case "rect":
      return <rect className={className} x={primitive.x} y={primitive.y} width={primitive.width} height={primitive.height} />;
    case "circle":
      return <circle className={className} cx={primitive.cx} cy={primitive.cy} r={primitive.r} />;
    case "arc":
      return <path className={className} d={arcPath(primitive.cx, primitive.cy, primitive.r, primitive.start, primitive.end)} />;
    case "polygon":
      return <polygon className={className} points={primitive.points.map(([x, y]) => `${x},${y}`).join(" ")} />;
    case "point":
      return (
        <g className="euclid-scene-point">
          <circle cx={primitive.x} cy={primitive.y} r="3.5" />
          <text x={primitive.x + (primitive.dx ?? 0)} y={primitive.y + (primitive.dy ?? -10)}>{primitive.label}</text>
        </g>
      );
    case "label":
      return <text className={`euclid-scene-label ${className}`} x={primitive.x} y={primitive.y} textAnchor={primitive.anchor ?? "middle"}>{primitive.text}</text>;
    case "right-angle": {
      const size = primitive.size ?? 14;
      const sx = primitive.flipX ? -1 : 1;
      const sy = primitive.flipY ? -1 : 1;
      return <path className="euclid-scene-result" d={`M ${primitive.x + sx * size} ${primitive.y} L ${primitive.x + sx * size} ${primitive.y + sy * size} L ${primitive.x} ${primitive.y + sy * size}`} />;
    }
  }
}

export function EuclidScene({ scene }: { scene: EuclidSceneSpec }) {
  const titleId = useId();
  const descriptionId = useId();
  const lastStage = scene.steps.length - 1;
  const [stage, setStage] = useState(lastStage);
  const [value, setValue] = useState(scene.control.kind === "range" ? scene.control.initial : 0);
  const primitives = scene.build(value);
  const status = scene.status(value, stage);

  return (
    <section className={`proposition-figure euclid-scene${scene.family ? " euclid-scene-family" : ""}`} aria-labelledby={titleId} data-scene={scene.id}>
      <div className="proposition-figure-heading">
        <h2 id={titleId}>Construction</h2>
        <output className="proposition-figure-status" aria-live="polite">{status}</output>
      </div>
      <svg className="geometry-stage" viewBox={scene.viewBox ?? "0 0 640 380"} role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <desc id={descriptionId}>{scene.title} {scene.description} Current view: {status}.</desc>
        <g aria-hidden="true">
          {primitives.map((primitive, index) => <Primitive primitive={primitive} stage={stage} key={index} />)}
        </g>
      </svg>
      <div className="proposition-figure-controls">
        {scene.control.kind === "range" ? (
          <label className="euclid-scene-range">
            <span>{scene.control.label}</span>
            <input
              type="range"
              min={scene.control.min}
              max={scene.control.max}
              step={scene.control.step}
              value={value}
              onInput={(event) => setValue(Number(event.currentTarget.value))}
            />
          </label>
        ) : (
          <button className="geometry-action" type="button" onClick={() => setStage(stage === lastStage ? 0 : stage + 1)}>
            {stage === lastStage ? "Show construction" : "Show next step"}<span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <details className="figure-text-description">
        <summary>Text description of construction</summary>
        <p>{scene.description}</p>
        <ol>
          {scene.steps.map((step, index) => <li aria-current={index === stage ? "step" : undefined} key={step}>{step}</li>)}
        </ol>
        <p><strong>Current view:</strong> {status}.</p>
      </details>
    </section>
  );
}
