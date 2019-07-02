var rserve = require('rserve-client');
var v = process.argv[2];
//contents = "print(capture.output(write.csv(data.frame(data$src_subject_id,data$" + v + "), stdout(), row.names=F)))";
contents = "toJSON(Filter(Negate(is.null),list(data$src_subject_id,data$eventname,data$" + v + ")))";

rserve.connect('localhost', 6311, function(err, client) {
    client.evaluate(contents, function(err, ans) {
        if(err) console.log(err);
        console.log(ans);
        client.end();
    });
});
