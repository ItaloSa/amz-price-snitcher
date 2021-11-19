const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const fs = require('fs');
const stringHash = require('string-hash');

const scraper = require('./index');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let cronJob = null;

const loadConfig = () => {
  if (!fs.existsSync('./config.json')) {
    return null;
  }
  const data = fs.readFileSync('./config.json');
  return JSON.parse(data);
};

const loadPrevData = () => {
  if (!fs.existsSync('./out/data.json')) {
    return {};
  }
  const data = fs.readFileSync('./out/data.json');
  return JSON.parse(data);
};

const saveData = (data) => {
  fs.writeFileSync('./out/data.json', JSON.stringify(data));
};

const compare = (currData, prevData) => {
  const result = currData.reduce(
    (store, item) => {
      const hash = stringHash(item.name);
      const prevValue = prevData[hash];

      if (!prevValue) {
        store.items[hash] = item;
        store.changes = [...store.changes, item];
      } else {
        if (item.price !== prevValue.price) {
          const change = { ...item, prevPrice: prevValue.price };
          store.changes = [...store.changes, change];
          store.items[hash] = item;
        }
      }
      return store;
    },
    { items: prevData, changes: [] },
  );
  return result;
};

const updateMessage = (product) => {
  return {
    content: `:warning: **ATENÇÃO** :warning: \n\nO produto **${product.name}** mudou o preço de ~~${product.prevPrice}~~ para **${product.price}** :money_with_wings: \n\n :link: - ${product.link}`,
  };
};

const newProductMessage = (product) => {
  return {
    content: `:star2:  **NOVIDADES** :star2: \n\nO produto **${product.name}** acabou de entrar pra lista por **${product.price}** \n\n :link: - ${product.link}`,
  };
};

const publishChanges = async (url, changes) => {
  for (let item of changes) {
    let msg;
    if (item.prevPrice) {
      msg = updateMessage(item);
    } else {
      msg = newProductMessage(item);
    }
    axios.post(url, msg);
    await delay(3000);
  }
};

const job = async (cronJob) => {
  console.log('>> JOB STARTED')
  const config = loadConfig();
  if (!config) {
    console.log('>> No config file found. Try again');
    return;
  };

  const data = await scraper(true);
  const prevData = loadPrevData();

  if (data.length) {
    const compareResult = compare(data, prevData);
    saveData(compareResult.items);
    publishChanges(config.webhook, compareResult.changes);
  }
  console.log('>> JOB FINISHED')
  console.log(`>> Next run at ${cronJob.nextDate().toISOString()}`)
};

const main = () => {
  console.log('>> CRON STARTED')
  cronJob = new CronJob(
    '0/30 * * * *', // every 30 minute
    () => job(cronJob),
    null,
    true,
    'America/Sao_Paulo',
  );
  cronJob.start();
  console.log(`>> Next run at ${cronJob.nextDate().toISOString()}`)
}

main()


// job();
