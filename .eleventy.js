const svgContents = require("eleventy-plugin-svg-contents");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("src/css");

  eleventyConfig.addPassthroughCopy("_headers");

  eleventyConfig.addPassthroughCopy({ "src/_includes/assets/favicon": "assets/favicon" });

  eleventyConfig.addFilter('getStateName', (state) => {
    let states = {
      "al": "Alabama",
      "ak": "Alaska",
      "as": "American Samoa",
      "az": "Arizona",
      "ar": "Arkansas",
      "ca": "California",
      "co": "Colorado",
      "ct": "Connecticut",
      "de": "Delaware",
      "dc": "District Of Columbia",
      "fm": "Federated States Of Micronesia",
      "fl": "Florida",
      "ga": "Georgia",
      "gu": "Guam",
      "hi": "Hawaii",
      "id": "Idaho",
      "il": "Illinois",
      "in": "Indiana",
      "ia": "Iowa",
      "ks": "Kansas",
      "ky": "Kentucky",
      "la": "Louisiana",
      "me": "Maine",
      "mh": "Marshall Islands",
      "md": "Maryland",
      "ma": "Massachusetts",
      "mi": "Michigan",
      "mn": "Minnesota",
      "ms": "Mississippi",
      "mo": "Missouri",
      "mt": "Montana",
      "ne": "Nebraska",
      "nv": "Nevada",
      "nh": "New Hampshire",
      "nj": "New Jersey",
      "nm": "New Mexico",
      "ny": "New York",
      "nc": "North Carolina",
      "nd": "North Dakota",
      "mp": "Northern Mariana Islands",
      "oh": "Ohio",
      "ok": "Oklahoma",
      "or": "Oregon",
      "pw": "Palau",
      "pa": "Pennsylvania",
      "pr": "Puerto Rico",
      "ri": "Rhode Island",
      "sc": "South Carolina",
      "sd": "South Dakota",
      "tn": "Tennessee",
      "tx": "Texas",
      "ut": "Utah",
      "vt": "Vermont",
      "vi": "Virgin Islands",
      "va": "Virginia",
      "wa": "Washington",
      "wv": "West Virginia",
      "wi": "Wisconsin",
      "wy": "Wyoming"
    }
    return states[state];
  })
  
  eleventyConfig.addFilter('addSpaces', (date) => {
    if (date) {
      return date.replace(/\,/g, ", ")
    }
  })

  eleventyConfig.addFilter('getSVGURL', (state) => {
    if (state) {
      return `/src/_includes/assets/${state.toUpperCase()}.svg`
      // return `/assets/${state.toUpperCase()}.svg`
    }
  })

  eleventyConfig.addPlugin(svgContents);

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  }
}