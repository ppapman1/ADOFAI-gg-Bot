const main = require('./main');
const Server = require('./server.json');

const ownerOnly = [];
for(let u of main.getOwnerID()) {
    ownerOnly.push({
        id: u,
        type: 'USER',
        permission: true
    });
}

const staffOnly = ownerOnly.slice();
staffOnly.push({
    id: Server.role.staff,
    type: 'ROLE',
    permission: true
});

module.exports.ownerOnly = ownerOnly;
module.exports.staffOnly = staffOnly;