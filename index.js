const axios = require("axios").default;
const cheerio = require("cheerio");
const fs = require("fs");

const userAgents = [
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; x64; fr; rv:1.9.2.13) Gecko/20101203 Firebird/3.6.13",
  "Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; rv:2.2) Gecko/20110201",
  "Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16",
  "Mozilla/5.0 (Windows NT 5.2; RW; rv:7.0a1) Gecko/20091211 SeaMonkey/9.23a1pre",
];
const getUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// helpers

const links = [
  "https://www.amazon.com.br/gp/product/B0872Y93TY",
  "https://www.amazon.com.br/dp/B07ZZW745X",
  "https://www.amazon.com.br/dp/B08C1K6LB2",
  "https://www.amazon.com.br/dp/B0872Y93TY",
  "https://www.amazon.com.br/dp/B07PDHSJ1H",
  "https://www.amazon.com.br/Novo-Echo-Dot-4%C2%AA-gera%C3%A7%C3%A3o/dp/B084DWCZY6",
  "https://www.amazon.com.br/dp/B08HSRTHLR",
  "https://www.amazon.com.br/dp/B082FTRR76",
  "https://www.amazon.com.br/dp/B085RNT8B9",
  "https://www.amazon.com.br/dp/B084Q2651T",
  "https://www.amazon.com.br/Kindle-10a-gera%C3%A7%C3%A3o-ilumina%C3%A7%C3%A3o-embutida/dp/B07FQK1TS9",
  "https://www.amazon.com.br/Kindle-Paperwhite-8GB-%C3%A0-prova-d%C2%B4%C3%A1gua/dp/B0773XBMB6",
  "https://www.amazon.com.br/Capa-Novo-Kindle-10A-Gera%C3%A7%C3%A3o/dp/B07TJVG1X9",
  "https://www.amazon.com.br/gp/product/8532520839",
  "https://www.amazon.com.br/gp/product/8551001523",
  "https://www.amazon.com.br/gp/product/8576088509",
  "https://www.amazon.com.br/gp/product/6586057256",
  "https://www.amazon.com.br/Kit-Potes-para-Alimentos-Electrolux/dp/B0784CLYGQ",
  "https://www.amazon.com.br/Coza-One-Cesta-Organiza%C3%A7%C3%A3o-Tampa/dp/B08KT5GPTL",
];

const readInput = () => {
  console.log(">> Reading input");
  const file = fs.readFileSync("./input.txt", { encoding: "utf-8" });
  const lines = file.split("\n");
  console.log(`   - lines found: ${lines.length}`);
  return lines;
};

const downloadPage = async (link) => {
  const { data: html } = await axios.get(link, {
    headers: {
      "User-Agent": getUA(),
    },
  });
  return html;
};

const scrap = (html) => {
  const $ = cheerio.load(html);
  const price = $("#price_inside_buybox")
    .text()
    .replace(new RegExp("\\n", "g"), "");
  const priceAlt = $("#price").text().replace(new RegExp("\\n", "g"), "");
  const name = $("#title").text().replace(new RegExp("\\n", "g"), "");
  return {
    price: price.length ? price : priceAlt,
    name: name,
  };
};

const output = (data) => {
  console.log(">> Generating output");
  const date = new Date();
  const fileName = `${date.getFullYear()}_${
    date.getMonth() + 1
  }_${date.getDate()}.txt`;
  console.log(`   - save as ${fileName}`);
  fs.writeFileSync(`./out/${fileName}`, data.join("\n"));
};

const main = async () => {
  console.log(">> Process started");

  const input = await readInput();
  const data = [];
  for (let idx in input) {
    console.log(`>> Item ${parseInt(idx) + 1}/${input.length} started`);
    const html = await downloadPage(input[idx]);
    const result = await scrap(html);
    data.push(result.price);
    await delay(3000);
    console.log(`>> Item ${parseInt(idx) + 1}/${input.length} finished`);
  }
  output(data);
  console.log(">> Done!");
};

main();

// test();
