export function onRequest(event) {
  const area = event.request.headers.get('X-NF-Subdivision-Code'); //CA, NY
  let state = area ? area.toLowerCase() : "il";
  console.log(area)

  event.replaceResponse(async () => {
    console.log(`${event.request.url.replace("?#", "")}state/${state}`)
    const originResponse = await fetch(`${event.request.url.replace("?#", "")}state/${state}`);

    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(originResponse.body, { headers, status: 200 });
  });
}