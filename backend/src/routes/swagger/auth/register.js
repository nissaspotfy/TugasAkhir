/**
 * @swagger
 *
 *
 * /auth/register:
 *  post:
 *   summary: Register a new user
 *   tags: [Auth]
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           name:
 *             description: name user (required, min length 3, max length 50)
 *             type: string
 *             example: John Doe
 *           email:
 *              description: email user (required, must be a valid email)
 *              type: string
 *              example: example@gmail.com
 *           password:
 *             description: password user (required, min length 8, max length 100, must contain at least one letter, one number, and one special character)
 *             type: string
 *             example: Password123!
 *           confirm_password:
 *             description: confirm password user (required, must be the same as password)
 *             type: string
 *             example: Password123!
 *   responses:
 *    201:
 *     description: Success register a new user
 *    400:
 *     description: Bad request
 *    404:
 *     description: Not found
 *    409:
 *     description: Conflict - user already registered
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
