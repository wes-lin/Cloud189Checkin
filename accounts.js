var accounts = [];

username_arr = process.env.TY_USER_NAME.split(',');
password_arr = process.env.TY_PASSWORD.split(',');

if (username_arr.length != password_arr.length) {
    console.log("账号密码个数不一致");
    process.exit(1);
}
for (let index = 0; index < username_arr.length; index++) {
    accounts.push({ userName: username_arr[index], password: password_arr[index] });
}

module.exports = [accounts];
