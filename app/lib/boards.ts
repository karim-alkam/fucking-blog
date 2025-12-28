import fs from 'fs';
import path from 'path';

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

export function getDrawingsForBoard(board: string): string[] {
    const boardDir = path.join(process.cwd(), 'drawings', board);
    try {
        const drawings = fs.readdirSync(boardDir)
            .filter((name) => name.endsWith('.excalidraw'))
            .map((name) => name.replace(/\.excalidraw$/, ''));

        // Sort naturally (numeric aware)
        return drawings.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } catch {
        return [];
    }
}
