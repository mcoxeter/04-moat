# moat

**Usage**
`npm start -- FB`

This program will score a companies moat by looking at the GAGR for the company over 10, 5 and one year:
`C:\Users\Mike\OneDrive - Digital Sparcs\Investing\Value Investing Process\Business analysis/{stock}/basics`

GAGR 10yr 5yr 1y
Revenue % % %  
Diluted EPS % % %  
Equity % % %  
FCF % % %

The output file is named {execution date}.json

Equity growth is the strongest value for determining a good moat.
FCF is the second strongest value for a moat

The program relies on core-data being created for the stock before hand. See [core-data](https://github.com/mcoxeter/core-data)
