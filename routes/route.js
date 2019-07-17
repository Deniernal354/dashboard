module.exports = function(pool) {
    const express = require("express");
    const router = express.Router();
    const util = require("util");
    const teamConfig = require("../config/teamConfig.json");
    const {
        param,
        validationResult,
    } = require("express-validator/check");
    const makeAsync = fn => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            return next(err);
        }
    };

    pool.query = util.promisify(pool.query);

    router.get("/", (req, res) => {
        res.redirect("/auto/index");
    });
    router.get("/index.html", (req, res) => {
        res.redirect("/auto/index");
    });
    router.get("/index", (req, res) => {
        res.status(200).render("index.ejs", {
            cnt: teamConfig.name.length - 1,
        });
    });

    router.get("/all", makeAsync(async (req, res, next) => {
        const pjCnt = await pool.query("select count(*) cnt from project");

        res.status(200).render("all.ejs", {
            cnt: pjCnt[0].cnt,
        });
    }));

    router.get("/team/:teamNo", [
        param("teamNo").exists()
            .matches(/^[1-7]{1}$/),
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);

        if (!err.isEmpty()) {
            res.statusCode = 404;
            return next(JSON.stringify(err.array()));
        }

        const teamName = teamConfig.name[req.params.teamNo];
        const pjTeamCnt = await pool.query(`select count(*) cnt from project where pj_team = '${teamName}';`);

        res.status(200).render("team", {
            title: teamName,
            cnt: pjTeamCnt[0].cnt,
        });
    }));

    router.get("/platform/:category", [
        param("category").exists()
            .matches(/^(pcWeb|pcApp|mobileWeb|mobileApp|API)$/),
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);

        if (!err.isEmpty()) {
            res.statusCode = 404;
            return next(JSON.stringify(err.array()));
        }

        let pageTitle = "PC Web 환경";

        if (req.params.category === "pcApp") {
            pageTitle = "PC App 환경";
        } else if (req.params.category === "mobileApp") {
            pageTitle = "Mobile App 환경";
        } else if (req.params.category === "mobileWeb") {
            pageTitle = "Mobile Web 환경";
        } else if (req.params.category === "API") {
            pageTitle = "API Test";
        }

        const pjPlatCnt = await pool.query(`select count(*) cnt from project where pj_platform = '${req.params.category}';`);

        res.status(200).render("platform", {
            title: pageTitle,
            cnt: pjPlatCnt[0].cnt,
        });
    }));

    router.get("/guide", (req, res) => {
        res.status(200).render("guide");
    });

    // When the client get 500 status in the /getData
    router.get("/500", (req, res) => {
        res.status(500).render("page_500");
    });
    return router;
};
