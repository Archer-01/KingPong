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
    queueChallenge: {
        id: string;
        Challenger: { username: string; socket: string };
        Opponent: { username: string; socket: string };
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
        const finishedGame = (data: {
            user: any;
            player1: any;
            player2: any;
        }) => {
            const winner =
                data.user.username === data.player1.username
                    ? data.player2
                    : data.player1;
            const loser =
                data.user.username === data.player1.username
                    ? data.player1
                    : data.player2;
            this.server
                .to(winner.socket)
                .emit('game-stop', { opponent: loser.username });
            console.log('winner: ', winner);
            console.log('loser: ', loser);
        };
        const match = this.queueChallenge.find((match) => {
            return (
                match.Challenger.username === user.username ||
                match.Opponent.username === user.username
            );
        });
        if (match) {
            this.queueChallenge = this.queueChallenge.filter(
                (matches) =>
                    matches.Challenger.username !== match.Challenger.username &&
                    matches.Opponent.username !== match.Opponent.username,
            );
            finishedGame({
                user,
                player1: match.Challenger,
                player2: match.Opponent,
            });
        }
        const player = this.queueInMatch.find((player) => {
            return (
                player.player1.username === user.username ||
                player.player2.username === user.username
            );
        });
        console.log('disconnect player: ', player);
        console.log('the user is: ', user);
        if (player && player !== undefined) {
            this.queueInMatch = this.queueInMatch.filter(
                (players) =>
                    players.player1.username !== player.player1.username &&
                    players.player2.username !== player.player2.username,
            );
            finishedGame({
                user,
                player1: player.player1,
                player2: player.player2,
            });
            // this.server.to(player.player1.socket).emit('gameOver');
            //disconnect the all the plyers sockets in the seem match
        }
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
        // remove all the users with '' username
        this.connectedUsers = this.connectedUsers.filter(
            (user) => user.username !== '',
        );
        console.log(`+++++ [Game] Register... ${username}`);
        const user = this.connectedUsers.find(
            (user) => user.username === username,
        );
        if (!user) {
            console.log(
                `++++++[Game] Registered ${username} for the first time`,
            );
            this.connectedUsers.push({
                username: username,
                sockets: socket.id,
                id: socket.id,
            });
        } else {
            // change username in connected users
            user.username = username;
            user.sockets = socket.id;
            user.id = socket.id;
            console.log(`++++++[Game] Registered ${username} in another tab`);
            console.log(this.connectedUsers);
        }
    }

    @SubscribeMessage('game-over')
    async handleRemoveMatchMaking(
        @MessageBody()
        {
            player1,
            player2,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            score1,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            score2,
        }: {
            player1: string;
            player2: string;
            score1: number;
            score2: number;
        },
    ) {
        const player = this.queueInMatch.find((player) => {
            return (
                (player.player1.username === player1 &&
                    player.player2.username === player2) ||
                (player.player1.username === player2 &&
                    player.player2.username === player1)
            );
        });

        this.queueInMatch = this.queueInMatch.filter(
            (players) =>
                players.player1.username !== player.player1.username &&
                players.player2.username !== player.player2.username,
        );
        const client1 = this.server.sockets.get(player.player1.socket);
        const client2 = this.server.sockets.get(player.player2.socket);
        client1.disconnect(true);
        client2.disconnect(true);
    }

    @SubscribeMessage('join-game')
    async handlePlayComputer(
        @MessageBody() data: any,
        @ConnectedSocket() socket: Socket,
    ) {
        this.computerService.startGame(socket, data.mode);
    }

    @SubscribeMessage('matchmaking')
    async handleGame(@MessageBody() data: any) {
        console.log('data: ', data);
        const user = this.connectedUsers.find(
            (user) => user.username === data.username,
        );
        console.log('user: ', user);
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
            console.log('queue: ', queue);
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
        }
    }

    @SubscribeMessage('cancel-matchmaking')
    async handleCancelMatchmaking(@MessageBody() data: any) {
        const user = this.connectedUsers.find(
            (user) => user.username === data.username,
        );
        if (!user) return;
        const UserQueue = this.queue.find(
            (queue) => queue.username === data.username,
        );
        if (!UserQueue) return;
        this.queue = this.queue.filter(
            (queue) => queue.username !== data.username,
        );
    }

    @SubscribeMessage('challenge')
    async handleChallenge(
        @MessageBody() data: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @ConnectedSocket() socket: Socket,
    ) {
        const user = this.connectedUsers.find(
            (user) => user.username === data.Challenger,
        );
        if (!user) return;
        const match = this.queueChallenge.find((match) => {
            return match.id === data.id;
        });
        if (!match) {
            this.queueChallenge.push({
                id: data.id,
                Challenger: {
                    username: data.Challenger,
                    socket: user.sockets,
                },
                Opponent: {
                    username: data.Opponent,
                    socket: '',
                },
            });
        } else {
            match.Opponent.socket = user.sockets;
            match.Opponent.username = data.Challenger;
            console.log(this.queueChallenge);
            this.server.to(match.Challenger.socket).emit('matchmakingfound', {
                matchmaking: true,
                opponent: match.Opponent.username,
            });
            this.server.to(match.Opponent.socket).emit('matchmakingfound', {
                matchmaking: true,
                opponent: match.Challenger.username,
            });
            const client1 = this.server.sockets.get(match.Challenger.socket);
            const client2 = this.server.sockets.get(match.Opponent.socket);
            setTimeout(() => {
                this.rankedService.startGame(
                    client1,
                    client2,
                    match.Challenger,
                    match.Opponent,
                );
            }, 5000);
        }
        // const client1 = this.server.sockets.get(user.sockets);
        // const client2 = this.server.sockets.get(socket.id);
        // this.rankedService.startGame(client1, client2, user, socket);
    }
}
