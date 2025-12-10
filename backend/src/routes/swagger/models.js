/**
 * @swagger
 * components:
 *   schemas:
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
