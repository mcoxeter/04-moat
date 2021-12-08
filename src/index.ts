#!/usr/bin/env node
import { on } from 'events';
import fs from 'fs';

async function app() {
  var myArgs = process.argv.slice(2);
  const symbol = myArgs[0];

  const path = `C:/Users/Mike/OneDrive - Digital Sparcs/Investing/Value Investing Process/Business analysis/Evaluation/${symbol}/`;

  const requiredPaths = [path, `${path}/moat`];
  const nowDate = new Date();
  const padNum = (num: number) => num.toString().padStart(2, '0');

  // const cagr = (start: number, end: number) => {
  //   // CAGR = Compound Annual Growth Rate
  //   // https://www.investopedia.com/terms/c/cagr.asp
  //   return Math.round((Math.pow(end / start, 0.5) - 1) * 100);
  // };

  const cagr = (start: number, end: number, number: number) => {
    // CAGR = Compound Annual Growth Rate
    // https://www.investopedia.com/terms/c/cagr.asp
    // http://fortmarinus.com/blog/1214/

    const step1 = end - start + Math.abs(start);
    const step2 = step1 / Math.abs(start);
    const step3 = Math.pow(step2, 1 / number);
    const step4 = (step3 - 1) * 100;

    return Math.round(step4);
  };

  const nowDateStr = `${nowDate.getFullYear()}.${padNum(
    nowDate.getMonth() + 1
  )}.${padNum(nowDate.getDate())}`;

  requiredPaths.forEach((p) => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
  });

  const lastDataFile = fs
    .readdirSync(`${path}/core`)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a))
    .find(() => true);

  const stats = require(`${path}/core/${lastDataFile}`);
  const annual = stats.data.data.financials.annual;
  if (annual.revenue.length < 10) {
    throw new Error('Company has not been reporting results for 10 years');
  }

  const revenue10 = lastNFromArray(10, annual.revenue);
  const dilutedEPS10 = lastNFromArray(10, annual.eps_diluted);
  const equity10 = lastNFromArray(10, annual.total_equity);

  const fcf10 = add_values(
    lastNFromArray(10, annual.cf_cfo),
    lastNFromArray(10, annual.ppe_net)
  );

  // CAGR = Compound Annual Growth Rate
  const revenue10CAGR = cagr(revenue10[0], revenue10[9], 10);
  const revenue05CAGR = cagr(revenue10[4], revenue10[9], 5);
  const revenue01CAGR = cagr(revenue10[8], revenue10[9], 2);

  const dilutedEPS10CAGR = cagr(dilutedEPS10[0], dilutedEPS10[9], 10);
  const dilutedEPS05CAGR = cagr(dilutedEPS10[4], dilutedEPS10[9], 5);
  const dilutedEPS01CAGR = cagr(dilutedEPS10[8], dilutedEPS10[9], 2);

  const equity10CAGR = cagr(equity10[0], equity10[9], 10);
  const equity05CAGR = cagr(equity10[4], equity10[9], 5);
  const equity01CAGR = cagr(equity10[8], equity10[9], 2);

  const fcf10CAGR = cagr(fcf10[0], fcf10[9], 10);
  const fcf05CAGR = cagr(fcf10[4], fcf10[9], 5);
  const fcf01CAGR = cagr(fcf10[8], fcf10[9], 2);

  const revenueIncreasingScore = scoreIncreasing(revenue10);
  const dilutedIncreasingScore = scoreIncreasing(dilutedEPS10);
  const equityIncreasingScore = scoreIncreasing(equity10);
  const fcfSIncreasingcore = scoreIncreasing(fcf10);

  const revenueCAGRScore = scoreCAGR(
    [revenue10CAGR, revenue05CAGR, revenue01CAGR],
    1
  );
  const dilutedEPSCAGRScore = scoreCAGR(
    [dilutedEPS10CAGR, dilutedEPS05CAGR, dilutedEPS01CAGR],
    1
  );

  // Equity growth is the strongest value for determining a good moat.
  // Therefor we give this a boost of 1.5
  const equityCAGRScore = scoreCAGR(
    [equity10CAGR, equity05CAGR, equity01CAGR],
    1.5
  );

  // FCF is the second strongest value for a moat
  // Therefor we give this a boost of 1.2
  const fcfCAGRScore = scoreCAGR([fcf10CAGR, fcf05CAGR, fcf01CAGR], 1.2);

  let moat = {
    type: 'moat',
    symbol,
    revenue10,
    dilutedEPS10,
    equity10,
    fcf10,
    revenueCAGRScore,
    dilutedEPSCAGRScore,
    equityCAGRScore,
    fcfCAGRScore,
    revenueIncreasingScore,
    dilutedIncreasingScore,
    equityIncreasingScore,
    fcfSIncreasingcore,
    score:
      revenueCAGRScore.totalScoreAdjusted +
      dilutedEPSCAGRScore.totalScoreAdjusted +
      equityCAGRScore.totalScoreAdjusted +
      fcfCAGRScore.totalScoreAdjusted +
      revenueIncreasingScore +
      dilutedIncreasingScore +
      equityIncreasingScore +
      fcfSIncreasingcore
  };

  console.log('Writing ', `${path}moat/${nowDateStr}.json`);
  try {
    fs.writeFileSync(
      `${path}/moat/${nowDateStr}.json`,
      JSON.stringify(moat, undefined, 4)
    );
  } catch (err) {
    console.error(err);
  }
}

interface IScoreCAGR {
  basis: number[];
  tenYearScore: number;
  fiveYearScore: number;
  oneYearScore: number;
  weightAdjustment: number;

  totalScore: number;
  totalScoreAdjusted: number;
}

function scoreCAGR(values: number[], weightAdjustment: number): IScoreCAGR {
  const [val10, val05, val01] = values;

  // We want all to be over 10%
  // Score up/down in multiples of 10%

  const tenYearScore = Math.floor(val10 / 10);
  const fiveYearScore = Math.floor(val05 / 10);
  const oneYearScore = Math.floor(val01 / 10);
  const totalScore = Math.floor(tenYearScore + fiveYearScore + oneYearScore);
  const totalScoreAdjusted = Math.floor(
    (tenYearScore + fiveYearScore + oneYearScore) * weightAdjustment
  );

  return {
    basis: [...values],
    weightAdjustment,
    tenYearScore,
    fiveYearScore,
    oneYearScore,
    totalScore,
    totalScoreAdjusted
  };
}

function scoreIncreasing(values: number[]): number {
  const [, ...ahead] = values;

  let score = 0;

  for (let i = 0; i < ahead.length; i++) {
    const current = values[i];
    const next = ahead[i];
    if (next > current) {
      score++;
    }
  }
  return score;
}

function lastNFromArray(n: number, values: number[]): number[] {
  return values.slice(-n);
}

function add_values(values1: number[], values2: number[]): number[] {
  if (values1.length !== values2.length) {
    throw new Error('values have different lengths');
  }

  let result: number[] = [];
  for (let i = 0; i < values1.length; i++) {
    result = [...result, values1[i] + values2[i]];
  }
  return result;
}

app();
