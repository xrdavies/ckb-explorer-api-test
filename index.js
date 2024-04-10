const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;




main = async () => {
    const API_URL = 'https://mainnet-api.explorer.nervos.org/api/v1/';
    const ADDRESS = 'ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtkv5lf6rpzzcfjm54dd6jm8pxsk8df2ts8paw5q';
    const END_BLOCK_NUMBER = 12689999;
    const PAGE_SIZE = 100;

    const headers = {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
    };

    let pageIdx = 1;


    const csvWriter = createCsvWriter({
        path: './tmp.csv',
        header: [
            { id: 'id', title: "ID" },
            { id: 'tx_hash', title: "Tx Hash" },
            { id: 'block_number', title: "Block Number" },
            { id: 'block_timestamp', title: "Timestamp" },
            { id: 'from', title: "From" },
            { id: 'amount', title: "Amount" }]
    });



    const url = `${API_URL}/address_transactions/${ADDRESS}?page=${pageIdx}&page_size=${PAGE_SIZE}&sort=time.asc`;
    let response = await axios.get(url, { headers });
    let meta = response.data.meta;
    console.log(meta);

    let pageCount = Math.ceil((meta.total + 1) / PAGE_SIZE);
    console.log(pageCount);

    for (let pageIdx = 1; pageIdx <= pageCount; pageIdx++) {
        let url = `${API_URL}/address_transactions/${ADDRESS}?page=${pageIdx}&page_size=${PAGE_SIZE}&sort=time.asc`;
        let response = await axios.get(url, { headers });
        let transactions = response.data.data;
        console.log(transactions.length);

        for (let element of transactions) {
            let attributes = element.attributes;
            let id = element.id;
            let tx_hash = attributes.transaction_hash;
            let block_number = attributes.block_number;
            let block_timestamp = attributes.block_timestamp;
            let from = attributes.display_inputs[0].address_hash;
            let to = ADDRESS;

            let amount = 0;
            for (let output of attributes.display_outputs) {
                if (output.address_hash === ADDRESS) {
                    amount = output.capacity / 100000000;
                    break;
                }
            }
            console.log(id, tx_hash, block_number, block_timestamp, from, amount);

            await csvWriter.writeRecords([
                { id, tx_hash, block_number, block_timestamp, from, amount }
            ])
        };
    }


}

main();