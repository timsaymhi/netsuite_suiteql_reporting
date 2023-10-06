// No need to deploy. Set pageInit and fieldChanged functions on script record

jQuery('head').append('<link href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css" rel="stylesheet">');
jQuery.getScript('https://code.jquery.com/jquery-3.7.0.js');
jQuery.getScript('https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js');

function loadHelp() {
	var message = '<u>Setup:</u><br>Make sure script variables are set and you have selected the correct file cabinet folder.<BR><BR><u>Reporting Variables:</u><BR>Enter variables in your sql query in the following format: $ /*item*/<BR><BR><u>SQL File Notes:</u><BR>In description please enter a description of the report and any columns you want to add filters.<BR>Column count starts at 0.<BR>Example: Revenue Report,0,6<BR>';
	nlShowMessage(message, 'App Help');
}
	
function goHome() {
	var url = nlapiResolveURL('suitelet',nlapiGetFieldValue('custpage_scriptid'),nlapiGetFieldValue('custpage_deployid'));
	window.onbeforeunload = null;
	window.open(url, "_self");
};

function openFolder(folderId) {
	var url = nlapiResolveURL('record', 'folder', folderId);
	window.open(url, "_blank");
}

function pageInit() {
	jQuery('#tbl_custpage_run').hide();
	jQuery('#tbl_secondarycustpage_run').hide();
	jQuery('#pageContainer').append('<center><font size="2"><a href="mailto:timothy.sayles@myersholum.com">Tim Sayles</a> / Myers Holum, Inc.</font></center>');
}

function runReport() {
	showAlertBox('INFO','Processing','Loading Report Data...');
	getTranTable();
}

function reRunReport() {
	var sqlTable = jQuery('#sqlResultsTable').DataTable();
	sqlTable.destroy();
	jQuery('#sqlResultsTable').empty();
	showAlertBox('INFO','Processing','Loading Report Data');
	getTranTable();
}

function getTranTable() {
	if (jQuery('#sqlResultsTable tr').length > 0) {
		var sqlTable = jQuery('#sqlResultsTable').DataTable();
		sqlTable.destroy();
		jQuery('#sqlResultsTable').empty();
	}
	var queryRequest = {};
	queryRequest["query"] = Number(nlapiGetFieldValue('custpage_report'));
	var qData = [];
	var reportParams = JSON.parse(nlapiGetFieldValue('custpage_parameters'));
	reportParams.forEach(function(r) {
		var line = {};
		line["name"] = r.name;
		line["value"] = nlapiGetFieldValue('custpage_'+r.name+r.idx);
		qData.push(line);
		console.log(JSON.stringify(line));
		return true;
	});
	queryRequest["data"] = qData;
	nlapiRequestURL(nlapiResolveURL('RESTLET',nlapiGetFieldValue('custpage_cl_sl'),1,'INTERNAL'),JSON.stringify(queryRequest),{"content-type":"application/json"}, getTable, 'POST');
}

function getTable(response) {
	hideAlertBox('INFO');
	var resp = JSON.parse(response.getBody());
	if (resp.length > 0) {
		var dataColumns = [];
		var header = resp[0];
		Object.keys(header).forEach(function(a,b) {
			var dataRow = {};
			dataRow.data = a;
			dataRow.title = a;
			dataColumns.push(dataRow);
			return true;
		});
		var reportFilters = nlapiGetFieldValue('custpage_report_filters').split(',');
		var sqlTable = jQuery('#sqlResultsTable').DataTable({
			"responsive": true, 
			"searching": true, 
			"paging": true, 
			"lengthMenu": [ [25, 50, 100, -1], [25, 50, 100, "All"] ],
			"info": true, 
			"ordering": false, 
			"data": resp,
			"columns" : dataColumns,
			"initComplete": function (setting, json) {
				var cols = reportFilters.splice(1, reportFilters.length);
				cols.forEach(function(c) {
					c = Number(c);
					return true;
				});
                this.api().columns(cols).every( function () {
                    var column = this;
                    var select = $('<select><option value="">ALL</option></select>')
                    .appendTo( jQuery(column.header()) )
                    .on( 'change', function () {
                        var val = jQuery.fn.dataTable.util.escapeRegex(
                            jQuery(this).val()
                        );
						column
                        .search( val ? '^'+val+'$' : '', true, false )
                        .draw();
                    });
                    column.data().unique().sort().each( function ( d, j ) {
                        select.append( '<option value="'+d+'">'+d+'</option>' )
                   });
                });
			} 				
		});
	}
}

function fieldChanged(type, name) {
	jQuery('#tbl_custpage_run').show();
}