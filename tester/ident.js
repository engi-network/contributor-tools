const { WsProvider, ApiPromise } = require('@polkadot/api');
const { Keyring } = require("@polkadot/keyring");
const { BN } = require("bn.js");

var alice;
var dave;
var sbf;

(async () => {
    const provider = new WsProvider("wss://testnet.engi.network:9944");
    const api = await ApiPromise.create({provider});

    await api.isReady;

    // NOTE: will need a 'production' bridge account for substrate
    const keyring = new Keyring({ type: 'sr25519' });
    alice = keyring.createFromUri('//Alice');
    dave = keyring.createFromUri('//Dave');
    sbf = keyring.createFromUri('fan powder crumble lunar citizen thank skate casino enact suit yellow another', { name: "poop" }, 'sr25519');

    console.log(`ST ${Object.keys(api.query.identity.identityOf)}`);

    const idof = await api.query.identity.identityOf(sbf.address);
    console.log(Object.keys(idof.registry));

    //const unsub = await api.tx.jobs.createJob(
    //)
    //    .signAndSend(sbf, ({ status, events }) => {
    //        if (status.isInBlock || status.isFinalized) {
    //          events
    //            .filter(({ event }) =>
    //              api.events.jobs.JobCreated.is(event)
    //            )
    //            .forEach(({ event : { data: [result] } }) => {
    //              if (result.isError) {
    //                let error = result.asError;
    //                if (error.isModule) {
    //                  const decoded = api.registry.findMetaError(error.asModule);
    //                  const { docs, name, section } = decoded;

    //                  console.log(`${section}.${name}: ${docs.join(' ')}`);
    //                } else {
    //                  console.log(error.toString());
    //                }
    //              } else {
    //                  job_id = `${result}`;
    //                  console.log(`JobId: ${job_id}`);
    //              }
    //            });
    //          myEmitter.emit("job-sent");
    //          unsub();
    //        }
    //    });
})()
