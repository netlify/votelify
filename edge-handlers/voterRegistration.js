export async function onRequest(event) {
  if (event.request.path == '/secret') {
    const resp = `<html>
    <head>
    </head>
    <body>
      YOU GOT PUNKED!
    </body>
    </html>`
    event.respondWith(200, resp, {})
  }
}