SELECT p.*, u.name as sellerName
FROM almsafpa_eduvosprojd.products p
JOIN almsafpa_eduvosprojd.user u ON p.sellerId = u.userId;
