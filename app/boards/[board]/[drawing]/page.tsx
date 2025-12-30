import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import ExcalidrawBoardViewer from '../../components/ExcalidrawBoardViewer';
import { getBoards, getDrawingsForBoard, getDrawingContent } from '../../../lib/boards';
import AnalyticsEvents from '../../../components/AnalyticsEvents';

export async function generateStaticParams() {
  const boards = getBoards();
  const params: { board: string; drawing: string }[] = [];

  for (const board of boards) {
    const drawings = getDrawingsForBoard(board);
    for (const drawing of drawings) {
      params.push({ board, drawing });
    }
  }
  return params;
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ board: string, drawing: string }> }) {
  const { drawing } = await params;
  const decodedDrawing = decodeURIComponent(drawing).replace(/-/g, ' ');
  return {
    title: `DRAWING: ${decodedDrawing}`,
  };
}

export default async function DrawingPage({ params }: { params: Promise<{ board: string, drawing: string }> }) {
  const { board, drawing } = await params;
  const initialData = getDrawingContent(board, drawing);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen flex flex-col">
      <AnalyticsEvents eventName="drawing_view" eventParams={{ board_id: board, drawing_id: drawing }} />
      <div className="flex flex-col mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyber-gray pb-4">
          <div className="flex items-center gap-4">
            <Link href={`/boards/${encodeURIComponent(board)}`} className="inline-flex items-center justify-center text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group" aria-label="Back to board">
              <ArrowLeftIcon className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-cyber-white uppercase tracking-wider">
              {drawing.replace(/-/g, ' ')}
            </h1>
          </div>
          <span className="text-xs font-mono text-cyber-gray-light mt-2 md:mt-0 uppercase">
            DRAWING_VIEWER_V1.0
          </span>
        </div>
      </div>

      <div className="flex-1 bg-cyber-dark-gray overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-neon-purple via-cyber-neon-cyan to-cyber-neon-purple opacity-50"></div>
        <ExcalidrawBoardViewer initialData={initialData} />
      </div>
    </div>
  );
}