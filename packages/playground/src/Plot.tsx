import React, { useContext } from "react";
import { degree, execute, Nodes } from "@mathlang/core";

const LineContext = React.createContext({ stroke: "black", strokeWidth: 0.05 });

const Line: React.FC<React.SVGProps<SVGLineElement>> = (props) => {
  const { stroke, strokeWidth } = useContext(LineContext);

  return <line stroke={stroke} strokeWidth={strokeWidth} {...props} />;
};

type Bounds = {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
};

type PlotLinesProps = {
  define: Nodes.Define,
  bounds: Bounds
};

const PlotConstant: React.FC<PlotLinesProps> = ({ define, bounds }) => {
  const y = execute(define, 0);

  return <Line x1={bounds.minX} x2={bounds.maxX} y1={y} y2={y} />;
};

const PlotLinear: React.FC<PlotLinesProps> = ({ define, bounds }) => {
  const y1 = execute(define, bounds.minX);
  const y2 = execute(define, bounds.maxX);

  return <Line x1={bounds.minX} x2={bounds.maxX} y1={y1} y2={y2} />;
};

const PlotGeneric: React.FC<PlotLinesProps> = ({ define, bounds }) => {
  const interval = (bounds.maxX - bounds.minX) / 100;

  const lines = [];
  let prevY = execute(define, bounds.minX);

  for (let x = bounds.minX + interval; x <= bounds.maxX; x += interval) {
    const nextY = execute(define, x);
    lines.push(<Line key={x} x1={x - interval} x2={x} y1={prevY} y2={nextY} />);

    prevY = nextY;
  }

  return <g>{lines}</g>;
};

const PlotLines: React.FC<PlotLinesProps> = ({ define, bounds }) => {
  switch (degree(define)) {
    case 0:
      return <PlotConstant define={define} bounds={bounds} />;
    case 1:
      return <PlotLinear define={define} bounds={bounds} />;
    default:
      return <PlotGeneric define={define} bounds={bounds} />;
  }
};

type PlotAxisProps = {
  bounds: Bounds,
  horizontalStrokeWidth: number,
  verticalStrokeWidth: number
};

const PlotAxisX: React.FC<PlotAxisProps> = ({ bounds, horizontalStrokeWidth, verticalStrokeWidth }) => {
  const ticks: number[] = [];
  const interval = (bounds.maxX - bounds.minX) / 10;

  for (let tick = bounds.minX; tick <= bounds.maxX; tick += interval) {
    if (tick !== 0) {
      ticks.push(tick);
    }
  }

  return (
    <g>
      <Line x1={bounds.minX} x2={bounds.maxX} y1={0} y2={0} strokeWidth={verticalStrokeWidth} />
      {ticks.map((tick) => (
        <Line
          key={tick}
          x1={tick}
          x2={tick}
          y1={-(verticalStrokeWidth * 6)}
          y2={verticalStrokeWidth * 6}
          strokeWidth={horizontalStrokeWidth}
        />
      ))}
    </g>
  );
};

const PlotAxisY: React.FC<PlotAxisProps> = ({ bounds, horizontalStrokeWidth, verticalStrokeWidth }) => {
  const ticks: number[] = [];
  const interval = (bounds.maxY - bounds.minY) / 10;

  for (let tick = bounds.minY; tick <= bounds.maxY; tick += interval) {
    if (tick !== 0) {
      ticks.push(tick);
    }
  }

  return (
    <g>
      <Line x1={0} x2={0} y1={bounds.minY} y2={bounds.maxY} strokeWidth={horizontalStrokeWidth} />
      {ticks.map((tick) => (
        <Line
          key={tick}
          x1={-(horizontalStrokeWidth * 6)}
          x2={horizontalStrokeWidth * 6}
          y1={tick}
          y2={tick}
          strokeWidth={verticalStrokeWidth}
        />
      ))}
    </g>
  );
};

type PlotOmittedProps = "preserveAspectRatio" | "transform" | "viewBox";
type PlotProps = Omit<React.SVGProps<SVGSVGElement>, PlotOmittedProps> & {
  define: Nodes.Define,
};

const Plot: React.FC<PlotProps> = ({ define, height = "300", width = "300", ...props }) => {
  const bounds: Bounds = { minX: -5, maxX: 5, minY: -10, maxY: 10 };
  const horizontalStrokeWidth = (bounds.maxX - bounds.minX) / 400;
  const verticalStrokeWidth = (bounds.maxY - bounds.minY) / 400;

  const viewBox = [
    bounds.minX - horizontalStrokeWidth,
    bounds.minY - verticalStrokeWidth,
    (bounds.maxX - bounds.minX) + horizontalStrokeWidth * 2,
    (bounds.maxY - bounds.minY) + verticalStrokeWidth * 2
  ];

  return (
    <svg {...props} height={height} preserveAspectRatio="none" transform="scale(1, -1)" viewBox={viewBox.join(" ")} width={width}>
      <PlotAxisX
        bounds={bounds}
        horizontalStrokeWidth={horizontalStrokeWidth}
        verticalStrokeWidth={verticalStrokeWidth}
      />
      <PlotAxisY
        bounds={bounds}
        horizontalStrokeWidth={horizontalStrokeWidth}
        verticalStrokeWidth={verticalStrokeWidth}
      />
      <LineContext.Provider value={{ stroke: "red", strokeWidth: Math.max(horizontalStrokeWidth, verticalStrokeWidth) }}>
        <PlotLines define={define} bounds={bounds} />
      </LineContext.Provider>
    </svg>
  );
};

export default Plot;
