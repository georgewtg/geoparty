export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // Text content or image URL
  fontSize?: number;
  color?: string;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
}