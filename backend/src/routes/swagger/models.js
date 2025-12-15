/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: string
 *           format: uuid
 *         recipient_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         address_line:
 *           type: string
 *         city:
 *           type: string
 *         postal_code:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         is_primary:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: string
 *           format: uuid
 *         product_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         stock:
 *           type: integer
 *         category:
 *           type: string
 *         image_url:
 *           type: string
 *     
 *     ProductPayload:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         stock:
 *           type: integer
 *         category:
 *           type: string
 *         image_url:
 *           type: string
 *
 *     TransactionItemRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *
 *     TransactionRequest:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionItemRequest'
 *         promoCode:
 *           type: string
 *         note:
 *           type: string
 *         shippingAddressId:
 *           type: integer
 *
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: integer
 *         snapToken:
 *           type: string
 *         totalAmount:
 *           type: integer
 *         status:
 *           type: string
 *
 *     Promo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         discount_type:
 *           type: string
 *           enum: [percentage, fixed]
 *         discount_value:
 *           type: integer
 *         is_active:
 *           type: boolean
 *         max_usage:
 *           type: integer
 *
 *     PromoPayload:
 *       type: object
 *       required:
 *         - code
 *         - discount_type
 *         - discount_value
 *       properties:
 *         code:
 *           type: string
 *         discount_type:
 *           type: string
 *           enum: [percentage, fixed]
 *         discount_value:
 *           type: integer
 *         is_active:
 *           type: boolean
 *         max_usage:
 *           type: integer
 */
