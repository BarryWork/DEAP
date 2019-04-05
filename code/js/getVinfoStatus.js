var fs = require('fs');

if (process.argv.length <= 2) {
    console.log("Usage: "+__filename + "<number of variables in *.rds file>");
    process.exit(-1);
}

var cols = process.argv[2];

fs.readdir("/var/www/html/data/ABCD/NewDataExpo/variableInfo", function(err, items) {

    //console.log(items.length <= cols);
    if (typeof items !== 'undefined' && items.length <= cols){
	return true;
    } else {
	return false;
    }
});
