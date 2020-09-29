export async function onRequest(event) {
  // const area = event.request.headers.get('X-NF-Subdivision-Code');
  // event.request.url = `/state/${area.toLowerCase()}`;

  const transformer = new TransformStream({
    transform(chunk, controller) {
      console.log(`transforming chunk of size ${chunk.byteLength}`);
      const encoder = new TextEncoder();
      const buf = encoder.encode("(transformed)");
      controller.enqueue(chunk);
      controller.enqueue(buf);
    }
  });

  event.replaceResponse(async () => {
    console.log(`starting fetch to ${event.request.url}`);
    const originResponse = await fetch(event.request);

    if (!originResponse.ok) {
      throw new Error("Response not ok");
    }

    return new Response(originResponse.body.pipeThrough(transformer), {
      headers: {
        "content-type": "text/plain"
      }
    })
  });
}
