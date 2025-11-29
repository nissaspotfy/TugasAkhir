/**
 * @swagger
 *
 *
 * /auth/login:
 *  post:
 *   summary: Login existing user
 *   tags: [Auth]
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           email:
 *              description: email user (required, must be a valid email)
 *              type: string
 *              example: example@gmail.com
 *           password:
 *             description: password user (required, min length 8, max length 100, must contain at least one letter, one number, and one special character)
 *             type: string
 *             example: Password123!
 *   responses:
 *    200:
 *     description: login user successfully
 *    400:
 *     description: Bad request
 *    404:
 *     description: Not found
 *    500:
 *     description: Internal server error
 *
 *
 *
 
 * 
 * 
 * 
 * 
 */
