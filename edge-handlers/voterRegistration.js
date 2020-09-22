import voterData from "voterReg.json";
import cheerio from "cheerio";

export function onRequest(event) {
	event.respondWith(handler(event));
}

const handler = async (event) => {
	const area = event.request.headers.get('X-NF-Subdivision-Code');
  const stateData = voterData[area.toLowerCase()]

  if (stateData) {
    const originalResp = await fetch(event.request);
    const $ = cheerio.load(originalResp);
    $(".register-online a").text(`${stateData.links.online}`)
    $(".register-by-mail a").text(`${stateData.links.mail}`)
    const response = new Response($.html(), {
      status: 200
    })
    event.respondWith(response);
  }
}