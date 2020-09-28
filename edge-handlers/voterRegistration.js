export async function onRequest(event) {
  await event.respondWith(handler(event));
}

const handler = async (event) => {
  const area = event.request.headers.get('X-NF-Subdivision-Code');
  event.request.path = `${event.request.path}/state/${area.toLowerCase()}`;
}