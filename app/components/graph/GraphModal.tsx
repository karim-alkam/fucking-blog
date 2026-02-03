import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { GraphWindowHeader } from '../../posts/components/graph/GraphWindowHeader';
import { HomeGraphCanvas } from './HomeGraphCanvas';
import { GraphData } from './types';

interface GraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: GraphData;
    isForcesApplied: React.MutableRefObject<boolean>;
}

export function GraphModal({ isOpen, onClose, data, isForcesApplied }: GraphModalProps) {
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
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
                                className="w-[90vw] max-w-[1600px] h-[calc(100vh-8rem)] transform overflow-hidden bg-cyber-black border border-cyber-neon-cyan shadow-xl transition-all flex flex-col"
                            >
                                <GraphWindowHeader
                                    title="NEURAL_NET_MAX"
                                    onMaximize={() => { }}
                                    onMinimize={onClose}
                                    onClose={onClose}
                                />
                                <div className="flex-1 w-full h-full relative cursor-move bg-black" ref={modalContainerRef}>
                                    <HomeGraphCanvas
                                        width={modalDimensions.width}
                                        height={modalDimensions.height}
                                        data={data}
                                        isForcesApplied={isForcesApplied}
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
