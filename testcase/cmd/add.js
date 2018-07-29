const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr
});

if (require.main === module) {
    rl.question('n1: ', (n1) => {
        rl.question('n2: ', (n2) => {
            console.log(parseInt(n1) + parseInt(n2));
            rl.close();
        });
    });
}
