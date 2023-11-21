import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Body, Collision, Common, Engine } from 'matter-js';
import { PongTable } from '../utils/PongTable';
import { Ball } from '../utils/Ball';
import { Paddle } from '../utils/Paddle';
import { UserService } from 'src/user/user.service';
import { emit } from 'process';
import { GameService } from '../game.service';
import { status } from '../game.enum';

enum Direction {
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none',
}

type matchQueueProps = {
    player1: {
        username: string;
        socket: string;
        score1: number;
    };
    player2: {
        username: string;
        socket: string;
        score2: number;
    };
    status: status;
};

@Injectable()
export class RankedService {
    constructor(private readonly gameService: GameService) {}

    async sendToClients(
        client1: Socket,
        client2: Socket,
        data1: any,
        data2: any,
        emitedEvent: string,
    ) {
        client1.emit(emitedEvent, data1);
        client2.emit(emitedEvent, data2);
    }

    async updataData(matchQueue: any, client1?: Socket, client2?: Socket) {
        this.sendToClients(
            client1,
            client2,
            {
                winner:
                    matchQueue.player1.score1 == 7
                        ? matchQueue.player1.username
                        : matchQueue.player2.username,
                player1: matchQueue.player1.username,
                player2: matchQueue.player2.username,
                player1_score: matchQueue.player1.score1,
                player2_score: matchQueue.player2.score2,
                iWin: matchQueue.player1.score1 == 7,
            },
            {
                winner:
                    matchQueue.player2.score2 == 7
                        ? matchQueue.player2.username
                        : matchQueue.player1.username,
                player2: matchQueue.player2.username,
                player1: matchQueue.player1.username,
                player2_score: matchQueue.player2.score2,
                player1_score: matchQueue.player1.score1,
                iWin: matchQueue.player2.score2 == 7,
            },
            'finished',
        );
        // add the match to the database
        this.gameService.AddMatch(
            matchQueue.player1.username,
            matchQueue.player2.username,
            true,
            matchQueue.player1.score1,
            matchQueue.player2.score2,
        );
        // update the database
        this.gameService.updatePlayerScore({
            player1: matchQueue.player1.username,
            player2: matchQueue.player2.username,
            ranked: true,
            player1_score: matchQueue.player1.score1,
            player2_score: matchQueue.player2.score2,
        });
    }

