module.exports = function(pool, redisClient) {
    const ejs = require("ejs");
    const util = require("util");
    const nodemailer = require("nodemailer");

    pool.query = util.promisify(pool.query);

    async function sendMail(projectInfo, failedMethods, now) {
        const transporter = nodemailer.createTransport({
            host: "localhost",
            port: 25,
        });

        const info = await transporter.sendMail({
            from: "dashboard@nts-corp.com",
            to: projectInfo[0].pj_mail,
            subject: "메일 테스트입니다.",
            html: await ejs.renderFile(`${__dirname}/../views/mailtemplate.ejs`, {
                "projectName": projectInfo[0].pj_name,
                "projectTeam": projectInfo[0].pj_team,
                "projectPlat": projectInfo[0].pj_platform,
                "projectAuth": projectInfo[0].pj_author,
                "buildTime": now,
                "failedMethods": failedMethods,
            }),
        });

        console.log("Message sent: %s", info.messageId);
        transporter.close();
    }

    // pjId, combinedName, testResult is filtered in accessDB.js -> Never be undefined
    function addRedis(pjId, combinedName, testResult) {
        if (testResult === 2) { // fail case
            redisClient.HINCRBY(pjId, combinedName, 1);
        } else {
            redisClient.HDEL(pjId, combinedName);
        }
    }

    async function checkMail(pjId, now) {
        const findPj = `select pj_name, pj_team, pj_platform, pj_author, pj_mail from project where pj_id=${pjId};`;
        const projectInfo = await pool.query(findPj);

        if (projectInfo.length === 0 || projectInfo[0].pj_mail === "-") {
            console.error(`Invalid checkMail Call : There is no project or no e-mail address with id(${pjId})`);
        } else {
            const asyncHGETALL = util.promisify(redisClient.HGETALL).bind(redisClient);
            const redisResult = await asyncHGETALL(pjId);
            const failedMethods = {};

            for (const key in redisResult) {
                const value = redisResult[key] * 1;
                const firstToken = key.indexOf("%%");
                const lastToken = key.lastIndexOf("%%");
                const pname = key.substring(0, firstToken);
                const cname = key.substring(firstToken + 2, lastToken);
                const mname = key.substring(lastToken + 2);

                if (value >= 3) {
                    if (!failedMethods[pname]) {
                        failedMethods[pname] = [];
                    }
                    failedMethods[pname].push([cname, mname]);
                }
            }

            if (Object.keys(failedMethods).length !== 0) {
                sendMail(projectInfo, failedMethods, now).catch(console.error);
            }
        }
    }

    return {addRedis, checkMail};
};
