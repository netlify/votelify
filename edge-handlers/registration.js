export function onRequest(event) {
  event.replaceResponse(async () => {
    const stateName = event.request.headers.get('X-NF-Subdivision-Name');
    const stateCode = event.request.headers.get('X-NF-Subdivision-Code');
    const airport = event.request.headers.get('X-NF-Availability-Zone');
    const country = event.request.headers.get('X-NF-Country-Name');
    const countryCode = event.request.headers.get('X-NF-Country-Code');
    const city = event.request.headers.get('X-NF-City-Name');


    const auth = event.request.headers.get('Authorization')

    console.log(`starting fetch from this url ${event.request.url}`)
    console.log(`geolocation headers state: ${stateName}, state: ${stateCode}, airport ${airport}, country ${country}, countryCode ${countryCode}, city: ${city}`);
    console.log(`reading from ${auth}`);
    console.log(`headers ${event.request.headers}`)

    let state = stateCode ? stateCode.toLowerCase() : "il";
    const originResponse = await fetch(new Request(`${event.request.url.replace("?#", "")}state/${state}`));

    const transformation = new TransformStream({
      flush(controller) {
        const encoder = new TextEncoder();
        const buf = encoder.encode("<p>Served from a Netlify Edge Handler</p>");
        controller.enqueue(buf);
      },
    });

    const transformedBody = originResponse.body.pipeThrough(transformation);
    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(transformedBody, { headers });
  });
}
