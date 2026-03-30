const dns = require('dns');
const fs = require('fs');

dns.resolveSrv('_mongodb._tcp.cluster0.td6mgjh.mongodb.net', (err, addresses) => {
    let result = '';
    if (err) {
        result = 'SRV Resolution Failed: ' + err.message + '\n';
    } else {
        result = 'SRV Addresses:\n' + JSON.stringify(addresses, null, 2) + '\n';
    }
    fs.writeFileSync('dns-results.txt', result);
    process.exit(0);
});
