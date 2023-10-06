/*
Required script parameters:
 
File cabinet to store sql files in text format: 
name: custscript_sql_folder_id
type: interger

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
			var form = nlapiCreateForm(nlapiLoadConfiguration('companyinformation').getFieldValue('legalname') + ' Custom Reporting', false);
			form.setScript(context.getSetting('SCRIPT', 'custscript_sql_client_id'));
			form.addFieldGroup('custpage_params', 'Selection Criteria');
			var folderSearch = nlapiSearchRecord("folder",null,
			[
			   ["internalidnumber","equalto",context.getSetting('SCRIPT', 'custscript_sql_folder_id')]
			], 
			[
			   new nlobjSearchColumn("internalid","file",null), 
			   new nlobjSearchColumn("description","file",null)
			]
			);
			var reportList = form.addField('custpage_report', 'select', 'Select Report', 'custpage_params').setMandatory(true);
			reportList.addSelectOption('','', true);
			for (var i = 0; i < folderSearch.length && folderSearch; i++) {
				reportList.addSelectOption(folderSearch[i].getValue('internalid', 'file'), folderSearch[i].getValue('description', 'file').split(',')[0]);
			}
			form.addButton('custpage_folder_btn', 'Query Folder', 'openFolder('+context.getSetting('SCRIPT', 'custscript_sql_folder_id')+')');
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
		var sqlFile = nlapiLoadFile(request.getParameter('custpage_report')).getValue();
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
		var form = nlapiCreateForm(nlapiLoadConfiguration('companyinformation').getFieldValue('legalname') + ' Custom Reporting ' + request.getParameter('inpt_custpage_report'), false);
		form.setScript(context.getSetting('SCRIPT', 'custscript_sql_client_id'));
		form.addFieldGroup('custpage_params', 'Selection Criteria').setSingleColumn(true);
		for (var r = 0; r < reportVariables.length; r++) {
			if (reportVariables[r].name == 'date') {
				form.addField('custpage_' + reportVariables[r].name + reportVariables[r].idx, 'date', reportVariables[r].name, null, 'custpage_params');
			}
			else {
				form.addField('custpage_' + reportVariables[r].name + reportVariables[r].idx, 'select', reportVariables[r].name, reportVariables[r].name, 'custpage_params');
			}
		}
		form.addField('custpage_cl_sl', 'text').setDisplayType('hidden').setDefaultValue(context.getSetting('SCRIPT', 'custscript_sql_restlet_id'));
		form.addField('custpage_report', 'text', 'Script Report').setDisplayType('hidden').setDefaultValue(request.getParameter('custpage_report'));
		form.addField('custpage_parameters', 'textarea', 'Script Parameters').setDisplayType('hidden').setDefaultValue(JSON.stringify(reportVariables));
		form.addField('custpage_report_filters','text','Report Filters').setDisplayType('hidden').setDefaultValue(nlapiLoadFile(request.getParameter('custpage_report')).getDescription());
		form.addField('custpage_scriptid', 'text', 'Script ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getScriptId());
		form.addField('custpage_deployid', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(nlapiGetContext().getDeploymentId());
		var inlineTable = '<div><span id="sqlTable"><style type = "text/css">.dataTables_filter {text-align: left !important;}</style><table id="sqlResultsTable" class="display" width="100%"></table></span>';
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