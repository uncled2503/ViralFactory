/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Rect, Circle, Text as KonvaText, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';
import { VideoElement, BulkRow } from '../../../types';
import Konva from 'konva';
import { useUIStore } from '../../../store/uiStore';

interface KonvaElementProps {
  element: VideoElement;
  isSelected: boolean;
  bulkRow: BulkRow | null;
  currentTime: number;
  totalDuration: number;
  onSelect: () => void;
  onChange: (updates: Partial<VideoElement>) => void;
  onSnapChange: (lines: { type: 'h' | 'v'; value: number }[]) => void;
  guides: { id: string; type: 'h' | 'v'; value: number }[];
  enableSnap: boolean;
  projectWidth: number;
  projectHeight: number;
}

function getTrackForElement(el: VideoElement): string {
  if (el.type === 'subtitle') return 'subtitle';
  if (el.type === 'audio') return 'audio';
  if (el.type === 'text') return 'text';
  if (el.type === 'video_placeholder') return 'video';
  if (el.type === 'image') return 'logo';
  if (el.layer === 'video' || el.layer === 'background') return 'video';
  if (el.layer === 'text') return 'text';
  if (el.layer === 'logo') return 'logo';
  if (el.layer === 'effects' || el.layer === 'overlay') return 'overlay';
  if (el.type === 'rect' || el.type === 'circle' || el.type === 'progress_bar') return 'overlay';
  return 'overlay';
}

