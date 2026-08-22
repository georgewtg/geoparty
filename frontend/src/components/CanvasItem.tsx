import React, { useEffect, useRef, useState } from 'react';
import { Text, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import './CanvasEditor.css';


type ItemType = 'shapes' | 'text' | 'image' | 'audio' | 'video';

export interface BaseItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  // specific properties
  src?: string;       // image
  text?: string;      // text
  fontSize?: number;  // text
  fill?: string;      // shapes/text
}

interface CanvasItemProps {
  item: BaseItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: BaseItem) => void;
}


export const CanvasItem: React.FC<CanvasItemProps> = ({ item, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef<Konva.Node>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false); // editing state for text

  // load image if item is an image
  const [loadedImg] = useImage(item.type === 'image' ? item.src || '' : '');

  // attach transformer
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

  // handle double click for text editing
  const handleDblClick = () => {
    if (item.type !== 'text') return;

    const textNode = shapeRef.current as Konva.Text | null;
    if (!textNode) return;

    textNode.hide();
    setIsEditing(true);

    const textPosition = textNode.absolutePosition();
    const stage = textNode.getStage();
    if (!stage) return;

    const container = stage.container();
    const areaPosition = {
      x: container.offsetLeft + textPosition.x,
      y: container.offsetTop + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value                 = textNode.text();
    textarea.style.position        = 'absolute';
    textarea.style.top             = `${areaPosition.y}px`;
    textarea.style.left            = `${areaPosition.x}px`;
    textarea.style.width           = `${textNode.width() - textNode.padding() * 2}px`;
    textarea.style.height          = `${textNode.height() - textNode.padding() * 2 + 5}px`;
    textarea.style.fontSize        = `${textNode.fontSize()}px`;
    textarea.style.border          = 'none';
    textarea.style.padding         = '0px';
    textarea.style.margin          = '0px';
    textarea.style.overflow        = 'hidden';
    textarea.style.background      = 'none';
    textarea.style.outline         = 'none';
    textarea.style.resize          = 'none';
    textarea.style.lineHeight      = textNode.lineHeight().toString();
    textarea.style.fontFamily      = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign       = textNode.align();
    textarea.style.color           = textNode.fill() as string;

    const rotation = textNode.rotation();
    if (rotation) {
      textarea.style.transform = `rotateZ(${rotation}deg)`;
    }

    textarea.focus();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      textNode.show();
      setIsEditing(false);
      onChange({
        ...item,
        text: textarea.value,
      });
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) removeTextarea();
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) removeTextarea();
      if (e.key === 'Escape') removeTextarea();
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...item,
      x: node.x(),
      y: node.y(),
      width : Math.max(20, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      ...item,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const commonProps = {
    onClick: onSelect,
    draggable: !isEditing,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    x: item.x,
    y: item.y,
    rotation: item.rotation || 0,
  };

  const renderShape = () => {
    switch (item.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            ref={shapeRef as React.RefObject<Konva.Text>}
            onDblClick={handleDblClick}
            text={item.text ?? 'Sample Text'}
            fontSize={item.fontSize || 24}
            fill={item.fill || '#000000'}
            width={item.width || 200}
          />
        );
      case 'image':
        return (
          <Image
            {...commonProps}
            ref={shapeRef as React.RefObject<Konva.Image>}
            image={loadedImg}
            width={item.width}
            height={item.height}
          />
        );
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      {renderShape()}
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={
            item.type === 'text'
              ? ['middle-left', 'middle-right']
              : undefined
          }
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