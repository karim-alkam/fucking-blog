import fs from 'fs';
import path from 'path';
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

export function getBoards(): string[] {
    const drawingsDir = path.join(process.cwd(), 'drawings');
    try {
        return fs.readdirSync(drawingsDir).filter((name) => {
            const fullPath = path.join(drawingsDir, name);
            return fs.statSync(fullPath).isDirectory();
        });
    } catch {
        return [];
    }
}

// 1. Filter out files starting with 'compressed_' for the list
export function getDrawingsForBoard(board: string): string[] {
    const boardDir = path.join(process.cwd(), 'drawings', board);
    try {
        const drawings = fs.readdirSync(boardDir)
            .filter((name) => name.endsWith('.excalidraw') && !name.startsWith('compressed_'))
            .map((name) => name.replace(/\.excalidraw$/, ''));

        // Sort naturally (numeric aware)
        return drawings.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } catch {
        return [];
    }
}

// 2. Prioritize reading compressed file
export function getDrawingContent(board: string, drawing: string): ExcalidrawInitialDataState | null {
    const boardDir = path.join(process.cwd(), 'drawings', board);
    const compressedPath = path.join(boardDir, `compressed_${drawing}.excalidraw`);
    const originalPath = path.join(boardDir, `${drawing}.excalidraw`);

    try {
        // Try compressed first
        if (fs.existsSync(compressedPath)) {
            const fileContent = fs.readFileSync(compressedPath, 'utf8');
            // The content is wrapped { compressed: true, data: "..." }
            // The client handles decompression.
            const data = JSON.parse(fileContent) as ExcalidrawInitialDataState;
            return data;
        }

        // Fallback to original
        const fileContent = fs.readFileSync(originalPath, 'utf8');
        const data = JSON.parse(fileContent) as ExcalidrawInitialDataState;
        return data;
    } catch {
        return null;
    }
}
