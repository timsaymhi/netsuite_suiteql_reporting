// No need to deploy. Set pageInit and fieldChanged functions on script record

jQuery('head').append('<link href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css" rel="stylesheet">');
jQuery.getScript('https://code.jquery.com/jquery-3.7.0.js');
jQuery.getScript('https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js');


function loadHelp() {
	var message = '<u>Setup:</u><br>Make sure script variables are set and you have selected the correct file cabinet folder.<BR><BR><u>Reporting Variables:</u><BR>Enter variables in your sql query in the following format: $ /*item*/<BR><BR><u>SQL File Notes:</u><BR>In description please enter a description of the report and any columns you want to add filters.<BR>';
	nlShowMessage(message, 'App Help');
}
	
function goHome() {
	var url = nlapiResolveURL('suitelet',nlapiGetFieldValue('custpage_scriptid'),nlapiGetFieldValue('custpage_deployid'));
	window.onbeforeunload = null;
	window.open(url, "_self");
};

function openFolder(folderId) {
	var url = 'https://7375720-sb1.app.netsuite.com/app/common/custom/custrecordentrylist.nl?rectype=' + folderId
	window.open(url, "_blank");
}

function pageInit() {
	if (!nlapiGetFieldValue('custpage_parameters')) {
		jQuery('#tbl_custpage_run').hide();
	}
	jQuery('#tbl_secondarycustpage_run').hide();
	jQuery('#pageContainer').append('<center><font size="2"><a href="mailto:timothy.sayles@myersholum.com">Tim Sayles</a> / Myers Holum, Inc.</font></center>');
	$(document).ready(function() {
		if(nlapiGetFieldValue('custpage_report')) {
			jQuery('#main_form').trigger("submit");
		}
	});
}

function runReport() {
	var reportFilterID = nlapiLookupField('customrecordsql_search', nlapiGetFieldValue('custpage_reportid'), 'custrecordsql_filters', false).split(',')||'';
	for (var f = 0; f < reportFilterID.length; f++) {
		var filterName = nlapiLookupField('customrecordsql_searchfield',reportFilterID[f],'name');
		var filterField = filterName.split(' ').join('_').toLowerCase();
		nlapiRemoveSelectOption('custpage_filter_'+filterField);
	}
	showAlertBox('INFO','Processing','Loading Report Data...');
	getTranTable();
}

function getTranTable() {
	if (jQuery('#sqlResultsTable tr').length > 0) {
		var sqlTable = jQuery('#sqlResultsTable').DataTable();
		sqlTable.destroy();
		jQuery('#sqlResultsTable').empty();
		jQuery('#sqlFilters').empty();
	}
	var queryRequest = {};
	queryRequest["query"] = Number(nlapiGetFieldValue('custpage_reportid'));
	var qData = [];
	var reportParams = JSON.parse(nlapiGetFieldValue('custpage_parameters'));
	reportParams.forEach(function(r) {
		var line = {};
		line["name"] = r.name;
		line["value"] = nlapiGetFieldValue('custpage_'+r.name+r.idx);
		qData.push(line);
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
		var reportFilterID = nlapiLookupField('customrecordsql_search', nlapiGetFieldValue('custpage_reportid'), 'custrecordsql_filters', false).split(',')||'';
		var cols = [];
		var reportFilters = [];
		if (reportFilterID) {
			var filterHtml = '<br><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr>' +
			'<td id="fg_custpage_filters" class="fgroup_title" colspan="100%"><div class="fgroup_title" style="color:#5A6F8F; border-bottom:1px solid #CCC; font-weight:600; white-space:nowrap; margin:0 0 2px 0">Report Filters</div></td></tr></tbody></table>' +
			'<div class="uir-fieldgroup-content" id="sqlFilterData"></div><hr>';
			jQuery('#sqlFilters').append(filterHtml);
			jQuery('#sqlFilters').parents().eq(8).width('100%');
			for (var f = 0; f < reportFilterID.length; f++) {
				var filter = {};
				var filterName = nlapiLookupField('customrecordsql_searchfield',reportFilterID[f],'name');
				var filterCol = Number(nlapiLookupField('customrecordsql_searchfield',reportFilterID[f],'custrecordsql_fieldcolumn'));
				var filterField = filterName.split(' ').join('_').toLowerCase();
				filter.filterId = filterField;
				filter.filterCol = Number(filterCol);
				cols.push(Number(filterCol));
				reportFilters.push(filter);
			}
		}
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
				cols.forEach(function(c) {
					c = Number(c);
					return true;
				});
                this.api().columns(cols).every( function (c) {
                    var column = this;
					var fLabel = '';
					for (var l = 0; l < reportFilters.length; l++) {
						if (Number(reportFilters[l].filterCol) == Number(c)) {
							fLabel = reportFilters[l].filterId.toUpperCase();
							break;
						}
					}
					var select = $('<br>'+fLabel+':<select id="filter'+c+'"><option value="">ALL</option></select>')
                    .appendTo( jQuery('#sqlFilterData') )
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
