import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/socket"
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private users = new Map<string, { username: string, room: string }>();

  async handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
    this.users.delete(socket.id);
    const user = this.users.get(socket.id);
    if (user != null) return
    this.updateUserList(user.room);

  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(socket: Socket, payload: { username: string, room: string }) {
    socket.join(payload.room);
    this.users.set(socket.id, { username: payload.username, room: payload.room });

    this.updateUserList(payload.room);
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(socket: Socket, payload: { username: string, room: string }) {
    socket.leave(payload.room);
    this.users.delete(socket.id);

    this.updateUserList(payload.room);
  }

  private updateUserList(room: string) {
    const usersInRoom = Array.from(this.users.values())
      .filter(user => user.room === room)
      .map(user => user.username);

    const uniqueUsers = [...new Set(usersInRoom)];

    this.server.to(room).emit('user-list', uniqueUsers);
  }

  @SubscribeMessage('chat-room')
  async handleRoomMessage(socket: Socket, payload: { username: string, room: string, message: string }) {
    console.log(`Message from ${payload.username} in room ${payload.room}: ${payload.message}`);

    this.server.to(payload.room).emit('room-message', {
      username: payload.username,
      message: payload.message
    });
  }



  @SubscribeMessage('chat-image')
  async handleImageMessage(socket: Socket, payload: { username: string, room: string, image: string }) {
    console.log(`Image from ${payload.username} in room ${payload.room}`);

    this.server.to(payload.room).emit('room-image', {
      username: payload.username,
      image: payload.image
    });
  }
}
