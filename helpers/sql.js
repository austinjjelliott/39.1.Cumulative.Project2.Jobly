const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/*
Generates SQL values from Javascript objects for partial update queries 
-- dataToUpdate - Key, value pairs of fields to update in sql 
-- jsToSql - maps JS-style names into SQL-style column names 
-- returns an object containing setCols (a string for the SQL SET clause) and values parameterized by query placeholders ($1, $2, etc)
-- if no data is given, throws a BadRequestError 
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
