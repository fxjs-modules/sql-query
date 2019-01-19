import * as mysql from './mysql'
export { mysql }

// import * as postgresql from './postgresql'
const postgresql = require('./postgresql')
export { postgresql }

import * as sqlite from './sqlite'
export { sqlite }

import * as mssql from './mssql'
export { mssql }
