// backend/services/eventHub.js
// High-performance real-time event dispatcher supporting Server-Sent Events (SSE)

const clients = new Set();

export const registerClient = (res) => {
  clients.add(res);
  res.on("close", () => {
    clients.delete(res);
  });
};

export const broadcastEvent = (eventType, data) => {
  const payload = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    try {
      client.write(`event: ${eventType}\n`);
      client.write(`data: ${payload}\n\n`);
    } catch (err) {
      clients.delete(client);
    }
  }
};

export const getConnectedClientsCount = () => clients.size;
