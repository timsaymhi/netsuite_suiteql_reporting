/**
* @NApiVersion 2.1
* @NScriptType Restlet
* @NModuleScope Public
*/

define( [ 'N/query', 'N/file' ], main );

function main( query, file ) {
    return {
		post: function( request ) {
			try {
				var dataIn = JSON.parse(request);
				if (dataIn) {
					var sqlQuery = file.load({id:Number(dataIn.query)}).getContents();
					var qDataIn = dataIn.data;
					var qParams = [];
					for (var q = 0; q < qDataIn.length; q++) {
						if(!isNaN(qDataIn[q].value)) {
							qParams.push(Number(qDataIn[q].value));
						}
						else {
							qParams.push(qDataIn[q].value)
						}
					};
					var results = [];
					var paginatedResults = query.runSuiteQLPaged({query: sqlQuery, params: qParams, pageSize: 5000});
					for( var i=0; i < paginatedResults.pageRanges.length; i++ ) {
						var currentPage = paginatedResults.fetch(i);
						var pageResults = currentPage.data.asMappedResults();
						pageResults.forEach(function(result) {
							results = results.concat(result);
							return true;
						});
					}
					return JSON.stringify(results);
				}				
				else {
					var returnA = [];
					var error = {};
					error.error = 'No data table or SQL query specified';
					returnA.push(error);
					return JSON.stringify(returnA);
					
				}
			} catch (e) {
				var returnA = [];
				var error = {};
				error.error = e.message;
				returnA.push(error);
				return JSON.stringify(returnA);
			}        
        }
    }
}