export default function KonvaElement({
  element,
  isSelected,
  bulkRow,
  currentTime,
  totalDuration,
  onSelect,
  onChange,
  onSnapChange,
  guides,
  enableSnap,
  projectWidth,
  projectHeight,
}: KonvaElementProps) {
  const { hiddenTracks, lockedTracks } = useUIStore();
  const track = getTrackForElement(element);

  const {
    id,
    type,
    x,
    y,
    width,
    height,
    rotation,
    opacity,
    fill,
    stroke,
    strokeWidth,
    text,
    fontSize,
    fontFamily,
    fontStyle,
    align,
    imageUrl,
    startTime,
    endTime,
    isLocked: elementLocked,
    dynamicVariable,
  } = element;

  const isLocked = elementLocked || lockedTracks.includes(track);

  // 1. Timeline Visibility Guard
  // If the element is hidden, track is hidden, or playhead is outside the start/end window, don't draw the element
  if (element.isHidden || hiddenTracks.includes(track)) {
    return null;
  }

  if (currentTime < startTime || currentTime > endTime) {
    return null;
  }

  // 2. Dynamic text interpolation from Bulk Data
  let displayText = text || '';
  if ((type === 'text' || type === 'subtitle') && dynamicVariable && bulkRow) {
    if (bulkRow[dynamicVariable] !== undefined) {
      displayText = bulkRow[dynamicVariable];
    }
  }

  // 3. Image loading hook
  const [img, imgStatus] = useImage(imageUrl || '', 'anonymous');

  // 4. Shape caching for Blur filter
  const shapeRef = useRef<any>(null);

  useEffect(() => {
    if (shapeRef.current) {
      if (element.blur && element.blur > 0) {
        try {
          shapeRef.current.cache();
          shapeRef.current.getLayer()?.batchDraw();
        } catch (e) {
          console.error("Erro ao aplicar blur:", e);
        }
      } else {
        try {
          shapeRef.current.clearCache();
          shapeRef.current.getLayer()?.batchDraw();
        } catch (e) {
          // ignore
        }
      }
    }
  }, [element.blur, width, height, element.cornerRadius, fill, element.shadowBlur, element.strokeWidth]);

  // Handle Drag Move (with Real-time magnetic Snapping)
  const handleDragMove = (e: any) => {
    if (isLocked) return;
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    const isCircle = type === 'circle';
    const radius = width / 2;
    const elX = isCircle ? newX - radius : newX;
    const elY = isCircle ? newY - radius : newY;

    if (enableSnap) {
      const snapPointsV = [0, projectWidth / 2, projectWidth, ...guides.filter(g => g.type === 'v').map(g => g.value)];
      const snapPointsH = [0, projectHeight / 2, projectHeight, ...guides.filter(g => g.type === 'h').map(g => g.value)];
      const threshold = 15; // Snapping distance threshold in project pixels
      
      let snapX: number | null = null;
      let snapY: number | null = null;
      let adjustedX = elX;
      let adjustedY = elY;

      // Check vertical snapping (forces horizontal X positioning)
      for (const val of snapPointsV) {
        if (Math.abs(elX - val) < threshold) {
          adjustedX = val;
          snapX = val;
          break;
        }
        if (Math.abs((elX + width) - val) < threshold) {
          adjustedX = val - width;
          snapX = val;
          break;
        }
        if (Math.abs((elX + width / 2) - val) < threshold) {
          adjustedX = val - width / 2;
          snapX = val;
          break;
        }
      }

      // Check horizontal snapping (forces vertical Y positioning)
      for (const val of snapPointsH) {
        if (Math.abs(elY - val) < threshold) {
          adjustedY = val;
          snapY = val;
          break;
        }
        if (Math.abs((elY + height) - val) < threshold) {
          adjustedY = val - height;
          snapY = val;
          break;
        }
        if (Math.abs((elY + height / 2) - val) < threshold) {
          adjustedY = val - height / 2;
          snapY = val;
          break;
        }
      }

      // Re-apply snapped position back to node
      newX = isCircle ? adjustedX + radius : adjustedX;
      newY = isCircle ? adjustedY + radius : adjustedY;
      node.x(newX);
      node.y(newY);

      // Draw active guides on canvas overlays
      const lines = [];
      if (snapX !== null) lines.push({ type: 'v' as const, value: snapX });
      if (snapY !== null) lines.push({ type: 'h' as const, value: snapY });
      onSnapChange(lines);
    } else {
      onSnapChange([]);
    }
  };

  const handleDragEnd = (e: any) => {
    if (isLocked) return;
    const node = e.target;
    const isCircle = type === 'circle';
    const radius = width / 2;
    const elX = isCircle ? node.x() - radius : node.x();
    const elY = isCircle ? node.y() - radius : node.y();

    onChange({
      x: Math.round(elX),
      y: Math.round(elY),
    });
    
    // Clear any active snap line markers
    onSnapChange([]);
  };

  // Handle Transform resize/rotate (with rotation snaps at 45 degree multiples)
  const handleTransform = (e: any) => {
    if (isLocked) return;
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    let finalRotation = node.rotation();
    // Intelligent 45-degree angle rotation snapping
    if (enableSnap) {
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const angle of snapAngles) {
        if (Math.abs((finalRotation % 360) - angle) < 5) {
          finalRotation = angle;
          node.rotation(angle);
          break;
        }
      }
    }

    const isCircle = type === 'circle';
    const radius = width / 2;
    const newWidth = Math.max(5, node.width() * scaleX);
    const newHeight = Math.max(5, node.height() * scaleY);

    if (isCircle) {
      const newRadius = radius * scaleX;
      onChange({
        x: Math.round(node.x() - newRadius),
        y: Math.round(node.y() - newRadius),
        width: Math.round(newRadius * 2),
        height: Math.round(newRadius * 2),
        rotation: Math.round(finalRotation),
      });
    } else {
      onChange({
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        rotation: Math.round(finalRotation),
      });
    }
  };

  switch (type) {
    case 'rect':
      return (
        <Rect
          ref={shapeRef}
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          opacity={opacity}
          fill={fill}
          stroke={stroke || element.stroke}
          strokeWidth={strokeWidth !== undefined ? strokeWidth : element.strokeWidth}
          draggable={!isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransform}
          cornerRadius={element.cornerRadius !== undefined ? element.cornerRadius : 0}
          shadowColor={element.shadowColor || 'black'}
          shadowBlur={element.shadowBlur !== undefined ? element.shadowBlur : 0}
          shadowOpacity={element.shadowOpacity !== undefined ? element.shadowOpacity : 0}
          shadowOffset={{
            x: element.shadowOffsetX !== undefined ? element.shadowOffsetX : 0,
            y: element.shadowOffsetY !== undefined ? element.shadowOffsetY : 0,
          }}
          filters={element.blur && element.blur > 0 ? [Konva.Filters.Blur] : undefined}
          blurRadius={element.blur || 0}
        />
      );

    case 'circle':
      const radius = width / 2;
      return (
        <Circle
          ref={shapeRef}
          id={id}
          x={x + radius}
          y={y + radius}
          radius={radius}
          rotation={rotation}
          opacity={opacity}
          fill={fill}
          stroke={stroke || element.stroke}
          strokeWidth={strokeWidth !== undefined ? strokeWidth : element.strokeWidth}
          draggable={!isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransform}
          shadowColor={element.shadowColor || 'black'}
          shadowBlur={element.shadowBlur !== undefined ? element.shadowBlur : 0}
          shadowOpacity={element.shadowOpacity !== undefined ? element.shadowOpacity : 0}
          shadowOffset={{
            x: element.shadowOffsetX !== undefined ? element.shadowOffsetX : 0,
            y: element.shadowOffsetY !== undefined ? element.shadowOffsetY : 0,
          }}
          filters={element.blur && element.blur > 0 ? [Konva.Filters.Blur] : undefined}
          blurRadius={element.blur || 0}
        />
      );

    case 'text':
    case 'subtitle':
      const isSub = type === 'subtitle';
      const computedFontStyle = [
        element.fontStyle === 'italic' ? 'italic' : '',
        element.fontWeight || (element.fontStyle === 'bold' ? 'bold' : 'normal')
      ].filter(Boolean).join(' ');

      return (
        <KonvaText
          ref={shapeRef}
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          text={displayText}
          fontSize={fontSize}
          fontFamily={fontFamily || 'Inter'}
          fontStyle={computedFontStyle}
          fill={fill}
          align={align || 'center'}
          verticalAlign="middle"
          rotation={rotation}
          opacity={opacity}
          draggable={!isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransform}
          wrap="word"
          letterSpacing={element.letterSpacing !== undefined ? element.letterSpacing : 0}
          lineHeight={element.lineHeight !== undefined ? element.lineHeight : 1.2}
          padding={element.padding !== undefined ? element.padding : 0}
          // Add drop shadow to make video captions readable on any background
          shadowColor={element.shadowColor || (isSub ? 'black' : 'transparent')}
          shadowBlur={element.shadowBlur !== undefined ? element.shadowBlur : (isSub ? 8 : 0)}
          shadowOpacity={element.shadowOpacity !== undefined ? element.shadowOpacity : (isSub ? 0.8 : 0)}
          shadowOffset={{
            x: element.shadowOffsetX !== undefined ? element.shadowOffsetX : (isSub ? 2 : 0),
            y: element.shadowOffsetY !== undefined ? element.shadowOffsetY : (isSub ? 2 : 0)
          }}
          stroke={element.stroke || (isSub ? '#000000' : undefined)}
          strokeWidth={element.strokeWidth !== undefined ? element.strokeWidth : (isSub ? 3 : undefined)}
          filters={element.blur && element.blur > 0 ? [Konva.Filters.Blur] : undefined}
          blurRadius={element.blur || 0}
        />
      );

    case 'image':
      if (imageUrl && imgStatus === 'loaded' && img) {
        return (
          <KonvaImage
            ref={shapeRef}
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            image={img}
            rotation={rotation}
            opacity={opacity}
            draggable={!isLocked}
            onClick={onSelect}
            onTap={onSelect}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransform}
            cornerRadius={element.cornerRadius !== undefined ? element.cornerRadius : 0}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            shadowColor={element.shadowColor || 'black'}
            shadowBlur={element.shadowBlur !== undefined ? element.shadowBlur : 0}
            shadowOpacity={element.shadowOpacity !== undefined ? element.shadowOpacity : 0}
            shadowOffset={{
              x: element.shadowOffsetX !== undefined ? element.shadowOffsetX : 0,
              y: element.shadowOffsetY !== undefined ? element.shadowOffsetY : 0
            }}
            filters={element.blur && element.blur > 0 ? [Konva.Filters.Blur] : undefined}
            blurRadius={element.blur || 0}
          />
        );
      } else {
        // Fallback outline during image load or error
        return (
          <Group
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            rotation={rotation}
            draggable={!isLocked}
            onClick={onSelect}
            onTap={onSelect}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransform}
          >
            <Rect
              width={width}
              height={height}
              fill="#27272a"
              stroke="#4f46e5"
              strokeWidth={2}
              dash={[6, 4]}
              opacity={0.8}
            />
            <KonvaText
              width={width}
              height={height}
              text={imgStatus === 'loading' ? 'Carregando Imagem...' : 'Imagem indisponível'}
              fontSize={14}
              fontFamily="Inter"
              fill="#a1a1aa"
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      }

    case 'progress_bar':
      // Progress is proportional to the current time vs total duration
      const progressRatio = Math.max(0, Math.min(currentTime / totalDuration, 1.0));
      const progressWidth = width * progressRatio;

      return (
        <Group
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          opacity={opacity}
          draggable={!isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransform}
        >
          {/* Background track */}
          <Rect
            width={width}
            height={height}
            fill="#3f3f46"
            cornerRadius={height / 2}
            opacity={0.6}
          />
          {/* Active fill */}
          <Rect
            width={progressWidth}
            height={height}
            fill={fill}
            cornerRadius={height / 2}
          />
        </Group>
      );

    case 'video_placeholder':
      return (
        <Group
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          opacity={opacity}
          draggable={!isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransform}
        >
          <Rect
            width={width}
            height={height}
            fill="#090d16"
            stroke={element.stroke || fill}
            strokeWidth={element.strokeWidth !== undefined ? element.strokeWidth : 4}
            dash={[10, 5]}
            cornerRadius={element.cornerRadius !== undefined ? element.cornerRadius : 12}
          />
          <KonvaText
            width={width}
            height={height}
            text={`📹 Marcador de Mídia\n[${element.name}]`}
            fontSize={20}
            fontFamily="Inter"
            fontStyle="bold"
            fill={fill}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );

    default:
      return null;
  }
}
