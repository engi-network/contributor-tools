const { DocumentStore } = require('ravendb');

const jobattempt_snap = require('./job_attempted.json');
const solved_job = require('./solved_job.json');


module.exports = {
    do_it: async function() {
        const ds = new DocumentStore("http://localhost:8088", "engi-local");
        ds.initialize();

        const session = ds.openSession();

        await session.store(jobattempt_snap, "JobAttemptedSnapshots/04592726141831720420");
        await session.store(solved_job, "SolveJobCommands/2-C");
        await session.saveChanges();
        console.log("SettTTTtttup");
    }
}
