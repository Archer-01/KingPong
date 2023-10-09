'use client';
import Header from '@/app/(dashboard)/Header';
import ChatSideBar from '@/app/chat/ChatSideBar';
import { Channels, DMList } from '@/app/chat/data/ChatData';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import React, { useContext, useEffect, useState } from 'react';
import { ToggleContext } from '../layout';
import { set } from 'react-hook-form';

export default function DMLayout({ children }: { children: React.ReactNode }) {
    const {toggle, setToggle} = useContext(ToggleContext);
    const matches = useMediaQuery('(min-width: 1024px)');
    const [isRendred, setIsRendred] = useState<boolean>(false);

    useEffect(() => {
        setIsRendred(true);
    }, []);

    if (!isRendred) {
        return null;
    }

    if (matches) {
        return (
            <div className="flex flex-col bg-background h-screen">
                <Header />
                <div className="flex-grow flex gap-4 p-6 h-full">
                    <div className="w-1/4">
                        <ChatSideBar
                            messagesList={DMList}
                            channelList={Channels}
                            toggle={toggle}
                            setToggle={setToggle}
                        />
                    </div>
                    <div className="flex-grow h-full">{children}</div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col bg-background h-screen">
            <Header />
            <div className="py-8 px-4 flex-grow">{children}</div>
        </div>
    );
}
