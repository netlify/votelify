export async function onRequest(event) {
  // const area = event.request.headers.get('X-NF-Subdivision-Code');
  // event.request.url = `/state/${area.toLowerCase()}`;
  const response = new Response(null, {
    headers: {
      "Location": "https://votelify.edge-handlers.dev/state/il"
    },
    status: 301
  })

  event.replaceResponse(response);
}
