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
      params.push({ 
        board: encodeURIComponent(board), 
        drawing: encodeURIComponent(drawing)
      });
    }
  }
  
  // Next.js static exports crash if the `params` array is empty. 
  // If the user hasn't synced drawings yet, the folder is empty.
  if (params.length === 0) {
    return [{ board: 'empty', drawing: 'empty' }];
  }

  return params;
}

interface PageProps {
  params: Promise<{
    board: string;
    drawing: string;
  }>;
}

import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../../../lib/constants';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const boardName = decodeURIComponent(params.board);
  const drawingName = decodeURIComponent(params.drawing);
  const title = `DRAWING: ${drawingName}`;
  const fullTitle = `${title} // KARIM`;
  const description = `Interactive Excalidraw whiteboarding session: ${drawingName} from ${boardName}.`;
  const url = `${BASE_URL}/boards/${params.board}/${params.drawing}`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url,
      siteName: SITE_CONFIG.title,
      images: [
        {
          url: '/A-logo-w-bg.png',
          width: 4096,
          height: 4096,
          alt: `Drawing: ${drawingName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ['/A-logo-w-bg.png'],
      creator: SITE_CONFIG.twitterHandle,
    },
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