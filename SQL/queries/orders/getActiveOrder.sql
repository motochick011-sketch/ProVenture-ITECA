SELECT * FROM almsafpa_eduvosprojd.orders
WHERE userId = ? AND status = 'active'
LIMIT 1;
