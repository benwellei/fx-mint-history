import fetch from "node-fetch";
import * as fs from "fs";

async function getFXtxns(address) {
    const baseUrl = 'https://api.tzkt.io/v1/operations/transactions';
    const sender = address;
    const target = 'KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS';
    const entrypoint = 'mint';
    const limit = 1000;
    const dir = './logs';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('Logs directory created.');
    }

    await fetch(`${baseUrl}?sender=${sender}&target=${target}&entrypoint=${entrypoint}&limit=${limit}`)
        .then(res => res.json())
        .then(json => {
            let log = [];

            json.forEach(t => {

                if (t.status == 'applied') {
                    let data = [
                        t.timestamp,
                        t.parameter.value.issuer_address,
                        t.amount/1000000,
                        t.bakerFee/1000000,
                        `https://tzkt.io/${t.hash}`,
                    ]

                    log.push(data);
                }
            })

            return log;
        })
        .then(log => {
            const title = address.substring(address.length - 4);
            const path = `${dir}/${title}.csv`;
            const headers = ['Date', 'Issuer', 'Price', 'Gas Fee', 'Transaction'];

            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, `${headers.join()}\n`);
                console.log('Log file created!');
            }

            log.forEach(l => {
                const row = l.join() + "\n"
                
                fs.appendFile(path, row, (err) => {
                    if (err) throw err;                
                });
            });
            
            console.log(`${log.length} entries added to ${title}.csv`);
        })
}

getFXtxns('YOUR_ADDRESS');