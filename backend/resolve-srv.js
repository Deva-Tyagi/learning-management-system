const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.cluster0.td6mgjh.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('SRV Resolution Failed:', err.message);
        // Try resolving the main host directly to see if it even exists
        dns.resolve4('cluster0.td6mgjh.mongodb.net', (err2, ips) => {
            if (err2) console.error('A Record Resolution Failed:', err2.message);
            else console.log('A Records:', ips);
        });
        return;
    }
    console.log('SRV Addresses:', addresses);
});
