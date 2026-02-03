import { useState, useEffect, useRef } from 'react';
import { GraphData, Node, Link } from './types';

export function useHomeGraphData() {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    // Track if forces have been verified/applied for the current data cycle
    // Using a ref to coordinate with the ForceGraph instance
    const isForcesApplied = useRef(false);

    useEffect(() => {
        fetch('/graph-data.json')
            .then(res => res.json())
            .then((graphData: GraphData) => {
                const allNodesMap = new Map(graphData.nodes.map(n => [n.id, n]));
                const nodeInternalDegree = new Map<string, number>();
                const nodeExternalDegree = new Map<string, number>();

                // Initialize counts
                graphData.nodes.forEach(n => {
                    nodeInternalDegree.set(n.id, 0);
                    nodeExternalDegree.set(n.id, 0);
                });

                // Calculate degrees from ALL links
                graphData.links.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source as string;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target as string;
                    const sourceNode = allNodesMap.get(sourceId);
                    const targetNode = allNodesMap.get(targetId);

                    if (sourceNode && targetNode) {
                        const isSourceInternal = sourceNode.type !== 'external';
                        const isTargetInternal = targetNode.type !== 'external';

                        // Logic for Source Node
                        if (isSourceInternal) {
                            if (isTargetInternal) {
                                nodeInternalDegree.set(sourceId, (nodeInternalDegree.get(sourceId) || 0) + 1);
                            } else {
                                nodeExternalDegree.set(sourceId, (nodeExternalDegree.get(sourceId) || 0) + 1);
                            }
                        }

                        // Logic for Target Node
                        if (isTargetInternal) {
                            if (isSourceInternal) {
                                nodeInternalDegree.set(targetId, (nodeInternalDegree.get(targetId) || 0) + 1);
                            } else {
                                nodeExternalDegree.set(targetId, (nodeExternalDegree.get(targetId) || 0) + 1);
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
                    const internalCount = nodeInternalDegree.get(node.id) || 0;
                    const externalCount = nodeExternalDegree.get(node.id) || 0;
                    // Formula: Base 4 + (Internal * 1.5) + (External * 0.75)
                    node.val = 4 + (internalCount * 1.5) + (externalCount * 0.75);
                    node.color = '#00F0FF';
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
