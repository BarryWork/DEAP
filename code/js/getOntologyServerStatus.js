var request = require('request');

request.post(
    'https://abcd-deap.ucsd.edu/applications/Ontology/searchTerm2.php?search=interview_age',
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
	    console.log(body.length);
            return body.length;
        }
    }
);
