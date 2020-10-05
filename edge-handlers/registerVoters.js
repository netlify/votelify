export function onRequest(event) {
  event.replaceResponse(async () => {
    const area = event.request.origin.subdivision;
    const { code } = event.request.origin.country;

    let url = new URL(event.request.url);

    if (code == "US") {
      let state = area && area.code ? area.code.toLowerCase() : "ca";
      url.pathname = `/state/${state}`;
    }

    return fetch(url.toString());
  });
}
