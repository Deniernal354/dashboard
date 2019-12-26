module.exports = function(asyncQuery, redisClient, teamInfo, platInfo) {
    const express = require("express");
    const router = express.Router();
    const moment = require("moment");
    const makeAsync = require("./makeAsync.js");
    const alertMail = require("./alertMail.js")(asyncQuery, redisClient);
    const {
        body,
        validationResult,
    } = require("express-validator/check");

    function convertName(parameter, category) {
        let result = "";

        category.rules.map((value, idx) => {
            const tmp = new RegExp(value, "i");

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
        body("pj_author").exists(),
    ], makeAsync(async (req, res, next) => {
        const err = validationResult(req);

        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        const team = convertName(req.body.pj_team, teamInfo);
        const plat = convertName(req.body.pj_platform, platInfo);
        const name = req.body.pj_name;
        const auth = req.body.pj_author;
        const env = (req.body.pj_env) ? req.body.pj_env : "Real";
        const mail = (req.body.pj_mail) ? req.body.pj_mail : "-";
        let link = "-";

        if ((!team) || (!plat)) {
            res.statusCode = 400;
            return next(`/beforeSuite : Wrong teamName or platName\n(Project : ${name} / team : ${req.body.pj_team} / plat : ${req.body.pj_platform})`);
        }

        // Resolve link value
        if (req.body.pj_link) {
            link = req.body.pj_link;
            if (link.slice(0, 4) !== "http") {
                link = `http://${link}`;
            }
        }

        const findPj = `select ifnull((select max(pj_id) from project where pj_name='${name}' and pj_team='${team}' and pj_platform='${plat}' and pj_author='${auth}'), -1) pj_id;`;
        const findPjResult = await asyncQuery(findPj);
        let projectId = findPjResult[0].pj_id;

        // IF the project exists
        if (projectId !== -1) {
            const prevMail = await asyncQuery(`select pj_mail from project where pj_id=${projectId}`);

            // Mail address removal case
            if (prevMail[0].pj_mail !== "-" && mail === "-") {
                alertMail.delRedis(0, [projectId]);
            }
            // Update the project's mail info
            await asyncQuery(`update project set pj_mail='${mail}' where pj_id=${projectId} and pj_mail!='${mail}';`);
            // Update the project's link info
            await asyncQuery(`update project set pj_link='${link}' where pj_id=${projectId} and pj_link!='${link}';`);
        } else {
            // IF the project NOT exists -> Insert a new project
            const newPj = `INSERT INTO project VALUES (default, '${name}', '${team}', '${plat}', '${auth}', '${link}', '${mail}');`;
            const newPjResult = await asyncQuery(newPj);

            projectId = newPjResult.insertId;
        }
        // pj_id, link, env, mail is resolved

        const newBuild = `insert into build values (default, '${env}', ${projectId});`;
        const newBuildResult = await asyncQuery(newBuild);
        const afterBuild = `update buildrank set rank = rank+1 where pj_id = ${projectId};delete from buildrank where pj_id=${projectId} and rank=21;insert into buildrank values (default, 1, ${newBuildResult.insertId}, ${projectId});`;

        await asyncQuery(afterBuild);
        res.status(200).json({
            "pj_id": projectId,
            "build_id": newBuildResult.insertId,
        });
    }));

    // Params : pj_id, build_id, class_name, package_name
    // Returns : (new)class_id
    router.post("/beforeClass", [
        body("pj_id").exists(),
        body("build_id").exists(),
        body("class_name").exists(),
        body("package_name").exists(),
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
        const findBuild = `select ifnull((select build_id from build where pj_id=${pjId} and build_id=${buildId}), -1) build_id;`;
        const newClass = `INSERT into class values (default, '${cname}', '${pname}', ${buildId}, ${pjId});`;
        const findBuildResult = await asyncQuery(findBuild);

        if (findBuildResult[0].build_id === -1) {
            res.statusCode = 400;
            return next(`/beforeClass : There is no such pj_id, build_id\n${findBuild}`);
        } else {
            const newClassResult = await asyncQuery(newClass);

            res.status(200).json({
                "class_id": newClassResult.insertId,
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
        body("start_t").exists()
            .matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
        body("end_t").exists()
            .matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
        body("result").exists()
            .matches(/^[1-3]$/),
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
        const startTime = req.body.start_t;
        const endTime = req.body.end_t;
        const testResult = req.body.result;
        const findClass = `select ifnull((select class_id from class where pj_id=${pjId} and build_id=${buildId} and class_id=${classId}), -1) class_id;`;
        const findClassResult = await asyncQuery(findClass);
        const newMethod = `INSERT into method values (default, '${mname}', '${startTime}', '${endTime}', ${testResult}, ${classId}, ${buildId}, ${pjId});`;
        const findProjectResult = await asyncQuery(`select pj_mail from project where pj_id=${pjId}`);

        if (findClassResult[0].class_id === -1) {
            res.statusCode = 400;
            return next(`/afterMethod : There is no such pj_id, build_id, class_id\n${findClass}`);
        } else {
            if (findProjectResult[0].pj_mail !== "-") {
                const findClassName = `select package_name pname, class_name cname from class where class_id=${classId};`;
                const findClassNameResult = await asyncQuery(findClassName);

                alertMail.addRedis(buildId, `${findClassNameResult[0].pname}%%${findClassNameResult[0].cname}%%${mname}`, testResult);
            }
            await asyncQuery(newMethod);
            res.status(200).json({
                "success": 1,
            });
        }
    }));

    // Params : mail_pj_id
    // Returns : success(1)
    // checkFalsy option assure the mail_pj_id isn't any falsy value.
    router.post("/afterSuite", [body("mail_pj_id").exists({"checkFalsy": true})], (req, res, next) => {
        const err = validationResult(req);

        if (!err.isEmpty()) {
            res.statusCode = 400;
            return next(JSON.stringify(err.array()));
        }

        const pjId = req.body.mail_pj_id;

        // /afterSuite isn't an async function -> So there is no wrapper function -> Must catch the error.
        alertMail.checkMail(pjId).catch(console.error);
        res.status(200).send({
            "success": 1,
        });
    });

    // Params : selectId
    // Returns : result("올바르게 삭제되었습니다." or "Data가 삭제되지 않았습니다.")
    router.post("/deleteData", [body("selectId").exists()], makeAsync(async (req, res, next) => {
        const now = moment().format("YYYY.MM.DD HH:mm:ss");
        const err = validationResult(req);

        if (!req.session.userid) {
            return res.status(403).json({
                "error": "Forbidden",
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
            deleteData = `delete from ${tableName[len]} where ${tableId[len]}=${selectId[len]};`;
            alertMail.delRedis(len, selectId);
        } else {
            res.statusCode = 400;
            return next(`/deleteData : Wrong selectId request\n${selectId}`);
        }

        const deleteDataResult = await asyncQuery(deleteData);

        if (deleteDataResult.affectedRows > 0) {
            console.log(`By ${req.session.userid}, data is deleted : ${now}, ${tableName[len]}(Id : ${selectId[len]})`);

            // Deleting build Case -> Need to update buildrank table
            if (len === 1) {
                const updateBuildRank = `update buildrank set rank = rank-1 where pj_id=${selectId[len - 1]} and build_id<${selectId[len]};insert into buildrank (rank, build_id, pj_id) select b.rn, b.build_id, b.pj_id from (select pj_id, build_id, buildenv, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM build inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC) b where b.pj_id=${selectId[len - 1]} and b.rn =20 group by pj_id, build_id, rn;`;

                await asyncQuery(updateBuildRank);
            }
            res.status(200).json({
                "result": "올바르게 삭제되었습니다.",
            });
        } else {
            res.status(200).json({
                "result": "Data가 삭제되지 않았습니다.",
            });
        }
    }));

    return router;
};
