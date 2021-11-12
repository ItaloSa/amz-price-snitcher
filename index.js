const axios = require('axios').default;
const cheerio = require('cheerio');
const fs = require('fs');

const userAgents = [
  'Mozilla/5.0 (Windows; U; Windows NT 6.1; x64; fr; rv:1.9.2.13) Gecko/20101203 Firebird/3.6.13',
  'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
  'Mozilla/5.0 (Windows; U; Windows NT 6.1; rv:2.2) Gecko/20110201',
  'Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16',
  'Mozilla/5.0 (Windows NT 5.2; RW; rv:7.0a1) Gecko/20091211 SeaMonkey/9.23a1pre',
];
const getUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// helpers

const readInput = () => {
  console.log('>> Reading input');
  const file = fs.readFileSync('./input.txt', { encoding: 'utf-8' });
  const lines = file.split('\n');
  console.log(`   - lines found: ${lines.length}`);
  return lines;
};

const downloadPage = async (link) => {
  const { data: html } = await axios.get(link, {
    headers: {
      'User-Agent': getUA(),
    },
  });
  return html;
};

const scrap = (html) => {
  const $ = cheerio.load(html);
  const priceDiv = $('#corePrice_desktop')
  const price = $('span.a-offscreen', priceDiv)
    .text()
    .replace(new RegExp('\\n', 'g'), '');
  const priceAlt = $('#price').text().replace(new RegExp('\\n', 'g'), '');
  const name = $('#title').text().replace(new RegExp('\\n', 'g'), '');
  return {
    price: price.length ? price : priceAlt,
    name: name,
  };
};

const output = (data) => {
  if (!data.length) {
    console.log('>> No data... skipping');
    return;
  }
  console.log('>> Generating output');
  const date = new Date();
  const fileName = `${date.getFullYear()}_${
    date.getMonth() + 1
  }_${date.getDate()}.csv`;
  console.log(`   - save as ${fileName}`);
  fs.writeFileSync(`./out/${fileName}`, data.join('\n'));
};

const checks = () => {
  const input = fs.existsSync('./input.txt');
  if (!input) fs.writeFileSync('./input.txt', '#fill');
  const output = fs.existsSync('./out');
  if (!output) fs.mkdirSync('./out');

  if (!input) {
    console.log('>> Input file created. Please, fill the input.txt accordingly the readme');
  }

  if (!output) {
    console.log('>> No output folder found. Folder created');
  }

  return input && output;
};

const main = async () => {
  console.log('>> Process started!');
  if (!checks()) {
    console.log('>> Please, try it again');
    return
  }
  const input = await readInput();
  const data = ['name;price'];
  for (let idx in input) {

    if (input[idx] === '#fill') break;

    console.log(`>> Item ${parseInt(idx) + 1}/${input.length} started`);
    const html = await downloadPage(input[idx]);
    const result = await scrap(html);
    data.push(`${result.name};${result.price}`);
    await delay(3000);
    console.log(`>> Item ${parseInt(idx) + 1}/${input.length} finished`);
  }
  output(data);
  console.log('>> Done!');
};

module.exports = main;

if (require.main === module) {
  main();
}
