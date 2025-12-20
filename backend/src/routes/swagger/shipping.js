/**
 * @swagger
 * /shipping/cost:
 *   post:
 *     summary: Calculate shipping cost
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Shipping cost calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Shipping cost calculated
 *                 data:
 *                   type: object
 *                   properties:
 *                     cost:
 *                       type: integer
 *                     distance:
 *                       type: number
 *                       format: float
 *                     origin:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                         long:
 *                           type: number
 *                     destination:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                         long:
 *                           type: number
 */
