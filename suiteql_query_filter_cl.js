function loadFilters(type, name) {
	if (name === 'custrecordsql_query') {
		alert('About to parsing SQL file for filters. This will take a minute.');
		var sqlFile = nlapiGetFieldValue('custrecordsql_query')||'';
		if (!sqlFile) {
			hideAlertBox('INFO');
			alert('You must attach a SQL file first.');
			return;
		}
		getTranTable(sqlFile);
	}
	return true;
}

function getTranTable(sqlFile) {
	var queryRequest = {};
	queryRequest["headers"] = Number(sqlFile);
	var qData = [];
	queryRequest["data"] = qData;
	console.log(JSON.stringify(queryRequest));
	
	nlapiRequestURL(nlapiResolveURL('RESTLET',2378,1,'INTERNAL'),JSON.stringify(queryRequest),{"content-type":"application/json"}, processFilters, 'POST');
}

function processFilters(response) {
	console.log(response);
	var rowH = JSON.parse(response.body);
	var H = Number(rowH[0].headers);
	var searchfieldSearch = nlapiSearchRecord("customrecordsql_searchfield",null,
	[
	   ["custrecordsql_search","anyof",nlapiGetRecordId()]
	], 
	[
	   new nlobjSearchColumn("internalid")
	]
	);
	if (searchfieldSearch && searchfieldSearch.length > 0) {
		for (var i = 0; i < searchfieldSearch.length; i++) {
			nlapiDeleteRecord('customrecordsql_searchfield', searchfieldSearch[i].getValue('internalid'));
		}
	}
	for (var i = 1; i <= H; i++) {
		var r = nlapiCreateRecord('customrecordsql_searchfield');
		r.setFieldValue('custrecordsql_search',nlapiGetRecordId());
		r.setFieldValue('name',i);
		r.setFieldValue('custrecordsql_fieldcolumn',i);
		nlapiSubmitRecord(r);
	}
	hideAlertBox('INFO');
	alert('Filters have been edit. Save and edit record to select filters.');
	return true;
}

//custrecordsql_filters