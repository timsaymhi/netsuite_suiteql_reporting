select r.recordnumber revelement, r.elementdate, rp.revrecstartdate, r.item, BUILTIN.DF(r.item) itemname, r.quantity, r.salesamount elementamt,  so.trandate sodate, r.source salesorder, so.tranline soline, so.itemcount soqty, so.amount soamount, if.fulfilldate, if.fulfilldoc, if.fulfillqty, rp.creationtriggeredbydisplay triggeredby,  r.allocationamount, rp.amount revamount, rp.totalrecognized, prs.amount recamt, prs.dateexecuted, prs.plannedperiod, prs.postingperiod
from revenueelement r
join revenueplan rp on rp.createdfrom = r.id
join salesordered so on BUILTIN.DF(so.transaction) = r.source and so.item = r.item
left join (select revenueplan, amount, dateexecuted, plannedperiod, postingperiod from revenuePlanPlannedRevenue) prs on rp.id = prs.revenueplan and prs.plannedperiod = 37
left join (select t.createddate fulfilldate, BUILTIN.DF(ntl.nextdoc) fulfilldoc, ntl.previousdoc, ntl.nextline, ntl.previousline, tl.item, -tl.quantity fulfillqty from nexttransactionlinelink ntl 
join transactionline tl on tl.transaction = ntl.nextdoc and ntl.nextline = tl.linesequencenumber
join transaction t on t.id = tl.transaction where ntl.linktype = 'ShipRcpt') if on if.previousdoc = so.transaction and if.previousline = so.tranline
where rp.revenueplantype = 'ACTUAL'  and r.elementdate > '01/01/2023' order by r.elementdate