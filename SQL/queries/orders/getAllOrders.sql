SELECT o.*, u.name as userName, u.email as userEmail
FROM almsafpa_eduvosprojd.orders o
JOIN almsafpa_eduvosprojd.user u ON o.userId = u.userId
ORDER BY o.date DESC;
