/**
* @NApiVersion 2.1
* @NScriptType Restlet
* @NModuleScope Public
*/

define( [ 'N/query', 'N/file', 'N/record'], main );

function main( query, file, record ) {
    return {
		post: function( request ) {
			try {
				var dataIn = JSON.parse(request);
				if (dataIn) {
					if (dataIn.query) {
						var sqlRecord = record.load({type: 'customrecordsql_search', id: Number(dataIn.query)});
						var sqlQuery = file.load({id:Number(sqlRecord.getValue({fieldId: 'custrecordsql_query'}))}).getContents();
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
					if (dataIn.headers) {
						var sqlQuery = file.load({id:Number(dataIn.headers)}).getContents();
						var sqlQuery = sqlQuery.replaceAll('?','0');
						var results = [];
						var rows = {};
						var sqlH = sqlQuery.split(',');
						rows.headers = sqlH.length;
						results.push(rows);
						return JSON.stringify(results);
					}
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
