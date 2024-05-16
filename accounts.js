let accountsText = process.env.ACCOUNTS_189CLOUD || `userName----password`;

accountsText = accountsText.trim().replace('\r', '\n').replace('\n\n', '\n').split('\n');

let accounts = [];
for (let i=0; i<accountsText.length; i++) {
    a = accountsText[i].split('----');
    accounts.push({ userName: a[0], password: a[1] });
}

module.exports = accounts;
