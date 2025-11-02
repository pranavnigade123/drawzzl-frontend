'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { socket } from '@/lib/socket';
import { Brush, Eraser, Palette } from 'lucide-react';

interface CanvasProps {
  roomId: string;
  isDrawer: boolean;
  currentWord?: string;
}

export default function Canvas({ roomId, isDrawer, currentWord }: CanvasProps) {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#000000');
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  // Sync from server
  useEffect(() => {
    const onDraw = (data: { lines: any[] }) => {
      setLines(data.lines);
    };
    const onClear = () => setLines([]);

    socket.on('draw', onDraw);
    socket.on('clearCanvas', onClear);

    return () => {
      socket.off('draw', onDraw);
      socket.off('clearCanvas', onClear);
    };
  }, []);

  const handleMouseDown = () => {
    if (!isDrawer) return;
    isDrawing.current = true;
    const point = stageRef.current?.getPointerPosition();
    if (point) {
      setLines([...lines, { tool, color, points: [point.x, point.y] }]);
    }
  };

  const handleMouseMove = () => {
    if (!isDrawing.current || !isDrawer) return;
    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());

    // Send to server
    socket.emit('draw', { roomId, lines });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    setLines([]);
    socket.emit('clearCanvas', { roomId });
  };

  const stageRef = useRef<any>(null);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Canvas</h3>
        {isDrawer && currentWord && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium">
            Draw: <span className="underline">{currentWord}</span>
          </div>
        )}
      </div>

      <Stage
        width={600}
        height={400}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        className="border-2 border-gray-300 rounded-lg"
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? '#FFFFFF' : line.color}
              strokeWidth={line.tool === 'eraser' ? 20 : 4}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}
        </Layer>
      </Stage>

      {isDrawer && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setTool('brush')} className={`p-2 rounded-lg ${tool === 'brush' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              <Brush className="w-5 h-5" />
            </button>
            <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              <Eraser className="w-5 h-5" />
            </button>
            <button onClick={clearCanvas} className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-600" />
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setTool('brush');
                  setColor(c);
                }}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-purple-600' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}