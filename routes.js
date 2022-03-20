/* require dependencies */
const express = require("express");

/* important inits */
const router = express.Router();
const apiRouter = express.Router();

/* router use statements */
router.use("/api", apiRouter);

/* require controllers */
const UserController = require("./controllers/UserController");

/* configure routes */
apiRouter.post("/user", UserController.createUser);

module.exports = router;