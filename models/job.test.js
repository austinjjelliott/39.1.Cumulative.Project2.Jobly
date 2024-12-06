"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");
const { compare } = require("bcrypt");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

beforeAll(async function () {
  // Insert test job data into the database before all tests
  await db.query(`
    INSERT INTO jobs (id, title, salary, equity, company_handle)
    VALUES (1, 'Job1', 50000, 0.01, 'c1');
  `);
});

/************************************** create */
describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 60000,
    equity: 0,
    company_handle: "c1",
  };
  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 60000,
      equity: "0",
      companyhandle: "c1",
    });
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS companyHandle
        FROM jobs
        WHERE title = 'New Job'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New Job",
        salary: 60000,
        equity: "0",
        companyhandle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job1",
        salary: 50000,
        equity: "0.01",
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
