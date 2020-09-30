export function onRequest(event) {
  event.replaceResponse(async () => {
    console.log("nothing to see here")
  });
}
