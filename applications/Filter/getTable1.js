var rserve = require('rserve-client');
var v    = process.argv[2].split(",");
v.push("age");
v.push("race.ethnicity");
v.push("high.educ");
v.push("household.income");
v.push("sex");
v.push("rel_relationship");
v = [...new Set(v)];
var file = process.argv[3];
//contents = "print(capture.output(write.csv(data.frame(data$src_subject_id,data$" + v + "), stdout(), row.names=F)))";
//contents = "toJSON(Filter(Negate(is.null),list(data$src_subject_id,data$eventname,data$" + v + ")))";

contents =  "ld = fromJSON(file=\"/var/www/html/data/ABCD/Filter/data/" + file + "\")\n";
contents += "okparticipants = unlist(lapply(ld[[1]]$set, function(l) l[[1]]))\n";
contents += "data = data[data$src_subject_id %in% okparticipants,]\n";
contents += "data = droplevels(data)\n";
contents += "varList = c(\"" + v.join("\",\"") + "\")\n";
contents += "table1.1 = CreateTableOne(vars = varList, data = data)\n";
contents += "toJSON(list(stargazer(print(table1.1, showAllLevels = TRUE),type = \"html\")))\n";

rserve.connect('localhost', 6311, function(err, client) {
    client.evaluate(contents, function(err, ans) {
        if (err)
            console.log(err + "\n");
        console.log(ans);
        client.end();
    });
});
