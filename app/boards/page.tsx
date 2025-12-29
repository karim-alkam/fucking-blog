import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import HeroBoards from './components/HeroBoards';
import { getBoards } from '../lib/boards';


export const metadata = {
  title: "VISUAL_DB",
};

export default async function BoardsPage() {
  const boards = getBoards();
  return (
    <>
      <HeroBoards />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-row items-center mb-12 border-b border-cyber-gray pb-4">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 mr-4 border border-cyber-gray text-cyber-neon-cyan hover:bg-cyber-neon-cyan hover:text-cyber-black transition-all group">
            <ArrowLeftIcon className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-display font-bold text-cyber-white uppercase tracking-wider">
              Available Boards
            </h1>
            <p className="text-cyber-gray-light font-mono text-sm mt-1">Select a workspace to view drawings</p>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="p-8 border border-dashed border-cyber-gray text-center text-cyber-gray-light font-mono">
            NO_BOARDS_DETECTED
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board}
                href={`/boards/${encodeURIComponent(board)}`}
                className="group block"
              >
                <div className="cyber-card p-6 h-full flex flex-col justify-between min-h-[160px] bg-cyber-dark-gray/50 hover:bg-cyber-dark-gray">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-cyber-neon-purple font-mono text-xs border border-cyber-neon-purple/30 px-2 py-0.5">BOARD_ID</span>
                      <div className="w-2 h-2 bg-cyber-neon-yellow rounded-full opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(252,238,10,0.8)] transition-all"></div>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-cyber-white group-hover:text-cyber-neon-cyan transition-colors uppercase truncate">
                      {board.replace(/-/g, ' ')}
                    </h3>
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <span className="text-xs font-mono text-gray-500 group-hover:text-cyber-neon-cyan transition-colors mr-2">ACCESS &gt;&gt;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}