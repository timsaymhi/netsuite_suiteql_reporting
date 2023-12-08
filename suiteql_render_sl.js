/*
Required script parameters:
 
Internal ID of the custom record storing the SQL queries:
name: custscript_sql_folder_id
type: text

Link to SuiteQL restlet script/deployment:
name: custscript_sql_restlet_id
type: list/record 
record: script

Link to SuiteQL client script:
name: custscript_sql_client_id
type: list/record
record: script
*/

function renderForm(request, response) {
    var context = nlapiGetContext();
	if (request.getMethod() == 'GET') {
		try {
			var portletQ = request.getParameter('sqlid') ||'';
			var form = nlapiCreateForm(nlapiLoadConfiguration('companyinformation').getFieldValue('legalname') + ' Custom Reporting', false);
			form.setScript(context.getSetting('SCRIPT', 'custscript_sql_client_id'));
			form.addFieldGroup('custpage_params', 'Selection Criteria');
			var folderSearch = nlapiSearchRecord("customrecordsql_search",null,
			 ["formulanumeric: CASE WHEN {custrecordsql_query} IS NOT NULL THEN 1 ELSE 0 END","equalto","1"], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
			var reportList = form.addField('custpage_report', 'select', 'Select Report', 'custpage_params').setMandatory(true);
			reportList.addSelectOption('','', true);
			for (var i = 0; i < folderSearch.length && folderSearch; i++) {
				reportList.addSelectOption(folderSearch[i].getValue('internalid'), folderSearch[i].getValue('name').split(',')[0]);
			}
			if (portletQ) {
				reportList.setDefaultValue(portletQ);
			}
			form.addField('custpage_scriptid', 'text', 'Script ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getScriptId());
			form.addField('custpage_deployid', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getDeploymentId());
			form.addButton('custpage_folder_btn', 'Queries', 'openFolder('+context.getSetting('SCRIPT', 'custscript_sql_folder_id')+')');
			form.addButton('custpage_help_box', 'Help', 'loadHelp()');
			form.addSubmitButton('Next');
			response.writePage(form);
		}
		catch(e) {
			nlapiLogExecution('Error','Error',e.message);
			response.write(e.message);
		}
	}
	else { 
		try {
		var context = nlapiGetContext();
		var sqlFile = nlapiLoadFile(nlapiLookupField('customrecordsql_search', request.getParameter('custpage_report'), 'custrecordsql_query')).getValue()||'';
		if (!sqlFile) {alert('This record has no attached SQL File.');}
		nlapiLogExecution('debug','raw file', sqlFile);
		var sqlVarFile = sqlFile.split('/n');
		var reportVariables = [];
		for (var v = 0; v < sqlVarFile.length; v++) {
			var a = sqlVarFile[v].split('/*');
			if (a && a[1]) {
				var c = {};
				var b = a[1].split('*/');
				c.idx = v.toString();
				c.name = b[0];
				reportVariables.push(c);
			}
		}
		var form = nlapiCreateForm(nlapiLoadConfiguration('companyinformation').getFieldValue('legalname') + ' Custom Reporting ' + nlapiLookupField('customrecordsql_search',request.getParameter('custpage_report'),'name'), false);
		form.setScript(context.getSetting('SCRIPT', 'custscript_sql_client_id'));
		form.addFieldGroup('custpage_params', 'Selection Criteria');
		for (var r = 0; r < reportVariables.length; r++) {
			if (reportVariables[r].name == 'date') {
				form.addField('custpage_' + reportVariables[r].name + reportVariables[r].idx, 'date', reportVariables[r].name, null, 'custpage_params').setBreakType('startcol');
			}
			else {
				form.addField('custpage_' + reportVariables[r].name + reportVariables[r].idx, 'select', reportVariables[r].name, reportVariables[r].name, 'custpage_params').setBreakType('startcol');
			}
		}
		form.addField('custpage_cl_sl', 'text').setDisplayType('hidden').setDefaultValue(context.getSetting('SCRIPT', 'custscript_sql_restlet_id'));
		form.addField('custpage_reportid', 'text', 'Script Report').setDisplayType('hidden').setDefaultValue(request.getParameter('custpage_report'));
		form.addField('custpage_parameters', 'textarea', 'Script Parameters').setDisplayType('hidden').setDefaultValue(JSON.stringify(reportVariables));
		form.addField('custpage_scriptid', 'text', 'Script ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getScriptId());
		form.addField('custpage_deployid', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getDeploymentId());
		var inlineFilters = '<div><span id="sqlFilters"></span></div><br>';
		var inlineTable = '<div><span id="sqlTable"><style type = "text/css">.dataTables_filter {text-align: left !important;}</style><table name="sqlResultsTable" id="sqlResultsTable" class="display" width="100%"></table></span></div>';
		form.addField('custpage_fil', 'inlinehtml').setLayoutType('startrow').setDefaultValue(inlineFilters);
		form.addField('custpage_div', 'inlinehtml').setLayoutType('outsidebelow','startrow').setDefaultValue(inlineTable);
		form.addButton('custpage_redo', 'Start Over', 'goHome()')
		form.addButton('custpage_run', 'Run Report', 'runReport()');
		response.writePage(form);
		}
		catch(e) {
			nlapiLogExecution('Error','Error',e.message);
			response.write(e.message);
		}
	}
}