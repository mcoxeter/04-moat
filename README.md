# 04-moat

This program will score the business on the figures that show that it has a strong competitive advantage.

<p>The analysis examines the Compound Annual Growth Rate (CAGR) for the following areas:</p>

**Total Reveue**

> How much income the company recieves. This is on the income sheet.

**Diluted EPS**

> Diluted EPS is a calculation used to gauge the quality of a company's earnings per share (EPS) if all convertible securities were exercised.

**Equity**

> What's left over when you subtract all the liabilities from the assets. It's what the business owners actually own. This is on the balance sheet.

**Free Cash Flow**

> The cash a company generates after taking into consideration cash outflows that support its operations and maintain its capital assets.

## Setup

you need to create a config.json file. This will configure the program.
There is one parameter you need to add.

1. path - This is a folder path to where your output files will be stored on your harddisk.

This is an example of a config.json file:

```json
{
  "path": "C:/Business analysis/Evaluation"
}
```

## Usage

> Before you run this program, you will need to have run the `01-data` program first on the stock.

In this example the program will score the fundamental data on Facebook

`npm start -- FB`

## Output

The output of this program is scoring data in json form. It will be outputted into a sub folder of your path in the config file.

### Output folder structure

_path_/_stock-name_/04-moat/_date_.json

e.g.
C:/Business analysis/Evaluation/FB/04-moat/2021.12.18.json

### Example output

```
{
  "type": "04-moat",
  "symbol": "FB",
  "references": [],
  "date": "2021.12.21",
  "revenueAnalysis": {
    "description": "Revenue Compound Annual Growth Rate(CAGR). Scoring up and down in 10% intervals. We want at least 10%.",
    "greenFlags": [],
    "redFlags": [],
    "reference": [],
    "periods": [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    "values": [
      3711000000, 5089000000, 7872000000, 12466000000, 17928000000, 27638000000,
      40653000000, 55838000000, 70697000000, 85965000000
    ],
    "weightAdjustment": 1,
    "weightAdjustmentNotes": "A weight adjustment is used to incread the score for the more important figures.",
    "CAGR10Years": 37,
    "CAGR5Years": 37,
    "CAGRLastYear": 10,
    "valuesIncreasingScore": 1,
    "valuesIncreasingScoreNotes": "If there are over 6 years of increasing values, then a point is awarded",
    "CAGRScore": {
      "basis": [37, 37, 10],
      "weightAdjustment": 1,
      "tenYearScore": 3,
      "fiveYearScore": 3,
      "oneYearScore": 1,
      "totalScore": 7
    },
    "score": 8
  },
  "dilutedEPSAnalysis": {
    "description": "Diluted EPS Compound Annual Growth Rate(CAGR). Scoring up and down in 10% intervals. We want at least 10%.",
    "greenFlags": [],
    "redFlags": [],
    "reference": [],
    "periods": [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    "values": [0.31, 0.01, 0.6, 1.1, 1.29, 3.49, 5.39, 7.57, 6.43, 10.09],
    "weightAdjustment": 1,
    "weightAdjustmentNotes": "A weight adjustment is used to incread the score for the more important figures.",
    "CAGR10Years": 42,
    "CAGR5Years": 51,
    "CAGRLastYear": 25,
    "valuesIncreasingScore": 1,
    "valuesIncreasingScoreNotes": "If there are over 6 years of increasing values, then a point is awarded",
    "CAGRScore": {
      "basis": [42, 51, 25],
      "weightAdjustment": 1,
      "tenYearScore": 4,
      "fiveYearScore": 5,
      "oneYearScore": 2,
      "totalScore": 11
    },
    "score": 12
  },
  "equityAnalysis": {
    "description": "Equity Compound Annual Growth Rate(CAGR). Found on the balance sheet. This is considered the most important indicator of a moat. Scoring up and down in 10% intervals. We want at least 10%.",
    "greenFlags": [],
    "redFlags": [],
    "reference": [],
    "periods": [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    "values": [
      4899000000, 11755000000, 15470000000, 36096000000, 44218000000,
      59194000000, 74347000000, 84127000000, 101054000000, 128290000000
    ],
    "weightAdjustment": 2,
    "weightAdjustmentNotes": "A weight adjustment is used to incread the score for the more important figures.",
    "CAGR10Years": 39,
    "CAGR5Years": 24,
    "CAGRLastYear": 13,
    "valuesIncreasingScore": 1,
    "valuesIncreasingScoreNotes": "If there are over 6 years of increasing values, then a point is awarded",
    "CAGRScore": {
      "basis": [39, 24, 13],
      "weightAdjustment": 2,
      "tenYearScore": 3,
      "fiveYearScore": 2,
      "oneYearScore": 1,
      "totalScore": 6
    },
    "score": 14
  },
  "fcfAnalysis": {
    "description": "Free Cash Flow(FCF) Compound Annual Growth Rate(CAGR). This is considered the second most important indicator of a moat. Scoring up and down in 10% intervals. We want at least 10%.",
    "greenFlags": [],
    "redFlags": [],
    "reference": [],
    "periods": [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    "values": [
      943000000, 377000000, 2860000000, 5495000000, 7797000000, 11617000000,
      17483000000, 15359000000, 21212000000, 23632000000
    ],
    "weightAdjustment": 1.5,
    "weightAdjustmentNotes": "A weight adjustment is used to incread the score for the more important figures.",
    "CAGR10Years": 38,
    "CAGR5Years": 25,
    "CAGRLastYear": 6,
    "valuesIncreasingScore": 1,
    "valuesIncreasingScoreNotes": "If there are over 6 years of increasing values, then a point is awarded",
    "CAGRScore": {
      "basis": [38, 25, 6],
      "weightAdjustment": 1.5,
      "tenYearScore": 3,
      "fiveYearScore": 2,
      "oneYearScore": 0,
      "totalScore": 5
    },
    "score": 9
  },
  "score": 43
}
```
