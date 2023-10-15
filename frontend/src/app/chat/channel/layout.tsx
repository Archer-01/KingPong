'use client';
import Header from '@/app/(dashboard)/Header';
import ChatSideBar from '@/app/chat/ChatSideBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ToggleContext } from '../layout';
import { usePathname } from 'next/navigation';
import path from 'path';
import ChannelSideBar from '../ChannelSideBar';
import Modal from '../Modal';
import { AiFillCloseCircle } from 'react-icons/ai';

type ChannelModalContextProps = {
    showMembers: boolean;
    setShowMembers: (value: boolean) => void;
};

export const ChannelModalContext = createContext(
    {} as ChannelModalContextProps,
);

export default function DMLayout({ children }: { children: React.ReactNode }) {
    const { toggle, setToggle } = useContext(ToggleContext);
    const matches = useMediaQuery('(min-width: 1024px)');
    const [isRendred, setIsRendred] = useState<boolean>(false);
    const [showMembers, setShowMembers] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsRendred(true);
    }, []);

    if (!isRendred) {
        return null;
    }

    if (matches) {
        return (
            <>
                <div className="flex flex-col bg-background min-h-screen">
                    <Header />
                    <div
                        className="flex gap-4 p-6 h-[90vh]
                            mt-[110px]"
                    >
                        <div className="w-1/4">
                            <ChatSideBar
                                toggle={toggle}
                                setToggle={setToggle}
                            />
                        </div>
                        <ChannelModalContext.Provider
                            value={{ showMembers, setShowMembers }}
                        >
                            <div className="w-3/4">{children}</div>
                        </ChannelModalContext.Provider>
                        {showMembers && (
                            <div className="w-1/4 max-w-[250px]">
                                <ChannelSideBar
                                    channelName={path.basename(pathname)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            {showMembers && (
                <Modal
                    onClose={() => setShowMembers(false)}
                    childrenClassName="h-[80vh] w-[70vw]"
                >
                    <button
                        className="fixed -top-10 left-1/2"
                        onClick={() => setShowMembers(false)}
                    >
                        <AiFillCloseCircle className="text-4xl text-red-400" />
                    </button>
                    <ChannelSideBar channelName={path.basename(pathname)} />
                </Modal>
            )}
            <div className="flex flex-col bg-background min-h-screen">
                <Header />
                <div
                    className="flex py-8 px-4 h-[90vh]
                        mt-[110px]"
                >
                    <ChannelModalContext.Provider
                        value={{ showMembers, setShowMembers }}
                    >
                        <div className="flex-grow">{children}</div>
                    </ChannelModalContext.Provider>
                </div>
            </div>
        </>
    );
}
