const { Parser } = require('../src/Parser')
const fs = require('fs')
const parser = new Parser()

const Exec = (programFile) => {
  const f = fs.readFileSync(programFile).toString()
  const ast = parser.parse(f);
  const prelude = `
 .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. |
| |              | || |     ___      | || |     __       | |
| |              | || |    |_  |     | || |    \\_ \`.     | |
| |              | || |      | |     | || |      | |     | |
| |              | || |      | |     | || |       > >    | |
| |              | || |     _| |     | || |     _| |     | |
| |   _______    | || |    |___|     | || |    /__.'     | |
| |  |_______|   | || |              | || |              | |
| '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------' 
`;

  console.log(prelude);
  console.log(JSON.stringify(ast, null, 2))
}

Exec(process.argv[2])
