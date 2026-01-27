export interface GraphNode {
  id: string;
  name: string;
  val: number;
  type: 'post' | 'external';
  slug?: string;
  url?: string;
  color?: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'internal' | 'external';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
