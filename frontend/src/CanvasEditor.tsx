import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Text, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import './CanvasEditor.css';

interface ImageItem {
  id: string;
  x: number;
  y: number;
  src: string;
  width?: number;
  height?: number;
}

interface URLImageProps {
  image: ImageItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: { x: number; y: number; width?: number; height?: number }) => void;
}


const URLImage: React.FC<URLImageProps> = ({ image, isSelected, onSelect, onChange }) => {
  const [img] = useImage(image.src);
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Image
        onClick={onSelect}
        ref={shapeRef}
        image={img}
        {...image}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...image,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export const CanvasEditor: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
            setImages((prevImages) => [
              ...prevImages,
              {
                id: newId,
                x: pointerPosition.x,
                y: pointerPosition.y,
                src: reader.result as string,
              },
            ]);
            setSelectedId(newId);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Deselect image when clicking on empty stage background
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background: '#FFFFFF' }}
        onMouseDown={checkDeselect}
      >
        <Layer>
          <Text text="Try to drag me" fontSize={15} draggable />
          {images.map((image) => (
            <URLImage
              key={image.id}
              image={image}
              isSelected={image.id === selectedId}
              onSelect={() => setSelectedId(image.id)}
              onChange={(newAttrs) => {
                setImages((prev) =>
                  prev.map((img) => (img.id === image.id ? { ...img, ...newAttrs } : img))
                );
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
