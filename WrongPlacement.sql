select * from (
select c.Id,
(select count(Id) from Customer where PlacementId = c.Id and Position ='L') as LCount,
(select count(Id) from Customer where PlacementId = c.Id and Position ='R') as RCount
from Customer c
) as x where x.LCount > 1 or x.RCount > 1
