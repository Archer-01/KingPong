import {
    BadRequestException,
    ImATeapotException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/user/user.service';
import { UpdateChannelDto } from './dto/update.channel.dto';

@Injectable()
export class ChatService {
    readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

    async getConversation(username1: string, username2: string) {
        const user1 = await this.prisma.user.findUnique({
            where: {
                username: username1,
            },
        });
        const user2 = await this.prisma.user.findUnique({
            where: {
                username: username2,
            },
        });

        if (!user1) {
            throw new NotFoundException(`User ${username1} does not exist`);
        }
        if (!user2) {
            throw new NotFoundException(`User ${username2} does not exist`);
        }

        const { isFriend, isMe } = await this.userService.isFriend(
            username1,
            username2,
        );
        if (isMe) {
            throw new ImATeapotException('You cannot message yourself');
        }
        if (!isFriend) {
            throw new BadRequestException(
                `User ${username1} is not friend with ${username2}`,
            );
        }

        const result = await this.prisma.dM.findFirst({
            where: {
                OR: [
                    {
                        AND: [
                            { user1: { username: username1 } },
                            { user2: { username: username2 } },
                        ],
                    },
                    {
                        AND: [
                            { user1: { username: username2 } },
                            { user2: { username: username1 } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                user1_first_message: true,
                user2_first_message: true,
                user1: {
                    select: { username: true },
                },
                user2: {
                    select: { username: true },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!result) {
            const newDM = await this.prisma.dM.create({
                data: {
                    user1: { connect: { username: username1 } },
                    user2: { connect: { username: username2 } },
                },
                select: {
                    user1: {
                        select: { username: true },
                    },
                    user2: {
                        select: { username: true },
                    },
                    messages: {
                        select: {
                            id: true,
                            content: true,
                            sender: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });
            return newDM;
        }

        const firstMessage =
            username1 === result.user1.username
                ? result.user1_first_message
                : result.user2_first_message;

        result.messages = result.messages.slice(firstMessage);
        return result;
    }

    async getBriefDMs(username: string) {
        const count = await this.prisma.user.count({
            where: {
                username,
            },
        });
        if (count == 0) {
            throw new NotFoundException(`User ${username} does not exist`);
        }

        const result = await this.prisma.dM.findMany({
            where: {
                OR: [
                    {
                        user1: { username },
                    },
                    {
                        user2: { username },
                    },
                ],
            },
            select: {
                id: true,
                user1_first_message: true,
                user2_first_message: true,
                user1: {
                    select: {
                        username: true,
                        avatar: true,
                        status: true,
                    },
                },
                user2: {
                    select: {
                        username: true,
                        avatar: true,
                        status: true,
                    },
                },
                messages: {
                    select: {
                        content: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        const filteredResult = result.filter((result) => {
            const firstMessage =
                username === result.user1.username
                    ? result.user1_first_message
                    : result.user2_first_message;

            const slicedMessages = result.messages.slice(firstMessage);
            return slicedMessages.length > 0;
        });

        return filteredResult;
    }

    async createMessage(
        content: string,
        senderUsername: string,
        receiverUsername: string,
    ) {
        const sender = await this.prisma.user.findFirst({
            where: { username: senderUsername },
            select: { id: true },
        });

        const receiver = await this.prisma.user.findFirst({
            where: { username: receiverUsername },
            select: { id: true },
        });

        let dm = await this.prisma.dM.findFirst({
            where: {
                OR: [
                    {
                        user1Id: sender.id,
                        user2Id: receiver.id,
                    },
                    {
                        user1Id: receiver.id,
                        user2Id: sender.id,
                    },
                ],
            },
            select: { id: true },
        });

        if (dm == null) {
            dm = await this.prisma.dM.create({
                data: {
                    user1: { connect: { id: sender.id } },
                    user2: { connect: { id: receiver.id } },
                },
            });
        }

        await this.prisma.message.create({
            data: {
                content,
                sender: { connect: { id: sender.id } },
                dm: { connect: { id: dm.id } },
            },
        });
    }

    async deleteDM(dmId: string, userId: string) {
        const count = await this.prisma.message.count({
            where: {
                dm_id: dmId,
            },
        });

        const dm = await this.prisma.dM.findUnique({
            where: {
                id: dmId,
            },
            select: {
                user1Id: true,
                user2Id: true,
                user1_first_message: true,
                user2_first_message: true,
            },
        });

        if (userId === dm.user1Id) {
            dm.user1_first_message = count;
        } else {
            dm.user2_first_message = count;
        }

        await this.prisma.dM.update({
            where: {
                id: dmId,
            },
            data: {
                user1_first_message: dm.user1_first_message,
                user2_first_message: dm.user2_first_message,
            },
        });
    }

    async getUserChannels(username: string) {
        return this.prisma.channel.findMany({
            where: {
                OR: [
                    {
                        owner: { username },
                    },
                    {
                        admins: {
                            some: { username },
                        },
                    },
                    {
                        members: {
                            some: { username },
                        },
                    },
                ],
            },
        });
    }

    async getChannel(channelName: string) {
        const channel = await this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                name: true,
                type: true,
                owner: {
                    select: { username: true },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: { avatar: true, username: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException(`Channel ${channelName} not found`);
        }
        return channel;
    }

    async getChannelMembers(channelName: string) {
        return this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true,
                        status: true,
                    },
                },
                admins: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true,
                        status: true,
                    },
                },
                members: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true,
                        status: true,
                    },
                },
            },
        });
    }

    async exploreChannels(username: string) {
        return this.prisma.channel.findMany({
            where: {
                AND: [
                    {
                        NOT: {
                            OR: [
                                { owner: { username } },
                                { admins: { some: { username } } },
                                { members: { some: { username } } },
                            ],
                        },
                    },
                    { NOT: { type: ChannelType.PRIVATE } },
                ],
            },
        });
    }

    async joinChannel(
        channelName: string,
        username: string,
        password?: string,
    ) {
        const channel = await this.prisma.channel.findFirst({
            where: {
                name: channelName,
                members: {
                    none: { username },
                },
            },
            select: {
                password: true,
                type: true,
                members: true,
            },
        });

        if (!channel) {
            throw new NotFoundException(
                `Channel ${channelName} not found or you are already in it`,
            );
        }

        if (channel.type === ChannelType.PROTECTED) {
            if (!password) {
                throw new BadRequestException(
                    `Channel ${channelName} is protected, you must provide a password`,
                );
            }

            if (!(await bcrypt.compare(password, channel.password))) {
                throw new UnauthorizedException('Invalid password');
            }
        }

        const user = await this.prisma.user.findFirst({
            where: { username },
            select: {
                id: true,
            },
        });

        await this.prisma.channel.update({
            where: { name: channelName },
            data: {
                members: { connect: { id: user.id } },
            },
        });
    }

    async createChannel(
        ownerName: string,
        name: string,
        type: string,
        password?: string,
    ) {
        // Protected channels must have a password
        if (type === 'PROTECTED' && !password) {
            throw new BadRequestException(
                'You must provide a password for a protected channel',
            );
        }

        // Public and private channels cannot have a password
        if (type !== 'PROTECTED' && password) {
            throw new BadRequestException(
                'You cannot provide a password for a public or private channel',
            );
        }

        // Check if channel already exists
        const channel = await this.prisma.channel.findFirst({
            where: { name },
        });
        if (channel) {
            throw new BadRequestException(
                `Channel ${name} already exists, please choose another name`,
            );
        }

        // Check if owner exists
        const owner = await this.prisma.user.findFirst({
            where: { username: ownerName },
            select: { id: true },
        });
        if (!owner)
            throw new NotFoundException(`User ${ownerName} does not exist`);

        const channelType =
            type === 'PUBLIC'
                ? ChannelType.PUBLIC
                : type === 'PROTECTED'
                ? ChannelType.PROTECTED
                : ChannelType.PRIVATE;

        return await this.prisma.channel.create({
            data: {
                name,
                type: channelType,
                password,
                owner: { connect: { id: owner.id } },
            },
        });
    }

    async sendMessageToChannel(
        channelName: string,
        username: string,
        content: string,
    ) {
        // Check if channel exists
        const channel = await this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                id: true,
                owner: true,
                admins: true,
                members: true,
                mutes: true,
                bannedUsers: true,
            },
        });
        if (!channel) {
            throw new NotFoundException(
                `Channel ${channelName} does not exist`,
            );
        }

        // Check if user exists
        const user = await this.prisma.user.findFirst({
            where: { username },
            select: { id: true },
        });
        if (!user) {
            throw new NotFoundException(`User ${username} does not exist`);
        }

        // Check if user is not banned
        if (channel.bannedUsers.some((user) => user.username === username)) {
            throw new BadRequestException(
                `User ${username} is banned from channel ${channelName}`,
            );
        }

        // Check if user is in channel
        if (
            username !== channel.owner.username &&
            channel.admins.every((admin) => admin.username !== username) &&
            channel.members.every((member) => member.username !== username)
        ) {
            throw new BadRequestException(
                `User ${username} is not in channel ${channelName}`,
            );
        }

        // Check if user is not muted
        if (channel.mutes.some((mutedUser) => mutedUser.id === user.id)) {
            throw new BadRequestException(
                `User ${username} is muted in channel ${channelName}`,
            );
        }

        return await this.prisma.channelMessage.create({
            data: {
                content,
                sender: { connect: { id: user.id } },
                channel: { connect: { id: channel.id } },
            },
        });
    }

    async deleteChannel(channelName: string, username: string) {
        const user = await this.prisma.user.findFirst({
            where: { username },
            select: { id: true },
        });

        if (!user) {
            throw new NotFoundException(`User ${username} not found`);
        }

        const channel = await this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                id: true,
                owner: {
                    select: { username: true },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException(`Channel ${channelName} not found`);
        }

        if (channel.owner.username !== username) {
            throw new UnauthorizedException(
                `User ${username} is not the owner of channel ${channelName}`,
            );
        }

        await this.prisma.channelMessage.deleteMany({
            where: { channelId: channel.id },
        });

        return await this.prisma.channel.delete({
            where: { id: channel.id },
        });
    }

    async leaveChannel(channelName: string, username: string) {
        const user = await this.prisma.user.findFirst({
            where: { username },
            select: { id: true },
        });

        if (!user) {
            throw new NotFoundException(`User ${username} not found`);
        }

        const channel = await this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                id: true,
                owner: {
                    select: { username: true },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException(`Channel ${channelName} not found`);
        }

        if (channel.owner.username === username) {
            throw new BadRequestException(
                `User ${username} is the owner of channel ${channelName}, cannot leave`,
            );
        }

        await this.prisma.channel.update({
            where: { id: channel.id },
            data: {
                members: {
                    disconnect: { id: user.id },
                },
                admins: {
                    disconnect: { id: user.id },
                },
            },
        });
    }

    async changeOwner(
        channelName: string,
        prevOwnerId: string,
        newOwnerUsename: string,
    ) {
        // Check if channel exists
        const channel = await this.prisma.channel.findFirst({
            where: { name: channelName },
            select: {
                owner: {
                    select: { id: true },
                },
            },
        });
        if (!channel) {
            throw new NotFoundException(
                `Channel ${channelName} does not exist`,
            );
        }

        // Check if request user is the real owner
        if (prevOwnerId !== channel.owner.id) {
            throw new UnauthorizedException(
                `You are not owner of the channel ${channelName}`,
            );
        }

        // Check if the new owner exists
        const newOwner = await this.prisma.user.findFirst({
            where: { username: newOwnerUsename },
        });
        if (!newOwner) {
            throw new NotFoundException(
                `User ${newOwnerUsename} does not exist`,
            );
        }

        // Check if the new owner is a member
        const isMember = await this.prisma.channel.findFirst({
            where: {
                name: channelName,
                OR: [
                    {
                        members: { some: { id: newOwner.id } },
                    },
                    {
                        admins: { some: { id: newOwner.id } },
                    },
                ],
            },
        });

        if (!isMember) {
            throw new BadRequestException(
                `User ${newOwnerUsename} is not a member in channel ${channelName}`,
            );
        }

        // Remove current owner and set new owner
        return await this.prisma.channel.update({
            where: { name: channelName },
            data: {
                owner: { connect: { id: newOwner.id } },
                members: {
                    connect: { id: prevOwnerId },
                    disconnect: { id: newOwner.id },
                },
                admins: {
                    disconnect: { id: newOwner.id },
                },
            },
        });

        // NOTE: If newOwner is the same as the current owner,
        // it will get replaced by itself
    }

    async editChannel(oldName: string, data: UpdateChannelDto) {
        this.logger.verbose(`Editing channel ${oldName}`);
        this.logger.verbose(`Data: ${JSON.stringify(data)}`);

        // Check if channel exists
        const channel = await this.prisma.channel.findFirst({
            where: { name: oldName },
        });
        if (!channel) {
            throw new NotFoundException(`Channel ${oldName} does not exist`);
        }

        // Check if the new name is not taken
        if (data.newName && data.newName !== oldName) {
            const channelWithNewName = await this.prisma.channel.findFirst({
                where: { name: data.newName },
            });
            if (channelWithNewName) {
                throw new BadRequestException(
                    `Channel '${data.newName}' already exists`,
                );
            }
        }

        // If new type is protected a password must be provided
        if (data.newType === 'PROTECTED' && !data.password) {
            throw new BadRequestException(
                'Password must be provided for protected channels',
            );
        }

        // If new type is public or private, password must not be provided
        if (data.newType !== 'PROTECTED' && data.password) {
            throw new BadRequestException(
                'Password must not be provided for public and protected channels',
            );
        }

        // Update channel data
        channel.name = data.newName ?? channel.name;
        channel.type = data.newType ?? channel.type;
        channel.password = data.password ?? channel.password;

        return await this.prisma.channel.update({
            where: { id: channel.id },
            data: { ...channel },
        });
    }
}
