const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const categoryOrder = require("./src/_data/site.json").menuCategoryOrder;

const MENU_DIR = path.join(__dirname, "content/menu");

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // Static assets pass straight through to the output folder
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("media");
  eleventyConfig.addPassthroughCopy("admin");

  // Menu items live in /content/menu (outside src) so Decap CMS has one
  // clean folder to write to, separate from the page templates. Eleventy
  // only scans its `input` dir (src) for templates, so content/menu is
  // read directly off disk here instead of via the collection API.
  eleventyConfig.addWatchTarget("content/menu");
  eleventyConfig.addCollection("menu", function () {
    return fs
      .readdirSync(MENU_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const parsed = matter(fs.readFileSync(path.join(MENU_DIR, file), "utf8"));
        // Stable id for cart line items — title isn't guaranteed unique
        // across categories, so the filename slug is used instead.
        parsed.data.slug = file.replace(/\.md$/, "");
        return parsed;
      })
      .sort((a, b) => {
        const catA = categoryOrder.indexOf(a.data.category);
        const catB = categoryOrder.indexOf(b.data.category);
        if (catA !== catB) return catA - catB;
        return (a.data.order || 0) - (b.data.order || 0);
      });
  });

  // Groups the sorted menu collection into { "Category Name": [items] }
  // so the template can loop category -> items without extra logic.
  eleventyConfig.addFilter("groupByCategory", function (items) {
    const groups = {};
    items.forEach((item) => {
      const cat = item.data.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  });

  // Turns a menu item's optional "variants" frontmatter (a comma-separated
  // string, e.g. "BBQ, Búfalo, Mango Habanero") into a clean array for the
  // ordering cart's variant picker.
  eleventyConfig.addFilter("splitList", function (str) {
    return (str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
