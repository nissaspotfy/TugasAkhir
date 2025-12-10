/**
 * @swagger
 * /promos:
 *   get:
 *     summary: Get all promos
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *
 *   post:
 *     summary: Create a new promo
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoPayload'
 *     responses:
 *       201:
 *         description: Promo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *
 * /promos/{id}:
 *   get:
 *     summary: Get promo by ID
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promo details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *
 *   put:
 *     summary: Update promo
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoPayload'
 *     responses:
 *       200:
 *         description: Promo updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *
 *   delete:
 *     summary: Delete promo
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promo deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *
 * /promos/check:
 *   post:
 *     summary: Check promo validity
 *     tags: [Promos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - totalAmount
 *             properties:
 *               code:
 *                 type: string
 *               totalAmount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Promo is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
