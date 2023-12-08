# NetSuite SuiteQL Custom Reporting Suitelet
NetSuite user facing SuiteQL reporting Suitelet

**Custom records needed:**

Saved SQL Search - see customrecordsql_search.xml
Saved SQL Search Filters - see customrecordsql_searchfield.xml
Edit form and attach "sql_query_filter_cl.js" under custom code, set "Field Changed Function" to "loadFilters". 
Set new form as preferred.

**Required script parameters:**

Refer to script XML files for required parameters.

**Reporting Variables:**

Enter variables in your sql query in the following format: $ /*item*/

Example: where item.id = $ /*item*/

$ is the variable placeholder
/*item*/ is the select list table you want to link.

If you want a date picker variable use /*date*/ 
