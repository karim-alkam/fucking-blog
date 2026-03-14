import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { getBoards, getDrawingsForBoard } from '../../lib/boards';
import AnalyticsEvents from '../../components/AnalyticsEvents';
import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../../lib/constants';

export async function generateStaticParams() {
  const boards = getBoards();
  if (boards.length === 0) {
    return [{ board: 'empty' }];
  }
  return boards.map((board) => ({ board: encodeURIComponent(board) }));
}

interface PageProps {
  params: Promise<{
    board: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const boardName = decodeURIComponent(params.board);
  const title = `BOARD: ${boardName}`;
  const fullTitle = `${title} // KARIM`;
  const description = `Explore engineering drawings and whiteboards in the ${boardName} collection.`;
  const url = `${BASE_URL}/boards/${params.board}`;

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
          alt: `Board: ${boardName}`,
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

export default async function BoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  const drawings = getDrawingsForBoard(board);
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen">
      <AnalyticsEvents eventName="board_view" eventParams={{ board_id: board }} />
      <div className="flex flex-col mb-12">
        <Link href="/boards" className="self-start inline-flex items-center text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors mb-6 group font-mono text-sm tracking-wider uppercase">
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Boards
        </Link>
        <div className="border-b border-cyber-gray pb-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cyber-white uppercase tracking-wider relative inline-block">
            <span className="glitch" data-text={`BOARD: ${board.replace(/-/g, ' ')}`}>BOARD: {board.replace(/-/g, ' ')}</span>
          </h1>
          <p className="text-cyber-gray-light font-mono mt-2 text-sm">
            SYSTEM_ID: {board} {'//'} STATUS: ACTIVE
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.length === 0 && (
          <li className="col-span-full py-12 text-center border border-dashed border-cyber-gray">
            <span className="text-cyber-gray-light font-mono text-lg">NO DATA FOUND</span>
          </li>
        )}
        {drawings.map((drawing) => (
          <li key={drawing}>
            <Link href={`/boards/${encodeURIComponent(board)}/${encodeURIComponent(drawing)}`}
              className="block cyber-card p-6 h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-cyber-neon-cyan font-mono text-xs border border-cyber-neon-cyan/30 px-2 py-0.5 rounded-sm">
                  DRAWING
                </span>
                <div className="w-2 h-2 bg-cyber-neon-green rounded-full opacity-50 group-hover:opacity-100 shadow-[0_0_8px_rgba(57,255,20,0.8)] transition-all"></div>
              </div>
              <h3 className="text-xl font-display font-bold text-cyber-white group-hover:text-cyber-neon-yellow transition-colors mb-2">
                {drawing.replace(/-/g, ' ')}
              </h3>
              <div className="mt-4 flex items-center text-xs font-mono text-cyber-gray-light group-hover:text-cyber-neon-cyan transition-colors">
                ACCESS_FILE
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 