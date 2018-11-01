/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-11-01 10:00:45
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import defer from '@arted/node/defer';
import ajax from '@arted/web/ajax';
import script from '@arted/web/script';


/**
 *****************************************
 * 启动微信【sdk】
 *****************************************
 */
async function start({ url = '/api/wechat/config', api = [], debug = true } = {}) {
    let [options] = await Promise.all([
            ajax.post(url, { url: location.href.split('#')[0] }),
            script('//res.wx.qq.com/open/js/jweixin-1.4.0.js')
        ]),
        deferred = defer(),
        wx = window.wx;

    // 初始化配置
    if (wx) {
        let jsApiList = [];

        // 生成【api】列表
        api.forEach(name => {
            switch (name) {
                case 'share':
                    jsApiList.push(
                        'updateAppMessageShareData',
                        'updateTimelineShareData',
                        'onMenuShareWeibo',
                        'onMenuShareQZone'
                    );
                    break;
                default:
                    jsApiList.push(name);
                    break;
            }
        });

        // 启动配置
        wx.config({ debug, jsApiList, ...options });

        // 监听回调
        wx.ready(() => deferred.resolve(Object.create(wx)));
        wx.error(deferred.reject);
    }

    // 返回结果
    return await deferred.promise;
}


/**
 *****************************************
 * 判断是否为信息
 *****************************************
 */
export function isWeChat() {
    return navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1;
}


/**
 *****************************************
 * 创建微信进口
 *****************************************
 */
export default async function load(options) {

    // 判断是否在微信浏览器
    if (!isWeChat) {
        throw new Error('请在微信浏览器中使用些接口');
    }

    // 加载配置
    if (!load.result) {
        load.result = await start(options || {});
    }

    // 返回结果
    return Object.assign(load.result, { share });
}


/**
 *****************************************
 * 分享配置
 *****************************************
 */
export function share(options) {
    let wx = load.result;

    // 添加回调
    wx.updateAppMessageShareData(options);
    wx.updateTimelineShareData(options);
    wx.onMenuShareWeibo(options);
    wx.onMenuShareQZone(options);
}
