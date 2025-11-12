'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { socket } from '@/lib/socket';
import { Brush, Eraser, Palette } from 'lucide-react';

interface Line {
  tool: 'brush' | 'eraser';
  color: string;
  points: number[];
}

interface CanvasProps {
  roomId: string;
  isDrawer: boolean;
  currentWord?: string;
  timeLeft?: number;
}

export default function Canvas({ roomId, isDrawer, currentWord, timeLeft = 0 }: CanvasProps) {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#000000');
  const [lines, setLines] = useState<Line[]>([]);
  const isDrawing = useRef(false);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  // Sync from server
  useEffect(() => {
    const onDraw = (data: { lines: Line[] }) => {
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
    if (!isDrawer || timeLeft <= 0) return;
    isDrawing.current = true;
    const point = stageRef.current?.getPointerPosition();
    if (point) {
      setLines([...lines, { tool, color, points: [point.x, point.y] }]);
    }
  };

  const handleMouseMove = () => {
    if (!isDrawing.current || !isDrawer || timeLeft <= 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    setLines(prev => {
      const newLines = [...prev];
      const lastLine = { ...newLines[newLines.length - 1] };
      lastLine.points = [...lastLine.points, point.x, point.y];
      newLines[newLines.length - 1] = lastLine;
      
      // Send to server
      socket.emit('draw', { roomId, lines: newLines });
      
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    if (timeLeft <= 0) return;
    setLines([]);
    socket.emit('clearCanvas', { roomId });
  };

  const stageRef = useRef<any>(null);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          {isDrawer ? '🎨 Your Canvas' : '👀 Watch & Guess'}
        </h3>
        {isDrawer && currentWord && (
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold border-2 border-amber-300 shadow-lg">
            Draw: <span className="underline">{currentWord}</span>
          </div>
        )}
        {!isDrawer && timeLeft > 0 && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 px-4 py-2 rounded-xl text-sm font-bold border-2 border-purple-300">
            Guess the word!
          </div>
        )}
      </div>

      <div className="relative">
        <Stage
          width={Math.min(800, window.innerWidth - 100)}
          height={500}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          className="border-4 border-gray-200 rounded-xl shadow-inner bg-white cursor-crosshair"
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
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
        {timeLeft <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="bg-white/90 px-6 py-4 rounded-xl text-gray-800 font-bold text-lg">
              ⏰ Time's Up!
            </div>
          </div>
        )}
      </div>

      {isDrawer && (
        <div className="mt-6 space-y-4">
          {/* Tools */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Tools:</span>
            <button
              onClick={() => setTool('brush')}
              disabled={timeLeft <= 0}
              className={`p-3 rounded-lg transition-all duration-200 ${
                tool === 'brush'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-110'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Brush className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              disabled={timeLeft <= 0}
              className={`p-3 rounded-lg transition-all duration-200 ${
                tool === 'eraser'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-110'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Eraser className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <button
              onClick={clearCanvas}
              disabled={timeLeft <= 0}
              className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Clear Canvas
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
            <Palette className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-700">Colors:</span>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setTool('brush');
                    setColor(c);
                  }}
                  disabled={timeLeft <= 0}
                  className={`w-10 h-10 rounded-lg border-3 transition-all duration-200 hover:scale-110 ${
                    color === c
                      ? 'border-4 border-purple-600 scale-110 shadow-lg'
                      : 'border-2 border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}