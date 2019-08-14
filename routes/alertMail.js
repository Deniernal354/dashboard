module.exports = function(pool, redisClient) {
    const ejs = require("ejs");
    const util = require("util");
    const nodemailer = require("nodemailer");

    pool.query = util.promisify(pool.query);

    async function sendMail(projectInfo, failedMethods) {
        const transporter = nodemailer.createTransport({
            host: "localhost",
            port: 25,
        });

        const info = await transporter.sendMail({
            from: "dashboard@nts-corp.com",
            to: "smileansi@nts-corp.com", // projectInfo[0].pj_mail smileansi@nts-corp.com
            subject: "메일 테스트입니다.",
            html: await ejs.renderFile(`${__dirname}/../views/mailtemplate.ejs`, {
                "projectName": projectInfo[0].pj_name,
                "projectTeam": projectInfo[0].pj_team,
                "projectPlat": projectInfo[0].pj_platform,
                "projectAuth": projectInfo[0].pj_author,
                "faildMethods": failedMethods,
            }),
        });

        console.log("Message sent: %s", info.messageId);
        transporter.close();
    }

    // pjId, mname, testResult is filtered in accessDB.js -> Never be undefined
    function addRedis(pjId, mname, testResult) {
        if (testResult === 2) { // fail case
            redisClient.HINCRBY(pjId, mname, 1);
        } else {
            redisClient.HDEL(pjId, mname);
        }
    }

    async function checkMail(pjId) {
        const findPj = `select pj_name, pj_team, pj_platform, pj_author from project where pj_id=${pjId};`;
        const projectInfo = await pool.query(findPj);

        if (projectInfo.length === 0) {
            console.error(`Invalid checkMail Call : There is no project with id(${pjId})`);
        } else {
            const asyncHGETALL = util.promisify(redisClient.HGETALL).bind(redisClient);
            const redisResult = await asyncHGETALL(pjId);
            const failedMethods = [];

            for (const key in redisResult) {
                const value = redisResult[key] * 1;

                if (value >= 3) {
                    failedMethods.push(key);
                }
            }
            sendMail(projectInfo, failedMethods).catch(console.error);
        }
    }

    async function test(pjId) {
        const asyncHGETALL = util.promisify(redisClient.HGETALL).bind(redisClient);
        const redisResult = await asyncHGETALL(pjId);
        const findPj = `select pj_name, pj_team, pj_platform, pj_author from project where pj_id=${pjId};`;
        const projectInfo = await pool.query(findPj);
        const failedMethods = [];

        for (const key in redisResult) {
            const value = redisResult[key] * 1;

            if (value === 3) {
                failedMethods.push(key);
            }
        }

        return {
            projectInfo,
            failedMethods,
        };
    }

    return {addRedis, checkMail, test};
};
