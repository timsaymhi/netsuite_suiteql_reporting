# NetSuite SuiteQL Custom Reporting Suitelet
NetSuite user facing SuiteQL reporting Suitelet

**Custom records needed:**

Saved SQL Search - see customrecordsql_search.xml
Edit form and attach "sql_query_filter_cl.js" under custom code, set "Field Changed Function" to loadFilters. 
Set new form as preferred.

Saved SQL Search Filters - see customrecordsql_searchfield.xml

**Required script parameters:**
Make sure script variables are set and you have selected the correct file cabinet folder.
 
SQL Custom Record ID:
name: custscript_sql_folder_id
type: text
(Custom record name for SQL table)

Link to SuiteQL restlet script/deployment:
name: custscript_sql_restlet_id
type: list/record 
record: script

Link to SuiteQL client script:
name: custscript_sql_client_id
type: list/record
record: script

**Reporting Variables:**

Enter variables in your sql query in the following format: $ /*item*/

Example: where item.id = $ /*item*/

$ is the variable placeholder
/*item*/ is the select list table you want to link.

If you want a date picker variable use /*date*/ 

See example SQL file

Suitelet will dynamically add filters to table based off of the filter records saved on the SQL query.

Example: Revenue Report,0,6

If you do not want any column filters, just enter a description. If you do not enter a description, 
the select list will be blank on the suitelet.
