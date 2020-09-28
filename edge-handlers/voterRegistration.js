export async function onRequest(event) {
  const area = event.request.headers.get('X-NF-Subdivision-Code');
  event.request.url = `/state/${area.toLowerCase()}`;
}
