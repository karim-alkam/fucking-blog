import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { GraphWindowHeader } from '../../posts/components/graph/GraphWindowHeader';
import { HomeGraphCanvas } from './HomeGraphCanvas';
import { GraphData } from './types';
import { GraphSettings } from './GraphSettings';

interface GraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: GraphData;
    isForcesApplied: React.MutableRefObject<boolean>;
    activeFilters: Record<string, boolean>;
    toggleFilter: (type: string) => void;
}

export function GraphModal({ isOpen, onClose, data, isForcesApplied, activeFilters, toggleFilter }: GraphModalProps) {
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const [modalDimensions, setModalDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (!isOpen) return;

        const updateModalSize = () => {
            if (modalContainerRef.current) {
                setModalDimensions({
                    width: modalContainerRef.current.offsetWidth,
                    height: modalContainerRef.current.offsetHeight
                });
            }
        };

        const timer = setTimeout(updateModalSize, 100);

        const resizeObserver = new ResizeObserver(() => updateModalSize());

        if (modalContainerRef.current) {
            resizeObserver.observe(modalContainerRef.current);
        }

        window.addEventListener('resize', updateModalSize);

        return () => {
            window.removeEventListener('resize', updateModalSize);
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [isOpen]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/90" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-[90vw] max-w-[1600px] h-[calc(100vh-8rem)] transform overflow-hidden glass-panel bg-void-black/90 border border-brass/20 shadow-2xl transition-all flex flex-col relative"
                            >
                                <GraphWindowHeader
                                    title="CONSTELLATION_MAP_EXPANDED"
                                    onMaximize={() => { }}
                                    onMinimize={onClose}
                                    onClose={onClose}
                                />
                                <div className="flex-1 w-full h-full relative cursor-move bg-transparent" ref={modalContainerRef}>
                                    <HomeGraphCanvas
                                        width={modalDimensions.width}
                                        height={modalDimensions.height}
                                        data={data}
                                        isForcesApplied={isForcesApplied}
                                        onNodeClick={() => onClose()}
                                    />
                                    <GraphSettings
                                        filters={activeFilters}
                                        onToggle={toggleFilter}
                                        className="!absolute !top-4 !right-4"
                                        alwaysShowOnDesktop
                                    />
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
