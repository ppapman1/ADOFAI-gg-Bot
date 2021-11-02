const main = require('./main');
const Server = require('./server.json');

let ownerOnly = [];
for(let u of main.getOwnerID()) {
    ownerOnly.push({
        id: u,
        type: 'USER',
        permission: true
    });
}

const teamOwnerOnly = [{
    id: main.getTeamOwner(),
    type: 'USER',
    permission: true
}];

ownerOnly = ownerOnly.length > 10 ? teamOwnerOnly : ownerOnly;

const staffOnly = ownerOnly.slice();
staffOnly.push({
    id: Server.role.staff,
    type: 'ROLE',
    permission: true
});

module.exports.ownerOnly = ownerOnly;
module.exports.teamOwnerOnly = teamOwnerOnly;
module.exports.staffOnly = staffOnly;