module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("src/css");
  
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