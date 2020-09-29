export function onRequest(event) {
  event.replaceResponse(async () => {
    const area = event.request.headers.get('X-NF-Subdivision-Code');
    console.log(`starting fetch from this url ${event.request.url}`)
    let state = area ? area.toLowerCase() : "il";
    const originResponse = await fetch(new Request(`${event.request.url.replace("?#", "")}state/${state}`));

    const transformation = new TransformStream({
      flush(controller) {
        const encoder = new TextEncoder();
        const buf = encoder.encode("<p>Served from a Netlify Edge Handler</p>");
        controller.enqueue(buf);
      },
    });

    const transformedBody = originResponse.body.pipeThrough(transformation);
    const headers = { 'Content-Type': 'text/plain' };
		
    return new Response(transformedBody, { headers });
  });
}
