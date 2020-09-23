export async function onRequest(event) {
  if (event.request.path == '/secret' && !event.request.headers.get('Authorization')) {
    event.request.path = 'login';
  }
}