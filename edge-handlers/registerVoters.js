export function onRequest(event) {
  const area = event.request.headers.get('X-NF-Subdivision-Code'); //CA, NY
  let state = area ? area.toLowerCase() : "il";
  console.log(area)

  event.replaceResponse(async () => {
    console.log(event.request.url)
    const originResponse = await fetch(event.request);
		
    return originResponse;
  });
}