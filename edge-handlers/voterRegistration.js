export async function onRequest(event) {
  event.replaceResponse(async () => {
    const transformation = new TransformStream({
      flush(controller) {
        const encoder = new TextEncoder();
        const buf = encoder.encode("<p>Served from a Netlify Edge Handler</p>");
        controller.enqueue(buf);
      },
    });

    console.log(`starting fetch to ${event.request.url}`);
    const originResponse = await fetch(event.request);

    if (!originResponse.ok) {
      throw new Error("Response not ok");
    }

    return new Response(originResponse.body.pipeThrough(transformation), {
      headers: {
        "content-type": "text/plain"
      }
    })
  });
}
