export function onRequest(event) {
  event.replaceResponse(async () => {
    const originResponse = await fetch(event.request);
    
    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(originResponse, { headers });
  });
}
