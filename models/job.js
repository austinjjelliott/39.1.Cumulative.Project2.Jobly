"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */
  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1,$2, $3, $4)
        returning id, title, salary, equity, company_handle AS companyHandle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    return job;
  }
  /** Update a job with `data`.
   *
   * This is a partial update --- it's fine if `data` doesn't contain all the fields;
   * this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    //Prevent any updates to company_handle from being passed in:
    if (data.company_handle) {
      throw new BadRequestError("Not allowed to update company handle");
    }
    const { setCols, values } = sqlForPartialUpdate(data, {
      //Map JS-style names to SQL columns if necessary
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs SET ${setCols} WHERE id = ${idVarIdx} RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No Job Found with id: ${id}`);

    return job;
  }
  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   */
  static async findAll(title, minSalary, hasEquity) {
    const query = {
      text: `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE ($1::text IS NULL OR title ILIKE $1)
          AND ($2::integer IS NULL OR salary >= $2)
          AND ($3::boolean IS NULL OR (equity > 0) = $3)`,
      values: [title ? `%${title}%` : null, minSalary, hasEquity],
    };
    const result = await db.query(query);
    return result.rows;
  }

  /** Get a job by title.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */
  static async get(title) {
    const result = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
        FROM jobs
        WHERE title = $1`,
      [title]
    );
    const job = result.rows;
    if (!job) throw new NotFoundError(`No job found with title ${title}`);
    return job;
  }

  /** Remove a job by ID.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if not found.
   */
  static async remove(id) {
    const result = await db.query(
      `DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`No Job Found With ID ${id}`);
    }
  }
}

module.exports = Job;
