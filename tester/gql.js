const { DocumentStore } = require('ravendb');

const user1 = require('./user1.json');
const user2 = require('./user2.json');
const email1 = require('./email1.json');
const email2 = require('./email2.json');
const address1 = require('./address1.json');
const address2 = require('./address2.json');


module.exports = {
    do_it: async function() {
        const ds = new DocumentStore("http://localhost:8088", "engi-local");
        ds.initialize();

        const session = ds.openSession();

        await session.store(user1, "users/320-A");
        await session.store(user2, "users/322-A");
        await session.store(email1, "UserEmailReferences/tj@engi.network");
        await session.store(email2, "UserEmailReferences/davie@engi.network");
        await session.store(address1, `UserAddressReferences/5F7GV7DTZUr9p2eJZzdjd9mnzJZvjoJic4Po3pBtLzJMAPAA`);
        await session.store(address2, `UserAddressReferences/5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy`);
        await session.saveChanges();
        console.log("SettTTTtttup");
    }
}