    startGame(
        client1: Socket,
        client2: Socket,
        player1: any,
        player2: any,
        matchQueue: matchQueueProps,
    ) {
        const playerSpeed = 10;
        const initialBallSpeed = 5;
        let ballSpeed = 5;
        console.log('start game');
        const canvas = { width: 500, height: 800 };
        const engine = Engine.create({ gravity: { x: 0, y: 0 } });
        const world = engine.world;
        const table = new PongTable(canvas.width, canvas.height, world);
        table;
        const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, world, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            inertia: Infinity,
            angle: 0,
            angularSpeed: 0,
            angularVelocity: 0,
            velocity: { x: 0, y: 0 },
        });
        setTimeout(() => {
            Body.setVelocity(ball.body, { x: 0, y: ballSpeed });
        }, 2000);

        const topPaddle = new Paddle(canvas.width / 2, 50, 100, 20, world, {
            isStatic: true,
        });
        const bottomPaddle = new Paddle(
            canvas.width / 2,
            canvas.height - 50,
            100,
            20,
            world,
            { isStatic: true },
        );
        const frameRate = 1000 / 60;
        matchQueue.status = 'PLAYING';
        this.sendToClients(
            client1,
            client2,
            {
                canvas,
                frameRate,
                topPaddle: { width: topPaddle.w, height: topPaddle.h },
                bottomPaddle: { width: bottomPaddle.w, height: bottomPaddle.h },
                ball: { radius: ball.r },
            },
            {
                canvas,
                frameRate,
                topPaddle: { width: topPaddle.w, height: topPaddle.h },
                bottomPaddle: { width: bottomPaddle.w, height: bottomPaddle.h },
                ball: { radius: ball.r },
            },
            'canvas',
        );

        const orPair = (x: number, y: number) => {
            const random = Common.random(-10, 10);
            if (random < 0) {
                return x;
            }
            return y;
        };

        let randomStart = {
            x: Common.random(-ballSpeed, ballSpeed),
            y: orPair(-ballSpeed, ballSpeed),
        };

        let counter = 0;

        const interval = setInterval(() => {
            Engine.update(engine, frameRate);

            const ballPos = ball.body.position;
            const revsBallPos = {
                x: canvas.width - ballPos.x,
                y: canvas.height - ballPos.y,
            };
            const topPaddlePos = topPaddle.body.position;
            const revTopPaddlePos = {
                x: canvas.width - topPaddlePos.x,
                y: canvas.height - topPaddlePos.y,
            };
            const bottomPaddlePos = bottomPaddle.body.position;
            const revBottomPaddlePos = {
                x: canvas.width - bottomPaddlePos.x,
                y: canvas.height - bottomPaddlePos.y,
            };

            if (counter === 6 && ballSpeed < 16) {
                counter = 0;
                ballSpeed += 1;
            }

            if (matchQueue.status === 'CANCEL') {
                return clearInterval(interval);
            }
            if (
                matchQueue.player1.score1 == 7 ||
                matchQueue.player2.score2 == 7
            ) {
                matchQueue.status = 'END';
                this.updataData(matchQueue, client1, client2);
                console.log('game ended');
                return clearInterval(interval);
            }

            const getXVelocity = (xContact: number, paddle: Matter.Body) => {
                const paddleContact = xContact - paddle.position.x;

                const xVelocity =
                    (paddleContact / (bottomPaddle.w / 2)) * ballSpeed;

                const ballXVelocity = ball.body.velocity.x;

                if (ballXVelocity * xVelocity >= 0) {
                    const tot = Math.abs(ballXVelocity) + Math.abs(xVelocity);
                    if (tot > ballSpeed) {
                        if (xVelocity < 0) {
                            return -ballSpeed;
                        }
                        return ballSpeed;
                    }
                    return xVelocity + ballXVelocity;
                }
                const tot = xVelocity - ballXVelocity;
                if (tot < -ballSpeed) {
                    return xVelocity;
                }
                return xVelocity - ballXVelocity;
            };
            let col: Collision;
            if ((col = Collision.collides(ball.body, topPaddle.body, null))) {
                const xContact = col.supports[0].x;
                counter++;
                Body.setVelocity(ball.body, {
                    x: getXVelocity(xContact, topPaddle.body),
                    y: ballSpeed + 1,
                });
            }
            if (
                (col = Collision.collides(ball.body, bottomPaddle.body, null))
            ) {
                const xContact = col.supports[0].x;
                counter++;
                Body.setVelocity(ball.body, {
                    x: getXVelocity(xContact, bottomPaddle.body),
                    y: -(ballSpeed + 1),
                });
            }

            const resetBall = () => {
                ballSpeed = initialBallSpeed;
                randomStart = {
                    x: Common.random(-ballSpeed, ballSpeed),
                    y: orPair(-ballSpeed, ballSpeed),
                };
                Body.setVelocity(ball.body, { x: 0, y: 0 });
                Body.setPosition(ball.body, {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                });
                setTimeout(() => {
                    Body.setVelocity(ball.body, {
                        x: randomStart.x,
                        y: randomStart.y,
                    });
                }, 1000);
            };

            if (Collision.collides(ball.body, table.topWall, null)) {
                matchQueue.player1.score1++;
                resetBall();
            }
            if (Collision.collides(ball.body, table.bottomWall, null)) {
                matchQueue.player2.score2++;
                resetBall();
            }

            this.sendToClients(
                client1,
                client2,
                {
                    ballPos,
                    topPaddlePos,
                    bottomPaddlePos,
                    username: player1.username,
                    score: {
                        top: matchQueue.player2.score2,
                        bottom: matchQueue.player1.score1,
                    },
                },
                {
                    ballPos: revsBallPos,
                    topPaddlePos: revBottomPaddlePos,
                    bottomPaddlePos: revTopPaddlePos,
                    username: player2.username,
                    score: {
                        top: matchQueue.player1.score1,
                        bottom: matchQueue.player2.score2,
                    },
                },
                'update-game',
            );
        }, frameRate);

        client1.on('disconnect', () => {
            console.log('client1 disconnected');
            matchQueue.status = 'CANCEL';
            clearInterval(interval);
        });
        client2.on('disconnect', () => {
            console.log('client2 disconnected');
            matchQueue.status = 'CANCEL';
            clearInterval(interval);
        });

        client1.on('move-right', (player: string) => {
            if (player === player1.username) {
                if (
                    bottomPaddle.body.position.x + playerSpeed >
                    canvas.width - 50
                )
                    return;
                Body.setPosition(bottomPaddle.body, {
                    x: bottomPaddle.body.position.x + playerSpeed,
                    y: bottomPaddle.body.position.y,
                });
            } else if (player === player2.username) {
                if (topPaddle.body.position.x - playerSpeed < 50) return;
                Body.setPosition(topPaddle.body, {
                    x: topPaddle.body.position.x - playerSpeed,
                    y: topPaddle.body.position.y,
                });
            }
        });

        client2.on('move-right', (player: string) => {
            if (player === player2.username) {
                if (topPaddle.body.position.x - playerSpeed < 50) return;
                Body.setPosition(topPaddle.body, {
                    x: topPaddle.body.position.x - playerSpeed,
                    y: topPaddle.body.position.y,
                });
            } else if (player === player1.username) {
                if (
                    bottomPaddle.body.position.x + playerSpeed >
                    canvas.width - 50
                )
                    return;
                Body.setPosition(bottomPaddle.body, {
                    x: bottomPaddle.body.position.x + playerSpeed,
                    y: bottomPaddle.body.position.y,
                });
            }
        });
        client1.on('move-left', (player: string) => {
            if (player === player1.username) {
                if (bottomPaddle.body.position.x - playerSpeed < 50) return;
                Body.setPosition(bottomPaddle.body, {
                    x: bottomPaddle.body.position.x - playerSpeed,
                    y: bottomPaddle.body.position.y,
                });
            } else if (player === player2.username) {
                if (topPaddle.body.position.x + playerSpeed > canvas.width - 50)
                    return;
                Body.setPosition(topPaddle.body, {
                    x: topPaddle.body.position.x + playerSpeed,
                    y: topPaddle.body.position.y,
                });
            }
        });

        client2.on('move-left', (player: string) => {
            if (player === player2.username) {
                if (topPaddle.body.position.x + playerSpeed > canvas.width - 50)
                    return;
                Body.setPosition(topPaddle.body, {
                    x: topPaddle.body.position.x + playerSpeed,
                    y: topPaddle.body.position.y,
                });
            } else if (player === player1.username) {
                if (bottomPaddle.body.position.x - playerSpeed < 50) return;
                Body.setPosition(bottomPaddle.body, {
                    x: bottomPaddle.body.position.x - playerSpeed,
                    y: bottomPaddle.body.position.y,
                });
            }
        });
    }
}
