module.exports = function (pool) {
    const express = require("express");
    const router = express.Router();
    const util = require("util");
    const {
        body,
        validationResult
    } = require("express-validator/check");
    const teamConfig = require("../config/teamConfig.json");
    const platformConfig = require("../config/platformConfig.json");
    const makeAsync = fn => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            return next(err);
        }
    };
    let moment = require("moment");
    pool.query = util.promisify(pool.query);

    function convertName(parameter, category) {
        let result = "";

        category.rules.map((value, idx) => {
            var tmp = new RegExp(value, "i");
            if (tmp.test(parameter)) {
                result = category.name[idx];
            }
        });

        return result;
    }

    // Params : pj_name, pj_team, pj_platform, pj_author, pj_env, pj_link
    // Returns : pj_id(pj_id exists ? pj_id : (new)pj_id), (new)build_id
    router.post("/beforeSuite", [
        body("pj_name").exists(),
        body("pj_team").exists(),
        body("pj_platform").exists(),
        body("pj_author").exists()
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);
        const team = convertName(req.body.pj_team, teamConfig);
        const plat = convertName(req.body.pj_platform, platformConfig);
        const name = req.body.pj_name;
        const auth = req.body.pj_author;
        const env = (req.body.pj_env) ? req.body.pj_env : "Real";
        let link = "-";

        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        if ((!team) || (!plat)) {
            res.statusCode = 400;
            return next("/beforeSuite : Wrong teamName or platName\n(team : " + req.body.pj_team + " / plat : " + req.body.pj_platform + ")");
        }

        // Resolve link value
        if (req.body.pj_link) {
            link = req.body.pj_link;
            if (link.slice(0, 4) !== "http") {
                link = "http://" + link;
            }
        }

        const findPj = "select ifnull((select max(pj_id) from project where pj_name= '" + name + "' and pj_team= '" + team + "' and pj_platform='" + plat + "' and pj_author= '" + auth + "'), -1) pj_id;";
        const findPjResult = await pool.query(findPj);
        let pj_id = findPjResult[0].pj_id;

        // IF the project exists
        if (pj_id !== -1) {
            // IF the project's link already exists
            if (link != "-" || link != "") {
                const updateLink = "update project set pj_link= '" + link + "' where pj_id = " + pj_id + " and pj_link != '" + link + "';";

                await pool.query(updateLink);
            }
        } else { // IF the project NOT exists -> Insert a new project
            const newPj = "INSERT INTO `api_db`.`project` VALUES (default, '" + name + "', '" + team + "', '" + plat + "', '" + auth + "', '" + link + "');";
            const newPjResult = await pool.query(newPj);

            pj_id = newPjResult.insertId;
        }
        // pj_id, link, env is resolved

        const newBuild = "insert into build values (default, '" + env + "', " + pj_id + ");";
        const newBuildResult = await pool.query(newBuild);
        let afterBuild = "update buildrank set rank = rank+1 where pj_id = " + pj_id + ";delete from buildrank where pj_id = " + pj_id + " and rank=21;insert into buildrank values (default, 1, " + newBuildResult.insertId + ", " + pj_id + ");";
        await pool.query(afterBuild);

        res.status(200).json({
            "pj_id": pj_id,
            "build_id": newBuildResult.insertId
        });
    }));

    // Params : pj_id, build_id, class_name, package_name
    // Returns : (new)class_id
    router.post("/beforeClass", [
        body("pj_id").exists(),
        body("build_id").exists(),
        body("class_name").exists(),
        body("package_name").exists()
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);

        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        const pjId = req.body.pj_id;
        const buildId = req.body.build_id;
        const cname = req.body.class_name;
        const pname = req.body.package_name;
        const findBuild = "select ifnull((select build_id from build where pj_id = " + pjId + " and build_id = " + buildId + "), -1) build_id;";
        const newClass = "INSERT into class values (default, '" + cname + "', '" + pname + "', " + buildId + ", " + pjId + ");";
        const findBuildResult = await pool.query(findBuild);

        if (findBuildResult[0].build_id === -1) {
            res.statusCode = 400;
            return next("/beforeClass : There is no such pj_id, build_id\n" + findBuild);
        } else {
            const newClassResult = await pool.query(newClass);

            res.status(200).json({
                "class_id": newClassResult.insertId
            });
        }
    }));

    // Params : pj_id, build_id, class_id, method_name, start_t, end_t, result
    // Returns : success(1)
    router.post("/afterMethod", [
        body("pj_id").exists(),
        body("build_id").exists(),
        body("class_id").exists(),
        body("method_name").exists(),
        body("start_t").exists().matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
        body("end_t").exists().matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
        body("result").exists().matches(/^[1-3]$/),
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        const pjId = req.body.pj_id;
        const buildId = req.body.build_id;
        const classId = req.body.class_id;
        const mname = req.body.method_name;
        const start_t = req.body.start_t;
        const end_t = req.body.end_t;
        const testResult = req.body.result;
        const findClass = "select ifnull((select class_id from class where pj_id = " + pjId + " and build_id = " + buildId + " and class_id = " + classId + "), -1) class_id;";
        const newMethod = "INSERT into method values (default, '" + mname + "', '" + start_t + "', '" + end_t + "', " + testResult + ", " +
            classId + ", " + buildId + ", " + pjId + ");";
        const findClassResult = await pool.query(findClass);

        if (findClassResult[0].class_id === -1) {
            res.statusCode = 400;
            return next("/afterMethod : There is no such pj_id, build_id, class_id\n" + findClass);
        } else {
            await pool.query(newMethod);
            res.status(200).json({
                "success": 1
            });
        }
    }));

    // Params : selectId
    // Returns : result("올바르게 삭제되었습니다." or "Data가 삭제되지 않았습니다.")
    router.post("/deleteData", [
        body("selectId").exists()
    ], makeAsync(async (req, res, next) => {
        const now = moment().format("YYYY.MM.DD HH:mm:ss");
        const err = validationResult(req);

        if (!req.session.userid) {
            return res.status(403).json({
                "error": "Forbidden"
            });
        }

        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        const selectId = req.body.selectId;
        const len = selectId.length - 1;
        const tableName = ["project", "build", "class", "method"];
        const tableId = ["pj_id", "build_id", "class_id", "method_id"];
        let deleteData = "";

        if (len >= 0 && len < 4) {
            deleteData = "delete from " + tableName[len] + " where " + tableId[len] + " = " + selectId[len] + ";";
        } else {
            res.statusCode = 400;
            return next("/deleteData : Wrong selectId request\n" + selectId);
        }

        const deleteDataResult = await pool.query(deleteData);

        if (deleteDataResult.affectedRows > 0) {
            console.log("By " + req.session.userid + ", data is deleted : " + now + ", " + tableName[len] + "(Id : " + selectId[len] + ")");

            // Deleting build Case -> Need to update buildrank table
            if (len === 1) {
                let updateBuildRank = "update buildrank set rank = rank-1 where pj_id=" + selectId[len - 1] + " and build_id<" + selectId[len] + ";insert into buildrank (rank, build_id, pj_id) select b.rn, b.build_id, b.pj_id from (select pj_id, build_id, buildenv, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM build inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC) b where b.pj_id=" + selectId[len - 1] + " and b.rn =20 group by pj_id, build_id, rn;";

                await pool.query(updateBuildRank);
            }
            res.status(200).json({
                "result": "올바르게 삭제되었습니다."
            });
        } else {
            res.status(200).json({
                "result": "Data가 삭제되지 않았습니다."
            });
        }
    }));

    return router;
};