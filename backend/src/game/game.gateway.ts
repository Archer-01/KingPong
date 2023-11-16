import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { ComputerService } from './computer/computer.service';
import { RankedService } from './ranked/ranked.service';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
    namespace: 'game',
})
export class GameGateway implements OnGatewayConnection {
    constructor(
        private readonly computerService: ComputerService,
        private readonly rankedService: RankedService,
        private readonly gameService: GameService,
        private readonly userService: UserService,
    ) {}
    @WebSocketServer() server: Namespace;
    connectedUsers: { id: string; username: string; sockets: string }[] = [];
    queue: { username: string; league: string; socket: string }[] = [];
    queueInMatch: {
        player1: { username: string; socket: string };
        player2: { username: string; socket: string };
    }[] = [];

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: any): string {
        client.emit('message', 'Hello world!');
        console.log('payload', payload);
        return 'Hello world!';
    }

    handleConnection(client: any) {
        if (!client.request.user) {
            client.disconnect(true);
            return;
        }
        const user = this.connectedUsers.find((user) => user.id === client.id);
        this.userService.updateUser({
            where: { email: client.request.user.email },
            data: {
                status: 'INGAME',
            },
        });

        if (!user) {
            console.log('new client', client.id);
            this.connectedUsers.push({
                id: client.id,
                sockets: client.id,
                username: '',
            });
        }
        client.emit('already-ingame', 'You are already connected');
        // else client.disconnect(true);

        // console.log('client', client.id);
        // this.computerService.startGame(client);
    }

    async handleDisconnect(socket: any) {
        const user = this.connectedUsers.find((user) => user.id === socket.id);
        console.log('disconnect', this.connectedUsers);
        if (!user) return;
        // remove user from queue
        const player = this.queueInMatch.find((player) => {
            return (
                player.player1.username === user.username ||
                player.player2.username === user.username
            );
        });
        if (player) {
            if (player.player1.username === user.username)
                this.server
                    .to(player.player2.socket)
                    .emit('opponentdisconnect');
            else
                this.server
                    .to(player.player1.socket)
                    .emit('opponentdisconnect');
            this.server.to(player.player1.socket).emit('gameOver');
        }
        this.queueInMatch = this.queueInMatch.filter(
            (players) =>
                players.player1.username !== player.player1.username &&
                players.player2.username !== player.player2.username,
        );
        console.log(`------[Game] Unregistered ${user.username} from one tab`);
        this.queue = this.queue.filter(
            (queue) => queue.username !== user.username,
        );
        // remove user from connected users
        this.connectedUsers = this.connectedUsers.filter(
            (users) => user.username !== users.username,
        );
        const us = await this.userService.user({
            email: socket.request.user.email,
        });
        if ((await this.server.in(us.id).fetchSockets()).length === 0) {
            await this.userService.updateUser({
                where: { email: us.email },
                data: {
                    status: 'OFFLINE',
                },
            });
        } else {
            await this.userService.updateUser({
                where: { email: us.email },
                data: {
                    status: 'ONLINE',
                },
            });
        }
    }

    @SubscribeMessage('register')
    async handleRegister(
        @MessageBody() username: string,
        @ConnectedSocket() socket: Socket,
    ) {
        console.log(`+++++ [Game] Register... ${username}`);
        const user = this.connectedUsers.find((user) => user.username === '');
        if (!user) {
            console.log(
                `++++++[Game] Registered ${username} for the first time`,
            );
            this.connectedUsers.push({
                username: username,
                sockets: socket.id,
                id: socket.id,
            });
        } else if (user.username === '') {
            // change username in connected users
            user.username = username;
            user.sockets = socket.id;
            console.log(`++++++[Game] Registered ${username} in another tab`);
            console.log(this.connectedUsers);
        } else {
            // disallow multiple connections
            if (user.sockets !== socket.id) {
                console.log(
                    `++++++[Game] ${username} already has a connection`,
                );
                socket.disconnect(true);
            }
        }
    }

    @SubscribeMessage('gameOver')
    async handleRemoveMatchMaking(
        @MessageBody()
        { player1, player2 }: { player1: string; player2: string },
    ) {
        const player = this.queueInMatch.find((player) => {
            return (
                player.player1.username === player1 ||
                player.player2.username === player2
            );
        });
        this.queueInMatch = this.queueInMatch.filter(
            (players) =>
                players.player1.username !== player.player1.username &&
                players.player2.username !== player.player2.username,
        );
    }

    @SubscribeMessage('join-game')
    async handlePlayComputer(
        @MessageBody() data: any,
        @ConnectedSocket() socket: Socket,
    ) {
        this.computerService.startGame(socket);
    }

    @SubscribeMessage('matchmaking')
    async handleGame(@MessageBody() data: any) {
        const user = this.connectedUsers.find(
            (user) => user.username === data.username,
        );
        if (!user) return;
        const UserQueue = this.queue.find(
            (queue) => queue.username === data.username,
        );
        if (!UserQueue) {
            this.queue.push({
                username: data.username,
                league: data.league,
                socket: user.sockets,
            });
            //filter queue by league if possible to match 2 players in the seem league
            const queue = this.queue.filter(
                (queue) => queue.league === data.league,
            );
            console.log('queue', queue.length);
            if (queue.length >= 2) {
                console.log('matchmaking 2 players found');
                this.server.to(queue[0].socket).emit('matchmakingfound', {
                    matchmaking: true,
                    opponent: queue[1].username,
                });
                this.server.to(queue[1].socket).emit('matchmakingfound', {
                    matchmaking: true,
                    opponent: queue[0].username,
                });
                this.queueInMatch.push({
                    player1: {
                        username: queue[0].username,
                        socket: queue[0].socket,
                    },
                    player2: {
                        username: queue[1].username,
                        socket: queue[1].socket,
                    },
                });
                this.queue = this.queue.filter(
                    (queues) =>
                        queues.username !== queue[0].username &&
                        queues.username !== queue[1].username,
                );
                const client1 = this.server.sockets.get(queue[0].socket);
                const client2 = this.server.sockets.get(queue[1].socket);
                // get socket if user has multiple tabs open
                setTimeout(() => {
                    this.rankedService.startGame(
                        client1,
                        client2,
                        queue[0],
                        queue[1],
                    );
                }, 5000);
            } else return;
            // console.log('matchmaking', data);
        }
    }
}
