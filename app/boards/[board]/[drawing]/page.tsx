import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import ExcalidrawBoardViewer from '../../components/ExcalidrawBoardViewer';
import { getBoards, getDrawingsForBoard, getDrawingContent } from '../../../lib/boards';

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
}

export default async function DrawingPage({ params }: { params: Promise<{ board: string, drawing: string }> }) {
  const { board, drawing } = await params;
  const initialData = getDrawingContent(board, drawing);

  return (
    <div className="p-4 mx-4 md:mx-0">
      <div className="flex flex-row items-center mb-4 gap-x-4">
        <Link href={`/boards/${encodeURIComponent(board)}`} className="inline-flex items-center justify-center w-10 h-10 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold ">{drawing.replace(/-/g, ' ')}</h1>
      </div>
      <ExcalidrawBoardViewer initialData={initialData} />
    </div>
  );
}