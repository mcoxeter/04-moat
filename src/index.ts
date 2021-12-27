#!/usr/bin/env node
import fs from 'fs';
const config = require('./config.json');

async function app() {
  var myArgs = process.argv.slice(2);

  for (const symbol of myArgs) {
    await evaluateStock(symbol);
  }
}

function evaluateStock(symbol: string): void {
  const path = `${config.path}/${symbol}`;

  const requiredPaths = [path, `${path}/04-moat`];
  const nowDate = new Date();
  const padNum = (num: number) => num.toString().padStart(2, '0');

  const nowDateStr = `${nowDate.getFullYear()}.${padNum(
    nowDate.getMonth() + 1
  )}.${padNum(nowDate.getDate())}`;

  requiredPaths.forEach((p) => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
  });

  const lastDataFile = fs
    .readdirSync(`${path}/01-data`)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a))
    .find(() => true);

  const stats = require(`${path}/01-data/${lastDataFile}`);
  const annual = stats.data.data.financials.annual;
  if (annual.revenue.length < 10) {
    throw new Error('Company has not been reporting results for 10 years');
  }

  const periods: number[] = lastNFromArray<string>(
    10,
    stats.data.data.financials.annual.period_end_date
  )
    .map((x) => x.split('-')[0])
    .map((x) => Number(x));

  const revenue10 = lastNFromArray<number>(10, annual.revenue);
  const dilutedEPS10 = lastNFromArray<number>(10, annual.eps_diluted);
  const equity10 = lastNFromArray<number>(10, annual.total_equity);

  const fcf10 = add_values(
    lastNFromArray(10, annual.cf_cfo),
    lastNFromArray(10, annual.cfi_ppe_purchases)
  );

  const revenueAnalysis = analyseCAGR(
    'Revenue Compound Annual Growth Rate(CAGR).',
    periods,
    revenue10,
    1
  );

  const dilutedEPSAnalysis = analyseCAGR(
    'Diluted EPS Compound Annual Growth Rate(CAGR).',
    periods,
    dilutedEPS10,
    1
  );

  const equityAnalysis = analyseCAGR(
    'Equity Compound Annual Growth Rate(CAGR). Found on the balance sheet. This is considered the most important indicator of a moat.',
    periods,
    equity10,
    2
  );

  const fcfAnalysis = analyseCAGR(
    'Free Cash Flow(FCF) Compound Annual Growth Rate(CAGR). This is considered the second most important indicator of a moat.',
    periods,
    fcf10,
    1.5
  );

  let moat = {
    type: '04-moat',
    symbol,
    description:
      'This estabishes if a company has a moat by looking backwards at key figures to see if the company has been running well and unintrupted by competitors.',
    references: [
      {
        displayName:
          'Section 3 - Competitive advantage; Step 2: Do the numbers agree?: 02:46',
        url: 'https://profitful.online/courses/introduction-to-stock-analysis'
      }
    ],
    date: nowDateStr,
    revenueAnalysis,
    dilutedEPSAnalysis,
    equityAnalysis,
    fcfAnalysis,
    score:
      revenueAnalysis.score +
      dilutedEPSAnalysis.score +
      equityAnalysis.score +
      fcfAnalysis.score
  };

  console.log('Writing ', `${path}/04-moat/${nowDateStr}.json`);
  try {
    fs.writeFileSync(
      `${path}/04-moat/${nowDateStr}.json`,
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
}

function scoreCAGR(values: number[], weightAdjustment: number): IScoreCAGR {
  const [val10, val05, val01] = values;

  // We want all to be over 10%
  // Score up/down in multiples of 10%

  const tenYearScore = Math.floor(val10 / 10);
  const fiveYearScore = Math.floor(val05 / 10);
  const oneYearScore = Math.floor(val01 / 10);
  const totalScore = Math.floor(tenYearScore + fiveYearScore + oneYearScore);

  return {
    basis: [...values],
    weightAdjustment,
    tenYearScore,
    fiveYearScore,
    oneYearScore,
    totalScore
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

function lastNFromArray<T>(n: number, values: T[]): T[] {
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

interface IReference {
  displayName: string;
  url: string;
}

interface IAnalysis {
  description: string;
  reference: IReference[];
  redFlags: string[];
  greenFlags: string[];

  score: number;
}
interface IRevenueAnalysis extends IAnalysis {
  periods: number[];
  values: number[];
  usableValues: number[];
  usableValuesNotes: string;
  weightAdjustment: number;
  weightAdjustmentNotes: string;
  firstValue: number;
  midValue: number;
  secondLastValue: number;
  lastValue: number;
  CAGR10Years: number;
  CAGR5Years: number;
  CAGRLastYear: number;
  valuesIncreasingScoreNotes: string;
  valuesIncreasingScore: number;
  CAGRScore: IScoreCAGR;
}

function analyseCAGR(
  type: string,
  periods: number[],
  values: number[],
  weightAdjustment: number
): IRevenueAnalysis {
  // We have seen some situations where we get zero values.
  // These need to be filtered out.
  const usableValues = values.filter((x) => x !== 0);
  const firstValue = usableValues[0];
  const lastValue = usableValues[usableValues.length - 1];
  const secondLastValue = usableValues[usableValues.length - 2];
  const midValue = usableValues[Math.round(usableValues.length / 2 - 1)];

  const CAGR10Years = cagr(firstValue, lastValue, usableValues.length);
  const CAGR5Years = cagr(midValue, lastValue, usableValues.length / 2);
  const CAGRLastYear = cagr(secondLastValue, lastValue, 2);
  let redFlags: string[] = [];
  let greenFlags: string[] = [];

  if (usableValues.length !== 10) {
    redFlags.push(
      'Values have been filtered becuase they contian zero values. This is a less accurate result.'
    );
  }

  const CAGRScore = scoreCAGR(
    [CAGR10Years, CAGR5Years, CAGRLastYear],
    weightAdjustment
  );

  const valuesIncreasingScore = scoreIncreasing(values) > 6 ? 1 : 0;
  const score = Math.floor(
    (CAGRScore.totalScore + valuesIncreasingScore) * weightAdjustment
  );

  return {
    description: `${type} Scoring up and down in 10% intervals. We want at least 10%.`,
    greenFlags,
    redFlags,
    reference: [],
    periods,
    values,
    usableValues,
    usableValuesNotes:
      'Sometimes we get values that are zero, these need to be filtered out into usableValues.',
    firstValue,
    midValue: midValue,
    secondLastValue,
    lastValue,
    weightAdjustment,
    weightAdjustmentNotes:
      'A weight adjustment is used to incread the score for the more important figures.',
    CAGR10Years,
    CAGR5Years,
    CAGRLastYear,
    valuesIncreasingScore,
    valuesIncreasingScoreNotes:
      'If there are over 6 years of increasing values, then a point is awarded',
    CAGRScore,
    score
  };
}

// function cagr(start: number, end: number) {
//   // CAGR = Compound Annual Growth Rate
//   // https://www.investopedia.com/terms/c/cagr.asp
//   return Math.round((Math.pow(end / start, 0.5) - 1) * 100);
// };

function cagr(start: number, end: number, number: number) {
  // CAGR = Compound Annual Growth Rate
  // https://www.investopedia.com/terms/c/cagr.asp
  // http://fortmarinus.com/blog/1214/

  const step1 = end - start + Math.abs(start);
  const step2 = step1 / Math.abs(start);
  const step3 = Math.pow(step2, 1 / number);
  const step4 = (step3 - 1) * 100;

  return Math.round(step4);
}

app();
