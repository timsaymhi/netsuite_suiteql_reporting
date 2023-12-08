/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
 
/*
Required script parameters:

Link to SuiteQL custom reporting Suitelet script/deployment:
name: custscript_sql_rep_sl
type: list/record 
record: script
*/

var
    query,
    runtime;
define( [ 'N/query', 'N/runtime' ], main );

function main( queryModule, runtimeModule ) {

    query = queryModule;
    runtime = runtimeModule;

    return {
        render: renderContent
    }

}


function renderContent( params ) {
	const default_title = 'SQL Custom Reporting';
    var scriptObj = runtime.getCurrentScript();
    var suiteQlDeploy = Number(scriptObj.getParameter( { name: 'custscript_sql_rep_sl' } ));
    params.portlet.title = default_title;
	const default_sql = `
	SELECT
	'<a href="/app/site/hosting/scriptlet.nl?script=${suiteQlDeploy}&deploy=1&sqlid=' || ID || '">' || Name || '</a>' AS Name,
	'<a href="/app/site/hosting/scriptlet.nl?script=${suiteQlDeploy}&deploy=1&sqlid=' || ID || '">List</a>' AS View,
	custrecordsql_description
	FROM 
	customrecordsql_search 
	WHERE
	IsInactive = 'F'
	ORDER BY 
	Name
	`;
    var sql = scriptObj.getParameter( { name: 'custscript_sql' } );
    if ( sql == null ) {
        sql = default_sql;
    }
    var queryResults = query.runSuiteQL( { query: sql } );
    var records = queryResults.asMappedResults();
    if ( records.length > 0 ) {
        var columnNames = Object.keys( records[0] );
        for ( i = 0; i < columnNames.length; i++ ) {
            var columnName = columnNames[i];
            params.portlet.addColumn(
                {
                    id: 'custpage_' + columnName,
                    type: 'text',
                    label: columnName,
                    align: 'LEFT'
                }
            );

        }
        for ( r = 0; r < records.length; r++ ) {
            var record = records[r];
            var row = {};
            for ( c = 0; c < columnNames.length; c++ ) {
                var columnName = columnNames[c];
                var value = record[columnName];
                if ( value != null ) { value = value.toString(); }
                row['custpage_' + columnName] = value;
            }
            params.portlet.addRow( { row: row } );
        }
    }
}
