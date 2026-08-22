import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { CanvasItem, type BaseItem } from './CanvasItem';
import type Konva from 'konva';
import './CanvasEditor.css';


export const CanvasEditor: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);

  // History State Management
  const [history, setHistory] = useState<BaseItem[][]>(() => {
    const savedHistory = sessionStorage.getItem('history');
    return savedHistory ? JSON.parse(savedHistory) : [[]];
  });
  const [step, setStep] = useState<number>(() => {
    const savedStep = sessionStorage.getItem('step');
    return savedStep ? JSON.parse(savedStep) : 0;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Current canvas state derived from history
  const canvasItems = useMemo(() => {
    sessionStorage.setItem('history', JSON.stringify(history));
    sessionStorage.setItem('step', JSON.stringify(step));
    return history[step] || [];
  }, [history, step]);

  // Commit new state to history safely using functional updates
  const updateItems = useCallback((newItems: BaseItem[]) => {
    setHistory((prevHistory) => {
      const historySoFar = prevHistory.slice(0, step + 1);
      return [...historySoFar, newItems];
    });
    setStep((prevStep) => prevStep + 1);
  }, [step]);

  // Undo / Redo / Delete
  const handleUndo = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleRedo = useCallback(() => {
    if (step < history.length - 1) {
      setStep((prev) => prev + 1);
    }
  }, [step, history.length]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;

    const updatedImages = canvasItems.filter((img) => img.id !== selectedId);
    updateItems(updatedImages);
    setSelectedId(null);
  }, [selectedId, canvasItems, updateItems]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') handleUndo();
      else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') handleRedo();
      else if (e.key === 'Delete' || e.key === 'Backspace') handleDelete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDelete]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const pointerPosition = stageRef.current.getPointerPosition();

    if (!pointerPosition) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const newId = String(Date.now());
            const newItems: BaseItem[] = [
              ...canvasItems,
              {
                id: newId,
                type: 'image',
                x: pointerPosition.x,
                y: pointerPosition.y,
                src: reader.result as string,
              },
            ];
            updateItems(newItems);
            setSelectedId(newId);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleAddItem = (type: 'text') => {
    const newId = String(Date.now());
    const newItem: BaseItem = {
      id: newId,
      type,
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      text: type === 'text' ? 'New Text' : undefined,
    };
    updateItems([...canvasItems, newItem]);
    setSelectedId(newId);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {/* Undo / Redo / Delete Toolbar */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
        <button onClick={() => handleAddItem('text')}>+ Text</button>
        <button onClick={handleUndo} disabled={step === 0}>Undo</button>
        <button onClick={handleRedo} disabled={step === history.length - 1}>Redo</button>
        <button onClick={handleDelete} disabled={!selectedId}>
          Delete
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background: '#FFFFFF' }}
        onMouseDown={checkDeselect}
      >
        <Layer>
          {canvasItems.map((item) => (
            <CanvasItem
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => setSelectedId(item.id)}
              onChange={(updatedAttrs) => {
                const updatedItems = canvasItems.map((i) => i.id === item.id ? updatedAttrs : i);
                updateItems(updatedItems);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
