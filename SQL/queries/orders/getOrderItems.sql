SELECT c.id as cartItemId, p.id as productId, p.name, p.price, p.image, p.isDeleted
FROM almsafpa_eduvosprojd.cart c
JOIN almsafpa_eduvosprojd.products p ON c.productId = p.id
WHERE c.orderId = ?;
