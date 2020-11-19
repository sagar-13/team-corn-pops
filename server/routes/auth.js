const express = require("express");
const jwt = require("jsonwebtoken");
const { loginRequired } = require("../middleware");

const userController = require("../controllers/usersController");

const router = express.Router();

router.post("/login", validationMiddleware, async function (req, res, next) {
    try {
        const { email, password } = req.body;
        // verify that there is user for email
        const user = await userController.findOneWithEmail(email);
        if (!user) {
            res.status(400).json({ errors: ["Email or password invalid"] });
            return;
        }
        // verify that the passwords match
        const passwordsMatch = await userController.checkPassword({
            user,
            password,
        });

        if (!passwordsMatch) {
            res.status(400).json({ errors: ["Email or password invalid"] });
            return;
        }
        // create and return jwt with user obj
        const responseObj = await createResponseObj(user);
        res.cookie("token", responseObj.token, { httpOnly: true });
        res.json(responseObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ["Unexpected error occured"] });
    }
});

router.post("/register", validationMiddleware, async function (req, res, next) {
    try {
        const { email, password, chef } = req.body;
        const isChef = !!chef;
        // verify that user isn't already in DB
        const user = await userController.findOneWithEmail(email);
        if (user) {
            res.status(400).json({
                errors: ["User with given email already exists"],
            });
            return;
        }

        // validate that the password is valid
        if (password.length < 6) {
            res.status(400).json({
                errors: ["Password should be at least 6 characters long"],
            });
            return;
        }

        const createdUser = await userController.create({
            email,
            password,
            isChef,
        });
        const responseObj = await createResponseObj(createdUser);
        res.cookie("token", responseObj.token, { httpOnly: true });
        res.status(201).json(responseObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ["Unexpected error occured"] });
    }
});

router.get("/user", loginRequired, async function (req, res, next) {
    try {
        const { id } = req.user;
        const user = await userController.findOneWithId(id);
        if (!user) {
            res.status(400).json({ errors: ["Please sign in"] });
            return;
        }
        // create and return jwt with user obj
        const responseObj = await createResponseObj(user);
        res.cookie("token", responseObj.token, { httpOnly: true });
        res.json(responseObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ["Unexpected error occured"] });
    }
});

router.put("/user", loginRequired, async (req, res, next) => {
    try {
        const { id } = req.user;
        const { email, password } = req.body;

        const errors = [];
        // validate that the password is valid
        if (email && !usersController.isValidEmailFormat(email))
            errors.push("Invalid email");

        // validate that the password is valid
        if (password && password.length < 6)
            errors.push("Password should be at least 6 characters long");

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const user = await usersController.sanatize(
            await usersController.update(id, req.body)
        );
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ["Unexpected error occured"] });
    }
});

function validationMiddleware(req, res, next) {
    const { email, password } = req.body;
    // input validation
    const errors = [];
    if (!email) errors.push("Missing email");
    if (!password) errors.push("Missing password");

    if (email && typeof email !== "string")
        errors.push("Invalid type for email");

    if (password && typeof password !== "string")
        errors.push("Invalid type for password");

    if (email && !userController.isValidEmailFormat(email))
        errors.push("Invalid format for email");

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }
    next();
}

async function createResponseObj(user) {
    const token = await jwt.sign(
        { email: user.email, id: user._id },
        process.env.SECRET,
        { expiresIn: process.env.TOKEN_TTL }
    );
    return {
        user: await userController.sanatize(user),
        token,
    };
}

module.exports = router;
