export function onRequest(event) {
  const area = event.request.headers.get('X-NF-Subdivision-Code');
  let state = area ? area.toLowerCase() : "il";
  event.replaceResponse(async () => {
    const originResponse = await fetch(new Request(`${event.request.url.replace("?#", "")}state/${state}`));

    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(originResponse, { headers });
  });
}