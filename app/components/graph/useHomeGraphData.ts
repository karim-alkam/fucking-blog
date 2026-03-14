import { useState, useEffect, useRef } from 'react';
import { GraphData, Node } from './types';

interface GraphSettings {
    data: GraphData;
    isForcesApplied: React.MutableRefObject<boolean>;
}

export function useHomeGraphData(): GraphSettings {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const isForcesApplied = useRef(false);

    useEffect(() => {
        fetch('/graph-data.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status} - missing graph-data.json`);
                return res.json();
            })
            .then((graphData: GraphData) => {
                const allNodesMap = new Map(graphData.nodes.map(n => [n.id, n]));
                const nodeExternalDegree = new Map<string, number>();
                const nodeRegularDegree = new Map<string, number>();
                const nodeAssetDegree = new Map<string, number>();

                // Initialize counts
                graphData.nodes.forEach(n => {
                    nodeExternalDegree.set(n.id, 0);
                    nodeRegularDegree.set(n.id, 0);
                    nodeAssetDegree.set(n.id, 0);
                });

                // Calculate degrees from ALL links
                graphData.links.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source as string;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target as string;
                    const sourceNode = allNodesMap.get(sourceId);
                    const targetNode = allNodesMap.get(targetId);

                    if (sourceNode && targetNode) {
                        const isAssetLink = link.type === 'asset' || link.type === 'drawing-asset';

                        // Logic for Source Node
                        if (sourceNode.type !== 'external') {
                            if (isAssetLink) {
                                nodeAssetDegree.set(sourceId, (nodeAssetDegree.get(sourceId) || 0) + 1);
                            } else if (targetNode.type === 'external') {
                                nodeExternalDegree.set(sourceId, (nodeExternalDegree.get(sourceId) || 0) + 1);
                            } else {
                                nodeRegularDegree.set(sourceId, (nodeRegularDegree.get(sourceId) || 0) + 1);
                            }
                        }

                        // Logic for Target Node
                        if (targetNode.type !== 'external') {
                            if (isAssetLink) {
                                nodeAssetDegree.set(targetId, (nodeAssetDegree.get(targetId) || 0) + 1);
                            } else if (sourceNode.type === 'external') {
                                nodeExternalDegree.set(targetId, (nodeExternalDegree.get(targetId) || 0) + 1);
                            } else {
                                nodeRegularDegree.set(targetId, (nodeRegularDegree.get(targetId) || 0) + 1);
                            }
                        }
                    }
                });

                const allNodes = graphData.nodes;
                const allLinks = graphData.links;

                allNodes.forEach(node => {
                    node.neighbors = [];
                    node.links = [];
                });

                allNodes.forEach(node => {
                    const externalCount = nodeExternalDegree.get(node.id) || 0;
                    const regularCount = nodeRegularDegree.get(node.id) || 0;
                    const assetCount = nodeAssetDegree.get(node.id) || 0;

                    node.val = 4 + (regularCount * 1.5) + (externalCount * 0.5) + (assetCount * 0.3);

                    switch (node.type) {
                        case 'board':
                            node.color = '#FF6600';
                            break;
                        case 'tag':
                            node.color = '#7000FF';
                            break;
                        case 'post':
                            node.color = '#FF003C';
                            break;
                        case 'drawing':
                            node.color = '#FCEE0A';
                            break;
                        case 'asset':
                            node.color = '#00F0FF';
                            break;
                        case 'drawing-asset':
                            node.color = '#2DE2E6';
                            break;
                        case 'external':
                            node.color = '#39FF14';
                            break;
                        default:
                            node.color = '#00F0FF';
                    }

                    // INITIALIZATION CHANGE: Start at center with slight jitter to promote "blooming"
                    node.x = (Math.random() - 0.5) * 5;
                    node.y = (Math.random() - 0.5) * 5;
                });

                isForcesApplied.current = false;
                setData({ nodes: allNodes, links: allLinks });
            })
            .catch(err => console.error("Failed to load graph data", err));
    }, []);

    return {
        data,
        isForcesApplied
    };
}
