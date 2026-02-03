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
            .then(res => res.json())
            .then((graphData: GraphData) => {
                const allNodesMap = new Map(graphData.nodes.map(n => [n.id, n]));
                const nodeExternalDegree = new Map<string, number>();
                const nodeRegularDegree = new Map<string, number>();
                const nodeAssetDegree = new Map<string, number>();

                graphData.nodes.forEach(n => {
                    nodeExternalDegree.set(n.id, 0);
                    nodeRegularDegree.set(n.id, 0);
                    nodeAssetDegree.set(n.id, 0);
                });

                graphData.links.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source as string;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target as string;
                    const sourceNode = allNodesMap.get(sourceId);
                    const targetNode = allNodesMap.get(targetId);

                    if (sourceNode && targetNode) {
                        const isAssetLink = link.type === 'asset' || link.type === 'drawing-asset';

                        if (sourceNode.type !== 'external') {
                            if (isAssetLink) {
                                nodeAssetDegree.set(sourceId, (nodeAssetDegree.get(sourceId) || 0) + 1);
                            } else if (targetNode.type === 'external') {
                                nodeExternalDegree.set(sourceId, (nodeExternalDegree.get(sourceId) || 0) + 1);
                            } else {
                                nodeRegularDegree.set(sourceId, (nodeRegularDegree.get(sourceId) || 0) + 1);
                            }
                        }

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

                const internalNodes = graphData.nodes.filter(n => n.type !== 'external');
                const nodeIds = new Set(internalNodes.map(n => n.id));
                const internalLinks = graphData.links.filter(l =>
                    nodeIds.has(typeof l.source === 'object' ? (l.source as Node).id : l.source as string) &&
                    nodeIds.has(typeof l.target === 'object' ? (l.target as Node).id : l.target as string)
                );

                const nodesById = new Map(internalNodes.map(n => [n.id, n]));
                internalNodes.forEach(node => {
                    node.neighbors = [];
                    node.links = [];
                });

                internalLinks.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target;
                    const source = nodesById.get(sourceId as string);
                    const target = nodesById.get(targetId as string);

                    if (source && target) {
                        source.neighbors!.push(target);
                        target.neighbors!.push(source);
                        source.links!.push(link);
                        target.links!.push(link);
                    }
                });

                internalNodes.forEach(node => {
                    const externalCount = nodeExternalDegree.get(node.id) || 0;
                    const regularCount = nodeRegularDegree.get(node.id) || 0;
                    const assetCount = nodeAssetDegree.get(node.id) || 0;

                    node.val = 4 + (regularCount * 1.5) + (externalCount * 0.75) + (assetCount * 0.3);

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
                        default:
                            node.color = '#00F0FF';
                    }
                });
                
                isForcesApplied.current = false;
                setData({ nodes: internalNodes, links: internalLinks });
            })
            .catch(err => console.error("Failed to load graph data", err));
    }, []);
    
    return {
        data,
        isForcesApplied
    };
}
