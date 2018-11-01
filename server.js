/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-11-01 15:28:21
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
const server = require('@arted/node/server');
const api = require('./api');


/**
 *****************************************
 * 生成服务器路由
 *****************************************
 */
module.exports = function weChat(options) {
    let wx = api(options),
        app = server.router();

    /* 校验【signature】 */
    app.get('/wechat/', (req, res) => {
        res.send(wx.checkSignature(req.query || {}));
    });

    /* 获取【accessToken】 */
    app.get('/wechat/accessToken', async (req, res, next) => {
        try {
            res.json(await wx.getAccessToken());
        } catch (err) {
            next(err);
        }
    });

    /* 获取【jsApiTicket】 */
    app.get('/wechat/ticket', async (req, res, next) => {
        try {
            res.json(await wx.getApiTicket());
        } catch (err) {
            next(err);
        }
    });

    /* 获取【jsApiConfig】 */
    app.post('/wechat/config', async (req, res, next) => {
        try {
            res.json(await wx.jsApi(req.body || {}));
        } catch (err) {
            next(err);
        }
    });

    // 返回结果
    return app;
};
