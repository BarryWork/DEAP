var rserve = require('../Filter/node_modules/rserve-client');
var v = process.argv[2];
//contents = "print(capture.output(write.csv(data.frame(data$src_subject_id,data$" + v + "), stdout(), row.names=F)))";
//contents = "toJSON(Filter(Negate(is.null),list(data$src_subject_id,data$eventname,data$" + v + ")))";
contents = "dtmp=data.frame(src_subject_id=data$src_subject_id,eventname=data$eventname," + v + "=data$" + v + ",stringsAsFactors = FALSE);"
contents = contents + "dtmp$" + v + "[dtmp$" + v + " == \"\"] = NA;"
contents = contents + "dtmp = dtmp[complete.cases(dtmp),];"
contents = contents + "toJSON(list(dtmp$src_subject_id,dtmp$eventname,dtmp$" + v + "))"

rserve.connect('localhost', 6311, function(err, client) {
    client.evaluate(contents, function(err, ans) {
        if(err) console.log(err);
        console.log(ans);
        client.end();
    });
});
