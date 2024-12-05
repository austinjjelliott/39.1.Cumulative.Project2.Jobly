const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");
const { database } = require("pg/lib/defaults");

describe("sqlForPartialUpdate", () => {
  test("correctly turns JS to SQL when given valid info", () => {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = { firstName: "first_name", age: "age" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ["Aliya", 32],
    });
  });
  test("correctly turns JS to SQL when given just dataToUpdate, no jsToSql", () => {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = {};

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"firstName"=$1, "age"=$2`, //uses the original key name since no mapping was provided
      values: ["Aliya", 32],
    });
  });
  test("throws error if no data given", () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: "first_name", age: "age" };
    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow(
      BadRequestError
    );
  });
});
