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

  // Prevent scrolling when drawing
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing.current && isDrawer) {
        e.preventDefault();
      }
    };

    // Add touch event listeners to prevent scrolling during drawing
    document.addEventListener('touchstart', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchend', preventScroll, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchend', preventScroll);
    };
  }, [isDrawer]);

  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;
    
    // Prevent default touch behavior to stop scrolling
    if (e.evt) {
      e.evt.preventDefault();
    }
    
    isDrawing.current = true;
    const point = stageRef.current?.getPointerPosition();
    if (point) {
      setLines([...lines, { tool, color, points: [point.x, point.y] }]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !isDrawer) return;
    
    // Prevent default touch behavior to stop scrolling
    if (e.evt) {
      e.evt.preventDefault();
    }
    
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

  const handleMouseUp = (e: any) => {
    // Prevent default touch behavior
    if (e.evt) {
      e.evt.preventDefault();
    }
    
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    setLines([]);
    socket.emit('clearCanvas', { roomId });
  };

  const stageRef = useRef<any>(null);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4">
      <div className="mb-3 md:mb-4 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-bold">Canvas</h3>
        {isDrawer && currentWord && (
          <div className="bg-yellow-100 text-yellow-800 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
            Draw: <span className="underline">{currentWord}</span>
          </div>
        )}
      </div>

      <div 
        className="overflow-x-auto"
        style={{ 
          touchAction: 'none', // Prevent all touch gestures
          WebkitTouchCallout: 'none', // Prevent callout on iOS
          WebkitUserSelect: 'none', // Prevent text selection
          userSelect: 'none'
        }}
      >
        <Stage
          width={Math.min(600, window.innerWidth - 80)}
          height={Math.min(400, window.innerHeight * 0.4)}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="border-2 border-gray-300 rounded-lg mx-auto"
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

      </div>

      {isDrawer && (
        <div className="mt-3 md:mt-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setTool('brush')} className={`p-2 rounded-lg transition-all hover:scale-105 ${tool === 'brush' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
              <Brush className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all hover:scale-105 ${tool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
              <Eraser className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={clearCanvas} className="ml-auto px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all text-sm md:text-base">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Palette className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setTool('brush');
                  setColor(c);
                }}
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-transform ${color === c ? 'border-purple-600 scale-110' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}