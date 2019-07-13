var request = require('request');

request.post(
    'https://deap.nimhda.org//applications/Ontology/searchTerm2.php?search=interview_age',
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
	    console.log(JSON.parse(body).length);
        } else{
	    console.log(error)
	    console.log(response)
	}
    }
);
