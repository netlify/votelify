export function onRequest(event) {
  event.replaceResponse(async () => {
    const area = event.request.origin.subdivision;
    let state = area && area.code ? area.code.toLowerCase() : "ca";

    const url = new URL(event.request.url);
    url.pathname = `/state/${state}`;

    const originResponse = await fetch(url.toString());
    const headers = { 'Content-Type': 'text/html' };

    return new Response(originResponse.body, { headers, status: 200 });
  });
}