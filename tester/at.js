const { WsProvider, ApiPromise } = require('@polkadot/api');
const { Keyring } = require("@polkadot/keyring");
const { BN } = require("bn.js");
const EventEmitter = require('events');

const myEmitter = new EventEmitter();

var alice;
var dave;


module.exports = {
    do_attempt: async function(api, job_id) {
        // NOTE: will need a 'production' bridge account for substrate
        const keyring = new Keyring({ type: 'sr25519' });
        alice = keyring.createFromUri('//Alice');
        dave = keyring.createFromUri('//Dave');

        const unsub = await api.tx.jobs.attemptJob(
            job_id, // JobId
            "https://github.com/tjsharp1/demo-csharp", // repository
        )
            .signAndSend(dave, ({ status, events }) => {
                if (status.isInBlock || status.isFinalized) {
                  events
                    .filter(({ event }) =>
                      api.events.jobs.JobAttempted.is(event)
                    )
                    .forEach(({ event : { data: [result] } }) => {
                      if (result.isError) {
                        let error = result.asError;
                        if (error.isModule) {
                          const decoded = api.registry.findMetaError(error.asModule);
                          const { docs, name, section } = decoded;

                          console.log(`${section}.${name}: ${docs.join(' ')}`);
                        } else {
                          console.log(error.toString());
                        }
                      } else {
                          console.log("No error, we're done here....");
                      }
                    });
                    console.log(`UNSUBBING FROM txfer`);
                  unsub();
                }
            });
    }
}
