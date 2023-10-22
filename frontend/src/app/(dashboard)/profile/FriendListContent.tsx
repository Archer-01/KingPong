import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

type FriendListContentProps = {
    username: string;
    status: string;
    avatar: string;
};

export default function FriendListContent({
    username,
    status,
    avatar,
}: FriendListContentProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['isFriend', username],
        queryFn: async () => {
            const res = await axios.get(`/api/user/isFriend/${username}`, {
                withCredentials: true,
            });
            return res.data;
        },
    });

    if (isLoading) return <div>Loading...</div>;

    let statusBg;
    let statusText;

    if (status === 'ONLINE') {
        statusBg = 'bg-online';
        statusText = 'text-online';
    } else if (status === 'OFFLINE') {
        statusBg = 'bg-silver';
        statusText = 'text-silver';
    } else {
        statusBg = 'bg-ingame';
        statusText = 'text-ingame';
    }

    return (
        <div className="flex items-center gap-8">
            <Link href={`/profile/${username}`} className="flex-shrink-0">
                <img
                    src={avatar}
                    alt={`${username}`}
                    className="w-24 h-24
						bg-background border-2 border-background
						rounded-full select-none"
                />
            </Link>
            <div className="flex flex-col items-start gap-1">
                <Link
                    href={`/profile/${username}`}
                    className="text-secondary-200 text-xl
							font-jost font-bold"
                >
                    {username}
                </Link>
                <p
                    className={`${statusText} flex items-center justify-center gap-1`}
                >
                    <div
                        className={`w-[12px] h-[12px] ${statusBg} rounded-full`}
                    />
                    {status.toLowerCase()}
                </p>

                {data.isFriend ? (
                    <Link
                        href={`/chat/dm/${username}`}
                        className="bg-background rounded-2xl px-4
						border border-white
						text-secondary-200 font-jost hover:bg-secondary-200 hover:text-background"
                    >
                        Message
                    </Link>
                ) : data.isMe ? null : (
                    <button
                        className="bg-background rounded-2xl px-4
						border border-white
						text-secondary-200 font-jost hover:bg-secondary-200 hover:text-background"
                    >
                        Invite
                    </button>
                )}
            </div>
        </div>
    );
}
