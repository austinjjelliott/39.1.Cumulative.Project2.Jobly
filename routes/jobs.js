"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureAdmin,
  ensureLoggedIn,
  authenticateJWT,
} = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json"); //STILL NEED TO DO THIS!! Use the website!
const jobUpdateSchema = require("../schemas/jobUpdate.json"); //STILL NEED TO DO THIS!!
const { parse } = require("dotenv");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 * & User must be an ADMIN to create a job
 */
router.post(
  "/",
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    const { title, minSalary, hasEquity } = req.query; //NEED TO UPDATE THIS for min salary and equity
    //Ensure title is input correctly or undefined if left out
    const titleParam = title ? title : undefined;
    // Ensure minSalary is a number if provided
    const minSalaryInt = minSalary ? parseInt(minSalary, 10) : undefined;
    // Ensure hasEquity is a boolean (true/false)
    const hasEquityBool =
      hasEquity === "true" ? true : hasEquity === "false" ? false : undefined;

    const jobs = await Job.findAll(titleParam, minSalaryInt, hasEquityBool);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 **ADDED: to PATCH a job must be ADMIN
 */

router.patch(
  "/:id",
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 * ADDED: must be admin
 */

router.delete(
  "/:id",
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
