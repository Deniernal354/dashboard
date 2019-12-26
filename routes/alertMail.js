module.exports = function(asyncQuery, redisClient) {
    const ejs = require("ejs");
    const util = require("util");
    const nodemailer = require("nodemailer");
    const moment = require("moment");
    const asyncLrange = util.promisify(redisClient.LRANGE).bind(redisClient);

    async function sendMail(projectInfo, failedMethods) {
        const now = moment().format("YYYY.MM.DD HH:mm:ss");
        const transporter = nodemailer.createTransport({
            host: "localhost",
            port: 25,
        });

        const mailOption = {
            from: "dashboard@nts-corp.com", // should be changed
            to: projectInfo[0].pj_mail,
            subject: "Dashboard 실패 알림",
            html: await ejs.renderFile(`${__dirname}/../views/mailtemplate.ejs`, {
                "projectName": projectInfo[0].pj_name,
                "projectTeam": projectInfo[0].pj_team,
                "projectPlat": projectInfo[0].pj_platform,
                "projectAuth": projectInfo[0].pj_author,
                "buildTime": now,
                "failedMethods": failedMethods,
            }),
        };

        const info = await transporter.sendMail(mailOption);

        console.log("Message sent: %s", info.accepted[0]);
        transporter.close();
    }

    // buildId, combinedName, testResult is filtered in accessDB.js -> Never be undefined
    function addRedis(buildId, combinedName, testResult) {
        if (testResult === 2) { // fail case
            redisClient.lpush(buildId, combinedName);
        }
    }

    // selectId : [Project Id, Build Id, Class Id, Method Id]
    async function delRedis(deleteUnit, selectId) {
        switch (deleteUnit) {
        case 0: { // project
            const buildIdList = await asyncQuery(`select build_id id from build where pj_id=${selectId[0]}`);

            buildIdList.forEach(key => {
                redisClient.del(key.id);
            });
            break;
        }
        case 1: { // build
            redisClient.del(selectId[1]);
            break;
        }
        case 2: { // class
            const nameInfo = await asyncQuery(`select package_name pn, class_name cn from class where class_id=${selectId[2]};`);
            const criteria = `${nameInfo[0].pn}%%${nameInfo[0].cn}`;
            const allBuild = await asyncLrange(selectId[1], 0, -1);

            allBuild.forEach(value => {
                const lastToken = value.lastIndexOf("%%");

                if (value.substring(0, lastToken) === criteria) {
                    redisClient.lrem(selectId[1], 1, value);
                }
            });
            break;
        }
        case 3: { // method
            const nameInfo = await asyncQuery(`select c.package_name pn, c.class_name cn, m.method_name mn from class c join method m on c.class_id=m.class_id and method_id=${selectId[3]};`);

            redisClient.lrem(selectId[1], 1, `${nameInfo[0].pn}%%${nameInfo[0].cn}%%${nameInfo[0].mn}`);
            break;
        }
        default:
            console.log("here!");
        }
    }

    async function checkMail(pjId) {
        const findPj = `select pj_name, pj_team, pj_platform, pj_author, pj_mail from project where pj_id=${pjId};`;
        const projectInfo = await asyncQuery(findPj);
        const findBu = `select build_id id from buildrank where pj_id=${pjId} and rank<=4 order by rank;`;
        const buildInfo = await asyncQuery(findBu);

        // Only the project & the e-mail address exist
        if ((projectInfo.length !== 0) && (projectInfo[0].pj_mail !== "-") && (buildInfo.length > 2)) {
            const failedMethods = {};
            const nameList = [];

            nameList[0] = await asyncLrange(buildInfo[0].id, 0, -1);
            nameList[1] = await asyncLrange(buildInfo[1].id, 0, -1);
            nameList[2] = await asyncLrange(buildInfo[2].id, 0, -1);

            if (buildInfo.length === 4) {
                redisClient.del(buildInfo[3].id);
            }

            nameList[0].forEach(key => {
                if (nameList[1].includes(key) && nameList[2].includes(key)) {
                    const firstToken = key.indexOf("%%");
                    const lastToken = key.lastIndexOf("%%");
                    const pname = key.substring(0, firstToken);
                    const cname = key.substring(firstToken + 2, lastToken);
                    const mname = key.substring(lastToken + 2);

                    if (!failedMethods[pname]) {
                        failedMethods[pname] = [];
                    }
                    failedMethods[pname].push([cname, mname]);
                }
            });

            // Send a mail only if there is content
            if (Object.keys(failedMethods).length !== 0) {
                sendMail(projectInfo, failedMethods).catch(console.error);
            }
        }
    }

    return {addRedis, delRedis, checkMail};
};
