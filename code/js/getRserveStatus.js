var rserve = require('rserve-client');
var v = process.argv[2];

contents = "print(dim(data), stdout(), row.names=F);"

rserve.connect('localhost', 6311, function(err, client) {
    client.evaluate(contents, function(err, ans) {
        if(err) console.log(err);
        console.log(ans);
        client.end();
    });
});
