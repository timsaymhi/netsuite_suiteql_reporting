# NetSuite SuiteQL Custom Reporting Suitelet
NetSuite user facing SuiteQL reporting Suitelet

Make sure script variables are set and you have selected the correct file cabinet folder.

**Required script parameters:**
 
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

**Reporting Variables:**

Enter variables in your sql query in the following format: $ /*item*/

Example: where item.id = $ /*item*/

$ is the variable placeholder
/*item*/ is the select list table you want to link.

If you want a date picker variable use /*date*/ 

See example SQL file

**SQL File Notes:**

In description please enter a description of the report and any columns you want to add filters.

Column count starts at 0.

Example: Revenue Report,0,6

If you do not want any column filters, just enter a description. If you do not enter a description, 
the select list will be blank on the suitelet.
