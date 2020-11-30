export function onRequest(event) {
  const { code } = event.request.origin.country;
  console.log(code)

  if (code === "US") {
    const { code: state } = event.request.origin.subdivision;

    // let url = new URL(event.request.url);
    // url.pathname = `/state/${state ? state.toLowerCase() : "ca"}`;

    // event.replaceResponse(() => fetch(url.toString()));
  }
}
