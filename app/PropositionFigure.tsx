"use client";

import { useId, useState } from "react";
import { EuclidScene } from "./EuclidScene";
import { BOOK_TWO_SCENES } from "./data/book-2-figure-data";
import { createBookFamilyScene } from "./data/book-family-scenes";
import {
  PROPOSITION_FIGURES,
  type FigureElement,
  type FigurePoint,
  type PropositionFigureConfig,
} from "./data/proposition-figure-data";

type Point = { x: number; y: number };

export type ProofReference = {
  book: number;
  kind: string;
  number: string;
};

const SQRT_THREE_OVER_TWO = Math.sqrt(3) / 2;

function Line({
  from,
  to,
  className = "geometry-line",
}: {
  from: Point;
  to: Point;
  className?: string;
}) {
  return <line className={className} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
}

function Dot({ point, className = "geometry-dot" }: { point: Point; className?: string }) {
  return <circle className={className} cx={point.x} cy={point.y} r="3.8" />;
}

function Label({
  point,
  dx = 0,
  dy = 0,
  children,
  className = "geometry-label",
}: {
  point: Point;
  dx?: number;
  dy?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <text className={className} x={point.x + dx} y={point.y + dy}>
      {children}
    </text>
  );
}

function Tick({
  from,
  to,
  count = 1,
  className = "geometry-tick",
}: {
  from: Point;
  to: Point;
  count?: number;
  className?: string;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const center = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const spacing = 8;

  return (
    <g className={className}>
      {Array.from({ length: count }, (_, index) => {
        const offset = (index - (count - 1) / 2) * spacing;
        const x = center.x + ux * offset;
        const y = center.y + uy * offset;
        return (
          <line
            x1={x - px * 7}
            y1={y - py * 7}
            x2={x + px * 7}
            y2={y + py * 7}
            key={index}
          />
        );
      })}
    </g>
  );
}

function ParallelMark({
  from,
  to,
  count = 1,
}: {
  from: Point;
  to: Point;
  count?: number;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const center = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  return (
    <g className="geometry-parallel">
      {Array.from({ length: count }, (_, index) => {
        const offset = (index - (count - 1) / 2) * 15;
        const x = center.x + ux * offset;
        const y = center.y + uy * offset;
        const tip = { x: x + ux * 6, y: y + uy * 6 };
        return (
          <g key={index}>
            <line
              x1={x - ux * 6 + px * 6}
              y1={y - uy * 6 + py * 6}
              x2={tip.x}
              y2={tip.y}
            />
            <line
              x1={x - ux * 6 - px * 6}
              y1={y - uy * 6 - py * 6}
              x2={tip.x}
              y2={tip.y}
            />
          </g>
        );
      })}
    </g>
  );
}

function RightAngleMark({
  vertex,
  towardA,
  towardB,
  size = 15,
}: {
  vertex: Point;
  towardA: Point;
  towardB: Point;
  size?: number;
}) {
  const firstLength = Math.hypot(towardA.x - vertex.x, towardA.y - vertex.y);
  const secondLength = Math.hypot(towardB.x - vertex.x, towardB.y - vertex.y);
  const first = {
    x: (towardA.x - vertex.x) / firstLength,
    y: (towardA.y - vertex.y) / firstLength,
  };
  const second = {
    x: (towardB.x - vertex.x) / secondLength,
    y: (towardB.y - vertex.y) / secondLength,
  };
  const a = { x: vertex.x + first.x * size, y: vertex.y + first.y * size };
  const corner = {
    x: vertex.x + (first.x + second.x) * size,
    y: vertex.y + (first.y + second.y) * size,
  };
  const b = { x: vertex.x + second.x * size, y: vertex.y + second.y * size };

  return <path className="geometry-right-angle" d={`M ${a.x} ${a.y} L ${corner.x} ${corner.y} L ${b.x} ${b.y}`} />;
}

function polar(center: Point, radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: center.x + Math.cos(radians) * radius,
    y: center.y + Math.sin(radians) * radius,
  };
}

function arcPath(center: Point, radius: number, startDegrees: number, endDegrees: number) {
  const start = polar(center, radius, startDegrees);
  const end = polar(center, radius, endDegrees);
  const largeArc = Math.abs(endDegrees - startDegrees) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function transformPoint(
  point: Point,
  origin: Point,
  rotationDegrees: number,
  translation: Point,
): Point {
  const radians = (rotationDegrees * Math.PI) / 180;
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  return {
    x: origin.x + x * Math.cos(radians) - y * Math.sin(radians) + translation.x,
    y: origin.y + x * Math.sin(radians) + y * Math.cos(radians) + translation.y,
  };
}

function FigureShell({
  heading = "Construction",
  title,
  status,
  steps,
  currentStep,
  children,
  controls,
  viewBox = "0 0 640 360",
}: {
  heading?: string;
  title: string;
  status: string;
  steps?: string[];
  currentStep?: number;
  children: React.ReactNode;
  controls?: React.ReactNode;
  viewBox?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section className="proposition-figure" aria-labelledby={titleId}>
      <div className="proposition-figure-heading">
        <h2 id={titleId}>{heading}</h2>
        <output className="proposition-figure-status" aria-live="polite">
          {status}
        </output>
      </div>
      <svg
        className="geometry-stage"
        viewBox={viewBox}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <desc id={descriptionId}>{title} Current view: {status}.</desc>
        {children}
      </svg>
      {controls ? <div className="proposition-figure-controls">{controls}</div> : null}
      <details className="figure-text-description">
        <summary>Text description of {heading.toLowerCase()}</summary>
        <p>{title}</p>
        {steps?.length ? (
          <ol>
            {steps.map((step, index) => (
              <li aria-current={index === currentStep ? "step" : undefined} key={step}>
                {step}
              </li>
            ))}
          </ol>
        ) : null}
        <p><strong>Current view:</strong> {status}.</p>
      </details>
    </section>
  );
}

function PropositionOneFigure() {
  const [stage, setStage] = useState(3);
  const a = { x: 220, y: 276 };
  const b = { x: 420, y: 276 };
  const c = { x: 320, y: 276 - 100 * Math.sqrt(3) };
  const statuses = [
    "Given line AB",
    "Circle centered at A, radius AB",
    "The circles meet at C",
    "AC = AB = BC",
  ];
  const actions = [
    "Draw circle from A",
    "Draw circle from B",
    "Join C to A and B",
    "Show construction",
  ];

  return (
    <FigureShell
      title="An equilateral triangle is constructed on AB by intersecting two circles whose radius is AB."
      status={statuses[stage]}
      steps={statuses}
      currentStep={stage}
      controls={
        <button
          className="geometry-action"
          type="button"
          onClick={() => setStage(stage === 3 ? 0 : stage + 1)}
        >
          {actions[stage]}
          <span aria-hidden="true">→</span>
        </button>
      }
    >
      <circle
        className={`geometry-circle geometry-reveal${stage >= 1 ? " is-visible" : ""}`}
        cx={a.x}
        cy={a.y}
        r="200"
      />
      <circle
        className={`geometry-circle geometry-reveal${stage >= 2 ? " is-visible" : ""}`}
        cx={b.x}
        cy={b.y}
        r="200"
      />
      <Line from={a} to={b} className="geometry-given" />
      <Tick from={a} to={b} />
      <g
        className={`geometry-reveal${stage >= 3 ? " is-visible" : ""}`}
        aria-hidden={stage < 3}
      >
        <Line from={a} to={c} className="geometry-result" />
        <Line from={b} to={c} className="geometry-result" />
        <Tick from={a} to={c} />
        <Tick from={b} to={c} />
      </g>
      <Dot point={a} />
      <Dot point={b} />
      <g
        className={`geometry-reveal${stage >= 2 ? " is-visible" : ""}`}
        aria-hidden={stage < 2}
      >
        <Dot point={c} />
        <Label point={c} dx={10} dy={-8}>C</Label>
      </g>
      <Label point={a} dx={-22} dy={7}>A</Label>
      <Label point={b} dx={12} dy={7}>B</Label>
    </FigureShell>
  );
}

function PropositionTwoFigure() {
  const inputId = useId();
  const [givenLength, setGivenLength] = useState(105);
  const side = 170;
  const a = { x: 180, y: 270 };
  const b = { x: 350, y: 270 };
  const d = { x: 265, y: 270 - side * SQRT_THREE_OVER_TWO };
  const c = { x: b.x + givenLength, y: b.y };
  const g = {
    x: b.x + givenLength / 2,
    y: b.y + givenLength * SQRT_THREE_OVER_TWO,
  };
  const l = {
    x: a.x - givenLength / 2,
    y: a.y + givenLength * SQRT_THREE_OVER_TWO,
  };

  return (
    <FigureShell
      title="Euclid transports the length BC to begin at A; the resulting segment AL always equals BC."
      status="BC = AL"
      viewBox="0 0 640 430"
      controls={
        <label className="geometry-range-control" htmlFor={inputId}>
          <span>
            Given length BC
            <output>{givenLength}</output>
          </span>
          <input
            id={inputId}
            type="range"
            min="65"
            max="145"
            value={givenLength}
            onChange={(event) => setGivenLength(Number(event.target.value))}
          />
        </label>
      }
    >
      <circle className="geometry-circle" cx={b.x} cy={b.y} r={givenLength} />
      <circle className="geometry-circle" cx={d.x} cy={d.y} r={side + givenLength} />
      <Line from={d} to={l} className="geometry-construction" />
      <Line from={d} to={g} className="geometry-construction" />
      <Line from={a} to={b} />
      <Line from={d} to={a} />
      <Line from={d} to={b} />
      <Line from={b} to={c} className="geometry-given" />
      <Line from={a} to={l} className="geometry-result" />
      <Tick from={b} to={c} count={2} />
      <Tick from={a} to={l} count={2} />
      {[a, b, c, d, g, l].map((point, index) => <Dot point={point} key={index} />)}
      <Label point={a} dx={-21} dy={-7}>A</Label>
      <Label point={b} dx={-4} dy={-14}>B</Label>
      <Label point={c} dx={11} dy={6}>C</Label>
      <Label point={d} dx={-5} dy={-13}>D</Label>
      <Label point={g} dx={11} dy={10}>G</Label>
      <Label point={l} dx={-23} dy={10}>L</Label>
    </FigureShell>
  );
}

function PropositionThreeFigure() {
  const inputId = useId();
  const [givenLength, setGivenLength] = useState(160);
  const a = { x: 120, y: 270 };
  const b = { x: 530, y: 270 };
  const cStart = { x: 190, y: 70 };
  const cEnd = { x: cStart.x + givenLength, y: cStart.y };
  const d = polar(a, givenLength, -55);
  const e = { x: a.x + givenLength, y: a.y };

  return (
    <FigureShell
      title="The shorter line C sets a radius from A, and the circle cuts the equal length AE from the greater line AB."
      status="AE = C; AB remains fixed"
      controls={
        <label className="geometry-range-control" htmlFor={inputId}>
          <span>
            Shorter line C
            <output>{givenLength}</output>
          </span>
          <input
            id={inputId}
            type="range"
            min="90"
            max="240"
            value={givenLength}
            onChange={(event) => setGivenLength(Number(event.target.value))}
          />
        </label>
      }
    >
      <Line from={cStart} to={cEnd} className="geometry-given" />
      <Tick from={cStart} to={cEnd} count={2} />
      <Label
        point={{ x: (cStart.x + cEnd.x) / 2, y: cStart.y }}
        dx={-5}
        dy={-16}
      >
        C
      </Label>
      <circle className="geometry-circle" cx={a.x} cy={a.y} r={givenLength} />
      <Line from={a} to={b} />
      <Line from={a} to={d} className="geometry-construction" />
      <Line from={a} to={e} className="geometry-result" />
      <Tick from={a} to={d} count={2} />
      <Tick from={a} to={e} count={2} />
      {[a, b, d, e].map((point, index) => <Dot point={point} key={index} />)}
      <Label point={a} dx={-22} dy={8}>A</Label>
      <Label point={b} dx={12} dy={8}>B</Label>
      <Label point={d} dx={8} dy={-9}>D</Label>
      <Label point={e} dx={-5} dy={27}>E</Label>
    </FigureShell>
  );
}

function PropositionFourFigure() {
  const inputId = useId();
  const [progress, setProgress] = useState(0);
  const amount = progress / 100;
  const a = { x: 110, y: 250 };
  const b = polar(a, 150, 20);
  const c = polar(a, 115, -40);
  const d = { x: 370, y: 250 };
  const e = polar(d, 150, 0);
  const f = polar(d, 115, -60);
  const translation = { x: (d.x - a.x) * amount, y: (d.y - a.y) * amount };
  const rotation = -20 * amount;
  const movedA = transformPoint(a, a, rotation, translation);
  const movedB = transformPoint(b, a, rotation, translation);
  const movedC = transformPoint(c, a, rotation, translation);
  const coincident = progress === 100;
  const status =
    progress === 0
      ? "Equal side-angle-side sets"
      : coincident
        ? "The triangles coincide"
        : "Applying ABC to DEF";

  return (
    <FigureShell
      title="Triangle ABC is rigidly applied to triangle DEF. Equal sides and their included angle force every vertex to coincide."
      status={status}
      controls={
        <label className="geometry-range-control" htmlFor={inputId}>
          <span>
            Apply ABC to DEF
            <output>{progress}%</output>
          </span>
          <input
            id={inputId}
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
        </label>
      }
    >
      <polygon
        className="geometry-triangle-target"
        points={`${d.x},${d.y} ${e.x},${e.y} ${f.x},${f.y}`}
      />
      <Line from={d} to={e} className="geometry-target" />
      <Line from={d} to={f} className="geometry-target" />
      <Line from={e} to={f} className="geometry-target" />
      <Tick from={d} to={e} />
      <Tick from={d} to={f} count={2} />
      <path className="geometry-angle geometry-target-angle" d={arcPath(d, 31, -60, 0)} />

      <polygon
        className="geometry-triangle-source"
        points={`${movedA.x},${movedA.y} ${movedB.x},${movedB.y} ${movedC.x},${movedC.y}`}
      />
      <Line from={movedA} to={movedB} className="geometry-result" />
      <Line from={movedA} to={movedC} className="geometry-result" />
      <Line from={movedB} to={movedC} className="geometry-result" />
      <Tick from={movedA} to={movedB} className="geometry-source-tick" />
      <Tick from={movedA} to={movedC} count={2} className="geometry-source-tick" />
      <path
        className="geometry-angle geometry-source-angle"
        d={arcPath(movedA, 31, -40 + rotation, 20 + rotation)}
      />

      {[d, e, f].map((point, index) => <Dot point={point} className="geometry-target-dot" key={index} />)}
      {[movedA, movedB, movedC].map((point, index) => <Dot point={point} key={index} />)}

      {coincident ? (
        <>
          <Label point={d} dx={-31} dy={17}>A/D</Label>
          <Label point={e} dx={12} dy={8}>B/E</Label>
          <Label point={f} dx={10} dy={-8}>C/F</Label>
        </>
      ) : (
        <>
          <Label point={movedA} dx={-22} dy={17}>A</Label>
          <Label point={movedB} dx={9} dy={18}>B</Label>
          <Label point={movedC} dx={8} dy={-8}>C</Label>
          <Label point={d} dx={-21} dy={17} className="geometry-label geometry-target-label">D</Label>
          <Label point={e} dx={12} dy={8} className="geometry-label geometry-target-label">E</Label>
          <Label point={f} dx={10} dy={-8} className="geometry-label geometry-target-label">F</Label>
        </>
      )}
    </FigureShell>
  );
}

function revealClass(requiredStage: number | undefined, stage: number) {
  if (!requiredStage) return undefined;
  return `geometry-reveal${stage >= requiredStage ? " is-visible" : ""}`;
}

function FigureElementView({
  element,
  points,
  stage,
  index,
}: {
  element: FigureElement;
  points: Record<string, FigurePoint>;
  stage: number;
  index: number;
}) {
  const point = (id: string) => points[id];
  const className = revealClass(element.stage, stage);
  let shape: React.ReactNode;

  switch (element.kind) {
    case "segment":
      shape = (
        <Line
          from={point(element.from)}
          to={point(element.to)}
          className={`geometry-${element.style ?? "line"}`}
        />
      );
      break;
    case "circle": {
      const center = point(element.center);
      shape = <circle className="geometry-circle" cx={center.x} cy={center.y} r={element.radius} />;
      break;
    }
    case "angle":
      shape = (
        <path
          className={`geometry-angle geometry-angle-${element.style ?? "accent"}`}
          d={arcPath(point(element.center), element.radius, element.start, element.end)}
        />
      );
      break;
    case "polygon":
      shape = (
        <polygon
          className={`geometry-${element.style ?? "area"}`}
          points={element.points.map((id) => `${point(id).x},${point(id).y}`).join(" ")}
        />
      );
      break;
    case "tick":
      shape = (
        <Tick
          from={point(element.from)}
          to={point(element.to)}
          count={element.count}
        />
      );
      break;
    case "parallel":
      shape = (
        <ParallelMark
          from={point(element.from)}
          to={point(element.to)}
          count={element.count}
        />
      );
      break;
    case "right-angle":
      shape = (
        <RightAngleMark
          vertex={point(element.vertex)}
          towardA={point(element.towardA)}
          towardB={point(element.towardB)}
          size={element.size}
        />
      );
      break;
  }

  return (
    <g className={className} aria-hidden={element.stage ? stage < element.stage : undefined} key={index}>
      {shape}
    </g>
  );
}

function DataDrivenPropositionFigure({ config }: { config: PropositionFigureConfig }) {
  const lastStage = config.steps.length - 1;
  const [stage, setStage] = useState(lastStage);
  const currentStep = config.steps[stage];

  return (
    <FigureShell
      title={config.description}
      status={currentStep.status}
      steps={config.steps.map((step) => step.status)}
      currentStep={stage}
      viewBox={config.viewBox}
      controls={
        <button
          className="geometry-action"
          type="button"
          onClick={() => setStage(stage === lastStage ? 0 : stage + 1)}
        >
          {stage === lastStage ? "Show construction" : currentStep.action}
          <span aria-hidden="true">→</span>
        </button>
      }
    >
      {config.elements.map((element, index) => (
        <FigureElementView
          element={element}
          points={config.points}
          stage={stage}
          index={index}
          key={index}
        />
      ))}
      {Object.entries(config.points).map(([id, figurePoint]) => (
        <g
          className={revealClass(figurePoint.stage, stage)}
          aria-hidden={figurePoint.stage ? stage < figurePoint.stage : undefined}
          key={id}
        >
          <Dot point={figurePoint} />
          {figurePoint.label ? (
            <Label point={figurePoint} dx={figurePoint.dx} dy={figurePoint.dy}>
              {figurePoint.label}
            </Label>
          ) : null}
        </g>
      ))}
    </FigureShell>
  );
}

export function PropositionFigure({
  bookNumber,
  propositionId,
  propositionNumber,
  propositionTitle,
  references,
}: {
  bookNumber: number;
  propositionId: string;
  propositionNumber: number | string;
  propositionTitle: string;
  references: ProofReference[];
}) {
  if (!propositionId.startsWith("prop-")) return null;
  if (bookNumber === 2 && BOOK_TWO_SCENES[propositionId]) {
    return <EuclidScene scene={BOOK_TWO_SCENES[propositionId]} key={`book-2-${propositionId}`} />;
  }
  if (bookNumber >= 3) {
    return (
      <EuclidScene
        scene={createBookFamilyScene(bookNumber, propositionNumber, propositionTitle, references.length)}
        key={`book-${bookNumber}-${propositionId}`}
      />
    );
  }
  switch (propositionId) {
    case "prop-1":
      return <PropositionOneFigure />;
    case "prop-2":
      return <PropositionTwoFigure />;
    case "prop-3":
      return <PropositionThreeFigure />;
    case "prop-4":
      return <PropositionFourFigure />;
    default:
      return PROPOSITION_FIGURES[propositionId] ? (
        <DataDrivenPropositionFigure config={PROPOSITION_FIGURES[propositionId]} />
      ) : null;
  }
}
