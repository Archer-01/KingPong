'use client';
import { useSocket } from '@/contexts/SocketContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Notif() {
    const { socket } = useSocket();
    const [hidden, setHidden] = useState(true);
    const [avatar, setAvatar] = useState('');
    const [message, setMessage] = useState('');
    const [ChallengeId, setChallengeId] = useState('');
    const [type, setType] = useState('');

    const { data: me, isLoading: myisLoading } = useQuery({
        queryKey: ['mydata'],
        queryFn: async () => {
            return await axios.get(`/api/user/me`, {
                withCredentials: true,
            });
        },
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        if (!myisLoading && socket)
            socket.on(
                'notif',
                ({
                    username,
                    type,
                    avatar,
                    ChallengeId,
                }: {
                    username: string;
                    type: string;
                    avatar: string;
                    ChallengeId: string;
                }) => {
                    console.log('notif received');
                    setHidden(false);
                    setAvatar(avatar);
                    setChallengeId(ChallengeId);
                    setType(type);
                    console.log('avatar: ', avatar);
                    if (type === 'FRIEND') {
                        setMessage(`${username} sent you a friend request`);
                    } else {
                        setMessage(`${username} invite to play`);
                    }
                    queryClient.invalidateQueries(['profile']);
                    queryClient.invalidateQueries(['ExestNotif']);

                    setTimeout(() => {
                        setHidden(true);
                    }, 5000);
                },
            );
    }, [socket]);

    return (
        <>
            {!hidden && (
                <Link href={'/notifications'} className="z-20">
                    <motion.div
                        className="absolute
						top-20 right-0
						bg-green-400 text-primary
						text-center font-jost
						px-4 py-2 rounded-xl
						rounded-l-full
						flex gap-2 items-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.1,
                            ease: [0, 0.71, 0.2, 1.01],
                        }}
                        whileHover={{ scale: 0.95 }}
                        onHoverStart={(e) => {}}
                        onHoverEnd={(e) => {}}
                        onClick={() => {
                            setHidden(true);
                        }}
                    >
                        <img
                            src={avatar}
                            alt="avatar"
                            className="rounded-full w-10 h-10"
                        />
                        <div className="flex flex-col justify-center items-center h-full">
                            <span className="text-lg font-light">
                                {message}
                            </span>
                        </div>
                    </motion.div>
                </Link>
            )}
        </>
    );
}
