import { HTMLRewriter } from "../utils/html-rewriter";

export function onRequest(event) {
  event.replaceResponse(async () => {
    const stateCode = event.request.headers.get('X-NF-Subdivision-Code');

    let state = stateCode ? stateCode.toLowerCase() : "ca";
    const originResponse = await fetch(new Request(`${event.request.url.replace("?#", "")}state/${state}`));

    const transformedBody = new HTMLRewriter()
      .on("footer", elem => {
        elem.replace("Made by Netlify", "text");
      })
      .transformInto(originResponse)

    const headers = { 'Content-Type': 'text/html' };
		
    return new Response(transformedBody, { headers });
  });
}
