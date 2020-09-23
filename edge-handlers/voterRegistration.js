export function onRequest(event) {
	event.respondWith(handler(event));
}

const handler = async (event) => {
  if (event.request.path == '/secret') {
		const resp = new Response('<h1>Access denied</h1>', {
			status: 404,
		});

		event.respondWith(resp);
  }
}