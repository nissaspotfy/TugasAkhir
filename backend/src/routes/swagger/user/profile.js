/**
 * @swagger
 * 
 * 
 * /user/profile:
 *  get:
 *   summary: Get user profile
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: Get user profile successfully
 *    400:
 *     description: Bad request
 *    401:
 *     description: Unauthorized
 *    404:
 *     description: Not found
 *    500:
 *     description: Internal server error
 * 
 * 
 * 
 * /user/create-profile:
 *  post:
 *   summary: Create user profile
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *         schema:
 *          type: object
 *          properties:
 *           username:
 *              description: username user (required, alphanumeric, min length 3, max length 30)
 *              type: string
 *              example: exampleuser
 *           bio:
 *             description: bio user (optional, max length 160)
 *             type: string
 *             example: This is my bio
 *           profile_picture:
 *             description: profile picture user (optional, image file)
 *             type: string
 *             format: binary
 *           dateOfBirth:
 *             description: date of birth user (optional, must be a valid date)
 *             type: string
 *             format: date
 *             example: 1990-01-01
 *   responses:
 *    201:
 *     description: Create user profile successfully
 *    400:
 *     description: Bad request
 *    401:
 *     description: Unauthorized
 *    404:
 *     description: Not found
 *    500:
 *     description: Internal server error
 * 
 * 
 * 
 * /user/update-profile:
 *  put:
 *   summary: Update user profile
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *         schema:
 *          type: object
 *          properties:
 *           username:
 *              description: username user (optional, alphanumeric, min length 3, max length 30)
 *              type: string
 *              example: exampleuser
 *           bio:
 *             description: bio user (optional, max length 160)
 *             type: string
 *             example: This is my bio
 *           profile_picture:
 *             description: profile picture user (optional, image file)
 *             type: string
 *             format: binary
 *           dateOfBirth:
 *             description: date of birth user (optional, must be a valid date)
 *             type: string
 *             format: date
 *             example: 1990-01-01
 *   responses:
 *    200:
 *     description: Update user profile successfully
 *    400:
 *     description: Bad request
 *    401:
 *     description: Unauthorized
 *    404:
 *     description: Not found
 *    500:
 *     description: Internal server error
 * 
 * 
 * 
 */