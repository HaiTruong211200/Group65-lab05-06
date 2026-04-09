export interface NodeData {
  id: string;
  label: string;
  type: 'symptom' | 'disease' | 'treatment';
  metadata?: Record<string, any>;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight?: number;
}
