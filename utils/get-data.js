const cheerio = require("cheerio");
const axios = require("axios");
const { promises: fsPromises } = require("fs");

const states = {
  alabama: "al",
  alaska: "ak",
  "american samoa": "as",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  "district of columbia": "dc",
  florida: "fl",
  georgia: "ga",
  guam: "gu",
  hawaii: "hi",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  "new hampshire": "nh",
  "new jersey": "nj",
  "new mexico": "nm",
  "new york": "ny",
  "north carolina": "nc",
  "north dakota": "nd",
  "northern mariana islands": "mp",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  pennsylvania: "pa",
  "puerto rico": "pr",
  "rhode island": "ri",
  "south carolina": "sc",
  "south dakota": "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  "virgin islands": "vi",
  virginia: "va",
  washington: "wa",
  "west virginia": "wv",
  wisconsin: "wi",
  wyoming: "wy",
};

async function main() {
  let registration = {};
  for (state in states) {
    let lookup = states[state];
    try {
      let details = {};
      let dates = ["online", "mail", "in person"];
      let links = ["online", "mail"];
      const response = await axios.get(`https://vote.gov/register/${lookup}/`);
      const $ = cheerio.load(response.data);
      const info = $(".voter-info");
      const resources = $(".registered-resources");
      let datedatas = {};
      resources.find("span").each(function (index, el) {
        datedatas[`${dates[index]}`] = $(el).parent().text().replace(/\s/g, "");
      });

      let linkdatas = {};
      info.find("a").each((ind, el) => {
        linkdatas[`${links[ind]}`] = $(el).attr("href").replace("?ref=voteusa", "");
        // console.log($(el).attr("href").replace("?ref=voteusa", ""));
      });

      registration[states[state]] = {
        linkdatas,
        datedatas,
      };
    } catch (err) {
      console.log(err);
    }
  }

  let data = JSON.stringify(registration, null);
  await fsPromises.writeFile("states.json", data);
}

main();
