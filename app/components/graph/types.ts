export interface Node {
    id: string;
    name: string;
    val: number;
    type: string;
    slug: string;
    x?: number;
    y?: number;
    color?: string;
    neighbors?: Node[];
    links?: Link[];
    fx?: number;
    fy?: number;
}

export interface Link {
    source: string | Node;
    target: string | Node;
    type: string;
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}
