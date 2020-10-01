export function onRequest(ev) {
  ev.replaceResponse(() => fetch(ev.request));
}