export function onRequest(event) {
  const area = event.request.headers.get('X-NF-Subdivision-Code'); //CA, NY
  let state = area ? area.toLowerCase() : "il";

  event.replaceResponse(async () => {
    console.log(event.request.url)
    const originResponse = await fetch(new Request(`${event.request.url.replace("?#", "")}state/${state}`));

    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(originResponse, { headers });
  });
}