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
        id: expect.any(Number), // This allows for any auto-generated number
        title: "Job1",
        salary: 100000,
        equity: "0.1",
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 80000,
        equity: "0.2",
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Job3",
        salary: 60000,
        equity: null,
        company_handle: "c2",
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
