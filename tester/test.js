const { WsProvider, ApiPromise } = require('@polkadot/api');
const { Keyring } = require("@polkadot/keyring");
const { BN } = require("bn.js");

var sbf;

(async () => {
    const provider = new WsProvider("wss://testnet.engi.network:9944");
    const api = await ApiPromise.create({provider});

    await api.isReady;

    // NOTE: will need a 'production' bridge account for substrate
    const keyring = new Keyring({ type: 'sr25519' });
    sbf = keyring.createFromUri('fan powder crumble lunar citizen thank skate casino enact suit yellow another', { name: "poop" }, 'sr25519');

    const unsub = await api.tx.jobs.createJob(
        100000, //funding
        ["Rust"], // language
        "https://github.com/engi-network/demo-secrets-rust-test-json-data", // repository
        "tj-test-branch", // branch
        "711d6d4ebacda8a6a2a57492fe1ea359528bb78f", // commithash
        [{
          id: "0xb00b135",
          result: "Passed",
          required: false,
        }],// tests: []
        "doffie", // name
        null, //filesRequirement
    )
        .signAndSend(sbf, ({ status, events }) => {
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
                      console.log("No error, we're done here....");
                  }
                });
                console.log(`UNSUBBING FROM txfer`);
              unsub();
            }
        });
})()
