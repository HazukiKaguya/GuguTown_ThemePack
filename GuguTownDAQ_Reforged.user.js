// ==UserScript==
// @name         咕咕镇数据采集
// @namespace    https://greasyfork.org/users/448113
// @version      1.6.1.1
// @description  咕咕镇数据采集，目前采集已关闭，兼作助手
// @author       paraii & zyxboy
// @match        https://www.guguzhen.com/*
// @match        https://www.momozhen.com/*
// @grant        GM_xmlhttpRequest
// @connect      www.guguzhen.com
// @connect      www.momozhen.com
// @license      MIT License
// @updateURL    https://github.com/HazukiKaguya/GuguTown_ThemePack/raw/main/GuguTownDAQ_Reforged.user.js
// ==/UserScript==
(function() {
    'use strict'

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // common utilities
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const g_modificationVersion = '2022-09-17 02:22:22';

    const g_navigatorSelector = 'div.panel > div.panel-body > div.row > div.col-md-10 > div > ';
    let kfUserSpan = document.querySelector(g_navigatorSelector + 'span.fyg_colpz06.fyg_f24');
    const g_kfUser = kfUserSpan.innerText;

    const g_guguzhenHome = '/fyg_index.php';
    const g_guguzhenPK = '/fyg_pk.php';
    const g_guguzhenEquip = '/fyg_equip.php';
    const g_guguzhenWish = '/fyg_wish.php';
    const g_guguzhenBeach = '/fyg_beach.php';
    const g_guguzhenGift = '/fyg_gift.php';
    const g_guguzhenShop = '/fyg_shop.php';

    const g_autoTaskEnabledStorageKey = g_kfUser + '_autoTaskEnabled';
    const g_autoTaskCheckStoneProgressStorageKey = g_kfUser + '_autoTaskCheckStoneProgress';
    const g_indexRallyStorageKey = g_kfUser + '_indexRally';
    const g_keepPkRecordStorageKey = g_kfUser + '_keepPkRecord';
    const g_amuletGroupsStorageKey = g_kfUser + '_amulet_groups';
    const g_equipmentExpandStorageKey = g_kfUser + '_equipment_Expand';
    const g_equipmentStoreExpandStorageKey = g_kfUser + '_equipment_StoreExpand';
    const g_equipmentBGStorageKey = g_kfUser + '_equipment_BG';
    const g_stoneProgressEquipTipStorageKey = g_kfUser + '_stone_ProgressEquipTip';
    const g_stoneProgressCardTipStorageKey = g_kfUser + '_stone_ProgressCardTip';
    const g_stoneProgressHaloTipStorageKey = g_kfUser + '_stone_ProgressHaloTip';
    const g_forgeAutoStorageKey = g_kfUser + '_forgeAuto';
    const g_stoneAuto1StorageKey = g_kfUser + '_stoneAuto1';
    const g_stoneAuto2StorageKey = g_kfUser + '_stoneAuto2';
    const g_stoneAuto3StorageKey = g_kfUser + '_stoneAuto3';
    const g_stoneAuto4StorageKey = g_kfUser + '_stoneAuto4';
    const g_stoneAuto5StorageKey = g_kfUser + '_stoneAuto5';
    const g_stoneAuto6StorageKey = g_kfUser + '_stoneAuto6';
    const g_ignoreWishpoolExpirationStorageKey = g_kfUser + '_ignoreWishpoolExpiration';
    const g_beachForceExpandStorageKey = g_kfUser + '_beach_forceExpand';
    const g_beachBGStorageKey = g_kfUser + '_beach_BG';

    const g_userDataStorageKeyConfig = [ g_kfUser, g_autoTaskEnabledStorageKey, g_autoTaskCheckStoneProgressStorageKey,
                                         g_indexRallyStorageKey, g_keepPkRecordStorageKey, g_amuletGroupsStorageKey,g_forgeAutoStorageKey,
                                         g_stoneAuto1StorageKey,g_stoneAuto2StorageKey,g_stoneAuto3StorageKey,
                                         g_stoneAuto4StorageKey,g_stoneAuto5StorageKey,g_stoneAuto6StorageKey,
                                         g_equipmentExpandStorageKey, g_equipmentStoreExpandStorageKey, g_equipmentBGStorageKey,
                                         g_stoneProgressEquipTipStorageKey, g_stoneProgressCardTipStorageKey,
                                         g_stoneProgressHaloTipStorageKey, g_ignoreWishpoolExpirationStorageKey,
                                         g_beachForceExpandStorageKey, g_beachBGStorageKey ];

    const g_beachIgnoreStoreMysEquipStorageKey = g_kfUser + '_beach_ignoreStoreMysEquip';
    const g_userDataStorageKeyExtra = [ g_beachIgnoreStoreMysEquipStorageKey, 'attribute', 'cardName',
                                       'title', 'over', 'halo_max', 'beachcheck', 'dataReward', 'keepcheck' ];

    const USER_STORAGE_RESERVED_SEPARATORS = /[:;,|=+*%!#$&?<>{}^`"\\\/\[\]\r\n\t\v\s]/;
    const USER_STORAGE_KEY_VALUE_SEPARATOR = ':';

    kfUserSpan.style.cursor = 'pointer';
    kfUserSpan.onclick = (() => { window.location.href = g_guguzhenHome; });

    console.log(g_kfUser)

    // perform a binary search. array must be sorted, but no matter in ascending or descending order.
    // in this manner, you must pass in a proper comparer function for it works properly, aka, if the
    // array was sorted in ascending order, then the comparer(a, b) should return a negative value
    // while a < b or a positive value while a > b; otherwise, if the array was sorted in descending
    // order, then the comparer(a, b) should return a positive value while a < b or a negative value
    // while a > b, and in both, if a equals b, the comparer(a, b) should return 0. if you pass nothing
    // or null / undefined value as comparer, then you must make sure about that the array was sorted
    // in ascending order.
    //
    // in this particular case, we just want to check whether the array contains the value or not, we
    // don't even need to point out the first place where the value appears (if the array actually
    // contains the value), so we perform a simplest binary search and return an index (may not the
    // first place where the value appears) or a negative value (means value not found) to indicate
    // the search result.
    function searchElement(array, value, fnComparer) {
        if (array?.length > 0) {
            fnComparer ??= ((a, b) => a < b ? -1 : (a > b ? 1 : 0));
            let li = 0;
            let hi = array.length - 1;
            while (li <= hi) {
                let mi = ((li + hi) >> 1);
                let cr = fnComparer(value, array[mi]);
                if (cr == 0) {
                    return mi;
                }
                else if (cr > 0) {
                    li = mi + 1;
                }
                else {
                    hi = mi - 1;
                }
            }
        }
        return -1;
    }

    // perform a binary insertion. the array and comparer must exactly satisfy as it in the searchElement
    // function. this operation behaves sort-stable, aka, the newer inserting element will be inserted
    // into the position after any existed equivalent elements.
    function insertElement(array, value, fnComparer) {
        if (array != null) {
            fnComparer ??= ((a, b) => a < b ? -1 : (a > b ? 1 : 0));
            let li = 0;
            let hi = array.length - 1;
            while (li <= hi) {
                let mi = ((li + hi) >> 1);
                let cr = fnComparer(value, array[mi]);
                if (cr >= 0) {
                    li = mi + 1;
                }
                else {
                    hi = mi - 1;
                }
            }
            array.splice(li, 0, value);
            return li;
        }
        return -1;
    }

    // it's not necessary to have newArray been sorted, but the oldArray must be sorted since we are calling
    // searchElement. if there are some values should be ignored in newArray, the comparer(a, b) should be
    // implemented as return 0 whenever parameter a equals any of values that should be ignored.
    function findNewObjects(newArray, oldArray, fnComparer, findIndices) {
        let newObjects = [];
        for (let i = (newArray?.length ?? 0) - 1; i >= 0; i--) {
            if (searchElement(oldArray, newArray[i], fnComparer) < 0) {
                newObjects.unshift(findIndices ? i : newArray[i]);
            }
        }
        return newObjects;
    }

    function loadUserConfigData() {
        return JSON.parse(localStorage.getItem(g_kfUser));
    }

    function saveUserConfigData(json) {
        localStorage.setItem(g_kfUser, JSON.stringify(json));
    }

    function getPostData(functionPattern, dataPattern) {
        let sc = document.getElementsByTagName('script');
        for (let i = (sc?.length ?? 0) - 1; i >= 0 ; i--) {
            let func = sc[i].innerText.match(functionPattern);
            if (func != null) {
                return func[0].match(dataPattern)[0];
            }
        }
        return null;
    }

    // generic configuration items represented using checkboxes
    const g_configCheckboxMap = new Map();
    function setupConfigCheckbox(checkbox, configKey, fnPostProcess, fnParams) {
        g_configCheckboxMap.set(configKey, { postProcess : fnPostProcess , params : fnParams });
        checkbox.setAttribute('config-key', configKey);
        checkbox.checked = (localStorage.getItem(configKey) == 'true');
        checkbox.onchange = ((e) => {
            let key = e.target.getAttribute('config-key');
            let cfg = g_configCheckboxMap.get(key);
            if (cfg != null) {
                localStorage.setItem(key, e.target.checked);
                if (cfg.postProcess != null) {
                    cfg.postProcess(e.target.checked, cfg.params);
                }
            }
        });
        return checkbox.checked;
    }

    // HTTP requests
    var g_httpRequests = [];
    function httpRequestRegister(request) {
        if (request != null) {
            g_httpRequests.push(request);
        }
    }

    function httpRequestAbortAll() {
        while (g_httpRequests.length > 0) {
            g_httpRequests.pop().abort();
        }
        g_httpRequests = [];
    }

    function httpRequestClearAll() {
        g_httpRequests = [];
    }

    // read objects from bag and store with title filter
    let domainNow='guguzhen'
    if(window.location.href.indexOf('momozhen') > -1)domainNow='momozhen';
    const g_postMethod = 'POST'
    const g_readUrl = 'https://www.'+domainNow+'.com/fyg_read.php'
    const g_postUrl = 'https://www.'+domainNow+'.com/fyg_click.php'
    const g_postHeader = { 'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8' , 'Cookie' : document.cookie };
    const g_networkTimeoutMS = 120 * 1000;
    function beginReadObjects(bag, store, fnFurtherProcess, fnParams) {
        if (bag != null || store != null) {
            let request = GM_xmlhttpRequest({
                method: g_postMethod,
                url: g_readUrl,
                headers: g_postHeader,
                data: 'f=7',
                onload: response => {
                    let div = document.createElement('div');
                    div.innerHTML = response.responseText;

                    if (bag != null) {
                        div.querySelectorAll('div.alert-danger > div.content > button.fyg_mp3')?.forEach((e) => { bag.push(e); });
                    }
                    if (store != null) {
                        div.querySelectorAll('div.alert-success > div.content > button.fyg_mp3')?.forEach((e) => { store.push(e); });
                    }

                    if (fnFurtherProcess != null) {
                        fnFurtherProcess(fnParams);
                    }
                }
            });
            httpRequestRegister(request);
        }
        else if (fnFurtherProcess != null) {
            fnFurtherProcess(fnParams);
        }
    }

    function beginReadObjectIds(bagIds, storeIds, key, ignoreEmptyCell, fnFurtherProcess, fnParams) {
        function parseObjectIds() {
            if (bagIds != null) {
                objectIdParseNodes(bag, bagIds, key, ignoreEmptyCell);
            }
            if (storeIds != null) {
                objectIdParseNodes(store, storeIds, key, ignoreEmptyCell);
            }
            if (fnFurtherProcess != null) {
                fnFurtherProcess(fnParams);
            }
        }

        let bag, store;
        if (bagIds != null || storeIds != null) {
            beginReadObjects(bag = [], store = [], parseObjectIds, null);
        }
        else if (fnFurtherProcess != null) {
            fnFurtherProcess(fnParams);
        }
    }

    function objectIdParseNodes(nodes, ids, key, ignoreEmptyCell) {
        for (let node of nodes) {
            if (node.className?.endsWith('fyg_mp3') || node.className?.endsWith('fyg_mp3 fyg_tc')) {
                let id = node.getAttribute('onclick')?.match(/\d+/)[0];
                if (id != undefined) {
                    if (objectMatchTitle(node, key)) {
                        ids.push(parseInt(id));
                    }
                }
                else if (!ignoreEmptyCell) {
                    ids.push(-1);
                }
            }
        }
    }

    function objectMatchTitle(node, key){
        return (!(key?.length > 0) || (node.getAttribute('data-original-title') ??
                                       node.getAttribute('title'))?.indexOf(key) >= 0);
    }

    // we wait the response(s) of the previous batch of request(s) to send another batch of request(s)
    // rather than simply send them all within an inside foreach - which could cause too many requests
    // to server simultaneously, that can be easily treated as D.D.O.S attack and therefor leads server
    // to returns http status 503: Service Temporarily Unavailable
    // * caution * the parameter 'objects' is required been sorted by their indices in ascending order
    const g_ConcurrentRequestCount = { min : 1 , max : 8 , default : 4 };
    const g_object_move_path = { bag2store : 0 , store2bag : 1 , bag2beach : 2 , beach2bag : 3 };
    const g_object_move_data = [ null, null, null, null ];
    var g_maxConcurrentRequests = g_ConcurrentRequestCount.default;
    var g_objectMoveRequestsCount = 0;
    var g_objectMoveTargetSiteFull = false;
    function beginMoveObjects(objects, path, fnFurtherProcess, fnParams) {
        if (!g_objectMoveTargetSiteFull && objects?.length > 0) {
            g_object_move_data[g_object_move_path.bag2store] ??= (getPostData(/puti\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/)?.slice(7, -1) ?? '');
            g_object_move_data[g_object_move_path.store2bag] ??= (getPostData(/puto\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/)?.slice(7, -1) ?? '');
            g_object_move_data[g_object_move_path.bag2beach] ??= (getPostData(/stdel\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/)?.slice(7, -1) ?? '');
            g_object_move_data[g_object_move_path.beach2bag] ??= (getPostData(/stpick\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/)?.slice(7, -1) ?? '');

            if (!(g_object_move_data[path]?.length > 0)) {
                if (!(g_object_move_data[g_object_move_path.store2bag]?.length > 0) &&
                      g_object_move_data[g_object_move_path.bag2store]?.length > 0) {
                    g_object_move_data[g_object_move_path.store2bag] =
                        g_object_move_data[g_object_move_path.bag2store].replace('c=21&', 'c=22&');
                }
                if (!(g_object_move_data[g_object_move_path.bag2store]?.length > 0) &&
                      g_object_move_data[g_object_move_path.store2bag]?.length > 0) {
                    g_object_move_data[g_object_move_path.bag2store] =
                        g_object_move_data[g_object_move_path.store2bag].replace('c=22&', 'c=21&');
                }
                if (!(g_object_move_data[g_object_move_path.bag2beach]?.length > 0) &&
                      g_object_move_data[g_object_move_path.beach2bag]?.length > 0) {
                    g_object_move_data[g_object_move_path.bag2beach] =
                        g_object_move_data[g_object_move_path.beach2bag].replace('c=1&', 'c=7&');
                }
                if (!(g_object_move_data[g_object_move_path.beach2bag]?.length > 0) &&
                      g_object_move_data[g_object_move_path.bag2beach]?.length > 0) {
                    g_object_move_data[g_object_move_path.beach2bag] =
                        g_object_move_data[g_object_move_path.bag2beach].replace('c=7&', 'c=1&');
                }
            }

            if (g_object_move_data[path].length > 0) {
                let ids = [];
                while (ids.length < g_maxConcurrentRequests && objects.length > 0) {
                    let id = objects.pop();
                    if (id >= 0) {
                        ids.push(id);
                    }
                }
                if ((g_objectMoveRequestsCount = ids.length) > 0) {
                    while (ids.length > 0) {
                        let request = GM_xmlhttpRequest({
                            method: g_postMethod,
                            url: g_postUrl,
                            headers: g_postHeader,
                            data: g_object_move_data[path].replace('"+id+"', ids.shift()),
                            onload: response => {
                                if (path != g_object_move_path.bag2beach && response.responseText != 'ok') {
                                    g_objectMoveTargetSiteFull = true;
                                    console.log(response.responseText);
                                }
                                if (--g_objectMoveRequestsCount == 0) {
                                    beginMoveObjects(objects, path, fnFurtherProcess, fnParams);
                                }
                            }
                        });
                        httpRequestRegister(request);
                    }
                    return;
                }
            }
        }
        g_objectMoveTargetSiteFull = false;
        if (fnFurtherProcess != null) {
            fnFurtherProcess(fnParams);
        }
    }

    const g_pirl_verify_data = '124';
    var g_pirl_data = null;
    var g_objectPirlRequestsCount = 0;
    function beginPirlObjects(objects, fnFurtherProcess, fnParams) {
        if (objects?.length > 0) {
            g_pirl_data ??= (getPostData(/pirl\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*\+pirlyz\+.*"/)?.
                             slice(7, -1).replace('"+pirlyz+"', g_pirl_verify_data) ?? '');
            if (g_pirl_data.length > 0) {
                let ids = [];
                while (ids.length < g_maxConcurrentRequests && objects.length > 0) {
                    ids.push(objects.pop());
                }
                if ((g_objectPirlRequestsCount = ids.length) > 0) {
                    while (ids.length > 0) {
                        let request = GM_xmlhttpRequest({
                            method: g_postMethod,
                            url: g_postUrl,
                            headers: g_postHeader,
                            data: g_pirl_data.replace('"+id+"', ids.shift()),
                            onload: response => {
                                if (!/\d+/.test(response.responseText.trim()) && response.responseText.indexOf('果核') < 0) {
                                    console.log(response.responseText);
                                }
                                if (--g_objectPirlRequestsCount == 0) {
                                    beginPirlObjects(objects, fnFurtherProcess, fnParams);
                                }
                            }
                        });
                        httpRequestRegister(request);
                    }
                    return;
                }
            }
        }
        if (fnFurtherProcess != null) {
            fnFurtherProcess(fnParams);
        }
    }

    // read currently mounted role card and halo informations
    // roleInfo = [ roleId, roleName ]
    // haloInfo = [ haloPoints, haloSlots, [ haloItem1, haloItem2, ... ] ]
    function beginReadRoleAndHalo(roleInfo, haloInfo, fnFurtherProcess, fnParams) {
        let asyncOperations = 0;
        let error = 0;
        let requestRole;
        let requestHalo;

        if (roleInfo != null) {
            asyncOperations++;
            requestRole = GM_xmlhttpRequest({
                method: g_postMethod,
                url: g_readUrl,
                headers: g_postHeader,
                data: 'f=9',
                onload: response => {
                    let div = document.createElement('div');
                    div.innerHTML = response.responseText;
                    let role = g_roleMap.get(div.querySelector('div.text-info.fyg_f24.fyg_lh60')?.children[0]?.innerText);
                    if (role != undefined) {
                        roleInfo.push(role.id);
                        roleInfo.push(role.name);
                    }
                    asyncOperations--;
                },
                onerror : err => {
                    error++;
                    asyncOperations--;
                },
                ontimeout : err => {
                    error++;
                    asyncOperations--;
                }
            });
        }

        if (haloInfo != null) {
            asyncOperations++;
            requestHalo = GM_xmlhttpRequest({
                method: g_postMethod,
                url: g_readUrl,
                headers: g_postHeader,
                data: 'f=5',
                onload: response => {
                    let haloPS = response.responseText.match(/<h3>[^\d]*(\d+)[^\d]*(\d+)[^<]+<\/h3>/);
                    if (haloPS?.length == 3) {
                        haloInfo.push(parseInt(haloPS[1]));
                        haloInfo.push(parseInt(haloPS[2]));
                    }
                    else {
                        haloInfo.push(0);
                        haloInfo.push(0);
                    }

                    let halo = [];
                    for (let item of response.responseText.matchAll(/halotfzt2\((\d+)\)/g)) {
                        halo.push(item[1]);
                    }
                    haloInfo.push(halo);
                    asyncOperations--;
                },
                onerror : err => {
                    error++;
                    asyncOperations--;
                },
                ontimeout : err => {
                    error++;
                    asyncOperations--;
                }
            });
        }

        let timeout = 0;
        let timer = setInterval(() => {
            if (asyncOperations == 0 || error > 0 || (++timeout * 200) >= g_networkTimeoutMS) {
                clearInterval(timer);
                if (asyncOperations > 0) {
                    requestRole?.abort();
                    requestHalo?.abort();
                }
                if (fnFurtherProcess != null) {
                    fnFurtherProcess(fnParams);
                }
            }
        }, 200);
    }

    function beginReadWishpool(points, misc, fnFurtherProcess, fnParams) {
        GM_xmlhttpRequest({
            method: g_postMethod,
            url: g_readUrl,
            headers: g_postHeader,
            data: `f=19`,
            onload: response => {
                let a = response.responseText.split('#');
                if (misc != null) {
                    misc[0] = a[0];
                    misc[1] = a[1];
                    misc[2] = a[2];
                }
                if (points != null) {
                    for (let i = a.length - 1; i >= 3; i--) {
                        points[i - 3] = a[i];
                    }
                }
                if (fnFurtherProcess != null) {
                    fnFurtherProcess(fnParams);
                }
            }
        });
    }

    function beginReadStoneProgress(progresses, stones, fnFurtherProcess, fnParams) {
        GM_xmlhttpRequest({
            method: g_postMethod,
            url: g_readUrl,
            headers: g_postHeader,
            data: `f=21`,
            onload: response => {
                let div = document.createElement('div');
                div.innerHTML = response.responseText;

                if (progresses != null) {
                    let equipProgresses = div.querySelectorAll('span.fyg_f24');
                    if (equipProgresses?.length == 3) {
                        for (let prog of equipProgresses) {
                            progresses.push(prog.innerText ?? '');
                        }
                    }
                }
                if (stones != null) {
                    let stoneInfos = div.querySelectorAll('div.col-sm-2.fyg_tc > button.btn');
                    if (stoneInfos?.length == 6) {
                        for (let stone of stoneInfos) {
                            let type = (stone.getAttribute('onclick')?.match(/\d+/)?.[0] ?? '0');
                            let infos = stone.innerHTML?.match(/(.石)（上限(\d+)）.+?>(\d+)</m);
                            if (infos?.length == 4) {
                                stones.push({ type : parseInt(type), name : infos[1], max : parseInt(infos[2]), current : parseInt(infos[3]) });
                            }
                        }
                    }
                }

                if (fnFurtherProcess != null) {
                    fnFurtherProcess(fnParams);
                }
            }
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // amulet management
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const AMULET_STORAGE_GROUP_SEPARATOR = '|';
    const AMULET_STORAGE_GROUPNAME_SEPARATOR = '=';
    const AMULET_STORAGE_AMULET_SEPARATOR = ',';
    const AMULET_TYPE_ID_FACTOR = 100000000000000;
    const AMULET_LEVEL_ID_FACTOR = 10000000000000;
    const AMULET_ENHANCEMENT_FACTOR = 1000000000000;
    const AMULET_BUFF_MAX_FACTOR = AMULET_ENHANCEMENT_FACTOR;

    const g_amuletDefaultLevelIds = {
        start : 0,
        end : 2,
        稀有 : 0,
        史诗 : 1,
        传奇 : 2
    };
    const g_amuletDefaultTypeIds = {
        start : 2,
        end : 4,
        苹果 : 0,
        葡萄 : 1,
        樱桃 : 2
    };
    const g_amuletDefaultLevelNames = [ '稀有', '史诗', '传奇' ];
    const g_amuletDefaultTypeNames = [ '苹果', '葡萄', '樱桃' ];
    const g_amuletBuffs = [
        { index : -1 , name : '力量' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'STR' },
        { index : -1 , name : '敏捷' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'AGI' },
        { index : -1 , name : '智力' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'INT' },
        { index : -1 , name : '体魄' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'VIT' },
        { index : -1 , name : '精神' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'SPR' },
        { index : -1 , name : '意志' , type : 0 , maxValue : 80 , unit : '点' , shortMark : 'MND' },
        { index : -1 , name : '物理攻击' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'PATK' },
        { index : -1 , name : '魔法攻击' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'MATK' },
        { index : -1 , name : '速度' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'SPD' },
        { index : -1 , name : '生命护盾回复效果' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'REC' },
        { index : -1 , name : '最大生命值' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'HP' },
        { index : -1 , name : '最大护盾值' , type : 1 , maxValue : 10 , unit : '%' , shortMark : 'SLD' },
        { index : -1 , name : '固定生命偷取' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'LCH' },
        { index : -1 , name : '固定反伤' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'RFL' },
        { index : -1 , name : '固定暴击几率' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'CRT' },
        { index : -1 , name : '固定技能几率' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'SKL' },
        { index : -1 , name : '物理防御效果' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'PDEF' },
        { index : -1 , name : '魔法防御效果' , type : 2 , maxValue : 10 , unit : '%' , shortMark : 'MDEF' }
    ];
    const g_amuletBuffMap = new Map();
    g_amuletBuffs.forEach((item, index) => {
        item.index = index;
        g_amuletBuffMap.set(item.index, item);
        g_amuletBuffMap.set(item.name, item);
        g_amuletBuffMap.set(item.shortMark, item);
    });

    var g_amuletLevelIds = g_amuletDefaultLevelIds;
    var g_amuletTypeIds = g_amuletDefaultTypeIds;
    var g_amuletLevelNames = g_amuletDefaultLevelNames;
    var g_amuletTypeNames = g_amuletDefaultTypeNames;

    function amuletLoadTheme(theme) {
        g_amuletLevelNames = theme.dessertlevel;
        g_amuletTypeNames = theme.dessertname;
        g_amuletLevelIds = {
            start : 0,
            end : theme.dessertlevel[0].length
        };
        g_amuletTypeIds = {
            start : theme.dessertlevel[0].length,
            end : theme.dessertlevel[0].length + theme.dessertname[0].length
        };
        for (let i = g_amuletLevelNames.length - 1; i >= 0; i--) {
            g_amuletLevelIds[g_amuletLevelNames[i].slice(0, g_amuletLevelIds.end - g_amuletLevelIds.start)] = i;
        }
        for (let i = g_amuletTypeNames.length - 1; i >= 0; i--) {
            g_amuletTypeIds[g_amuletTypeNames[i].slice(0, g_amuletTypeIds.end - g_amuletTypeIds.start)] = i;
        }
    }

    function Amulet() {
        this.id = -1;
        this.type = -1;
        this.level = 0;
        this.enhancement = 0;
        this.buffCode = 0;
        this.text = null;

        this.reset = (() => {
            this.id = -1;
            this.type = -1;
            this.level = 0;
            this.enhancement = 0;
            this.buffCode = 0;
            this.text = null;
        });

        this.isValid = (() => {
            return (this.type >= 0 && this.type <= 2 && this.buffCode > 0);
        });

        this.fromCode = ((code) => {
            if (!isNaN(code)) {
                this.type = Math.trunc(code / AMULET_TYPE_ID_FACTOR) % 10;
                this.level = Math.trunc(code / AMULET_LEVEL_ID_FACTOR) % 10;
                this.enhancement = Math.trunc(code / AMULET_ENHANCEMENT_FACTOR) % 10;
                this.buffCode = code % AMULET_BUFF_MAX_FACTOR;
            }
            else {
                this.reset();
            }
            return (this.isValid() ? this : null);
        });

        this.fromBuffText = ((text) => {
            if (text?.length > 0) {
                let nb = text.split(' = ');
                if (nb.length == 2) {
                    this.id = -1;
                    this.type = (g_amuletTypeIds[nb[0].slice(g_amuletTypeIds.start, g_amuletTypeIds.end)] ??
                                 g_amuletDefaultTypeIds[nb[0].slice(g_amuletDefaultTypeIds.start, g_amuletDefaultTypeIds.end)]);
                    this.level = (g_amuletLevelIds[nb[0].slice(g_amuletLevelIds.start, g_amuletLevelIds.end)] ??
                                  g_amuletDefaultLevelIds[nb[0].slice(g_amuletDefaultLevelIds.start, g_amuletDefaultLevelIds.end)]);
                    this.enhancement = parseInt(nb[0].match(/\d+/)[0]);
                    this.buffCode = 0;
                    nb[1].replaceAll(/(\+)|( 点)|( %)/g, '').split(',').forEach((buff) => {
                        let nv = buff.trim().split(' ');
                        this.buffCode += ((100 ** (g_amuletBuffMap.get(nv[0]).index % 6)) * parseInt(nv[1]));
                    });
                    if (this.isValid()) {
                        this.text = nb[1];
                        return this;
                    }
                }
            }
            this.reset();
            return null;
        });

        this.fromNode = ((node) => {
            if ((node?.className?.endsWith('fyg_mp3') || node.className?.endsWith('fyg_mp3 fyg_tc')) && node.innerText.indexOf('+') >= 0) {
                let id = node.getAttribute('onclick');
                let typeName = (node.getAttribute('data-original-title') ?? node.getAttribute('title'));
                let content = node.getAttribute('data-content');
                if (id != null && typeName?.length > 4 && content?.length > 0 &&
                    !isNaN(this.type = (g_amuletTypeIds[typeName.slice(g_amuletTypeIds.start, g_amuletTypeIds.end)] ??
                                        g_amuletDefaultTypeIds[typeName.slice(g_amuletDefaultTypeIds.start, g_amuletDefaultTypeIds.end)])) &&
                    !isNaN(this.level = (g_amuletLevelIds[typeName.slice(g_amuletLevelIds.start, g_amuletLevelIds.end)] ??
                                         g_amuletDefaultLevelIds[typeName.slice(g_amuletDefaultLevelIds.start, g_amuletDefaultLevelIds.end)])) &&
                    !isNaN(this.id = parseInt(id.match(/\d+/)[0])) &&
                    !isNaN(this.enhancement = parseInt(node.innerText.match(/\d+/)[0]))) {

                    this.buffCode = 0;
                    this.text = '';
                    let attr = null;
                    let regex = /<p[^>]*>([^<]+)<[^>]*>\+(\d+)[^<]*<\/span><\/p>/g;
                    while ((attr = regex.exec(content))?.length == 3) {
                        let buffMeta = g_amuletBuffMap.get(attr[1]);
                        if (buffMeta != null) {
                            this.buffCode += ((100 ** (buffMeta.index % 6)) * attr[2]);
                            this.text += `${this.text.length > 0 ? ', ' : ''}${attr[1]} +${attr[2]} ${buffMeta.unit}`;
                        }
                    }
                    if (this.isValid()) {
                        return this;
                    }
                }
            }
            this.reset();
            return null;
        });

        this.fromAmulet = ((amulet) => {
            if (amulet?.isValid()) {
                this.id = amulet.id;
                this.type = amulet.type;
                this.level = amulet.level;
                this.enhancement = amulet.enhancement;
                this.buffCode = amulet.buffCode;
                this.text = amulet.text;
            }
            else {
                this.reset();
            }
            return (this.isValid() ? this : null);
        });

        this.getCode = (() => {
            if (this.isValid()) {
                return (this.type * AMULET_TYPE_ID_FACTOR +
                        this.level * AMULET_LEVEL_ID_FACTOR +
                        this.enhancement * AMULET_ENHANCEMENT_FACTOR +
                        this.buffCode);
            }
            return -1;
        });

        this.getBuff = (() => {
            let buffs = {};
            if (this.isValid()) {
                let code = this.buffCode;
                let type = this.type * 6;
                g_amuletBuffs.slice(type, type + 6).forEach((buff) => {
                    let v = (code % 100);
                    if (v > 0) {
                        buffs[buff.name] = v;
                    }
                    code = Math.trunc(code / 100);
                });
            }
            return buffs;
        });

        this.getTotalPoints = (() => {
            let points = 0;
            if (this.isValid()) {
                let code = this.buffCode;
                for(let i = 0; i < 6; i++) {
                    points += (code % 100);
                    code = Math.trunc(code / 100);
                }
            }
            return points;
        });

        this.formatName = (() => {
            if (this.isValid()) {
                return `${g_amuletLevelNames[this.level]}${g_amuletTypeNames[this.type]} (+${this.enhancement})`;
            }
            return null;
        });

        this.formatBuff = (() => {
            if (this.isValid()) {
                if (this.text?.length > 0) {
                    return this.text;
                }
                this.text = '';
                let buffs = this.getBuff();
                for (let buff in buffs) {
                    this.text += `${this.text.length > 0 ? ', ' : ''}${buff} +${buffs[buff]} ${g_amuletBuffMap.get(buff).unit}`;
                }
            }
            return this.text;
        });

        this.formatBuffText = (() => {
            if (this.isValid()) {
                return this.formatName() + ' = ' + this.formatBuff();
            }
            return null;
        });

        this.formatShortMark = (() => {
            let text = this.formatBuff()?.replaceAll(/(\+)|( 点)|( %)/g, '');
            if (text?.length > 0) {
                for (let buff in this.getBuff()) {
                    text = text.replaceAll(buff, g_amuletBuffMap.get(buff).shortMark);
                }
                return this.formatName() + ' = ' + text;
            }
            return null;
        });

        this.compareMatch = ((other, ascType) => {
            if (!this.isValid()) {
                return 1;
            }
            else if (!other?.isValid()) {
                return -1;
            }

            let delta = other.type - this.type;
            if (delta != 0) {
                return (ascType ? -delta : delta);
            }
            return (other.buffCode - this.buffCode);
        });

        this.compareTo = ((other, ascType) => {
            if (!this.isValid()) {
                return 1;
            }
            else if (!other?.isValid()) {
                return -1;
            }

            let delta = other.type - this.type;
            if (delta != 0) {
                return (ascType ? -delta : delta);
            }

            let tbuffs = this.formatBuffText().split(' = ')[1].replaceAll(/(\+)|( 点)|( %)/g, '').split(', ');
            let obuffs = other.formatBuffText().split(' = ')[1].replaceAll(/(\+)|( 点)|( %)/g, '').split(', ');
            let bl = Math.min(tbuffs.length, obuffs.length);
            for (let i = 0; i < bl; i++) {
                let tbuff = tbuffs[i].split(' ');
                let obuff = obuffs[i].split(' ');
                if ((delta = g_amuletBuffMap.get(tbuff[0]).index - g_amuletBuffMap.get(obuff[0]).index) != 0 ||
                    (delta = parseInt(obuff[1]) - parseInt(tbuff[1])) != 0) {
                    return delta;
                }
            }
            if ((delta = obuffs.length - tbuffs.length) != 0 ||
                (delta = other.level - this.level) != 0 ||
                (delta = other.enhancement - this.enhancement) != 0) {
                return delta;
            }

            return 0;
        });
    }

    function AmuletGroup(persistenceString) {
        this.buffSummary = {
            力量 : 0,
            敏捷 : 0,
            智力 : 0,
            体魄 : 0,
            精神 : 0,
            意志 : 0,
            物理攻击 : 0,
            魔法攻击 : 0,
            速度 : 0,
            生命护盾回复效果 : 0,
            最大生命值 : 0,
            最大护盾值 : 0,
            固定生命偷取 : 0,
            固定反伤 : 0,
            固定暴击几率 : 0,
            固定技能几率 : 0,
            物理防御效果 : 0,
            魔法防御效果 : 0
        };

        this.name = null;
        this.items = [];

        this.isValid = (() => {
            return (this.items.length > 0 && amuletIsValidGroupName(this.name));
        });

        this.count = (() => {
            return this.items.length;
        });

        this.clear = (() => {
            this.items = [];
            for (let buff in this.buffSummary) {
                this.buffSummary[buff] = 0;
            }
        });

        this.add = ((amulet) => {
            if (amulet?.isValid()) {
                let buffs = amulet.getBuff();
                for (let buff in buffs) {
                    this.buffSummary[buff] += buffs[buff];
                }
                return insertElement(this.items, amulet, (a, b) => a.compareTo(b, true));
            }
            return -1;
        });

        this.remove = ((amulet) => {
            if (this.isValid() && amulet?.isValid()) {
                let i = searchElement(this.items, amulet, (a, b) => a.compareTo(b, true));
                if (i >= 0) {
                    let buffs = amulet.getBuff();
                    for (let buff in buffs) {
                        this.buffSummary[buff] -= buffs[buff];
                    }
                    this.items.splice(i, 1);
                    return true;
                }
            }
            return false;
        });

        this.removeId = ((id) => {
            if (this.isValid()) {
                let i = this.items.findIndex((a) => a.id == id);
                if (i >= 0) {
                    let amulet = this.items[i];
                    let buffs = amulet.getBuff();
                    for (let buff in buffs) {
                        this.buffSummary[buff] -= buffs[buff];
                    }
                    this.items.splice(i, 1);
                    return amulet;
                }
            }
            return null;
        });

        this.merge = ((group) => {
            group?.items?.forEach((am) => { this.add(am); });
            return this;
        });

        this.validate = ((amulets) => {
            if (this.isValid()) {
                let mismatch = 0;
                let al = this.items.length;
                let i = 0;
                if (amulets?.length > 0) {
                    amulets = amulets.slice().sort((a, b) => a.compareMatch(b));
                    for ( ; amulets.length > 0 && i < al; i++) {
                        let mi = searchElement(amulets, this.items[i], (a, b) => a.compareMatch(b));
                        if (mi >= 0) {
                            // remove a matched amulet from the amulet pool can avoid one single amulet matches all
                            // the equivalent objects in the group.
                            // let's say two (or even more) AGI +5 apples in one group is fairly normal, if we just
                            // have only one equivalent apple in the amulet pool and we don't remove it when the
                            // first match happens, then the 2nd apple will get matched later, the consequence would
                            // be we can never find the mismatch which should be encountered at the 2nd apple
                            this.items[i].fromAmulet(amulets[mi]);
                            amulets.splice(mi, 1);
                        }
                        else {
                            mismatch++;
                        }
                    }
                }
                if (i > mismatch) {
                    this.items.sort((a, b) => a.compareTo(b, true));
                }
                if (i < al) {
                    mismatch += (al - i);
                }
                return (mismatch == 0);
            }
            return false;
        });

        this.findIndices = ((amulets) => {
            let indices;
            let al;
            if (this.isValid() && (al = (amulets?.length ?? 0)) > 0) {
                let items = this.items.slice().sort((a, b) => a.compareMatch(b));
                for (let i = 0; items.length > 0 && i < al; i++) {
                    let mi;
                    if (amulets[i]?.id >= 0 && (mi = searchElement(items, amulets[i], (a, b) => a.compareMatch(b))) >= 0) {
                        // similar to the 'validate', remove the amulet from the search list when we found
                        // a match item in first time to avoid the duplicate founding, e.g. say we need only
                        // one AGI +5 apple in current group and we actually have 10 of AGI +5 apples in store,
                        // if we found the first matched itme in store and record it's index but not remove it
                        // from the temporary searching list, then we will continuously reach this kind of
                        // founding and recording until all those 10 AGI +5 apples are matched and processed,
                        // this obviously ain't the result what we expected
                        (indices ??= []).push(i);
                        items.splice(mi, 1);
                    }
                }
            }
            return indices;
        });

        this.parse = ((persistenceString) => {
            this.clear();
            if (persistenceString?.length > 0) {
                let elements = persistenceString.split(AMULET_STORAGE_GROUPNAME_SEPARATOR);
                if (elements.length == 2) {
                    let name = elements[0].trim();
                    if (amuletIsValidGroupName(name)) {
                        let items = elements[1].split(AMULET_STORAGE_AMULET_SEPARATOR);
                        let il = items.length;
                        for (let i = 0; i < il; i++) {
                            if (this.add((new Amulet()).fromCode(parseInt(items[i]))) < 0) {
                                this.clear();
                                break;
                            }
                        }
                        if (this.count() > 0) {
                            this.name = name;
                        }
                    }
                }
            }
            return (this.count() > 0);
        });

        this.formatBuffSummary = ((linePrefix, lineSuffix, lineSeparator, ignoreMaxValue) => {
            if (this.isValid()) {
                let str = '';
                let nl = '';
                g_amuletBuffs.forEach((buff) => {
                    let v = this.buffSummary[buff.name];
                    if (v > 0) {
                        str += `${nl}${linePrefix}${buff.name} +${ignoreMaxValue ? v : Math.min(v, buff.maxValue)} ${buff.unit}${lineSuffix}`;
                        nl = lineSeparator;
                    }
                });
                return str;
            }
            return '';
        });

        this.formatBuffShortMark = ((keyValueSeparator, itemSeparator, ignoreMaxValue) => {
            if (this.isValid()) {
                let str = '';
                let sp = '';
                g_amuletBuffs.forEach((buff) => {
                    let v = this.buffSummary[buff.name];
                    if (v > 0) {
                        str += `${sp}${buff.shortMark}${keyValueSeparator}${ignoreMaxValue ? v : Math.min(v, buff.maxValue)}`;
                        sp = itemSeparator;
                    }
                });
                return str;
            }
            return '';
        });

        this.formatItems = ((linePrefix, erroeLinePrefix, lineSuffix, errorLineSuffix, lineSeparator) => {
            if (this.isValid()) {
                let str = '';
                let nl = '';
                this.items.forEach((amulet) => {
                    str += `${nl}${amulet.id < 0 ? erroeLinePrefix : linePrefix}${amulet.formatBuffText()}` +
                           `${amulet.id < 0 ? errorLineSuffix : lineSuffix}`;
                    nl = lineSeparator;
                });
                return str;
            }
            return '';
        });

        this.getDisplayStringLineCount = (() => {
            if (this.isValid()) {
                let lines = 0;
                g_amuletBuffs.forEach((buff) => {
                    if (this.buffSummary[buff.name] > 0) {
                        lines++;
                    }
                });
                return lines + this.items.length;
            }
            return 0;
        });

        this.formatPersistenceString = (() => {
            if (this.isValid()) {
                let codes = [];
                this.items.forEach((amulet) => {
                    codes.push(amulet.getCode());
                });
                return `${this.name}${AMULET_STORAGE_GROUPNAME_SEPARATOR}${codes.join(AMULET_STORAGE_AMULET_SEPARATOR)}`;
            }
            return '';
        });

        this.parse(persistenceString);
    }

    function AmuletGroupCollection(persistenceString) {
        this.items = {};
        this.itemCount = 0;

        this.count = (() => {
            return this.itemCount;
        });

        this.contains = ((name) => {
            return (this.items[name] != undefined);
        });

        this.add = ((item) => {
            if (item?.isValid()) {
                if (!this.contains(item.name)) {
                    this.itemCount++;
                }
                this.items[item.name] = item;
                return true;
            }
            return false;
        });

        this.remove = ((name) => {
            if (this.contains(name)) {
                delete this.items[name];
                this.itemCount--;
                return true;
            }
            return false;
        });

        this.clear = (() => {
            for (let name in this.items) {
                delete this.items[name];
            }
            this.itemCount = 0;
        });

        this.get = ((name) => {
            return this.items[name];
        });

        this.rename = ((oldName, newName) => {
            if (amuletIsValidGroupName(newName)) {
                let group = this.items[oldName];
                if (this.remove(oldName)) {
                    group.name = newName;
                    return this.add(group);
                }
            }
            return false;
        });

        this.toArray = (() => {
            let groups = [];
            for (let name in this.items) {
                groups.push(this.items[name]);
            }
            return groups;
        });

        this.parse = ((persistenceString) => {
            this.clear();
            if (persistenceString?.length > 0) {
                let groupStrings = persistenceString.split(AMULET_STORAGE_GROUP_SEPARATOR);
                let gl = groupStrings.length;
                for (let i = 0; i < gl; i++) {
                    if (!this.add(new AmuletGroup(groupStrings[i]))) {
                        this.clear();
                        break;
                    }
                }
            }
            return (this.count() > 0);
        });

        this.formatPersistenceString = (() => {
            let str = '';
            let ns = '';
            for (let name in this.items) {
                str += (ns + this.items[name].formatPersistenceString());
                ns = AMULET_STORAGE_GROUP_SEPARATOR;
            }
            return str;
        });

        this.parse(persistenceString);
    }

    function amuletIsValidGroupName(groupName) {
        return (groupName?.length > 0 && groupName.length < 32 && groupName.search(USER_STORAGE_RESERVED_SEPARATORS) < 0);
    }

    function amuletSaveGroups(groups) {
        if (groups?.count() > 0) {
            localStorage.setItem(g_amuletGroupsStorageKey, groups.formatPersistenceString());
        }
        else {
            localStorage.removeItem(g_amuletGroupsStorageKey);
        }
    }

    function amuletLoadGroups() {
        return new AmuletGroupCollection(localStorage.getItem(g_amuletGroupsStorageKey));
    }

    function amuletClearGroups() {
        localStorage.removeItem(g_amuletGroupsStorageKey);
    }

    function amuletSaveGroup(group) {
        if (group?.isValid()) {
            let groups = amuletLoadGroups();
            if (groups.add(group)) {
                amuletSaveGroups(groups);
            }
        }
    }

    function amuletLoadGroup(groupName) {
        return amuletLoadGroups().get(groupName);
    }

    function amuletDeleteGroup(groupName) {
        let groups = amuletLoadGroups();
        if (groups.remove(groupName)) {
            amuletSaveGroups(groups);
        }
    }

    function amuletCreateGroupFromArray(groupName, amulets) {
        if (amulets?.length > 0 && amuletIsValidGroupName(groupName)) {
            let group = new AmuletGroup(null);
            for (let amulet of amulets) {
                if (group.add(amulet) < 0) {
                    group.clear();
                    break;
                }
            }
            if (group.count() > 0) {
                group.name = groupName;
                return group;
            }
        }
        return null;
    }

    function amuletNodesToArray(nodes, array, key) {
        array ??= [];
        let amulet;
        for (let node of nodes) {
            if (objectMatchTitle(node, key) && (amulet ??= new Amulet()).fromNode(node)?.isValid()) {
                array.push(amulet);
                amulet = null;
            }
        }
        return array;
    }

    function beginReadAmulets(bagAmulets, storeAmulets, key, fnFurtherProcess, fnParams) {
        function parseAmulets() {
            if (bagAmulets != null) {
                amuletNodesToArray(bag, bagAmulets, key);
            }
            if (storeAmulets != null) {
                amuletNodesToArray(store, storeAmulets, key);
            }
            if (fnFurtherProcess != null) {
                fnFurtherProcess(fnParams);
            }
        }

        let bag, store;
        if (bagAmulets != null || storeAmulets != null) {
            beginReadObjects(bag = [], store = [], parseAmulets, null);
        }
        else if (fnFurtherProcess != null) {
            fnFurtherProcess(fnParams);
        }
    }

    function beginMoveAmulets({ groupName, amulets, path, proc, params }) {
        let indices = amuletLoadGroup(groupName)?.findIndices(amulets)?.sort((a, b) => b - a);
        let ids;
        while (indices?.length > 0) {
            (ids ??= []).push(amulets[indices.pop()].id);
        }
        beginMoveObjects(ids, path, proc, params);
    }

    function beginLoadAmuletGroupFromStore(amulets, groupName, fnFurtherProcess, fnParams) {
        if (amulets?.length > 0) {
            let store = amuletNodesToArray(amulets);
            beginMoveAmulets({ groupName : groupName, amulets : store, path : g_object_move_path.store2bag,
                               proc : fnFurtherProcess, params : fnParams });
        }
        else {
            beginReadAmulets(null, amulets = [], null, beginMoveAmulets,
                             { groupName : groupName, amulets : amulets, path : g_object_move_path.store2bag,
                               proc : fnFurtherProcess, params : fnParams });
        }
    }

    function beginUnloadAmuletGroupFromBag(amulets, groupName, fnFurtherProcess, fnParams) {
        if (amulets?.length > 0) {
            let bag = amuletNodesToArray(amulets);
            beginMoveAmulets({ groupName : groupName, amulets : bag, path : g_object_move_path.bag2store,
                               proc : fnFurtherProcess, params : fnParams });
        }
        else {
            beginReadAmulets(amulets, null, null, beginMoveAmulets,
                             { groupName : groupName, amulets : amulets, path : g_object_move_path.bag2store,
                               proc : fnFurtherProcess, params : fnParams });
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // equipment utilities
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const g_equipmentDefaultLevelName = [ '普通', '幸运', '稀有', '史诗', '传奇' ];
    const g_equipmentLevelPoints = [ 200, 321, 419, 516, 585 ];
    const g_equipmentLevelBGColor = [ '#e0e8e8', '#c0e0ff', '#c0ffc0', '#ffffc0', '#ffd0d0' ];
    const g_equipmentLevelTipClass = [ 'popover-primary', 'popover-info', 'popover-success', 'popover-warning', 'popover-danger' ];
    var g_equipmentLevelName = g_equipmentDefaultLevelName;
    function equipmentInfoParseNode(node) {
        if (node?.className?.split(' ').length > 2 && node.innerText.indexOf('+') < 0 &&
            (node.className.endsWith('fyg_mp3') || node.className.endsWith('fyg_mp3 fyg_tc'))) {
            let title = (node.getAttribute('data-original-title') ?? node.getAttribute('title'));
            if (title?.length > 0) {
                let name = title?.substring(title.lastIndexOf('>') + 1).trim();
                name = (g_equipMap.get(name)?.shortMark ?? g_equipMap.get(name.substring(g_equipmentLevelName[0].length))?.shortMark);
                if (name?.length > 0) {
                    let attr = node.getAttribute('data-content')?.match(/>\s*\d+\s?%\s*</g);
                    let lv = title.match(/>(\d+)</);
                    if (attr?.length > 0 && lv?.length > 0) {
                        let mys = (node.getAttribute('data-content')?.match(/\[神秘属性\]/) == null ? 0 : 1);
                        let id = node.getAttribute('onclick')?.match(/\d+/)[0];
                        return [ name, lv[1],
                                 attr[0].match(/\d+/)[0], attr[1].match(/\d+/)[0],
                                 attr[2].match(/\d+/)[0], attr[3].match(/\d+/)[0],
                                 mys, id ];
                    }
                }
            }
        }
        return null;
    }

    function equipmentNodesToInfoArray(nodes, array) {
        array ??= [];
        for (let i = (nodes?.length ?? 0) - 1; i >= 0; i--) {
            let e = equipmentInfoParseNode(nodes[i]);
            if (e != null) {
                array.unshift(e);
            }
        }
        return array;
    }

    function equipmentGetLevel(e) {
        let eq = (Array.isArray(e) ? e : equipmentInfoParseNode(e));
        if (eq != null) {
            let p = parseInt(eq[2]) + parseInt(eq[3]) + parseInt(eq[4]) + parseInt(eq[5]) + (parseInt(eq[6]) * 100);
            for (var i = g_equipmentLevelPoints.length - 1; i > 0 && p < g_equipmentLevelPoints[i]; i--);
            return i;
        }
        else if ((eq = (new Amulet()).fromNode(e))?.isValid()) {
            return (eq.level + 2)
        }
        return -1;
    }

    function equipmentInfoComparer(e1, e2) {
        let delta = g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index;
        for (let i = 1; i < 7 && delta == 0; delta = parseInt(e1[i]) - parseInt(e2[i++]));
        return delta;
    }

    function objectNodeComparer(e1, e2) {
        let eq1 = equipmentInfoParseNode(e1);
        if (eq1 != null) {
            e1.setAttribute('data-meta-index', g_equipMap.get(eq1[0]).index);
        }

        let eq2 = equipmentInfoParseNode(e2);
        if (eq2 != null) {
            e2.setAttribute('data-meta-index', g_equipMap.get(eq2[0]).index);
        }

        if (eq1 == null && eq2 == null) {
            return ((new Amulet()).fromNode(e1)?.compareTo((new Amulet()).fromNode(e2)) ?? 1);
        }
        else if (eq1 == null) {
            return 1;
        }
        else if (eq2 == null) {
            return -1;
        }
        return equipmentInfoComparer(eq1, eq2);
    }

    function objectIsEmptyNode(node) {
        return (node?.innerText == '空');
    }

    function objectEmptyNodesCount(nodes) {
        let nl = (nodes?.length ?? 0);
        for (var i = nl - 1; i >= 0 && nodes[i].innerText == '空'; i--);
        return (nl - 1 - i);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // bag & store utilities
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function findAmuletIds(container, amulets, ids, maxCount) {
        ids ??= [];
        let cl = (container?.length ?? 0);
        if (cl > 0 && amulets?.length > 0) {
            maxCount ??= cl;
            let ams = amuletNodesToArray(container);
            for (let i = ams.length - 1; i >= 0 && amulets.length > 0 && ids.length < maxCount; i--) {
                for (let j = amulets.length - 1; j >= 0; j--) {
                    if (ams[i].compareTo(amulets[j]) == 0) {
                        amulets.splice(j, 1);
                        ids.unshift(ams[i].id);
                        break;
                    }
                }
            }
        }
        return ids;
    }

    function findEquipmentIds(container, equips, ids, maxCount) {
        ids ??= [];
        let cl = (container?.length ?? 0);
        if (cl > 0 && equips?.length > 0) {
            maxCount ??= cl;
            let eqs = equipmentNodesToInfoArray(container);
            for (let i = eqs.length - 1; i >= 0 && equips.length > 0 && ids.length < maxCount; i--) {
                for (let j = equips.length - 1; j >= 0; j--) {
                    if (equipmentInfoComparer(eqs[i], equips[j]) == 0) {
                        equips.splice(j, 1);
                        ids.unshift(parseInt(eqs[i][7]));
                        break;
                    }
                }
            }
        }
        return ids;
    }

    function beginClearBag(bag, key, fnFurtherProcess, fnParams) {
        function beginClearBagObjects(objects) {
            beginMoveObjects(objects, g_object_move_path.bag2store, fnFurtherProcess, fnParams);
        }

        let objects = [];
        if (bag?.length > 0) {
            objectIdParseNodes(bag, objects, key, true);
            beginClearBagObjects(objects);
        }
        else {
            beginReadObjectIds(objects, null, key, true, beginClearBagObjects, objects);
        }
    }

    function beginRestoreObjects(store, amulets, equips, fnFurtherProcess, fnParams) {
        function readStoreCompletion() {
            beginRestoreObjects(store, amulets, equips, fnFurtherProcess, fnParams);
        }

        if (store == null) {
            beginReadObjects(null, store = [], readStoreCompletion, null);
        }
        else {
            let ids = findAmuletIds(store, amulets);
            findEquipmentIds(store, equips, ids);
            beginMoveObjects(ids, g_object_move_path.store2bag, fnFurtherProcess, fnParams);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // generic popups
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const g_genericPopupContainerId = 'generic-popup-container';
    const g_genericPopupClass = 'generic-popup';
    const g_genericPopupId = g_genericPopupClass;
    const g_genericPopupContentContainerId = 'generic-popup-content-container';
    const g_genericPopupContentClass = 'generic-popup-content';
    const g_genericPopupContentId = g_genericPopupContentClass;
    const g_genericPopupFixedContentId = 'generic-popup-content-fixed';
    const g_genericPopupInformationTipsId = 'generic-popup-information-tips';
    const g_genericPopupProgressClass = g_genericPopupClass;
    const g_genericPopupProgressId = 'generic-popup-progress';
    const g_genericPopupProgressContentClass = 'generic-popup-content-progress';
    const g_genericPopupProgressContentId = g_genericPopupProgressContentClass;
    const g_genericPopupTopLineDivClass = 'generic-popup-top-line-container';
    const g_genericPopupTitleTextClass = 'generic-popup-title-text';
    const g_genericPopupTitleTextId = g_genericPopupTitleTextClass;
    const g_genericPopupTitleButtonContainerId = 'generic-popup-title-button-container';
    const g_genericPopupFootButtonContainerId = 'generic-popup-foot-button-container';
    const g_genericPopupBackgroundColor = '#ebf2f9';
    const g_genericPopupBackgroundColorAlt = '#dbe2e9';
    const g_genericPopupBorderColor = '#3280fc';
    const g_genericPopupTitleTextColor = '#ffffff';

    const g_genericPopupStyle =
        `<style>
            .${g_genericPopupClass} {
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, .5);
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                right: 0;
                z-index: 99;
                display: none;
                justify-content: center;
                align-items: center;
            }
            .${g_genericPopupContentClass} {
                width: 100%;
                background-color: ${g_genericPopupBackgroundColor};
                box-sizing: border-box;
                padding: 0px 30px;
                color: black;
            }
            .${g_genericPopupProgressContentClass} {
                width: 400px;
                height: 200px;
                background-color: ${g_genericPopupBackgroundColor};
                box-sizing: border-box;
                border: 2px solid ${g_genericPopupBorderColor};
                border-radius: 5px;
                display: table;
            }
            #${g_genericPopupProgressContentId} {
                height: 100%;
                width: 100%;
                color: #0000c0;
                font-size: 24px;
                font-weight: bold;
                display: table-cell;
                text-align: center;
                vertical-align: middle;
            }
            .${g_genericPopupTopLineDivClass} {
                width: 100%;
                padding: 20px 0px;
                border-top: 2px groove #d0d0d0;
            }
            .generic-popup-title-foot-container {
                width: 100%;
                height: 40px;
                background-color: ${g_genericPopupBorderColor};
                padding: 0px 30px;
                display: table;
            }
            .${g_genericPopupTitleTextClass} {
                height: 100%;
                color: ${g_genericPopupTitleTextColor};
                font-size: 18px;
                display: table-cell;
                text-align: left;
                vertical-align: middle;
            }
        </style>`;

    const g_genericPopupHTML =
        `${g_genericPopupStyle}
         <div class="${g_genericPopupClass}" id="${g_genericPopupId}">
           <div style="border:2px solid ${g_genericPopupBorderColor};border-radius:5px;">
             <div class="generic-popup-title-foot-container">
               <span class="${g_genericPopupTitleTextClass}" id="${g_genericPopupTitleTextId}"></span>
               <div id="${g_genericPopupTitleButtonContainerId}" style="float:right;margin-top:6px;"></div>
             </div>
             <div id="${g_genericPopupContentContainerId}">
               <div class="${g_genericPopupContentClass}" id="${g_genericPopupFixedContentId}" style="display:none;"></div>
               <div class="${g_genericPopupContentClass}" id="${g_genericPopupContentId}"></div>
             </div>
             <div class="generic-popup-title-foot-container">
               <div id="${g_genericPopupFootButtonContainerId}" style="float:right;margin-top:8px;"></div>
             </div>
           </div>
         </div>
         <div class="${g_genericPopupProgressClass}" id="${g_genericPopupProgressId}">
           <div class="${g_genericPopupProgressContentClass}"><span id="${g_genericPopupProgressContentId}"></span></div>
         </div>`;

    var g_genericPopupContainer = null;
    function genericPopupInitialize() {
        if (g_genericPopupContainer == null) {
            g_genericPopupContainer = document.createElement('div');
            g_genericPopupContainer.id = g_genericPopupContainerId;
            document.body.appendChild(g_genericPopupContainer);
        }
        g_genericPopupContainer.innerHTML = g_genericPopupHTML;
    }

    function genericPopupReset(initialize) {
        if (initialize) {
            g_genericPopupContainer.innerHTML = g_genericPopupHTML;
        }
        else {
            let fixedContent = g_genericPopupContainer.querySelector('#' + g_genericPopupFixedContentId);
            fixedContent.style.display = 'none';
            fixedContent.innerHTML = '';

            g_genericPopupContainer.querySelector('#' + g_genericPopupTitleTextId).innerText = '';
            g_genericPopupContainer.querySelector('#' + g_genericPopupContentId).innerHTML = '';
            g_genericPopupContainer.querySelector('#' + g_genericPopupTitleButtonContainerId).innerHTML = '';
            g_genericPopupContainer.querySelector('#' + g_genericPopupFootButtonContainerId).innerHTML = '';
        }
    }

    function genericPopupSetContent(title, content) {
        g_genericPopupContainer.querySelector('#' + g_genericPopupTitleTextId).innerText = title;
        g_genericPopupContainer.querySelector('#' + g_genericPopupContentId).innerHTML = content;
    }

    function genericPopupSetFixedContent(content) {
        let fixedContent = g_genericPopupContainer.querySelector('#' + g_genericPopupFixedContentId);
        fixedContent.style.display = 'block';
        fixedContent.innerHTML = content;
    }

    function genericPopupAddButton(text, width, clickProc, addToTitle) {
        let btn = document.createElement('button');
        btn.innerText = text;
        btn.onclick = clickProc;
        if (width != null && width > 0) {
            width = width.toString();
            btn.style.width = width + (width.endsWith('px') || width.endsWith('%') ? '' : 'px');
        }
        else {
            btn.style.width = 'auto';
        }

        g_genericPopupContainer.querySelector('#' + (addToTitle
                                              ? g_genericPopupTitleButtonContainerId
                                              : g_genericPopupFootButtonContainerId)).appendChild(btn);
        return btn;
    }

    function genericPopupAddCloseButton(width, text, addToTitle) {
        return genericPopupAddButton(text?.length > 0 ? text : '关闭', width, (() => { genericPopupClose(true); }), addToTitle);
    }

    function genericPopupSetContentSize(height, width, scrollable) {
        height = (height?.toString() ?? '100%');
        width = (width?.toString() ?? '100%');

        g_genericPopupContainer.querySelector('#' + g_genericPopupContentContainerId).style.width
            = width + (width.endsWith('px') || width.endsWith('%') ? '' : 'px');

        let content = g_genericPopupContainer.querySelector('#' + g_genericPopupContentId);
        content.style.height = height + (height.endsWith('px') || height.endsWith('%') ? '' : 'px');
        content.style.overflow = (scrollable ? 'auto' : 'hidden');
    }

    function genericPopupShowModal(clickOutsideToClose) {
        genericPopupClose(false);

        let popup = g_genericPopupContainer.querySelector('#' + g_genericPopupId);

        if (clickOutsideToClose) {
            popup.onclick = ((event) => {
                if (event.target == popup) {
                    genericPopupClose(true);
                }
            });
        }
        else {
            popup.onclick = null;
        }

        popup.style.display = "flex";
    }

    function genericPopupClose(reset, initialize) {
        genericPopupCloseProgressMessage();

        let popup = g_genericPopupContainer.querySelector('#' + g_genericPopupId);
        popup.style.display = "none";

        if (reset) {
            genericPopupReset(initialize);
        }

        httpRequestClearAll();
    }

    function genericPopupQuerySelector(selectString) {
        return g_genericPopupContainer.querySelector(selectString);
    }

    function genericPopupQuerySelectorAll(selectString) {
        return g_genericPopupContainer.querySelectorAll(selectString);
    }

    let g_genericPopupInformationTipsTimer = null;
    function genericPopupShowInformationTips(msg, time) {
        if (g_genericPopupInformationTipsTimer != null) {
            clearTimeout(g_genericPopupInformationTipsTimer);
            g_genericPopupInformationTipsTimer = null;
        }
        let msgContainer = g_genericPopupContainer.querySelector('#' + g_genericPopupInformationTipsId);
        if (msgContainer != null) {
            msgContainer.innerText = (msg?.length > 0 ? `[ ${msg} ]` : '');
            if ((time = parseInt(time)) > 0) {
                g_genericPopupInformationTipsTimer = setTimeout(() => {
                    g_genericPopupInformationTipsTimer = null;
                    msgContainer.innerText = '';
                }, time);
            }
        }
    }

    function genericPopupShowProgressMessage(progressMessage) {
        genericPopupClose(false);

        g_genericPopupContainer.querySelector('#' + g_genericPopupProgressContentId).innerText
            = (progressMessage?.length > 0 ? progressMessage : '请稍候...');
        g_genericPopupContainer.querySelector('#' + g_genericPopupProgressId).style.display = "flex";
    }

    function genericPopupCloseProgressMessage() {
        g_genericPopupContainer.querySelector('#' + g_genericPopupProgressId).style.display = "none";
    }

    //
    // generic task-list based progress popup
    //
    const g_genericPopupTaskListId = 'generic-popup-task-list';
    const g_genericPopupTaskItemId = 'generic-popup-task-item-';
    const g_genericPopupTaskWaiting = '×';
    const g_genericPopupTaskCompleted = '√';
    const g_genericPopupTaskCompletedWithError = '！';
    const g_genericPopupColorTaskIncompleted = '#c00000';
    const g_genericPopupColorTaskCompleted = '#0000c0';
    const g_genericPopupColorTaskCompletedWithError = 'red';

    var g_genericPopupIncompletedTaskCount = 0;
    function genericPopupTaskListPopupSetup(title, popupWidth, tasks, fnCancelRoutine, cancelButtonText, cancelButtonWidth) {
        g_genericPopupIncompletedTaskCount = tasks.length;

        genericPopupSetContent(title, `<div style="padding:15px 0px 15px 0px;"><ul id="${g_genericPopupTaskListId}"></ul></div>`);
        let indicatorList = g_genericPopupContainer.querySelector('#' + g_genericPopupTaskListId);
        for (let i = 0; i < g_genericPopupIncompletedTaskCount; i++) {
            let li = document.createElement('li');
            li.id = g_genericPopupTaskItemId + i;
            li.style.color = g_genericPopupColorTaskIncompleted;
            li.innerHTML = `<span>${g_genericPopupTaskWaiting}</span><span>&nbsp;${tasks[i]}&nbsp;</span><span></span>`;
            indicatorList.appendChild(li);
        }

        if (fnCancelRoutine != null) {
            genericPopupAddButton(cancelButtonText?.length > 0 ? cancelButtonText : '取消', cancelButtonWidth, fnCancelRoutine, false);
        }

        genericPopupSetContentSize(Math.min(g_genericPopupIncompletedTaskCount * 20 + 30, window.innerHeight - 400), popupWidth, true);
    }

    function genericPopupTaskSetState(index, state) {
        let item = g_genericPopupContainer.querySelector('#' + g_genericPopupTaskItemId + index)?.lastChild;
        if (item != undefined) {
            item.innerText = (state ?? '');
        }
    }

    function genericPopupTaskComplete(index, error) {
        let li = g_genericPopupContainer.querySelector('#' + g_genericPopupTaskItemId + index);
        if (li?.firstChild?.innerText == g_genericPopupTaskWaiting) {
            li.firstChild.innerText = (error ? g_genericPopupTaskCompletedWithError : g_genericPopupTaskCompleted);
            li.style.color = (error ? g_genericPopupColorTaskCompletedWithError : g_genericPopupColorTaskCompleted);
            g_genericPopupIncompletedTaskCount--;
        }
    }

    function genericPopupTaskCheckCompletion() {
        return (g_genericPopupIncompletedTaskCount == 0);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // constants
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const g_roles = [
        { index : -1 , id : 3000 , name : '舞' , hasG : true , shortMark : 'WU' },
        { index : -1 , id : 3001 , name : '默' , hasG : false , shortMark : 'MO' },
        { index : -1 , id : 3002 , name : '琳' , hasG : false , shortMark : 'LIN' },
        { index : -1 , id : 3003 , name : '艾' , hasG : false , shortMark : 'AI' },
        { index : -1 , id : 3004 , name : '梦' , hasG : false , shortMark : 'MENG' },
        { index : -1 , id : 3005 , name : '薇' , hasG : false , shortMark : 'WEI' },
        { index : -1 , id : 3006 , name : '伊' , hasG : false , shortMark : 'YI' },
        { index : -1 , id : 3007 , name : '冥' , hasG : false , shortMark : 'MING' },
        { index : -1 , id : 3008 , name : '命' , hasG : false , shortMark : 'MIN' },
        { index : -1 , id : 3009 , name : '希' , hasG : true , shortMark : 'XI' }
    ];

    const g_roleMap = new Map();
    g_roles.forEach((item, index) => {
        item.index = index;
        g_roleMap.set(item.id, item);
        g_roleMap.set(item.id.toString(), item);
        g_roleMap.set(item.name, item);
        g_roleMap.set(item.shortMark, item);
    });

    const g_equipAttributes = [
        { index : 0 , type : 0 , name : '物理攻击' },
        { index : 1 , type : 0 , name : '魔法攻击' },
        { index : 2 , type : 0 , name : '攻击速度' },
        { index : 3 , type : 0 , name : '最大生命' },
        { index : 4 , type : 0 , name : '最大护盾' },
        { index : 5 , type : 1 , name : '附加物伤' },
        { index : 6 , type : 1 , name : '附加魔伤' },
        { index : 7 , type : 1 , name : '附加攻速' },
        { index : 8 , type : 1 , name : '附加生命' },
        { index : 9 , type : 1 , name : '附加护盾' },
        { index : 10 , type : 1 , name : '附加回血' },
        { index : 11 , type : 1 , name : '附加回盾' },
        { index : 12 , type : 0 , name : '护盾回复' },
        { index : 13 , type : 0 , name : '物理穿透' },
        { index : 14 , type : 0 , name : '魔法穿透' },
        { index : 15 , type : 0 , name : '暴击穿透' },
        { index : 16 , type : 1 , name : '附加物穿' },
        { index : 17 , type : 1 , name : '附加物防' },
        { index : 18 , type : 1 , name : '附加魔防' },
        { index : 19 , type : 1 , name : '物理减伤' },
        { index : 20 , type : 1 , name : '魔法减伤' },
        { index : 21 , type : 0 , name : '生命偷取' },
        { index : 22 , type : 0 , name : '伤害反弹' },
        { index : 23 , type : 1 , name : '附加魔穿' },
        { index : 24 , type : 1 , name : '技能概率' },
        { index : 25 , type : 1 , name : '暴击概率' }
    ];

    const g_equipments = [
        {
            index : -1,
            name : '反叛者的刺杀弓',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[0] , factor : 1 / 5 , additive : 30 },
                           { attribute : g_equipAttributes[15] , factor : 1 / 20 , additive : 10 },
                           { attribute : g_equipAttributes[13] , factor : 1 / 20 , additive : 10 },
                           { attribute : g_equipAttributes[16] , factor : 1 , additive : 0 } ],
            merge : null,
            shortMark : 'ASSBOW'
        },
        {
            index : -1,
            name : '狂信者的荣誉之刃',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[0] , factor : 1 / 5 , additive : 20 },
                           { attribute : g_equipAttributes[2] , factor : 1 / 5 , additive : 20 },
                           { attribute : g_equipAttributes[15] , factor : 1 / 20 , additive : 10 },
                           { attribute : g_equipAttributes[13] , factor : 1 / 20 , additive : 10 } ],
            merge : null,
            shortMark : 'BLADE'
        },
        {
            index : -1,
            name : '陨铁重剑',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[5] , factor : 20 , additive : 0 },
                           { attribute : g_equipAttributes[5] , factor : 20 , additive : 0 },
                           { attribute : g_equipAttributes[0] , factor : 1 / 5 , additive : 30 },
                           { attribute : g_equipAttributes[15] , factor : 1 / 20 , additive : 1 } ],
            merge : [ [ 0, 1 ], [ 2 ], [ 3 ] ],
            shortMark : 'CLAYMORE'
        },
        {
            index : -1,
            name : '幽梦匕首',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[0] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[1] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[7] , factor : 4 , additive : 0 },
                           { attribute : g_equipAttributes[2] , factor : 1 / 5 , additive : 25 } ],
            merge : null,
            shortMark : 'DAGGER'
        },
        {
            index : -1,
            name : '荆棘盾剑',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 10 },
                           { attribute : g_equipAttributes[22] , factor : 1 / 15 , additive : 0 },
                           { attribute : g_equipAttributes[17] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[18] , factor : 1 , additive : 0 } ],
            merge : null,
            shortMark : 'SHIELD'
        },
        {
            index : -1,
            name : '饮血魔剑',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[0] , factor : 1 / 5 , additive : 50 },
                           { attribute : g_equipAttributes[13] , factor : 1 / 20 , additive : 10 },
                           { attribute : g_equipAttributes[23] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15, additive : 10 } ],
            merge : null,
            shortMark : 'SPEAR'
        },
        {
            index : -1,
            name : '光辉法杖',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[1] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[1] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[1] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[14] , factor : 1 / 20 , additive : 0 } ],
            merge : [ [ 0, 1, 2 ], [ 3 ] ],
            shortMark : 'WAND'
        },
        {
            index : -1,
            name : '探险者短弓',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[5] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[6] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[7] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 10 } ],
            merge : null,
            shortMark : 'BOW'
        },
        {
            index : -1,
            name : '探险者短杖',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[5] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[6] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[14] , factor : 1 / 20 , additive : 5 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 10 } ],
            merge : null,
            shortMark : 'STAFF'
        },
        {
            index : -1,
            name : '探险者之剑',
            type : 0,
            attributes : [ { attribute : g_equipAttributes[5] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[6] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[16] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 10 } ],
            merge : null,
            shortMark : 'SWORD'
        },
        {
            index : -1,
            name : '命师的传承手环',
            type : 1,
            attributes : [ { attribute : g_equipAttributes[1] , factor : 1 / 5 , additive : 1 },
                           { attribute : g_equipAttributes[14] , factor : 1 / 20 , additive : 1 },
                           { attribute : g_equipAttributes[9] , factor : 20 , additive : 0 },
                           { attribute : g_equipAttributes[18] , factor : 1 , additive : 0 } ],
            merge : null,
            shortMark : 'BRACELET'
        },
        {
            index : -1,
            name : '秃鹫手环',
            type : 1,
            attributes : [ { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 1 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 1 },
                           { attribute : g_equipAttributes[21] , factor : 1 / 15 , additive : 1 },
                           { attribute : g_equipAttributes[7] , factor : 2 , additive : 0 } ],
            merge : [ [ 0, 1, 2 ], [ 3 ] ],
            shortMark : 'VULTURE'
        },
        {
            index : -1,
            name : '探险者手环',
            type : 1,
            attributes : [ { attribute : g_equipAttributes[5] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[6] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[7] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[8] , factor : 10 , additive : 0 } ],
            merge : null,
            shortMark : 'GLOVES'
        },
        {
             index : -1,
            name : '海星戒指',
            type : 1,
            attributes : [ { attribute : g_equipAttributes[16] , factor : 1 / 2 , additive : 0 },
                           { attribute : g_equipAttributes[23] , factor : 1 / 2 , additive : 0 },
                           { attribute : g_equipAttributes[24] , factor : 4 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[25] , factor : 4 / 5 , additive : 0 } ],
            merge : null,
            shortMark : 'RING'
        },
        {
            index : -1,
            name : '旅法师的灵光袍',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[11] , factor : 60 , additive : 0 },
                           { attribute : g_equipAttributes[4] , factor : 1 / 5 , additive : 25 },
                           { attribute : g_equipAttributes[9] , factor : 50 , additive : 0 } ],
            merge : null,
            shortMark : 'CLOAK'
        },
        {
            index : -1,
            name : '挑战斗篷',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[4] , factor : 1 / 5 , additive : 50 },
                           { attribute : g_equipAttributes[9] , factor : 100 , additive : 0 },
                           { attribute : g_equipAttributes[18] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[20] , factor : 5 , additive : 0 } ],
            merge : null,
            shortMark : 'CAPE'
        },
        {
            index : -1,
            name : '战线支撑者的荆棘重甲',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[3] , factor : 1 / 5 , additive : 20 },
                           { attribute : g_equipAttributes[17] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[18] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[22] , factor : 1 / 15 , additive : 10 } ],
            merge : null,
            shortMark : 'THORN'
        },
        {
            index : -1,
            name : '复苏战衣',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[3] , factor : 1 / 5 , additive : 50 },
                           { attribute : g_equipAttributes[19] , factor : 5 , additive : 0 },
                           { attribute : g_equipAttributes[20] , factor : 5 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 20 , additive : 0 } ],
            merge : null,
            shortMark : 'WOOD'
        },
        {
            index : -1,
            name : '探险者铁甲',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 20 , additive : 0 },
                           { attribute : g_equipAttributes[17] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[18] , factor : 1 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 10 , additive : 0 } ],
            merge : null,
            shortMark : 'PLATE'
        },
        {
            index : -1,
            name : '探险者皮甲',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 25 , additive : 0 },
                           { attribute : g_equipAttributes[19] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[20] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 6 , additive : 0 } ],
            merge : null,
            shortMark : 'LEATHER'
        },
        {
            index : -1,
            name : '探险者布甲',
            type : 2,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 25 , additive : 0 },
                           { attribute : g_equipAttributes[19] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[20] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 6 , additive : 0 } ],
            merge : null,
            shortMark : 'CLOTH'
        },
        {
            index : -1,
            name : '萌爪耳钉',
            type : 3,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[9] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 5 , additive : 0 },
                           { attribute : g_equipAttributes[12] , factor : 1 / 30 , additive : 0 } ],
            merge : null,
            shortMark : 'RIBBON'
        },
        {
            index : -1,
            name : '占星师的耳饰',
            type : 3,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 5 , additive : 0 },
                           { attribute : g_equipAttributes[4] , factor : 1 / 5 , additive : 0 },
                           { attribute : g_equipAttributes[9] , factor : 20 , additive : 0 },
                           { attribute : g_equipAttributes[19] , factor : 2 , additive : 0 } ],
            merge : null,
            shortMark : 'TIARA'
        },
        {
            index : -1,
            name : '探险者耳环',
            type : 3,
            attributes : [ { attribute : g_equipAttributes[8] , factor : 10 , additive : 0 },
                           { attribute : g_equipAttributes[19] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[20] , factor : 2 , additive : 0 },
                           { attribute : g_equipAttributes[10] , factor : 4 , additive : 0 } ],
            merge : null,
            shortMark : 'SCARF'
        }
    ];

    const g_oldEquipNames = [
        [ '荆棘盾剑', '荆棘剑盾' ],
        [ '饮血魔剑', '饮血长枪' ],
        [ '探险者手环', '探险者手套' ],
        [ '秃鹫手环', '秃鹫手套' ],
        [ '复苏战衣', '复苏木甲' ],
        [ '萌爪耳钉', '天使缎带' ],
        [ '占星师的耳饰', '占星师的发饰' ],
        [ '探险者耳环', '探险者头巾' ]
    ];

    const g_defaultEquipAttributeMerge = [ [0], [1], [2], [3] ];
    function defaultEquipmentNodeComparer(setting, eqKey, eq1, eq2) {
        let eqMeta = g_equipMap.get(eqKey);
        let delta = [];
        let majorAdv = 0;
        let majorEq = 0;
        let majorDis = 0;
        let minorAdv = 0;

        eqMeta.attributes.forEach((attr, index) => {
            let d = Math.trunc((eq1[0] * attr.factor + attr.additive) * eq1[index + 1] / 100) -
                    Math.trunc((eq2[0] * attr.factor + attr.additive) * eq2[index + 1] / 100);
            if (setting[index + 1]) {
                delta.push(0);
                if (d > 0) {
                    minorAdv++;
                }
            }
            else {
                delta.push(d);
            }
        });

        let merge = (eqMeta.merge?.length > 1 ? eqMeta.merge : g_defaultEquipAttributeMerge);
        for (let indices of merge) {
            let sum = 0;
            indices.forEach((index) => { sum += delta[index]; });
            if (sum > 0) {
                majorAdv++;
            }
            else if (sum < 0) {
                majorDis++;
            }
            else {
                majorEq++;
            }
        };

        return { majorAdv : majorAdv, majorEq : majorEq, majorDis : majorDis, minorAdv : minorAdv };
    }

    function formatEquipmentAttributes(e, itemSeparator) {
        let text = '';
        if (e?.length > 5) {
            itemSeparator ??= ', ';
            let sp = '';
            g_equipMap.get(e[0])?.attributes.forEach((attr, index) => {
                text += `${sp}${attr.attribute.name} +${Math.trunc((e[1] * attr.factor + attr.additive) *
                                                                    e[index + 2] / 100)}${attr.attribute.type == 0 ? '%' : ''}`;
                sp = itemSeparator;
            });
        }
        return text;
    }

    const g_equipMap = new Map();
    g_equipments.forEach((item, index) => {
        item.index = index;
        item.alias = item.name;
        g_equipMap.set(item.name, item);
        g_equipMap.set(item.shortMark, item);
    });

    var g_useOldEquipName = false;
    var g_useThemeEquipName = false;
    function equipLoadTheme(theme) {
        g_equipmentLevelName = theme.level;
        if (g_useOldEquipName) {
            g_oldEquipNames.forEach((item) => {
                if (!g_equipMap.has(item[1])) {
                    let eqMeta = g_equipMap.get(item[0]);
                    if (eqMeta != undefined) {
                        eqMeta.alias = item[1];
                        g_equipMap.set(eqMeta.alias, eqMeta);
                    }
                }
            });
        }
        if (g_useThemeEquipName) {
            for(let item in theme) {
                if (/^[a-z]+\d+$/.test(item) && theme[item].length >= 5 && theme[item][3]?.length > 0 && !g_equipMap.has(theme[item][3])) {
                    let eqMeta = g_equipMap.get(theme[item][2]);
                    if (eqMeta != undefined) {
                        eqMeta.alias = theme[item][3];
                        g_equipMap.set(eqMeta.alias, eqMeta);
                    }
                }
            }
        }
    }

    const g_halos = [
        { index : -1 , id : 101 , name : '启程之誓' , points : 0 , shortMark : 'SHI' },
        { index : -1 , id : 102 , name : '启程之心' , points : 0 , shortMark : 'XIN' },
        { index : -1 , id : 103 , name : '启程之风' , points : 0 , shortMark : 'FENG' },
        { index : -1 , id : 104 , name : '等级挑战' , points : 0 , shortMark : 'TIAO' },
        { index : -1 , id : 105 , name : '等级压制' , points : 0 , shortMark : 'YA' },
        { index : -1 , id : 201 , name : '破壁之心' , points : 20 , shortMark : 'BI' },
        { index : -1 , id : 202 , name : '破魔之心' , points : 20 , shortMark : 'MO' },
        { index : -1 , id : 203 , name : '复合护盾' , points : 20 , shortMark : 'DUN' },
        { index : -1 , id : 204 , name : '鲜血渴望' , points : 20 , shortMark : 'XUE' },
        { index : -1 , id : 205 , name : '削骨之痛' , points : 20 , shortMark : 'XIAO' },
        { index : -1 , id : 206 , name : '圣盾祝福' , points : 20 , shortMark : 'SHENG' },
        { index : -1 , id : 301 , name : '伤口恶化' , points : 30 , shortMark : 'SHANG' },
        { index : -1 , id : 302 , name : '精神创伤' , points : 30 , shortMark : 'SHEN' },
        { index : -1 , id : 303 , name : '铁甲尖刺' , points : 30 , shortMark : 'CI' },
        { index : -1 , id : 304 , name : '忍无可忍' , points : 30 , shortMark : 'REN' },
        { index : -1 , id : 305 , name : '热血战魂' , points : 30 , shortMark : 'RE' },
        { index : -1 , id : 306 , name : '点到为止' , points : 30 , shortMark : 'DIAN' },
        { index : -1 , id : 307 , name : '午时已到' , points : 30 , shortMark : 'WU' },
        { index : -1 , id : 401 , name : '沸血之志' , points : 100 , shortMark : 'FEI' },
        { index : -1 , id : 402 , name : '波澜不惊' , points : 100 , shortMark : 'BO' },
        { index : -1 , id : 403 , name : '飓风之力' , points : 100 , shortMark : 'JU' },
        { index : -1 , id : 404 , name : '红蓝双刺' , points : 100 , shortMark : 'HONG' },
        { index : -1 , id : 405 , name : '荧光护盾' , points : 100 , shortMark : 'JUE' },
        { index : -1 , id : 406 , name : '后发制人' , points : 100 , shortMark : 'HOU' },
        { index : -1 , id : 407 , name : '钝化锋芒' , points : 100 , shortMark : 'DUNH' },
        { index : -1 , id : 408 , name : '自信回头' , points : 100 , shortMark : 'ZI' }
    ];

    const g_haloMap = new Map();
    g_halos.forEach((item, index) => {
        item.index = index;
        g_haloMap.set(item.id, item);
        g_haloMap.set(item.id.toString(), item);
        g_haloMap.set(item.name, item);
        g_haloMap.set(item.shortMark, item);
    });

    const g_configs = [
        {
            index : -1,
            id : 'maxConcurrentRequests',
            name : `最大并发网络请求（${g_ConcurrentRequestCount.min} - ${g_ConcurrentRequestCount.max}）`,
            defaultValue : g_ConcurrentRequestCount.default,
            value : g_ConcurrentRequestCount.default,
            tips : '同时向服务器提交的请求的最大数量。过高的设置容易引起服务阻塞或被认定为DDOS攻击从而导致服务器停止服务（HTTP 503）。',
            validate : ((value) => {
                return (!isNaN(value = parseInt(value)) &&
                        value >= g_ConcurrentRequestCount.min &&
                        value <= g_ConcurrentRequestCount.max);
            }),
            onchange : ((value) => {
                if (!isNaN(value = parseInt(value)) &&
                    value >= g_ConcurrentRequestCount.min &&
                    value <= g_ConcurrentRequestCount.max) {

                    return (g_maxConcurrentRequests = value);
                }
                return (g_maxConcurrentRequests = g_ConcurrentRequestCount.default);
            })
        },
        {
            index : -1,
            id : 'minBeachEquipLevelToAmulet',
            name : `海滩转护符稀有装备（绿色装备）最小等级`,
            defaultValue : 1,
            value : 1,
            tips : '海滩批量转换护符时稀有装备（绿色装备）所需达到的最小等级，小于此等级的装备不会被转换，但玩家依然可以选择手动熔炼。史诗和传奇装备则肯定会被自动转换。',
            validate : ((value) => {
                return /^\s*\d{1,3}\s*$/.test(value);
            }),
            onchange : ((value) => {
                if (/^\s*\d{1,3}\s*$/.test(value)) {
                    return parseInt(value);
                }
                return 1;
            })
        },
        {
            index : -1,
            id : 'minBeachAmuletPointsToStore',
            name : `海滩转护符默认入仓最小加成（苹果，葡萄，樱桃）`,
            defaultValue : '1, 1%, 1%',
            value : '1, 1%, 1%',
            tips : '海滩装备批量转换护符时默认处于入仓列表的最小加成（‘%’可省略）。此设置仅为程序产生分类列表时作为参考，玩家可通过双击特定护符移动它的位置。',
            validate : ((value) => {
                return /^\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*$/.test(value);
            }),
            onchange : ((value) => {
                if (/^\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*$/.test(value)) {
                    return value;
                }
                return '1, 1%, 1%';
            })
        }
    ];

    const g_configMap = new Map();
    g_configs.forEach((item, index) => {
        item.index = index;
        g_configMap.set(item.id, item);
    });

    function initiatizeConfig() {
        let udata = loadUserConfigData();
        if (udata == null) {
            udata = {
                dataIndex : { battleInfoNow : '' , battleInfoBefore : '' , battleInfoBack : '' },
                dataBeachSift : {},
                dataBind : {},
                config : {}
            };
        }
        if (udata.dataIndex == null) {
            udata.dataIndex = { battleInfoNow : '' , battleInfoBefore : '' , battleInfoBack : '' };
        }
        if (udata.dataBeachSift == null) {
            udata.dataBeachSift = {};
        }
        if (udata.dataBind == null) {
            udata.dataBind = {};
        }
        if (udata.config == null) {
            udata.config = {};
        }
        if (udata.calculatorTemplatePVE == null) {
            udata.calculatorTemplatePVE = {};
        }
        for (let key in udata.dataBeachSift) {
            if (!g_equipMap.has(key) && key != 'ignoreMysEquip' && key != 'ignoreEquipLevel') {
                delete udata.dataBeachSift[key];
            }
        }
        for (let key in udata.dataBind) {
            if (!g_roleMap.has(key)) {
                delete udata.dataBind[key];
            }
        }
        for (let key in udata.config) {
            if (!g_configMap.has(key)) {
                delete udata.config[key];
            }
        }
        for (let key in udata.calculatorTemplatePVE) {
            if (!g_roleMap.has(key)) {
                delete udata.calculatorTemplatePVE[key];
            }
        }

        g_configs.forEach((item) => {
            item.value = (item.onchange?.call(null, udata.config[item.id] ?? item.defaultValue));
        });

        saveUserConfigData(udata);
    }

    var g_themeLoaded = false;
    function loadTheme() {
        if (!g_themeLoaded) {
            g_themeLoaded = true;
            let cb = document.querySelector('input.iconpack-switch');
            if (cb != null) {
                g_useOldEquipName = cb.checked;
                g_useThemeEquipName = (document.querySelector('input.themepack-switch')?.checked ?? false);
                try {
                    let theme = JSON.parse(sessionStorage.getItem('ThemePack') ?? '{}');
                    if (theme?.url != undefined) {
                        amuletLoadTheme(theme);
                        equipLoadTheme(theme);
                    }
                }
                catch (ex) {
                    console.log('THEME:');
                    console.log(ex);
                }
            }
        }
    }

    function wishExpireTip() {
        if (localStorage.getItem(g_ignoreWishpoolExpirationStorageKey) != 'true') {
            let misc;
            beginReadWishpool(
                null,
                misc = [],
                () => {
                    if (parseInt(misc[1]) < 2) {
                        let navButtons = document.querySelectorAll(g_navigatorSelector + 'div.btn-group > button.btn.btn-lg');
                        for (let btn of navButtons) {
                            if (btn.innerText.indexOf('许愿池') >= 0) {
                                btn.innerText = '许愿池（已过期）';
                                btn.className += ' btn-danger';
                                break;
                            }
                        }
                    }
                },
                null);
        }
    }

    function stoneProgressTip(fnPostProcess) {
        function setTips(tips) {
            let tip = false;
            let navButtons = document.querySelectorAll(g_navigatorSelector + 'div.btn-group > button.btn.btn-lg');
            for (let btn of navButtons) {
                if (btn.innerText.indexOf('我的角色') >= 0) {
                    if (tips?.length > 0) {
                        btn.innerText = `我的角色（${tips}）`;
                        if(tips.indexOf('100%')>-1&&window.location.href.indexOf('fyg_equip.php')==-1&&$('#forgeAutoCheckbox')[0].checked){
                            window.open('fyg_equip.php', '_blank'); btn.innerText = `我的角色`;
                        };
                        if (btn.className.indexOf('btn-danger') < 0) {
                            btn.className += ' btn-danger';let onck=false;
                            if(tips.indexOf('装备')>-1&&window.location.href.indexOf('fyg_equip.php')>-1){
                                eqlip(4);eqbp(4); $(document).ajaxSuccess(function(){ if(onck==false){ onck=true; $("button[onclick*='b_forge(']")[0].click();} });onck=false;btn.innerText = `我的角色`;
                            };
                            if(tips.indexOf('卡片')>-1&&window.location.href.indexOf('fyg_equip.php')>-1){
                                eqlip(4);eqbp(4); $(document).ajaxSuccess(function(){ if(onck==false){ onck=true; $("button[onclick*='b_forca(']")[0].click();} });onck=false;btn.innerText = `我的角色`;
                            };
                            if(tips.indexOf('宝石')>-1&&window.location.href.indexOf('fyg_equip.php')>-1){
                                eqlip(4);eqbp(4);$(document).ajaxSuccess(function(){
                                    if(onck==false){
                                       onck=true;if(localStorage.getItem(g_stoneAuto1StorageKey)=='true'){$("button[onclick*='b_forcbs(1']")[0].click();}
                                        else if(localStorage.getItem(g_stoneAuto2StorageKey)=='true'){$("button[onclick*='b_forcbs(2']")[0].click();}
                                        else if(localStorage.getItem(g_stoneAuto3StorageKey)=='true'){$("button[onclick*='b_forcbs(3']")[0].click();}
                                        else if(localStorage.getItem(g_stoneAuto4StorageKey)=='true'){$("button[onclick*='b_forcbs(4']")[0].click();}
                                        else if(localStorage.getItem(g_stoneAuto5StorageKey)=='true'){$("button[onclick*='b_forcbs(5']")[0].click();}
                                        else if(localStorage.getItem(g_stoneAuto6StorageKey)=='true'){$("button[onclick*='b_forcbs(6']")[0].click();};
                                    };});onck=false;btn.innerText = `我的角色`;
                            };
                        }
                        tip = true;
                    }
                    else {
                        btn.innerText = `我的角色`;
                        btn.className = 'btn btn-lg' + (window.location.pathname == g_guguzhenEquip ? ' btn-primary' : '');
                    }
                    break;
                }
            }
            if (fnPostProcess != null) {
                fnPostProcess(tip);
            }
        }

        let storageKeys = [ g_stoneProgressEquipTipStorageKey, g_stoneProgressCardTipStorageKey, g_stoneProgressHaloTipStorageKey,
                            g_stoneAuto1StorageKey,g_stoneAuto2StorageKey,g_stoneAuto3StorageKey,g_stoneAuto4StorageKey,g_stoneAuto5StorageKey,g_stoneAuto6StorageKey];
        let tipEnabled = [];
        storageKeys.forEach((e) => {
            if (localStorage.getItem(e) == 'true') {
                tipEnabled.push(e);
            }
        });

        if (tipEnabled.length > 0) {
            let progresses;
            beginReadStoneProgress(
                progresses = [],
                null,
                () => {
                    if (progresses.length == 3) {
                        let tips = '';
                        let sp = '';
                        progresses.forEach((e, i) => {
                            if (tipEnabled.indexOf(storageKeys[i]) >= 0 && /100%/.test(e)) {
                                tips += (sp + e);
                                sp = ', ';
                            }
                        });
                        setTips(tips);
                    }
                    else if (fnPostProcess != null) {
                        fnPostProcess(false);
                    }
                },
                null);
        }
        else {
            setTips();
        }
    }

    initiatizeConfig();
    wishExpireTip();
    stoneProgressTip();

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // page add-ins
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    if (window.location.pathname == g_guguzhenHome) {
        function doConfig() {
            let fixedContent =
                '<div style="padding:20px 10px 10px 0px;color:blue;font-size:15px;"><b>请勿随意修改配置项，' +
                `除非您知道它的准确用途并且设置为正确的值，否则可能导致插件工作异常<span id="${g_genericPopupInformationTipsId}" ` +
                'style="float:right;color:red;"></span></b></div>';
            let mainContent =
                `<style> #config-table { width:100%; }
                         #config-table th { width:20%; }
                         #config-table th.config-th-name { width:60%; }
                         #config-table th.config-th-button { width:20%; }
                         #config-table button.config-restore-value { width:50%; }
                         table tr.alt { background-color:${g_genericPopupBackgroundColorAlt}; } </style>
                 <div class="${g_genericPopupTopLineDivClass}"><table id="config-table">
                 <tr class="alt"><th class="config-th-name">配置项</th><th>值</th><th class="config-th-button"></th></tr></table><div>`;

            genericPopupSetFixedContent(fixedContent);
            genericPopupSetContent('插件设置', mainContent);

            let configTable = genericPopupQuerySelector('#config-table');
            g_configs.forEach((item, index) => {
                let tr = document.createElement('tr');
                tr.className = ('config-tr' + ((index & 1) == 0 ? '' : ' alt'));
                tr.setAttribute('config-item', item.id);
                tr.innerHTML =
                    `<td><div data-toggle="popover" data-placement="bottom" data-trigger="hover" data-content="${item.tips}">${item.name}<div></td>
                     <td><div data-toggle="popover" data-placement="bottom" data-trigger="hover" data-content="${item.tips}">
                         <input type="text" style="display:inline-block;width:100%;" value="${item.value}" /><div></td>
                     <td><button type="button" class="config-restore-value" title="重置为当前配置" value="${item.value}">当前</button>` +
                        `<button type="button" class="config-restore-value" title="重置为默认配置" value="${item.defaultValue}">默认</button></td>`;
                tr.children[1].children[0].children[0].oninput = tr.children[1].children[0].children[0].onchange = validateInput;
                configTable.appendChild(tr);
            });
            function validateInput(e) {
                let tr = e.target.parentNode.parentNode.parentNode;
                let cfg = g_configMap.get(tr.getAttribute('config-item'));
                tr.style.color = ((cfg.validate?.call(null, e.target.value) ?? true) ? 'black' : 'red');
            }

            configTable.querySelectorAll('button.config-restore-value').forEach((btn) => { btn.onclick = restoreValue; });
            function restoreValue(e) {
                let input = e.target.parentNode.parentNode.children[1].children[0].children[0];
                input.value = e.target.value;
                input.oninput({ target : input });
                genericPopupShowInformationTips('配置项已' + e.target.title, 5000);
            }

            $('#config-table div[data-toggle="popover"]').popover();

            genericPopupAddButton('重置为当前配置', 0, restoreValueAll, true).setAttribute('config-restore-default-all', 0);
            genericPopupAddButton('重置为默认配置', 0, restoreValueAll, true).setAttribute('config-restore-default-all', 1);
            function restoreValueAll(e) {
                let defaultValue = (e.target.getAttribute('config-restore-default-all') == '1');
                configTable.querySelectorAll('tr.config-tr').forEach((row) => {
                    let id = row.getAttribute('config-item');
                    let cfg = g_configMap.get(id);
                    let input = row.children[1].children[0].children[0];
                    input.value = (defaultValue ? cfg.defaultValue : (cfg.value ?? cfg.defaultValue));
                    input.oninput({ target : input });
                });
                genericPopupShowInformationTips('全部配置项已' + e.target.innerText, 5000);
            }

            genericPopupAddButton('保存', 80, saveConfig, false).setAttribute('config-save-config', 1);
            genericPopupAddButton('确认', 80, saveConfig, false).setAttribute('config-save-config', 0);
            function saveConfig(e) {
                let close = (e.target.getAttribute('config-save-config') == '0');
                let udata = loadUserConfigData();
                let config = (udata?.config ?? {});
                let error = [];
                configTable.querySelectorAll('tr.config-tr').forEach((row) => {
                    let id = row.getAttribute('config-item');
                    let cfg = g_configMap.get(id);
                    let value = row.children[1].children[0].children[0].value;
                    if (cfg.validate?.call(null, value) ?? true) {
                        config[id] = cfg.value = row.children[2].children[0].value = (cfg.onchange?.call(null, value) ?? value);
                    }
                    else {
                        error.push(cfg.name);
                    }
                });

                udata.config = config;
                saveUserConfigData(udata);

                if (error.length > 0) {
                    alert('以下配置项输入内容有误，如有必要请重新设置：\n\n    [ ' + error.join(' ]\n    [ ') + ' ]');
                }
                else if (close) {
                    genericPopupClose(true, true);
                }
                else {
                    genericPopupShowInformationTips('配置已保存', 5000);
                }
            }
            genericPopupAddCloseButton(80);

            genericPopupSetContentSize(Math.min(g_configs.length * 28 + 60, Math.max(window.innerHeight - 200, 400)),
                                       Math.min(600, Math.max(window.innerWidth - 100, 600)),
                                       true);
            genericPopupShowModal(true);
        }

        const USER_DATA_xPORT_SEPARATOR = '\n';

        function importUserConfigData() {
            genericPopupSetContent(
                '导入内容',
                `<b><div style="color:#0000c0;padding:15px 0px 10px;">
                 请将从其它系统中使用同一帐号导出的内容填入文本框中并执行导入操作</div></b>
                 <div style="height:330px;"><textarea id="user_data_persistence_string"
                 style="height:100%;width:100%;resize:none;"></textarea></div>`);

            genericPopupAddButton(
                '执行导入',
                0,
                (() => {
                    let userData = genericPopupQuerySelector('#user_data_persistence_string').value.split(USER_DATA_xPORT_SEPARATOR);
                    if (userData.length > 0) {
                        if (confirm('导入操作会覆盖已有的用户配置（护符组定义、卡片装备光环护符绑定、海滩装备筛选配置等等），要继续吗？')) {
                            let backup = [];
                            let importedItems = [];
                            let illegalItems = [];
                            g_userDataStorageKeyConfig.forEach((item, index) => {
                                backup[index] = localStorage.getItem(item);
                            });
                            userData.forEach((item) => {
                                if ((item = item.trim()).length > 0) {
                                    let key = item.slice(0, item.indexOf(USER_STORAGE_KEY_VALUE_SEPARATOR));
                                    if (g_userDataStorageKeyConfig.indexOf(key) >= 0) {
                                        if (illegalItems.length == 0) {
                                            localStorage.setItem(key, item.substring(key.length + 1));
                                            importedItems.push(key);
                                        }
                                    }
                                    else {
                                        illegalItems.push(key);
                                    }
                                }
                            });
                            if (illegalItems.length > 0) {
                                importedItems.forEach((item) => {
                                    let index = g_userDataStorageKeyConfig.indexOf(item);
                                    if (index >= 0 && backup[index] != null) {
                                        localStorage.setItem(item, backup[index]);
                                    }
                                    else {
                                        localStorage.removeItem(item);
                                    }
                                });
                                alert('输入内容格式有误，有非法项目导致导入失败，请检查：\n\n    [ ' + illegalItems.join(' ]\n    [ ') + ' ]');
                            }
                            else if (importedItems.length > 0) {
                                alert('导入已完成：\n\n    [ ' + importedItems.join(' ]\n    [ ') + ' ]');
                                genericPopupClose();
                                window.location.reload();
                            }
                            else {
                                alert('输入内容格式有误，导入失败，请检查！');
                            }
                        }
                    }
                    else {
                        alert('输入内容格式有误，导入失败，请检查！');
                    }
                }),
                true);
            genericPopupAddCloseButton(80);

            genericPopupSetContentSize(400, 600, false);
            genericPopupShowModal(true);
        }

        function exportUserConfigData() {
            genericPopupSetContent(
                '导出内容',
                `<b><div id="user_data_export_tip" style="color:#0000c0;padding:15px 0px 10px;">
                 请勿修改任何导出内容，将其保存为纯文本在其它系统中使用相同的帐号执行导入操作</div></b>
                 <div style="height:330px;"><textarea id="user_data_persistence_string" readonly="true"
                 style="height:100%;width:100%;resize:none;"></textarea></div>`);

            genericPopupAddButton(
                '复制导出内容至剪贴板',
                0,
                ((e) => {
                    e.target.disabled = 'disabled';
                    let tipContainer = genericPopupQuerySelector('#user_data_export_tip');
                    let tipColor = tipContainer.style.color;
                    let tipString = tipContainer.innerText;
                    tipContainer.style.color = '#ff0000';
                    genericPopupQuerySelector('#user_data_persistence_string').select();
                    if (document.execCommand('copy')) {
                        tipContainer.innerText = '导出内容已复制到剪贴板';
                    }
                    else {
                        tipContainer.innerText = '复制失败，这可能是因为浏览器没有剪贴板访问权限，请进行手工复制（CTRL+A, CTRL+C）';
                    }
                    setTimeout((() => {
                        tipContainer.style.color = tipColor;
                        tipContainer.innerText = tipString;
                        e.target.disabled = '';
                    }), 3000);
                }),
                true);
            genericPopupAddCloseButton(80);

            let userData = [];
            g_userDataStorageKeyConfig.forEach((item) => {
                let value = localStorage.getItem(item);
                if (value != null) {
                    userData.push(`${item}${USER_STORAGE_KEY_VALUE_SEPARATOR}${value}`);
                }
            });
            genericPopupQuerySelector('#user_data_persistence_string').value = userData.join(USER_DATA_xPORT_SEPARATOR);

            genericPopupSetContentSize(400, 600, false);
            genericPopupShowModal(true);
        }

        function clearUserData() {
            if (confirm('这将清除所有用户配置（护符组定义、卡片装备光环护符绑定、海滩装备筛选配置等等）和数据，要继续吗？')) {
                g_userDataStorageKeyConfig.concat(g_userDataStorageKeyExtra).forEach((item) => {
                    localStorage.removeItem(item);
                });
                alert('用户配置和数据已全部清除！');
                window.location.reload();
            }
        }

        let waitForLoad = setInterval(() => {
            let panel = document.querySelector('div.col-md-3 > div.panel > div.panel-body');
            if (panel?.children?.length > 1) {
                clearInterval(waitForLoad);
                genericPopupInitialize();

                let userData = loadUserConfigData();
                let dataIndex = userData.dataIndex;

                for (var px = panel.firstElementChild; px != null && !px.innerText.startsWith('对玩家战斗'); px = px.nextElementSibling);
                if (px != null) {
                    let p0 = px.cloneNode(true);
                    let sp = p0.firstElementChild;
                    p0.firstChild.textContent = '对玩家战斗（上次查看）';

                    dataIndex.battleInfoNow = px.firstElementChild.innerText;
                    if (dataIndex.battleInfoNow == dataIndex.battleInfoBefore) {
                        sp.innerText = dataIndex.battleInfoBack;
                    }
                    else {
                        sp.innerText = dataIndex.battleInfoBefore;
                        dataIndex.battleInfoBack = dataIndex.battleInfoBefore;
                        dataIndex.battleInfoBefore = dataIndex.battleInfoNow
                        saveUserConfigData(userData);
                    }
                    px.parentNode.insertBefore(p0, px.nextElementSibling);
                }
                else {
                    px = panel.firstElementChild;
                }

                let globalDataBtnContainer = document.createElement('div');
                globalDataBtnContainer.style.borderTop = '1px solid #d0d0d0';
                globalDataBtnContainer.style.padding = '10px 0px 0px';

                let versionLabel = px.cloneNode(true);
                let versionText = versionLabel.firstElementChild;
                versionLabel.firstChild.textContent = '插件版本：';
                versionText.innerText = g_modificationVersion;
                globalDataBtnContainer.appendChild(versionLabel);

                let configBtn = document.createElement('button');
                configBtn.innerHTML = '设置';
                configBtn.style.height = '30px';
                configBtn.style.width = '100%';
                configBtn.style.marginBottom = '1px';
                configBtn.onclick = (() => {
                    doConfig();
                });
                globalDataBtnContainer.appendChild(configBtn);

                let importBtn = configBtn.cloneNode(true);
                importBtn.innerHTML = '导入用户配置数据';
                importBtn.onclick = (() => {
                    importUserConfigData();
                });
                globalDataBtnContainer.appendChild(importBtn);

                let exportBtn = configBtn.cloneNode(true);
                exportBtn.innerHTML = '导出用户配置数据';
                exportBtn.onclick = (() => {
                    exportUserConfigData();
                });
                globalDataBtnContainer.appendChild(exportBtn);

                let eraseBtn = configBtn.cloneNode(true);
                eraseBtn.innerHTML = '清除用户数据';
                eraseBtn.onclick = (() => {
                    clearUserData();
                });
                globalDataBtnContainer.appendChild(eraseBtn);

                px.parentNode.appendChild(globalDataBtnContainer);
            }
        }, 200);
    }
    else if (window.location.pathname == g_guguzhenEquip) {
        genericPopupInitialize();

        let waitForBackpacks = setInterval(() => {
            if (document.getElementById('backpacks')?.children?.length > 1) {
                clearInterval(waitForBackpacks);

                loadTheme();

                let panel = document.getElementsByClassName('panel panel-primary')[1];
                let calcBtn = document.createElement('button');
                let calcDiv = document.createElement('div');

                calcBtn.innerText = '导出计算器';
                calcBtn.style.marginLeft = '3px';
                calcBtn.disabled = 'disabled';
                calcBtn.onclick = (() => {});

                panel.insertBefore(calcBtn, panel.children[0]);
                panel.insertBefore(calcDiv, calcBtn);

                const cardingObjectsQueryString = '#carding > div.row > div.fyg_tc > button.fyg_mp3';
                const bagObjectsQueryString = '#backpacks > div.alert-danger > div.content > button.fyg_mp3';
                const storeObjectsQueryString = '#backpacks > div.alert-success > div.content > button.fyg_mp3';
                const storeQueryString = '#backpacks > div.alert.alert-success.with-icon';
                const storeButtonId = 'collapse-backpacks-store';

                let equipmentDiv = document.createElement('div');
                equipmentDiv.id = 'equipmentDiv';
                equipmentDiv.innerHTML =
                    `<p><div style="padding:0px 0px 10px 30px;float:right;">
                        <label for="equipment_StoreExpand" style="margin-right:5px;cursor:pointer;">仅显示背包和仓库</label>
                        <input type="checkbox" id="equipment_StoreExpand" style="margin-right:15px;" />
                        <label for="equipment_BG" style="margin-right:5px;cursor:pointer;">使用深色背景</label>
                        <input type="checkbox" id="equipment_BG" style="margin-right:15px;" />
                        <label for="equipment_Expand" style="margin-right:5px;cursor:pointer;">全部展开</label>
                        <input type="checkbox" id="equipment_Expand" style="margin-right:15px;" />
                        <button type="button" id="objects_Cleanup">清理库存</button></div></p>
                     <div id="equipment_ObjectContainer" style="display:block;height:0px;">
                     <p><button type="button" class="btn btn-block collapsed" data-toggle="collapse" data-target="#eq4">护符 ▼</button></p>
                        <div class="in" id="eq4"></div>
                     <p><button type="button" class="btn btn-block collapsed" data-toggle="collapse" data-target="#eq0">武器装备 ▼</button></p>
                        <div class="in" id="eq0"></div>
                     <p><button type="button" class="btn btn-block collapsed" data-toggle="collapse" data-target="#eq1">手臂装备 ▼</button></p>
                        <div class="in" id="eq1"></div>
                     <p><button type="button" class="btn btn-block collapsed" data-toggle="collapse" data-target="#eq2">身体装备 ▼</button></p>
                        <div class="in" id="eq2"></div>
                     <p><button type="button" class="btn btn-block collapsed" data-toggle="collapse" data-target="#eq3">头部装备 ▼</button></p>
                        <div class="in" id="eq3"></div>
                     <p><button type="button" class="btn btn-block collapsed" id="${storeButtonId}">仓库 ▼</button></p></div>`;

                function refreshEquipmentPage(fnFurtherProcess) {
                    let asyncOperations = 3;
                    let asyncObserver = new MutationObserver(() => {
                        if (--asyncOperations == 1) {
                            asyncObserver.disconnect();
                            asyncOperations = 0;
                        }
                    });
                    asyncObserver.observe(document.getElementById('backpacks'), { childList : true , subtree : true });

                    // refresh #carding & #backpacks
                    cding();
                    eqbp(1);

                    let timer = setInterval(() => {
                        if (asyncOperations == 0) {
                            clearInterval(timer);
                            if (fnFurtherProcess != null) {
                                fnFurtherProcess();
                            }
                        }
                    }, 200);
                }

                equipmentDiv.querySelector('#objects_Cleanup').onclick = objectsCleanup;
                function objectsCleanup() {
                    genericPopupInitialize();

                    let cancelled = false;
                    function cancelProcess() {
                        cancelled = true;
                        httpRequestAbortAll();
                        refreshEquipmentPage(() => { genericPopupClose(true); });
                    }

                    let bagObjects = document.querySelectorAll(bagObjectsQueryString);
                    let storeObjects = document.querySelectorAll(storeObjectsQueryString);
                    function refreshContainer(fnFurtherProcess) {
                        beginReadObjects(bagObjects = [], storeObjects = [], fnFurtherProcess, null);
                    }

                    let scheduledObjects = { equips : [] , amulets : [] };
                    function beginScheduleBag() {
                        genericPopupQuerySelectorAll('table.bag-list input.equip-checkbox.equip-item').forEach((e) => {
                            if (e.checked) {
                                scheduledObjects.equips.push(e.getAttribute('original-item').split(','));
                            }
                        });
                        genericPopupQuerySelectorAll('table.bag-list input.equip-checkbox.amulet-item').forEach((e) => {
                            if (e.checked) {
                                scheduledObjects.amulets.push((new Amulet()).fromBuffText(e.getAttribute('original-item')));
                            }
                        });

                        if (objectEmptyNodesCount(bagObjects) + scheduledObjects.equips.length + scheduledObjects.amulets.length == 0) {
                            operationEnabler(true);
                            genericPopupQuerySelector('#disclaimer-check').disabled = '';
                            alert('背包空闲空间不足，请重新选择！');
                            return;
                        }

                        if (scheduledObjects.equips.length + scheduledObjects.amulets.length > 0) {
                            let ids = findAmuletIds(bagObjects, scheduledObjects.amulets.slice());
                            findEquipmentIds(bagObjects, scheduledObjects.equips.slice(), ids);
                            if (ids.length > 0) {
                                genericPopupShowInformationTips('调整背包空间...', 0);
                                beginMoveObjects(ids, g_object_move_path.bag2store, refreshContainer, processAmulets);
                                return;
                            }
                        }
                        processAmulets();
                    }

                    function beginRestoreBag(closeCountDown) {
                        function restoreCompletion() {
                            if (scheduledObjects.amulets.length > 0 || scheduledObjects.equips.length > 0) {
                                alert('部分背包内容无法恢复，请手动处理！');
                                console.log(scheduledObjects.equips);
                                console.log(scheduledObjects.amulets);
                                scheduledObjects.equips = [];
                                scheduledObjects.amulets = [];
                            }

                            if (closeCountDown > 0) {
                                let timer = setInterval(() => {
                                    if (cancelled || --closeCountDown == 0) {
                                        clearInterval(timer);
                                        if (!cancelled) {
                                            cancelProcess();
                                        }
                                    }
                                    else {
                                        genericPopupShowInformationTips(`所有操作已完成，窗口将在 ${closeCountDown} 秒后关闭`, 0);
                                    }
                                }, 1000);
                            }
                            else {
                                cancelProcess();
                            }
                        }

                        if (scheduledObjects.equips.length == 0 && scheduledObjects.amulets.length == 0) {
                            restoreCompletion();
                        }
                        else {
                            genericPopupShowInformationTips('恢复背包内容...', 0);
                            beginRestoreObjects(null, scheduledObjects.amulets, scheduledObjects.equips, restoreCompletion, null);
                        }
                    }

                    function processAmulets() {
                        let amulets = [];
                        genericPopupQuerySelectorAll('table.amulet-list input.equip-checkbox.amulet-item').forEach((e) => {
                            if (e.checked) {
                                amulets.push((new Amulet()).fromBuffText(e.getAttribute('original-item')));
                            }
                        });

                        pirlAmulets();

                        function pirlAmulets() {
                            if (amulets.length > 0) {
                                genericPopupShowInformationTips(`转换果核...（${amulets.length}）`, 0);
                                let ids = findAmuletIds(bagObjects, amulets);
                                if (ids.length > 0) {
                                    beginPirlObjects(ids, refreshContainer, pirlAmulets);
                                }
                                else {
                                    let freecell = objectEmptyNodesCount(bagObjects);
                                    if (freecell > 0) {
                                        let ids = findAmuletIds(storeObjects, amulets.slice(), null, freecell);
                                        if (ids.length > 0) {
                                            beginMoveObjects(ids, g_object_move_path.store2bag, refreshContainer, pirlAmulets);
                                        }
                                        else {
                                            console.log(amulets);
                                            processEquips();
                                        }
                                    }
                                    else {
                                        alert('调整背包空间失败，请检查！');
                                        cancelProcess();
                                    }
                                }
                            }
                            else {
                                processEquips();
                            }
                        }
                    }

                    function processEquips() {
                        let equips = [];
                        genericPopupQuerySelectorAll('table.equip-list input.equip-checkbox.equip-item').forEach((e) => {
                            if (e.checked) {
                                equips.push(e.getAttribute('original-item').split(','));
                            }
                        });

                        equipToBeach();

                        function equipToBeach() {
                            if (equips.length > 0) {
                                genericPopupShowInformationTips(`丢弃装备...（${equips.length}）`, 0);
                                let ids = findEquipmentIds(bagObjects, equips);
                                if (ids.length > 0) {
                                    beginMoveObjects(ids, g_object_move_path.bag2beach, refreshContainer, equipToBeach);
                                }
                                else {
                                    let freecell = objectEmptyNodesCount(bagObjects);
                                    if (freecell > 0) {
                                        let ids = findEquipmentIds(storeObjects, equips.slice(), null, freecell);
                                        if (ids.length > 0) {
                                            beginMoveObjects(ids, g_object_move_path.store2bag, refreshContainer, equipToBeach);
                                        }
                                        else {
                                            console.log(equips);
                                            beginRestoreBag(15);
                                        }
                                    }
                                    else {
                                        alert('调整背包空间失败，请检查！');
                                        cancelProcess();
                                    }
                                }
                            }
                            else {
                                beginRestoreBag(15);
                            }
                        }
                    }

                    let fixedContent =
                        '<div style="padding:20px 10px 10px 0px;color:blue;font-size:15px;"><b><ul>' +
                          '<li>背包表中被选中的项将在操作过程中暂时移入仓库，操作完成后未被丢弃或转换为果核的项会恢复回背包</li>' +
                          '<li>护符表中被选中的护符会被销毁并转换为果核，此操作不可逆，请谨慎使用</li>' +
                          '<li>装备表中被选中的装备会被丢弃，丢弃后的装备将出现在海滩上，并在24小时后消失，在它消失前您可随时捡回</li>' +
                          '<li>正在使用的装备不会出现在装备表中，如果您想要丢弃正在使用的装备，请首先将它替换下来</li>' +
                          `<li id="${g_genericPopupInformationTipsId}" style="color:red;">` +
                             `<input type="checkbox" id="disclaimer-check" />` +
                             `<label for="disclaimer-check" style="margin-left:5px;cursor:pointer;">` +
                              `本人已仔细阅读并完全理解以上全部注意事项，愿意独立承担所有因此操作而引起的一切后果及损失</label></li></ul></b></div>`;
                    const mainStyle =
                          '<style> .group-menu { position:relative;' +
                                                'display:inline-block;' +
                                                'color:blue;' +
                                                'font-size:20px;' +
                                                'cursor:pointer; } ' +
                                  '.group-menu-items { display:none;' +
                                                      'position:absolute;' +
                                                      'font-size:15px;' +
                                                      'word-break:keep-all;' +
                                                      'white-space:nowrap;' +
                                                      'margin:0 auto;' +
                                                      'width:fit-content;' +
                                                      'z-index:999;' +
                                                      'background-color:white;' +
                                                      'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                      'padding:15px 30px; } '+
                                  '.group-menu-item { } ' +
                                  '.group-menu:hover .group-menu-items { display:block; } ' +
                                  '.group-menu-items .group-menu-item:hover { background-color:#bbddff; } ' +
                              'b > span { color:purple; } ' +
                              'button.btn-group-selection { width:80px; float:right; } ' +
                              'table.bag-list { width:100%; } ' +
                                  'table.bag-list th.object-name { width:35%; text-align:left; } ' +
                                  'table.bag-list th.object-property { width:65%; text-align:left; } ' +
                              'table.amulet-list { width:100%; } ' +
                                  'table.amulet-list th.object-name { width:20%; text-align:left; } ' +
                                  'table.amulet-list th.object-property { width:80%; text-align:left; } ' +
                              'table.equip-list { width:100%; } ' +
                                  'table.equip-list th.object-name { width:36%; text-align:left; } ' +
                                  'table.equip-list th.object-property { width:16%; text-align:left; } ' +
                              'table tr.alt { background-color:' + g_genericPopupBackgroundColorAlt + '; } ' +
                          '</style>';
                    const menuItems =
                          '<div class="group-menu-items"><ul>' +
                              '<li class="group-menu-item"><a href="#bag-div">背包</a></li>' +
                              '<li class="group-menu-item"><a href="#amulets-div">护符</a></li>' +
                              '<li class="group-menu-item"><a href="#equips1-div">武器装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips2-div">手臂装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips3-div">身体装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips4-div">头部装备</a></li>' +
                          '</ul></div>';
                    const bagTable =
                          '<table class="bag-list"><tr class="alt"><th class="object-name">内容</th><th class="object-property">属性</th></tr></table>';
                    const amuletTable =
                          '<table class="amulet-list"><tr class="alt"><th class="object-name">护符</th><th class="object-property">属性</th></tr></table>';
                    const equipTable =
                          '<table class="equip-list"><tr class="alt"><th class="object-name">装备</th><th class="object-property">属性</th>' +
                             '<th class="object-property"></th><th class="object-property"></th><th class="object-property"></th></tr></table>';
                    const btnGroup =
                          '<button type="button" class="btn-group-selection" select-type="2">反选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="1">全不选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="0">全选</button>';
                    const mainContent =
                        `${mainStyle}
                         <div class="${g_genericPopupTopLineDivClass} bag-div" id="bag-div">
                           <b class="group-menu">背包 （选中 <span>0</span>，空闲 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${bagTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="amulets-div">
                           <b class="group-menu">护符 （选中 <span>0</span>）（★：已加入护符组） ▼${menuItems}</b>${btnGroup}<p />${amuletTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips1-div">
                           <b class="group-menu">武器装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips2-div">
                           <b class="group-menu">手臂装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips3-div">
                           <b class="group-menu">身体装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips4-div">
                           <b class="group-menu">头部装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent('清理库存', mainContent);

                    genericPopupQuerySelector('div.bag-div').firstElementChild.firstElementChild
                        .nextElementSibling.innerText = objectEmptyNodesCount(bagObjects);

                    genericPopupQuerySelectorAll('button.btn-group-selection').forEach((btn) => { btn.onclick = batchSelection; });
                    function batchSelection(e) {
                        let selType = parseInt(e.target.getAttribute('select-type'));
                        let selCount = 0;
                        e.target.parentNode.querySelectorAll('input.equip-checkbox').forEach((chk) => {
                            if (chk.checked = (selType == 2 ? !chk.checked : selType == 0)) {
                                selCount++;
                            }
                        });
                        e.target.parentNode.firstElementChild.firstElementChild.innerText = selCount;
                    }

                    const objectTypeColor = [ '#e0fff0', '#ffe0ff', '#fff0e0', '#d0f0ff' ];
                    let bag_selector = genericPopupQuerySelector('table.bag-list');
                    let bagEquips = equipmentNodesToInfoArray(document.querySelectorAll(bagObjectsQueryString));
                    let bagAmulets = amuletNodesToArray(document.querySelectorAll(bagObjectsQueryString));
                    bagEquips.slice().sort(equipmentInfoComparer).forEach((item) => {
                        let eqMeta = g_equipMap.get(item[0]);
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[3];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox equip-item" id="bag-${item[7]}"
                                        original-item="${item.join(',')}" />
                                 <label for="bag-${item[7]}" style="margin-left:5px;cursor:pointer;">
                                        ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                             <td>${formatEquipmentAttributes(item, ', ')}</td>`;
                        bag_selector.appendChild(tr);
                    });
                    bagAmulets.slice().sort((a , b) => a.compareTo(b, true)).forEach((item) => {
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[item.type];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox amulet-item" id="bag-${item.id}"
                                        original-item="${item.formatBuffText()}" />
                                 <label for="bag-${item.id}" style="margin-left:5px;cursor:pointer;">
                                        ${item.formatName()}</label></td>
                             <td>${item.formatBuff()}</td>`;
                        bag_selector.appendChild(tr);
                    });

                    let groupAmulets = [];
                    amuletLoadGroups().toArray().forEach((group) => { groupAmulets.push(group.items); });
                    groupAmulets = groupAmulets.flat().sort((a , b) => a.compareMatch(b));
                    let amulet_selector = genericPopupQuerySelector('table.amulet-list');
                    let storeAmulets = amuletNodesToArray(document.querySelectorAll(storeObjectsQueryString));
                    storeAmulets.concat(bagAmulets).sort((a , b) => a.compareTo(b)).forEach((item) => {
                        let gi = searchElement(groupAmulets, item, (a , b) => a.compareMatch(b));
                        if (gi >= 0) {
                            groupAmulets.splice(gi, 1);
                        }
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[item.type];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox amulet-item" id="amulet-${item.id}"
                                        original-item="${item.formatBuffText()}" />
                                 <label for="amulet-${item.id}" style="margin-left:5px;cursor:pointer;">
                                        ${gi >= 0 ? '★ ' : ''}${item.formatName()}</label></td>
                             <td>${item.formatBuff()}</td>`;
                        amulet_selector.appendChild(tr);
                    });

                    let eqIndex = 0;
                    let eq_selectors = genericPopupQuerySelectorAll('table.equip-list');
                    let storeEquips = equipmentNodesToInfoArray(document.querySelectorAll(storeObjectsQueryString));
                    storeEquips.concat(bagEquips).sort((e1, e2) => {
                        if (e1[0] != e2[0]) {
                            return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                        }
                        return -equipmentInfoComparer(e1, e2);
                    }).forEach((item) => {
                        let eqMeta = g_equipMap.get(item[0]);
                        let lv = equipmentGetLevel(item);
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = g_equipmentLevelBGColor[lv];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox equip-item" id="equip-${++eqIndex}"
                                        original-item="${item.join(',')}" />
                                 <label for="equip-${eqIndex}" style="margin-left:5px;cursor:pointer;">
                                        ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                             <td>${formatEquipmentAttributes(item, '</td><td>')}</td>`;
                        eq_selectors[eqMeta.type].appendChild(tr);
                    });

                    genericPopupQuerySelectorAll('input.equip-checkbox').forEach((e) => { e.onchange = equipCheckboxStateChange; });
                    function equipCheckboxStateChange(e) {
                        let countSpan = e.target.parentNode.parentNode.parentNode.parentNode.firstElementChild.firstElementChild;
                        countSpan.innerText = parseInt(countSpan.innerText) + (e.target.checked ? 1 : -1);
                    }

                    let btnGo = genericPopupAddButton('开始', 80, (() => {
                        operationEnabler(false);
                        genericPopupQuerySelector('#disclaimer-check').disabled = 'disabled';
                        beginScheduleBag();
                    }), false);
                    let btnCancel = genericPopupAddButton('取消', 80, () => {
                        operationEnabler(false);
                        btnCancel.disabled = 'disabled';
                        cancelProcess();
                    }, false);

                    function operationEnabler(enabled) {
                        let v = enabled ? '' : 'disabled';
                        genericPopupQuerySelectorAll('button.btn-group-selection').forEach((e) => { e.disabled = v; });
                        genericPopupQuerySelectorAll('input.equip-checkbox').forEach((e) => { e.disabled = v; });
                        btnGo.disabled = v;
                    }
                    operationEnabler(false);
                    genericPopupQuerySelector('#disclaimer-check').onchange = ((e) => { operationEnabler(e.target.checked); });

                    let objectsCount = bagEquips.length + bagAmulets.length + storeEquips.length + storeAmulets.length;
                    genericPopupSetContentSize(Math.min((objectsCount * 31) + (6 * 104), Math.max(window.innerHeight - 400, 400)),
                                               Math.min(1000, Math.max(window.innerWidth - 200, 600)),
                                               true);
                    genericPopupShowModal(false);
                }

                ////////////////////////////////////////////////////////////////////////////////
                //
                // collapse container
                //
                ////////////////////////////////////////////////////////////////////////////////

                let forceEquipDivOperation = true;
                let equipDivExpanded = {};

                equipmentDiv.querySelectorAll('button.btn.btn-block.collapsed').forEach((btn) => { btn.onclick = backupEquipmentDivState; });
                function backupEquipmentDivState(e) {
                    let targetDiv = equipmentDiv.querySelector(e.target.getAttribute('data-target'));
                    if (targetDiv != null) {
                        equipDivExpanded[targetDiv.id] = !equipDivExpanded[targetDiv.id];
                    }
                    else {
                        equipDivExpanded[e.target.id] = !equipDivExpanded[e.target.id];
                    }
                };

                function collapseEquipmentDiv(expand, force) {
                    let targetDiv;
                    equipmentDiv.querySelectorAll('button.btn.btn-block').forEach((btn) => {
                        if (btn.getAttribute('data-toggle') == 'collapse' &&
                            (targetDiv = equipmentDiv.querySelector(btn.getAttribute('data-target'))) != null) {

                            let exp = expand;
                            if (equipDivExpanded[targetDiv.id] == undefined || force) {
                                equipDivExpanded[targetDiv.id] = exp;
                            }
                            else {
                                exp = equipDivExpanded[targetDiv.id];
                            }

                            targetDiv.className = (exp ? 'in' : 'collapse');
                            targetDiv.style.height = (exp ? 'auto' : '0px');
                        }
                    });
                    if (equipDivExpanded[storeButtonId] == undefined || force) {
                        equipDivExpanded[storeButtonId] = expand;
                    }
                    if (equipDivExpanded[storeButtonId]) {
                        $(storeQueryString).show();
                    }
                    else {
                        $(storeQueryString).hide();
                    }
                }

                let objectContainer = equipmentDiv.querySelector('#equipment_ObjectContainer');
                function switchObjectContainerStatus(show) {
                    if (show) {
                        objectContainer.style.display = 'block';
                        objectContainer.style.height = 'auto';
                        if (equipDivExpanded[storeButtonId]) {
                            $(storeQueryString).show();
                        }
                        else {
                            $(storeQueryString).hide();
                        }
                    }
                    else {
                        objectContainer.style.height = '0px';
                        objectContainer.style.display = 'none';
                        $(storeQueryString).show();
                    }

                    equipmentDiv.querySelector('#equipment_Expand').disabled =
                        equipmentDiv.querySelector('#equipment_BG').disabled = (show ? '' : 'disabled');
                }

                function changeEquipmentDivStyle(bg) {
                    $('#equipmentDiv .backpackDiv').css({
                        'background-color': bg ? 'black' : '#ffe5e0'
                    });
                    $('#equipmentDiv .storeDiv').css({
                        'background-color': bg ? 'black' : '#ddf4df'
                    });
                    $('#equipmentDiv .btn-light').css({
                        'background-color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .popover-content-show').css({
                        'background-color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .popover-title').css({
                        'color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .bg-special').css({
                        'background-color': bg ? 'black' : '#8666b8',
                        'color': bg ? '#c0c0c0' : 'white',
                        'border-bottom': bg ? '1px solid grey' : 'none'
                    });
                    $('#equipmentDiv .btn-equipment .pull-right').css({
                        'color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .btn-equipment .bg-danger.with-padding').css({
                        'color': bg ? 'black' : 'white'
                    });
                }

                let equipmentStoreExpand = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_StoreExpand'),
                                                               g_equipmentStoreExpandStorageKey,
                                                               (checked) => { switchObjectContainerStatus(!(equipmentStoreExpand = checked)); },
                                                               null);
                let equipmentExpand = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_Expand'),
                                                          g_equipmentExpandStorageKey,
                                                          (checked) => { collapseEquipmentDiv(equipmentExpand = checked, true); },
                                                          null);
                let equipmentBG = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_BG'),
                                                      g_equipmentBGStorageKey,
                                                      (checked) => { changeEquipmentDivStyle(equipmentBG = checked); },
                                                      null);

                function addCollapse() {
                    let waitForBtn = setInterval(() => {
                        if (document.getElementById('carding')?.innerText?.indexOf('读取中') < 0 &&
                            document.getElementById('backpacks')?.innerText?.indexOf('读取中') < 0) {

                            let eqbtns = document.querySelectorAll(cardingObjectsQueryString);
                            if (eqbtns?.length > 0) {
                                clearInterval(waitForBtn);

                                let eqstore = document.querySelectorAll(storeObjectsQueryString);
                                eqstore.forEach((item) => {
                                    if (item.className?.split(' ').length > 2 && (item.className.endsWith('fyg_mp3') ||
                                                                                  item.className.endsWith('fyg_mp3 fyg_tc'))) {
                                        item.dataset.instore = 1;
                                    }
                                });

                                eqbtns =
                                    Array.from(eqbtns).concat(
                                    Array.from(document.querySelectorAll(bagObjectsQueryString))
                                         .sort(objectNodeComparer)).concat(
                                    Array.from(eqstore).sort(objectNodeComparer));

                                for (let i = eqbtns.length - 1; i >= 0; i--) {
                                    if (!(eqbtns.className?.split(' ').length > 2 || (eqbtns[i].className?.endsWith('fyg_mp3') ||
                                                                                      eqbtns[i].className?.endsWith('fyg_mp3 fyg_tc')))) {
                                        eqbtns.splice(i, 1);
                                    }
                                }
                                if (!(document.getElementsByClassName('collapsed')?.length > 0)) {
                                    document.getElementById('backpacks')
                                            .insertBefore(equipmentDiv, document.getElementById('backpacks').firstChild.nextSibling);
                                }
                                for (let i = eqbtns.length - 1; i >= 0; i--) {
                                    if (eqbtns[i].className.split(' ')[0] == 'popover') {
                                        eqbtns.splice(i, 1);
                                        break;
                                    }
                                }

                                let ineqBackpackDiv =
                                    '<div class="backpackDiv" style="padding:10px;margin-bottom:10px;"></div>' +
                                    '<div class="storeDiv" style="padding:10px;"></div>';
                                let eqDivs = [ equipmentDiv.querySelector('#eq0'),
                                               equipmentDiv.querySelector('#eq1'),
                                               equipmentDiv.querySelector('#eq2'),
                                               equipmentDiv.querySelector('#eq3'),
                                               equipmentDiv.querySelector('#eq4') ];
                                eqDivs.forEach((item) => { item.innerHTML = ineqBackpackDiv; });
                                let ineq = 0;

                                eqbtns.forEach((btn) => {
                                    if (objectIsEmptyNode(btn)) {
                                        return;
                                    }

                                    let btn0 = document.createElement('button');
                                    btn0.className = `btn btn-light ${g_equipmentLevelTipClass[equipmentGetLevel(btn)]}`;
                                    btn0.style.minWidth = '200px';
                                    btn0.style.marginRight = '5px';
                                    btn0.style.marginBottom = '5px';
                                    btn0.style.padding = '0px';
                                    btn0.style.textAlign = 'left';
                                    btn0.style.boxShadow = 'none';
                                    btn0.style.lineHeight = '150%';
                                    btn0.setAttribute('onclick', btn.getAttribute('onclick'));

                                    let storeText = '';
                                    if (btn.dataset.instore == 1) {
                                        storeText = '【仓】';
                                    }

                                    let enhancements = btn.innerText;
                                    if (enhancements.indexOf('+') < 0) {
                                        enhancements = '';
                                    }

                                    btn0.innerHTML =
                                        `<h3 class="popover-title" style="color:white;background-color: ${btn0.style.borderColor}">
                                         ${storeText}${btn.dataset.originalTitle}${enhancements}</h3>
                                         <div class="popover-content-show" style="padding:10px 10px 0px 10px;">${btn.dataset.content}</div>`;

                                    if (btn0.children[1].lastChild.nodeType == 3) { //清除背景介绍文本
                                        btn0.children[1].lastChild.remove();
                                    }

                                    if (btn.innerText.indexOf('+') >= 0) {
                                        ineq = 4;
                                    }
                                    else {
                                        let a = g_equipments[parseInt(btn.dataset.metaIndex)];
                                        if (a == null) {
                                            let e = equipmentInfoParseNode(btn);
                                            a = g_equipMap.get(e?.[0]);
                                        }
                                        if ((ineq = (a?.type ?? 4)) < 4) {
                                            btn0.className += ' btn-equipment';
                                        }
                                    }

                                    (storeText == '' ? eqDivs[ineq].firstChild : eqDivs[ineq].firstChild.nextSibling).appendChild(btn0);
                                });

                                function inputAmuletGroupName(defaultGroupName) {
                                    let groupName = prompt('请输入护符组名称（不超过31个字符，请仅使用大、小写英文字母、数字、连字符、下划线及中文字符）：',
                                                           defaultGroupName);
                                    if (amuletIsValidGroupName(groupName)) {
                                        return groupName;
                                    }
                                    else if (groupName != null) {
                                        alert('名称不符合命名规则，信息未保存。');
                                    }
                                    return null;
                                }

                                function queryAmulets(bag, store, key) {
                                    let count = 0;
                                    if (bag != null) {
                                        amuletNodesToArray(document.querySelectorAll(bagObjectsQueryString), bag, key);
                                        count += bag.length;
                                    }
                                    if (store != null) {
                                        amuletNodesToArray(document.querySelectorAll(storeObjectsQueryString), store, key);
                                        count += store.length;
                                    }
                                    return count;
                                }

                                function showAmuletGroupsPopup() {
                                    function beginSaveBagAsGroup(groupName, update) {
                                        let amulets = [];
                                        queryAmulets(amulets, null);
                                        createAmuletGroup(groupName, amulets, update);
                                        showAmuletGroupsPopup();
                                    }

                                    genericPopupClose(true);

                                    let bag = [];
                                    let store = [];
                                    if (queryAmulets(bag, store) == 0) {
                                        alert('护符信息加载异常，请检查！');
                                        refreshEquipmentPage(null);
                                        return;
                                    }

                                    let amulets = bag.concat(store);
                                    let bagGroup = amuletCreateGroupFromArray('当前背包', bag);
                                    let groups = amuletLoadGroups();
                                    if (bagGroup == null && groups.count() == 0) {
                                        alert('背包为空，且未找到预保存的护符组信息！');
                                        return;
                                    }

                                    genericPopupSetContent(
                                        '护符组管理',
                                        '<style> .group-menu { position:relative;' +
                                                              'display:inline-block;' +
                                                              'color:blue;' +
                                                              'font-size:20px;' +
                                                              'cursor:pointer; } ' +
                                                '.group-menu-items { display:none;' +
                                                                    'position:absolute;' +
                                                                    'font-size:15px;' +
                                                                    'word-break:keep-all;' +
                                                                    'white-space:nowrap;' +
                                                                    'margin:0 auto;' +
                                                                    'width:fit-content;' +
                                                                    'z-index:999;' +
                                                                    'background-color:white;' +
                                                                    'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                                    'padding:15px 30px; } ' +
                                                '.group-menu-item { } ' +
                                                '.group-menu:hover .group-menu-items { display:block; } ' +
                                                '.group-menu-items .group-menu-item:hover { background-color:#bbddff; } ' +
                                        '</style>' +
                                        '<div id="popup_amulet_groups" style="margin-top:15px;"></div>');
                                    let amuletContainer = genericPopupQuerySelector('#popup_amulet_groups');
                                    let groupMenuDiv = document.createElement('div');
                                    groupMenuDiv.className = 'group-menu-items';
                                    groupMenuDiv.innerHTML = '<ul></ul>';
                                    let groupMenu = groupMenuDiv.firstChild;

                                    if (bagGroup != null) {
                                        let groupDiv = document.createElement('div');
                                        groupDiv.className = g_genericPopupTopLineDivClass;
                                        groupDiv.id = 'popup_amulet_group_bag';
                                        groupDiv.setAttribute('group-name', '当前背包内容');
                                        groupDiv.innerHTML = `<b class="group-menu" style="color:blue;">当前背包内容 [${bagGroup.count()}] ▼</b>`;

                                        let mitem = document.createElement('li');
                                        mitem.className = 'group-menu-item';
                                        mitem.innerHTML = `<a href="#popup_amulet_group_bag">当前背包内容 [${bagGroup.count()}]</a>`;
                                        groupMenu.appendChild(mitem);

                                        g_amuletTypeNames.slice().reverse().forEach((item) => {
                                            let btn = document.createElement('button');
                                            btn.innerText = '清空' + item;
                                            btn.style.float = 'right';
                                            btn.setAttribute('amulet-key', item);
                                            btn.onclick = clearSpecAmulet;
                                            groupDiv.appendChild(btn);
                                        });

                                        function clearSpecAmulet(e) {
                                            genericPopupShowProgressMessage('处理中，请稍候...');
                                            beginClearBag(document.querySelectorAll(bagObjectsQueryString),
                                                          e.target.getAttribute('amulet-key'),
                                                          refreshEquipmentPage,
                                                          showAmuletGroupsPopup);
                                        }

                                        let saveBagGroupBtn = document.createElement('button');
                                        saveBagGroupBtn.innerText = '保存为护符组';
                                        saveBagGroupBtn.style.float = 'right';
                                        saveBagGroupBtn.onclick = (() => {
                                            let groupName = inputAmuletGroupName('');
                                            if (groupName != null) {
                                                beginSaveBagAsGroup(groupName, false);
                                            }
                                        });
                                        groupDiv.appendChild(saveBagGroupBtn);

                                        let groupInfoDiv = document.createElement('div');
                                        groupInfoDiv.innerHTML =
                                            `<hr><ul style="color:#000080;">${bagGroup.formatBuffSummary('<li>', '</li>', '', true)}</ul>
                                             <hr><ul>${bagGroup.formatItems('<li>', '<li style="color:red;">', '</li>', '</li>', '')}</ul>
                                             <hr><ul><li>AMULET ${bagGroup.formatBuffShortMark(' ', ' ', false)} ENDAMULET</li></ul>`;
                                        groupDiv.appendChild(groupInfoDiv);

                                        amuletContainer.appendChild(groupDiv);
                                    }

                                    let li = 0
                                    let groupArray = groups.toArray();
                                    let gl = (groupArray?.length ?? 0);
                                    if (gl > 0) {
                                        groupArray = groupArray.sort((a, b) => a.name < b.name ? -1 : 1);
                                        for (let i = 0; i < gl; i++) {
                                            let err = !groupArray[i].validate(amulets);

                                            let groupDiv = document.createElement('div');
                                            groupDiv.className = g_genericPopupTopLineDivClass;
                                            groupDiv.id = 'popup_amulet_group_' + i;
                                            groupDiv.setAttribute('group-name', groupArray[i].name);
                                            groupDiv.innerHTML =
                                                `<b class="group-menu" style="color:${err ? "red" : "blue"};">` +
                                                `${groupArray[i].name} [${groupArray[i].count()}] ▼</b>`;

                                            let mitem = document.createElement('li');
                                            mitem.className = 'group-menu-item';
                                            mitem.innerHTML =
                                                `<a href="#popup_amulet_group_${i}">${groupArray[i].name} [${groupArray[i].count()}]</a>`;
                                            groupMenu.appendChild(mitem);

                                            let amuletDeleteGroupBtn = document.createElement('button');
                                            amuletDeleteGroupBtn.innerText = '删除';
                                            amuletDeleteGroupBtn.style.float = 'right';
                                            amuletDeleteGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                if (confirm(`删除护符组 "${groupName}" 吗？`)) {
                                                    amuletDeleteGroup(groupName);
                                                    showAmuletGroupsPopup();
                                                }
                                            });
                                            groupDiv.appendChild(amuletDeleteGroupBtn);

                                            let amuletModifyGroupBtn = document.createElement('button');
                                            amuletModifyGroupBtn.innerText = '编辑';
                                            amuletModifyGroupBtn.style.float = 'right';
                                            amuletModifyGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                modifyAmuletGroup(groupName);
                                            });
                                            groupDiv.appendChild(amuletModifyGroupBtn);

                                            let importAmuletGroupBtn = document.createElement('button');
                                            importAmuletGroupBtn.innerText = '导入';
                                            importAmuletGroupBtn.style.float = 'right';
                                            importAmuletGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                let persistenceString = prompt('请输入护符组编码（一般由工具软件自动生成，表现形式为一组由逗号分隔的数字序列）');
                                                if (persistenceString != null) {
                                                    let group = new AmuletGroup(`${groupName}${AMULET_STORAGE_GROUPNAME_SEPARATOR}${persistenceString}`);
                                                    if (group.isValid()) {
                                                        let groups = amuletLoadGroups();
                                                        if (groups.add(group)) {
                                                            amuletSaveGroups(groups);
                                                            showAmuletGroupsPopup();
                                                        }
                                                        else {
                                                            alert('保存失败！');
                                                        }
                                                    }
                                                    else {
                                                        alert('输入的护符组编码无效，请检查！');
                                                    }
                                                }
                                            });
                                            groupDiv.appendChild(importAmuletGroupBtn);

                                            let renameAmuletGroupBtn = document.createElement('button');
                                            renameAmuletGroupBtn.innerText = '更名';
                                            renameAmuletGroupBtn.style.float = 'right';
                                            renameAmuletGroupBtn.onclick = ((e) => {
                                                let oldName = e.target.parentNode.getAttribute('group-name');
                                                let groupName = inputAmuletGroupName(oldName);
                                                if (groupName != null && groupName != oldName) {
                                                    let groups = amuletLoadGroups();
                                                    if (!groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                                        if (groups.rename(oldName, groupName)) {
                                                            amuletSaveGroups(groups);
                                                            showAmuletGroupsPopup();
                                                        }
                                                        else {
                                                            alert('更名失败！');
                                                        }
                                                    }
                                                }
                                            });
                                            groupDiv.appendChild(renameAmuletGroupBtn);

                                            let updateAmuletGroupBtn = document.createElement('button');
                                            updateAmuletGroupBtn.innerText = '更新';
                                            updateAmuletGroupBtn.style.float = 'right';
                                            updateAmuletGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                if (confirm(`用当前背包内容替换 "${groupName}" 护符组预定内容吗？`)) {
                                                    beginSaveBagAsGroup(groupName, true);
                                                }
                                            });
                                            groupDiv.appendChild(updateAmuletGroupBtn);

                                            let unamuletLoadGroupBtn = document.createElement('button');
                                            unamuletLoadGroupBtn.innerText = '入仓';
                                            unamuletLoadGroupBtn.style.float = 'right';
                                            unamuletLoadGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                genericPopupShowProgressMessage('卸载中，请稍候...');
                                                beginUnloadAmuletGroupFromBag(
                                                    document.querySelectorAll(bagObjectsQueryString),
                                                    groupName, refreshEquipmentPage, showAmuletGroupsPopup);
                                            });
                                            groupDiv.appendChild(unamuletLoadGroupBtn);

                                            let amuletLoadGroupBtn = document.createElement('button');
                                            amuletLoadGroupBtn.innerText = '装备';
                                            amuletLoadGroupBtn.style.float = 'right';
                                            amuletLoadGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                genericPopupShowProgressMessage('加载中，请稍候...');
                                                beginLoadAmuletGroupFromStore(
                                                    document.querySelectorAll(storeObjectsQueryString),
                                                    groupName, refreshEquipmentPage, showAmuletGroupsPopup);
                                            });
                                            groupDiv.appendChild(amuletLoadGroupBtn);

                                            let groupInfoDiv = document.createElement('div');
                                            groupInfoDiv.innerHTML =
                                                `<hr><ul style="color:#000080;">${groupArray[i].formatBuffSummary('<li>', '</li>', '', true)}</ul>
                                                 <hr><ul>${groupArray[i].formatItems('<li>', '<li style="color:red;">', '</li>', '</li>', '')}</ul>
                                                 <hr><ul><li>AMULET ${groupArray[i].formatBuffShortMark(' ', ' ', false)} ENDAMULET</li></ul>`;
                                            groupDiv.appendChild(groupInfoDiv);

                                            amuletContainer.appendChild(groupDiv);
                                            li += groupArray[i].getDisplayStringLineCount();
                                        }
                                    }

                                    genericPopupQuerySelectorAll('.group-menu')?.forEach((e) => {
                                        e.appendChild(groupMenuDiv.cloneNode(true));
                                    });

                                    if (bagGroup != null) {
                                        gl++;
                                        li += bagGroup.getDisplayStringLineCount();
                                    }

                                    genericPopupAddButton('新建护符组', 0, modifyAmuletGroup, true);
                                    genericPopupAddButton(
                                        '导入新护符组',
                                        0,
                                        (() => {
                                            let groupName = inputAmuletGroupName('');
                                            if (groupName != null) {
                                                let persistenceString = prompt('请输入护符组编码（一般由工具软件自动生成，表现形式为一组由逗号分隔的数字序列）');
                                                if (persistenceString != null) {
                                                    let group = new AmuletGroup(`${groupName}${AMULET_STORAGE_GROUPNAME_SEPARATOR}${persistenceString}`);
                                                    if (group.isValid()) {
                                                        let groups = amuletLoadGroups();
                                                        if (!groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                                            if (groups.add(group)) {
                                                                amuletSaveGroups(groups);
                                                                showAmuletGroupsPopup();
                                                            }
                                                            else {
                                                                alert('保存失败！');
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        alert('输入的护符组编码无效，请检查！');
                                                    }
                                                }
                                            }
                                        }),
                                        true);
                                    genericPopupAddButton(
                                        '清空背包',
                                        0,
                                        (() => {
                                            genericPopupShowProgressMessage('处理中，请稍候...');
                                            beginClearBag(document.querySelectorAll(bagObjectsQueryString),
                                                          null, refreshEquipmentPage, showAmuletGroupsPopup);
                                        }),
                                        true);
                                    genericPopupAddCloseButton(80);

                                    genericPopupSetContentSize(Math.min((li * 20) + (gl * 160) + 60, Math.max(window.innerHeight - 200, 400)),
                                                               Math.min(1000, Math.max(window.innerWidth - 100, 600)),
                                                               true);
                                    genericPopupShowModal(true);

                                    if (window.getSelection) {
                                        window.getSelection().removeAllRanges();
                                    }
                                    else if (document.getSelection) {
                                        document.getSelection().removeAllRanges();
                                    }
                                }

                                function modifyAmuletGroup(groupName) {
                                    function divHeightAdjustment(div) {
                                        div.style.height = (div.parentNode.offsetHeight - div.offsetTop - 3) + 'px';
                                    }

                                    function refreshAmuletList() {
                                        amuletList.innerHTML = '';
                                        amulets.forEach((am) => {
                                            if (amuletFilter == -1 || am.type == amuletFilter) {
                                                let item = document.createElement('li');
                                                item.setAttribute('original-id', am.id);
                                                item.innerText = am.formatBuffText();
                                                amuletList.appendChild(item);
                                            }
                                        });
                                    }

                                    function refreshGroupAmuletSummary() {
                                        let count = group.count();
                                        if (count > 0) {
                                            groupSummary.innerHTML = group.formatBuffSummary('<li>', '</li>', '', true);
                                            groupSummary.style.display = 'block';
                                        }
                                        else {
                                            groupSummary.style.display = 'none';
                                            groupSummary.innerHTML = '';
                                        }
                                        divHeightAdjustment(groupAmuletList.parentNode);
                                        amuletCount.innerText = count;
                                    }

                                    function refreshGroupAmuletList() {
                                        groupAmuletList.innerHTML = '';
                                        group.items.forEach((am) => {
                                            if (am.id >= 0) {
                                                let item = document.createElement('li');
                                                item.setAttribute('original-id', am.id);
                                                item.innerText = am.formatBuffText();
                                                groupAmuletList.appendChild(item);
                                            }
                                        });
                                    }

                                    function refreshGroupAmuletDiv() {
                                        refreshGroupAmuletSummary();
                                        refreshGroupAmuletList();
                                    }

                                    function moveAmuletItem(e) {
                                        let li = e.target;
                                        if (li.tagName == 'LI') {
                                            let from = li.parentNode;
                                            let id = li.getAttribute('original-id');
                                            from.removeChild(li);
                                            if (from == amuletList) {
                                                let i = searchElement(amulets, id, (a, b) => a - b.id);
                                                let am = amulets[i];
                                                amulets.splice(i, 1);
                                                groupAmuletList.insertBefore(li, groupAmuletList.children.item(group.add(am)));
                                            }
                                            else {
                                                let am = group.removeId(id);
                                                insertElement(amulets, am, (a, b) => a.id - b.id);
                                                if (amuletFilter == -1 || am.type == amuletFilter) {
                                                    for (var item = amuletList.firstChild;
                                                         parseInt(item?.getAttribute('original-id')) <= am.id;
                                                         item = item.nextSibling);
                                                    amuletList.insertBefore(li, item);
                                                }
                                            }
                                            refreshGroupAmuletSummary();
                                            groupChanged = true;
                                        }
                                    }

                                    let bag = [];
                                    let store = [];
                                    if (queryAmulets(bag, store) == 0) {
                                        alert('获取护符信息失败，请检查！');
                                        return;
                                    }
                                    let amulets = bag.concat(store).sort((a, b) => a.compareTo(b));
                                    amulets.forEach((item, index) => { item.id = index; });

                                    let displayName = groupName;
                                    if (!amuletIsValidGroupName(displayName)) {
                                        displayName = '(未命名)';
                                        groupName = null;
                                    }
                                    else if (displayName.length > 20) {
                                        displayName = displayName.slice(0, 19) + '...';
                                    }

                                    let groupChanged = false;
                                    let group = amuletLoadGroup(groupName);
                                    if (!group?.isValid()) {
                                        group = new AmuletGroup(null);
                                        group.name = '(未命名)';
                                        groupName = null;
                                    }
                                    else {
                                        group.validate(amulets);
                                        while (group.removeId(-1) != null) {
                                            groupChanged = true;
                                        }
                                        group.items.forEach((am) => {
                                            let i = searchElement(amulets, am, (a, b) => a.id - b.id);
                                            if (i >= 0) {
                                                amulets.splice(i, 1);
                                            }
                                        });
                                    }

                                    genericPopupClose(true);

                                    let fixedContent =
                                        '<div style="padding:20px 0px 5px 0px;font-size:18px;color:blue;"><b>' +
                                        '<span>双击护符条目以进行添加或移除操作</span><span style="float:right;">共 ' +
                                        '<span id="amulet_count" style="color:#800020;">0</span> 个护符</span></b></div>';
                                    let mainContent =
                                        '<style> ul > li:hover { background-color:#bbddff; } </style>' +
                                        '<div style="display:block;height:100%;width:100%;">' +
                                          '<div style="position:relative;display:block;float:left;height:96%;width:49%;' +
                                               'margin-top:10px;border:1px solid #000000;">' +
                                            '<div id="amulet_filter" style="display:inline-block;width:100%;padding:5px;color:#0000c0;' +
                                                 'font-size:14px;text-align:center;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">' +
                                            '</div>' +
                                            '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                                              '<ul id="amulet_list" style="cursor:pointer;"></ul>' +
                                            '</div>' +
                                          '</div>' +
                                          '<div style="position:relative;display:block;float:right;height:96%;width:49%;' +
                                               'margin-top:10px;border:1px solid #000000;">' +
                                            '<div id="group_summary" style="display:block;width:100%;padding:10px 5px;' +
                                                 'border-bottom:2px groove #d0d0d0;color:#000080;margin-bottom:10px;"></div>' +
                                            '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                                              '<ul id="group_amulet_list" style="cursor:pointer;"></ul>' +
                                            '</div>' +
                                          '</div>' +
                                        '</div>';

                                    genericPopupSetFixedContent(fixedContent);
                                    genericPopupSetContent('编辑护符组 - ' + displayName, mainContent);

                                    let amuletCount = genericPopupQuerySelector('#amulet_count');
                                    let amuletFilter = -1;
                                    let amuletFilterList = genericPopupQuerySelector('#amulet_filter');
                                    let amuletList = genericPopupQuerySelector('#amulet_list');
                                    let groupSummary = genericPopupQuerySelector('#group_summary');
                                    let groupAmuletList = genericPopupQuerySelector('#group_amulet_list');

                                    function addAmuletFilterItem(text, amuletTypesId, checked) {
                                        let check = document.createElement('input');
                                        check.type = 'radio';
                                        check.name = 'amulet-filter';
                                        check.id = 'amulet-type-' + amuletTypesId.toString();
                                        check.setAttribute('amulet-type-id', amuletTypesId);
                                        check.checked = checked;
                                        if (amuletFilterList.firstChild != null) {
                                            check.style.marginLeft = '30px';
                                        }
                                        check.onchange = ((e) => {
                                            if (e.target.checked) {
                                                amuletFilter = e.target.getAttribute('amulet-type-id');
                                                refreshAmuletList();
                                            }
                                        });

                                        let label = document.createElement('label');
                                        label.innerText = text;
                                        label.setAttribute('for', check.id);
                                        label.style.cursor = 'pointer';
                                        label.style.marginLeft = '5px';

                                        amuletFilterList.appendChild(check);
                                        amuletFilterList.appendChild(label);
                                    }

                                    for (let amuletType of g_amuletTypeNames) {
                                        addAmuletFilterItem(amuletType,
                                                            g_amuletTypeIds[amuletType.slice(0, g_amuletTypeIds.end - g_amuletTypeIds.start)],
                                                            false);
                                    }
                                    addAmuletFilterItem('全部', -1, true);

                                    refreshAmuletList();
                                    refreshGroupAmuletDiv();

                                    amuletList.ondblclick = groupAmuletList.ondblclick = moveAmuletItem;

                                    genericPopupAddButton(
                                        '清空护符组',
                                        0,
                                        (() => {
                                            if (group.count() > 0) {
                                                group.items.forEach((am) => { insertElement(amulets, am, (a, b) => a.id - b.id); });
                                                group.clear();

                                                refreshAmuletList();
                                                refreshGroupAmuletDiv();

                                                groupChanged = true;
                                            }
                                        }),
                                        true);

                                    if (amuletIsValidGroupName(groupName)) {
                                        genericPopupAddButton(
                                            '另存为',
                                            80,
                                            (() => {
                                                if (!group.isValid()) {
                                                    alert('护符组内容存在错误，请检查！');
                                                    return;
                                                }

                                                let gn = inputAmuletGroupName(groupName);
                                                if (gn == null) {
                                                    return;
                                                }

                                                let groups = amuletLoadGroups();
                                                if (groups.contains(gn) && !confirm(`护符组 "${gn}" 已存在，要覆盖吗？`)) {
                                                    return;
                                                }

                                                group.name = gn;
                                                if (groups.add(group)) {
                                                    amuletSaveGroups(groups);
                                                    showAmuletGroupsPopup();
                                                }
                                                else {
                                                    alert('保存失败！');
                                                }
                                            }),
                                            false);
                                    }

                                    genericPopupAddButton(
                                        '确认',
                                        80,
                                        (() => {
                                            if (!groupChanged && group.isValid()) {
                                                showAmuletGroupsPopup();
                                                return;
                                            }
                                            else if (!group.isValid()) {
                                                alert('护符组内容存在错误，请检查！');
                                                return;
                                            }

                                            let groups = amuletLoadGroups();
                                            if (!amuletIsValidGroupName(groupName)) {
                                                let gn = inputAmuletGroupName(displayName);
                                                if (gn == null || (groups.contains(gn) && !confirm(`护符组 "${gn}" 已存在，要覆盖吗？`))) {
                                                    return;
                                                }
                                                group.name = gn;
                                            }

                                            if (groups.add(group)) {
                                                amuletSaveGroups(groups);
                                                showAmuletGroupsPopup();
                                            }
                                            else {
                                                alert('保存失败！');
                                            }
                                        }),
                                        false);

                                    genericPopupAddButton(
                                        '取消',
                                        80,
                                        (() => {
                                            if (!groupChanged || confirm('护符组内容已修改，不保存吗？')) {
                                                showAmuletGroupsPopup();
                                            }
                                        }),
                                        false);

                                    genericPopupSetContentSize(Math.min(800, Math.max(window.innerHeight - 200, 500)),
                                                               Math.min(1000, Math.max(window.innerWidth - 100, 600)),
                                                               false);
                                    genericPopupShowModal(false);

                                    divHeightAdjustment(amuletList.parentNode);
                                    divHeightAdjustment(groupAmuletList.parentNode);
                                }

                                function createAmuletGroup(groupName, amulets, update) {
                                    let group = amuletCreateGroupFromArray(groupName, amulets);
                                    if (group != null) {
                                        let groups = amuletLoadGroups();
                                        if (update || !groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                            if (groups.add(group)) {
                                                amuletSaveGroups(groups);
                                                genericPopupClose(true);
                                                return true;
                                            }
                                            else {
                                                alert('保存失败！');
                                            }
                                        }
                                    }
                                    else {
                                        alert('保存异常，请检查！');
                                    }
                                    genericPopupClose(true);
                                    return false;
                                }

                                function formatAmuletsString() {
                                    let bag = [];
                                    let store = [];
                                    let exportLines = [];
                                    if (queryAmulets(bag, store) > 0) {
                                        let amulets = bag.concat(store).sort((a, b) => a.compareTo(b));
                                        let amuletIndex = 1;
                                        amulets.forEach((am) => {
                                            exportLines.push(`${('00' + amuletIndex).slice(-3)} - ${am.formatShortMark()}`);
                                            amuletIndex++;
                                        });
                                    }
                                    return (exportLines.length > 0 ? exportLines.join('\n') : '');
                                }

                                function exportAmulets() {
                                    genericPopupSetContent(
                                        '护符导出',
                                        `<b><div id="amulet_export_tip" style="color:#0000c0;padding:15px 0px 10px;">
                                         请勿修改任何导出内容，将其保存为纯文本在其它相应工具中使用</div></b>
                                         <div style="height:330px;"><textarea id="amulet_persistence_string" readonly="true"
                                         style="height:100%;width:100%;resize:none;"></textarea></div>`);

                                    genericPopupAddButton(
                                        '复制导出内容至剪贴板',
                                        0,
                                        ((e) => {
                                            e.target.disabled = 'disabled';
                                            let tipContainer = genericPopupQuerySelector('#amulet_export_tip');
                                            let tipColor = tipContainer.style.color;
                                            let tipString = tipContainer.innerText;
                                            tipContainer.style.color = '#ff0000';
                                            genericPopupQuerySelector('#amulet_persistence_string').select();
                                            if (document.execCommand('copy')) {
                                                tipContainer.innerText = '导出内容已复制到剪贴板';
                                            }
                                            else {
                                                tipContainer.innerText = '复制失败，这可能是因为浏览器没有剪贴板访问权限，请进行手工复制（CTRL+A, CTRL+C）';
                                            }
                                            setTimeout((() => {
                                                tipContainer.style.color = tipColor;
                                                tipContainer.innerText = tipString;
                                                e.target.disabled = '';
                                            }), 3000);
                                        }),
                                        true);
                                    genericPopupAddCloseButton(80);

                                    genericPopupQuerySelector('#amulet_persistence_string').value = formatAmuletsString();

                                    genericPopupSetContentSize(400, 600, false);
                                    genericPopupShowModal(true);
                                }

                                let amuletButtonsGroupContainer = document.getElementById('amulet_management_btn_group');
                                if (amuletButtonsGroupContainer == null) {
                                    amuletButtonsGroupContainer = document.createElement('div');
                                    amuletButtonsGroupContainer.id = 'amulet_management_btn_group';
                                    amuletButtonsGroupContainer.style.width = '100px';
                                    amuletButtonsGroupContainer.style.float = 'right';
                                    document.getElementById('backpacks').children[0].appendChild(amuletButtonsGroupContainer);

                                    let exportAmuletsBtn = document.createElement('button');
                                    exportAmuletsBtn.innerText = '导出护符';
                                    exportAmuletsBtn.style.width = '100%';
                                    exportAmuletsBtn.style.marginBottom = '1px';
                                    exportAmuletsBtn.onclick = (() => {
                                        exportAmulets();
                                    });
                                    amuletButtonsGroupContainer.appendChild(exportAmuletsBtn);

                                    let beginClearBagBtn = document.createElement('button');
                                    beginClearBagBtn.innerText = '清空背包';
                                    beginClearBagBtn.style.width = '100%';
                                    beginClearBagBtn.style.marginBottom = '1px';
                                    beginClearBagBtn.onclick = (() => {
                                        genericPopupShowProgressMessage('处理中，请稍候...');
                                        beginClearBag(
                                            document.querySelectorAll(bagObjectsQueryString),
                                            null, refreshEquipmentPage, () => { genericPopupClose(true, true); });
                                    });
                                    amuletButtonsGroupContainer.appendChild(beginClearBagBtn);

                                    let amuletSaveGroupBtn = document.createElement('button');
                                    amuletSaveGroupBtn.innerText = '存为护符组';
                                    amuletSaveGroupBtn.style.width = '100%';
                                    amuletSaveGroupBtn.style.marginBottom = '1px';
                                    amuletSaveGroupBtn.onclick = (() => {
                                        let groupName = inputAmuletGroupName('');
                                        if (groupName != null) {
                                            let amulets = [];
                                            if (queryAmulets(amulets, null) == 0) {
                                                alert('保存失败，请检查背包内容！');
                                            }
                                            else if (createAmuletGroup(groupName, amulets, false)) {
                                                alert('保存成功。');
                                            }
                                        }
                                    });
                                    amuletButtonsGroupContainer.appendChild(amuletSaveGroupBtn);

                                    let manageAmuletGroupBtn = document.createElement('button');
                                    manageAmuletGroupBtn.innerText = '管理护符组';
                                    manageAmuletGroupBtn.style.width = '100%';
                                    manageAmuletGroupBtn.style.marginBottom = '1px';
                                    manageAmuletGroupBtn.onclick = (() => {
                                        genericPopupInitialize();
                                        showAmuletGroupsPopup();
                                    });
                                    amuletButtonsGroupContainer.appendChild(manageAmuletGroupBtn);

                                    let clearAmuletGroupBtn = document.createElement('button');
                                    clearAmuletGroupBtn.innerText = '清除护符组';
                                    clearAmuletGroupBtn.style.width = '100%';
                                    clearAmuletGroupBtn.onclick = (() => {
                                        if (confirm('要删除全部已保存的护符组信息吗？')) {
                                            amuletClearGroups();
                                            alert('已删除全部预定义护符组信息。');
                                        }
                                    });
                                    amuletButtonsGroupContainer.appendChild(clearAmuletGroupBtn);

                                    document.getElementById(storeButtonId).onclick = (() => {
                                        if ($(storeQueryString).css('display') == 'none') {
                                            $(storeQueryString).show();
                                        } else {
                                            $(storeQueryString).hide();
                                        }
                                        backupEquipmentDivState({ target : document.getElementById(storeButtonId) });
                                    });
                                }

                                $('#equipmentDiv .btn-equipment .bg-danger.with-padding').css({
                                    'max-width': '200px',
                                    'padding': '5px 5px 5px 5px',
                                    'white-space': 'pre-line',
                                    'word-break': 'break-all'
                                });

                                collapseEquipmentDiv(equipmentExpand, forceEquipDivOperation);
                                changeEquipmentDivStyle(equipmentBG);
                                switchObjectContainerStatus(!equipmentStoreExpand);

                                forceEquipDivOperation = false;
                            }
                        }
                    }, 500);
                }

                const g_genCalcCfgPopupLinkId = 'gen_calc_cfg_popup_link';
                const g_bindingPopupLinkId = 'binding_popup_link';
                const g_cardOnekeyLinkId = 'card_one_key_link';
                const g_bindingSolutionId = 'binding_solution_div';
                const g_bindingListSelectorId = 'binding_list_selector';
                const g_equipOnekeyLinkId = 'equip_one_key_link';

                function switchCardTemporarily(roleId) {
                    let role = g_roleMap.get(roleId);
                    if (role == undefined) {
                        return;
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('正在切换，请稍候...');

                    const upcard_data = getPostData(/upcard\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);
                    const halosave_data = getPostData(/halosave\(\)\{[\s\S]*\}/m, /data: ".*\+savearr\+.*"/).slice(7, -1);

                    let roleInfo = [];
                    let haloInfo = [];
                    beginReadRoleAndHalo(roleInfo, haloInfo, switchToTempCard, null);

                    function switchCardCompletion() {
                        genericPopupClose();
                        window.location.reload();
                    }

                    function switchToTempCard() {
                        if (roleInfo.length == 2 && haloInfo.length == 3) {
                            const infoHTML =
                                  `<div style="display:block;width:100%;color:#0000c0;text-align:center;font-size:20px;padding-top:50px;"><b>
                                   <p></p><span style="width:100%;">当前卡片已经由 [ ${roleInfo[1]} ] 临时切换至 ` +
                                  `[ ${g_roleMap.get(roleId)?.name ?? 'UNKNOW'} ]</span><br><br>
                                   <p></p><span style="width:100%;">请切换至搜刮页面尽快完成搜刮操作</span><br><br>
                                   <p></p><span style="width:100%;">并返回本页面点击“恢复”按钮以恢复之前的卡片和光环设置</span></b></div>`;
                            genericPopupSetContent(`临时装备卡片 [ ${g_roleMap.get(roleId)?.name ?? 'UNKNOW'} ]`, infoHTML);
                            genericPopupSetContentSize(300, 600, false);
                            genericPopupAddButton('恢复', 80, restoreCardAndHalo, false);

                            switchCard(roleId, null, genericPopupShowModal, false);
                        }
                        else {
                            alert('无法读取当前装备卡片和光环信息，卡片未切换！');
                            switchCardCompletion();
                        }
                    }

                    function restoreCardAndHalo() {
                        genericPopupShowProgressMessage('正在恢复，请稍候...');
                        switchCard(roleInfo[0], haloInfo[2], switchCardCompletion, null);
                    }

                    function switchCard(newRoleId, newHaloArray, fnFurtherProcess, fnParams) {
                        let cardData = upcard_data.replace('"+id+"', newRoleId);
                        GM_xmlhttpRequest({
                            method: g_postMethod,
                            url: g_postUrl,
                            headers: g_postHeader,
                            data: cardData,
                            onload: response => {
                                if (response.responseText == 'ok' || response.responseText == '你没有这张卡片或已经装备中') {
                                    if (newHaloArray?.length > 0) {
                                        let haloData = halosave_data.replace('"+savearr+"', newHaloArray.join());
                                        GM_xmlhttpRequest({
                                            method: g_postMethod,
                                            url: g_postUrl,
                                            headers: g_postHeader,
                                            data: haloData,
                                            onload: response => {
                                                if (fnFurtherProcess != null) {
                                                    fnFurtherProcess(fnParams);
                                                }
                                            }
                                        });
                                        return;
                                    }
                                }
                                else {
                                    alert('无法完成卡片和光环切换，请尝试手动进行！');
                                    switchCardCompletion();
                                    return;
                                }
                                if (fnFurtherProcess != null) {
                                    fnFurtherProcess(fnParams);
                                }
                            }
                        });
                    }
                }

                function equipOnekey() {
                    const upcard_data = getPostData(/upcard\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);
                    const halosave_data = getPostData(/halosave\(\)\{[\s\S]*\}/m, /data: ".*\+savearr\+.*"/).slice(7, -1);
                    const puton_data = getPostData(/puton\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);

                    function roleSetupCompletion() {
                        httpRequestClearAll();
                        genericPopupClose();
                        window.location.reload();
                    }

                    function checkForRoleSetupCompletion() {
                        if (genericPopupTaskCheckCompletion()) {
                            // delay for the final state can be seen
                            genericPopupTaskSetState(0);
                            genericPopupTaskSetState(1);
                            genericPopupTaskSetState(2);
                            genericPopupTaskSetState(3);
                            setTimeout(roleSetupCompletion, 200);
                        }
                    }

                    function amuletLoadCompletion() {
                        genericPopupTaskComplete(3);
                        checkForRoleSetupCompletion();
                    }

                    let scheduledObjects = { equips : [] , amulets : [] , exchanged : [] };
                    function beginBagRestore() {
                        if (scheduledObjects.equips.length == 0 && scheduledObjects.amulets.length == 0) {
                            amuletLoadCompletion();
                        }
                        else {
                            beginRestoreObjects(null, scheduledObjects.amulets, scheduledObjects.equips, amuletLoadCompletion, null);
                        }
                    }

                    function beginUnloadExchangedEquipments(bag) {
                        beginMoveObjects(findEquipmentIds(bag, scheduledObjects.exchanged),
                                         g_object_move_path.bag2store,
                                         beginBagRestore,
                                         null);
                    }

                    function beginAmuletLoadGroups() {
                        if (amuletGroupsToLoad?.length > 0) {
                            genericPopupTaskSetState(2);
                            genericPopupTaskSetState(3, `- 加载护符...（${amuletGroupsToLoad?.length}）`);
                            beginLoadAmuletGroupFromStore(null, amuletGroupsToLoad.shift(), beginAmuletLoadGroups, null);
                        }
                        else {
                            amuletLoadCompletion();
                        }
                    }

                    function beginLoadAmulets() {
                        genericPopupTaskSetState(2);
                        genericPopupTaskComplete(2, equipmentOperationError > 0);

                        if (amuletGroupsToLoad != null) {
                            genericPopupTaskSetState(2, '- 清理装备...');
                            beginClearBag(null, null, beginAmuletLoadGroups, null);
                        }
                        else {
                            genericPopupTaskSetState(2, '- 恢复背包...');
                            if (scheduledObjects.exchanged.length > 0) {
                                beginReadObjects(originalBag = [], null, beginUnloadExchangedEquipments, originalBag);
                            }
                            else {
                                beginBagRestore();
                            }
                        }
                    }

                    let equipmentOperationError = 0;
                    let putonRequestsCount;
                    function putonEquipments(objects, fnFurtherProcess, fnParams) {
                        if (objects?.length > 0) {
                            let ids = [];
                            while (ids.length < g_maxConcurrentRequests && objects.length > 0) {
                                ids.push(objects.pop());
                            }
                            if ((putonRequestsCount = ids.length) > 0) {
                                while (ids.length > 0) {
                                    let request = GM_xmlhttpRequest({
                                        method: g_postMethod,
                                        url: g_postUrl,
                                        headers: g_postHeader,
                                        data: puton_data.replace('"+id+"', ids.shift()),
                                        onload: response => {
                                            if (response.responseText != 'ok') {
                                                equipmentOperationError++;
                                                console.log(response.responseText);
                                            }
                                            if (--putonRequestsCount == 0) {
                                                putonEquipments(objects, fnFurtherProcess, fnParams);
                                            }
                                        }
                                    });
                                    httpRequestRegister(request);
                                }
                                return;
                            }
                        }
                        if (fnFurtherProcess != null) {
                            fnFurtherProcess(fnParams);
                        }
                    }

                    let originalBag, originalStore;
                    let currentEquipments = equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString));
                    function beginPutonEquipments(bindInfo) {
                        genericPopupTaskSetState(2, '- 检查装备...');
                        let equipsToPuton = [];
                        for (let i = 0; i < 4; i++) {
                            let equipInfo = bindInfo[i].split(',');
                            equipInfo.push(-1);
                            if (equipmentInfoComparer(equipInfo, currentEquipments[i]) != 0) {
                                equipsToPuton.push(equipInfo);
                            }
                        }
                        if (equipsToPuton.length == 0) {
                            beginLoadAmulets();
                        }
                        else if (!(originalBag?.length > 0)) {
                            beginReadObjects(originalBag = [], originalStore = [], scheduleEquipments, null);
                        }

                        function scheduleEquipments() {
                            function rescheduleEquipments() {
                                genericPopupTaskSetState(2, '- 检查装备...');
                                beginReadObjects(originalBag = [], originalStore = [], scheduleEquipments, null);
                            }

                            let eqs = equipsToPuton.slice();
                            let eqsInBag = findEquipmentIds(originalBag, eqs);
                            if (eqsInBag.length == equipsToPuton.length) {
                                genericPopupTaskSetState(2, `- 穿戴装备...（${eqsInBag.length}）`);
                                putonEquipments(eqsInBag, beginLoadAmulets, null);
                                return;
                            }

                            for (let i = eqs.length - 1; i >= 0; i--) {
                                scheduledObjects.exchanged.push(currentEquipments[g_equipMap.get(eqs[i][0]).type]);
                            }

                            let eqsInStore = findEquipmentIds(originalStore, eqs);
                            if (eqs.length > 0) {
                                console.log(eqs);
                                alert('有装备不存在，请重新检查绑定！');
                                window.location.reload();
                                return;
                            }

                            let ids = [];
                            let freeCellsNeeded = eqsInStore.length;
                            for (let i = originalBag.length - 1; i >= 0; i--) {
                                if (objectIsEmptyNode(originalBag[i])) {
                                    if (--freeCellsNeeded == 0) {
                                        genericPopupTaskSetState(2, `- 取出仓库...（${eqsInStore.length}）`);
                                        beginMoveObjects(eqsInStore, g_object_move_path.store2bag, rescheduleEquipments, null);
                                        return;
                                    }
                                }
                                else {
                                    let e = equipmentInfoParseNode(originalBag[i])
                                    if (e != null) {
                                        scheduledObjects.equips.push(e);
                                        ids.unshift(parseInt(e[7]));
                                    }
                                    else if ((e = (new Amulet()).fromNode(originalBag[i]))?.isValid()) {
                                        scheduledObjects.amulets.push(e);
                                        ids.unshift(e.id);
                                    }
                                    else {
                                        continue;
                                    }
                                    if (--freeCellsNeeded == 0) {
                                        genericPopupTaskSetState(2, `- 调整空间...（${ids.length}）`);
                                        beginMoveObjects(ids, g_object_move_path.bag2store, rescheduleEquipments, null);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    function beginSetupHalo(bindInfo) {
                        let halo = [];
                        if (bindInfo.length > 4) {
                            bindInfo[4].split(',').forEach((item) => {
                                let hid = g_haloMap.get(item.trim())?.id;
                                if (hid > 0) {
                                    halo.push(hid);
                                }
                            });
                            if ((halo = halo.join(','))?.length > 0) {
                                genericPopupTaskSetState(1, '- 设置光环...');
                                let request = GM_xmlhttpRequest({
                                    method: g_postMethod,
                                    url: g_postUrl,
                                    headers: g_postHeader,
                                    data: halosave_data.replace('"+savearr+"', halo),
                                    onload: response => {
                                        genericPopupTaskSetState(1);
                                        genericPopupTaskComplete(1, response.responseText != 'ok');
                                        checkForRoleSetupCompletion();
                                    }
                                });
                                httpRequestRegister(request);
                                return;
                            }
                        }
                        genericPopupTaskComplete(1);
                        checkForRoleSetupCompletion();
                    }

                    let amuletGroupsToLoad = null;
                    function beginRoleSetup(bindInfo) {
                        beginSetupHalo(bindInfo);

                        if (bindInfo[5]?.length > 0) {
                            amuletGroupsToLoad = bindInfo[5].split(',');
                            genericPopupTaskSetState(2, '- 清理背包...');
                            beginClearBag(null, null, beginPutonEquipments, bindInfo);
                        }
                        else {
                            beginPutonEquipments(bindInfo);
                        }
                    }

                    let bindingElements = document.getElementById(g_bindingListSelectorId)?.value?.split(BINDING_NAME_SEPARATOR);
                    if (bindingElements?.length == 2) {
                        function equipOnekeyQuit() {
                            httpRequestAbortAll();
                            roleSetupCompletion();
                        }

                        genericPopupInitialize();
                        genericPopupTaskListPopupSetup('切换中...', 300, [ '卡片', '光环', '装备', '护符' ], equipOnekeyQuit);
                        genericPopupShowModal(false);

                        let roleId = g_roleMap.get(bindingElements[0].trim()).id;
                        let bindInfo = bindingElements[1].trim().split(BINDING_ELEMENT_SEPARATOR)
                        if (roleId == g_roleMap.get(document.getElementById('carding')
                                                           ?.querySelector('div.text-info.fyg_f24.fyg_lh60')
                                                           ?.children[0]?.innerText)?.id) {
                            genericPopupTaskComplete(0);
                            beginRoleSetup(bindInfo);
                        }
                        else {
                            genericPopupTaskSetState(0, '- 装备中...');
                            GM_xmlhttpRequest({
                                method: g_postMethod,
                                url: g_postUrl,
                                headers: g_postHeader,
                                data: upcard_data.replace('"+id+"', roleId),
                                onload: response => {
                                    genericPopupTaskSetState(0);
                                    if (response.responseText == 'ok' || response.responseText == '你没有这张卡片或已经装备中') {
                                        genericPopupTaskComplete(0);
                                        beginRoleSetup(bindInfo);
                                    }
                                    else {
                                        genericPopupTaskComplete(0, true);
                                        alert('卡片装备失败！');
                                        equipOnekeyQuit();
                                    }
                                }
                            });
                        }
                    }
                    else {
                        alert('绑定信息读取失败，无法装备！');
                    }
                }

                const BINDING_NAME_DEFAULT = '(未命名)';
                const BINDING_SEPARATOR = ';';
                const BINDING_NAME_SEPARATOR = '=';
                const BINDING_ELEMENT_SEPARATOR = '|';

                function showBindingPopup() {
                    let role = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                    let cardInfos = document.querySelectorAll('#backpacks .icon.icon-angle-down.text-primary');
                    let roleLv = cardInfos[0].innerText.match(/\d+/)[0];
                    let roleQl = cardInfos[1].innerText.match(/\d+/)[0];
                    let roleHs = cardInfos[2].innerText.match(/\d+/)[0];
                    let roleGv = (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0');
                    let rolePt = [];
                    for (let i = 1; i <= 6; i++) {
                        rolePt.push(document.getElementById('sjj' + i).innerText);
                    }
                    if (role == undefined || roleLv == undefined || roleQl == undefined || roleHs == undefined) {
                        alert('读取卡片信息失败，无法执行绑定操作！');
                        return;
                    }

                    let bind_info = null;
                    let udata = loadUserConfigData();
                    if (udata.dataBind[role.id] != null) {
                        bind_info = udata.dataBind[role.id];
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('读取中，请稍候...');

                    const highlightBackgroundColor = '#80c0f0';
                    const fixedContent =
                        '<style> .binding-list  { position:relative; width:100%; display:inline-block; } ' +
                                '.binding-names { display:none;' +
                                                 'position:absolute;' +
                                                 'word-break:keep-all;' +
                                                 'white-space:nowrap;' +
                                                 'margin:0 auto;' +
                                                 'width:100%;' +
                                                 'z-index:999;' +
                                                 'background-color:white;' +
                                                 'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                 'padding:10px 20px; } '+
                                '.binding-name  { cursor:pointer; } ' +
                                '.binding-list:hover .binding-names { display:block; } ' +
                                '.binding-list:focus-within .binding-names { display:block; } ' +
                                '.binding-names .binding-name:hover { background-color:#bbddff; } </style>' +
                        `<div style="width:100%;color:#0000ff;padding:20px 10px 5px 0px;"><b>绑定方案名称` +
                        `（不超过31个字符，请仅使用大、小写英文字母、数字、连字符、下划线及中文字符）：` +
                        `<span id="${g_genericPopupInformationTipsId}" style="float:right;color:red;"></span></b></div>
                         <div style="width:100%;padding:0px 10px 20px 0px;"><div class="binding-list">
                         <input type="text" id="binding_name" style="display:inline-block;width:100%;" maxlength="31" />
                         <div class="binding-names" id="binding_list"><ul></ul></div></div></div>`;
                    const mainContent =
                        `<style> .equipment_label    { display:inline-block; width:15%; }
                                 .equipment_selector { display:inline-block; width:84%; color:#145ccd; float:right; }
                                  ul > li { cursor:pointer; } </style>
                         <div class="${g_genericPopupTopLineDivClass}" id="role_export_div" style="display:none;">
                         <div style="height:200px;">
                              <textarea id="role_export_string" readonly="true" style="height:100%;width:100%;resize:none;"></textarea></div>
                         <div style="padding:10px 0px 20px 0px;">
                              <button type="button" style="float:right;margin-left:1px;" id="hide_export_div">隐藏</button>
                              <button type="button" style="float:right;" id="copy_export_string">复制导出内容至剪贴板</button></div></div>
                         <div class="${g_genericPopupTopLineDivClass}">
                             <span class="equipment_label">武器装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">手臂装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">身体装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">头部装备：</span><select class="equipment_selector"></select><br></div>
                         <div class="${g_genericPopupTopLineDivClass}" style="display:flex;position:relative;"><div id="halo_selector"></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id="amulet_selector" style="display:block;"><div></div></div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent(`${role.name} - ${roleLv} 级`, mainContent);

                    let eq_selectors = genericPopupQuerySelectorAll('select.equipment_selector');
                    let asyncOperations = 3;
                    let haloMax = 0;
                    let haloGroupItemMax = 0;

                    let bag, store;
                    beginReadObjects(
                        bag = [],
                        store = [],
                        () => {
                            let equipment = equipmentNodesToInfoArray(bag);
                            equipmentNodesToInfoArray(store, equipment);
                            equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString), equipment);

                            equipment.sort((e1, e2) => {
                                if (e1[0] != e2[0]) {
                                    return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                                }
                                return -equipmentInfoComparer(e1, e2);
                            });

                            equipment.forEach((item) => {
                                let eqMeta = g_equipMap.get(item[0]);
                                let lv = equipmentGetLevel(item);
                                let op = document.createElement('option');
                                op.style.backgroundColor = g_equipmentLevelBGColor[lv];
                                op.innerText =
                                    `${eqMeta.alias} Lv.${item[1]} - ${item[2]}% ${item[3]}% ` +
                                    `${item[4]}% ${item[5]}% ${item[6] == 1 ? ' - [ 神秘 ]' : ''}`;
                                op.title =
                                    `Lv.${item[1]} - ${item[6] == 1 ? '神秘' : ''}${g_equipmentLevelName[lv]}装备\n` +
                                    `${formatEquipmentAttributes(item, '\n')}`;
                                op.value = item.slice(0, -1).join(',');
                                eq_selectors[eqMeta.type].appendChild(op);
                            });

                            eq_selectors.forEach((eqs) => {
                                eqs.onchange = equipSelectionChange;
                                equipSelectionChange({ target : eqs });
                            });
                            function equipSelectionChange(e) {
                                for (var op = e.target.firstChild; op != null && op.value != e.target.value; op = op.nextSibling);
                                e.target.title = (op?.title ?? '');
                                e.target.style.backgroundColor = (op?.style.backgroundColor ?? 'white');
                            }
                            asyncOperations--;
                        },
                        null);

                    let currentHalo;
                    beginReadRoleAndHalo(
                        null,
                        currentHalo = [],
                        () => {
                            haloMax = currentHalo[0];
                            let haloInfo =
                                `天赋点：<span style="color:#0000c0;"><span id="halo_points">0</span> / ${haloMax}</span>，
                                 技能位：<span style="color:#0000c0;"><span id="halo_slots">0</span> / ${roleHs}</span>`;
                            let haloSelector = genericPopupQuerySelector('#halo_selector');
                            haloSelector.innerHTML =
                                `<style> .halo_group { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                         div > a { display:inline-block; width:90px; } </style>
                                 <div>${haloInfo}</div>
                                 <p></p>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group" style="border-right:1px solid grey;"></div>`;
                            let haloGroups = haloSelector.querySelectorAll('.halo_group');
                            let group = -1;
                            let points = -1;
                            g_halos.forEach((item) => {
                                if (item.points != points) {
                                    points = item.points;
                                    group++;
                                }
                                let a = document.createElement('a');
                                a.href = '#';
                                a.className = 'halo_item';
                                a.innerText = item.name + ' ' + item.points;
                                haloGroups[group].appendChild(a);
                                if (haloGroups[group].children.length > haloGroupItemMax) {
                                    haloGroupItemMax = haloGroups[group].children.length;
                                }
                            });

                            function selector_halo() {
                                let hp = parseInt(haloPoints.innerText);
                                let hs = parseInt(haloSlots.innerText);
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                    hp += parseInt($(this).text().split(' ')[1]);
                                    hs++;
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                    hp -= parseInt($(this).text().split(' ')[1]);
                                    hs--;
                                }
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }

                            haloPoints = genericPopupQuerySelector('#halo_points');
                            haloSlots = genericPopupQuerySelector('#halo_slots');
                            $('.halo_item').each(function(i, e) {
                                $(e).on('click', selector_halo);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });
                            asyncOperations--;
                        },
                        null);

                    let wishpool;
                    beginReadWishpool(
                        wishpool = [],
                        null,
                        () => {
                            wishpool = wishpool.slice(-7);
                            asyncOperations--;
                        },
                        null);

                    function collectBindingInfo() {
                        let halo = [];
                        let sum = 0;
                        $('.halo_item').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                let ee = e.innerText.split(' ');
                                sum += parseInt(ee[1]);
                                halo.push($(e).attr('original-item'));
                            }
                        });
                        let h = parseInt(haloMax);
                        if (sum <= h && halo.length <= parseInt(roleHs)) {
                            let roleInfo = [ role.shortMark, roleLv, roleHs, roleQl ];
                            if (role.hasG) {
                                roleInfo.splice(1, 0, 'G=' + roleGv);
                            }

                            let amuletArray = [];
                            $('.amulet_item').each(function(i, e) {
                                if ($(e).attr('item-selected') == 1) {
                                    amuletArray[parseInt(e.lastChild.innerText) - 1] = ($(e).attr('original-item'));
                                }
                            });

                            let eqs = [];
                            eq_selectors.forEach((eq) => { eqs.push(eq.value); });

                            return [ roleInfo, wishpool, amuletArray, rolePt, eqs, halo ];
                        }
                        return null;
                    }

                    function generateExportString() {
                        let info = collectBindingInfo();
                        if (info?.length > 0) {
                            let exp = [ info[0].join(' '), 'WISH ' + info[1].join(' ') ];

                            let ag = new AmuletGroup();
                            ag.name = 'export-temp';
                            info[2].forEach((gn) => {
                                ag.merge(amuletGroups.get(gn));
                            });
                            if (ag.isValid()) {
                                exp.push(`AMULET ${ag.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                            }

                            exp.push(info[3].join(' '));

                            info[4].forEach((eq) => {
                                exp.push(eq.replaceAll(',', ' '));
                            });

                            let halo = [ info[5].length ];
                            info[5].forEach((h) => {
                                halo.push(g_haloMap.get(h).shortMark);
                            });
                            exp.push(halo.join(' '));

                            return exp.join('\n') + '\n';
                        }
                        else {
                            alert('有装备未选或光环天赋选择错误！');
                        }
                        return null;
                    }

                    function unbindAll() {
                        if (confirm('这将清除本卡片全部绑定方案，继续吗？')) {
                            let udata = loadUserConfigData();
                            if (udata.dataBind[role.id] != null) {
                                delete udata.dataBind[role.id];
                            }
                            saveUserConfigData(udata);
                            bindingName.value = BINDING_NAME_DEFAULT;
                            bindingList.innerHTML = '';
                            refreshBindingSelector(role.id);
                            genericPopupShowInformationTips('解除全部绑定成功', 5000);
                        }
                    };

                    function deleteBinding() {
                        if (validateBindingName()) {
                            bindings = [];
                            let found = false;
                            $('.binding-name').each((index, item) => {
                                if (item.innerText == bindingName.value) {
                                    bindingList.removeChild(item);
                                    found = true;
                                }
                                else {
                                    bindings.push(`${item.innerText}${BINDING_NAME_SEPARATOR}${item.getAttribute('original-item')}`);
                                }
                            });
                            if (found) {
                                let bn = bindingName.value;
                                let bi = null;
                                let udata = loadUserConfigData();
                                if (bindings.length > 0) {
                                    udata.dataBind[role.id] = bindings.join(BINDING_SEPARATOR);
                                    bindingName.value = bindingList.children[0].innerText;
                                    bi = bindingList.children[0].getAttribute('original-item');
                                }
                                else if(udata.dataBind[role.id] != null) {
                                    delete udata.dataBind[role.id];
                                    bindingName.value = BINDING_NAME_DEFAULT;
                                }
                                saveUserConfigData(udata);
                                refreshBindingSelector(role.id);
                                representBinding(bi);
                                genericPopupShowInformationTips(bn + '：解绑成功', 5000);
                            }
                            else {
                                alert('方案名称未找到！');
                            }
                        }
                    };

                    function saveBinding() {
                        if (validateBindingName()) {
                            let info = collectBindingInfo();
                            if (info?.length > 0) {
                                let bind_info = [ info[4][0], info[4][1], info[4][2], info[4][3],
                                                  info[5].join(','), info[2].join(',') ].join(BINDING_ELEMENT_SEPARATOR);
                                let newBinding = true;
                                bindings = [];
                                $('.binding-name').each((index, item) => {
                                    if (item.innerText == bindingName.value) {
                                        item.setAttribute('original-item', bind_info);
                                        newBinding = false;
                                    }
                                    bindings.push(`${item.innerText}${BINDING_NAME_SEPARATOR}${item.getAttribute('original-item')}`);
                                });
                                if (newBinding) {
                                    let li = document.createElement('li');
                                    li.className = 'binding-name';
                                    li.innerText = bindingName.value;
                                    li.setAttribute('original-item', bind_info);
                                    for (var li0 = bindingList.firstChild; li0?.innerText < li.innerText; li0 = li0.nextSibling);
                                    bindingList.insertBefore(li, li0);
                                    bindings.push(`${bindingName.value}${BINDING_NAME_SEPARATOR}${bind_info}`);
                                }

                                let udata = loadUserConfigData();
                                udata.dataBind[role.id] = bindings.join(BINDING_SEPARATOR);
                                saveUserConfigData(udata);
                                refreshBindingSelector(role.id);
                                genericPopupShowInformationTips(bindingName.value + '：绑定成功', 5000);
                            }
                            else {
                                alert('有装备未选或光环天赋选择错误！');
                            }
                        }
                    }

                    function isValidBindingName(bindingName) {
                        return (bindingName?.length > 0 && bindingName.length < 32 && bindingName.search(USER_STORAGE_RESERVED_SEPARATORS) < 0);
                    }

                    function validateBindingName() {
                        let valid = isValidBindingName(bindingName.value);
                        genericPopupShowInformationTips(valid ? null : '方案名称不符合规则，请检查');
                        return valid;
                    }

                    function validateBinding() {
                        if (validateBindingName) {
                            let ol = bindingList.children.length;
                            for (let i = 0; i < ol; i++) {
                                if (bindingName.value == bindingList.children[i].innerText) {
                                    representBinding(bindingList.children[i].getAttribute('original-item'));
                                    break;
                                }
                            }
                        }
                    }

                    function representBinding(items) {
                        if (items?.length > 0) {
                            let elements = items.split(BINDING_ELEMENT_SEPARATOR);
                            if (elements.length > 3) {
                                let v = elements.slice(0, 4);
                                eq_selectors.forEach((eqs) => {
                                    for (let op of eqs.childNodes) {
                                        if (v.indexOf(op.value) >= 0) {
                                            eqs.value = op.value;
                                            break;
                                        }
                                    }
                                    eqs.onchange({ target : eqs });
                                });
                            }
                            if (elements.length > 4) {
                                let hp = 0;
                                let hs = 0;
                                let v = elements[4].split(',');
                                $('.halo_item').each((index, item) => {
                                    let s = (v.indexOf($(item).attr('original-item')) < 0 ? 0 : 1);
                                    $(item).attr('item-selected', s);
                                    $(item).css('background-color', s == 0 ? g_genericPopupBackgroundColor : highlightBackgroundColor);
                                    hp += (s == 0 ? 0 : parseInt($(item).text().split(' ')[1]));
                                    hs += s;
                                });
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }
                            selectedAmuletGroupCount = 0;
                            if (elements.length > 5 && amuletCount != null) {
                                let ac = 0;
                                let v = elements[5].split(',');
                                $('.amulet_item').each((index, item) => {
                                    let j = v.indexOf($(item).attr('original-item'));
                                    let s = (j < 0 ? 0 : 1);
                                    $(item).attr('item-selected', s);
                                    $(item).css('background-color', s == 0 ? g_genericPopupBackgroundColor : highlightBackgroundColor);
                                    item.lastChild.innerText = (j < 0 ? '' : j + 1);
                                    selectedAmuletGroupCount += s;
                                    ac += (s == 0 ? 0 : parseInt($(item).text().match(/\[(\d+)\]/)[1]));
                                });
                                amuletCount.innerText = ac;
                            }
                        }
                    }

                    function selector_amulet() {
                        let ac = parseInt(amuletCount.innerText);
                        let tc = parseInt($(this).text().match(/\[(\d+)\]/)[1]);
                        if ($(this).attr('item-selected') != 1) {
                            $(this).attr('item-selected', 1);
                            $(this).css('background-color', highlightBackgroundColor);
                            this.lastChild.innerText = ++selectedAmuletGroupCount;
                            ac += tc;
                        }
                        else {
                            $(this).attr('item-selected', 0);
                            $(this).css('background-color', g_genericPopupBackgroundColor);
                            let i = parseInt(this.lastChild.innerText);
                            this.lastChild.innerText = '';
                            ac -= tc;
                            if (i < selectedAmuletGroupCount) {
                                $('.amulet_item').each((index, item) => {
                                    var j;
                                    if ($(item).attr('item-selected') == 1 && (j = parseInt(item.lastChild.innerText)) > i) {
                                        item.lastChild.innerText = j - 1;
                                    }
                                });
                            }
                            selectedAmuletGroupCount--;
                        }
                        amuletCount.innerText = ac;
                    }

                    let bindingList = genericPopupQuerySelector('#binding_list').firstChild;
                    let bindingName = genericPopupQuerySelector('#binding_name');
                    let haloPoints = null;
                    let haloSlots = null;
                    let amuletContainer = genericPopupQuerySelector('#amulet_selector').firstChild;
                    let amuletCount = null;
                    let amuletGroups = amuletLoadGroups();
                    let selectedAmuletGroupCount = 0;

                    let amuletGroupCount = (amuletGroups?.count() ?? 0);
                    if (amuletGroupCount > 0) {
                        amuletContainer.innerHTML =
                            '护符组：已选定 <span id="amulet_count">0</span> 个护符' +
                            '<span style="float:right;margin-right:5px;">加载顺序</span><p /><ul></ul>';
                        amuletCount = genericPopupQuerySelector('#amulet_count');
                        amuletCount.style.color = '#0000c0';
                        let amuletArray = amuletGroups.toArray().sort((a, b) => a.name < b.name ? -1 : 1);
                        let amuletGroupContainer = amuletContainer.lastChild;
                        for (let i = 0; i < amuletGroupCount; i++) {
                            let li = document.createElement('li');
                            li.className = 'amulet_item';
                            li.setAttribute('original-item', amuletArray[i].name);
                            li.title = amuletArray[i].formatBuffSummary('', '', '\n', false);
                            li.innerHTML =
                                `<a href="#">${amuletArray[i].name} [${amuletArray[i].count()}]</a>` +
                                `<span style="color:#0000c0;width:40;float:right;margin-right:5px;"></span>`;
                            li.onclick = selector_amulet;
                            amuletGroupContainer.appendChild(li);
                        }
                    }
                    else {
                        amuletContainer.innerHTML =
                            '<ul><li>未能读取护符组定义信息，这可能是因为您没有预先完成护符组定义。</li><p />' +
                                '<li>将护符与角色卡片进行绑定并不是必须的，但如果您希望使用此功能，' +
                                    '则必须先定义护符组然后才能将它们与角色卡片进行绑定。</li><p />' +
                                '<li>要定义护符组，您需要前往 [ <b style="color:#0000c0;">我的角色 → 武器装备</b> ] 页面，' +
                                    '并在其中使用将背包内容 [ <b style="color:#0000c0;">存为护符组</b> ] 功能，' +
                                    '或在 [ <b style="color:#0000c0;">管理护符组</b> ] 相应功能中进行定义。</li></ul>';
                    }

                    let bindings = null;
                    if (bind_info != null) {
                        bindings = bind_info.split(BINDING_SEPARATOR).sort((a, b) => {
                            a = a.split(BINDING_NAME_SEPARATOR);
                            b = b.split(BINDING_NAME_SEPARATOR);
                            a = a.length > 1 ? a[0] : BINDING_NAME_DEFAULT;
                            b = b.length > 1 ? b[0] : BINDING_NAME_DEFAULT;
                            return a < b ? -1 : 1;
                        });
                    }
                    else {
                        bindings = [];
                    }

                    bindings.forEach((item) => {
                        let elements = item.split(BINDING_NAME_SEPARATOR);
                        let binding = elements[elements.length - 1].split(BINDING_ELEMENT_SEPARATOR);
                        if (binding.length > 5) {
                            let amuletGroupNames = binding[5].split(',');
                            let ag = '';
                            let sp = '';
                            let al = amuletGroupNames.length;
                            for (let i = 0; i < al; i++) {
                                if (amuletGroups.contains(amuletGroupNames[i])) {
                                    ag += (sp + amuletGroupNames[i]);
                                    sp = ',';
                                }
                            }
                            binding[5] = ag;
                            elements[elements.length - 1] = binding.join(BINDING_ELEMENT_SEPARATOR);
                        }

                        let op = document.createElement('li');
                        op.className = 'binding-name';
                        op.innerText = (elements.length > 1 ? elements[0] : BINDING_NAME_DEFAULT);
                        op.setAttribute('original-item', elements[elements.length - 1]);
                        bindingList.appendChild(op);
                    });

                    let timer = setInterval(() => {
                        if (asyncOperations == 0) {
                            clearInterval(timer);
                            httpRequestClearAll();

                            if (bindingList.children.length > 0) {
                                bindingName.value = bindingList.children[0].innerText;
                                representBinding(bindingList.children[0].getAttribute('original-item'));
                            }
                            else {
                                bindingName.value = BINDING_NAME_DEFAULT;
                            }

                            bindingName.oninput = validateBindingName;
                            bindingName.onchange = validateBinding;
                            bindingList.onclick = ((e) => {
                                let li = e.target;
                                if (li.tagName == 'LI') {
                                    bindingName.value = li.innerText;
                                    representBinding(li.getAttribute('original-item'));
                                }
                            });

                            genericPopupQuerySelector('#copy_export_string').onclick = (() => {
                                genericPopupQuerySelector('#role_export_string').select();
                                if (document.execCommand('copy')) {
                                    genericPopupShowInformationTips('导出内容已复制到剪贴板', 5000);
                                }
                                else {
                                    genericPopupShowInformationTips('复制失败，请进行手工复制（CTRL+A, CTRL+C）');
                                }
                            });

                            genericPopupQuerySelector('#hide_export_div').onclick = (() => {
                                genericPopupQuerySelector('#role_export_div').style.display = 'none';
                            });

                            genericPopupSetContentSize(Math.min((haloGroupItemMax + amuletGroupCount) * 20
                                                                                  + (amuletGroupCount > 0 ? 60 : 160) + 260,
                                                                window.innerHeight - 200),
                                                       600, true);

                            genericPopupAddButton('解除绑定', 0, deleteBinding, true);
                            genericPopupAddButton('全部解绑', 0, unbindAll, true);
                            genericPopupAddButton('绑定', 80, saveBinding, false);
                            genericPopupAddButton(
                                '导出计算器',
                                0,
                                () => {
                                    let string = generateExportString();
                                    if (string?.length > 0) {
                                        genericPopupQuerySelector('#role_export_string').value = string;
                                        genericPopupQuerySelector('#role_export_div').style.display = 'block';
                                    }
                                },
                                false);
                            genericPopupAddCloseButton(80);

                            genericPopupCloseProgressMessage();
                            genericPopupShowModal(true);
                        }
                    }, 200);
                };

                function showCalcConfigGenPopup() {
                    let role = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                    let cardInfos = document.querySelectorAll('#backpacks .icon.icon-angle-down.text-primary');
                    let roleLv = cardInfos[0].innerText.match(/\d+/)[0];
                    let roleQl = cardInfos[1].innerText.match(/\d+/)[0];
                    let roleHs = cardInfos[2].innerText.match(/\d+/)[0];
                    let roleGv = (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0');
                    let roleTotalPt = Math.trunc((roleLv * 3 + 6) * (1 + roleQl / 100));
                    let rolePt = [];
                    for (let i = 1; i <= 6; i++) {
                        rolePt.push(document.getElementById('sjj' + i).innerText);
                    }
                    if (role == undefined || roleLv == undefined || roleQl == undefined || roleHs == undefined) {
                        alert('读取卡片信息失败，无法执行配置生成操作！');
                        return;
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('读取中，请稍候...');

                    const monsters = [
                        {
                            name : '铁皮木人',
                            shortMark : 'MU2'
                        },
                        {
                            name : '迅捷魔蛛',
                            shortMark : 'ZHU2'
                        },
                        {
                            name : '魔灯之灵',
                            shortMark : 'DENG2'
                        },
                        {
                            name : '食铁兽',
                            shortMark : 'SHOU2'
                        },
                        {
                            name : '六眼飞鱼',
                            shortMark : 'YU2'
                        },
                        {
                            name : '晶刺豪猪',
                            shortMark : 'HAO2'
                        }
                    ];

                    let fixedContent =
                        '<div style="padding:20px 10px 10px 0px;color:blue;font-size:16px;"><b><ul>' +
                          '<li>初次使用本功能时请先仔细阅读咕咕镇计算器相关资料及此后各部分设置说明以便对其中涉及到的概念及元素建立基本认识</li>' +
                          '<li>此功能只生成指定角色的PVE配置，若需供其他角色使用请在相应角色页面使用此功能或自行正确修改配置</li>' +
                          '<li>此功能只生成计算器可用的基础PVE配置，若需使用计算器提供的其它高级功能请自行正确修改配置</li>' +
                          '<li>此功能并未进行完整的数据合法性检查，并不保证生成的配置100%正确，所以请仔细阅读说明并正确使用各项设置</li>' +
                          `<li id="${g_genericPopupInformationTipsId}" style="color:red;">` +
                              '保存模板可保存当前设置，每次保存均会覆盖前一次保存的设置，保存模板后再次进入此功能时将自动加载最后一次保存的设置</li></ul></b></div>';
                    const mainStyle =
                          '<style> .group-menu { position:relative;' +
                                                'display:inline-block;' +
                                                'color:blue;' +
                                                'font-size:20px;' +
                                                'cursor:pointer; } ' +
                                  '.group-menu-items { display:none;' +
                                                      'position:absolute;' +
                                                      'font-size:15px;' +
                                                      'word-break:keep-all;' +
                                                      'white-space:nowrap;' +
                                                      'margin:0 auto;' +
                                                      'width:fit-content;' +
                                                      'z-index:999;' +
                                                      'background-color:white;' +
                                                      'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                      'padding:15px 30px; } ' +
                                  '.group-menu-item { } ' +
                                  '.group-menu:hover .group-menu-items { display:block; } ' +
                                  '.group-menu-items .group-menu-item:hover { background-color:#bbddff; } ' +
                              '.section-help-text { font-size:15px; color:navy; } ' +
                              'b > span { color:purple; } ' +
                              'button.btn-group-selection { width:80px; float:right; } ' +
                              'table.mon-list { width:100%; } ' +
                                  'table.mon-list th.mon-name { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-progress { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-level { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-baselevel { width:25%; text-align:left; } ' +
                              'table.role-info { width:100%; } ' +
                                  'table.role-info th.role-item { width:30%; text-align:left; } ' +
                                  'table.role-info th.role-points { width:10%; text-align:left; } ' +
                                  'table.role-info th.role-operation { width:10%; text-align:center; } ' +
                              'table.equip-list { width:100%; } ' +
                                  'table.equip-list th.equip-name { width:36%; text-align:left; } ' +
                                  'table.equip-list th.equip-property { width:16%; text-align:left; } ' +
                              'table.misc-config { width:100%; } ' +
                                  'table.misc-config th { width:20%; text-align:center; } ' +
                                  'table.misc-config td { text-align:center; } ' +
                              'table tr.alt { background-color:' + g_genericPopupBackgroundColorAlt + '; } ' +
                          '</style>';
                    const menuItems =
                          '<div class="group-menu-items"><ul>' +
                              '<li class="group-menu-item"><a href="#mon-div">野怪</a></li>' +
                              '<li class="group-menu-item"><a href="#role-div">角色</a></li>' +
                              '<li class="group-menu-item"><a href="#equips1-div">武器装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips2-div">手臂装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips3-div">身体装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips4-div">头部装备</a></li>' +
                              '<li class="group-menu-item"><a href="#halo-div">光环</a></li>' +
                              '<li class="group-menu-item"><a href="#amulet-div">护符</a></li>' +
                              '<li class="group-menu-item"><a href="#misc-div">其它</a></li><hr>' +
                              '<li class="group-menu-item"><a href="#result-div">生成结果</a></li>' +
                          '</ul></div>';
                    const monTable =
                          '<table class="mon-list"><tr class="alt"><th class="mon-name">名称</th><th class="mon-progress">段位进度（0% - 100%）</th>' +
                             '<th class="mon-level">进度等级</th><th class="mon-baselevel">基础等级（0%进度）</th></tr></table>';
                    const roleTable =
                          '<table class="role-info" id="role-info"><tr class="alt"><th class="role-item">设置</th>' +
                             '<th class="role-points">力量</th><th class="role-points">敏捷</th><th class="role-points">智力</th>' +
                             '<th class="role-points">体魄</th><th class="role-points">精神</th><th class="role-points">意志</th>' +
                             '<th class="role-operation">操作</th></tr><tr>' +
                             '<td>属性点下限（须大于0）<span id ="role-points-summary" style="float:right;margin-right:5px;"></span></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><button type="button" class="role-points-text-reset" style="width:100%;" value="1">重置</td></tr><tr class="alt">' +
                             '<td>属性点上限（0为无限制）</td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><button type="button" class="role-points-text-reset" style="width:100%;" value="0">重置</td>' +
                             '</tr></table>';
                    const equipTable =
                          '<table class="equip-list"><tr class="alt"><th class="equip-name">装备</th><th class="equip-property">属性</th>' +
                             '<th class="equip-property"></th><th class="equip-property"></th><th class="equip-property"></th></tr></table>';
                    const miscTable =
                          '<table class="misc-config"><tr class="alt">' +
                             '<th>计算线程数</th><th>最大组合数</th><th>单组测试次数</th><th>置信区间测试阈值（%）</th><th>输出计算进度</th></tr><tr>' +
                             '<td><input type="text" style="width:90%;" original-item="THREADS" value="4" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="SEEDMAX" value="1000000" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="TESTS" value="1000" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="CITEST" value="1" oninput="value=value.replace(/[^\\d.]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="VERBOSE" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td></tr></table>';
                    const btnGroup =
                          '<button type="button" class="btn-group-selection" select-type="2">反选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="1">全不选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="0">全选</button>';
                    const mainContent =
                        `${mainStyle}
                         <div class="${g_genericPopupTopLineDivClass}" id="mon-div">
                           <b class="group-menu">野怪设置 （选中 <span>${monsters.length}</span>） ▼${menuItems}</b>${btnGroup}<hr>
                             <span class="section-help-text">` +
                             `只有勾选行的野怪信息才会被写入配置，且这些信息与选定角色相关。段位进度和等级必须对应，例如选定卡片当前段位60%进度迅捷魔蛛` +
                             `的等级为200级，则在迅捷魔蛛一行的段位进度栏填60，等级栏填200，程序将自动计算得到0%进度迅捷魔蛛的估计基础等级为167。</span>
                              <hr>${monTable}<hr><b style="display:inline-block;width:100%;text-align:center;">起始进度 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="3" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> %，以 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="2" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> % 进度差或以 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="3" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> 级差为间隔额外生成 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="1" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> 批野怪数据</b><hr>
                              <span class="section-help-text"">此功能可以生成多批阶梯等级的野怪配置，计算器可根据这些信息计算当野怪等级` +
                             `在一定范围内浮动时的近似最优策略。野怪的等级由其基础等级及进度加成共同决定（进度等级=基础等级×（1+（进度÷300））），` +
                             `多批之间的级差可由进度差或绝对级差指定，当进度差和绝对级差同时被指定（均大于0）且需生成多批数据（额外生成大于0）时默认使用` +
                             `进度差进行计算，当进度差和绝对级差同时为0或额外生成为0时将不会生成额外批次数据。需要注意的是（起始进度+（进度差×批次数））` +
                             `允许大于100，因为大于100的进度仍然可以计算得到有效的野怪等级。</span></div>
                         <div class="${g_genericPopupTopLineDivClass}" id="role-div">
                           <b class="group-menu">角色基础设置 （${role.name}，${roleLv}级，${roleQl}%品质，${role.hasG ? `${roleGv}成长值，` : ''}` +
                             `${roleTotalPt}属性点） ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `属性点下限初始值为指定角色当前点数分配方案，直接使用这些值主要用于胜率验证、装备及光环技能选择等情况，全部置1表示由计算器从` +
                             `头开始计算近似最佳点数分配（该行末的重置按钮将属性点下限全部置1）。也可为各点数设置合理的下限值（必须大于0且总和小于等于总` +
                             `可用属性点数）并由计算器分配剩余点数，这一般用于角色升级后可用点数增加、指定加点方案大致方向并进行装备、光环选择等情况，在` +
                             `其它条件相同的情况下，越少的剩余点数将节约越多的计算时间。属性点上限用于指定特定属性点数分配的上限，设为0表示无限制。合理地` +
                             `设置上限可以节约计算时间，典型的应用场景为将某些明确无需加点的属性上限设为1（例如3速角色的敏捷、血量系的精神等，以及通常情况` +
                             `下梦、默仅敏捷、智力、精神为0，其它皆为1，当然特殊加点除外），而将其它设为0（该行末的重置按钮将属性点上限全部置0）。除非上限` +
                             `值设为0（无限制），否则请务必保证相应的下限值不超过上限值，非法设置将导致计算器运行错误。</span><hr>
                              <input type="checkbox" id="role-useWishpool" checked /><label for="role-useWishpool"
                                     style="margin-left:5px;cursor:pointer;">使用许愿池数据</label><hr>${roleTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="equips1-div">
                           <b class="group-menu">武器装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<hr>
                             <span class="section-help-text">` +
                             `某类装备中如果只选中其中一件则意味着固定使用此装备；选中多件表示由计算器从选中的装备中选择一件合适（不保证最优）的装备；` +
                             `不选等同于全选，即由计算器在全部同类装备中进行选择。一般原则是尽可能多地固定使用装备，留给计算器的选择越多意味着计算所花` +
                             `的时间将越长（根据其它设置及硬件算力，可能长至数天）。</span><hr>${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips2-div">
                           <b class="group-menu">手臂装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips3-div">
                           <b class="group-menu">身体装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips4-div">
                           <b class="group-menu">头部装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="halo-div">
                           <b class="group-menu">光环技能 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `在选用的光环技能栏选择基本可以确定使用的的光环技能（例如血量重剑系几乎肯定会带沸血之志而护盾法系及某些反伤系带波澜不惊的` +
                             `可能性非常大），如果设置正确（光环点数未超范围）则计算器只需补齐空闲的技能位，所以这里指定的光环越多则计算所需时间越少。` +
                             `排除的光环用于指定几乎不可能出现在计算结果中的光环（例如护盾系可以排除沸血之志而法系基本可排除破壁之心，在技能位不足的情` +
                             `况下启程系列可以考虑全部排除），计算器在寻找优势方案时不会使用这些光环技能进行尝试，所以在有空闲技能位和光环点数充足的情况` +
                             `下，排除的光环技能越多则所需计算时间越少。选用与排除的技能允许重复，如果发生这种情况将强制选用。</span><hr>
                              <div style="display:flex;position:relative;width:100%;font-size:15px;">
                              <div id="halo_selector"></div></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="amulet-div">
                           <b class="group-menu">护符 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `护符配置可以省略，或由当前背包的内容决定，如果有预先定义的护符组也可以使用护符组的组合。使用第二及第三种方式时需考虑背包容` +
                             `量（包括许愿池的背包加成及时限）。</span><hr><div style="font-size:15px;">
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-none" />
                                  <label for="amulet-config-none" style="cursor:pointer;margin-left:5px;">无</label><br>
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-bag" checked />
                                  <label for="amulet-config-bag" style="cursor:pointer;margin-left:5px;">当前背包内容（悬停查看）</label><br>
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-groups" />
                                  <label for="amulet-config-groups" style="cursor:pointer;margin-left:5px;">护符组（在组名称上悬停查看）</label>
                              <div id="amulet_selector" style="display:block;padding:0px 20px 0px 20px;"></div></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="misc-div">
                           <b class="group-menu">其它 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `除非清楚修改以下配置项将会造成的影响，否则如无特殊需要请保持默认值。</span><ul class="section-help-text">` +
                             `<li>计算线程数：计算所允许使用的最大线程数，较大的值可以提高并行度从而减少计算用时，但超出处理器物理限制将适得其反，` +
                                 `合理的值应小于处理器支持的物理线程数（推荐值：处理器物理线程数-1或-2）</li>` +
                             `<li>最大组合数：如果给定配置所产生的组合数超过此值将会造成精度下降，但过大的值可能会造成内存不足，且过大的组合数需求` +
                                 `通常意味着待定项目过多，计算将异常耗时，请尝试多固定一些装备及光环技能项，多排除一些无用的光环技能项</li>` +
                             `<li>单组测试次数：特定的点数分配、装备、光环等组合与目标战斗过程的模拟次数，较高的值一般会产生可信度较高的结果，但会` +
                                 `消耗较长的计算时间（此设置仅在置信区间测试阈值设为0时生效）</li>` +
                             `<li>置信区间测试阈值：不使用固定的测试次数而以置信区间阈值代替，当测试结果的置信区间达到此值时计算终止，此设置生效` +
                                 `（不为0）时单组测试次数设置将被忽略</li>` +
                             `<li>输出计算进度：1为计算过程中在命令行窗口中显示计算时间、进度等信息，0为无显示</li></ul><hr>${miscTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="result-div">
                           <b class="group-menu">生成配置 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `生成配置文本后一种方式是将其内容复制至计算器目录中的“newkf.in”文件替换其内容并保存（使用文本编辑器），然后运行计算器` +
                             `执行文件（32位系统：newkf.bat或newkf.exe，64位系统：newkf_64.bat或newkf_64.exe）在其中输入anpc（小写）命令并` +
                             `回车然后等待计算完成。另一种使用方式是将生成的配置文本另存为一个ansi编码（重要）的文本文件，名称自定，然后将此文件用` +
                             `鼠标拖放至前述的计算器执行文件上，待程序启动后同样使用anpc命令开始计算。</span><hr><div style="height:200px;">
                              <textarea id="export-result" style="height:100%;width:100%;resize:none;"></textarea></div>
                           <div style="padding:10px 0px 20px 0px;">
                              <button type="button" style="float:right;" id="copy-to-clipboard">复制导出内容至剪贴板</button>
                              <button type="button" style="float:right;" id="save-template-do-export">保存模板并生成配置</button>
                              <button type="button" style="float:right;" id="do-export">生成配置</button></div></div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent('咕咕镇计算器配置生成（PVE）', mainContent);

                    genericPopupQuerySelectorAll('button.btn-group-selection').forEach((btn) => { btn.onclick = batchSelection; });
                    function batchSelection(e) {
                        let selType = parseInt(e.target.getAttribute('select-type'));
                        let selCount = 0;
                        e.target.parentNode.querySelectorAll('input.generic-checkbox').forEach((chk) => {
                            if (chk.checked = (selType == 2 ? !chk.checked : selType == 0)) {
                                selCount++;
                            }
                        });
                        e.target.parentNode.firstElementChild.firstElementChild.innerText = selCount;
                    }

                    let asyncOperations = 3;

                    let equipItemCount = 0;
                    let bag, store;
                    beginReadObjects(
                        bag = [],
                        store = [],
                        () => {
                            let equipment = equipmentNodesToInfoArray(bag);
                            equipmentNodesToInfoArray(store, equipment);
                            equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString), equipment);

                            let eqIndex = 0;
                            let eq_selectors = genericPopupQuerySelectorAll('table.equip-list');
                            equipment.sort((e1, e2) => {
                                if (e1[0] != e2[0]) {
                                    return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                                }
                                return -equipmentInfoComparer(e1, e2);
                            }).forEach((item) => {
                                let eqMeta = g_equipMap.get(item[0]);
                                let lv = equipmentGetLevel(item);
                                let tr = document.createElement('tr');
                                tr.style.backgroundColor = g_equipmentLevelBGColor[lv];
                                tr.innerHTML =
                                    `<td><input type="checkbox" class="generic-checkbox equip-checkbox equip-item" id="equip-${++eqIndex}"
                                                original-item="${item.slice(0, -1).join(' ')}" />
                                         <label for="equip-${eqIndex}" style="margin-left:5px;cursor:pointer;">
                                                ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                                     <td>${formatEquipmentAttributes(item, '</td><td>')}</td>`;
                                eq_selectors[eqMeta.type].appendChild(tr);
                            });
                            equipItemCount = equipment.length;

                            let bagGroup = amuletCreateGroupFromArray('temp', amuletNodesToArray(bag));
                            if (bagGroup.isValid()) {
                                let radio = genericPopupQuerySelector('#amulet-config-bag');
                                radio.setAttribute('original-item', `AMULET ${bagGroup.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                                radio.nextElementSibling.title = radio.title = bagGroup.formatBuffSummary('', '', '\n', false);
                            }
                            asyncOperations--;
                        },
                        null);

                    const highlightBackgroundColor = '#80c0f0';
                    let haloMax = 0;
                    let haloGroupItemMax = 0;
                    let haloPoints = null;
                    let haloSlots = null;
                    let currentHalo;
                    beginReadRoleAndHalo(
                        null,
                        currentHalo = [],
                        () => {
                            haloMax = currentHalo[0];
                            let haloInfo =
                                `天赋点：<span style="color:#0000c0;"><span id="halo_points">0</span> / ${haloMax}</span>，` +
                                `技能位：<span style="color:#0000c0;"><span id="halo_slots">0</span> / ${roleHs}</span>`;
                            let haloSelector = genericPopupQuerySelector('#halo_selector');
                            haloSelector.innerHTML =
                                `<style>
                                    .halo_group { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                    .halo_group_exclude { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                     div > a { display:inline-block; width:90%; } </style>
                                 <div><b style="margin-right:15px;">选用的光环技能：</b>${haloInfo}
                                 <p />
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group" style="border-right:1px solid grey;"></div></div>
                                 <div><b>排除的光环技能：</b>
                                 <p />
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude" style="border-right:1px solid grey;"></div></div>`;
                            let haloGroups = haloSelector.querySelectorAll('.halo_group');
                            let haloExGroups = haloSelector.querySelectorAll('.halo_group_exclude');
                            let group = -1;
                            let points = -1;
                            g_halos.forEach((item) => {
                                if (item.points != points) {
                                    points = item.points;
                                    group++;
                                }
                                let a = document.createElement('a');
                                a.href = '#';
                                a.className = 'halo_item';
                                a.innerText = item.name + ' ' + item.points;
                                haloGroups[group].appendChild(a.cloneNode(true));
                                if (haloGroups[group].children.length > haloGroupItemMax) {
                                    haloGroupItemMax = haloGroups[group].children.length;
                                }
                                a.className = 'halo_item_exclude';
                                haloExGroups[group].appendChild(a);
                            });

                            function selector_halo() {
                                let hp = parseInt(haloPoints.innerText);
                                let hs = parseInt(haloSlots.innerText);
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                    hp += parseInt($(this).text().split(' ')[1]);
                                    hs++;
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                    hp -= parseInt($(this).text().split(' ')[1]);
                                    hs--;
                                }
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }

                            haloPoints = genericPopupQuerySelector('#halo_points');
                            haloSlots = genericPopupQuerySelector('#halo_slots');
                            $('.halo_item').each(function(i, e) {
                                $(e).on('click', selector_halo);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });

                            function selector_halo_exclude() {
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                }
                            }

                            $('.halo_item_exclude').each(function(i, e) {
                                $(e).on('click', selector_halo_exclude);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });
                            asyncOperations--;
                        },
                        null);

                    let wishpool;
                    beginReadWishpool(
                        wishpool = [],
                        null,
                        () => {
                            wishpool = wishpool.slice(-7);
                            asyncOperations--;
                        },
                        null);

                    let mon_selector = genericPopupQuerySelector('table.mon-list');
                    monsters.forEach((e, i) => {
                        let tr = document.createElement('tr');
                        tr.className = 'mon-row' + ((i & 1) == 0 ? '' : ' alt');
                        tr.setAttribute('original-item', e.shortMark);
                        tr.innerHTML =
                            `<td><input type="checkbox" class="generic-checkbox mon-checkbox mon-item" id="mon-item-${i}" checked />
                                 <label for="mon-item-${i}" style="margin-left:5px;cursor:pointer;">${e.name}</label></td>
                             <td><input type="text" class="mon-textbox" style="width:80%;" maxlength="3" value="0"
                                        oninput="value=value.replace(/[^\\d]/g,'');" /> %</td>
                             <td><input type="text" class="mon-textbox" style="width:80%;" value="1"
                                        oninput="value=value.replace(/[^\\d]/g,'');" /></td>
                             <td>1</td>`;
                        mon_selector.appendChild(tr);
                    });
                    mon_selector.querySelectorAll('input.mon-textbox').forEach((e) => { e.onchange = monDataChange; });
                    function monDataChange(e) {
                        let tr = e.target.parentNode.parentNode;
                        let p = parseInt(tr.children[1].firstChild.value);
                        let l = parseInt(tr.children[2].firstChild.value);
                        if (!isNaN(p) && !isNaN(l) && p >= 0 && p <= 100 && l > 0) {
                            tr.children[3].innerText = Math.ceil(l / (1 + (p / 300)));
                        }
                        else {
                            tr.children[3].innerHTML = '<b style="color:red;">输入不合法</b>';
                        }
                    }

                    let roleInfo = genericPopupQuerySelector('#role-info');
                    let rolePtsSum = roleInfo.querySelector('#role-points-summary');
                    let textPts = roleInfo.querySelectorAll('input');
                    for (let i = 0; i < 6; i++) {
                        textPts[i].value = rolePt[i];
                        textPts[i].onchange = rolePtsChanged;
                    }
                    rolePtsChanged();
                    function rolePtsChanged() {
                        let ptsSum = 0;
                        for (let i = 0; i < 6; i++) {
                            let pt = parseInt(textPts[i].value);
                            if (isNaN(pt) || pt < 1) {
                                textPts[i].value = '1';
                                pt = 1;
                            }
                            ptsSum += pt;
                        }
                        rolePtsSum.innerText = `（${ptsSum} / ${roleTotalPt}）`;
                        rolePtsSum.style.color = (ptsSum > roleTotalPt ? 'red' : 'blue');
                    }
                    roleInfo.querySelectorAll('button.role-points-text-reset').forEach((item) => {
                        item.onclick = ((e) => {
                            e.target.parentNode.parentNode.querySelectorAll('input[type="text"]').forEach((item) => {
                                item.value = e.target.value;
                            });
                            if (e.target.value == '1') {
                                rolePtsChanged();
                            }
                        });
                    });

                    let amuletContainer = genericPopupQuerySelector('#amulet_selector');
                    amuletContainer.innerHTML = '已选定 <span id="amulet_count">0</span> 个护符<p /><ul style="cursor:pointer;"></ul>';
                    let amuletCount = genericPopupQuerySelector('#amulet_count');
                    amuletCount.style.color = '#0000c0';
                    let amuletGroups = amuletLoadGroups();
                    let amuletGroupCount = (amuletGroups?.count() ?? 0);
                    if (amuletGroupCount > 0) {
                        let amuletArray = amuletGroups.toArray().sort((a, b) => a.name < b.name ? -1 : 1);
                        let amuletGroupContainer = amuletContainer.lastChild;
                        for (let i = 0; i < amuletGroupCount; i++) {
                            let li = document.createElement('li');
                            li.className = 'amulet_item';
                            li.setAttribute('original-item', amuletArray[i].name);
                            li.title = amuletArray[i].formatBuffSummary('', '', '\n', false);
                            li.innerHTML = `<a href="#">${amuletArray[i].name} [${amuletArray[i].count()}]</a>`;
                            li.onclick = selector_amulet;
                            amuletGroupContainer.appendChild(li);
                        }
                    }
                    function selector_amulet() {
                        let ac = parseInt(amuletCount.innerText);
                        let tc = parseInt($(this).text().match(/\[(\d+)\]/)[1]);
                        if ($(this).attr('item-selected') != 1) {
                            $(this).attr('item-selected', 1);
                            $(this).css('background-color', highlightBackgroundColor);
                            ac += tc;
                        }
                        else {
                            $(this).attr('item-selected', 0);
                            $(this).css('background-color', g_genericPopupBackgroundColor);
                            ac -= tc;
                        }
                        amuletCount.innerText = ac;
                    }

                    function generateTemplate() {
                        let template = {
                            monster : { batchData : [] },
                            role : { useWishpool : true , points : [] },
                            equipment : { selected : [] },
                            halo : { selected : [] , excluded : [] },
                            amulet : { selected : -1 , selectedGroups : [] },
                            miscellaneous : {}
                        };
                        mon_selector.querySelectorAll('.mon-row').forEach((tr) => {
                            let row = tr.children;
                            template.monster[tr.getAttribute('original-item')] = {
                                selected : row[0].firstElementChild.checked,
                                progress : row[1].firstElementChild.value,
                                level : row[2].firstElementChild.value
                            };
                        });
                        genericPopupQuerySelectorAll('#mon-div input.mon-batch-data').forEach((e) => {
                            template.monster.batchData.push(e.value);
                        });

                        template.role.useWishpool = genericPopupQuerySelector('#role-useWishpool').checked;
                        genericPopupQuerySelectorAll('#role-info input').forEach((e, i) => {
                            template.role.points.push(e.value);
                        });

                        genericPopupQuerySelectorAll('table.equip-list input.equip-checkbox.equip-item').forEach((e) => {
                            if (e.checked) {
                                template.equipment.selected.push(e.getAttribute('original-item'));
                            }
                        });

                        genericPopupQuerySelectorAll('#halo_selector a.halo_item').forEach((e) => {
                            if (e.getAttribute('item-selected') == 1) {
                                template.halo.selected.push(e.getAttribute('original-item'));
                            }
                        });
                        genericPopupQuerySelectorAll('#halo_selector a.halo_item_exclude').forEach((e) => {
                            if (e.getAttribute('item-selected') == 1) {
                                template.halo.excluded.push(e.getAttribute('original-item'));
                            }
                        });

                        let amchk = genericPopupQuerySelectorAll('#amulet-div input.amulet-config');
                        for(var amStyle = (amchk?.length ?? 0) - 1; amStyle >= 0 && !amchk[amStyle].checked; amStyle--);
                        template.amulet.selected = amStyle;
                        genericPopupQuerySelectorAll('#amulet_selector .amulet_item').forEach((e) => {
                            if (e.getAttribute('item-selected') == 1) {
                                template.amulet.selectedGroups.push(e.getAttribute('original-item'));
                            }
                        });

                        genericPopupQuerySelectorAll('#misc-div table.misc-config input').forEach((e) => {
                            template.miscellaneous[e.getAttribute('original-item')] = e.value;
                        });

                        return template;
                    }

                    function applyTemplate(template) {
                        function countGenericCheckbox(div) {
                            let selsum = 0;
                            genericPopupQuerySelectorAll(`${div} input.generic-checkbox`).forEach((e) => {
                                if (e.checked) {
                                    selsum++;
                                }
                            });
                            genericPopupQuerySelector(`${div} b span`).innerText = selsum;
                        }

                        mon_selector.querySelectorAll('.mon-row').forEach((tr) => {
                            let mon = template.monster[tr.getAttribute('original-item')];
                            if (mon != undefined) {
                                let row = tr.children;
                                row[0].firstElementChild.checked = mon.selected;
                                row[1].firstElementChild.value = mon.progress;
                                row[2].firstElementChild.value = mon.level;
                                monDataChange({ target : row[1].firstElementChild });
                            }
                        });
                        genericPopupQuerySelectorAll('#mon-div input.mon-batch-data').forEach((e, i) => {
                            e.value = template.monster.batchData[i];
                        });
                        countGenericCheckbox('#mon-div');

                        genericPopupQuerySelector('#role-useWishpool').checked = template.role.useWishpool;
                        genericPopupQuerySelectorAll('#role-info input').forEach((e, i) => {
                            e.value = template.role.points[i];
                        });
                        rolePtsChanged();

                        let eqs = template.equipment.selected.slice();
                        genericPopupQuerySelectorAll('table.equip-list input.equip-checkbox.equip-item').forEach((e) => {
                            let i = eqs.indexOf(e.getAttribute('original-item'));
                            if (e.checked = (i >= 0)) {
                                eqs.splice(i, 1);
                            }
                        });
                        countGenericCheckbox('#equips1-div');
                        countGenericCheckbox('#equips2-div');
                        countGenericCheckbox('#equips3-div');
                        countGenericCheckbox('#equips4-div');

                        let hp = 0;
                        let hs = 0;
                        genericPopupQuerySelectorAll('#halo_selector a.halo_item').forEach((e) => {
                            if (template.halo.selected.indexOf(e.getAttribute('original-item')) >= 0) {
                                e.setAttribute('item-selected', 1);
                                e.style.backgroundColor = highlightBackgroundColor;
                                hp += parseInt(e.innerText.split(' ')[1]);
                                hs++;
                            }
                            else {
                                e.setAttribute('item-selected', 0);
                                e.style.backgroundColor = g_genericPopupBackgroundColor;
                            }
                        });
                        haloPoints.innerText = hp;
                        haloSlots.innerText = hs;
                        haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                        haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');

                        genericPopupQuerySelectorAll('#halo_selector a.halo_item_exclude').forEach((e) => {
                            if (template.halo.excluded.indexOf(e.getAttribute('original-item')) >= 0) {
                                e.setAttribute('item-selected', 1);
                                e.style.backgroundColor = highlightBackgroundColor;
                            }
                            else {
                                e.setAttribute('item-selected', 0);
                                e.style.backgroundColor = g_genericPopupBackgroundColor;
                            }
                        });

                        genericPopupQuerySelectorAll('#amulet-div input.amulet-config').forEach((e, i) => {
                            e.checked = (template.amulet.selected == i);
                        });
                        let ac = 0;
                        genericPopupQuerySelectorAll('#amulet_selector .amulet_item').forEach((e) => {
                            if (template.amulet.selectedGroups.indexOf(e.getAttribute('original-item')) >= 0) {
                                e.setAttribute('item-selected', 1);
                                e.style.backgroundColor = highlightBackgroundColor;
                                ac += parseInt(e.innerHTML.match(/\[(\d+)\]/)[1]);
                            }
                            else {
                                e.setAttribute('item-selected', 0);
                                e.style.backgroundColor = g_genericPopupBackgroundColor;
                            }
                        });
                        amuletCount.innerText = ac;

                        genericPopupQuerySelectorAll('#misc-div table.misc-config input').forEach((e) => {
                            e.value = template.miscellaneous[e.getAttribute('original-item')];
                        });
                    }

                    function collectConfigData() {
                        let cfg = [ haloMax, '', `${role.shortMark}${role.hasG ? ' G=' + roleGv : ''} ${roleLv} ${roleHs} ${roleQl}` ];
                        if (genericPopupQuerySelector('#role-useWishpool').checked) {
                            cfg.push('WISH ' + wishpool.join(' '));
                        }

                        let amchk = genericPopupQuerySelectorAll('#amulet-div input.amulet-config');
                        if (amchk[1].checked) {
                            let am = amchk[1].getAttribute('original-item');
                            if (am?.length > 0) {
                                cfg.push(am);
                            }
                        }
                        else if (amchk[2].checked) {
                            let ag = new AmuletGroup();
                            ag.name = 'temp';
                            $('.amulet_item').each(function(i, e) {
                                if ($(e).attr('item-selected') == 1) {
                                    ag.merge(amuletGroups.get($(e).attr('original-item')));
                                }
                            });
                            if (ag.isValid()) {
                                cfg.push(`AMULET ${ag.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                            }
                        }

                        let pts = [];
                        let ptsMax = [ 'MAXATTR' ];
                        genericPopupQuerySelectorAll('#role-info input').forEach((e, i) => {
                            (i < 6 ? pts : ptsMax).push(e.value);
                        });
                        cfg.push(pts.join(' '));

                        let eq = [ [], [], [], [] ];
                        genericPopupQuerySelectorAll('table.equip-list').forEach((t, ti) => {
                            let equ = t.querySelectorAll('input.equip-checkbox.equip-item');
                            let equnsel = [];
                            equ.forEach((e) => {
                                let eqstr = e.getAttribute('original-item');
                                if (e.checked) {
                                    eq[ti].push(eqstr);
                                }
                                else if (eq[ti].length == 0) {
                                    equnsel.push(eqstr);
                                }
                            });
                            if (eq[ti].length == 0) {
                                eq[ti] = equnsel;
                            }
                        });
                        let eqsel = [];
                        eq.forEach((e) => {
                            if (e.length == 1) {
                                cfg.push(e[0]);
                            }
                            else {
                                cfg.push('NONE');
                                eqsel.push(e);
                            }
                        });

                        let halo = [];
                        $('.halo_item').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                halo.push(g_haloMap.get($(e).attr('original-item')).shortMark);
                            }
                        });
                        cfg.push(halo.length > 0 ? halo.length + ' ' + halo.join(' ') : '0');
                        cfg.push('');

                        if (eqsel.length > 0) {
                            cfg.push('GEAR\n    ' + eqsel.flat().join('\n    ') + '\nENDGEAR');
                            cfg.push('');
                        }

                        let monText = genericPopupQuerySelectorAll('#mon-div input.mon-batch-data');
                        let startProg = parseInt(monText[0].value);
                        let progStep = parseInt(monText[1].value);
                        let lvlstep = parseInt(monText[2].value);
                        let batCount = parseInt(monText[3].value);
                        let mon = [];
                        mon_selector.querySelectorAll('input.mon-checkbox.mon-item').forEach((e) => {
                            if (e.checked) {
                                let tr = e.parentNode.parentNode;
                                let baseLvl = parseInt(tr.children[3].innerText);
                                if (!isNaN(baseLvl)) {
                                    mon.push({ mon : tr.getAttribute('original-item'), level : baseLvl });
                                }
                            }
                        });
                        if (mon.length > 0) {
                            cfg.push('NPC');
                            const sp = '        ';
                            mon.forEach((e) => {
                                let bl = Math.trunc(e.level * (1 + startProg / 300));
                                cfg.push('    ' + (e.mon + sp).substring(0, 8) + (bl + sp).substring(0, 8) + '0');
                                if (batCount > 0 && progStep == 0 && lvlstep > 0) {
                                    e.level = bl;
                                }
                            });
                            while (batCount > 0) {
                                cfg.push('');
                                if (progStep > 0) {
                                    startProg += progStep;
                                    mon.forEach((e) => {
                                        cfg.push('    ' + (e.mon + sp).substring(0, 8) +
                                                 (Math.trunc(e.level * (1 + startProg / 300)) + sp).substring(0, 8) + '0');
                                    });
                                }
                                else if (lvlstep > 0) {
                                    mon.forEach((e) => {
                                        cfg.push('    ' + (e.mon + sp).substring(0, 8) +
                                                 ((e.level += lvlstep) + sp).substring(0, 8) + '0');
                                    });
                                }
                                else {
                                    cfg.pop();
                                    break;
                                }
                                batCount--;
                            }
                            cfg.push('ENDNPC');
                            cfg.push('');
                        }

                        genericPopupQuerySelectorAll('#misc-div table.misc-config input').forEach((e) => {
                            cfg.push(e.getAttribute('original-item') + ' ' + e.value);
                        });
                        cfg.push('REDUCERATE 3 10');
                        cfg.push('PCWEIGHT 1 1');
                        cfg.push('DEFENDER 0');
                        cfg.push('');

                        cfg.push(ptsMax.join(' '));
                        halo = [];
                        $('.halo_item_exclude').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                halo.push(g_haloMap.get($(e).attr('original-item')).shortMark);
                            }
                        });
                        if (halo.length > 0) {
                            cfg.push('AURAFILTER ' + halo.join('_'));
                        }

                        return cfg;
                    }

                    let timer = setInterval(() => {
                        if (asyncOperations == 0) {
                            clearInterval(timer);
                            httpRequestClearAll();

                            let udata = loadUserConfigData();
                            let template = udata.calculatorTemplatePVE?.[role.id];

                            function loadTemplate(hideTips) {
                                if (template != undefined) {
                                    applyTemplate(template);

                                    btnLoadTemplate.disabled = '';
                                    btnDeleteTemplate.disabled = '';
                                }
                                else {
                                    btnLoadTemplate.disabled = 'disabled';
                                    btnDeleteTemplate.disabled = 'disabled';
                                }
                                if (hideTips != true) {
                                    genericPopupShowInformationTips(template != undefined ? '模板已加载' : '模板加载失败');
                                }
                            }

                            function saveTemplate() {
                                udata.calculatorTemplatePVE ??= {};
                                udata.calculatorTemplatePVE[role.id] = template = generateTemplate();
                                saveUserConfigData(udata);

                                btnLoadTemplate.disabled = '';
                                btnDeleteTemplate.disabled = '';
                                genericPopupShowInformationTips('模板已保存');
                            }

                            function deleteTemplate() {
                                delete udata.calculatorTemplatePVE[role.id];
                                saveUserConfigData(udata);

                                template = undefined;
                                btnLoadTemplate.disabled = 'disabled';
                                btnDeleteTemplate.disabled = 'disabled';
                                genericPopupShowInformationTips('模板已删除');
                            }

                            genericPopupQuerySelectorAll('input.generic-checkbox').forEach((e) => { e.onchange = genericCheckboxStateChange; });
                            function genericCheckboxStateChange(e) {
                                let countSpan = e.target.parentNode.parentNode.parentNode.parentNode.firstElementChild.firstElementChild;
                                countSpan.innerText = parseInt(countSpan.innerText) + (e.target.checked ? 1 : -1);
                            }

                            genericPopupQuerySelector('#copy-to-clipboard').onclick = (() => {
                                genericPopupQuerySelector('#export-result').select();
                                if (document.execCommand('copy')) {
                                    genericPopupShowInformationTips('导出内容已复制到剪贴板');
                                }
                                else {
                                    genericPopupShowInformationTips('复制失败，请进行手工复制（CTRL+A, CTRL+C）');
                                }
                            });

                            genericPopupQuerySelector('#do-export').onclick =
                                genericPopupQuerySelector('#save-template-do-export').onclick = (
                                (e) => {
                                    let textbox = genericPopupQuerySelector('#export-result');
                                    textbox.value = '';
                                    let string = collectConfigData().join('\n') + '\n';
                                    if (string?.length > 0) {
                                        textbox.value = string;
                                        if (e.target.id.startsWith('save-template')) {
                                            saveTemplate();
                                        }
                                    }
                                });

                            genericPopupSetContentSize(Math.min(4000, Math.max(window.innerHeight - 400, 400)),
                                                       Math.min(1000, Math.max(window.innerWidth - 200, 600)),
                                                       true);

                            genericPopupAddButton('保存模板', 0, saveTemplate, true);
                            let btnLoadTemplate = genericPopupAddButton('加载模板', 0, loadTemplate, true);
                            let btnDeleteTemplate = genericPopupAddButton('删除模板', 0, deleteTemplate, true);
                            genericPopupAddCloseButton(80);

                            loadTemplate(true);

                            genericPopupCloseProgressMessage();
                            genericPopupShowModal(true);
                        }
                    }, 200);
                }

                function refreshBindingSelector(roleId) {
                    let bindingsolutionDiv = document.getElementById(g_bindingSolutionId);
                    let bindingList = document.getElementById(g_bindingListSelectorId);

                    let bindings = null;
                    let bind_info = loadUserConfigData().dataBind[roleId];
                    if (bind_info != null) {
                        bindings = bind_info.split(BINDING_SEPARATOR).sort((a, b) => {
                            a = a.split(BINDING_NAME_SEPARATOR);
                            b = b.split(BINDING_NAME_SEPARATOR);
                            a = a.length > 1 ? a[0] : BINDING_NAME_DEFAULT;
                            b = b.length > 1 ? b[0] : BINDING_NAME_DEFAULT;
                            return a < b ? -1 : 1;
                        });
                    }
                    bindingList.innerHTML = '';
                    if (bindings?.length > 0) {
                        bindings.forEach((item) => {
                            let elements = item.split(BINDING_NAME_SEPARATOR);
                            let op = document.createElement('option');
                            op.value = roleId + BINDING_NAME_SEPARATOR + elements[elements.length - 1];
                            op.innerText = (elements.length > 1 ? elements[0] : BINDING_NAME_DEFAULT);
                            bindingList.appendChild(op);
                        });
                        bindingsolutionDiv.style.display = 'inline-block';
                    }
                    else {
                        bindingsolutionDiv.style.display = 'none';
                    }
                }

                function addBindBtn() {
                    let roleId = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')
                                                      ?.innerText)?.id;

                    function toolsLinks(e) {
                        if (e.target.id == g_genCalcCfgPopupLinkId) {
                            showCalcConfigGenPopup();
                        }
                        else if (e.target.id == g_bindingPopupLinkId) {
                            showBindingPopup();
                        }
                        else if (e.target.id == g_equipOnekeyLinkId) {
                            equipOnekey();
                        }
                    }

                    let bindingAnchor = document.querySelector('#backpacks > div.row > div.col-md-12').parentNode.nextSibling;
                    let toolsContainer = document.createElement('div');
                    toolsContainer.className = 'btn-group';
                    toolsContainer.style.display = 'block';
                    toolsContainer.style.width = '100%';
                    toolsContainer.style.marginTop = '15px';
                    toolsContainer.style.fontSize = '18px';
                    toolsContainer.style.padding = '10px';
                    toolsContainer.style.borderRadius = '5px';
                    toolsContainer.style.color = '#0000c0';
                    toolsContainer.style.backgroundColor = '#ebf2f9';
                    bindingAnchor.parentNode.insertBefore(toolsContainer, bindingAnchor);

                    let genCalcCfgLink = document.createElement('span');
                    genCalcCfgLink.setAttribute('class', 'fyg_lh30');
                    genCalcCfgLink.style.width = '25%';
                    genCalcCfgLink.style.textAlign = 'left';
                    genCalcCfgLink.style.display = 'inline-block';
                    genCalcCfgLink.innerHTML =
                        `<a href="#" style="text-decoration:underline;" id="${g_genCalcCfgPopupLinkId}">生成计算器配置（PVE）</a>`;
                    genCalcCfgLink.querySelector('#' + g_genCalcCfgPopupLinkId).onclick = toolsLinks;
                    toolsContainer.appendChild(genCalcCfgLink);

                    let bindingLink = document.createElement('span');
                    bindingLink.setAttribute('class', 'fyg_lh30');
                    bindingLink.style.width = '25%';
                    bindingLink.style.textAlign = 'left';
                    bindingLink.style.display = 'inline-block';
                    bindingLink.innerHTML =
                        `<a href="#" style="text-decoration:underline;" id="${g_bindingPopupLinkId}">绑定（装备 光环 护符）</a>`;
                    bindingLink.querySelector('#' + g_bindingPopupLinkId).onclick = toolsLinks;
                    toolsContainer.appendChild(bindingLink);

                    let bindingsolutionDiv = document.createElement('div');
                    bindingsolutionDiv.id = g_bindingSolutionId;
                    bindingsolutionDiv.style.display = 'none';
                    bindingsolutionDiv.style.width = '50%';

                    let bindingList = document.createElement('select');
                    bindingList.id = g_bindingListSelectorId;
                    bindingList.style.width = '80%';
                    bindingList.style.color = '#0000c0';
                    bindingList.style.textAlign = 'center';
                    bindingList.style.display = 'inline-block';
                    bindingsolutionDiv.appendChild(bindingList);

                    let applyLink = document.createElement('span');
                    applyLink.setAttribute('class', 'fyg_lh30');
                    applyLink.style.width = '20%';
                    applyLink.style.textAlign = 'right';
                    applyLink.style.display = 'inline-block';
                    applyLink.innerHTML = `<a href="#" style="text-decoration:underline;" id="${g_equipOnekeyLinkId}">应用方案</a>`;
                    applyLink.querySelector('#' + g_equipOnekeyLinkId).onclick = toolsLinks;
                    bindingsolutionDiv.appendChild(applyLink);
                    toolsContainer.appendChild(bindingsolutionDiv);

                    refreshBindingSelector(roleId);
                }

                function addStoneTipsEnabler() {
                    let divs = document.querySelectorAll('#backpacks div.col-sm-8.fyg_tr');
                    if (divs.length == 3) {
                        let storageKeys = [ g_stoneProgressEquipTipStorageKey, g_stoneProgressCardTipStorageKey, g_stoneProgressHaloTipStorageKey,
                            g_stoneAuto1StorageKey,g_stoneAuto2StorageKey,g_stoneAuto3StorageKey,g_stoneAuto4StorageKey,g_stoneAuto5StorageKey,g_stoneAuto6StorageKey];
                        let i = 0;
                        for (let tip of divs) {
                            let div = document.createElement('div');
                            let id = 'stoneProgressTipCheckbox_' + i;
                            if(i!=2){
                                div.innerHTML =
                                `<label for="${id}" style="margin-right:5px;cursor:pointer;">100% 进度提醒</label>
                                 <input type="checkbox" id="${id}" />`;
                                tip.appendChild(div);
                                setupConfigCheckbox(div.querySelector('#' + id), storageKeys[i++], null, null);
                            }
                            else{
                                div.innerHTML =`<label style="margin-right:5px;cursor:pointer;">自动收集:</label>
                                <label for="stone1" style="margin-right:5px;cursor:pointer;">红石</label><input type="checkbox" id="stone1" />
                                <label for="stone2" style="margin-right:5px;cursor:pointer;">银石</label><input type="checkbox" id="stone2" />
                                <label for="stone3" style="margin-right:5px;cursor:pointer;">金石</label><input type="checkbox" id="stone3" />
                                <label for="stone4" style="margin-right:5px;cursor:pointer;">梦石</label><input type="checkbox" id="stone4" />
                                <label for="stone5" style="margin-right:5px;cursor:pointer;">虚石</label><input type="checkbox" id="stone5" />
                                <label for="stone6" style="margin-right:5px;cursor:pointer;">幻石</label><input type="checkbox" id="stone6" />&nbsp;&nbsp;
                                <label for="${id}" style="margin-right:5px;cursor:pointer;">100% 进度提醒</label><input type="checkbox" id="${id}" />`;
                                tip.appendChild(div);
                                setupConfigCheckbox(div.querySelector('#' + id), storageKeys[i++], null, null);
                                for(let j=1;j<6;j++){
                                    setupConfigCheckbox(div.querySelector('#stone' + j), storageKeys[j+2], null, null);
                                }
                            }
                        }
                    }
                }

                let backpacksObserver = new MutationObserver(() => {
                    $('.pop_main').hide();
                    let page = document.getElementsByClassName('nav nav-secondary nav-justified')[0].children;
                    let index = 0;
                    for (let i = 0; i < 4; i++) {
                        if (page[i].className == 'active') {
                            index = i;
                        }
                    }
                    switch (index) {
                        case 0: {
                            calcBtn.disabled = '';
                            calcBtn.onclick = (() => {
                                try {
                                    let equip = document.querySelectorAll(cardingObjectsQueryString);
                                    let bag = Array.from(document.querySelectorAll(bagObjectsQueryString)).concat(
                                              Array.from(document.querySelectorAll(storeObjectsQueryString)));
                                    let bagdata = equipmentNodesToInfoArray(bag);
                                    let data = equipmentNodesToInfoArray(equip);
                                    bagdata = bagdata.concat(data).sort(equipmentInfoComparer);
                                    calcDiv.innerHTML =
                                        `<div class="pop_main" style="padding:0px 10px;"><a href="#">× 折叠 ×</a>
                                         <div class="pop_con">
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey;">护符：</div>
                                         <div class="pop_text"></div>
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey">已装备：</div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey;">全部装备：</div>
                                         ${new Array(bagdata.length + 1).fill('<div class="pop_text"></div>').join('')}<hr></div>
                                         <a href="#">× 折叠 ×</a></div>`;

                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide()
                                    })
                                    let text = $('.pop_text');

                                    let amulet = document.getElementById('backpacks').lastChild.children[1].innerText.match(/\+\d+/g);
                                    for (let i = amulet.length - 1; i >= 0; i--) {
                                        if (amulet[i][1] == '0') {
                                            amulet.splice(i, 1);
                                        }
                                        else {
                                            amulet[i] = g_amuletBuffs[i].shortMark + amulet[i];
                                        }
                                    }
                                    text[0].innerText = `AMULET ${amulet.join(' ').replace(/\+/g, ' ')} ENDAMULET`;

                                    text[1].innerText = `${data[0].slice(0, -1).join(' ')}`;
                                    text[2].innerText = `${data[1].slice(0, -1).join(' ')}`;
                                    text[3].innerText = `${data[2].slice(0, -1).join(' ')}`;
                                    text[4].innerText = `${data[3].slice(0, -1).join(' ')}`;

                                    for (let i = 0; i < bagdata.length; i++) {
                                        text[5 + i].innerText = `${bagdata[i].slice(0, -1).join(' ')}`;
                                    }
                                    $('.pop_main').show();
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            });
                            if (document.getElementById('equipmentDiv') == null) {
                                backpacksObserver.disconnect();
                                addCollapse();
                                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            }
                            else {
                                switchObjectContainerStatus(!equipmentStoreExpand);
                            }
                            break;
                        }
                        case 1: {
                            let role = g_roleMap.get(document.querySelector(
                                '#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                            if (role != undefined) {
                                calcBtn.disabled = '';
                                calcBtn.onclick = (() => {
                                    calcDiv.innerHTML =
                                        `<div class="pop_main"><div class="pop_con">
                                         <div class="pop_text"></div><div class="pop_text"></div>
                                         </div><a href="#">× 折叠 ×</a></div>`;
                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide();
                                    })
                                    let text = $('.pop_text');
                                    let cardInfos = document.querySelectorAll('#backpacks .icon.icon-angle-down.text-primary');
                                    let cardInfo = [ role.shortMark,
                                                     cardInfos[0].innerText.match(/\d+/)[0],
                                                     cardInfos[2].innerText.match(/\d+/)[0],
                                                     cardInfos[1].innerText.match(/\d+/)[0]
                                                   ];
                                    if (role.hasG) {
                                        cardInfo.splice(1, 0, 'G=' + (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0'));
                                    }
                                    let points = [];
                                    for (let i = 1; i <= 6; i++) {
                                        points.push(document.getElementById('sjj' + i).innerText);
                                    }
                                    text[0].innerText = cardInfo.join(' ');
                                    text[1].innerText = points.join(' ');
                                    $('.pop_main').show();
                                });
                                backpacksObserver.disconnect();
                                addBindBtn();
                                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            }
                            else {
                                calcBtn.disabled = 'disabled';
                                calcBtn.onclick = (() => {});
                            }
                            break;
                        }
                        case 2: {
                            calcBtn.disabled = '';
                            calcBtn.onclick = (() => {
                                try {
                                    calcDiv.innerHTML =
                                        `<div class="pop_main"><div class="pop_con">
                                         <div class="pop_text"></div></div>
                                         <a href="#">× 折叠 ×</a></div>`;
                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide();
                                    })
                                    let text = $('.pop_text');
                                    let aura = document.querySelectorAll('#backpacks .btn.btn-primary');
                                    let data = [];
                                    data.push(aura.length);
                                    aura.forEach((item) => { data.push(g_haloMap.get(item.childNodes[1].nodeValue.trim())?.shortMark ?? ''); });
                                    text[0].innerText = data.join(' ');
                                    $('.pop_main').show();
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            });
                            break;
                        }
                        case 3: {
                            calcBtn.disabled = 'disabled';
                            calcBtn.onclick = (() => {});
                            backpacksObserver.disconnect();
                            addStoneTipsEnabler();
                            backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            break;
                        }
                    }
                });
                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                document.getElementById('backpacks').appendChild(document.createElement('div'));
            }
        }, 500);
    }
    else if (window.location.pathname == g_guguzhenBeach) {
        genericPopupInitialize();

        let beachConfigDiv = document.createElement('form');
        beachConfigDiv.innerHTML =
            `<div style="padding:5px 15px;border-bottom:1px solid grey;">
             <button type="button" style="margin-right:15px;" id="siftSettings">筛选设置</button>
             <input type="checkbox" id="forceExpand" style="margin-right:5px;" />
             <label for="forceExpand" style="margin-right:40px;cursor:pointer;">强制展开所有装备</label>
             <b><span id="analyze-indicator">正在分析...</span></b>
             <div style="float:right;"><label for="beach_BG"
                  style="margin-right:5px;cursor:pointer;">使用深色背景</label>
             <input type="checkbox" id="beach_BG" /></div></div>`;

         let forceExpand = setupConfigCheckbox(
            beachConfigDiv.querySelector('#forceExpand'),
            g_beachForceExpandStorageKey,
            (checked) => {
                forceExpand = checked;
                document.getElementById('analyze-indicator').innerText = '正在分析...';
                setTimeout(() => { expandEquipment(equipment); }, 50);
            },
            null);

        let beach_BG = setupConfigCheckbox(beachConfigDiv.querySelector('#beach_BG'),
                                           g_beachBGStorageKey,
                                           (checked) => { changeBeachStyle('beach_copy', beach_BG = checked); },
                                           null);

        beachConfigDiv.querySelector('#siftSettings').onclick = (() => {
            loadTheme();

            let fixedContent =
                '<div style="font-size:15px;color:#0000c0;padding:20px 0px 10px;"><b><ul>' +
                '<li>被勾选的装备不会被展开，不会产生与已有装备的对比列表，但传奇、史诗及有神秘属性的装备除外</li>' +
                '<li>未勾选的属性被视为主要属性，海滩装备的任一主要属性值大于已有装备的相应值时即有可能被展开，除非已有装备中至少有一件其各项属性值均不低于海滩装备</li>' +
                '<li>被勾选的属性被视为次要属性，当且仅当海滩装备和已有装备的主要属性值完全相等时才会被对比</li>' +
                '<li>不作为筛选依据的已有装备不会与海滩装备直接进行比较，这些装备不会影响海滩装备的展开与否</li></ul></b></div>';
            let mainContent =
                `<style> #equip-table { width:100%; }
                         #equip-table th { width:17%; text-align:right; }
                         #equip-table th.equip-th-equip { width:32%; text-align:left; }
                         #equip-table td { display:table-cell; text-align:right; }
                         #equip-table td.equip-td-equip { display:table-cell; text-align:left; }
                         #equip-table label.equip-checkbox-label { margin-left:5px; cursor:pointer; }
                         table tr.alt { background-color:${g_genericPopupBackgroundColorAlt}; } </style>
                 <div class="${g_genericPopupTopLineDivClass}" style="color:#800080;">
                   <b style="display:inline-block;width:30%;">不作为筛选依据的已有装备：</b>
                   <span style="display:inline-block;width:33%;;text-align:center;">
                     <input type="checkbox" id="ignoreMysEquip" style="margin-right:5px;" />
                     <label for="ignoreMysEquip" style="cursor:pointer;">神秘装备</label></span>
                   <b style="display:inline-block;width:33%;text-align:right;">低于 ` +
                     `<input type="text" id="ignoreEquipLevel" style="width:40px;" maxlength="3" value="0"
                             oninput="value=value.replace(/[^\\d]/g,'');" /> 级的装备</b></div>
                 <div class="${g_genericPopupTopLineDivClass}"><table id="equip-table">
                 <tr class="alt"><th class="equip-th-equip"><input type="checkbox" id="equip-name-check" />
                 <label class= "equip-checkbox-label" for="equip-name-check">装备名称</label></th>
                 <th>装备属性</th><th /><th /><th /></tr></table><div>`;

            genericPopupSetFixedContent(fixedContent);
            genericPopupSetContent('海滩装备筛选设置', mainContent);

            genericPopupQuerySelector('#equip-name-check').onchange = ((e) => {
                let eqchecks = equipTable.querySelectorAll('input.sift-settings-checkbox');
                for (let i = 0; i < eqchecks.length; i += 5) {
                    eqchecks[i].checked = e.target.checked;
                }
            });

            let udata = loadUserConfigData();
            if (udata.dataBeachSift == null) {
                udata.dataBeachSift = {};
                saveUserConfigData(udata);
            }

            let ignoreMysEquip = genericPopupQuerySelector('#ignoreMysEquip');
            let ignoreEquipLevel = genericPopupQuerySelector('#ignoreEquipLevel');

            ignoreMysEquip.checked = (udata.dataBeachSift.ignoreMysEquip ?? false);
            ignoreEquipLevel.value = (udata.dataBeachSift.ignoreEquipLevel ?? "0");

            let equipTable = genericPopupQuerySelector('#equip-table');
            let equipTypeColor = [ '#000080', '#008000', '#800080', '#008080' ];
            g_equipments.forEach((equip) => {
                let tr = document.createElement('tr');
                tr.id = `equip-index-${equip.index}`;
                tr.className = ('equip-tr' + ((equip.index & 1) == 0 ? '' : ' alt'));
                tr.setAttribute('equip-abbr', equip.shortMark);
                tr.style.color = equipTypeColor[equip.type];
                let attrHTML = '';
                equip.attributes.forEach((item, index) => {
                    let attrId = `${tr.id}-attr-${index}`;
                    attrHTML +=
                        `<td><input type="checkbox" class="sift-settings-checkbox" id="${attrId}" />
                         <label class="equip-checkbox-label" for="${attrId}">${item.attribute.name}</label></td>`;
                });
                let equipId = `equip-${equip.index}`;
                tr.innerHTML =
                    `<td class="equip-td-equip"><input type="checkbox" class="sift-settings-checkbox" id="${equipId}" />
                         <label class="equip-checkbox-label" for="${equipId}">${equip.alias}</label></td>${attrHTML}`;
                equipTable.appendChild(tr);
            });

            let eqchecks = equipTable.querySelectorAll('input.sift-settings-checkbox');
            for (let i = 0; i < eqchecks.length; i += 5) {
                let abbr = eqchecks[i].parentNode.parentNode.getAttribute('equip-abbr');
                if (udata.dataBeachSift[abbr] != null) {
                    let es = udata.dataBeachSift[abbr].split(',');
                    for (let j = 0; j < es.length; j++) {
                        eqchecks[i + j].checked = (es[j] == 'true');
                    }
                }
            }

            genericPopupAddButton(
                '确认',
                80,
                (() => {
                    let settings = { ignoreMysEquip : ignoreMysEquip.checked, ignoreEquipLevel : ignoreEquipLevel.value };
                    equipTable.querySelectorAll('tr.equip-tr').forEach((row) => {
                        let checks = [];
                        row.querySelectorAll('input.sift-settings-checkbox').forEach((col) => { checks.push(col.checked); });
                        settings[row.getAttribute('equip-abbr')] = checks.join(',');
                    });

                    let udata = loadUserConfigData();
                    udata.dataBeachSift = settings;
                    saveUserConfigData(udata);

                    genericPopupClose();
                    window.location.reload();
                }),
                false);
            genericPopupAddCloseButton(80);

            genericPopupSetContentSize(Math.min(g_equipments.length * 31 + 130, Math.max(window.innerHeight - 200, 500)),
                                       Math.min(750, Math.max(window.innerWidth - 100, 600)),
                                       true);
            genericPopupShowModal(true);
        });

        let beach = document.getElementById('beachall');
        beach.parentNode.insertBefore(beachConfigDiv, beach);

        let batbtns = document.querySelector('div.col-md-9 > div.panel.panel-primary > div.panel-body > div.btn-group > button.btn.btn-danger');
        let toAmuletBtn = document.createElement('button');
        toAmuletBtn.className = batbtns.className;
        toAmuletBtn.innerText = '批量沙滩装备转护符';
        toAmuletBtn.style.marginLeft = '1px';
        toAmuletBtn.onclick = equipToAmulet;
        batbtns.parentNode.appendChild(toAmuletBtn);

        function equipToAmulet() {
            loadTheme();

            function divHeightAdjustment(div) {
                div.style.height = (div.parentNode.offsetHeight - div.offsetTop - 3) + 'px';
            }

            function moveAmuletItem(e) {
                let li = e.target;
                if (li.tagName == 'LI') {
                    let liIndex = parseInt(li.getAttribute('item-index'));
                    let container = (li.parentNode == amuletToStoreList ? amuletToDestroyList : amuletToStoreList);
                    for (var li0 = container.firstChild; parseInt(li0?.getAttribute('item-index')) < liIndex; li0 = li0.nextSibling);
                    container.insertBefore(li, li0);
                }
            }

            function refreshBackpacks(fnFurtherProcess) {
                let asyncOperations = 1;
                let asyncObserver = new MutationObserver(() => { asyncObserver.disconnect(); asyncOperations = 0; });
                asyncObserver.observe(document.getElementById('backpacks'), { childList : true , subtree : true });

                stbp();

                let timer = setInterval(() => {
                    if (asyncOperations == 0) {
                        clearInterval(timer);
                        if (fnFurtherProcess != null) {
                            fnFurtherProcess();
                        }
                    }
                }, 200);
            }

            function queryObjects(bag, queryBagId, ignoreEmptyCell, beach, beachEquipLevel) {
                if (bag != null) {
                    let nodes = document.getElementById('backpacks').children;
                    if (queryBagId) {
                        objectIdParseNodes(nodes, bag, null, ignoreEmptyCell);
                    }
                    else {
                        let i = 0;
                        for (let node of nodes) {
                            let e = ((new Amulet()).fromNode(node) ?? equipmentInfoParseNode(node));
                            if (e != null) {
                                bag.push([ i++, e ]);
                            }
                        }
                    }
                }
                if (beach != null) {
                    let nodes = document.getElementById('beachall').children;
                    for (let node of nodes) {
                        let lv = equipmentGetLevel(node);
                        if (lv > 1) {
                            let e = equipmentInfoParseNode(node);
                            if (e != null && ((lv == 2 && parseInt(e[1]) >= beachEquipLevel) || lv > 2)) {
                                beach.push(parseInt(e[7]));
                            }
                        }
                    }
                }
            }

            let pickCount;
            function pickEquip() {
                genericPopupShowInformationTips('拾取装备...', 0);
                let ids = [];
                while (originalBeach.length > 0 && ids.length < freeCell) {
                    ids.unshift(originalBeach.pop());
                }
                pickCount = ids.length;
                beginMoveObjects(ids, g_object_move_path.beach2bag, refreshBackpacks, findPickedEquip);
            }

            function findPickedEquip() {
                let bag = [];
                queryObjects(bag, true, true, null, 0);
                let ids = findNewObjects(bag, originalBag, (a, b) => a - b, false);
                if (ids.length != pickCount) {
                    alert('从海滩拾取装备出错无法继续，请手动处理！');
                    window.location.reload();
                    return;
                }
                genericPopupShowInformationTips('熔炼装备...', 0);
                beginPirlObjects(ids, refreshBackpacks, prepareNewAmulets);
            }

            const objectTypeColor = [ '#e0fff0', '#ffe0ff', '#fff0e0', '#d0f0ff' ];
            let minBeachAmuletPointsToStore = [ 1, 1, 1 ];
            let cfg = g_configMap.get('minBeachAmuletPointsToStore')?.value?.split(',');
            if (cfg?.length == 3) {
                cfg.forEach((item, index) => {
                    if (isNaN(minBeachAmuletPointsToStore[index] = parseInt(item))) {
                        minBeachAmuletPointsToStore[index] = 1;
                    }
                });
            }
            function prepareNewAmulets() {
                newAmulets = findNewObjects(amuletNodesToArray(document.getElementById('backpacks').children),
                                            originalBag, (a, b) => a.id - b, false);
                if (newAmulets.length != pickCount) {
                    alert('熔炼装备出错无法继续，请手动处理！');
                    window.location.reload();
                    return;
                }
                newAmulets.forEach((am, index) => {
                    let li = document.createElement('li');
                    li.style.backgroundColor = g_equipmentLevelBGColor[am.level + 2];
                    li.setAttribute('item-index', index);
                    li.innerText = (am.type == 2 || am.level == 2 ? '★ ' : '') + am.formatBuffText();
                    (am.getTotalPoints() < minBeachAmuletPointsToStore[am.type] ? amuletToDestroyList : amuletToStoreList).appendChild(li);
                });
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                else if (document.getSelection) {
                    document.getSelection().removeAllRanges();
                }
                genericPopupShowInformationTips((originalBeach.length > 0 ? '本批' : '全部') + '装备熔炼完成，请分类后继续', 0);
                btnContinue.innerText = `继续 （剩余 ${originalBeach.length} 件装备）`;
                btnContinue.disabled = '';
                btnCloseOnBatch.disabled = '';
            }

            function processNewAmulets() {
                btnContinue.disabled = 'disabled';
                btnCloseOnBatch.disabled = 'disabled';

                if (freeCell == 0) {
                    scheduleFreeCell();
                }
                else if (pickCount > 0) {
                    let indices = [];
                    for (let li of amuletToDestroyList.children) {
                        indices.push(parseInt(li.getAttribute('item-index')));
                    }
                    if (indices.length > 0) {
                        let ids = [];
                        let warning = 0;
                        indices.sort((a, b) => a - b).forEach((i) => {
                            let am = newAmulets[i];
                            if (am.type == 2 || am.level == 2) {
                                warning++;
                            }
                            ids.push(am.id);
                        });
                        if (warning > 0 && !confirm(`这将把 ${warning} 个“樱桃／传奇”护符转换成果核，要继续吗？`)) {
                            btnContinue.disabled = '';
                            btnCloseOnBatch.disabled = '';
                            return;
                        }
                        amuletToDestroyList.innerHTML = '';
                        coresCollected += indices.length;
                        pickCount -= indices.length;
                        genericPopupShowInformationTips('转换果核...', 0);
                        beginPirlObjects(ids, refreshBackpacks, processNewAmulets);
                    }
                    else {
                        let bag = [];
                        queryObjects(bag, true, true, null, 0);
                        let ids = findNewObjects(bag, originalBag, (a, b) => a - b, false);
                        if (ids.length != pickCount) {
                            alert('将新护符放入仓库出错无法继续，请手动处理！');
                            window.location.reload();
                            return;
                        }
                        amuletToStoreList.innerHTML = '';
                        amuletsCollected += pickCount;
                        pickCount = 0;
                        genericPopupShowInformationTips('放入仓库...', 0);
                        beginMoveObjects(ids, g_object_move_path.bag2store, refreshBackpacks, processNewAmulets);
                    }
                }
                else if (originalBeach.length > 0) {
                    pickEquip();
                }
                else {
                    restoreBag(15);
                }
            }

            let originalFreeCell = 0;
            let originalBag = [];
            let originalBeach = [];
            let scheduledObjects = { equips : [] , amulets : [] };

            let freeCell = 0;
            let amuletsCollected = 0;
            let coresCollected = 0;
            let newAmulets = null;

            let minBeachEquipLevelToAmulet = (g_configMap.get('minBeachEquipLevelToAmulet')?.value ?? 1);
            queryObjects(originalBag, true, false, originalBeach, minBeachEquipLevelToAmulet);
            if (originalBeach.length == 0) {
                alert('海滩无可熔炼装备！');
                return;
            }

            function prepareBagList() {
                let info = (originalFreeCell > 0 ? [ '可', '更多' ] : [ '请', '必要' ])
                genericPopupShowInformationTips(`${info[0]}将部分背包内容入仓以提供${info[1]}的操作空间，点击“继续”开始`, 0);
                amuletToStoreList.parentNode.parentNode.children[0].innerText = '背包内容';
                amuletToDestroyList.parentNode.parentNode.children[0].innerText = '临时入仓';

                queryObjects(originalBag = [], false, true, null, 0);
                let bag = originalBag.slice().sort((a, b) => {
                    if (Array.isArray(a[1]) && Array.isArray(b[1])) {
                        return equipmentInfoComparer(a[1], b[1]);
                    }
                    else if (Array.isArray(a[1])){
                        return -1;
                    }
                    else if (Array.isArray(b[1])){
                        return 1;
                    }
                    return a[1].compareTo(b[1], true);
                });
                bag.forEach((item, index) => {
                    let e = item[1];
                    let isEq = Array.isArray(e);
                    let li = document.createElement('li');
                    li.style.backgroundColor = (isEq ? objectTypeColor[3] : objectTypeColor[e.type]);
                    li.setAttribute('item-index', index);
                    li.setAttribute('original-index', item[0]);
                    li.innerText = (isEq ? `${g_equipMap.get(e[0]).alias} Lv.${e[1]}` : e.formatBuffText());
                    amuletToStoreList.appendChild(li);
                });
            }

            function scheduleFreeCell() {
                let info = '背包已满，请选择至少一个背包内容暂时放入仓库以提供必要的操作空间。';
                function refreshOriginalBag() {
                    amuletToStoreList.innerHTML = '';
                    amuletToDestroyList.innerHTML = '';

                    originalFreeCell = 0;
                    queryObjects(originalBag = [], true, false, null, 0);
                    while (originalBag[originalBag.length - 1] == -1) {
                        originalBag.pop();
                        originalFreeCell++;
                    }
                    if (originalFreeCell == 0) {
                        alert(info);
                        scheduledObjects.equips = [];
                        scheduledObjects.amulets = [];

                        prepareBagList();
                        btnContinue.disabled = '';
                    }
                    else {
                        amuletToStoreList.parentNode.parentNode.children[0].innerText = '放入仓库';
                        amuletToDestroyList.parentNode.parentNode.children[0].innerText = '转换果核';

                        freeCell = originalFreeCell;
                        originalBag.sort((a, b) => a - b);
                        processNewAmulets();
                    }
                }

                let storeObjectsCount = (amuletToDestroyList?.children?.length ?? 0);
                if (originalFreeCell + storeObjectsCount == 0) {
                    alert(info);
                    btnContinue.disabled = '';
                    return;
                }
                else if (storeObjectsCount == 0) {
                    refreshOriginalBag();
                    return;
                }

                let indices = [];
                for (let li of amuletToDestroyList.children) {
                    indices.push(parseInt(li.getAttribute('original-index')));
                }
                indices.sort((a, b) => a - b);

                let ids = [];
                indices.forEach((i) => {
                    let e = originalBag[i][1];
                    let isEq = Array.isArray(e);
                    ids.push(isEq ? e[7] : e.id);
                    (isEq ? scheduledObjects.equips : scheduledObjects.amulets).push(e);
                });

                genericPopupShowInformationTips('临时放入仓库...', 0);
                beginMoveObjects(ids, g_object_move_path.bag2store, refreshBackpacks, refreshOriginalBag);
            }

            function restoreBag(closeCountDown) {
                function restoreCompletion() {
                    if (scheduledObjects.amulets.length > 0 || scheduledObjects.equips.length > 0) {
                        alert('部分背包内容无法恢复，请手动处理！');
                        console.log(scheduledObjects.equips);
                        console.log(scheduledObjects.amulets);
                        scheduledObjects.equips = [];
                        scheduledObjects.amulets = [];
                    }

                    if (closeCountDown > 0) {
                        genericPopupQuerySelector('#' + g_genericPopupInformationTipsId).previousSibling.innerText =
                            `操作完成，共获得 ${amuletsCollected} 个护符， ${coresCollected} 个果核`;
                        let timer = setInterval(() => {
                            if (--closeCountDown == 0) {
                                clearInterval(timer);
                                genericPopupClose();
                                window.location.reload();
                            }
                            else {
                                genericPopupShowInformationTips(`窗口将在 ${closeCountDown} 秒后关闭`, 0);
                            }
                        }, 1000);
                    }
                    else {
                        genericPopupClose();
                        window.location.reload();
                    }
                }

                if (scheduledObjects.equips.length == 0 && scheduledObjects.amulets.length == 0) {
                    restoreCompletion();
                }
                else {
                    genericPopupShowInformationTips('恢复背包内容...', 0);
                    beginRestoreObjects(null, scheduledObjects.amulets, scheduledObjects.equips, refreshBackpacks, restoreCompletion);
                }
            }

            let fixedContent =
                '<div style="width:100%;padding:10px 0px 0px 0px;font-size:16px;color:blue;"><b><span>双击条目进行分类间移动</span>' +
                  `<span id="${g_genericPopupInformationTipsId}" style="float:right;color:red;font-size:15px;"></span></b></div>`;
            let mainContent =
                '<div style="display:block;height:96%;width:100%;">' +
                  '<div style="position:relative;display:block;float:left;height:96%;width:48%;' +
                              'margin-top:10px;border:1px solid #000000;">' +
                    '<div style="display:block;width:100%;padding:5px;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">放入仓库</div>' +
                    '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                      '<ul id="amulet_to_store_list" style="cursor:pointer;"></ul></div></div>' +
                  '<div style="position:relative;display:block;float:right;height:96%;width:48%;' +
                              'margin-top:10px;border:1px solid #000000;">' +
                    '<div style="display:block;width:100%;padding:5px;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">转换果核</div>' +
                    '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                      '<ul id="amulet_to_destroy_list" style="cursor:pointer;"></ul></div></div></div>';

            genericPopupSetFixedContent(fixedContent);
            genericPopupSetContent('批量护符转换', mainContent);

            let amuletToStoreList = genericPopupQuerySelector('#amulet_to_store_list');
            let amuletToDestroyList = genericPopupQuerySelector('#amulet_to_destroy_list');
            amuletToStoreList.ondblclick = amuletToDestroyList.ondblclick = moveAmuletItem;

            while (originalBag[originalBag.length - 1] == -1) {
                originalBag.pop();
                originalFreeCell++;
            }
            if (originalBag.length > 0) {
                prepareBagList();
            }
            else {
                freeCell = originalFreeCell;
                genericPopupShowInformationTips('这会分批将海滩可熔炼装备转化为护符，请点击“继续”开始', 0);
            }

            let btnContinue = genericPopupAddButton(`继续 （剩余 ${originalBeach.length} 件装备 / ${originalFreeCell} 个背包空位）`,
                                                    0, processNewAmulets, true);
            let btnCloseOnBatch = genericPopupAddButton('本批完成后关闭', 0, (() => { originalBeach = []; processNewAmulets(); }), false);
            btnCloseOnBatch.disabled = 'disabled';
            genericPopupAddButton('关闭', 80, (() => { genericPopupClose(); window.location.reload(); }), false);

            genericPopupSetContentSize(400, 700, false);
            genericPopupShowModal(false);

            divHeightAdjustment(amuletToStoreList.parentNode);
            divHeightAdjustment(amuletToDestroyList.parentNode);
        }

        let asyncOperations = 2;
        let equipment = null;
        let equipedbtn = null;
        let bag, store;
        beginReadObjects(
            bag = [],
            store = [],
            () => {
                equipedbtn = bag.concat(store);
                asyncOperations--;

                GM_xmlhttpRequest({
                    method: g_postMethod,
                    url: g_readUrl,
                    headers: g_postHeader,
                    data: 'f=9',
                    onload: response => {
                        let div0 = document.createElement('div');
                        div0.innerHTML = response.responseText;

                        equipedbtn = equipedbtn.concat(Array.from(div0.querySelectorAll('div.row > div.fyg_tc > button.fyg_mp3')));
                        equipedbtn.sort(objectNodeComparer);
                        equipment = equipmentNodesToInfoArray(equipedbtn);

                        document.getElementById('analyze-indicator').innerText = '分析完成';
                        asyncOperations--;
                    }
                });
            },
            null);

        //分析装备并显示属性
        var g_expandingEquipment = false;
        function expandEquipment(equipment) {
            loadTheme();

            if (g_expandingEquipment || !(equipedbtn?.length > 0) || !(equipment?.length > 0) || equipment[0] == -1) {
                document.getElementById('analyze-indicator').innerText = '分析完成';
                return;
            }

            let beach_copy = document.getElementById('beach_copy');
            if (beach_copy == null) {
                let beachall = document.getElementById('beachall');
                beach_copy = beachall.cloneNode();
                beachall.style.display = 'none';
                beach_copy.id = 'beach_copy';
                beach_copy.style.backgroundColor = beach_BG ? 'black' : 'white';
                beachall.parentNode.insertBefore(beach_copy, beachall);

                (new MutationObserver((mList) => {
                    if (!g_expandingEquipment && mList?.length == 1 && mList[0].type == 'childList' &&
                        mList[0].addedNodes?.length == 1 && !(mList[0].removedNodes?.length > 0)) {

                        let node = mList[0].addedNodes[0];
                        if (node.hasAttribute('role')) {
                            node.remove();
                        }
                        else if (node.className?.indexOf('popover') >= 0) {
                            node.setAttribute('id', 'id_temp_apply_beach_BG');
                            changeBeachStyle('id_temp_apply_beach_BG', beach_BG);
                            node.removeAttribute('id');
                            if (node.className?.indexOf('popover-') < 0) {
                                let content = node.querySelector('.popover-content');
                                content.style.borderRadius = '5px';
                                content.style.border = (beach_BG ? '4px double white' : '4px double black');
                            }
                        }
                    }
                })).observe(beach_copy, { childList : true });
            }

            g_expandingEquipment = true;
            copyBeach(beach_copy);

            let udata = loadUserConfigData();
            if (udata.dataBeachSift == null) {
                udata.dataBeachSift = {};
                saveUserConfigData(udata);
            }

            let ignoreMysEquip = (udata.dataBeachSift.ignoreMysEquip ?? false);
            let ignoreEquipLevel = parseInt(udata.dataBeachSift.ignoreEquipLevel ?? '0');
            if (isNaN(ignoreEquipLevel)) {
                ignoreEquipLevel = 0;
            }

            let settings = {};
            for (let abbr in udata.dataBeachSift) {
                if (g_equipMap.has(abbr)) {
                    let checks = udata.dataBeachSift[abbr].split(',');
                    if (checks?.length == 5) {
                        let setting = [];
                        checks.forEach((checked) => { setting.push(checked.trim().toLowerCase() == 'true'); });
                        settings[abbr] = setting;
                    }
                }
            }

            const defaultSetting = [ false, false, false, false, false ];
            beach_copy.querySelectorAll('.btn.fyg_mp3').forEach((btn) => {
                let e = equipmentInfoParseNode(btn);
                if (e != null) {
                    let isExpanding = false;
                    let eqLv = equipmentGetLevel(btn);
                    if (forceExpand || eqLv > 2 || btn.getAttribute('data-content')?.match(/\[神秘属性\]/) != null) {
                        isExpanding = true;
                    }
                    else {
                        let setting = (settings[e[0]] ?? defaultSetting);
                        if (!setting[0]) {
                            let isFind = false;
                            let stLv;
                            for (let j = 0; j < equipment.length; j++) {
                                if (equipment[j][0] == e[0] &&
                                    !(ignoreMysEquip && equipment[j][6] == 1) &&
                                    (stLv = parseInt(equipment[j][1])) >= ignoreEquipLevel) {

                                    isFind = true;
                                    let e1 = [ parseInt(e[1]), parseInt(e[2]), parseInt(e[3]), parseInt(e[4]), parseInt(e[5]) ];
                                    let e2 = [ stLv, parseInt(equipment[j][2]), parseInt(equipment[j][3]),
                                               parseInt(equipment[j][4]), parseInt(equipment[j][5]) ];
                                    let res = defaultEquipmentNodeComparer(setting, e[0], e1, e2);
                                    if (res.majorAdv == 0) {
                                        if (res.minorAdv == 0) {
                                            isExpanding = false;
                                            break;
                                        }
                                        else if (!isExpanding) {
                                            isExpanding = (res.majorDis == 0);
                                        }
                                    }
                                    else {
                                        isExpanding = true;
                                    }
                                }
                            }
                            if (!isFind) {
                                isExpanding = true;
                            }
                        }
                    }
                    if (isExpanding) {
                        let btn0 = document.createElement('button');
                        btn0.className = `btn btn-light ${g_equipmentLevelTipClass[eqLv]}`;
                        btn0.style.minWidth = '200px';
                        btn0.style.padding = '0px';
                        btn0.style.marginBottom = '5px';
                        btn0.style.textAlign = 'left';
                        btn0.style.boxShadow = 'none';
                        btn0.style.lineHeight = '150%';
                        btn0.setAttribute('data-toggle', 'popover');
                        btn0.setAttribute('data-trigger', 'hover');
                        btn0.setAttribute('data-placement', 'bottom');
                        btn0.setAttribute('data-html', 'true');
                        btn0.setAttribute('onclick', btn.getAttribute('onclick'));

                        let popover = document.createElement('div');
                        popover.innerHTML = '<style> .popover { max-width:100%; } </style>';
                        let eqMeta = g_equipMap.get(e[0]);
                        equipedbtn.forEach((eqbtn) => {
                            if (eqMeta.index == parseInt(eqbtn.dataset.metaIndex)) {
                                let btn1 = document.createElement('button');
                                btn1.className = `btn btn-light ${g_equipmentLevelTipClass[equipmentGetLevel(eqbtn)]}`;
                                btn1.style.cssText =
                                    'min-width:180px;padding:10px 5px 0px 5px;text-align:left;box-shadow:none;background-color:none;' +
                                    'line-height:120%;border-width:3px;border-style:double;margin-right:5px;margin-bottom:5px;';
                                btn1.innerHTML = eqbtn.dataset.content;
                                if (btn1.lastChild.nodeType == 3) { //清除背景介绍文本
                                    btn1.lastChild.remove();
                                }
                                if (btn1.lastChild.className.indexOf('bg-danger') != -1) {
                                    btn1.lastChild.style.cssText = 'max-width:180px;padding:3px;white-space:pre-line;word-break:break-all;';
                                }
                                popover.appendChild(btn1);
                            }
                        });
                        btn0.setAttribute('data-content', popover.innerHTML);
                        btn0.innerHTML =
                            `<h3 class="popover-title" style="background-color:${getComputedStyle(btn0).getPropertyValue('background-color')}">` +
                            `${btn.dataset.originalTitle}</h3>` +
                            `<div class="popover-content-show" style="padding:10px 10px 0px 10px;">${btn.dataset.content}</div>`;
                        beach_copy.insertBefore(btn0, btn.nextSibling);
                    }
                }
            });

            $(function() {
                $('#beach_copy .btn[data-toggle="popover"]').popover();
            });
            $('#beach_copy .bg-danger.with-padding').css({
                'max-width': '200px',
                'padding': '5px',
                'white-space': 'pre-line',
                'word-break': 'break-all'
            });

            changeBeachStyle('beach_copy', beach_BG);
            document.getElementById('analyze-indicator').innerText = '分析完成';
            g_expandingEquipment = false;
        }

        function changeBeachStyle(container, bg)
        {
            $(`#${container}`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .popover-content-show`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .btn-light`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .popover-title`).css({
                'color': bg ? 'black' : 'white'
            });
            $(`#${container} .pull-right`).css({
                'color': bg ? 'black' : 'white'
            });
            $(`#${container} .bg-danger.with-padding`).css({
                'color': bg ? 'black' : 'white'
            });
        }

        //等待海滩装备加载
        let beachTimer = setInterval(() => {
            if ($('#beachall .btn').length != 0) {
                clearInterval(beachTimer);
                //等待装备读取完成
                let equipTimer = setInterval(() => {
                    if (asyncOperations == 0) {
                        clearInterval(equipTimer);

                        document.getElementById('analyze-indicator').innerText = '正在分析...';
                        setTimeout(() => { expandEquipment(equipment); }, 50);

                        (new MutationObserver(() => {
                            document.getElementById('analyze-indicator').innerText = '正在分析...';
                            setTimeout(() => { expandEquipment(equipment); }, 50);
                        })).observe(document.getElementById('beachall'), { childList : true });
                    }
                }, 500);
            }
        }, 500);

        function copyBeach(beach_copy) {
            beach_copy.innerHTML = '';
            Array.from(document.getElementById('beachall').children).sort(sortBeach).forEach((node) => {
                beach_copy.appendChild(node.cloneNode(true));
            });
        }

        function sortBeach(a, b) {
            let delta = equipmentGetLevel(a) - equipmentGetLevel(b);
            if (delta == 0) {
                if ((delta = parseInt(a.innerText.match(/\d+/)[0]) - parseInt(b.innerText.match(/\d+/)[0])) == 0) {
                    delta = (a.getAttribute('data-original-title') < b.getAttribute('data-original-title') ? -1 : 1);
                }
            }
            return -delta;
        }

        document.querySelector('body').style.paddingBottom = '1000px';
    }
    else if (window.location.pathname == g_guguzhenPK) {
        let pkConfigDiv = document.createElement('div');
        pkConfigDiv.style.className = 'panel-heading';
        pkConfigDiv.style.float = 'right';
        pkConfigDiv.innerHTML =
            `<label for="forgeAutoCheckbox" style="margin-right:5px;cursor:pointer;">满进度自动生成</label>
             <input type="checkbox" id="forgeAutoCheckbox" style="margin-right:15px;" />
            <label for="indexRallyCheckbox" style="margin-right:5px;cursor:pointer;">为攻击回合加注索引</label>
             <input type="checkbox" id="indexRallyCheckbox" style="margin-right:15px;" />
             <label for="keepPkRecordCheckbox" style="margin-right:5px;cursor:pointer;">暂时保持战斗记录</label>
             <input type="checkbox" id="keepPkRecordCheckbox" style="margin-right:15px;" />
             <label for="autoTaskEnabledCheckbox" style="margin-right:5px;cursor:pointer;">允许执行自定义任务</label>
             <input type="checkbox" id="autoTaskEnabledCheckbox" />`;

        let forgeAuto = setupConfigCheckbox(pkConfigDiv.querySelector('#forgeAutoCheckbox'),
                                                  g_forgeAutoStorageKey,
                                                  (checked) => { forgeAuto = checked; },
                                                  null);

        let indexRally = setupConfigCheckbox(pkConfigDiv.querySelector('#indexRallyCheckbox'),
                                             g_indexRallyStorageKey,
                                             (checked) => { indexRally = checked; },
                                             null);

        let keepPkRecord = setupConfigCheckbox(pkConfigDiv.querySelector('#keepPkRecordCheckbox'),
                                               g_keepPkRecordStorageKey,
                                               (checked) => { keepPkRecord = checked; },
                                               null);

        let autoTaskEnabled = setupConfigCheckbox(pkConfigDiv.querySelector('#autoTaskEnabledCheckbox'),
                                                  g_autoTaskEnabledStorageKey,
                                                  () => { window.location.reload(); },
                                                  null);

        document.querySelector('div.panel.panel-primary > div.panel-heading').appendChild(pkConfigDiv);

        let div0_pk_text_more = document.createElement('div');
        div0_pk_text_more.setAttribute('id', 'pk_text_more');
        div0_pk_text_more.setAttribute('class', 'panel-body');
        document.getElementsByClassName('panel panel-primary')[1].appendChild(div0_pk_text_more);

        let addingRallyIndices = false;
        let pkText = document.querySelector('#pk_text').innerHTML;
        (new MutationObserver(() => {
            if (addingRallyIndices) {
                return;
            }
            else if (indexRally) {
                addingRallyIndices = true;
                let turn_l = 0;
                let turn_r = 0;
                document.querySelectorAll('#pk_text p.bg-special').forEach((e, i) => {
                    let myTurn = (e.className.indexOf('fyg_tr') >= 0);
                    let rally = document.createElement('b');
                    rally.innerText = (myTurn ? `${i + 1} （${++turn_l}）` : `（${++turn_r}） ${i + 1}`);
                    rally.style.float = (myTurn ? 'left' : 'right');
                    rally.style.marginLeft = rally.style.marginRight = '10px';
                    e.appendChild(rally);
                });
                addingRallyIndices = false;
            }
            if (keepPkRecord) {
                document.querySelector('#pk_text_more').innerHTML = pkText + document.querySelector('#pk_text_more').innerHTML;
                pkText = document.querySelector('#pk_text').innerHTML;
                $('#pk_text_more .btn[data-toggle="tooltip"]').tooltip();
            }
        })).observe(document.querySelector('#pk_text'), { characterData : true , childList : true });

        function setupNotificationClicker() {
            let timer = setInterval(() => {
                let panels = document.querySelectorAll('#pklist > div.row > div.col-md-2.fyg_tc');
                if (panels?.length > 0) {
                    clearInterval(timer);

                    panels.forEach((panel) => {
                        panel.onclick = ((e) => {
                            if (e.target.className == 'col-md-2 fyg_tc' || e.target.parentNode.className == 'col-md-2 fyg_tc') {
                                stoneProgressTip();
                            }
                        });
                    });
                }
            }, 200);
        }
        setupNotificationClicker();

        (new MutationObserver(() => {
            stoneProgressTip();
            setupNotificationClicker();
        })).observe(document.querySelector('#pklist'), { characterData : true, childList : true, subtree : true });

        if (autoTaskEnabled) {
            let btngroup0 = document.createElement('div');
            btngroup0.setAttribute('class', 'action_selector');
            btngroup0.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;
            let btngroup1 = document.createElement('div');
            btngroup1.setAttribute('class', 'action_selector');
            btngroup1.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">5</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">15</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">25</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">35</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">45</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">55</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">65</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">75</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">85</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">95</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;
            let btngroup2 = document.createElement('div');
            btngroup2.setAttribute('class', 'action_selector');
            btngroup2.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">5</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">15</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">25</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">35</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">45</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">55</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">65</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">75</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">85</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">95</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;

            let taskObserver = new MutationObserver(() => {
                if (document.getElementsByClassName('btn-secondary').length == 0) {
                    let addbtn = setInterval(() => {
                        let col = document.querySelector('#pklist > div > div.col-md-8');
                        if (col != null) {
                            clearInterval(addbtn);

                            let obtns = document.getElementsByClassName('btn-block dropdown-toggle fyg_lh30');
                            col.insertBefore(btngroup0, obtns[0]);
                            col.insertBefore(btngroup1, obtns[1]);
                            col.insertBefore(btngroup2, obtns[2]);

                            let btnAutoTask = document.getElementById('btnAutoTask');
                            if (btnAutoTask == null) {
                                let execDiv = document.createElement('div');
                                execDiv.innerHTML =
                                    `<p></p><button type="button" class="btn" id="btnAutoTask" style="margin-right:15px;">任务执行</button>
                                     <input type="checkbox" id="checkStoneProgressCheckbox" style="margin-right:5px;" />
                                     <label for="checkStoneProgressCheckbox" style="cursor:pointer;">任务执行过程中检查宝石进度提醒</label>`;
                                let checkStoneProgress = setupConfigCheckbox(execDiv.querySelector('#checkStoneProgressCheckbox'),
                                                                             g_autoTaskCheckStoneProgressStorageKey,
                                                                             (checked) => { checkStoneProgress = checked; },
                                                                             null);
                                col.appendChild(execDiv);
                                btnAutoTask = document.getElementById('btnAutoTask');

                                function gobattle() {
                                    btnAutoTask.disabled = 'disabled';
                                    let times = [ 0, 0, 0 ];
                                    let sum = 0;
                                    let breakTask = false;
                                    $('.btn-secondary').each(function(i, e) {
                                        if ($(e).attr('style') != null && $(e).css('background-color') == 'rgb(135, 206, 250)') {
                                            let a = parseInt(e.innerText);
                                            let b = $('.btn-group .btn-secondary').index(e);
                                            sum += a;
                                            if (b < 11) {
                                                times[0] = a / 10;
                                            } else if (b >= 11 && b < 32) {
                                                times[1] = a / 5;
                                            } else if (b >= 32) {
                                                times[2] = a / 5;
                                            }
                                        }
                                    });

                                    if (sum <= parseInt(document.getElementsByClassName('fyg_colpz03')[0].innerText)) {
                                        let gox_data = getPostData(/gox\(\)\{[\s\S]*\}/m, /data: ".*"/).slice(7, -1);

                                        function func0(time) {
                                            if (time == 0) {
                                                if (times[0] != 0) {
                                                    GM_xmlhttpRequest({
                                                        method: g_postMethod,
                                                        url: g_readUrl,
                                                        headers: g_postHeader,
                                                        data: 'f=12',
                                                        onload: response => {
                                                            let ap = response.responseText.match(/class="fyg_colpz03" style="font-size:32px;font-weight:900;">\d+</)[0].match(/>\d+</)[0].slice(1, -1);
                                                            document.getElementsByClassName('fyg_colpz03')[0].innerText = ap;
                                                            let rankp = response.responseText.match(/class="fyg_colpz02" style="font-size:32px;font-weight:900;">\d+%</)[0].match(/\d+%/)[0];
                                                            document.getElementsByClassName('fyg_colpz02')[0].innerText = rankp;
                                                            times[0] = 0;
                                                        }
                                                    });
                                                }
                                            }
                                            else if (checkStoneProgress) {
                                                stoneProgressTip((tip) => {
                                                    if (tip) {
                                                        let div_info = document.createElement('div');
                                                        div_info.style.color = 'red';
                                                        div_info.innerText = '有宝石收藏相关功能进度已满，请先行处理';
                                                        btnAutoTask.parentNode.appendChild(div_info);
                                                        breakTask = true;
                                                        func0(0);
                                                    }
                                                    else {
                                                        goxRequest();
                                                    }
                                                });
                                            }
                                            else {
                                                goxRequest();
                                            }

                                            function goxRequest() {
                                                function parseGainResponse(response)
                                                {
                                                    let gainText = '';
                                                    if (response.indexOf('<p>获得了</p>') >= 0) {
                                                        let gain;
                                                        let sp = '获得';
                                                        let regex = />.+?\s+(\d+\s*%?)\s+(.+?)</g;
                                                        while ((gain = regex.exec(response))?.length == 3) {
                                                            gainText += `${sp}${gain[2].trim()}：${gain[1]}`;
                                                            sp = ', ';
                                                        }
                                                        let lvlUp = response.match(/角色 \[ [^\s]+ \] 卡片等级提升！/g);
                                                        if (lvlUp?.length > 0) {
                                                            sp = '<br> ';
                                                            lvlUp.forEach((e) => {
                                                                gainText += `${sp}${e}`;
                                                                sp = ', ';
                                                            });
                                                        }
                                                    }
                                                    return gainText;
                                                }

                                                GM_xmlhttpRequest({
                                                    method: g_postMethod,
                                                    url: g_postUrl,
                                                    headers: g_postHeader,
                                                    data: gox_data,
                                                    onload: response => {
                                                        let gainText = parseGainResponse(response.responseText);
                                                        if (gainText.length > 0) {
                                                            let div_info = document.createElement('div');
                                                            div_info.innerHTML = gainText;
                                                            btnAutoTask.parentNode.appendChild(div_info);
                                                            func0(time - 1);
                                                        } else {
                                                            let div_info = document.createElement('div');
                                                            div_info.innerText = '段位进度不足或无法识别的应答信息';
                                                            btnAutoTask.parentNode.appendChild(div_info);
                                                            func0(0);
                                                        }
                                                    }
                                                });
                                            }
                                        }

                                        function func1(time) {
                                            if (time == 0) {
                                                times[1] = 0;
                                                return;
                                            }
                                            let observerPk = new MutationObserver((mutationsList, observer) => {
                                                let isPk = 0;
                                                for (let mutation of mutationsList) {
                                                    if (mutation.type == 'childList') {
                                                        isPk = 1;
                                                    }
                                                }
                                                if (isPk) {
                                                    observerPk.disconnect();
                                                    func1(time - 1);
                                                }
                                            });
                                            observerPk.observe(document.querySelector('#pk_text'), { characterData : true , childList : true });
                                            jgjg(1);
                                        }

                                        function func2(time) {
                                            if (time == 0) {
                                                times[2] = 0;
                                                btnAutoTask.disabled = '';
                                                return;
                                            }
                                            let observerPk = new MutationObserver((mutationsList, observer) => {
                                                let isPk = 0;
                                                for (let mutation of mutationsList) {
                                                    if (mutation.type == 'childList') {
                                                        isPk = 1;
                                                    }
                                                }
                                                if (isPk) {
                                                    observerPk.disconnect();
                                                    func2(time - 1);
                                                }
                                            });
                                            observerPk.observe(document.querySelector('#pk_text'), { characterData : true , childList : true });
                                            jgjg(2);
                                        }

                                        func0(times[0]);

                                        let waitFor0 = setInterval(() => {
                                            if (times[0] == 0 || breakTask) {
                                                clearInterval(waitFor0);
                                                if (!breakTask) {
                                                    func1(times[1]);
                                                }
                                                else {
                                                    btnAutoTask.disabled = '';
                                                }
                                            }
                                        }, 1000);

                                        let waitFor1 = setInterval(() => {
                                            if ((times[0] == 0 && times[1] == 0) || breakTask) {
                                                clearInterval(waitFor1);
                                                if (!breakTask) {
                                                    func2(times[2]);
                                                }
                                                else {
                                                    btnAutoTask.disabled = '';
                                                }
                                            }
                                        }, 1000);
                                    } else {
                                        alert('体力不足');
                                        btnAutoTask.disabled = '';
                                    }
                                }
                                btnAutoTask.onclick = gobattle;
                            }
                            function selector_act() {
                                var btnNum = $('.btn-group .btn-secondary').index(this);
                                $('.btn-group .btn-secondary')
                                    .eq(btnNum)
                                    .css('background-color', 'rgb(135, 206, 250)')
                                    .siblings('.btn-group .btn-secondary')
                                    .css('background-color', 'rgb(255, 255, 255)');
                            }
                            let btnselector = document.getElementsByClassName('btn-secondary');
                            for (let i = 0; i < btnselector.length; i++) {
                                btnselector[i].addEventListener('click', selector_act, false);
                            }
                        }
                    }, 1000);
                }
            });
            taskObserver.observe(document.getElementsByClassName('panel panel-primary')[0], { childList : true, subtree : true, });
        }
    }
    else if (window.location.pathname == g_guguzhenWish) {
        let timer = setInterval(() => {
            let wishPoints = parseInt(document.getElementById('xys_dsn')?.innerText);
            if (!isNaN(wishPoints)) {
                clearInterval(timer);

                for (let title of document.getElementsByClassName('panel-heading')) {
                    if (title.innerText.indexOf('我的愿望') >= 0) {
                        let div = document.createElement('div');
                        div.style.float = 'right';
                        div.innerHTML =
                            '<label for="ignoreWishpoolExpirationCheckbox" style="margin-right:5px;cursor:pointer;">禁止许愿池过期提醒</label>' +
                            '<input type="checkbox" id="ignoreWishpoolExpirationCheckbox" />';

                        setupConfigCheckbox(div.querySelector('#ignoreWishpoolExpirationCheckbox'),
                                            g_ignoreWishpoolExpirationStorageKey,
                                            () => { window.location.reload(); },
                                            null);

                        title.appendChild(div);
                        break;
                    }
                }

                function getWishPoints() {
                    let text = 'WISH';
                    for (let i = 7; i <= 13; i++) {
                        text += (' ' + (document.getElementById('xyx_' + ('0' + i).slice(-2))?.innerText ?? '0'));
                    }
                    return text;
                }

                let div = document.createElement('div');
                div.className = 'row';
                div.innerHTML =
                    '<div class="panel panel-info"><div class="panel-heading"> 计算器许愿点设置 （' +
                    '<a href="#" id="copyWishPoints">点击这里复制到剪贴板</a>）</div>' +
                    '<input type="text" class="panel-body" id="calcWishPoints" readonly="true" ' +
                           'style="border:none;outline:none;" value="" /></div>';

                let calcWishPoints = div.querySelector('#calcWishPoints');
                calcWishPoints.value = getWishPoints();

                let xydiv = document.getElementById('xydiv');
                xydiv.parentNode.parentNode.insertBefore(div, xydiv.parentNode.nextSibling);

                div.querySelector('#copyWishPoints').onclick = ((e) => {
                    calcWishPoints.select();
                    if (document.execCommand('copy')) {
                        e.target.innerText = '许愿点设置已复制到剪贴板';
                    }
                    else {
                        e.target.innerText = '复制失败，这可能是因为浏览器没有剪贴板访问权限，请进行手工复制';
                    }
                });

                (new MutationObserver(() => {
                    calcWishPoints.value = getWishPoints();
                })).observe(xydiv, { subtree : true , childList : true , characterData : true });
            }
        }, 500);
    }
})();>护符</th><th class="object-property">属性</th></tr></table>';
                    const equipTable =
                          '<table class="equip-list"><tr class="alt"><th class="object-name">装备</th><th class="object-property">属性</th>' +
                             '<th class="object-property"></th><th class="object-property"></th><th class="object-property"></th></tr></table>';
                    const btnGroup =
                          '<button type="button" class="btn-group-selection" select-type="2">反选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="1">全不选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="0">全选</button>';
                    const mainContent =
                        `${mainStyle}
                         <div class="${g_genericPopupTopLineDivClass} bag-div" id="bag-div">
                           <b class="group-menu">背包 （选中 <span>0</span>，空闲 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${bagTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="amulets-div">
                           <b class="group-menu">护符 （选中 <span>0</span>）（★：已加入护符组） ▼${menuItems}</b>${btnGroup}<p />${amuletTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips1-div">
                           <b class="group-menu">武器装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips2-div">
                           <b class="group-menu">手臂装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips3-div">
                           <b class="group-menu">身体装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips4-div">
                           <b class="group-menu">头部装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent('清理库存', mainContent);

                    genericPopupQuerySelector('div.bag-div').firstElementChild.firstElementChild
                        .nextElementSibling.innerText = objectEmptyNodesCount(bagObjects);

                    genericPopupQuerySelectorAll('button.btn-group-selection').forEach((btn) => { btn.onclick = batchSelection; });
                    function batchSelection(e) {
                        let selType = parseInt(e.target.getAttribute('select-type'));
                        let selCount = 0;
                        e.target.parentNode.querySelectorAll('input.equip-checkbox').forEach((chk) => {
                            if (chk.checked = (selType == 2 ? !chk.checked : selType == 0)) {
                                selCount++;
                            }
                        });
                        e.target.parentNode.firstElementChild.firstElementChild.innerText = selCount;
                    }

                    const objectTypeColor = [ '#e0fff0', '#ffe0ff', '#fff0e0', '#d0f0ff' ];
                    let bag_selector = genericPopupQuerySelector('table.bag-list');
                    let bagEquips = equipmentNodesToInfoArray(document.querySelectorAll(bagObjectsQueryString));
                    let bagAmulets = amuletNodesToArray(document.querySelectorAll(bagObjectsQueryString));
                    bagEquips.slice().sort(equipmentInfoComparer).forEach((item) => {
                        let eqMeta = g_equipMap.get(item[0]);
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[3];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox equip-item" id="bag-${item[7]}"
                                        original-item="${item.join(',')}" />
                                 <label for="bag-${item[7]}" style="margin-left:5px;cursor:pointer;">
                                        ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                             <td>${formatEquipmentAttributes(item, ', ')}</td>`;
                        bag_selector.appendChild(tr);
                    });
                    bagAmulets.slice().sort((a , b) => a.compareTo(b, true)).forEach((item) => {
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[item.type];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox amulet-item" id="bag-${item.id}"
                                        original-item="${item.formatBuffText()}" />
                                 <label for="bag-${item.id}" style="margin-left:5px;cursor:pointer;">
                                        ${item.formatName()}</label></td>
                             <td>${item.formatBuff()}</td>`;
                        bag_selector.appendChild(tr);
                    });

                    let groupAmulets = [];
                    amuletLoadGroups().toArray().forEach((group) => { groupAmulets.push(group.items); });
                    groupAmulets = groupAmulets.flat().sort((a , b) => a.compareMatch(b));
                    let amulet_selector = genericPopupQuerySelector('table.amulet-list');
                    let storeAmulets = amuletNodesToArray(document.querySelectorAll(storeObjectsQueryString));
                    storeAmulets.concat(bagAmulets).sort((a , b) => a.compareTo(b)).forEach((item) => {
                        let gi = searchElement(groupAmulets, item, (a , b) => a.compareMatch(b));
                        if (gi >= 0) {
                            groupAmulets.splice(gi, 1);
                        }
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = objectTypeColor[item.type];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox amulet-item" id="amulet-${item.id}"
                                        original-item="${item.formatBuffText()}" />
                                 <label for="amulet-${item.id}" style="margin-left:5px;cursor:pointer;">
                                        ${gi >= 0 ? '★ ' : ''}${item.formatName()}</label></td>
                             <td>${item.formatBuff()}</td>`;
                        amulet_selector.appendChild(tr);
                    });

                    let eqIndex = 0;
                    let eq_selectors = genericPopupQuerySelectorAll('table.equip-list');
                    let storeEquips = equipmentNodesToInfoArray(document.querySelectorAll(storeObjectsQueryString));
                    storeEquips.concat(bagEquips).sort((e1, e2) => {
                        if (e1[0] != e2[0]) {
                            return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                        }
                        return -equipmentInfoComparer(e1, e2);
                    }).forEach((item) => {
                        let eqMeta = g_equipMap.get(item[0]);
                        let lv = equipmentGetLevel(item);
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = g_equipmentLevelBGColor[lv];
                        tr.innerHTML =
                            `<td><input type="checkbox" class="equip-checkbox equip-item" id="equip-${++eqIndex}"
                                        original-item="${item.join(',')}" />
                                 <label for="equip-${eqIndex}" style="margin-left:5px;cursor:pointer;">
                                        ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                             <td>${formatEquipmentAttributes(item, '</td><td>')}</td>`;
                        eq_selectors[eqMeta.type].appendChild(tr);
                    });

                    genericPopupQuerySelectorAll('input.equip-checkbox').forEach((e) => { e.onchange = equipCheckboxStateChange; });
                    function equipCheckboxStateChange(e) {
                        let countSpan = e.target.parentNode.parentNode.parentNode.parentNode.firstElementChild.firstElementChild;
                        countSpan.innerText = parseInt(countSpan.innerText) + (e.target.checked ? 1 : -1);
                    }

                    let btnGo = genericPopupAddButton('开始', 80, (() => {
                        operationEnabler(false);
                        genericPopupQuerySelector('#disclaimer-check').disabled = 'disabled';
                        beginScheduleBag();
                    }), false);
                    let btnCancel = genericPopupAddButton('取消', 80, () => {
                        operationEnabler(false);
                        btnCancel.disabled = 'disabled';
                        cancelProcess();
                    }, false);

                    function operationEnabler(enabled) {
                        let v = enabled ? '' : 'disabled';
                        genericPopupQuerySelectorAll('button.btn-group-selection').forEach((e) => { e.disabled = v; });
                        genericPopupQuerySelectorAll('input.equip-checkbox').forEach((e) => { e.disabled = v; });
                        btnGo.disabled = v;
                    }
                    operationEnabler(false);
                    genericPopupQuerySelector('#disclaimer-check').onchange = ((e) => { operationEnabler(e.target.checked); });

                    let objectsCount = bagEquips.length + bagAmulets.length + storeEquips.length + storeAmulets.length;
                    genericPopupSetContentSize(Math.min((objectsCount * 31) + (6 * 104), Math.max(window.innerHeight - 400, 400)),
                                               Math.min(1000, Math.max(window.innerWidth - 200, 600)),
                                               true);
                    genericPopupShowModal(false);
                }

                ////////////////////////////////////////////////////////////////////////////////
                //
                // collapse container
                //
                ////////////////////////////////////////////////////////////////////////////////

                let forceEquipDivOperation = true;
                let equipDivExpanded = {};

                equipmentDiv.querySelectorAll('button.btn.btn-block.collapsed').forEach((btn) => { btn.onclick = backupEquipmentDivState; });
                function backupEquipmentDivState(e) {
                    let targetDiv = equipmentDiv.querySelector(e.target.getAttribute('data-target'));
                    if (targetDiv != null) {
                        equipDivExpanded[targetDiv.id] = !equipDivExpanded[targetDiv.id];
                    }
                    else {
                        equipDivExpanded[e.target.id] = !equipDivExpanded[e.target.id];
                    }
                };

                function collapseEquipmentDiv(expand, force) {
                    let targetDiv;
                    equipmentDiv.querySelectorAll('button.btn.btn-block').forEach((btn) => {
                        if (btn.getAttribute('data-toggle') == 'collapse' &&
                            (targetDiv = equipmentDiv.querySelector(btn.getAttribute('data-target'))) != null) {

                            let exp = expand;
                            if (equipDivExpanded[targetDiv.id] == undefined || force) {
                                equipDivExpanded[targetDiv.id] = exp;
                            }
                            else {
                                exp = equipDivExpanded[targetDiv.id];
                            }

                            targetDiv.className = (exp ? 'in' : 'collapse');
                            targetDiv.style.height = (exp ? 'auto' : '0px');
                        }
                    });
                    if (equipDivExpanded[storeButtonId] == undefined || force) {
                        equipDivExpanded[storeButtonId] = expand;
                    }
                    if (equipDivExpanded[storeButtonId]) {
                        $(storeQueryString).show();
                    }
                    else {
                        $(storeQueryString).hide();
                    }
                }

                let objectContainer = equipmentDiv.querySelector('#equipment_ObjectContainer');
                function switchObjectContainerStatus(show) {
                    if (show) {
                        objectContainer.style.display = 'block';
                        objectContainer.style.height = 'auto';
                        if (equipDivExpanded[storeButtonId]) {
                            $(storeQueryString).show();
                        }
                        else {
                            $(storeQueryString).hide();
                        }
                    }
                    else {
                        objectContainer.style.height = '0px';
                        objectContainer.style.display = 'none';
                        $(storeQueryString).show();
                    }

                    equipmentDiv.querySelector('#equipment_Expand').disabled =
                        equipmentDiv.querySelector('#equipment_BG').disabled = (show ? '' : 'disabled');
                }

                function changeEquipmentDivStyle(bg) {
                    $('#equipmentDiv .backpackDiv').css({
                        'background-color': bg ? 'black' : '#ffe5e0'
                    });
                    $('#equipmentDiv .storeDiv').css({
                        'background-color': bg ? 'black' : '#ddf4df'
                    });
                    $('#equipmentDiv .btn-light').css({
                        'background-color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .popover-content-show').css({
                        'background-color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .popover-title').css({
                        'color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .bg-special').css({
                        'background-color': bg ? 'black' : '#8666b8',
                        'color': bg ? '#c0c0c0' : 'white',
                        'border-bottom': bg ? '1px solid grey' : 'none'
                    });
                    $('#equipmentDiv .btn-equipment .pull-right').css({
                        'color': bg ? 'black' : 'white'
                    });
                    $('#equipmentDiv .btn-equipment .bg-danger.with-padding').css({
                        'color': bg ? 'black' : 'white'
                    });
                }

                let equipmentStoreExpand = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_StoreExpand'),
                                                               g_equipmentStoreExpandStorageKey,
                                                               (checked) => { switchObjectContainerStatus(!(equipmentStoreExpand = checked)); },
                                                               null);
                let equipmentExpand = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_Expand'),
                                                          g_equipmentExpandStorageKey,
                                                          (checked) => { collapseEquipmentDiv(equipmentExpand = checked, true); },
                                                          null);
                let equipmentBG = setupConfigCheckbox(equipmentDiv.querySelector('#equipment_BG'),
                                                      g_equipmentBGStorageKey,
                                                      (checked) => { changeEquipmentDivStyle(equipmentBG = checked); },
                                                      null);

                function addCollapse() {
                    let waitForBtn = setInterval(() => {
                        if (document.getElementById('carding')?.innerText?.indexOf('读取中') < 0 &&
                            document.getElementById('backpacks')?.innerText?.indexOf('读取中') < 0) {

                            let eqbtns = document.querySelectorAll(cardingObjectsQueryString);
                            if (eqbtns?.length > 0) {
                                clearInterval(waitForBtn);

                                let eqstore = document.querySelectorAll(storeObjectsQueryString);
                                eqstore.forEach((item) => {
                                    if (item.className?.split(' ').length > 2 && (item.className.endsWith('fyg_mp3') ||
                                                                                  item.className.endsWith('fyg_mp3 fyg_tc'))) {
                                        item.dataset.instore = 1;
                                    }
                                });

                                eqbtns =
                                    Array.from(eqbtns).concat(
                                    Array.from(document.querySelectorAll(bagObjectsQueryString))
                                         .sort(objectNodeComparer)).concat(
                                    Array.from(eqstore).sort(objectNodeComparer));

                                for (let i = eqbtns.length - 1; i >= 0; i--) {
                                    if (!(eqbtns.className?.split(' ').length > 2 || (eqbtns[i].className?.endsWith('fyg_mp3') ||
                                                                                      eqbtns[i].className?.endsWith('fyg_mp3 fyg_tc')))) {
                                        eqbtns.splice(i, 1);
                                    }
                                }
                                if (!(document.getElementsByClassName('collapsed')?.length > 0)) {
                                    document.getElementById('backpacks')
                                            .insertBefore(equipmentDiv, document.getElementById('backpacks').firstChild.nextSibling);
                                }
                                for (let i = eqbtns.length - 1; i >= 0; i--) {
                                    if (eqbtns[i].className.split(' ')[0] == 'popover') {
                                        eqbtns.splice(i, 1);
                                        break;
                                    }
                                }

                                let ineqBackpackDiv =
                                    '<div class="backpackDiv" style="padding:10px;margin-bottom:10px;"></div>' +
                                    '<div class="storeDiv" style="padding:10px;"></div>';
                                let eqDivs = [ equipmentDiv.querySelector('#eq0'),
                                               equipmentDiv.querySelector('#eq1'),
                                               equipmentDiv.querySelector('#eq2'),
                                               equipmentDiv.querySelector('#eq3'),
                                               equipmentDiv.querySelector('#eq4') ];
                                eqDivs.forEach((item) => { item.innerHTML = ineqBackpackDiv; });
                                let ineq = 0;

                                eqbtns.forEach((btn) => {
                                    if (objectIsEmptyNode(btn)) {
                                        return;
                                    }

                                    let btn0 = document.createElement('button');
                                    btn0.className = `btn btn-light ${g_equipmentLevelTipClass[equipmentGetLevel(btn)]}`;
                                    btn0.style.minWidth = '200px';
                                    btn0.style.marginRight = '5px';
                                    btn0.style.marginBottom = '5px';
                                    btn0.style.padding = '0px';
                                    btn0.style.textAlign = 'left';
                                    btn0.style.boxShadow = 'none';
                                    btn0.style.lineHeight = '150%';
                                    btn0.setAttribute('onclick', btn.getAttribute('onclick'));

                                    let storeText = '';
                                    if (btn.dataset.instore == 1) {
                                        storeText = '【仓】';
                                    }

                                    let enhancements = btn.innerText;
                                    if (enhancements.indexOf('+') < 0) {
                                        enhancements = '';
                                    }

                                    btn0.innerHTML =
                                        `<h3 class="popover-title" style="color:white;background-color: ${btn0.style.borderColor}">
                                         ${storeText}${btn.dataset.originalTitle}${enhancements}</h3>
                                         <div class="popover-content-show" style="padding:10px 10px 0px 10px;">${btn.dataset.content}</div>`;

                                    if (btn0.children[1].lastChild.nodeType == 3) { //清除背景介绍文本
                                        btn0.children[1].lastChild.remove();
                                    }

                                    if (btn.innerText.indexOf('+') >= 0) {
                                        ineq = 4;
                                    }
                                    else {
                                        let a = g_equipments[parseInt(btn.dataset.metaIndex)];
                                        if (a == null) {
                                            let e = equipmentInfoParseNode(btn);
                                            a = g_equipMap.get(e?.[0]);
                                        }
                                        if ((ineq = (a?.type ?? 4)) < 4) {
                                            btn0.className += ' btn-equipment';
                                        }
                                    }

                                    (storeText == '' ? eqDivs[ineq].firstChild : eqDivs[ineq].firstChild.nextSibling).appendChild(btn0);
                                });

                                function inputAmuletGroupName(defaultGroupName) {
                                    let groupName = prompt('请输入护符组名称（不超过31个字符，请仅使用大、小写英文字母、数字、连字符、下划线及中文字符）：',
                                                           defaultGroupName);
                                    if (amuletIsValidGroupName(groupName)) {
                                        return groupName;
                                    }
                                    else if (groupName != null) {
                                        alert('名称不符合命名规则，信息未保存。');
                                    }
                                    return null;
                                }

                                function queryAmulets(bag, store, key) {
                                    let count = 0;
                                    if (bag != null) {
                                        amuletNodesToArray(document.querySelectorAll(bagObjectsQueryString), bag, key);
                                        count += bag.length;
                                    }
                                    if (store != null) {
                                        amuletNodesToArray(document.querySelectorAll(storeObjectsQueryString), store, key);
                                        count += store.length;
                                    }
                                    return count;
                                }

                                function showAmuletGroupsPopup() {
                                    function beginSaveBagAsGroup(groupName, update) {
                                        let amulets = [];
                                        queryAmulets(amulets, null);
                                        createAmuletGroup(groupName, amulets, update);
                                        showAmuletGroupsPopup();
                                    }

                                    genericPopupClose(true);

                                    let bag = [];
                                    let store = [];
                                    if (queryAmulets(bag, store) == 0) {
                                        alert('护符信息加载异常，请检查！');
                                        refreshEquipmentPage(null);
                                        return;
                                    }

                                    let amulets = bag.concat(store);
                                    let bagGroup = amuletCreateGroupFromArray('当前背包', bag);
                                    let groups = amuletLoadGroups();
                                    if (bagGroup == null && groups.count() == 0) {
                                        alert('背包为空，且未找到预保存的护符组信息！');
                                        return;
                                    }

                                    genericPopupSetContent(
                                        '护符组管理',
                                        '<style> .group-menu { position:relative;' +
                                                              'display:inline-block;' +
                                                              'color:blue;' +
                                                              'font-size:20px;' +
                                                              'cursor:pointer; } ' +
                                                '.group-menu-items { display:none;' +
                                                                    'position:absolute;' +
                                                                    'font-size:15px;' +
                                                                    'word-break:keep-all;' +
                                                                    'white-space:nowrap;' +
                                                                    'margin:0 auto;' +
                                                                    'width:fit-content;' +
                                                                    'z-index:999;' +
                                                                    'background-color:white;' +
                                                                    'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                                    'padding:15px 30px; } ' +
                                                '.group-menu-item { } ' +
                                                '.group-menu:hover .group-menu-items { display:block; } ' +
                                                '.group-menu-items .group-menu-item:hover { background-color:#bbddff; } ' +
                                        '</style>' +
                                        '<div id="popup_amulet_groups" style="margin-top:15px;"></div>');
                                    let amuletContainer = genericPopupQuerySelector('#popup_amulet_groups');
                                    let groupMenuDiv = document.createElement('div');
                                    groupMenuDiv.className = 'group-menu-items';
                                    groupMenuDiv.innerHTML = '<ul></ul>';
                                    let groupMenu = groupMenuDiv.firstChild;

                                    if (bagGroup != null) {
                                        let groupDiv = document.createElement('div');
                                        groupDiv.className = g_genericPopupTopLineDivClass;
                                        groupDiv.id = 'popup_amulet_group_bag';
                                        groupDiv.setAttribute('group-name', '当前背包内容');
                                        groupDiv.innerHTML = `<b class="group-menu" style="color:blue;">当前背包内容 [${bagGroup.count()}] ▼</b>`;

                                        let mitem = document.createElement('li');
                                        mitem.className = 'group-menu-item';
                                        mitem.innerHTML = '<a href="#popup_amulet_group_bag">当前背包内容</a>';
                                        groupMenu.appendChild(mitem);

                                        g_amuletTypeNames.slice().reverse().forEach((item) => {
                                            let btn = document.createElement('button');
                                            btn.innerText = '清空' + item;
                                            btn.style.float = 'right';
                                            btn.setAttribute('amulet-key', item);
                                            btn.onclick = clearSpecAmulet;
                                            groupDiv.appendChild(btn);
                                        });

                                        function clearSpecAmulet(e) {
                                            genericPopupShowProgressMessage('处理中，请稍候...');
                                            beginClearBag(document.querySelectorAll(bagObjectsQueryString),
                                                          e.target.getAttribute('amulet-key'),
                                                          refreshEquipmentPage,
                                                          showAmuletGroupsPopup);
                                        }

                                        let saveBagGroupBtn = document.createElement('button');
                                        saveBagGroupBtn.innerText = '保存为护符组';
                                        saveBagGroupBtn.style.float = 'right';
                                        saveBagGroupBtn.onclick = (() => {
                                            let groupName = inputAmuletGroupName('');
                                            if (groupName != null) {
                                                beginSaveBagAsGroup(groupName, false);
                                            }
                                        });
                                        groupDiv.appendChild(saveBagGroupBtn);

                                        let groupInfoDiv = document.createElement('div');
                                        groupInfoDiv.innerHTML =
                                            `<hr><ul style="color:#000080;">${bagGroup.formatBuffSummary('<li>', '</li>', '', true)}</ul>
                                             <hr><ul>${bagGroup.formatItems('<li>', '<li style="color:red;">', '</li>', '</li>', '')}</ul>
                                             <hr><ul><li>AMULET ${bagGroup.formatBuffShortMark(' ', ' ', false)} ENDAMULET</li></ul>`;
                                        groupDiv.appendChild(groupInfoDiv);

                                        amuletContainer.appendChild(groupDiv);
                                    }

                                    let li = 0
                                    let groupArray = groups.toArray();
                                    let gl = (groupArray?.length ?? 0);
                                    if (gl > 0) {
                                        groupArray = groupArray.sort((a, b) => a.name < b.name ? -1 : 1);
                                        for (let i = 0; i < gl; i++) {
                                            let err = !groupArray[i].validate(amulets);

                                            let groupDiv = document.createElement('div');
                                            groupDiv.className = g_genericPopupTopLineDivClass;
                                            groupDiv.id = 'popup_amulet_group_' + i;
                                            groupDiv.setAttribute('group-name', groupArray[i].name);
                                            groupDiv.innerHTML =
                                                `<b class="group-menu" style="color:${err ? "red" : "blue"};">` +
                                                `${groupArray[i].name} [${groupArray[i].count()}] ▼</b>`;

                                            let mitem = document.createElement('li');
                                            mitem.className = 'group-menu-item';
                                            mitem.innerHTML = `<a href="#popup_amulet_group_${i}">${groupArray[i].name}</a>`;
                                            groupMenu.appendChild(mitem);

                                            let amuletDeleteGroupBtn = document.createElement('button');
                                            amuletDeleteGroupBtn.innerText = '删除';
                                            amuletDeleteGroupBtn.style.float = 'right';
                                            amuletDeleteGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                if (confirm(`删除护符组 "${groupName}" 吗？`)) {
                                                    amuletDeleteGroup(groupName);
                                                    showAmuletGroupsPopup();
                                                }
                                            });
                                            groupDiv.appendChild(amuletDeleteGroupBtn);

                                            let amuletModifyGroupBtn = document.createElement('button');
                                            amuletModifyGroupBtn.innerText = '编辑';
                                            amuletModifyGroupBtn.style.float = 'right';
                                            amuletModifyGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                modifyAmuletGroup(groupName);
                                            });
                                            groupDiv.appendChild(amuletModifyGroupBtn);

                                            let importAmuletGroupBtn = document.createElement('button');
                                            importAmuletGroupBtn.innerText = '导入';
                                            importAmuletGroupBtn.style.float = 'right';
                                            importAmuletGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                let persistenceString = prompt('请输入护符组编码（一般由工具软件自动生成，表现形式为一组由逗号分隔的数字序列）');
                                                if (persistenceString != null) {
                                                    let group = new AmuletGroup(`${groupName}${AMULET_STORAGE_GROUPNAME_SEPARATOR}${persistenceString}`);
                                                    if (group.isValid()) {
                                                        let groups = amuletLoadGroups();
                                                        if (groups.add(group)) {
                                                            amuletSaveGroups(groups);
                                                            showAmuletGroupsPopup();
                                                        }
                                                        else {
                                                            alert('保存失败！');
                                                        }
                                                    }
                                                    else {
                                                        alert('输入的护符组编码无效，请检查！');
                                                    }
                                                }
                                            });
                                            groupDiv.appendChild(importAmuletGroupBtn);

                                            let renameAmuletGroupBtn = document.createElement('button');
                                            renameAmuletGroupBtn.innerText = '更名';
                                            renameAmuletGroupBtn.style.float = 'right';
                                            renameAmuletGroupBtn.onclick = ((e) => {
                                                let oldName = e.target.parentNode.getAttribute('group-name');
                                                let groupName = inputAmuletGroupName(oldName);
                                                if (groupName != null && groupName != oldName) {
                                                    let groups = amuletLoadGroups();
                                                    if (!groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                                        if (groups.rename(oldName, groupName)) {
                                                            amuletSaveGroups(groups);
                                                            showAmuletGroupsPopup();
                                                        }
                                                        else {
                                                            alert('更名失败！');
                                                        }
                                                    }
                                                }
                                            });
                                            groupDiv.appendChild(renameAmuletGroupBtn);

                                            let updateAmuletGroupBtn = document.createElement('button');
                                            updateAmuletGroupBtn.innerText = '更新';
                                            updateAmuletGroupBtn.style.float = 'right';
                                            updateAmuletGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                if (confirm(`用当前背包内容替换 "${groupName}" 护符组预定内容吗？`)) {
                                                    beginSaveBagAsGroup(groupName, true);
                                                }
                                            });
                                            groupDiv.appendChild(updateAmuletGroupBtn);

                                            let unamuletLoadGroupBtn = document.createElement('button');
                                            unamuletLoadGroupBtn.innerText = '入仓';
                                            unamuletLoadGroupBtn.style.float = 'right';
                                            unamuletLoadGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                genericPopupShowProgressMessage('卸载中，请稍候...');
                                                beginUnloadAmuletGroupFromBag(
                                                    document.querySelectorAll(bagObjectsQueryString),
                                                    groupName, refreshEquipmentPage, showAmuletGroupsPopup);
                                            });
                                            groupDiv.appendChild(unamuletLoadGroupBtn);

                                            let amuletLoadGroupBtn = document.createElement('button');
                                            amuletLoadGroupBtn.innerText = '装备';
                                            amuletLoadGroupBtn.style.float = 'right';
                                            amuletLoadGroupBtn.onclick = ((e) => {
                                                let groupName = e.target.parentNode.getAttribute('group-name');
                                                genericPopupShowProgressMessage('加载中，请稍候...');
                                                beginLoadAmuletGroupFromStore(
                                                    document.querySelectorAll(storeObjectsQueryString),
                                                    groupName, refreshEquipmentPage, showAmuletGroupsPopup);
                                            });
                                            groupDiv.appendChild(amuletLoadGroupBtn);

                                            let groupInfoDiv = document.createElement('div');
                                            groupInfoDiv.innerHTML =
                                                `<hr><ul style="color:#000080;">${groupArray[i].formatBuffSummary('<li>', '</li>', '', true)}</ul>
                                                 <hr><ul>${groupArray[i].formatItems('<li>', '<li style="color:red;">', '</li>', '</li>', '')}</ul>
                                                 <hr><ul><li>AMULET ${groupArray[i].formatBuffShortMark(' ', ' ', false)} ENDAMULET</li></ul>`;
                                            groupDiv.appendChild(groupInfoDiv);

                                            amuletContainer.appendChild(groupDiv);
                                            li += groupArray[i].getDisplayStringLineCount();
                                        }
                                    }

                                    genericPopupQuerySelectorAll('.group-menu')?.forEach((e) => {
                                        e.appendChild(groupMenuDiv.cloneNode(true));
                                    });

                                    if (bagGroup != null) {
                                        gl++;
                                        li += bagGroup.getDisplayStringLineCount();
                                    }

                                    genericPopupAddButton('新建护符组', 0, modifyAmuletGroup, true);
                                    genericPopupAddButton(
                                        '导入新护符组',
                                        0,
                                        (() => {
                                            let groupName = inputAmuletGroupName('');
                                            if (groupName != null) {
                                                let persistenceString = prompt('请输入护符组编码（一般由工具软件自动生成，表现形式为一组由逗号分隔的数字序列）');
                                                if (persistenceString != null) {
                                                    let group = new AmuletGroup(`${groupName}${AMULET_STORAGE_GROUPNAME_SEPARATOR}${persistenceString}`);
                                                    if (group.isValid()) {
                                                        let groups = amuletLoadGroups();
                                                        if (!groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                                            if (groups.add(group)) {
                                                                amuletSaveGroups(groups);
                                                                showAmuletGroupsPopup();
                                                            }
                                                            else {
                                                                alert('保存失败！');
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        alert('输入的护符组编码无效，请检查！');
                                                    }
                                                }
                                            }
                                        }),
                                        true);
                                    genericPopupAddButton(
                                        '清空背包',
                                        0,
                                        (() => {
                                            genericPopupShowProgressMessage('处理中，请稍候...');
                                            beginClearBag(document.querySelectorAll(bagObjectsQueryString),
                                                          null, refreshEquipmentPage, showAmuletGroupsPopup);
                                        }),
                                        true);
                                    genericPopupAddCloseButton(80);

                                    genericPopupSetContentSize(Math.min((li * 20) + (gl * 160) + 60, Math.max(window.innerHeight - 200, 400)),
                                                               Math.min(1000, Math.max(window.innerWidth - 100, 600)),
                                                               true);
                                    genericPopupShowModal(true);

                                    if (window.getSelection) {
                                        window.getSelection().removeAllRanges();
                                    }
                                    else if (document.getSelection) {
                                        document.getSelection().removeAllRanges();
                                    }
                                }

                                function modifyAmuletGroup(groupName) {
                                    function divHeightAdjustment(div) {
                                        div.style.height = (div.parentNode.offsetHeight - div.offsetTop - 3) + 'px';
                                    }

                                    function refreshAmuletList() {
                                        amuletList.innerHTML = '';
                                        amulets.forEach((am) => {
                                            if (amuletFilter == -1 || am.type == amuletFilter) {
                                                let item = document.createElement('li');
                                                item.setAttribute('original-id', am.id);
                                                item.innerText = am.formatBuffText();
                                                amuletList.appendChild(item);
                                            }
                                        });
                                    }

                                    function refreshGroupAmuletSummary() {
                                        let count = group.count();
                                        if (count > 0) {
                                            groupSummary.innerHTML = group.formatBuffSummary('<li>', '</li>', '', true);
                                            groupSummary.style.display = 'block';
                                        }
                                        else {
                                            groupSummary.style.display = 'none';
                                            groupSummary.innerHTML = '';
                                        }
                                        divHeightAdjustment(groupAmuletList.parentNode);
                                        amuletCount.innerText = count;
                                    }

                                    function refreshGroupAmuletList() {
                                        groupAmuletList.innerHTML = '';
                                        group.items.forEach((am) => {
                                            if (am.id >= 0) {
                                                let item = document.createElement('li');
                                                item.setAttribute('original-id', am.id);
                                                item.innerText = am.formatBuffText();
                                                groupAmuletList.appendChild(item);
                                            }
                                        });
                                    }

                                    function refreshGroupAmuletDiv() {
                                        refreshGroupAmuletSummary();
                                        refreshGroupAmuletList();
                                    }

                                    function moveAmuletItem(e) {
                                        let li = e.target;
                                        if (li.tagName == 'LI') {
                                            let from = li.parentNode;
                                            let id = li.getAttribute('original-id');
                                            from.removeChild(li);
                                            if (from == amuletList) {
                                                let i = searchElement(amulets, id, (a, b) => a - b.id);
                                                let am = amulets[i];
                                                amulets.splice(i, 1);
                                                groupAmuletList.insertBefore(li, groupAmuletList.children.item(group.add(am)));
                                            }
                                            else {
                                                let am = group.removeId(id);
                                                insertElement(amulets, am, (a, b) => a.id - b.id);
                                                if (amuletFilter == -1 || am.type == amuletFilter) {
                                                    for (var item = amuletList.firstChild;
                                                         parseInt(item?.getAttribute('original-id')) <= am.id;
                                                         item = item.nextSibling);
                                                    amuletList.insertBefore(li, item);
                                                }
                                            }
                                            refreshGroupAmuletSummary();
                                            groupChanged = true;
                                        }
                                    }

                                    let bag = [];
                                    let store = [];
                                    if (queryAmulets(bag, store) == 0) {
                                        alert('获取护符信息失败，请检查！');
                                        return;
                                    }
                                    let amulets = bag.concat(store).sort((a, b) => a.compareTo(b));
                                    amulets.forEach((item, index) => { item.id = index; });

                                    let displayName = groupName;
                                    if (!amuletIsValidGroupName(displayName)) {
                                        displayName = '(未命名)';
                                        groupName = null;
                                    }
                                    else if (displayName.length > 20) {
                                        displayName = displayName.slice(0, 19) + '...';
                                    }

                                    let groupChanged = false;
                                    let group = amuletLoadGroup(groupName);
                                    if (!group?.isValid()) {
                                        group = new AmuletGroup(null);
                                        group.name = '(未命名)';
                                        groupName = null;
                                    }
                                    else {
                                        group.validate(amulets);
                                        while (group.removeId(-1) != null) {
                                            groupChanged = true;
                                        }
                                        group.items.forEach((am) => {
                                            let i = searchElement(amulets, am, (a, b) => a.id - b.id);
                                            if (i >= 0) {
                                                amulets.splice(i, 1);
                                            }
                                        });
                                    }

                                    genericPopupClose(true);

                                    let fixedContent =
                                        '<div style="padding:20px 0px 5px 0px;font-size:18px;color:blue;"><b>' +
                                        '<span>双击护符条目以进行添加或移除操作</span><span style="float:right;">共 ' +
                                        '<span id="amulet_count" style="color:#800020;">0</span> 个护符</span></b></div>';
                                    let mainContent =
                                        '<style> ul > li:hover { background-color:#bbddff; } </style>' +
                                        '<div style="display:block;height:100%;width:100%;">' +
                                          '<div style="position:relative;display:block;float:left;height:96%;width:49%;' +
                                               'margin-top:10px;border:1px solid #000000;">' +
                                            '<div id="amulet_filter" style="display:inline-block;width:100%;padding:5px;color:#0000c0;' +
                                                 'font-size:14px;text-align:center;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">' +
                                            '</div>' +
                                            '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                                              '<ul id="amulet_list" style="cursor:pointer;"></ul>' +
                                            '</div>' +
                                          '</div>' +
                                          '<div style="position:relative;display:block;float:right;height:96%;width:49%;' +
                                               'margin-top:10px;border:1px solid #000000;">' +
                                            '<div id="group_summary" style="display:block;width:100%;padding:10px 5px;' +
                                                 'border-bottom:2px groove #d0d0d0;color:#000080;margin-bottom:10px;"></div>' +
                                            '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                                              '<ul id="group_amulet_list" style="cursor:pointer;"></ul>' +
                                            '</div>' +
                                          '</div>' +
                                        '</div>';

                                    genericPopupSetFixedContent(fixedContent);
                                    genericPopupSetContent('编辑护符组 - ' + displayName, mainContent);

                                    let amuletCount = genericPopupQuerySelector('#amulet_count');
                                    let amuletFilter = -1;
                                    let amuletFilterList = genericPopupQuerySelector('#amulet_filter');
                                    let amuletList = genericPopupQuerySelector('#amulet_list');
                                    let groupSummary = genericPopupQuerySelector('#group_summary');
                                    let groupAmuletList = genericPopupQuerySelector('#group_amulet_list');

                                    function addAmuletFilterItem(text, amuletTypesId, checked) {
                                        let check = document.createElement('input');
                                        check.type = 'radio';
                                        check.name = 'amulet-filter';
                                        check.id = 'amulet-type-' + amuletTypesId.toString();
                                        check.setAttribute('amulet-type-id', amuletTypesId);
                                        check.checked = checked;
                                        if (amuletFilterList.firstChild != null) {
                                            check.style.marginLeft = '30px';
                                        }
                                        check.onchange = ((e) => {
                                            if (e.target.checked) {
                                                amuletFilter = e.target.getAttribute('amulet-type-id');
                                                refreshAmuletList();
                                            }
                                        });

                                        let label = document.createElement('label');
                                        label.innerText = text;
                                        label.setAttribute('for', check.id);
                                        label.style.cursor = 'pointer';
                                        label.style.marginLeft = '5px';

                                        amuletFilterList.appendChild(check);
                                        amuletFilterList.appendChild(label);
                                    }

                                    for (let amuletType of g_amuletTypeNames) {
                                        addAmuletFilterItem(amuletType,
                                                            g_amuletTypeIds[amuletType.slice(0, g_amuletTypeIds.end - g_amuletTypeIds.start)],
                                                            false);
                                    }
                                    addAmuletFilterItem('全部', -1, true);

                                    refreshAmuletList();
                                    refreshGroupAmuletDiv();

                                    amuletList.ondblclick = groupAmuletList.ondblclick = moveAmuletItem;

                                    genericPopupAddButton(
                                        '清空护符组',
                                        0,
                                        (() => {
                                            if (group.count() > 0) {
                                                group.items.forEach((am) => { insertElement(amulets, am, (a, b) => a.id - b.id); });
                                                group.clear();

                                                refreshAmuletList();
                                                refreshGroupAmuletDiv();

                                                groupChanged = true;
                                            }
                                        }),
                                        true);

                                    if (amuletIsValidGroupName(groupName)) {
                                        genericPopupAddButton(
                                            '另存为',
                                            80,
                                            (() => {
                                                if (!group.isValid()) {
                                                    alert('护符组内容存在错误，请检查！');
                                                    return;
                                                }

                                                let gn = inputAmuletGroupName(groupName);
                                                if (gn == null) {
                                                    return;
                                                }

                                                let groups = amuletLoadGroups();
                                                if (groups.contains(gn) && !confirm(`护符组 "${gn}" 已存在，要覆盖吗？`)) {
                                                    return;
                                                }

                                                group.name = gn;
                                                if (groups.add(group)) {
                                                    amuletSaveGroups(groups);
                                                    showAmuletGroupsPopup();
                                                }
                                                else {
                                                    alert('保存失败！');
                                                }
                                            }),
                                            false);
                                    }

                                    genericPopupAddButton(
                                        '确认',
                                        80,
                                        (() => {
                                            if (!groupChanged && group.isValid()) {
                                                showAmuletGroupsPopup();
                                                return;
                                            }
                                            else if (!group.isValid()) {
                                                alert('护符组内容存在错误，请检查！');
                                                return;
                                            }

                                            let groups = amuletLoadGroups();
                                            if (!amuletIsValidGroupName(groupName)) {
                                                let gn = inputAmuletGroupName(displayName);
                                                if (gn == null || (groups.contains(gn) && !confirm(`护符组 "${gn}" 已存在，要覆盖吗？`))) {
                                                    return;
                                                }
                                                group.name = gn;
                                            }

                                            if (groups.add(group)) {
                                                amuletSaveGroups(groups);
                                                showAmuletGroupsPopup();
                                            }
                                            else {
                                                alert('保存失败！');
                                            }
                                        }),
                                        false);

                                    genericPopupAddButton(
                                        '取消',
                                        80,
                                        (() => {
                                            if (!groupChanged || confirm('护符组内容已修改，不保存吗？')) {
                                                showAmuletGroupsPopup();
                                            }
                                        }),
                                        false);

                                    genericPopupSetContentSize(Math.min(800, Math.max(window.innerHeight - 200, 500)),
                                                               Math.min(1000, Math.max(window.innerWidth - 100, 600)),
                                                               false);
                                    genericPopupShowModal(false);

                                    divHeightAdjustment(amuletList.parentNode);
                                    divHeightAdjustment(groupAmuletList.parentNode);
                                }

                                function createAmuletGroup(groupName, amulets, update) {
                                    let group = amuletCreateGroupFromArray(groupName, amulets);
                                    if (group != null) {
                                        let groups = amuletLoadGroups();
                                        if (update || !groups.contains(groupName) || confirm(`护符组 "${groupName}" 已存在，要覆盖吗？`)) {
                                            if (groups.add(group)) {
                                                amuletSaveGroups(groups);
                                                genericPopupClose(true);
                                                return true;
                                            }
                                            else {
                                                alert('保存失败！');
                                            }
                                        }
                                    }
                                    else {
                                        alert('保存异常，请检查！');
                                    }
                                    genericPopupClose(true);
                                    return false;
                                }

                                function formatAmuletsString() {
                                    let bag = [];
                                    let store = [];
                                    let exportLines = [];
                                    if (queryAmulets(bag, store) > 0) {
                                        let amulets = bag.concat(store).sort((a, b) => a.compareTo(b));
                                        let amuletIndex = 1;
                                        amulets.forEach((am) => {
                                            exportLines.push(`${('00' + amuletIndex).slice(-3)} - ${am.formatShortMark()}`);
                                            amuletIndex++;
                                        });
                                    }
                                    return (exportLines.length > 0 ? exportLines.join('\n') : '');
                                }

                                function exportAmulets() {
                                    genericPopupSetContent(
                                        '护符导出',
                                        `<b><div id="amulet_export_tip" style="color:#0000c0;padding:15px 0px 10px;">
                                         请勿修改任何导出内容，将其保存为纯文本在其它相应工具中使用</div></b>
                                         <div style="height:330px;"><textarea id="amulet_persistence_string" readonly="true"
                                         style="height:100%;width:100%;resize:none;"></textarea></div>`);

                                    genericPopupAddButton(
                                        '复制导出内容至剪贴板',
                                        0,
                                        ((e) => {
                                            e.target.disabled = 'disabled';
                                            let tipContainer = genericPopupQuerySelector('#amulet_export_tip');
                                            let tipColor = tipContainer.style.color;
                                            let tipString = tipContainer.innerText;
                                            tipContainer.style.color = '#ff0000';
                                            genericPopupQuerySelector('#amulet_persistence_string').select();
                                            if (document.execCommand('copy')) {
                                                tipContainer.innerText = '导出内容已复制到剪贴板';
                                            }
                                            else {
                                                tipContainer.innerText = '复制失败，这可能是因为浏览器没有剪贴板访问权限，请进行手工复制（CTRL+A, CTRL+C）';
                                            }
                                            setTimeout((() => {
                                                tipContainer.style.color = tipColor;
                                                tipContainer.innerText = tipString;
                                                e.target.disabled = '';
                                            }), 3000);
                                        }),
                                        true);
                                    genericPopupAddCloseButton(80);

                                    genericPopupQuerySelector('#amulet_persistence_string').value = formatAmuletsString();

                                    genericPopupSetContentSize(400, 600, false);
                                    genericPopupShowModal(true);
                                }

                                let amuletButtonsGroupContainer = document.getElementById('amulet_management_btn_group');
                                if (amuletButtonsGroupContainer == null) {
                                    amuletButtonsGroupContainer = document.createElement('div');
                                    amuletButtonsGroupContainer.id = 'amulet_management_btn_group';
                                    amuletButtonsGroupContainer.style.width = '100px';
                                    amuletButtonsGroupContainer.style.float = 'right';
                                    document.getElementById('backpacks').children[0].appendChild(amuletButtonsGroupContainer);

                                    let exportAmuletsBtn = document.createElement('button');
                                    exportAmuletsBtn.innerText = '导出护符';
                                    exportAmuletsBtn.style.width = '100%';
                                    exportAmuletsBtn.style.marginBottom = '1px';
                                    exportAmuletsBtn.onclick = (() => {
                                        exportAmulets();
                                    });
                                    amuletButtonsGroupContainer.appendChild(exportAmuletsBtn);

                                    let beginClearBagBtn = document.createElement('button');
                                    beginClearBagBtn.innerText = '清空背包';
                                    beginClearBagBtn.style.width = '100%';
                                    beginClearBagBtn.style.marginBottom = '1px';
                                    beginClearBagBtn.onclick = (() => {
                                        genericPopupShowProgressMessage('处理中，请稍候...');
                                        beginClearBag(
                                            document.querySelectorAll(bagObjectsQueryString),
                                            null, refreshEquipmentPage, () => { genericPopupClose(true, true); });
                                    });
                                    amuletButtonsGroupContainer.appendChild(beginClearBagBtn);

                                    let amuletSaveGroupBtn = document.createElement('button');
                                    amuletSaveGroupBtn.innerText = '存为护符组';
                                    amuletSaveGroupBtn.style.width = '100%';
                                    amuletSaveGroupBtn.style.marginBottom = '1px';
                                    amuletSaveGroupBtn.onclick = (() => {
                                        let groupName = inputAmuletGroupName('');
                                        if (groupName != null) {
                                            let amulets = [];
                                            if (queryAmulets(amulets, null) == 0) {
                                                alert('保存失败，请检查背包内容！');
                                            }
                                            else if (createAmuletGroup(groupName, amulets, false)) {
                                                alert('保存成功。');
                                            }
                                        }
                                    });
                                    amuletButtonsGroupContainer.appendChild(amuletSaveGroupBtn);

                                    let manageAmuletGroupBtn = document.createElement('button');
                                    manageAmuletGroupBtn.innerText = '管理护符组';
                                    manageAmuletGroupBtn.style.width = '100%';
                                    manageAmuletGroupBtn.style.marginBottom = '1px';
                                    manageAmuletGroupBtn.onclick = (() => {
                                        genericPopupInitialize();
                                        showAmuletGroupsPopup();
                                    });
                                    amuletButtonsGroupContainer.appendChild(manageAmuletGroupBtn);

                                    let clearAmuletGroupBtn = document.createElement('button');
                                    clearAmuletGroupBtn.innerText = '清除护符组';
                                    clearAmuletGroupBtn.style.width = '100%';
                                    clearAmuletGroupBtn.onclick = (() => {
                                        if (confirm('要删除全部已保存的护符组信息吗？')) {
                                            amuletClearGroups();
                                            alert('已删除全部预定义护符组信息。');
                                        }
                                    });
                                    amuletButtonsGroupContainer.appendChild(clearAmuletGroupBtn);

                                    document.getElementById(storeButtonId).onclick = (() => {
                                        if ($(storeQueryString).css('display') == 'none') {
                                            $(storeQueryString).show();
                                        } else {
                                            $(storeQueryString).hide();
                                        }
                                        backupEquipmentDivState({ target : document.getElementById(storeButtonId) });
                                    });
                                }

                                $('#equipmentDiv .btn-equipment .bg-danger.with-padding').css({
                                    'max-width': '200px',
                                    'padding': '5px 5px 5px 5px',
                                    'white-space': 'pre-line',
                                    'word-break': 'break-all'
                                });

                                collapseEquipmentDiv(equipmentExpand, forceEquipDivOperation);
                                changeEquipmentDivStyle(equipmentBG);
                                switchObjectContainerStatus(!equipmentStoreExpand);

                                forceEquipDivOperation = false;
                            }
                        }
                    }, 500);
                }

                const g_genCalcCfgPopupLinkId = 'gen_calc_cfg_popup_link';
                const g_bindingPopupLinkId = 'binding_popup_link';
                const g_cardOnekeyLinkId = 'card_one_key_link';
                const g_bindingSolutionId = 'binding_solution_div';
                const g_bindingListSelectorId = 'binding_list_selector';
                const g_equipOnekeyLinkId = 'equip_one_key_link';

                function switchCardTemporarily(roleId) {
                    let role = g_roleMap.get(roleId);
                    if (role == undefined) {
                        return;
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('正在切换，请稍候...');

                    const upcard_data = getPostData(/upcard\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);
                    const halosave_data = getPostData(/halosave\(\)\{[\s\S]*\}/m, /data: ".*\+savearr\+.*"/).slice(7, -1);

                    let roleInfo = [];
                    let haloInfo = [];
                    beginReadRoleAndHalo(roleInfo, haloInfo, switchToTempCard, null);

                    function switchCardCompletion() {
                        genericPopupClose();
                        window.location.reload();
                    }

                    function switchToTempCard() {
                        if (roleInfo.length == 2 && haloInfo.length == 3) {
                            const infoHTML =
                                  `<div style="display:block;width:100%;color:#0000c0;text-align:center;font-size:20px;padding-top:50px;"><b>
                                   <p></p><span style="width:100%;">当前卡片已经由 [ ${roleInfo[1]} ] 临时切换至 ` +
                                  `[ ${g_roleMap.get(roleId)?.name ?? 'UNKNOW'} ]</span><br><br>
                                   <p></p><span style="width:100%;">请切换至搜刮页面尽快完成搜刮操作</span><br><br>
                                   <p></p><span style="width:100%;">并返回本页面点击“恢复”按钮以恢复之前的卡片和光环设置</span></b></div>`;
                            genericPopupSetContent(`临时装备卡片 [ ${g_roleMap.get(roleId)?.name ?? 'UNKNOW'} ]`, infoHTML);
                            genericPopupSetContentSize(300, 600, false);
                            genericPopupAddButton('恢复', 80, restoreCardAndHalo, false);

                            switchCard(roleId, null, genericPopupShowModal, false);
                        }
                        else {
                            alert('无法读取当前装备卡片和光环信息，卡片未切换！');
                            switchCardCompletion();
                        }
                    }

                    function restoreCardAndHalo() {
                        genericPopupShowProgressMessage('正在恢复，请稍候...');
                        switchCard(roleInfo[0], haloInfo[2], switchCardCompletion, null);
                    }

                    function switchCard(newRoleId, newHaloArray, fnFurtherProcess, fnParams) {
                        let cardData = upcard_data.replace('"+id+"', newRoleId);
                        GM_xmlhttpRequest({
                            method: g_postMethod,
                            url: g_postUrl,
                            headers: g_postHeader,
                            data: cardData,
                            onload: response => {
                                if (response.responseText == 'ok' || response.responseText == '你没有这张卡片或已经装备中') {
                                    if (newHaloArray?.length > 0) {
                                        let haloData = halosave_data.replace('"+savearr+"', newHaloArray.join());
                                        GM_xmlhttpRequest({
                                            method: g_postMethod,
                                            url: g_postUrl,
                                            headers: g_postHeader,
                                            data: haloData,
                                            onload: response => {
                                                if (fnFurtherProcess != null) {
                                                    fnFurtherProcess(fnParams);
                                                }
                                            }
                                        });
                                        return;
                                    }
                                }
                                else {
                                    alert('无法完成卡片和光环切换，请尝试手动进行！');
                                    switchCardCompletion();
                                    return;
                                }
                                if (fnFurtherProcess != null) {
                                    fnFurtherProcess(fnParams);
                                }
                            }
                        });
                    }
                }

                function equipOnekey() {
                    const upcard_data = getPostData(/upcard\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);
                    const halosave_data = getPostData(/halosave\(\)\{[\s\S]*\}/m, /data: ".*\+savearr\+.*"/).slice(7, -1);
                    const puton_data = getPostData(/puton\(id\)\{[\s\S]*\}/m, /data: ".*\+id\+.*"/).slice(7, -1);

                    function roleSetupCompletion() {
                        httpRequestClearAll();
                        genericPopupClose();
                        window.location.reload();
                    }

                    function checkForRoleSetupCompletion() {
                        if (genericPopupTaskCheckCompletion()) {
                            // delay for the final state can be seen
                            genericPopupTaskSetState(0);
                            genericPopupTaskSetState(1);
                            genericPopupTaskSetState(2);
                            genericPopupTaskSetState(3);
                            setTimeout(roleSetupCompletion, 200);
                        }
                    }

                    function amuletLoadCompletion() {
                        genericPopupTaskComplete(3);
                        checkForRoleSetupCompletion();
                    }

                    let scheduledObjects = { equips : [] , amulets : [] , exchanged : [] };
                    function beginBagRestore() {
                        if (scheduledObjects.equips.length == 0 && scheduledObjects.amulets.length == 0) {
                            amuletLoadCompletion();
                        }
                        else {
                            beginRestoreObjects(null, scheduledObjects.amulets, scheduledObjects.equips, amuletLoadCompletion, null);
                        }
                    }

                    function beginUnloadExchangedEquipments(bag) {
                        beginMoveObjects(findEquipmentIds(bag, scheduledObjects.exchanged),
                                         g_object_move_path.bag2store,
                                         beginBagRestore,
                                         null);
                    }

                    function beginAmuletLoadGroups() {
                        if (amuletGroupsToLoad?.length > 0) {
                            genericPopupTaskSetState(2);
                            genericPopupTaskSetState(3, `- 加载护符...（${amuletGroupsToLoad?.length}）`);
                            beginLoadAmuletGroupFromStore(null, amuletGroupsToLoad.shift(), beginAmuletLoadGroups, null);
                        }
                        else {
                            amuletLoadCompletion();
                        }
                    }

                    function beginLoadAmulets() {
                        genericPopupTaskSetState(2);
                        genericPopupTaskComplete(2, equipmentOperationError > 0);

                        if (amuletGroupsToLoad != null) {
                            genericPopupTaskSetState(2, '- 清理装备...');
                            beginClearBag(null, null, beginAmuletLoadGroups, null);
                        }
                        else {
                            genericPopupTaskSetState(2, '- 恢复背包...');
                            if (scheduledObjects.exchanged.length > 0) {
                                beginReadObjects(originalBag = [], null, beginUnloadExchangedEquipments, originalBag);
                            }
                            else {
                                beginBagRestore();
                            }
                        }
                    }

                    let equipmentOperationError = 0;
                    let putonRequestsCount;
                    function putonEquipments(objects, fnFurtherProcess, fnParams) {
                        if (objects?.length > 0) {
                            let ids = [];
                            while (ids.length < g_maxConcurrentRequests && objects.length > 0) {
                                ids.push(objects.pop());
                            }
                            if ((putonRequestsCount = ids.length) > 0) {
                                while (ids.length > 0) {
                                    let request = GM_xmlhttpRequest({
                                        method: g_postMethod,
                                        url: g_postUrl,
                                        headers: g_postHeader,
                                        data: puton_data.replace('"+id+"', ids.shift()),
                                        onload: response => {
                                            if (response.responseText != 'ok') {
                                                equipmentOperationError++;
                                                console.log(response.responseText);
                                            }
                                            if (--putonRequestsCount == 0) {
                                                putonEquipments(objects, fnFurtherProcess, fnParams);
                                            }
                                        }
                                    });
                                    httpRequestRegister(request);
                                }
                                return;
                            }
                        }
                        if (fnFurtherProcess != null) {
                            fnFurtherProcess(fnParams);
                        }
                    }

                    let originalBag, originalStore;
                    let currentEquipments = equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString));
                    function beginPutonEquipments(bindInfo) {
                        genericPopupTaskSetState(2, '- 检查装备...');
                        let equipsToPuton = [];
                        for (let i = 0; i < 4; i++) {
                            let equipInfo = bindInfo[i].split(',');
                            equipInfo.push(-1);
                            if (equipmentInfoComparer(equipInfo, currentEquipments[i]) != 0) {
                                equipsToPuton.push(equipInfo);
                            }
                        }
                        if (equipsToPuton.length == 0) {
                            beginLoadAmulets();
                        }
                        else if (!(originalBag?.length > 0)) {
                            beginReadObjects(originalBag = [], originalStore = [], scheduleEquipments, null);
                        }

                        function scheduleEquipments() {
                            function rescheduleEquipments() {
                                genericPopupTaskSetState(2, '- 检查装备...');
                                beginReadObjects(originalBag = [], originalStore = [], scheduleEquipments, null);
                            }

                            let eqs = equipsToPuton.slice();
                            let eqsInBag = findEquipmentIds(originalBag, eqs);
                            if (eqsInBag.length == equipsToPuton.length) {
                                genericPopupTaskSetState(2, `- 穿戴装备...（${eqsInBag.length}）`);
                                putonEquipments(eqsInBag, beginLoadAmulets, null);
                                return;
                            }

                            for (let i = eqs.length - 1; i >= 0; i--) {
                                scheduledObjects.exchanged.push(currentEquipments[g_equipMap.get(eqs[i][0]).type]);
                            }

                            let eqsInStore = findEquipmentIds(originalStore, eqs);
                            if (eqs.length > 0) {
                                console.log(eqs);
                                alert('有装备不存在，请重新检查绑定！');
                                window.location.reload();
                                return;
                            }

                            let ids = [];
                            let freeCellsNeeded = eqsInStore.length;
                            for (let i = originalBag.length - 1; i >= 0; i--) {
                                if (objectIsEmptyNode(originalBag[i])) {
                                    if (--freeCellsNeeded == 0) {
                                        genericPopupTaskSetState(2, `- 取出仓库...（${eqsInStore.length}）`);
                                        beginMoveObjects(eqsInStore, g_object_move_path.store2bag, rescheduleEquipments, null);
                                        return;
                                    }
                                }
                                else {
                                    let e = equipmentInfoParseNode(originalBag[i])
                                    if (e != null) {
                                        scheduledObjects.equips.push(e);
                                        ids.unshift(parseInt(e[7]));
                                    }
                                    else if ((e = (new Amulet()).fromNode(originalBag[i]))?.isValid()) {
                                        scheduledObjects.amulets.push(e);
                                        ids.unshift(e.id);
                                    }
                                    else {
                                        continue;
                                    }
                                    if (--freeCellsNeeded == 0) {
                                        genericPopupTaskSetState(2, `- 调整空间...（${ids.length}）`);
                                        beginMoveObjects(ids, g_object_move_path.bag2store, rescheduleEquipments, null);
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    function beginSetupHalo(bindInfo) {
                        let halo = [];
                        if (bindInfo.length > 4) {
                            bindInfo[4].split(',').forEach((item) => {
                                let hid = g_haloMap.get(item.trim())?.id;
                                if (hid > 0) {
                                    halo.push(hid);
                                }
                            });
                            if ((halo = halo.join(','))?.length > 0) {
                                genericPopupTaskSetState(1, '- 设置光环...');
                                let request = GM_xmlhttpRequest({
                                    method: g_postMethod,
                                    url: g_postUrl,
                                    headers: g_postHeader,
                                    data: halosave_data.replace('"+savearr+"', halo),
                                    onload: response => {
                                        genericPopupTaskSetState(1);
                                        genericPopupTaskComplete(1, response.responseText != 'ok');
                                        checkForRoleSetupCompletion();
                                    }
                                });
                                httpRequestRegister(request);
                                return;
                            }
                        }
                        genericPopupTaskComplete(1);
                        checkForRoleSetupCompletion();
                    }

                    let amuletGroupsToLoad = null;
                    function beginRoleSetup(bindInfo) {
                        beginSetupHalo(bindInfo);

                        if (bindInfo[5]?.length > 0) {
                            amuletGroupsToLoad = bindInfo[5].split(',');
                            genericPopupTaskSetState(2, '- 清理背包...');
                            beginClearBag(null, null, beginPutonEquipments, bindInfo);
                        }
                        else {
                            beginPutonEquipments(bindInfo);
                        }
                    }

                    let bindingElements = document.getElementById(g_bindingListSelectorId)?.value?.split(BINDING_NAME_SEPARATOR);
                    if (bindingElements?.length == 2) {
                        function equipOnekeyQuit() {
                            httpRequestAbortAll();
                            roleSetupCompletion();
                        }

                        genericPopupInitialize();
                        genericPopupTaskListPopupSetup('切换中...', 300, [ '卡片', '光环', '装备', '护符' ], equipOnekeyQuit);
                        genericPopupShowModal(false);

                        let roleId = g_roleMap.get(bindingElements[0].trim()).id;
                        let bindInfo = bindingElements[1].trim().split(BINDING_ELEMENT_SEPARATOR)
                        if (roleId == g_roleMap.get(document.getElementById('carding')
                                                           ?.querySelector('div.text-info.fyg_f24.fyg_lh60')
                                                           ?.children[0]?.innerText)?.id) {
                            genericPopupTaskComplete(0);
                            beginRoleSetup(bindInfo);
                        }
                        else {
                            genericPopupTaskSetState(0, '- 装备中...');
                            GM_xmlhttpRequest({
                                method: g_postMethod,
                                url: g_postUrl,
                                headers: g_postHeader,
                                data: upcard_data.replace('"+id+"', roleId),
                                onload: response => {
                                    genericPopupTaskSetState(0);
                                    if (response.responseText == 'ok' || response.responseText == '你没有这张卡片或已经装备中') {
                                        genericPopupTaskComplete(0);
                                        beginRoleSetup(bindInfo);
                                    }
                                    else {
                                        genericPopupTaskComplete(0, true);
                                        alert('卡片装备失败！');
                                        equipOnekeyQuit();
                                    }
                                }
                            });
                        }
                    }
                    else {
                        alert('绑定信息读取失败，无法装备！');
                    }
                }

                const BINDING_NAME_DEFAULT = '(未命名)';
                const BINDING_SEPARATOR = ';';
                const BINDING_NAME_SEPARATOR = '=';
                const BINDING_ELEMENT_SEPARATOR = '|';

                function showBindingPopup() {
                    let role = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                    let cardInfos = document.querySelector('#backpacks').querySelectorAll('.icon.icon-angle-down.text-primary');
                    let roleLv = cardInfos[0].innerText.match(/\d+/)[0];
                    let roleQl = cardInfos[1].innerText.match(/\d+/)[0];
                    let roleHs = cardInfos[2].innerText.match(/\d+/)[0];
                    let roleGv = (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0');
                    let rolePt = [];
                    for (let i = 1; i <= 6; i++) {
                        rolePt.push(document.getElementById('sjj' + i).innerText);
                    }
                    if (role == undefined || roleLv == undefined || roleQl == undefined || roleHs == undefined) {
                        alert('读取卡片信息失败，无法执行绑定操作！');
                        return;
                    }

                    let bind_info = null;
                    let udata = loadUserConfigData();
                    if (udata.dataBind[role.id] != null) {
                        bind_info = udata.dataBind[role.id];
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('读取中，请稍候...');

                    const highlightBackgroundColor = '#80c0f0';
                    const fixedContent =
                        '<style> .binding-list  { position:relative; width:100%; display:inline-block; } ' +
                                '.binding-names { display:none;' +
                                                 'position:absolute;' +
                                                 'word-break:keep-all;' +
                                                 'white-space:nowrap;' +
                                                 'margin:0 auto;' +
                                                 'width:100%;' +
                                                 'z-index:999;' +
                                                 'background-color:white;' +
                                                 'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                 'padding:10px 20px; } '+
                                '.binding-name  { cursor:pointer; } ' +
                                '.binding-list:hover .binding-names { display:block; } ' +
                                '.binding-list:focus-within .binding-names { display:block; } ' +
                                '.binding-names .binding-name:hover { background-color:#bbddff; } </style>' +
                        `<div style="width:100%;color:#0000ff;padding:20px 10px 5px 0px;"><b>绑定方案名称` +
                        `（不超过31个字符，请仅使用大、小写英文字母、数字、连字符、下划线及中文字符）：` +
                        `<span id="${g_genericPopupInformationTipsId}" style="float:right;color:red;"></span></b></div>
                         <div style="width:100%;padding:0px 10px 20px 0px;"><div class="binding-list">
                         <input type="text" id="binding_name" style="display:inline-block;width:100%;" maxlength="31" />
                         <div class="binding-names" id="binding_list"><ul></ul></div></div></div>`;
                    const mainContent =
                        `<style> .equipment_label    { display:inline-block; width:15%; }
                                 .equipment_selector { display:inline-block; width:84%; color:#145ccd; float:right; }
                                  ul > li { cursor:pointer; } </style>
                         <div class="${g_genericPopupTopLineDivClass}" id="role_export_div" style="display:none;">
                         <div style="height:200px;">
                              <textarea id="role_export_string" readonly="true" style="height:100%;width:100%;resize:none;"></textarea></div>
                         <div style="padding:10px 0px 20px 0px;">
                              <button type="button" style="float:right;margin-left:1px;" id="hide_export_div">隐藏</button>
                              <button type="button" style="float:right;" id="copy_export_string">复制导出内容至剪贴板</button></div></div>
                         <div class="${g_genericPopupTopLineDivClass}">
                             <span class="equipment_label">武器装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">手臂装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">身体装备：</span><select class="equipment_selector"></select><br><br>
                             <span class="equipment_label">头部装备：</span><select class="equipment_selector"></select><br></div>
                         <div class="${g_genericPopupTopLineDivClass}" style="display:flex;position:relative;"><div id="halo_selector"></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id="amulet_selector" style="display:block;"><div></div></div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent(`${role.name} - ${roleLv} 级`, mainContent);

                    let eq_selectors = genericPopupQuerySelectorAll('select.equipment_selector');
                    let asyncOperations = 3;
                    let haloMax = 0;
                    let haloGroupItemMax = 0;

                    let bag, store;
                    beginReadObjects(
                        bag = [],
                        store = [],
                        () => {
                            let equipment = equipmentNodesToInfoArray(bag);
                            equipmentNodesToInfoArray(store, equipment);
                            equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString), equipment);

                            equipment.sort((e1, e2) => {
                                if (e1[0] != e2[0]) {
                                    return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                                }
                                return -equipmentInfoComparer(e1, e2);
                            });

                            equipment.forEach((item) => {
                                let eqMeta = g_equipMap.get(item[0]);
                                let lv = equipmentGetLevel(item);
                                let op = document.createElement('option');
                                op.style.backgroundColor = g_equipmentLevelBGColor[lv];
                                op.innerText =
                                    `${eqMeta.alias} Lv.${item[1]} - ${item[2]}% ${item[3]}% ` +
                                    `${item[4]}% ${item[5]}% ${item[6] == 1 ? ' - [ 神秘 ]' : ''}`;
                                op.title =
                                    `Lv.${item[1]} - ${item[6] == 1 ? '神秘' : ''}${g_equipmentLevelName[lv]}装备\n` +
                                    `${formatEquipmentAttributes(item, '\n')}`;
                                op.value = item.slice(0, -1).join(',');
                                eq_selectors[eqMeta.type].appendChild(op);
                            });

                            eq_selectors.forEach((eqs) => {
                                eqs.onchange = equipSelectionChange;
                                equipSelectionChange({ target : eqs });
                            });
                            function equipSelectionChange(e) {
                                for (var op = e.target.firstChild; op != null && op.value != e.target.value; op = op.nextSibling);
                                e.target.title = (op?.title ?? '');
                                e.target.style.backgroundColor = (op?.style.backgroundColor ?? 'white');
                            }
                            asyncOperations--;
                        },
                        null);

                    let currentHalo;
                    beginReadRoleAndHalo(
                        null,
                        currentHalo = [],
                        () => {
                            haloMax = currentHalo[0];
                            let haloInfo =
                                `天赋点：<span style="color:#0000c0;"><span id="halo_points">0</span> / ${haloMax}</span>，
                                 技能位：<span style="color:#0000c0;"><span id="halo_slots">0</span> / ${roleHs}</span>`;
                            let haloSelector = genericPopupQuerySelector('#halo_selector');
                            haloSelector.innerHTML =
                                `<style> .halo_group { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                         div > a { display:inline-block; width:90px; } </style>
                                 <div>${haloInfo}</div>
                                 <p></p>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group" style="border-right:1px solid grey;"></div>`;
                            let haloGroups = haloSelector.querySelectorAll('.halo_group');
                            let group = -1;
                            let points = -1;
                            g_halos.forEach((item) => {
                                if (item.points != points) {
                                    points = item.points;
                                    group++;
                                }
                                let a = document.createElement('a');
                                a.href = '#';
                                a.className = 'halo_item';
                                a.innerText = item.name + ' ' + item.points;
                                haloGroups[group].appendChild(a);
                                if (haloGroups[group].children.length > haloGroupItemMax) {
                                    haloGroupItemMax = haloGroups[group].children.length;
                                }
                            });

                            function selector_halo() {
                                let hp = parseInt(haloPoints.innerText);
                                let hs = parseInt(haloSlots.innerText);
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                    hp += parseInt($(this).text().split(' ')[1]);
                                    hs++;
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                    hp -= parseInt($(this).text().split(' ')[1]);
                                    hs--;
                                }
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }

                            haloPoints = genericPopupQuerySelector('#halo_points');
                            haloSlots = genericPopupQuerySelector('#halo_slots');
                            $('.halo_item').each(function(i, e) {
                                $(e).on('click', selector_halo);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });
                            asyncOperations--;
                        },
                        null);

                    let wishpool;
                    beginReadWishpool(
                        wishpool = [],
                        null,
                        () => {
                            wishpool = wishpool.slice(-7);
                            asyncOperations--;
                        },
                        null);

                    function collectBindingInfo() {
                        let halo = [];
                        let sum = 0;
                        $('.halo_item').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                let ee = e.innerText.split(' ');
                                sum += parseInt(ee[1]);
                                halo.push($(e).attr('original-item'));
                            }
                        });
                        let h = parseInt(haloMax);
                        if (sum <= h && halo.length <= parseInt(roleHs)) {
                            let roleInfo = [ role.shortMark, roleLv, roleHs, roleQl ];
                            if (role.hasG) {
                                roleInfo.splice(1, 0, 'G=' + roleGv);
                            }

                            let amuletArray = [];
                            $('.amulet_item').each(function(i, e) {
                                if ($(e).attr('item-selected') == 1) {
                                    amuletArray[parseInt(e.lastChild.innerText) - 1] = ($(e).attr('original-item'));
                                }
                            });

                            let eqs = [];
                            eq_selectors.forEach((eq) => { eqs.push(eq.value); });

                            return [ roleInfo, wishpool, amuletArray, rolePt, eqs, halo ];
                        }
                        return null;
                    }

                    function generateExportString() {
                        let info = collectBindingInfo();
                        if (info?.length > 0) {
                            let exp = [ info[0].join(' '), 'WISH ' + info[1].join(' ') ];

                            let ag = new AmuletGroup();
                            ag.name = 'export-temp';
                            info[2].forEach((gn) => {
                                ag.merge(amuletGroups.get(gn));
                            });
                            if (ag.isValid()) {
                                exp.push(`AMULET ${ag.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                            }

                            exp.push(info[3].join(' '));

                            info[4].forEach((eq) => {
                                exp.push(eq.replaceAll(',', ' '));
                            });

                            let halo = [ info[5].length ];
                            info[5].forEach((h) => {
                                halo.push(g_haloMap.get(h).shortMark);
                            });
                            exp.push(halo.join(' '));

                            return exp.join('\n') + '\n';
                        }
                        else {
                            alert('有装备未选或光环天赋选择错误！');
                        }
                        return null;
                    }

                    function unbindAll() {
                        if (confirm('这将清除本卡片全部绑定方案，继续吗？')) {
                            let udata = loadUserConfigData();
                            if (udata.dataBind[role.id] != null) {
                                delete udata.dataBind[role.id];
                            }
                            saveUserConfigData(udata);
                            bindingName.value = BINDING_NAME_DEFAULT;
                            bindingList.innerHTML = '';
                            refreshBindingSelector(role.id);
                            genericPopupShowInformationTips('解除全部绑定成功', 5000);
                        }
                    };

                    function deleteBinding() {
                        if (validateBindingName()) {
                            bindings = [];
                            let found = false;
                            $('.binding-name').each((index, item) => {
                                if (item.innerText == bindingName.value) {
                                    bindingList.removeChild(item);
                                    found = true;
                                }
                                else {
                                    bindings.push(`${item.innerText}${BINDING_NAME_SEPARATOR}${item.getAttribute('original-item')}`);
                                }
                            });
                            if (found) {
                                let bn = bindingName.value;
                                let bi = null;
                                let udata = loadUserConfigData();
                                if (bindings.length > 0) {
                                    udata.dataBind[role.id] = bindings.join(BINDING_SEPARATOR);
                                    bindingName.value = bindingList.children[0].innerText;
                                    bi = bindingList.children[0].getAttribute('original-item');
                                }
                                else if(udata.dataBind[role.id] != null) {
                                    delete udata.dataBind[role.id];
                                    bindingName.value = BINDING_NAME_DEFAULT;
                                }
                                saveUserConfigData(udata);
                                refreshBindingSelector(role.id);
                                representBinding(bi);
                                genericPopupShowInformationTips(bn + '：解绑成功', 5000);
                            }
                            else {
                                alert('方案名称未找到！');
                            }
                        }
                    };

                    function saveBinding() {
                        if (validateBindingName()) {
                            let info = collectBindingInfo();
                            if (info?.length > 0) {
                                let bind_info = [ info[4][0], info[4][1], info[4][2], info[4][3],
                                                  info[5].join(','), info[2].join(',') ].join(BINDING_ELEMENT_SEPARATOR);
                                let newBinding = true;
                                bindings = [];
                                $('.binding-name').each((index, item) => {
                                    if (item.innerText == bindingName.value) {
                                        item.setAttribute('original-item', bind_info);
                                        newBinding = false;
                                    }
                                    bindings.push(`${item.innerText}${BINDING_NAME_SEPARATOR}${item.getAttribute('original-item')}`);
                                });
                                if (newBinding) {
                                    let li = document.createElement('li');
                                    li.className = 'binding-name';
                                    li.innerText = bindingName.value;
                                    li.setAttribute('original-item', bind_info);
                                    for (var li0 = bindingList.firstChild; li0?.innerText < li.innerText; li0 = li0.nextSibling);
                                    bindingList.insertBefore(li, li0);
                                    bindings.push(`${bindingName.value}${BINDING_NAME_SEPARATOR}${bind_info}`);
                                }

                                let udata = loadUserConfigData();
                                udata.dataBind[role.id] = bindings.join(BINDING_SEPARATOR);
                                saveUserConfigData(udata);
                                refreshBindingSelector(role.id);
                                genericPopupShowInformationTips(bindingName.value + '：绑定成功', 5000);
                            }
                            else {
                                alert('有装备未选或光环天赋选择错误！');
                            }
                        }
                    }

                    function isValidBindingName(bindingName) {
                        return (bindingName?.length > 0 && bindingName.length < 32 && bindingName.search(USER_STORAGE_RESERVED_SEPARATORS) < 0);
                    }

                    function validateBindingName() {
                        let valid = isValidBindingName(bindingName.value);
                        genericPopupShowInformationTips(valid ? null : '方案名称不符合规则，请检查');
                        return valid;
                    }

                    function validateBinding() {
                        if (validateBindingName) {
                            let ol = bindingList.children.length;
                            for (let i = 0; i < ol; i++) {
                                if (bindingName.value == bindingList.children[i].innerText) {
                                    representBinding(bindingList.children[i].getAttribute('original-item'));
                                    break;
                                }
                            }
                        }
                    }

                    function representBinding(items) {
                        if (items?.length > 0) {
                            let elements = items.split(BINDING_ELEMENT_SEPARATOR);
                            if (elements.length > 3) {
                                let v = elements.slice(0, 4);
                                eq_selectors.forEach((eqs) => {
                                    for (let op of eqs.childNodes) {
                                        if (v.indexOf(op.value) >= 0) {
                                            eqs.value = op.value;
                                            break;
                                        }
                                    }
                                    eqs.onchange({ target : eqs });
                                });
                            }
                            if (elements.length > 4) {
                                let hp = 0;
                                let hs = 0;
                                let v = elements[4].split(',');
                                $('.halo_item').each((index, item) => {
                                    let s = (v.indexOf($(item).attr('original-item')) < 0 ? 0 : 1);
                                    $(item).attr('item-selected', s);
                                    $(item).css('background-color', s == 0 ? g_genericPopupBackgroundColor : highlightBackgroundColor);
                                    hp += (s == 0 ? 0 : parseInt($(item).text().split(' ')[1]));
                                    hs += s;
                                });
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }
                            selectedAmuletGroupCount = 0;
                            if (elements.length > 5 && amuletCount != null) {
                                let ac = 0;
                                let v = elements[5].split(',');
                                $('.amulet_item').each((index, item) => {
                                    let j = v.indexOf($(item).attr('original-item'));
                                    let s = (j < 0 ? 0 : 1);
                                    $(item).attr('item-selected', s);
                                    $(item).css('background-color', s == 0 ? g_genericPopupBackgroundColor : highlightBackgroundColor);
                                    item.lastChild.innerText = (j < 0 ? '' : j + 1);
                                    selectedAmuletGroupCount += s;
                                    ac += (s == 0 ? 0 : parseInt($(item).text().match(/\[(\d+)\]/)[1]));
                                });
                                amuletCount.innerText = ac;
                            }
                        }
                    }

                    function selector_amulet() {
                        let ac = parseInt(amuletCount.innerText);
                        let tc = parseInt($(this).text().match(/\[(\d+)\]/)[1]);
                        if ($(this).attr('item-selected') != 1) {
                            $(this).attr('item-selected', 1);
                            $(this).css('background-color', highlightBackgroundColor);
                            this.lastChild.innerText = ++selectedAmuletGroupCount;
                            ac += tc;
                        }
                        else {
                            $(this).attr('item-selected', 0);
                            $(this).css('background-color', g_genericPopupBackgroundColor);
                            let i = parseInt(this.lastChild.innerText);
                            this.lastChild.innerText = '';
                            ac -= tc;
                            if (i < selectedAmuletGroupCount) {
                                $('.amulet_item').each((index, item) => {
                                    var j;
                                    if ($(item).attr('item-selected') == 1 && (j = parseInt(item.lastChild.innerText)) > i) {
                                        item.lastChild.innerText = j - 1;
                                    }
                                });
                            }
                            selectedAmuletGroupCount--;
                        }
                        amuletCount.innerText = ac;
                    }

                    let bindingList = genericPopupQuerySelector('#binding_list').firstChild;
                    let bindingName = genericPopupQuerySelector('#binding_name');
                    let haloPoints = null;
                    let haloSlots = null;
                    let amuletContainer = genericPopupQuerySelector('#amulet_selector').firstChild;
                    let amuletCount = null;
                    let amuletGroups = amuletLoadGroups();
                    let selectedAmuletGroupCount = 0;

                    let amuletGroupCount = (amuletGroups?.count() ?? 0);
                    if (amuletGroupCount > 0) {
                        amuletContainer.innerHTML =
                            '护符组：已选定 <span id="amulet_count">0</span> 个护符' +
                            '<span style="float:right;margin-right:5px;">加载顺序</span><p /><ul></ul>';
                        amuletCount = genericPopupQuerySelector('#amulet_count');
                        amuletCount.style.color = '#0000c0';
                        let amuletArray = amuletGroups.toArray().sort((a, b) => a.name < b.name ? -1 : 1);
                        let amuletGroupContainer = amuletContainer.lastChild;
                        for (let i = 0; i < amuletGroupCount; i++) {
                            let li = document.createElement('li');
                            li.className = 'amulet_item';
                            li.setAttribute('original-item', amuletArray[i].name);
                            li.title = amuletArray[i].formatBuffSummary('', '', '\n', false);
                            li.innerHTML =
                                `<a href="#">${amuletArray[i].name} [${amuletArray[i].count()}]</a>` +
                                `<span style="color:#0000c0;width:40;float:right;margin-right:5px;"></span>`;
                            li.onclick = selector_amulet;
                            amuletGroupContainer.appendChild(li);
                        }
                    }
                    else {
                        amuletContainer.innerHTML =
                            '<ul><li>未能读取护符组定义信息，这可能是因为您没有预先完成护符组定义。</li><p />' +
                                '<li>将护符与角色卡片进行绑定并不是必须的，但如果您希望使用此功能，' +
                                    '则必须先定义护符组然后才能将它们与角色卡片进行绑定。</li><p />' +
                                '<li>要定义护符组，您需要前往 [ <b style="color:#0000c0;">我的角色 → 武器装备</b> ] 页面，' +
                                    '并在其中使用将背包内容 [ <b style="color:#0000c0;">存为护符组</b> ] 功能，' +
                                    '或在 [ <b style="color:#0000c0;">管理护符组</b> ] 相应功能中进行定义。</li></ul>';
                    }

                    let bindings = null;
                    if (bind_info != null) {
                        bindings = bind_info.split(BINDING_SEPARATOR).sort((a, b) => {
                            a = a.split(BINDING_NAME_SEPARATOR);
                            b = b.split(BINDING_NAME_SEPARATOR);
                            a = a.length > 1 ? a[0] : BINDING_NAME_DEFAULT;
                            b = b.length > 1 ? b[0] : BINDING_NAME_DEFAULT;
                            return a < b ? -1 : 1;
                        });
                    }
                    else {
                        bindings = [];
                    }

                    bindings.forEach((item) => {
                        let elements = item.split(BINDING_NAME_SEPARATOR);
                        let binding = elements[elements.length - 1].split(BINDING_ELEMENT_SEPARATOR);
                        if (binding.length > 5) {
                            let amuletGroupNames = binding[5].split(',');
                            let ag = '';
                            let sp = '';
                            let al = amuletGroupNames.length;
                            for (let i = 0; i < al; i++) {
                                if (amuletGroups.contains(amuletGroupNames[i])) {
                                    ag += (sp + amuletGroupNames[i]);
                                    sp = ',';
                                }
                            }
                            binding[5] = ag;
                            elements[elements.length - 1] = binding.join(BINDING_ELEMENT_SEPARATOR);
                        }

                        let op = document.createElement('li');
                        op.className = 'binding-name';
                        op.innerText = (elements.length > 1 ? elements[0] : BINDING_NAME_DEFAULT);
                        op.setAttribute('original-item', elements[elements.length - 1]);
                        bindingList.appendChild(op);
                    });

                    let timer = setInterval(() => {
                        if (asyncOperations == 0) {
                            clearInterval(timer);
                            httpRequestClearAll();

                            if (bindingList.children.length > 0) {
                                bindingName.value = bindingList.children[0].innerText;
                                representBinding(bindingList.children[0].getAttribute('original-item'));
                            }
                            else {
                                bindingName.value = BINDING_NAME_DEFAULT;
                            }

                            bindingName.oninput = validateBindingName;
                            bindingName.onchange = validateBinding;
                            bindingList.onclick = ((e) => {
                                let li = e.target;
                                if (li.tagName == 'LI') {
                                    bindingName.value = li.innerText;
                                    representBinding(li.getAttribute('original-item'));
                                }
                            });

                            genericPopupQuerySelector('#copy_export_string').onclick = (() => {
                                genericPopupQuerySelector('#role_export_string').select();
                                if (document.execCommand('copy')) {
                                    genericPopupShowInformationTips('导出内容已复制到剪贴板', 5000);
                                }
                                else {
                                    genericPopupShowInformationTips('复制失败，请进行手工复制（CTRL+A, CTRL+C）');
                                }
                            });

                            genericPopupQuerySelector('#hide_export_div').onclick = (() => {
                                genericPopupQuerySelector('#role_export_div').style.display = 'none';
                            });

                            genericPopupSetContentSize(Math.min((haloGroupItemMax + amuletGroupCount) * 20
                                                                                  + (amuletGroupCount > 0 ? 60 : 160) + 260,
                                                                window.innerHeight - 200),
                                                       600, true);

                            genericPopupAddButton('解除绑定', 0, deleteBinding, true);
                            genericPopupAddButton('全部解绑', 0, unbindAll, true);
                            genericPopupAddButton('绑定', 80, saveBinding, false);
                            genericPopupAddButton(
                                '导出计算器',
                                0,
                                () => {
                                    let string = generateExportString();
                                    if (string?.length > 0) {
                                        genericPopupQuerySelector('#role_export_string').value = string;
                                        genericPopupQuerySelector('#role_export_div').style.display = 'block';
                                    }
                                },
                                false);
                            genericPopupAddCloseButton(80);

                            genericPopupCloseProgressMessage();
                            genericPopupShowModal(true);
                        }
                    }, 200);
                };

                function showCalcConfigGenPopup() {
                    let role = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                    let cardInfos = document.querySelector('#backpacks').querySelectorAll('.icon.icon-angle-down.text-primary');
                    let roleLv = cardInfos[0].innerText.match(/\d+/)[0];
                    let roleQl = cardInfos[1].innerText.match(/\d+/)[0];
                    let roleHs = cardInfos[2].innerText.match(/\d+/)[0];
                    let roleGv = (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0');
                    let roleTotalPt = Math.trunc((roleLv * 3 + 6) * (1 + roleQl / 100));
                    let rolePt = [];
                    for (let i = 1; i <= 6; i++) {
                        rolePt.push(document.getElementById('sjj' + i).innerText);
                    }
                    if (role == undefined || roleLv == undefined || roleQl == undefined || roleHs == undefined) {
                        alert('读取卡片信息失败，无法执行配置操作！');
                        return;
                    }

                    genericPopupInitialize();
                    genericPopupShowProgressMessage('读取中，请稍候...');

                    const monsters = [
                        {
                            name : '铁皮木人',
                            shortMark : 'MU2'
                        },
                        {
                            name : '迅捷魔蛛',
                            shortMark : 'ZHU2'
                        },
                        {
                            name : '魔灯之灵',
                            shortMark : 'DENG2'
                        },
                        {
                            name : '食铁兽',
                            shortMark : 'SHOU2'
                        },
                        {
                            name : '六眼飞鱼',
                            shortMark : 'YU2'
                        },
                        {
                            name : '晶刺豪猪',
                            shortMark : 'HAO2'
                        }
                    ];

                    let fixedContent =
                        '<div style="padding:20px 10px 10px 0px;color:blue;font-size:16px;"><b><ul>' +
                          '<li>使用本功能前请首先仔细阅读咕咕镇计算器相关说明以便对其中涉及到的概念及元素建立基本认识</li>' +
                          '<li>此功能只生成指定角色的PVE配置，若需供其他角色使用请在相应角色页面使用此功能或自行正确修改配置</li>' +
                          '<li>此功能只生成计算器可用的基础PVE配置，若需使用计算器提供的其它高级功能请自行正确修改配置</li>' +
                          '<li>此功能并未进行完整的数据合法性检查，并不保证生成的配置100%正确，所以请仔细阅读说明并正确使用各项设置</li>' +
                          `<li id="${g_genericPopupInformationTipsId}" style="color:red;">初次使用时请仔细阅读各部分的设置说明</li></ul></b></div>`;
                    const mainStyle =
                          '<style> .group-menu { position:relative;' +
                                                'display:inline-block;' +
                                                'color:blue;' +
                                                'font-size:20px;' +
                                                'cursor:pointer; } ' +
                                  '.group-menu-items { display:none;' +
                                                      'position:absolute;' +
                                                      'font-size:15px;' +
                                                      'word-break:keep-all;' +
                                                      'white-space:nowrap;' +
                                                      'margin:0 auto;' +
                                                      'width:fit-content;' +
                                                      'z-index:999;' +
                                                      'background-color:white;' +
                                                      'box-shadow:0px 8px 16px 4px rgba(0, 0, 0, 0.2);' +
                                                      'padding:15px 30px; } ' +
                                  '.group-menu-item { } ' +
                                  '.group-menu:hover .group-menu-items { display:block; } ' +
                                  '.group-menu-items .group-menu-item:hover { background-color:#bbddff; } ' +
                              '.section-help-text { font-size:15px; color:navy; } ' +
                              'b > span { color:purple; } ' +
                              'button.btn-group-selection { width:80px; float:right; } ' +
                              'table.mon-list { width:100%; } ' +
                                  'table.mon-list th.mon-name { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-progress { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-level { width:25%; text-align:left; } ' +
                                  'table.mon-list th.mon-baselevel { width:25%; text-align:left; } ' +
                              'table.role-info { width:100%; } ' +
                                  'table.role-info th.role-item { width:30%; text-align:left; } ' +
                                  'table.role-info th.role-points { width:10%; text-align:left; } ' +
                                  'table.role-info th.role-operation { width:10%; text-align:center; } ' +
                              'table.equip-list { width:100%; } ' +
                                  'table.equip-list th.equip-name { width:36%; text-align:left; } ' +
                                  'table.equip-list th.equip-property { width:16%; text-align:left; } ' +
                              'table.misc-config { width:100%; } ' +
                                  'table.misc-config th { width:20%; text-align:center; } ' +
                                  'table.misc-config td { text-align:center; } ' +
                              'table tr.alt { background-color:' + g_genericPopupBackgroundColorAlt + '; } ' +
                          '</style>';
                    const menuItems =
                          '<div class="group-menu-items"><ul>' +
                              '<li class="group-menu-item"><a href="#mon-div">野怪</a></li>' +
                              '<li class="group-menu-item"><a href="#role-div">角色</a></li>' +
                              '<li class="group-menu-item"><a href="#equips1-div">武器装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips2-div">手臂装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips3-div">身体装备</a></li>' +
                              '<li class="group-menu-item"><a href="#equips4-div">头部装备</a></li>' +
                              '<li class="group-menu-item"><a href="#halo-div">光环</a></li>' +
                              '<li class="group-menu-item"><a href="#amulet-div">护符</a></li>' +
                              '<li class="group-menu-item"><a href="#misc-div">其它</a></li><hr>' +
                              '<li class="group-menu-item"><a href="#result-div">生成结果</a></li>' +
                          '</ul></div>';
                    const monTable =
                          '<table class="mon-list"><tr class="alt"><th class="mon-name">名称</th><th class="mon-progress">段位进度（0% - 100%）</th>' +
                             '<th class="mon-level">进度等级</th><th class="mon-baselevel">基础等级（0%进度）</th></tr></table>';
                    const roleTable =
                          '<table class="role-info"><tr class="alt"><th class="role-item">设置</th>' +
                             '<th class="role-points">力量</th><th class="role-points">敏捷</th><th class="role-points">智力</th>' +
                             '<th class="role-points">体魄</th><th class="role-points">精神</th><th class="role-points">意志</th>' +
                             '<th class="role-operation">操作</th></tr><tr>' +
                             '<td>属性点下限（须大于0）<span id ="role-points-summary" style="float:right;margin-right:5px;"></span></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="1" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><button type="button" class="role-points-text-reset" style="width:100%;" value="1">重置</td></tr><tr class="alt">' +
                             '<td>属性点上限（0为无限制）</td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" class="role-points-text" style="width:90%;" value="0" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><button type="button" class="role-points-text-reset" style="width:100%;" value="0">重置</td>' +
                             '</tr></table>';
                    const equipTable =
                          '<table class="equip-list"><tr class="alt"><th class="equip-name">装备</th><th class="equip-property">属性</th>' +
                             '<th class="equip-property"></th><th class="equip-property"></th><th class="equip-property"></th></tr></table>';
                    const miscTable =
                          '<table class="misc-config"><tr class="alt">' +
                             '<th>计算线程数</th><th>最大组合数</th><th>单组测试次数</th><th>置信区间测试阈值（%）</th><th>输出计算进度</th></tr><tr>' +
                             '<td><input type="text" style="width:90%;" original-item="THREADS" value="4" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="SEEDMAX" value="1000000" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="TESTS" value="1000" oninput="value=value.replace(/[^\\d]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="CITEST" value="1" oninput="value=value.replace(/[^\\d.]/g,\'\');" /></td>' +
                             '<td><input type="text" style="width:90%;" original-item="VERBOSE" value="1" oninput="value=value.replace(/[^\\d.]/g,\'\');" /></td></tr></table>';
                    const btnGroup =
                          '<button type="button" class="btn-group-selection" select-type="2">反选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="1">全不选</button>' +
                          '<button type="button" class="btn-group-selection" select-type="0">全选</button>';
                    const mainContent =
                        `${mainStyle}
                         <div class="${g_genericPopupTopLineDivClass}" id="mon-div">
                           <b class="group-menu">野怪设置 （选中 <span>${monsters.length}</span>） ▼${menuItems}</b>${btnGroup}<hr>
                             <span class="section-help-text">` +
                             `只有勾选行的野怪信息才会被写入配置，且这些信息与选定角色相关。段位进度和等级必须对应，例如选定卡片当前段位60%进度迅捷魔蛛` +
                             `的等级为200级，则在迅捷魔蛛一行的段位进度栏填60，等级栏填200，程序将自动计算得到0%进度迅捷魔蛛的估计基础等级为167。</span>
                              <hr>${monTable}<hr><b style="display:inline-block;width:100%;text-align:center;">起始进度 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="3" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> %，以 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="2" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> % 进度差或以 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="3" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> 级差为间隔额外生成 ` +
                             `<input type="text" class="mon-batch-data" style="width:40px;" maxlength="1" value="0"
                                     oninput="value=value.replace(/[^\\d]/g,'');" /> 批野怪数据</b><hr>
                              <span class="section-help-text"">此功能可以生成多批阶梯等级的野怪配置，计算器可根据这些信息计算当野怪等级` +
                             `在一定范围内浮动时的近似最优策略。野怪的等级由其基础等级及进度加成共同决定（进度等级=基础等级×（1+（进度÷300））），` +
                             `多批之间的级差可由进度差或绝对级差指定，当进度差和绝对级差同时被指定（均大于0）且需生成多批数据（额外生成大于0）时默认使用` +
                             `进度差进行计算，当进度差和绝对级差同时为0或额外生成为0时将不会生成额外批次数据。需要注意的是（起始进度+（进度差×批次数））` +
                             `允许大于100，因为大于100的进度仍然可以计算得到有效的野怪等级。</span></div>
                         <div class="${g_genericPopupTopLineDivClass}" id="role-div">
                           <b class="group-menu">角色基础设置 （${role.name}，${roleLv}级，${roleQl}%品质，${role.hasG ? `${roleGv}成长值，` : ''}` +
                             `${roleTotalPt}属性点） ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `属性点下限初始值为指定角色当前点数分配方案，直接使用这些值主要用于胜率验证、装备及光环技能选择等情况，全部置1表示由计算器从` +
                             `头开始计算近似最佳点数分配（该行末的重置按钮将属性点下限全部置1）。也可为各点数设置合理的下限值（必须大于0且总和小于等于总` +
                             `可用属性点数）并由计算器分配剩余点数，这一般用于角色升级后可用点数增加、指定加点方案大致方向并进行装备、光环选择等情况，在` +
                             `其它条件相同的情况下，越少的剩余点数将节约越多的计算时间。属性点上限用于指定特定属性点数分配的上限，设为0表示无限制。合理地` +
                             `设置上限可以节约计算时间，典型的应用场景为将某些明确无需加点的属性上限设为1（例如3速角色的敏捷、血量系的精神等，以及通常情况` +
                             `下梦、默仅敏捷、智力、精神为0，其它皆为1，当然特殊加点除外），而将其它设为0（该行末的重置按钮将属性点上限全部置0）。</span><hr>
                              <input type="checkbox" id="role-useWishpool" checked /><label for="role-useWishpool"
                                     style="margin-left:5px;cursor:pointer;">使用许愿池数据</label><hr>${roleTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="equips1-div">
                           <b class="group-menu">武器装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<hr>
                             <span class="section-help-text">` +
                             `某类装备中如果只选中其中一件则意味着固定使用此装备；选中多件表示由计算器从选中的装备中选择一件合适（不保证最优）的装备；` +
                             `不选等同于全选，即由计算器在全部同类装备中进行选择。一般原则是尽可能多地固定使用装备，留给计算器的选择越多意味着计算所花` +
                             `的时间将越长（根据其它设置及硬件算力，可能长至数天）。</span><hr>${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips2-div">
                           <b class="group-menu">手臂装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips3-div">
                           <b class="group-menu">身体装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="equips4-div">
                           <b class="group-menu">头部装备 （选中 <span>0</span>） ▼${menuItems}</b>${btnGroup}<p />${equipTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="halo-div">
                           <b class="group-menu">光环技能 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `在选用的光环技能栏选择基本可以确定使用的的光环技能（例如血量重剑系几乎肯定会带沸血之志而护盾法系及某些反伤系带波澜不惊的` +
                             `可能性非常大），如果设置正确（光环点数未超范围）则计算器只需补齐空闲的技能位，所以这里指定的光环越多则计算所需时间越少。` +
                             `排除的光环用于指定几乎不可能出现在计算结果中的光环（例如护盾系可以排除沸血之志而法系基本可排除破壁之心，在技能位不足的情` +
                             `况下启程系列可以考虑全部排除），计算器在寻找优势方案时不会使用这些光环技能进行尝试，所以在有空闲技能位和光环点数充足的情况` +
                             `下，排除的光环技能越多则所需计算时间越少。选用与排除的技能允许重复，如果发生这种情况将强制选用。</span><hr>
                              <div style="display:flex;position:relative;width:100%;font-size:15px;"><div id="halo_selector"></div></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="amulet-div">
                           <b class="group-menu">护符 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `护符配置可以省略，或由当前背包的内容决定，如果有预先定义的护符组也可以使用护符组的组合。使用第二及第三种方式时需考虑背包容` +
                             `量（包括许愿池的背包加成及时限）。</span><hr><div style="font-size:15px;">
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-none" />
                                  <label for="amulet-config-none" style="cursor:pointer;margin-left:5px;">无</label><br>
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-bag" checked />
                                  <label for="amulet-config-bag" style="cursor:pointer;margin-left:5px;">当前背包内容（悬停查看）</label><br>
                              <input type="radio" class="amulet-config" name="amulet-config" id="amulet-config-groups" />
                                  <label for="amulet-config-groups" style="cursor:pointer;margin-left:5px;">护符组（在组名称上悬停查看）</label>
                              <div id="amulet_selector" style="display:block;padding:0px 20px 0px 20px;"></div></div></div>
                         <div class="${g_genericPopupTopLineDivClass}" id ="misc-div">
                           <b class="group-menu">其它 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `除非清楚修改以下配置项将会造成的影响，如无特殊需要请保持默认值。</span><ul class="section-help-text">` +
                             `<li>计算线程数：计算所允许使用的最大线程数，较大的值可以提高并行度从而减少计算用时，但超出处理器物理限制将适得其反，` +
                                 `合理的值应小于处理器支持的物理线程数（推荐值：处理器物理线程数-1或-2）</li>` +
                             `<li>最大组合数：如果给定配置所产生的组合数超过此值将会造成精度下降，但过大的值可能会造成内存不足，且过大的组合数需求` +
                                 `通常意味着待定项目过多，计算将异常耗时，请尝试多固定一些装备及光环技能项，多排除一些无用的光环技能项</li>` +
                             `<li>单组测试次数：特定的点数分配、装备、光环等组合与目标战斗过程的模拟次数，较高的值一般会产生可信度较高的结果，但会` +
                                 `消耗较长的计算时间（此设置仅在置信区间测试阈值设为0时生效）</li>` +
                             `<li>置信区间测试阈值：不使用固定的测试次数而以置信区间阈值代替，当测试结果的置信区间达到此值时计算终止，此设置生效` +
                                 `（不为0）时单组测试次数设置将被忽略</li>` +
                             `<li>输出计算进度：1为计算过程中在命令行窗口中显示计算时间、进度等信息，0为无显示</li></ul><hr>${miscTable}</div>
                         <div class="${g_genericPopupTopLineDivClass}" id="result-div">
                           <b class="group-menu">生成配置 ▼${menuItems}</b><hr><span class="section-help-text">` +
                             `生成配置文本后一种方式是将其内容复制至计算器目录中的“newkf.in”文件替换其内容并保存（使用文本编辑器），然后运行计算器` +
                             `执行文件（32位系统：newkf.bat或newkf.exe，64位系统：newkf-64.bat或newkf_64.exe）在其中输入anpc（小写）命令并` +
                             `回车然后等待计算完成。另一种使用方式是将生成的配置文本另存为一个ansi编码（重要）的文本文件，名称自定，然后将此文件用` +
                             `鼠标拖放至前述的计算器执行文件上，待程序启动后同样使用anpc命令开始计算。</span><hr><div style="height:200px;">
                              <textarea id="export-result" style="height:100%;width:100%;resize:none;"></textarea></div>
                           <div style="padding:10px 0px 20px 0px;">
                              <button type="button" style="float:right;margin-left:1px;" id="do-export">生成</button>
                              <button type="button" style="float:right;" id="copy-to-clipboard">复制导出内容至剪贴板</button></div></div>`;

                    genericPopupSetFixedContent(fixedContent);
                    genericPopupSetContent('咕咕镇计算器配置生成（PVE）', mainContent);

                    genericPopupQuerySelectorAll('button.btn-group-selection').forEach((btn) => { btn.onclick = batchSelection; });
                    function batchSelection(e) {
                        let selType = parseInt(e.target.getAttribute('select-type'));
                        let selCount = 0;
                        e.target.parentNode.querySelectorAll('input.generic-checkbox').forEach((chk) => {
                            if (chk.checked = (selType == 2 ? !chk.checked : selType == 0)) {
                                selCount++;
                            }
                        });
                        e.target.parentNode.firstElementChild.firstElementChild.innerText = selCount;
                    }

                    let asyncOperations = 3;

                    let equipItemCount = 0;
                    let bag, store;
                    beginReadObjects(
                        bag = [],
                        store = [],
                        () => {
                            let equipment = equipmentNodesToInfoArray(bag);
                            equipmentNodesToInfoArray(store, equipment);
                            equipmentNodesToInfoArray(document.querySelectorAll(cardingObjectsQueryString), equipment);

                            let eqIndex = 0;
                            let eq_selectors = genericPopupQuerySelectorAll('table.equip-list');
                            equipment.sort((e1, e2) => {
                                if (e1[0] != e2[0]) {
                                    return (g_equipMap.get(e1[0]).index - g_equipMap.get(e2[0]).index);
                                }
                                return -equipmentInfoComparer(e1, e2);
                            }).forEach((item) => {
                                let eqMeta = g_equipMap.get(item[0]);
                                let lv = equipmentGetLevel(item);
                                let tr = document.createElement('tr');
                                tr.style.backgroundColor = g_equipmentLevelBGColor[lv];
                                tr.innerHTML =
                                    `<td><input type="checkbox" class="generic-checkbox equip-checkbox equip-item" id="equip-${++eqIndex}"
                                                original-item="${item.slice(0, -1).join(' ')}" />
                                         <label for="equip-${eqIndex}" style="margin-left:5px;cursor:pointer;">
                                                ${eqMeta.alias} - Lv.${item[1]}${item[6] == 1 ? ' - [ 神秘 ]' : ''}</label></td>
                                     <td>${formatEquipmentAttributes(item, '</td><td>')}</td>`;
                                eq_selectors[eqMeta.type].appendChild(tr);
                            });
                            equipItemCount = equipment.length;

                            let bagGroup = amuletCreateGroupFromArray('temp', amuletNodesToArray(bag));
                            if (bagGroup.isValid()) {
                                let radio = genericPopupQuerySelector('#amulet-config-bag');
                                radio.setAttribute('original-item', `AMULET ${bagGroup.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                                radio.nextElementSibling.title = radio.title = bagGroup.formatBuffSummary('', '', '\n', false);
                            }
                            asyncOperations--;
                        },
                        null);

                    const highlightBackgroundColor = '#80c0f0';
                    let haloMax = 0;
                    let haloGroupItemMax = 0;
                    let haloPoints = null;
                    let haloSlots = null;
                    let currentHalo;
                    beginReadRoleAndHalo(
                        null,
                        currentHalo = [],
                        () => {
                            haloMax = currentHalo[0];
                            let haloInfo =
                                `天赋点：<span style="color:#0000c0;"><span id="halo_points">0</span> / ${haloMax}</span>，` +
                                `技能位：<span style="color:#0000c0;"><span id="halo_slots">0</span> / ${roleHs}</span>`;
                            let haloSelector = genericPopupQuerySelector('#halo_selector');
                            haloSelector.innerHTML =
                                `<style>
                                    .halo_group { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                    .halo_group_exclude { display:block; width:25%; float:left; text-align:center; border-left:1px solid grey; }
                                     div > a { display:inline-block; width:90%; } </style>
                                 <div><b style="margin-right:15px;">选用的光环技能：</b>${haloInfo}
                                 <p />
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group"></div>
                                 <div class="halo_group" style="border-right:1px solid grey;"></div></div>
                                 <div><b>排除的光环技能：</b>
                                 <p />
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude"></div>
                                 <div class="halo_group_exclude" style="border-right:1px solid grey;"></div></div>`;
                            let haloGroups = haloSelector.querySelectorAll('.halo_group');
                            let haloExGroups = haloSelector.querySelectorAll('.halo_group_exclude');
                            let group = -1;
                            let points = -1;
                            g_halos.forEach((item) => {
                                if (item.points != points) {
                                    points = item.points;
                                    group++;
                                }
                                let a = document.createElement('a');
                                a.href = '#';
                                a.className = 'halo_item';
                                a.innerText = item.name + ' ' + item.points;
                                haloGroups[group].appendChild(a.cloneNode(true));
                                if (haloGroups[group].children.length > haloGroupItemMax) {
                                    haloGroupItemMax = haloGroups[group].children.length;
                                }
                                a.className = 'halo_item_exclude';
                                haloExGroups[group].appendChild(a);
                            });

                            function selector_halo() {
                                let hp = parseInt(haloPoints.innerText);
                                let hs = parseInt(haloSlots.innerText);
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                    hp += parseInt($(this).text().split(' ')[1]);
                                    hs++;
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                    hp -= parseInt($(this).text().split(' ')[1]);
                                    hs--;
                                }
                                haloPoints.innerText = hp;
                                haloSlots.innerText = hs;
                                haloPoints.style.color = (hp <= haloMax ? '#0000c0' : 'red');
                                haloSlots.style.color = (hs <= roleHs ? '#0000c0' : 'red');
                            }

                            haloPoints = genericPopupQuerySelector('#halo_points');
                            haloSlots = genericPopupQuerySelector('#halo_slots');
                            $('.halo_item').each(function(i, e) {
                                $(e).on('click', selector_halo);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });

                            function selector_halo_exclude() {
                                if ($(this).attr('item-selected') != 1) {
                                    $(this).attr('item-selected', 1);
                                    $(this).css('background-color', highlightBackgroundColor);
                                }
                                else {
                                    $(this).attr('item-selected', 0);
                                    $(this).css('background-color', g_genericPopupBackgroundColor);
                                }
                            }

                            $('.halo_item_exclude').each(function(i, e) {
                                $(e).on('click', selector_halo_exclude);
                                $(e).attr('original-item', $(e).text().split(' ')[0]);
                            });
                            asyncOperations--;
                        },
                        null);

                    let wishpool;
                    beginReadWishpool(
                        wishpool = [],
                        null,
                        () => {
                            wishpool = wishpool.slice(-7);
                            asyncOperations--;
                        },
                        null);

                    let mon_selector = genericPopupQuerySelector('table.mon-list');
                    monsters.forEach((e, i) => {
                        let tr = document.createElement('tr');
                        tr.className = ((i & 1) == 0 ? '' : 'alt');
                        tr.setAttribute('original-item', e.shortMark);
                        tr.innerHTML =
                            `<td><input type="checkbox" class="generic-checkbox mon-checkbox mon-item" id="mon-item-${i}" checked />
                                 <label for="mon-item-${i}" style="margin-left:5px;cursor:pointer;">${e.name}</label></td>
                             <td><input type="text" class="mon-textbox" style="width:80%;" maxlength="3" value="0"
                                        oninput="value=value.replace(/[^\\d]/g,'');" /> %</td>
                             <td><input type="text" class="mon-textbox" style="width:80%;" value="1"
                                        oninput="value=value.replace(/[^\\d]/g,'');" /></td>
                             <td>1</td>`;
                        mon_selector.appendChild(tr);
                    });
                    mon_selector.querySelectorAll('input.mon-textbox').forEach((e) => { e.onchange = monDataChange; });
                    function monDataChange(e) {
                        let tr = e.target.parentNode.parentNode;
                        let p = parseInt(tr.children[1].firstChild.value);
                        let l = parseInt(tr.children[2].firstChild.value);
                        if (!isNaN(p) && !isNaN(l) && p >= 0 && p <= 100 && l > 0) {
                            tr.children[3].innerText = Math.ceil(l / (1 + (p / 300)));
                        }
                        else {
                            tr.children[3].innerHTML = '<b style="color:red;">输入不合法</b>';
                        }
                    }

                    let roleInfo = genericPopupQuerySelector('table.role-info');
                    let rolePtsSum = roleInfo.querySelector('#role-points-summary');
                    let textPts = roleInfo.querySelectorAll('input.role-points-text');
                    for (let i = 0; i < 6; i++) {
                        textPts[i].value = rolePt[i];
                        textPts[i].onchange = rolePtsChanged;
                    }
                    rolePtsChanged();
                    function rolePtsChanged() {
                        let ptsSum = 0;
                        for (let i = 0; i < 6; i++) {
                            let pt = parseInt(textPts[i].value);
                            if (isNaN(pt) || pt < 1) {
                                textPts[i].value = '1';
                                pt = 1;
                            }
                            ptsSum += pt;
                        }
                        rolePtsSum.innerText = `（${ptsSum} / ${roleTotalPt}）`;
                        rolePtsSum.style.color = (ptsSum > roleTotalPt ? 'red' : 'blue');
                    }
                    roleInfo.querySelectorAll('button.role-points-text-reset').forEach((item) => {
                        item.onclick = ((e) => {
                            e.target.parentNode.parentNode.querySelectorAll('input.role-points-text').forEach((item) => {
                                item.value = e.target.value;
                            });
                            if (e.target.value == '1') {
                                rolePtsChanged();
                            }
                        });
                    });

                    let amuletContainer = genericPopupQuerySelector('#amulet_selector');
                    amuletContainer.innerHTML = '已选定 <span id="amulet_count">0</span> 个护符<p /><ul style="cursor:pointer;"></ul>';
                    let amuletCount = genericPopupQuerySelector('#amulet_count');
                    amuletCount.style.color = '#0000c0';
                    let amuletGroups = amuletLoadGroups();
                    let amuletGroupCount = (amuletGroups?.count() ?? 0);
                    if (amuletGroupCount > 0) {
                        let amuletArray = amuletGroups.toArray().sort((a, b) => a.name < b.name ? -1 : 1);
                        let amuletGroupContainer = amuletContainer.lastChild;
                        for (let i = 0; i < amuletGroupCount; i++) {
                            let li = document.createElement('li');
                            li.className = 'amulet_item';
                            li.setAttribute('original-item', amuletArray[i].name);
                            li.title = amuletArray[i].formatBuffSummary('', '', '\n', false);
                            li.innerHTML = `<a href="#">${amuletArray[i].name} [${amuletArray[i].count()}]</a>`;
                            li.onclick = selector_amulet;
                            amuletGroupContainer.appendChild(li);
                        }
                    }
                    function selector_amulet() {
                        let ac = parseInt(amuletCount.innerText);
                        let tc = parseInt($(this).text().match(/\[(\d+)\]/)[1]);
                        if ($(this).attr('item-selected') != 1) {
                            $(this).attr('item-selected', 1);
                            $(this).css('background-color', highlightBackgroundColor);
                            ac += tc;
                        }
                        else {
                            $(this).attr('item-selected', 0);
                            $(this).css('background-color', g_genericPopupBackgroundColor);
                            ac -= tc;
                        }
                        amuletCount.innerText = ac;
                    }

                    function collectConfigData() {
                        let cfg = [ haloMax, '', `${role.shortMark}${role.hasG ? ' G=' + roleGv : ''} ${roleLv} ${roleHs} ${roleQl}` ];
                        if (genericPopupQuerySelector('#role-useWishpool').checked) {
                            cfg.push('WISH ' + wishpool.join(' '));
                        }

                        let amchk = genericPopupQuerySelectorAll('input.amulet-config');
                        if (amchk[1].checked) {
                            let am = amchk[1].getAttribute('original-item');
                            if (am?.length > 0) {
                                cfg.push(am);
                            }
                        }
                        else if (amchk[2].checked) {
                            let ag = new AmuletGroup();
                            ag.name = 'temp';
                            $('.amulet_item').each(function(i, e) {
                                if ($(e).attr('item-selected') == 1) {
                                    ag.merge(amuletGroups.get($(e).attr('original-item')));
                                }
                            });
                            if (ag.isValid()) {
                                cfg.push(`AMULET ${ag.formatBuffShortMark(' ', ' ', false)} ENDAMULET`);
                            }
                        }

                        let pts = [];
                        let ptsMax = [ 'MAXATTR' ];
                        genericPopupQuerySelectorAll('input.role-points-text').forEach((e, i) => {
                            if (i < 6) {
                                pts.push(e.value);
                            }
                            else {
                                ptsMax.push(e.value);
                            }
                        });
                        cfg.push(pts.join(' '));

                        let eq = [ [], [], [], [] ];
                        genericPopupQuerySelectorAll('table.equip-list').forEach((t, ti) => {
                            let equ = t.querySelectorAll('input.equip-checkbox.equip-item');
                            let eqsel = [];
                            equ.forEach((e, ei) => {
                                let eqstr = e.getAttribute('original-item');
                                if (e.checked) {
                                    eq[ti].push(eqstr);
                                }
                                else {
                                    eqsel.push(eqstr);
                                }
                            });
                            if (eq[ti].length == 0) {
                                eq[ti] = eqsel;
                            }
                        });
                        let eqsel = [];
                        eq.forEach((e) => {
                            if (e.length == 1) {
                                cfg.push(e[0]);
                            }
                            else {
                                cfg.push('NONE');
                                eqsel = eqsel.concat(e);
                            }
                        });

                        let halo = [];
                        $('.halo_item').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                halo.push(g_haloMap.get($(e).attr('original-item')).shortMark);
                            }
                        });
                        cfg.push(halo.length > 0 ? halo.length + ' ' + halo.join(' ') : '0');
                        cfg.push('');

                        if (eqsel.length > 0) {
                            cfg.push('GEAR\n    ' + eqsel.join('\n    ') + '\nENDGEAR');
                            cfg.push('');
                        }

                        let monText = genericPopupQuerySelector('#mon-div').querySelectorAll('input.mon-batch-data');
                        let startProg = parseInt(monText[0].value);
                        let progStep = parseInt(monText[1].value);
                        let lvlstep = parseInt(monText[2].value);
                        let batCount = parseInt(monText[3].value);
                        console.log(monText);
                        let mon = [];
                        mon_selector.querySelectorAll('input.mon-checkbox.mon-item').forEach((e) => {
                            if (e.checked) {
                                let tr = e.parentNode.parentNode;
                                let baseLvl = parseInt(tr.children[3].innerText);
                                if (!isNaN(baseLvl)) {
                                    mon.push({ mon : tr.getAttribute('original-item'), level : baseLvl });
                                }
                            }
                        });
                        if (mon.length > 0) {
                            cfg.push('NPC');
                            const sp = '        ';
                            mon.forEach((e) => {
                                let bl = Math.trunc(e.level * (1 + startProg / 300));
                                cfg.push('    ' + (e.mon + sp).substring(0, 8) + (bl + sp).substring(0, 8) + '0');
                                if (batCount > 0 && progStep == 0 && lvlstep > 0) {
                                    e.level = bl;
                                }
                            });
                            while (batCount > 0) {
                                cfg.push('');
                                if (progStep > 0) {
                                    startProg += progStep;
                                    mon.forEach((e) => {
                                        cfg.push('    ' + (e.mon + sp).substring(0, 8) +
                                                 (Math.trunc(e.level * (1 + startProg / 300)) + sp).substring(0, 8) + '0');
                                    });
                                }
                                else if (lvlstep > 0) {
                                    mon.forEach((e) => {
                                        cfg.push('    ' + (e.mon + sp).substring(0, 8) +
                                                 ((e.level += lvlstep) + sp).substring(0, 8) + '0');
                                    });
                                }
                                else {
                                    cfg.pop();
                                    break;
                                }
                                batCount--;
                            }
                            cfg.push('ENDNPC');
                            cfg.push('');
                        }

                        genericPopupQuerySelector('table.misc-config').querySelectorAll('input').forEach((e) => {
                            cfg.push(e.getAttribute('original-item') + ' ' + e.value);
                        });
                        cfg.push('REDUCERATE 3 10');
                        cfg.push('PCWEIGHT 1 1');
                        cfg.push('DEFENDER 0');
                        cfg.push('');

                        cfg.push(ptsMax.join(' '));
                        halo = [];
                        $('.halo_item_exclude').each(function(i, e) {
                            if ($(e).attr('item-selected') == 1) {
                                halo.push(g_haloMap.get($(e).attr('original-item')).shortMark);
                            }
                        });
                        if (halo.length > 0) {
                            cfg.push('AURAFILTER ' + halo.join('_'));
                        }

                        return cfg;
                    }

                    let timer = setInterval(() => {
                        if (asyncOperations == 0) {
                            clearInterval(timer);
                            httpRequestClearAll();

                            genericPopupQuerySelectorAll('input.generic-checkbox').forEach((e) => { e.onchange = genericCheckboxStateChange; });
                            function genericCheckboxStateChange(e) {
                                let countSpan = e.target.parentNode.parentNode.parentNode.parentNode.firstElementChild.firstElementChild;
                                countSpan.innerText = parseInt(countSpan.innerText) + (e.target.checked ? 1 : -1);
                            }

                            genericPopupQuerySelector('#copy-to-clipboard').onclick = (() => {
                                genericPopupQuerySelector('#export-result').select();
                                if (document.execCommand('copy')) {
                                    genericPopupShowInformationTips('导出内容已复制到剪贴板');
                                }
                                else {
                                    genericPopupShowInformationTips('复制失败，请进行手工复制（CTRL+A, CTRL+C）');
                                }
                            });

                            genericPopupQuerySelector('#do-export').onclick = (() => {
                                genericPopupQuerySelector('#export-result').value = '';
                                let string = collectConfigData().join('\n') + '\n';
                                if (string?.length > 0) {
                                    genericPopupQuerySelector('#export-result').value = string;
                                }
                            });

                            genericPopupSetContentSize(Math.min(4000, Math.max(window.innerHeight - 400, 400)),
                                                       Math.min(1000, Math.max(window.innerWidth - 200, 600)),
                                                       true);
                            genericPopupAddCloseButton();
                            genericPopupCloseProgressMessage();
                            genericPopupShowModal(true);
                        }
                    }, 200);
                }

                function refreshBindingSelector(roleId) {
                    let bindingsolutionDiv = document.getElementById(g_bindingSolutionId);
                    let bindingList = document.getElementById(g_bindingListSelectorId);

                    let bindings = null;
                    let bind_info = loadUserConfigData().dataBind[roleId];
                    if (bind_info != null) {
                        bindings = bind_info.split(BINDING_SEPARATOR).sort((a, b) => {
                            a = a.split(BINDING_NAME_SEPARATOR);
                            b = b.split(BINDING_NAME_SEPARATOR);
                            a = a.length > 1 ? a[0] : BINDING_NAME_DEFAULT;
                            b = b.length > 1 ? b[0] : BINDING_NAME_DEFAULT;
                            return a < b ? -1 : 1;
                        });
                    }
                    bindingList.innerHTML = '';
                    if (bindings?.length > 0) {
                        bindings.forEach((item) => {
                            let elements = item.split(BINDING_NAME_SEPARATOR);
                            let op = document.createElement('option');
                            op.value = roleId + BINDING_NAME_SEPARATOR + elements[elements.length - 1];
                            op.innerText = (elements.length > 1 ? elements[0] : BINDING_NAME_DEFAULT);
                            bindingList.appendChild(op);
                        });
                        bindingsolutionDiv.style.display = 'inline-block';
                    }
                    else {
                        bindingsolutionDiv.style.display = 'none';
                    }
                }

                function addBindBtn() {
                    let roleId = g_roleMap.get(document.querySelector('#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')
                                                      ?.innerText)?.id;

                    function toolsLinks(e) {
                        if (e.target.id == g_genCalcCfgPopupLinkId) {
                            showCalcConfigGenPopup();
                        }
                        else if (e.target.id == g_bindingPopupLinkId) {
                            showBindingPopup();
                        }
                        else if (e.target.id == g_equipOnekeyLinkId) {
                            equipOnekey();
                        }
                    }

                    let bindingAnchor = document.querySelector('#backpacks > div.row > div.col-md-12').parentNode.nextSibling;
                    let toolsContainer = document.createElement('div');
                    toolsContainer.className = 'btn-group';
                    toolsContainer.style.display = 'block';
                    toolsContainer.style.width = '100%';
                    toolsContainer.style.marginTop = '15px';
                    toolsContainer.style.fontSize = '18px';
                    toolsContainer.style.padding = '10px';
                    toolsContainer.style.borderRadius = '5px';
                    toolsContainer.style.color = '#0000c0';
                    toolsContainer.style.backgroundColor = '#ebf2f9';
                    bindingAnchor.parentNode.insertBefore(toolsContainer, bindingAnchor);

                    let genCalcCfgLink = document.createElement('span');
                    genCalcCfgLink.setAttribute('class', 'fyg_lh30');
                    genCalcCfgLink.style.width = '25%';
                    genCalcCfgLink.style.textAlign = 'left';
                    genCalcCfgLink.style.display = 'inline-block';
                    genCalcCfgLink.innerHTML =
                        `<a href="#" style="text-decoration:underline;" id="${g_genCalcCfgPopupLinkId}">生成计算器PVE配置</a>`;
                    genCalcCfgLink.querySelector('#' + g_genCalcCfgPopupLinkId).onclick = toolsLinks;
                    toolsContainer.appendChild(genCalcCfgLink);

                    let bindingLink = document.createElement('span');
                    bindingLink.setAttribute('class', 'fyg_lh30');
                    bindingLink.style.width = '25%';
                    bindingLink.style.textAlign = 'left';
                    bindingLink.style.display = 'inline-block';
                    bindingLink.innerHTML =
                        `<a href="#" style="text-decoration:underline;" id="${g_bindingPopupLinkId}">绑定（装备 光环 护符）</a>`;
                    bindingLink.querySelector('#' + g_bindingPopupLinkId).onclick = toolsLinks;
                    toolsContainer.appendChild(bindingLink);

                    let bindingsolutionDiv = document.createElement('div');
                    bindingsolutionDiv.id = g_bindingSolutionId;
                    bindingsolutionDiv.style.display = 'none';
                    bindingsolutionDiv.style.width = '50%';

                    let bindingList = document.createElement('select');
                    bindingList.id = g_bindingListSelectorId;
                    bindingList.style.width = '80%';
                    bindingList.style.color = '#0000c0';
                    bindingList.style.textAlign = 'center';
                    bindingList.style.display = 'inline-block';
                    bindingsolutionDiv.appendChild(bindingList);

                    let applyLink = document.createElement('span');
                    applyLink.setAttribute('class', 'fyg_lh30');
                    applyLink.style.width = '20%';
                    applyLink.style.textAlign = 'right';
                    applyLink.style.display = 'inline-block';
                    applyLink.innerHTML = `<a href="#" style="text-decoration:underline;" id="${g_equipOnekeyLinkId}">应用方案</a>`;
                    applyLink.querySelector('#' + g_equipOnekeyLinkId).onclick = toolsLinks;
                    bindingsolutionDiv.appendChild(applyLink);
                    toolsContainer.appendChild(bindingsolutionDiv);

                    refreshBindingSelector(roleId);
                }

                function addStoneTipsEnabler() {
                    let divs = document.querySelector('#backpacks').querySelectorAll('div.col-sm-8.fyg_tr');
                    if (divs.length == 3) {
                        let storageKeys = [ g_stoneProgressEquipTipStorageKey,
                                            g_stoneProgressCardTipStorageKey,
                                            g_stoneProgressHaloTipStorageKey,
                                            g_stoneAuto1StorageKey,g_stoneAuto2StorageKey,
                                            g_stoneAuto3StorageKey,g_stoneAuto4StorageKey,
                                            g_stoneAuto5StorageKey,g_stoneAuto6StorageKey
                                          ];
                        let i = 0;
                        for (let tip of divs) {
                            let div = document.createElement('div');
                            let id = 'stoneProgressTipCheckbox_' + i;
                            if(i!=2){
                                div.innerHTML =
                                `<label for="${id}" style="margin-right:5px;cursor:pointer;">100% 进度提醒</label>
                                 <input type="checkbox" id="${id}" />`;
                                tip.appendChild(div);
                                setupConfigCheckbox(div.querySelector('#' + id), storageKeys[i++], null, null);
                            }
                            else{
                                div.innerHTML =`<label style="margin-right:5px;cursor:pointer;">自动收集:</label>
                                <label for="stone1" style="margin-right:5px;cursor:pointer;">红石</label><input type="checkbox" id="stone1" />
                                <label for="stone2" style="margin-right:5px;cursor:pointer;">银石</label><input type="checkbox" id="stone2" />
                                <label for="stone3" style="margin-right:5px;cursor:pointer;">金石</label><input type="checkbox" id="stone3" />
                                <label for="stone4" style="margin-right:5px;cursor:pointer;">梦石</label><input type="checkbox" id="stone4" />
                                <label for="stone5" style="margin-right:5px;cursor:pointer;">虚石</label><input type="checkbox" id="stone5" />
                                <label for="stone6" style="margin-right:5px;cursor:pointer;">幻石</label><input type="checkbox" id="stone6" />&nbsp;&nbsp;
                                <label for="${id}" style="margin-right:5px;cursor:pointer;">100% 进度提醒</label><input type="checkbox" id="${id}" />`;
                                tip.appendChild(div);
                                setupConfigCheckbox(div.querySelector('#' + id), storageKeys[i++], null, null);
                                for(let j=1;j<6;j++){
                                    setupConfigCheckbox(div.querySelector('#stone' + j), storageKeys[j+2], null, null);
                                }
                            }
                        }
                    }
                }

                let backpacksObserver = new MutationObserver(() => {
                    $('.pop_main').hide();
                    let page = document.getElementsByClassName('nav nav-secondary nav-justified')[0].children;
                    let index = 0;
                    for (let i = 0; i < 4; i++) {
                        if (page[i].className == 'active') {
                            index = i;
                        }
                    }
                    switch (index) {
                        case 0: {
                            calcBtn.disabled = '';
                            calcBtn.onclick = (() => {
                                try {
                                    let equip = document.querySelectorAll(cardingObjectsQueryString);
                                    let bag = Array.from(document.querySelectorAll(bagObjectsQueryString)).concat(
                                              Array.from(document.querySelectorAll(storeObjectsQueryString)));
                                    let bagdata = equipmentNodesToInfoArray(bag);
                                    let data = equipmentNodesToInfoArray(equip);
                                    bagdata = bagdata.concat(data).sort(equipmentInfoComparer);
                                    calcDiv.innerHTML =
                                        `<div class="pop_main" style="padding:0px 10px;"><a href="#">× 折叠 ×</a>
                                         <div class="pop_con">
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey;">护符：</div>
                                         <div class="pop_text"></div>
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey">已装备：</div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div class="pop_text"></div>
                                         <div style="width:200px;padding:5px;margin-top:10px;margin-bottom:10px;
                                              color:purple;border:1px solid grey;">全部装备：</div>
                                         ${new Array(bagdata.length + 1).fill('<div class="pop_text"></div>').join('')}<hr></div>
                                         <a href="#">× 折叠 ×</a></div>`;

                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide()
                                    })
                                    let text = $('.pop_text');

                                    let amulet = document.getElementById('backpacks').lastChild.children[1].innerText.match(/\+\d+/g);
                                    for (let i = amulet.length - 1; i >= 0; i--) {
                                        if (amulet[i][1] == '0') {
                                            amulet.splice(i, 1);
                                        }
                                        else {
                                            amulet[i] = g_amuletBuffs[i].shortMark + amulet[i];
                                        }
                                    }
                                    text[0].innerText = `AMULET ${amulet.join(' ').replace(/\+/g, ' ')} ENDAMULET`;

                                    text[1].innerText = `${data[0].slice(0, -1).join(' ')}`;
                                    text[2].innerText = `${data[1].slice(0, -1).join(' ')}`;
                                    text[3].innerText = `${data[2].slice(0, -1).join(' ')}`;
                                    text[4].innerText = `${data[3].slice(0, -1).join(' ')}`;

                                    for (let i = 0; i < bagdata.length; i++) {
                                        text[5 + i].innerText = `${bagdata[i].slice(0, -1).join(' ')}`;
                                    }
                                    $('.pop_main').show();
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            });
                            if (document.getElementById('equipmentDiv') == null) {
                                backpacksObserver.disconnect();
                                addCollapse();
                                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            }
                            else {
                                switchObjectContainerStatus(!equipmentStoreExpand);
                            }
                            break;
                        }
                        case 1: {
                            let role = g_roleMap.get(document.querySelector(
                                '#backpacks > div.row > div.col-md-3 > span.text-info.fyg_f24')?.innerText);
                            if (role != undefined) {
                                calcBtn.disabled = '';
                                calcBtn.onclick = (() => {
                                    calcDiv.innerHTML =
                                        `<div class="pop_main"><div class="pop_con">
                                         <div class="pop_text"></div><div class="pop_text"></div>
                                         </div><a href="#">× 折叠 ×</a></div>`;
                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide();
                                    })
                                    let text = $('.pop_text');
                                    let cardInfos = document.querySelector('#backpacks').querySelectorAll('.icon.icon-angle-down.text-primary');
                                    let cardInfo = [ role.shortMark,
                                                     cardInfos[0].innerText.match(/\d+/)[0],
                                                     cardInfos[2].innerText.match(/\d+/)[0],
                                                     cardInfos[1].innerText.match(/\d+/)[0]
                                                   ];
                                    if (role.hasG) {
                                        cardInfo.splice(1, 0, 'G=' + (cardInfos[3]?.innerText.match(/\d+/)[0] ?? '0'));
                                    }
                                    let points = [];
                                    for (let i = 1; i <= 6; i++) {
                                        points.push(document.getElementById('sjj' + i).innerText);
                                    }
                                    text[0].innerText = cardInfo.join(' ');
                                    text[1].innerText = points.join(' ');
                                    $('.pop_main').show();
                                });
                                backpacksObserver.disconnect();
                                addBindBtn();
                                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            }
                            else {
                                calcBtn.disabled = 'disabled';
                                calcBtn.onclick = (() => {});
                            }
                            break;
                        }
                        case 2: {
                            calcBtn.disabled = '';
                            calcBtn.onclick = (() => {
                                try {
                                    calcDiv.innerHTML =
                                        `<div class="pop_main"><div class="pop_con">
                                         <div class="pop_text"></div></div>
                                         <a href="#">× 折叠 ×</a></div>`;
                                    $('.pop_main a').click(() => {
                                        $('.pop_main').hide();
                                    })
                                    let text = $('.pop_text');
                                    let aura = document.querySelectorAll('#backpacks .btn.btn-primary');
                                    let data = [];
                                    data.push(aura.length);
                                    aura.forEach((item) => { data.push(g_haloMap.get(item.childNodes[1].nodeValue.trim())?.shortMark ?? ''); });
                                    text[0].innerText = data.join(' ');
                                    $('.pop_main').show();
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            });
                            break;
                        }
                        case 3: {
                            calcBtn.disabled = 'disabled';
                            calcBtn.onclick = (() => {});
                            backpacksObserver.disconnect();
                            addStoneTipsEnabler();
                            backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                            break;
                        }
                    }
                });
                backpacksObserver.observe(document.getElementById('backpacks'), { childList : true , characterData : true });
                document.getElementById('backpacks').appendChild(document.createElement('div'));
            }
        }, 500);
    }
    else if (window.location.pathname == g_guguzhenBeach) {
        genericPopupInitialize();

        let beachConfigDiv = document.createElement('form');
        beachConfigDiv.innerHTML =
            `<div style="padding:5px 15px;border-bottom:1px solid grey;">
             <button type="button" style="margin-right:15px;" id="siftSettings">筛选设置</button>
             <input type="checkbox" id="forceExpand" style="margin-right:5px;" />
             <label for="forceExpand" style="margin-right:40px;cursor:pointer;">强制展开所有装备</label>
             <b><span id="analyze-indicator">正在分析...</span></b>
             <div style="float:right;"><label for="beach_BG"
                  style="margin-right:5px;cursor:pointer;">使用深色背景</label>
             <input type="checkbox" id="beach_BG" /></div></div>`;

         let forceExpand = setupConfigCheckbox(
            beachConfigDiv.querySelector('#forceExpand'),
            g_beachForceExpandStorageKey,
            (checked) => {
                forceExpand = checked;
                document.getElementById('analyze-indicator').innerText = '正在分析...';
                setTimeout(() => { expandEquipment(equipment); }, 50);
            },
            null);

        let beach_BG = setupConfigCheckbox(beachConfigDiv.querySelector('#beach_BG'),
                                           g_beachBGStorageKey,
                                           (checked) => { changeBeachStyle('beach_copy', beach_BG = checked); },
                                           null);

        beachConfigDiv.querySelector('#siftSettings').onclick = (() => {
            loadTheme();

            let fixedContent =
                '<div style="font-size:15px;color:#0000c0;padding:20px 0px 10px;"><b><ul>' +
                '<li>被勾选的装备不会被展开，不会产生与已有装备的对比列表，但传奇、史诗及有神秘属性的装备除外</li>' +
                '<li>未勾选的属性被视为主要属性，海滩装备的任一主要属性值大于已有装备的相应值时即有可能被展开，除非已有装备中至少有一件其各项属性均不低于海滩装备</li>' +
                '<li>被勾选的属性被视为次要属性，当且仅当海滩装备和已有装备的主要属性值完全相等时才会被对比</li>' +
                '<li>不作为筛选依据的已有装备不会与海滩装备直接进行比较，这些装备不会影响海滩装备的展开与否</li></ul></b></div>';
            let mainContent =
                `<style> #equip-table { width:100%; }
                         #equip-table th { width:17%; text-align:right; }
                         #equip-table th.equip-th-equip { width:32%; text-align:left; }
                         #equip-table td { display:table-cell; text-align:right; }
                         #equip-table td.equip-td-equip { display:table-cell; text-align:left; }
                         #equip-table label.equip-checkbox-label { margin-left:5px; cursor:pointer; }
                         table tr.alt { background-color:${g_genericPopupBackgroundColorAlt}; } </style>
                 <div class="${g_genericPopupTopLineDivClass}" style="color:#800080;">
                   <b style="display:inline-block;width:30%;">不作为筛选依据的已有装备：</b>
                   <span style="display:inline-block;width:33%;;text-align:center;">
                     <input type="checkbox" id="ignoreMysEquip" style="margin-right:5px;" />
                     <label for="ignoreMysEquip" style="cursor:pointer;">神秘装备</label></span>
                   <b style="display:inline-block;width:33%;text-align:right;">低于 ` +
                     `<input type="text" id="ignoreEquipLevel" style="width:40px;" maxlength="3" value="0"
                             oninput="value=value.replace(/[^\\d]/g,'');" /> 级的装备</b></div>
                 <div class="${g_genericPopupTopLineDivClass}"><table id="equip-table">
                 <tr class="alt"><th class="equip-th-equip"><input type="checkbox" id="equip-name-check" />
                 <label class= "equip-checkbox-label" for="equip-name-check">装备名称</label></th>
                 <th>装备属性</th><th /><th /><th /></tr></table><div>`;

            genericPopupSetFixedContent(fixedContent);
            genericPopupSetContent('海滩装备筛选设置', mainContent);

            genericPopupQuerySelector('#equip-name-check').onchange = ((e) => {
                let eqchecks = equipTable.querySelectorAll('input.sift-settings-checkbox');
                for (let i = 0; i < eqchecks.length; i += 5) {
                    eqchecks[i].checked = e.target.checked;
                }
            });

            let udata = loadUserConfigData();
            if (udata.dataBeachSift == null) {
                udata.dataBeachSift = {};
                saveUserConfigData(udata);
            }

            let ignoreMysEquip = genericPopupQuerySelector('#ignoreMysEquip');
            let ignoreEquipLevel = genericPopupQuerySelector('#ignoreEquipLevel');

            ignoreMysEquip.checked = (udata.dataBeachSift.ignoreMysEquip ?? false);
            ignoreEquipLevel.value = (udata.dataBeachSift.ignoreEquipLevel ?? "0");

            let equipTable = genericPopupQuerySelector('#equip-table');
            let equipTypeColor = [ '#000080', '#008000', '#800080', '#008080' ];
            g_equipments.forEach((equip) => {
                let tr = document.createElement('tr');
                tr.id = `equip-index-${equip.index}`;
                tr.className = ('equip-tr' + ((equip.index & 1) == 0 ? '' : ' alt'));
                tr.setAttribute('equip-abbr', equip.shortMark);
                tr.style.color = equipTypeColor[equip.type];
                let attrHTML = '';
                equip.attributes.forEach((item, index) => {
                    let attrId = `${tr.id}-attr-${index}`;
                    attrHTML +=
                        `<td><input type="checkbox" class="sift-settings-checkbox" id="${attrId}" />
                         <label class="equip-checkbox-label" for="${attrId}">${item.attribute.name}</label></td>`;
                });
                let equipId = `equip-${equip.index}`;
                tr.innerHTML =
                    `<td class="equip-td-equip"><input type="checkbox" class="sift-settings-checkbox" id="${equipId}" />
                         <label class="equip-checkbox-label" for="${equipId}">${equip.alias}</label></td>${attrHTML}`;
                equipTable.appendChild(tr);
            });

            let eqchecks = equipTable.querySelectorAll('input.sift-settings-checkbox');
            for (let i = 0; i < eqchecks.length; i += 5) {
                let abbr = eqchecks[i].parentNode.parentNode.getAttribute('equip-abbr');
                if (udata.dataBeachSift[abbr] != null) {
                    let es = udata.dataBeachSift[abbr].split(',');
                    for (let j = 0; j < es.length; j++) {
                        eqchecks[i + j].checked = (es[j] == 'true');
                    }
                }
            }

            genericPopupAddButton(
                '确认',
                80,
                (() => {
                    let settings = { ignoreMysEquip : ignoreMysEquip.checked, ignoreEquipLevel : ignoreEquipLevel.value };
                    equipTable.querySelectorAll('tr.equip-tr').forEach((row) => {
                        let checks = [];
                        row.querySelectorAll('input.sift-settings-checkbox').forEach((col) => { checks.push(col.checked); });
                        settings[row.getAttribute('equip-abbr')] = checks.join(',');
                    });

                    let udata = loadUserConfigData();
                    udata.dataBeachSift = settings;
                    saveUserConfigData(udata);

                    genericPopupClose();
                    window.location.reload();
                }),
                false);
            genericPopupAddCloseButton(80);

            genericPopupSetContentSize(Math.min(g_equipments.length * 31 + 130, Math.max(window.innerHeight - 200, 500)),
                                       Math.min(750, Math.max(window.innerWidth - 100, 600)),
                                       true);
            genericPopupShowModal(true);
        });

        let beach = document.getElementById('beachall');
        beach.parentNode.insertBefore(beachConfigDiv, beach);

        let batbtns = document.querySelector('div.col-md-9 > div.panel.panel-primary > div.panel-body > div.btn-group > button.btn.btn-danger');
        let toAmuletBtn = document.createElement('button');
        toAmuletBtn.className = batbtns.className;
        toAmuletBtn.innerText = '批量沙滩装备转护符';
        toAmuletBtn.style.marginLeft = '1px';
        toAmuletBtn.onclick = equipToAmulet;
        batbtns.parentNode.appendChild(toAmuletBtn);

        function equipToAmulet() {
            loadTheme();

            function divHeightAdjustment(div) {
                div.style.height = (div.parentNode.offsetHeight - div.offsetTop - 3) + 'px';
            }

            function moveAmuletItem(e) {
                let li = e.target;
                if (li.tagName == 'LI') {
                    let liIndex = parseInt(li.getAttribute('item-index'));
                    let container = (li.parentNode == amuletToStoreList ? amuletToDestroyList : amuletToStoreList);
                    for (var li0 = container.firstChild; parseInt(li0?.getAttribute('item-index')) < liIndex; li0 = li0.nextSibling);
                    container.insertBefore(li, li0);
                }
            }

            function refreshBackpacks(fnFurtherProcess) {
                let asyncOperations = 1;
                let asyncObserver = new MutationObserver(() => { asyncObserver.disconnect(); asyncOperations = 0; });
                asyncObserver.observe(document.getElementById('backpacks'), { childList : true , subtree : true });

                stbp();

                let timer = setInterval(() => {
                    if (asyncOperations == 0) {
                        clearInterval(timer);
                        if (fnFurtherProcess != null) {
                            fnFurtherProcess();
                        }
                    }
                }, 200);
            }

            function queryObjects(bag, queryBagId, ignoreEmptyCell, beach, beachEquipLevel) {
                if (bag != null) {
                    let nodes = document.getElementById('backpacks').children;
                    if (queryBagId) {
                        objectIdParseNodes(nodes, bag, null, ignoreEmptyCell);
                    }
                    else {
                        let i = 0;
                        for (let node of nodes) {
                            let e = ((new Amulet()).fromNode(node) ?? equipmentInfoParseNode(node));
                            if (e != null) {
                                bag.push([ i++, e ]);
                            }
                        }
                    }
                }
                if (beach != null) {
                    let nodes = document.getElementById('beachall').children;
                    for (let node of nodes) {
                        let lv = equipmentGetLevel(node);
                        if (lv > 1) {
                            let e = equipmentInfoParseNode(node);
                            if (e != null && ((lv == 2 && parseInt(e[1]) >= beachEquipLevel) || lv > 2)) {
                                beach.push(parseInt(e[7]));
                            }
                        }
                    }
                }
            }

            let pickCount;
            function pickEquip() {
                genericPopupShowInformationTips('拾取装备...', 0);
                let ids = [];
                while (originalBeach.length > 0 && ids.length < freeCell) {
                    ids.unshift(originalBeach.pop());
                }
                pickCount = ids.length;
                beginMoveObjects(ids, g_object_move_path.beach2bag, refreshBackpacks, findPickedEquip);
            }

            function findPickedEquip() {
                let bag = [];
                queryObjects(bag, true, true, null, 0);
                let ids = findNewObjects(bag, originalBag, (a, b) => a - b, false);
                if (ids.length != pickCount) {
                    alert('从海滩拾取装备出错无法继续，请手动处理！');
                    window.location.reload();
                    return;
                }
                genericPopupShowInformationTips('熔炼装备...', 0);
                beginPirlObjects(ids, refreshBackpacks, prepareNewAmulets);
            }

            const objectTypeColor = [ '#e0fff0', '#ffe0ff', '#fff0e0', '#d0f0ff' ];
            let minBeachAmuletPointsToStore = [ 1, 1, 1 ];
            let cfg = g_configMap.get('minBeachAmuletPointsToStore')?.value?.split(',');
            if (cfg?.length == 3) {
                cfg.forEach((item, index) => {
                    if (isNaN(minBeachAmuletPointsToStore[index] = parseInt(item))) {
                        minBeachAmuletPointsToStore[index] = 1;
                    }
                });
            }
            function prepareNewAmulets() {
                newAmulets = findNewObjects(amuletNodesToArray(document.getElementById('backpacks').children),
                                            originalBag, (a, b) => a.id - b, false);
                if (newAmulets.length != pickCount) {
                    alert('熔炼装备出错无法继续，请手动处理！');
                    window.location.reload();
                    return;
                }
                newAmulets.forEach((am, index) => {
                    let li = document.createElement('li');
                    li.style.backgroundColor = g_equipmentLevelBGColor[am.level + 2];
                    li.setAttribute('item-index', index);
                    li.innerText = (am.type == 2 || am.level == 2 ? '★ ' : '') + am.formatBuffText();
                    (am.getTotalPoints() < minBeachAmuletPointsToStore[am.type] ? amuletToDestroyList : amuletToStoreList).appendChild(li);
                });
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                else if (document.getSelection) {
                    document.getSelection().removeAllRanges();
                }
                genericPopupShowInformationTips((originalBeach.length > 0 ? '本批' : '全部') + '装备熔炼完成，请分类后继续', 0);
                btnContinue.innerText = `继续 （剩余 ${originalBeach.length} 件装备）`;
                btnContinue.disabled = '';
                btnCloseOnBatch.disabled = '';
            }

            function processNewAmulets() {
                btnContinue.disabled = 'disabled';
                btnCloseOnBatch.disabled = 'disabled';

                if (freeCell == 0) {
                    scheduleFreeCell();
                }
                else if (pickCount > 0) {
                    let indices = [];
                    for (let li of amuletToDestroyList.children) {
                        indices.push(parseInt(li.getAttribute('item-index')));
                    }
                    if (indices.length > 0) {
                        let ids = [];
                        let warning = 0;
                        indices.sort((a, b) => a - b).forEach((i) => {
                            let am = newAmulets[i];
                            if (am.type == 2 || am.level == 2) {
                                warning++;
                            }
                            ids.push(am.id);
                        });
                        if (warning > 0 && !confirm(`这将把 ${warning} 个“樱桃／传奇”护符转换成果核，要继续吗？`)) {
                            btnContinue.disabled = '';
                            btnCloseOnBatch.disabled = '';
                            return;
                        }
                        amuletToDestroyList.innerHTML = '';
                        coresCollected += indices.length;
                        pickCount -= indices.length;
                        genericPopupShowInformationTips('转换果核...', 0);
                        beginPirlObjects(ids, refreshBackpacks, processNewAmulets);
                    }
                    else {
                        let bag = [];
                        queryObjects(bag, true, true, null, 0);
                        let ids = findNewObjects(bag, originalBag, (a, b) => a - b, false);
                        if (ids.length != pickCount) {
                            alert('将新护符放入仓库出错无法继续，请手动处理！');
                            window.location.reload();
                            return;
                        }
                        amuletToStoreList.innerHTML = '';
                        amuletsCollected += pickCount;
                        pickCount = 0;
                        genericPopupShowInformationTips('放入仓库...', 0);
                        beginMoveObjects(ids, g_object_move_path.bag2store, refreshBackpacks, processNewAmulets);
                    }
                }
                else if (originalBeach.length > 0) {
                    pickEquip();
                }
                else {
                    restoreBag(15);
                }
            }

            let originalFreeCell = 0;
            let originalBag = [];
            let originalBeach = [];
            let scheduledObjects = { equips : [] , amulets : [] };

            let freeCell = 0;
            let amuletsCollected = 0;
            let coresCollected = 0;
            let newAmulets = null;

            let minBeachEquipLevelToAmulet = (g_configMap.get('minBeachEquipLevelToAmulet')?.value ?? 1);
            queryObjects(originalBag, true, false, originalBeach, minBeachEquipLevelToAmulet);
            if (originalBeach.length == 0) {
                alert('海滩无可熔炼装备！');
                return;
            }

            function prepareBagList() {
                let info = (originalFreeCell > 0 ? [ '可', '更多' ] : [ '请', '必要' ])
                genericPopupShowInformationTips(`${info[0]}将部分背包内容入仓以提供${info[1]}的操作空间，点击“继续”开始`, 0);
                amuletToStoreList.parentNode.parentNode.children[0].innerText = '背包内容';
                amuletToDestroyList.parentNode.parentNode.children[0].innerText = '临时入仓';

                queryObjects(originalBag = [], false, true, null, 0);
                let bag = originalBag.slice().sort((a, b) => {
                    if (Array.isArray(a[1]) && Array.isArray(b[1])) {
                        return equipmentInfoComparer(a[1], b[1]);
                    }
                    else if (Array.isArray(a[1])){
                        return -1;
                    }
                    else if (Array.isArray(b[1])){
                        return 1;
                    }
                    return a[1].compareTo(b[1], true);
                });
                bag.forEach((item, index) => {
                    let e = item[1];
                    let isEq = Array.isArray(e);
                    let li = document.createElement('li');
                    li.style.backgroundColor = (isEq ? objectTypeColor[3] : objectTypeColor[e.type]);
                    li.setAttribute('item-index', index);
                    li.setAttribute('original-index', item[0]);
                    li.innerText = (isEq ? `${g_equipMap.get(e[0]).alias} Lv.${e[1]}` : e.formatBuffText());
                    amuletToStoreList.appendChild(li);
                });
            }

            function scheduleFreeCell() {
                let info = '背包已满，请选择至少一个背包内容暂时放入仓库以提供必要的操作空间。';
                function refreshOriginalBag() {
                    amuletToStoreList.innerHTML = '';
                    amuletToDestroyList.innerHTML = '';

                    originalFreeCell = 0;
                    queryObjects(originalBag = [], true, false, null, 0);
                    while (originalBag[originalBag.length - 1] == -1) {
                        originalBag.pop();
                        originalFreeCell++;
                    }
                    if (originalFreeCell == 0) {
                        alert(info);
                        scheduledObjects.equips = [];
                        scheduledObjects.amulets = [];

                        prepareBagList();
                        btnContinue.disabled = '';
                    }
                    else {
                        amuletToStoreList.parentNode.parentNode.children[0].innerText = '放入仓库';
                        amuletToDestroyList.parentNode.parentNode.children[0].innerText = '转换果核';

                        freeCell = originalFreeCell;
                        originalBag.sort((a, b) => a - b);
                        processNewAmulets();
                    }
                }

                let storeObjectsCount = (amuletToDestroyList?.children?.length ?? 0);
                if (originalFreeCell + storeObjectsCount == 0) {
                    alert(info);
                    btnContinue.disabled = '';
                    return;
                }
                else if (storeObjectsCount == 0) {
                    refreshOriginalBag();
                    return;
                }

                let indices = [];
                for (let li of amuletToDestroyList.children) {
                    indices.push(parseInt(li.getAttribute('original-index')));
                }
                indices.sort((a, b) => a - b);

                let ids = [];
                indices.forEach((i) => {
                    let e = originalBag[i][1];
                    let isEq = Array.isArray(e);
                    ids.push(isEq ? e[7] : e.id);
                    (isEq ? scheduledObjects.equips : scheduledObjects.amulets).push(e);
                });

                genericPopupShowInformationTips('临时放入仓库...', 0);
                beginMoveObjects(ids, g_object_move_path.bag2store, refreshBackpacks, refreshOriginalBag);
            }

            function restoreBag(closeCountDown) {
                function restoreCompletion() {
                    if (scheduledObjects.amulets.length > 0 || scheduledObjects.equips.length > 0) {
                        alert('部分背包内容无法恢复，请手动处理！');
                        console.log(scheduledObjects.equips);
                        console.log(scheduledObjects.amulets);
                        scheduledObjects.equips = [];
                        scheduledObjects.amulets = [];
                    }

                    if (closeCountDown > 0) {
                        genericPopupQuerySelector('#' + g_genericPopupInformationTipsId).previousSibling.innerText =
                            `操作完成，共获得 ${amuletsCollected} 个护符， ${coresCollected} 个果核`;
                        let timer = setInterval(() => {
                            if (--closeCountDown == 0) {
                                clearInterval(timer);
                                genericPopupClose();
                                window.location.reload();
                            }
                            else {
                                genericPopupShowInformationTips(`窗口将在 ${closeCountDown} 秒后关闭`, 0);
                            }
                        }, 1000);
                    }
                    else {
                        genericPopupClose();
                        window.location.reload();
                    }
                }

                if (scheduledObjects.equips.length == 0 && scheduledObjects.amulets.length == 0) {
                    restoreCompletion();
                }
                else {
                    genericPopupShowInformationTips('恢复背包内容...', 0);
                    beginRestoreObjects(null, scheduledObjects.amulets, scheduledObjects.equips, refreshBackpacks, restoreCompletion);
                }
            }

            let fixedContent =
                '<div style="width:100%;padding:10px 0px 0px 0px;font-size:16px;color:blue;"><b><span>双击条目进行分类间移动</span>' +
                  `<span id="${g_genericPopupInformationTipsId}" style="float:right;color:red;font-size:15px;"></span></b></div>`;
            let mainContent =
                '<div style="display:block;height:96%;width:100%;">' +
                  '<div style="position:relative;display:block;float:left;height:96%;width:48%;' +
                              'margin-top:10px;border:1px solid #000000;">' +
                    '<div style="display:block;width:100%;padding:5px;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">放入仓库</div>' +
                    '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                      '<ul id="amulet_to_store_list" style="cursor:pointer;"></ul></div></div>' +
                  '<div style="position:relative;display:block;float:right;height:96%;width:48%;' +
                              'margin-top:10px;border:1px solid #000000;">' +
                    '<div style="display:block;width:100%;padding:5px;border-bottom:2px groove #d0d0d0;margin-bottom:10px;">转换果核</div>' +
                    '<div style="position:absolute;display:block;height:1px;width:100%;overflow:scroll;">' +
                      '<ul id="amulet_to_destroy_list" style="cursor:pointer;"></ul></div></div></div>';

            genericPopupSetFixedContent(fixedContent);
            genericPopupSetContent('批量护符转换', mainContent);

            let amuletToStoreList = genericPopupQuerySelector('#amulet_to_store_list');
            let amuletToDestroyList = genericPopupQuerySelector('#amulet_to_destroy_list');
            amuletToStoreList.ondblclick = amuletToDestroyList.ondblclick = moveAmuletItem;

            while (originalBag[originalBag.length - 1] == -1) {
                originalBag.pop();
                originalFreeCell++;
            }
            if (originalBag.length > 0) {
                prepareBagList();
            }
            else {
                freeCell = originalFreeCell;
                genericPopupShowInformationTips('这会分批将海滩可熔炼装备转化为护符，请点击“继续”开始', 0);
            }

            let btnContinue = genericPopupAddButton(`继续 （剩余 ${originalBeach.length} 件装备 / ${originalFreeCell} 个背包空位）`,
                                                    0, processNewAmulets, true);
            let btnCloseOnBatch = genericPopupAddButton('本批完成后关闭', 0, (() => { originalBeach = []; processNewAmulets(); }), false);
            btnCloseOnBatch.disabled = 'disabled';
            genericPopupAddButton('关闭', 80, (() => { genericPopupClose(); window.location.reload(); }), false);

            genericPopupSetContentSize(400, 700, false);
            genericPopupShowModal(false);

            divHeightAdjustment(amuletToStoreList.parentNode);
            divHeightAdjustment(amuletToDestroyList.parentNode);
        }

        let asyncOperations = 2;
        let equipment = null;
        let equipedbtn = null;
        let bag, store;
        beginReadObjects(
            bag = [],
            store = [],
            () => {
                equipedbtn = bag.concat(store);
                asyncOperations--;

                GM_xmlhttpRequest({
                    method: g_postMethod,
                    url: g_readUrl,
                    headers: g_postHeader,
                    data: 'f=9',
                    onload: response => {
                        let div0 = document.createElement('div');
                        div0.innerHTML = response.responseText;

                        equipedbtn = equipedbtn.concat(Array.from(div0.querySelectorAll('div.row > div.fyg_tc > button.fyg_mp3')));
                        equipedbtn.sort(objectNodeComparer);
                        equipment = equipmentNodesToInfoArray(equipedbtn);

                        document.getElementById('analyze-indicator').innerText = '分析完成';
                        asyncOperations--;
                    }
                });
            },
            null);

        //分析装备并显示属性
        var g_expandingEquipment = false;
        function expandEquipment(equipment) {
            loadTheme();

            if (g_expandingEquipment || !(equipedbtn?.length > 0) || !(equipment?.length > 0) || equipment[0] == -1) {
                document.getElementById('analyze-indicator').innerText = '分析完成';
                return;
            }

            let beach_copy = document.getElementById('beach_copy');
            if (beach_copy == null) {
                let beachall = document.getElementById('beachall');
                beach_copy = beachall.cloneNode();
                beachall.style.display = 'none';
                beach_copy.id = 'beach_copy';
                beach_copy.style.backgroundColor = beach_BG ? 'black' : 'white';
                beachall.parentNode.insertBefore(beach_copy, beachall);

                (new MutationObserver((mList) => {
                    if (!g_expandingEquipment && mList?.length == 1 && mList[0].type == 'childList' &&
                        mList[0].addedNodes?.length == 1 && !(mList[0].removedNodes?.length > 0)) {

                        let node = mList[0].addedNodes[0];
                        if (node.hasAttribute('role')) {
                            node.remove();
                        }
                        else if (node.className?.indexOf('popover') >= 0) {
                            node.setAttribute('id', 'id_temp_apply_beach_BG');
                            changeBeachStyle('id_temp_apply_beach_BG', beach_BG);
                            node.removeAttribute('id');
                            if (node.className?.indexOf('popover-') < 0) {
                                let content = node.querySelector('.popover-content');
                                content.style.borderRadius = '5px';
                                content.style.border = (beach_BG ? '4px double white' : '4px double black');
                            }
                        }
                    }
                })).observe(beach_copy, { childList : true });
            }

            g_expandingEquipment = true;
            copyBeach(beach_copy);

            let udata = loadUserConfigData();
            if (udata.dataBeachSift == null) {
                udata.dataBeachSift = {};
                saveUserConfigData(udata);
            }

            let ignoreMysEquip = (udata.dataBeachSift.ignoreMysEquip ?? false);
            let ignoreEquipLevel = parseInt(udata.dataBeachSift.ignoreEquipLevel ?? '0');
            if (isNaN(ignoreEquipLevel)) {
                ignoreEquipLevel = 0;
            }

            let settings = {};
            for (let abbr in udata.dataBeachSift) {
                if (g_equipMap.has(abbr)) {
                    let checks = udata.dataBeachSift[abbr].split(',');
                    if (checks?.length == 5) {
                        let setting = [];
                        checks.forEach((checked) => { setting.push(checked.trim().toLowerCase() == 'true'); });
                        settings[abbr] = setting;
                    }
                }
            }

            const defaultSetting = [ false, false, false, false, false ];
            beach_copy.querySelectorAll('.btn.fyg_mp3').forEach((btn) => {
                let e = equipmentInfoParseNode(btn);
                if (e != null) {
                    let isExpanding = false;
                    let eqLv = equipmentGetLevel(btn);
                    if (forceExpand || eqLv > 2 || btn.getAttribute('data-content')?.match(/\[神秘属性\]/) != null) {
                        isExpanding = true;
                    }
                    else {
                        let setting = (settings[e[0]] ?? defaultSetting);
                        if (!setting[0]) {
                            let isFind = false;
                            let stLv;
                            for (let j = 0; j < equipment.length; j++) {
                                if (equipment[j][0] == e[0] &&
                                    !(ignoreMysEquip && equipment[j][6] == 1) &&
                                    (stLv = parseInt(equipment[j][1])) >= ignoreEquipLevel) {

                                    isFind = true;
                                    let e1 = [ parseInt(e[1]), parseInt(e[2]), parseInt(e[3]), parseInt(e[4]), parseInt(e[5]) ];
                                    let e2 = [ stLv, parseInt(equipment[j][2]), parseInt(equipment[j][3]),
                                               parseInt(equipment[j][4]), parseInt(equipment[j][5]) ];
                                    let res = defaultEquipmentNodeComparer(setting, e[0], e1, e2);
                                    if (res.majorAdv == 0) {
                                        if (res.minorAdv == 0) {
                                            isExpanding = false;
                                            break;
                                        }
                                        else if (!isExpanding) {
                                            isExpanding = (res.majorDis == 0);
                                        }
                                    }
                                    else {
                                        isExpanding = true;
                                    }
                                }
                            }
                            if (!isFind) {
                                isExpanding = true;
                            }
                        }
                    }
                    if (isExpanding) {
                        let btn0 = document.createElement('button');
                        btn0.className = `btn btn-light ${g_equipmentLevelTipClass[eqLv]}`;
                        btn0.style.minWidth = '200px';
                        btn0.style.padding = '0px';
                        btn0.style.marginBottom = '5px';
                        btn0.style.textAlign = 'left';
                        btn0.style.boxShadow = 'none';
                        btn0.style.lineHeight = '150%';
                        btn0.setAttribute('data-toggle', 'popover');
                        btn0.setAttribute('data-trigger', 'hover');
                        btn0.setAttribute('data-placement', 'bottom');
                        btn0.setAttribute('data-html', 'true');
                        btn0.setAttribute('onclick', btn.getAttribute('onclick'));

                        let popover = document.createElement('div');
                        popover.innerHTML = '<style> .popover { max-width:100%; } </style>';
                        let eqMeta = g_equipMap.get(e[0]);
                        equipedbtn.forEach((eqbtn) => {
                            if (eqMeta.index == parseInt(eqbtn.dataset.metaIndex)) {
                                let btn1 = document.createElement('button');
                                btn1.className = `btn btn-light ${g_equipmentLevelTipClass[equipmentGetLevel(eqbtn)]}`;
                                btn1.style.cssText =
                                    'min-width:180px;padding:10px 5px 0px 5px;text-align:left;box-shadow:none;background-color:none;' +
                                    'line-height:120%;border-width:3px;border-style:double;margin-right:5px;margin-bottom:5px;';
                                btn1.innerHTML = eqbtn.dataset.content;
                                if (btn1.lastChild.nodeType == 3) { //清除背景介绍文本
                                    btn1.lastChild.remove();
                                }
                                if (btn1.lastChild.className.indexOf('bg-danger') != -1) {
                                    btn1.lastChild.style.cssText = 'max-width:180px;padding:3px;white-space:pre-line;word-break:break-all;';
                                }
                                popover.appendChild(btn1);
                            }
                        });
                        btn0.setAttribute('data-content', popover.innerHTML);
                        btn0.innerHTML =
                            `<h3 class="popover-title" style="background-color:${getComputedStyle(btn0).getPropertyValue('background-color')}">` +
                            `${btn.dataset.originalTitle}</h3>` +
                            `<div class="popover-content-show" style="padding:10px 10px 0px 10px;">${btn.dataset.content}</div>`;
                        beach_copy.insertBefore(btn0, btn.nextSibling);
                    }
                }
            });

            $(function() {
                $('#beach_copy .btn[data-toggle="popover"]').popover();
            });
            $('#beach_copy .bg-danger.with-padding').css({
                'max-width': '200px',
                'padding': '5px',
                'white-space': 'pre-line',
                'word-break': 'break-all'
            });

            changeBeachStyle('beach_copy', beach_BG);
            document.getElementById('analyze-indicator').innerText = '分析完成';
            g_expandingEquipment = false;
        }

        function changeBeachStyle(container, bg)
        {
            $(`#${container}`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .popover-content-show`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .btn-light`).css({
                'background-color': bg ? 'black' : 'white'
            });
            $(`#${container} .popover-title`).css({
                'color': bg ? 'black' : 'white'
            });
            $(`#${container} .pull-right`).css({
                'color': bg ? 'black' : 'white'
            });
            $(`#${container} .bg-danger.with-padding`).css({
                'color': bg ? 'black' : 'white'
            });
        }

        //等待海滩装备加载
        let beachTimer = setInterval(() => {
            if ($('#beachall .btn').length != 0) {
                clearInterval(beachTimer);
                //等待装备读取完成
                let equipTimer = setInterval(() => {
                    if (asyncOperations == 0) {
                        clearInterval(equipTimer);

                        document.getElementById('analyze-indicator').innerText = '正在分析...';
                        setTimeout(() => { expandEquipment(equipment); }, 50);

                        (new MutationObserver(() => {
                            document.getElementById('analyze-indicator').innerText = '正在分析...';
                            setTimeout(() => { expandEquipment(equipment); }, 50);
                        })).observe(document.getElementById('beachall'), { childList : true });
                    }
                }, 500);
            }
        }, 500);

        function copyBeach(beach_copy) {
            beach_copy.innerHTML = '';
            Array.from(document.getElementById('beachall').children).sort(sortBeach).forEach((node) => {
                beach_copy.appendChild(node.cloneNode(true));
            });
        }

        function sortBeach(a, b) {
            let delta = equipmentGetLevel(a) - equipmentGetLevel(b);
            if (delta == 0) {
                if ((delta = parseInt(a.innerText.match(/\d+/)[0]) - parseInt(b.innerText.match(/\d+/)[0])) == 0) {
                    delta = (a.getAttribute('data-original-title') < b.getAttribute('data-original-title') ? -1 : 1);
                }
            }
            return -delta;
        }

        document.querySelector('body').style.paddingBottom = '1000px';
    }
    else if (window.location.pathname == g_guguzhenPK) {
        let pkConfigDiv = document.createElement('div');
        pkConfigDiv.style.className = 'panel-heading';
        pkConfigDiv.style.float = 'right';
        pkConfigDiv.innerHTML =
            `<label for="forgeAutoCheckbox" style="margin-right:5px;cursor:pointer;">满进度自动生成</label>
             <input type="checkbox" id="forgeAutoCheckbox" style="margin-right:15px;" />
             <label for="indexRallyCheckbox" style="margin-right:5px;cursor:pointer;">为攻击回合加注索引</label>
             <input type="checkbox" id="indexRallyCheckbox" style="margin-right:15px;" />
             <label for="keepPkRecordCheckbox" style="margin-right:5px;cursor:pointer;">暂时保持战斗记录</label>
             <input type="checkbox" id="keepPkRecordCheckbox" style="margin-right:15px;" />
             <label for="autoTaskEnabledCheckbox" style="margin-right:5px;cursor:pointer;">允许执行自定义任务</label>
             <input type="checkbox" id="autoTaskEnabledCheckbox" />`;

        let forgeAuto = setupConfigCheckbox(pkConfigDiv.querySelector('#forgeAutoCheckbox'),
                                                  g_forgeAutoStorageKey,
                                                  (checked) => { forgeAuto = checked; },
                                                  null);

        let indexRally = setupConfigCheckbox(pkConfigDiv.querySelector('#indexRallyCheckbox'),
                                             g_indexRallyStorageKey,
                                             (checked) => { indexRally = checked; },
                                             null);

        let keepPkRecord = setupConfigCheckbox(pkConfigDiv.querySelector('#keepPkRecordCheckbox'),
                                               g_keepPkRecordStorageKey,
                                               (checked) => { keepPkRecord = checked; },
                                               null);

        let autoTaskEnabled = setupConfigCheckbox(pkConfigDiv.querySelector('#autoTaskEnabledCheckbox'),
                                                  g_autoTaskEnabledStorageKey,
                                                  () => { window.location.reload(); },
                                                  null);

        document.querySelector('div.panel.panel-primary > div.panel-heading').appendChild(pkConfigDiv);

        let div0_pk_text_more = document.createElement('div');
        div0_pk_text_more.setAttribute('id', 'pk_text_more');
        div0_pk_text_more.setAttribute('class', 'panel-body');
        document.getElementsByClassName('panel panel-primary')[1].appendChild(div0_pk_text_more);

        let addingRallyIndices = false;
        let pkText = document.querySelector('#pk_text').innerHTML;
        (new MutationObserver(() => {
            if (addingRallyIndices) {
                return;
            }
            else if (indexRally) {
                addingRallyIndices = true;
                let turn_l = 0;
                let turn_r = 0;
                document.querySelectorAll('#pk_text p.bg-special').forEach((e, i) => {
                    let myTurn = (e.className.indexOf('fyg_tr') >= 0);
                    let rally = document.createElement('b');
                    rally.innerText = (myTurn ? `${i + 1} （${++turn_l}）` : `（${++turn_r}） ${i + 1}`);
                    rally.style.float = (myTurn ? 'left' : 'right');
                    rally.style.marginLeft = rally.style.marginRight = '10px';
                    e.appendChild(rally);
                });
                addingRallyIndices = false;
            }
            if (keepPkRecord) {
                document.querySelector('#pk_text_more').innerHTML = pkText + document.querySelector('#pk_text_more').innerHTML;
                pkText = document.querySelector('#pk_text').innerHTML;
                $('#pk_text_more .btn[data-toggle="tooltip"]').tooltip();
            }
        })).observe(document.querySelector('#pk_text'), { characterData : true , childList : true });

        function setupNotificationClicker() {
            let timer = setInterval(() => {
                let panels = document.querySelectorAll('#pklist > div.row > div.col-md-2.fyg_tc');
                if (panels?.length > 0) {
                    clearInterval(timer);

                    panels.forEach((panel) => {
                        panel.onclick = ((e) => {
                            if (e.target.className == 'col-md-2 fyg_tc' || e.target.parentNode.className == 'col-md-2 fyg_tc') {
                                stoneProgressTip();
                            }
                        });
                    });
                }
            }, 200);
        }
        setupNotificationClicker();

        (new MutationObserver(() => {
            stoneProgressTip();
            setupNotificationClicker();
        })).observe(document.querySelector('#pklist'), { characterData : true, childList : true, subtree : true });
        if (autoTaskEnabled) {
            let btngroup0 = document.createElement('div');
            btngroup0.setAttribute('class', 'action_selector');
            btngroup0.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;
            let btngroup1 = document.createElement('div');
            btngroup1.setAttribute('class', 'action_selector');
            btngroup1.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">5</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">15</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">25</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">35</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">45</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">55</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">65</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">75</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">85</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">95</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;
            let btngroup2 = document.createElement('div');
            btngroup2.setAttribute('class', 'action_selector');
            btngroup2.innerHTML = `<p></p><div class="btn-group" role="group">
                  <button type="button" class="btn btn-secondary">0</button>
                  <button type="button" class="btn btn-secondary">5</button>
                  <button type="button" class="btn btn-secondary">10</button>
                  <button type="button" class="btn btn-secondary">15</button>
                  <button type="button" class="btn btn-secondary">20</button>
                  <button type="button" class="btn btn-secondary">25</button>
                  <button type="button" class="btn btn-secondary">30</button>
                  <button type="button" class="btn btn-secondary">35</button>
                  <button type="button" class="btn btn-secondary">40</button>
                  <button type="button" class="btn btn-secondary">45</button>
                  <button type="button" class="btn btn-secondary">50</button>
                  <button type="button" class="btn btn-secondary">55</button>
                  <button type="button" class="btn btn-secondary">60</button>
                  <button type="button" class="btn btn-secondary">65</button>
                  <button type="button" class="btn btn-secondary">70</button>
                  <button type="button" class="btn btn-secondary">75</button>
                  <button type="button" class="btn btn-secondary">80</button>
                  <button type="button" class="btn btn-secondary">85</button>
                  <button type="button" class="btn btn-secondary">90</button>
                  <button type="button" class="btn btn-secondary">95</button>
                  <button type="button" class="btn btn-secondary">100</button>
                </div>`;

            let taskObserver = new MutationObserver(() => {
                if (document.getElementsByClassName('btn-secondary').length == 0) {
                    let addbtn = setInterval(() => {
                        let col = document.querySelector('#pklist > div > div.col-md-8');
                        if (col != null) {
                            clearInterval(addbtn);

                            let obtns = document.getElementsByClassName('btn-block dropdown-toggle fyg_lh30');
                            col.insertBefore(btngroup0, obtns[0]);
                            col.insertBefore(btngroup1, obtns[1]);
                            col.insertBefore(btngroup2, obtns[2]);

                            let btnAutoTask = document.getElementById('btnAutoTask');
                            if (btnAutoTask == null) {
                                let execDiv = document.createElement('div');
                                execDiv.innerHTML =
                                    `<p></p><button type="button" class="btn" id="btnAutoTask" style="margin-right:15px;">任务执行</button>
                                     <input type="checkbox" id="checkStoneProgressCheckbox" style="margin-right:5px;" />
                                     <label for="checkStoneProgressCheckbox" style="cursor:pointer;">任务执行过程中检查宝石进度提醒</label>`;
                                let checkStoneProgress = setupConfigCheckbox(execDiv.querySelector('#checkStoneProgressCheckbox'),
                                                                             g_autoTaskCheckStoneProgressStorageKey,
                                                                             (checked) => { checkStoneProgress = checked; },
                                                                             null);
                                col.appendChild(execDiv);
                                btnAutoTask = document.getElementById('btnAutoTask');

                                function gobattle() {
                                    btnAutoTask.disabled = 'disabled';
                                    let times = [ 0, 0, 0 ];
                                    let sum = 0;
                                    let breakTask = false;
                                    $('.btn-secondary').each(function(i, e) {
                                        if ($(e).attr('style') != null && $(e).css('background-color') == 'rgb(135, 206, 250)') {
                                            let a = parseInt(e.innerText);
                                            let b = $('.btn-group .btn-secondary').index(e);
                                            sum += a;
                                            if (b < 11) {
                                                times[0] = a / 10;
                                            } else if (b >= 11 && b < 32) {
                                                times[1] = a / 5;
                                            } else if (b >= 32) {
                                                times[2] = a / 5;
                                            }
                                        }
                                    });

                                    if (sum <= parseInt(document.getElementsByClassName('fyg_colpz03')[0].innerText)) {
                                        let gox_data = getPostData(/gox\(\)\{[\s\S]*\}/m, /data: ".*"/).slice(7, -1);

                                        function func0(time) {
                                            if (time == 0) {
                                                if (times[0] != 0) {
                                                    GM_xmlhttpRequest({
                                                        method: g_postMethod,
                                                        url: g_readUrl,
                                                        headers: g_postHeader,
                                                        data: 'f=12',
                                                        onload: response => {
                                                            let ap = response.responseText.match(/class="fyg_colpz03" style="font-size:32px;font-weight:900;">\d+</)[0].match(/>\d+</)[0].slice(1, -1);
                                                            document.getElementsByClassName('fyg_colpz03')[0].innerText = ap;
                                                            let rankp = response.responseText.match(/class="fyg_colpz02" style="font-size:32px;font-weight:900;">\d+%</)[0].match(/\d+%/)[0];
                                                            document.getElementsByClassName('fyg_colpz02')[0].innerText = rankp;
                                                            times[0] = 0;
                                                        }
                                                    });
                                                }
                                            }
                                            else if (checkStoneProgress) {
                                                stoneProgressTip((tip) => {
                                                    if (tip) {
                                                        let div_info = document.createElement('div');
                                                        div_info.style.color = 'red';
                                                        div_info.innerText = '有宝石收藏相关功能进度已满，请先行处理';
                                                        btnAutoTask.parentNode.appendChild(div_info);
                                                        breakTask = true;
                                                        func0(0);
                                                    }
                                                    else {
                                                        goxRequest();
                                                    }
                                                });
                                            }
                                            else {
                                                goxRequest();
                                            }

                                            function goxRequest() {
                                                function parseGainResponse(response)
                                                {
                                                    let gainText = '';
                                                    if (response.indexOf('<p>获得了</p>') >= 0) {
                                                        let gain;
                                                        let sp = '获得';
                                                        let regex = />.+?\s+(\d+\s*%?)\s+(.+?)</g;
                                                        while ((gain = regex.exec(response))?.length == 3) {
                                                            gainText += `${sp}${gain[2].trim()}：${gain[1]}`;
                                                            sp = ', ';
                                                        }
                                                        let lvlUp = response.match(/角色 \[ [^\s]+ \] 卡片等级提升！/g);
                                                        if (lvlUp?.length > 0) {
                                                            sp = '<br> ';
                                                            lvlUp.forEach((e) => {
                                                                gainText += `${sp}${e}`;
                                                                sp = ', ';
                                                            });
                                                        }
                                                    }
                                                    return gainText;
                                                }

                                                GM_xmlhttpRequest({
                                                    method: g_postMethod,
                                                    url: g_postUrl,
                                                    headers: g_postHeader,
                                                    data: gox_data,
                                                    onload: response => {
                                                        let gainText = parseGainResponse(response.responseText);
                                                        if (gainText.length > 0) {
                                                            let div_info = document.createElement('div');
                                                            div_info.innerHTML = gainText;
                                                            btnAutoTask.parentNode.appendChild(div_info);
                                                            func0(time - 1);
                                                        } else {
                                                            let div_info = document.createElement('div');
                                                            div_info.innerText = '段位进度不足或无法识别的应答信息';
                                                            btnAutoTask.parentNode.appendChild(div_info);
                                                            func0(0);
                                                        }
                                                    }
                                                });
                                            }
                                        }

                                        function func1(time) {
                                            if (time == 0) {
                                                times[1] = 0;
                                                return;
                                            }
                                            let observerPk = new MutationObserver((mutationsList, observer) => {
                                                let isPk = 0;
                                                for (let mutation of mutationsList) {
                                                    if (mutation.type == 'childList') {
                                                        isPk = 1;
                                                    }
                                                }
                                                if (isPk) {
                                                    observerPk.disconnect();
                                                    func1(time - 1);
                                                }
                                            });
                                            observerPk.observe(document.querySelector('#pk_text'), { characterData : true , childList : true });
                                            jgjg(1);
                                        }

                                        function func2(time) {
                                            if (time == 0) {
                                                times[2] = 0;
                                                btnAutoTask.disabled = '';
                                                return;
                                            }
                                            let observerPk = new MutationObserver((mutationsList, observer) => {
                                                let isPk = 0;
                                                for (let mutation of mutationsList) {
                                                    if (mutation.type == 'childList') {
                                                        isPk = 1;
                                                    }
                                                }
                                                if (isPk) {
                                                    observerPk.disconnect();
                                                    func2(time - 1);
                                                }
                                            });
                                            observerPk.observe(document.querySelector('#pk_text'), { characterData : true , childList : true });
                                            jgjg(2);
                                        }

                                        func0(times[0]);

                                        let waitFor0 = setInterval(() => {
                                            if (times[0] == 0 || breakTask) {
                                                clearInterval(waitFor0);
                                                if (!breakTask) {
                                                    func1(times[1]);
                                                }
                                                else {
                                                    btnAutoTask.disabled = '';
                                                }
                                            }
                                        }, 1000);

                                        let waitFor1 = setInterval(() => {
                                            if ((times[0] == 0 && times[1] == 0) || breakTask) {
                                                clearInterval(waitFor1);
                                                if (!breakTask) {
                                                    func2(times[2]);
                                                }
                                                else {
                                                    btnAutoTask.disabled = '';
                                                }
                                            }
                                        }, 1000);
                                    } else {
                                        alert('体力不足');
                                        btnAutoTask.disabled = '';
                                    }
                                }
                                btnAutoTask.onclick = gobattle;
                            }
                            function selector_act() {
                                var btnNum = $('.btn-group .btn-secondary').index(this);
                                $('.btn-group .btn-secondary')
                                    .eq(btnNum)
                                    .css('background-color', 'rgb(135, 206, 250)')
                                    .siblings('.btn-group .btn-secondary')
                                    .css('background-color', 'rgb(255, 255, 255)');
                            }
                            let btnselector = document.getElementsByClassName('btn-secondary');
                            for (let i = 0; i < btnselector.length; i++) {
                                btnselector[i].addEventListener('click', selector_act, false);
                            }
                        }
                    }, 1000);
                }
            });
            taskObserver.observe(document.getElementsByClassName('panel panel-primary')[0], { childList : true, subtree : true, });
        }
    }
    else if (window.location.pathname == g_guguzhenWish) {
        let timer = setInterval(() => {
            let wishPoints = parseInt(document.getElementById('xys_dsn')?.innerText);
            if (!isNaN(wishPoints)) {
                clearInterval(timer);

                for (let title of document.getElementsByClassName('panel-heading')) {
                    if (title.innerText.indexOf('我的愿望') >= 0) {
                        let div = document.createElement('div');
                        div.style.float = 'right';
                        div.innerHTML =
                            '<label for="ignoreWishpoolExpirationCheckbox" style="margin-right:5px;cursor:pointer;">禁止许愿池过期提醒</label>' +
                            '<input type="checkbox" id="ignoreWishpoolExpirationCheckbox" />';

                        setupConfigCheckbox(div.querySelector('#ignoreWishpoolExpirationCheckbox'),
                                            g_ignoreWishpoolExpirationStorageKey,
                                            () => { window.location.reload(); },
                                            null);

                        title.appendChild(div);
                        break;
                    }
                }

                function getWishPoints() {
                    let text = 'WISH';
                    for (let i = 7; i <= 13; i++) {
                        text += (' ' + (document.getElementById('xyx_' + ('0' + i).slice(-2))?.innerText ?? '0'));
                    }
                    return text;
                }

                let div = document.createElement('div');
                div.className = 'row';
                div.innerHTML =
                    '<div class="panel panel-info"><div class="panel-heading"> 计算器许愿点设置 （' +
                    '<a href="#" id="copyWishPoints">点击这里复制到剪贴板</a>）</div>' +
                    '<input type="text" class="panel-body" id="calcWishPoints" readonly="true" ' +
                           'style="border:none;outline:none;" value="" /></div>';

                let calcWishPoints = div.querySelector('#calcWishPoints');
                calcWishPoints.value = getWishPoints();

                let xydiv = document.getElementById('xydiv');
                xydiv.parentNode.parentNode.insertBefore(div, xydiv.parentNode.nextSibling);

                div.querySelector('#copyWishPoints').onclick = ((e) => {
                    calcWishPoints.select();
                    if (document.execCommand('copy')) {
                        e.target.innerText = '许愿点设置已复制到剪贴板';
                    }
                    else {
                        e.target.innerText = '复制失败，这可能是因为浏览器没有剪贴板访问权限，请进行手工复制';
                    }
                });

                (new MutationObserver(() => {
                    calcWishPoints.value = getWishPoints();
                })).observe(xydiv, { subtree : true , childList : true , characterData : true });
            }
        }, 500);
    }
})();
