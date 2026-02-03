'use client';

import { useState, useEffect, useMemo } from 'react';
import { GraphData, GraphNode, GraphLink } from './types';

export const useGraphData = (currentSlug: string) => {
    const [data, setData] = useState<GraphData | null>(null);
    const [showExternal, setShowExternal] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetch('/graph-data.json')
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error("Failed to load graph data", err));
    }, []);

    // Smart Default: Show external links if no internal links exist
    useEffect(() => {
        if (!data) return;

        // Check if the current node has any internal links (neighbors that are posts)
        const currentNode = data.nodes.find(n => n.slug === currentSlug);
        if (!currentNode) return;

        const hasInternalLinks = data.links.some(link => {
            // Handle both string IDs and object references (in case D3 already processed them)
            const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
            const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;

            // Must be connected to current node
            if (sourceId !== currentNode.id && targetId !== currentNode.id) return false;

            // Find the "other" node
            const otherId = sourceId === currentNode.id ? targetId : sourceId;
            const otherNode = data.nodes.find(n => n.id === otherId);

            // Check if the neighbor is an internal post
            return otherNode?.type === 'post';
        });

        // If no internal links exist, default to showing external links
        if (!hasInternalLinks) {
            setShowExternal(true);
        } else {
            setShowExternal(false);
        }
    }, [data, currentSlug]);

    // Filter Graph Data for Local View
    const filteredData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        // 1. Find the current node
        const currentNode = data.nodes.find(n => n.slug === currentSlug);
        if (!currentNode) return { nodes: [], links: [] };

        // 2. Find neighbors (Level 1)
        const neighborIds = new Set<string>();
        const incomingIds = new Set<string>();
        const outgoingIds = new Set<string>();
        const relevantLinks: GraphLink[] = [];

        // Add current node ID
        neighborIds.add(currentNode.id);

        data.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
            const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;

            // Check types for external filtering
            // We need to look up the node objects because link.source/target might just be IDs string
            const sourceNode = data.nodes.find(n => n.id === sourceId);
            const targetNode = data.nodes.find(n => n.id === targetId);

            // Filter out external links if toggled off
            if (!showExternal) {
                if (sourceNode?.type === 'external' || targetNode?.type === 'external') {
                    return;
                }
            }

            // STRICT FILTER: Only allow 'post' or 'external' nodes in the detailed graph view
            // We explicitly exclude 'tag', 'board', 'drawing', 'asset' etc.
            const isAllowedType = (node: GraphNode | undefined) => {
                if (!node) return false;
                return node.type === 'post' || node.type === 'external';
            };

            if (sourceId === currentNode.id) {
                // Outgoing link: Target must be allowed
                if (!isAllowedType(targetNode)) return;

                neighborIds.add(targetId as string);
                outgoingIds.add(targetId as string);
                relevantLinks.push({ ...link, source: sourceId, target: targetId });
            } else if (targetId === currentNode.id) {
                // Incoming link: Source must be allowed
                if (!isAllowedType(sourceNode)) return;

                neighborIds.add(sourceId as string);
                incomingIds.add(sourceId as string);
                relevantLinks.push({ ...link, source: sourceId, target: targetId });
            }
        });

        // 3. Filter nodes
        const relevantNodes = data.nodes.filter(n => neighborIds.has(n.id)).map(n => {
            let color = '#ffffff';
            if (n.id === currentNode.id) {
                color = '#FF003C'; // Pink (Current)
            } else if (incomingIds.has(n.id)) {
                color = '#FCEE0A'; // Yellow (Internal Reference / Backlink)
            } else if (outgoingIds.has(n.id)) {
                if (n.type === 'external') {
                    color = '#00F0FF'; // Cyan (External Mention)
                } else {
                    color = '#39FF14'; // Green (Internal Mention)
                }
            }
            return { ...n, color };
        });

        return { nodes: relevantNodes, links: relevantLinks };
    }, [data, currentSlug, showExternal]);

    // Derived Lists (Coupled to filteredData so they match the visual graph)
    const internalMentions = useMemo(() => {
        const nodes = filteredData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
            // Find the current node in the filtered nodes to get its ID (which might differ from slug)
            const currentNode = filteredData.nodes.find(n => n.slug === currentSlug);
            const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
            // Check if target is a post node
            const targetNode = filteredData.nodes.find(n => n.id === targetId);

            return currentNode && sourceId === currentNode.id && targetNode?.type === 'post';
        }).map(l => {
            const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
            return filteredData.nodes.find(n => n.id === targetId)!;
        }).filter(Boolean);

        // Deduplicate nodes to prevent "duplicate key" React errors
        return Array.from(new Map(nodes.map(node => [node.id, node])).values());
    }, [filteredData, currentSlug]);

    const externalMentions = useMemo(() => {
        const nodes = filteredData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
            // Find the current node in the filtered nodes to get its ID
            const currentNode = filteredData.nodes.find(n => n.slug === currentSlug);
            const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
            // Check if target is an external node
            const targetNode = filteredData.nodes.find(n => n.id === targetId);

            return currentNode && sourceId === currentNode.id && targetNode?.type === 'external';
        }).map(l => {
            const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
            return filteredData.nodes.find(n => n.id === targetId)!;
        }).filter(Boolean);

        // Deduplicate nodes
        return Array.from(new Map(nodes.map(node => [node.id, node])).values());
    }, [filteredData, currentSlug]);

    const internalReferences = useMemo(() => {
        const nodes = filteredData.links.filter(l => {
            const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
            // Find the current node in the filtered nodes to get its ID
            const currentNode = filteredData.nodes.find(n => n.slug === currentSlug);
            return currentNode && targetId === currentNode.id;
        }).map(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
            return filteredData.nodes.find(n => n.id === sourceId)!;
        }).filter(Boolean);

        // Deduplicate nodes
        return Array.from(new Map(nodes.map(node => [node.id, node])).values());
    }, [filteredData, currentSlug]);

    return {
        data,
        filteredData,
        showExternal,
        setShowExternal,
        internalMentions,
        externalMentions,
        internalReferences
    };
};
