const { WsProvider, ApiPromise } = require('@polkadot/api');
const { Keyring } = require("@polkadot/keyring");
const { BN } = require("bn.js");
const gql = require("./gql");
const att = require("./at");
const EventEmitter = require('events');
const readline = require('readline');


const myEmitter = new EventEmitter();

var alice;
var dave;
var sbf;

(async () => {
    await gql.do_it();

    const rn = await askQuestion("Can we start??");

    const provider = new WsProvider("ws://127.0.0.1:9944");
    const api = await ApiPromise.create({provider});

    await api.isReady;

    const keyring = new Keyring({ type: 'sr25519' });
    alice = keyring.createFromUri('//Alice');
    dave = keyring.createFromUri('//Dave');
    sbf = keyring.createFromUri('fan powder crumble lunar citizen thank skate casino enact suit yellow another', { name: "poop" }, 'sr25519');

    await do_sudo(api, "set_holding_account", api.tx.jobs.setHoldingAccount(alice.address));
    await do_sudo(api, "set_balance", api.tx.balances.setBalance(sbf.address, "100000000000000000000000", 0));

    const acct = await api.query.system.account(sbf.address);
    console.log(`SBF still has crypto: ${acct.data.free}`);

    console.log("Sue-doze dunn");

    var job_id;

    const unsub = await api.tx.jobs.createJob(
        100000, //funding
        ["CSharp"], // language
        "https://github.com/engi-network/demo-csharp", // repository
        "main", // branch
        "33c5d5f36bae824ee331891b60c47893381a337b", // commithash
        [
          {
            id: "13275956-a43c-df2e-7720-9ab6ac582129",
            result: "Passed",
            required: false,
          },
          {
            id: "6327b858-0fd0-99bb-d810-75db0e0aa61e",
            result: "Passed",
            required: false,
          },
          {
            id: "7db5907a-e8c2-fd08-f6cd-19fe4bb587d4",
            result: "Passed",
            required: true,
          }
        ],
        "doffie", // name
        [null, null, null], //filesRequirement
    )
        .signAndSend(sbf, ({ status, events }) => {
            if (status.isInBlock || status.isFinalized) {
              events
                .filter(({ event }) =>
                  api.events.jobs.JobCreated.is(event)
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
                      job_id = `${result}`;
                      console.log(`JobId: ${job_id}`);
                  }
                });
              myEmitter.emit("job-sent");
              unsub();
            }
        });

        await new Promise((resolve, reject) => {
            myEmitter.once('job-sent', () => {
                resolve("good");
                console.log(`${job_id}: JOB CREATED`);
            });
        });
        const ans = await askQuestion("Tell me wen we're good to go!");

        await att.do_attempt(api, job_id)

        const an = await askQuestion("Tell me it agenn!");

        await att.do_attempt(api, job_id)
})()


function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function do_sudo(api, name, thing_to_do, and_then) {
    const nonce = await api.rpc.system.accountNextIndex(dave.address);
    const unsub = await api.tx.sudo.sudo(
        thing_to_do
    )
    .signAndSend(dave, { nonce }, ({ status, events }) => {
        if (status.isInBlock || status.isFinalized) {
          events
            .filter(({ event }) =>
              api.events.sudo.Sudid.is(event)
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
                  console.log(`TJDEBUG result ${typeof result}`);
                  console.log(`TJDEBUG result ${result}`);
              }
            });
            console.log(`UNSUBBING FROM ${name}`);
          myEmitter.emit("sudo-sent");
          unsub();
        }
    });

    await new Promise((resolve, reject) => {
        myEmitter.once('sudo-sent', () => {
            resolve("good");
            console.log(`${name}: EVENT RESOLVED`);
        });
    });
}
