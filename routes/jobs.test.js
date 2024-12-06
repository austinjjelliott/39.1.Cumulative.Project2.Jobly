"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "Software Engineer",
    salary: 100000,
    equity: 0.1,
    company_handle: "c1",
  };

  test("works for admin to create a job", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    console.log(resp.body); // Added this line to inspect the response body

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.job).toEqual(
      expect.objectContaining({
        title: "Software Engineer",
        salary: 100000,
        equity: "0.1",
        companyhandle: "c1",
      })
    );
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs).toBeInstanceOf(Array); // Ensures the result is an array (doesnt matter what jobs are in it)
  });
});

/************************************** PATCH /jobs */
describe("PATCH /jobs/:id", function () {
  //Set up job with id =1 before test:
  beforeEach(async function () {
    // Insert a job into the database with id = 1
    await db.query(`
      INSERT INTO jobs (id, title, salary, equity, company_handle)
      VALUES (1, 'Software Engineer', 100000, '0.1', 'c1')
    `);
  });

  test("works for admin to update job", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({ title: "Senior Software Engineer", salary: 120000 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.job).toEqual(
      expect.objectContaining({
        title: "Senior Software Engineer",
        salary: 120000,
      })
    );
  });
});

/************************************** DELETE /jobs */

describe("DELETE /jobs/:id", function () {
  beforeEach(async function () {
    // Insert a job into the database with id = 1
    await db.query(`
          INSERT INTO jobs (id, title, salary, equity, company_handle)
          VALUES (1, 'Software Engineer', 100000, '0.1', 'c1')
        `);
  });
  test("works for admin to delete job", async function () {
    const resp = await request(app)
      .delete("/jobs/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "1" }); // Assuming the job id is 1
  });
});
