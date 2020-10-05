export function onRequest(event) {
  const { code } = event.request.origin.country;
  
  if (code == "US") {
    let { code: state } = event.request.origin.subdivision;

    let url = new URL(event.request.url);
    url.pathname = `/state/${ state ? state.toLowerCase() : "ca" }`;

    event.replaceResponse(async () => await fetch(url.toString()));
  }
}
