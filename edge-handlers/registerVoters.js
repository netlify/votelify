import { HTMLRewriter } from "../utils/html-rewriter";
const { readable, writable } = new TransformStream();

export function onRequest(event) {
  event.replaceResponse(async () => {
    const area = event.request.origin.subdivision;
    let state = area && area.code ? area.code.toLowerCase() : "ca";

    const url = new URL(event.request.url);
    url.pathname = `/state/${state}`;

    const originResponse = await fetch(url.toString());

    const transformedBody = new HTMLRewriter()
      .on("h1", elem => {
        elem.replace("Made by Netlify", "text");
      })
      .transformInto(originResponse)
		
    return transformedBody
  });
}