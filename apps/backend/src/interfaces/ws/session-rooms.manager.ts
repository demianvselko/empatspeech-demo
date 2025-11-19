import type { Socket } from 'socket.io';

export function addClientToRoom(
  sessionRooms: Map<string, Set<string>>,
  sessionId: string,
  clientId: string,
): void {
  const set = sessionRooms.get(sessionId) ?? new Set<string>();
  set.add(clientId);
  sessionRooms.set(sessionId, set);
}

export function removeClientFromAllRooms(
  sessionRooms: Map<string, Set<string>>,
  client: Socket,
): void {
  for (const [sessionId, clients] of sessionRooms.entries()) {
    if (clients.delete(client.id) && clients.size === 0) {
      sessionRooms.delete(sessionId);
    }
  }
}
