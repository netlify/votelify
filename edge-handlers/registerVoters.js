/**
 * @typedef {import("@netlify/edge-handler-types")}
 * @type {EdgeHandler}
*/
export const onRequest = (event) => {
  const code = event.requestMeta.origin.country?.code;
  console.log(code)

  if (code === "US") {
    const state = event.requestMeta.origin.subdivision?.code;

    let url = new URL(event.requestMeta.url);
    url.pathname = `/state/${state ? state.toLowerCase() : "ca"}`;

    event.replaceResponse(() => fetch(url.toString()));
  }
}
