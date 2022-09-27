// ==UserScript==
// @name        GuguTown ThemePack Manager
// @name:zh-CN  咕咕镇主题包管理器
// @name:zh-TW  咕咕鎮主題包管理器
// @name:ja     咕咕镇テーマパックマネージャー
// @namespace   https://github.com/HazukiKaguya/GuguTown_ThemePack
// @homepage    https://github.com/HazukiKaguya/GuguTown_ThemePack
// @version     3.4.0
// @description WebGame GuguTown ThemePack Manager.
// @description:zh-CN 气人页游 咕咕镇 主题包管理器。
// @description:zh-TW 氣人頁遊 咕咕鎮 主題包管理器。
// @description:ja オンラインゲーム 咕咕镇 テーマパック マネージャー
// @icon        https://sticker.inari.site/favicon.ico
// @author      Hazuki Kaguya
// @copyright   2022- Hazukikaguya
// @match       https://*.guguzhen.com/*
// @match       https://*.momozhen.com/*
// @run-at      document-end
// @require     https://greasyfork.org/scripts/450822-spine-webgl/code/spine-webgl.js?version=1098282
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @require     https://cdn.jsdelivr.net/npm/lzma@2.3.2/src/lzma_worker.js
// @license     MIT License
// @downloadURL https://github.com/HazukiKaguya/GuguTown_ThemePack/raw/main/GuguTown_ThemePack.user.js
// @updateURL   https://github.com/HazukiKaguya/GuguTown_ThemePack/raw/main/GuguTown_ThemePack.user.js
// @grant       none
// ==/UserScript==
/* eslint-env jquery */
'use strict';

/**
 * Settings.
 */
let timeCheck=new Date().getTime();
const defaultConf = {
    "language":"zh",
    "ThemePack":"classic",
    "iconSize":"50px",
    "kanbansize":"100",
    "useOldNames":false,"useThemeName":false,
    "showKanban":false,"showCG":false,"voiceO":false,
    "yourcard":"舞",
}
,Language = {
    "zh": {
        "initUFG":"此自定义主题包立绘功能不可用！请更新主题包或关闭立绘功能！",
        "initUVO":"此自定义主题包语音功能不可用！请更新主题包或关闭语音功能！",
        "initUOT":"自定义主题包json数据彻底过期，请及时更新！主题包未启用！",
        "initUNU":"自定义主题包json数据不存在，主题包未启用！",
        "cuuid":"生成引继码",
        "vuuid":"输入引继码",
        "puuid":"请复制引继码，或者自行输入8位小写字母+数字后按确定",
        "menuTheme":"主题包",
        "menuUser":"写入自定义主题",
        "menuIcon":"图标大小",
        "menuKanban":"看板大小",
        "menuOldEQ":"旧版装备名",
        "menuThemeEQ":"主题装备名",
        "menuSCG":"立绘功能",
        "menuSVO":"语音功能",
        "menuSKB":"看板功能",
        "themeSW":"按【确定】选择主题包，按【取消】恢复默认主题包。",
        "themeSA":"输入1使用【测试用主题包】；输入2使用【自定义主题包】；\n输入0不启用主题更改；输入其他使用【旧版风格主题包】；\n【测试用主题包】中的主题装备名称版权归Cygames所有。",
        "themeDF":"按【确定】恢复默认主题包，按【取消】则不操作。",
        "iconUA":"请输入图标大小,格式应为32-128间的数字+px\n示例：50px",
        "kanbanUA":"请输入看板大小,数字为百分比。",
        "menuUA":"请输入自定义主题包的json数据,访问以下链接以查看完整的json格式。",
        "cloudPass":"请 输入/设置 云同步密码",
        "equip":["探险者之剑","探险者短弓","探险者短杖","狂信者的荣誉之刃","反叛者的刺杀弓","幽梦匕首","光辉法杖","荆棘盾剑","荆棘剑盾","陨铁重剑","饮血魔剑","饮血长枪","探险者手环","探险者手套","命师的传承手环","秃鹫手环",
                 "秃鹫手套","探险者铁甲","探险者皮甲","探险者布甲","旅法师的灵光袍","战线支撑者的荆棘重甲","复苏战衣","复苏木甲","挑战斗篷","探险者耳环","探险者头巾","占星师的耳饰","占星师的发饰","萌爪耳钉","天使缎带","海星戒指"]
    },
    "zht":{
        "initUFG":"此自定義主題包立繪功能不可用！請更新主題包或關閉立繪功能！",
        "initUVO":"此自定義主題包語音功能不可用！請更新主題包或關閉語音功能！",
        "initUOT":"自定義主題包json數據徹底過期，請及時更新！主題包未啟用！",
        "initUNU":"自定義主題包json數據不存在，主題包未啟用！",
        "cuuid":"生成引继码",
        "vuuid":"输入引继码",
        "puuid":"请复制引继码，或者自行输入8位小写字母+数字后按确定",
        "menuTheme":"主題包",
        "menuUser":"寫入自定義主題",
        "menuIcon":"圖標大小",
        "menuKanban":"看板大小",
        "menuOldEQ":"舊的裝備名",
        "menuThemeEQ":"主題裝備名",
        "menuSCG":"立繪機能",
        "menuSVO":"語音機能",
        "menuSKB":"看板機能",
        "themeSW":"按【確定】選擇主題包，按【取消】恢複默認主題包。",
        "themeSA":"輸入1使用【測試用主題包】；輸入2使用【自定義主題包】；\n輸入0不啟用主題更改；輸入其他使用【舊版風格主題包】；\n【測試用主題包】中的主題裝備名稱版權歸Cygames所有。",
        "themeDF":"按【確定】恢複默認主題包，按【取消】則不操作。",
        "iconUA":"請輸入圖標大小,格式應為32-128間的數字+px\n示例：50px",
        "kanbanUA":"請輸入看板大小,數字為百分比。",
        "menuUA":"請輸入自定義主題包的json數據,訪問以下連結以查看完整的json格式。",
        "cloudPass":"請 輸入/设置 云同步密码",
        "equip":["探險者之劍","探險者短弓","探險者短杖","狂信者的榮譽之刃","反叛者的刺殺弓","幽夢匕首","光輝法杖","荊棘盾劍","荊棘劍盾","隕鐵重劍","飲血魔劍","飲血長槍","探險者手環","探險者手套","命師的傳承手環","禿鹫手環",
                 "禿鹫手套","探險者鐵甲","探險者皮甲","探險者布甲","旅法師的靈光袍","戰線支撐者的荊棘重甲","複蘇戰衣","複蘇木甲","挑戰鬥篷","探險者耳環","探險者頭巾","占星師的耳飾","占星師的發飾","萌爪耳釘","天使緞帶","海星戒指"]
    },
    "ja": {
        "initUFG":"このユーザー テーマパックの立ち絵機能は使用できません！このテーマパックを更新するか、立ち絵機能無効化してください。",
        "initUVO":"このユーザー テーマパックのボイス機能は使用できません！このテーマパックを更新するか、ボイス機能無効化してください。",
        "initUOT":"このユーザー テーマパックのJSONは古くなっています！このテーマパックをできるだけ早く更新してください！テーマパックが有効になっていません！",
        "initUNU":"このユーザー テーマパックのJSONは存在しません！テーマパックが有効になっていません！",
        "cuuid":"引継Code作成",
        "vuuid":"引継Code入力",
        "puuid":"请复制引继码，或者自行输入8位小写字母+数字后按确定",
        "menuTheme":"テーマパック",
        "menuUser":"テーマJSON入力",
        "menuIcon":"アイコン大小",
        "menuKanban":"看板大小",
        "menuOldEQ":"旧装備名",
        "menuThemeEQ":"テーマ装備名",
        "menuSCG":"立ち絵",
        "menuSVO":"ボイス",
        "menuSKB":"看板娘",
        "themeSW":"【OK】をクリックしてテーマパックを切り替えます； \n【キャンセル】をクリックするとデフォルトのテーマパックが使用されます。",
        "themeSA":"1 を入力して【テスト テーマパック】を使用；2 を入力して【ユーザー テーマパック】を使用；\n0 を入力して【オリジナル テーマパック】を使用；その他のテキストを入力して【クラシック テーマパック】を使用；\n【テスト テーマパック】テーマ装備名の著作権は cygames に帰属します。",
        "themeDF":"【OK】をクリックして【クラシック テーマパック】を使用します；\nキャンセルする場合は【キャンセル】をクリックしてください。",
        "iconUA":"アイコンのサイズを入力してください。32 ～ 128 の数値で px を使用する必要があります。\n 例： 50px",
        "kanbanUA":"看板のサイズを入力してください。％を除いた数値である必要があります。\n 例： 100",
        "menuUA":"カスタマイズ テーマパックの JSON データを入力してください。完全な JSON 形式を表示するには、以下のリンクにアクセスしてください。",
        "cloudPass":"請 輸入/设置 云同步密码",
        "equip":["探検家の剣","探検家の弓","探検家の杖","狂信者の栄光刃","反逆者の暗殺弓","ダークドリーム匕首","輝く杖","いばら盾剣","いばら剣盾","流星鉄のエペの剣","血に飢えた魔剣","血に飢えた槍","探検家の腕輪","探検家の手袋",
                 "命の師匠の継承腕輪","ハゲタカ腕輪","ハゲタカ手袋","探検家の鎧","探検家の革","探検家の衣","旅法師のローブ","フロントサポーターのトゲアーマー","蘇るスーツ","蘇るウッドアーマー","挑戦者のマント",
                 "探検家のイヤリング","探検家のマフラー","占星術師のイヤリング","占星術師の髪飾り","萌え猫爪のイヤリング","天使のリボン","海星指輪"]
    },
    "en": {
        "initUFG":"The CG Function in this User ThemePack is unavailable! Please Update This ThemePack or Turn Off CG Function!",
        "initUVO":"The Voice Function in this User ThemePack is unavailable! Please Update This ThemePack or Turn Off Voice Function!",
        "initUOT":"The JSON of this User ThemePack is out of date! Please Update This ThemePack ASAP! ThemePack not activated!",
        "initUNU":"The JSON of this User ThemePack is non-existent! ThemePack not activated!",
        "cuuid":"Create Code",
        "vuuid":"Input Code",
        "puuid":"请复制引继码，或者自行输入8位小写字母+数字后按确定",
        "menuTheme":"ThemePack",
        "menuUser":"UserTheme",
        "menuIcon":"IconSize",
        "menuKanban":"KanbanSize",
        "menuOldEQ":"Old Equip-Name",
        "menuThemeEQ":"Theme Equip-Name",
        "menuSCG":"CGimg",
        "menuSVO":"Voice",
        "menuSKB":"Kanban",
        "themeSW":"click【ok】 to switch ThemePack; click【cancel】 to use default ThemePack.",
        "themeSA":"input 1 to use 【Test ThemePack】;\ninput 2 to use【User ThemePack】;\ninput 0 to use 【origin ThemePack】;\ninput any other text to use 【classic ThemePack】;\nThe copyright of ThemeEquipName in 【Test ThemePack】 belongs to cygames.",
        "themeDF":"click【ok】to use 【origin ThemePack】; click【cancel】to cancel.",
        "iconUA":"Please input the size of Icons, it should be a num in 32-128 with px\n example: 50px",
        "kanbanUA":"Please input the size of kanban, it should be a num without %\n example: 100",
        "menuUA":"Please input The JSON data of UserThemePack,\n Access the link below to see the complete JSON format.",
        "cloudPass":"Please input/set cloud sync password",
        "equip":["Explorer's Sword","Explorer's Bow","Explorer's Staff","Honor Blade of crazy believer","Rebel's assassination Bow","Faint Dream Dagger","Shining Staff","Thorny shield Sword","Thorny sword Shield","Meteoric iron Epee Sword",
                 "Bloodthirsty demon Sword","Bloodthirsty Lance","Explorer's Bracelet","Explorer's Glove","命's Bracelet from her Shifu","Vulture Bracelet","Vulture Glove","Explorer's Armor","Explorer's Leather","Explorer's Cloth","Magician's aura Robe",
                 "Thorny Armor of the front supporter","Recovery suit","Revived wood armour","Challenger's Cloak","Explorer's Earrings","Explorer's Scarf","Astrologer's Earrings","Astrologer's hair ornament","Neko Claw Earrings","Angel's Ribbon","Starfish Ring"]
    }
}
,originTheme = {
    "url":"ys/icon/",
    "old":"1",
    "ext":".gif",
    "background":"",
    "kanbanbg":"https://sticker.inari.site/api/null.gif",
    "backsize":"background-size:80% 80%;",
    "wqbacksize":"background-size:100% 100%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "equip-zh":["探险者之剑","探险者短弓","探险者短杖","狂信者的荣誉之刃","反叛者的刺杀弓","幽梦匕首","光辉法杖","荆棘盾剑","荆棘剑盾","陨铁重剑","饮血魔剑","饮血长枪","探险者手环","探险者手套","命师的传承手环","秃鹫手环",
                "秃鹫手套","探险者铁甲","探险者皮甲","探险者布甲","旅法师的灵光袍","战线支撑者的荆棘重甲","复苏战衣","复苏木甲","挑战斗篷","探险者耳环","探险者头巾","占星师的耳饰","占星师的发饰","萌爪耳钉","天使缎带","海星戒指"],
    "equip-zht":["探險者之劍","探險者短弓","探險者短杖","狂信者的榮譽之刃","反叛者的刺殺弓","幽夢匕首","光輝法杖","荊棘盾劍","荊棘劍盾","隕鐵重劍","飲血魔劍","飲血長槍","探險者手環","探險者手套","命師的傳承手環","禿鹫手環",
                 "禿鹫手套","探險者鐵甲","探險者皮甲","探險者布甲","旅法師的靈光袍","戰線支撐者的荊棘重甲","複蘇戰衣","複蘇木甲","挑戰鬥篷","探險者耳環","探險者頭巾","占星師的耳飾","占星師的發飾","萌爪耳釘","天使緞帶","海星戒指"],
    "equip-ja":["探検家の剣","探検家の弓","探検家の杖","狂信者の栄光刃","反逆者の暗殺弓","ダークドリーム匕首","輝く杖","いばら盾剣","いばら剣盾","流星鉄のエペの剣","血に飢えた魔剣","血に飢えた槍","探検家の腕輪","探検家の手袋",
                 "命の師匠の継承腕輪","ハゲタカ腕輪","ハゲタカ手袋","探検家の鎧","探検家の革","探検家の衣","旅法師のローブ","フロントサポーターのトゲアーマー","蘇るスーツ","蘇るウッドアーマー","挑戦者のマント",
                 "探検家のイヤリング","探検家のマフラー","占星術師のイヤリング","占星術師の髪飾り","萌え猫爪のイヤリング","天使のリボン","海星指輪"],
    "equip-en":["Explorer's Sword","Explorer's Bow","Explorer's Staff","Honor Blade of crazy believer","Rebel's assassination Bow","Faint Dream Dagger","Shining Staff","Thorny shield Sword","Thorny sword Shield","Meteoric iron Epee Sword",
                 "Bloodthirsty demon Sword","Bloodthirsty Lance","Explorer's Bracelet","Explorer's Glove","命's Bracelet from her Shifu","Vulture Bracelet","Vulture Glove","Explorer's Armor","Explorer's Leather","Explorer's Cloth","Magician's aura Robe",
                 "Thorny Armor of the front supporter","Recovery suit","Revived wood armour","Challenger's Cloak","Explorer's Earrings","Explorer's Scarf","Astrologer's Earrings","Astrologer's hair ornament","Neko Claw Earrings","Angel's Ribbon","Starfish Ring"],
    "dessert":["z903","z902","z901"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertlevel-zht":["稀有","史詩","傳奇"],
    "dessertlevel-ja":["レア","大作","伝説"],
    "dessertlevel-en":["Rare   ","Epic   ","Legend "],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
    "dessertname-zht":["蘋果護身符","葡萄護身符","櫻桃護身符"],
    "dessertname-ja":["林檎お守り","葡萄お守り","桜ん坊お守り"],
    "dessertname-en":["apple amulet","grape amulet","cherry amulet"],
    "魔灯之灵（野怪":"https://sticker.inari.site/null.gif",
    "六眼飞鱼（野怪":"https://sticker.inari.site/null.gif",
    "铁皮木人（野怪":"https://sticker.inari.site/null.gif",
    "迅捷魔蛛（野怪":"https://sticker.inari.site/null.gif",
    "食铁兽（野怪"  :"https://sticker.inari.site/null.gif",
    "晶刺豪猪（野怪":"https://sticker.inari.site/null.gif",
    "舞":["3000","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "默":["3001","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "琳":["3002","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "艾":["3003","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "梦":["3004","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "薇":["3005","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "伊":["3006","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "冥":["3007","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "命":["3008","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "希":["3009","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "voice":["on.mp3","off.mp3"],
    "舞voice":["/vo/",".mp3"],
    "默voice":["/vo/",".mp3"],
    "琳voice":["/vo/",".mp3"],
    "艾voice":["/vo/",".mp3"],
    "梦voice":["/vo/",".mp3"],
    "薇voice":["/vo/",".mp3"],
    "伊voice":["/vo/",".mp3"],
    "冥voice":["/vo/",".mp3"],
    "命voice":["/vo/",".mp3"],
    "希voice":["/vo/",".mp3"],
    "a1":["z2101","z1","探险者之剑","探险者之剑","z/z2101_"],
    "a2":["z2102","z2","探险者短弓","探险者短弓","z/z2102_"],
    "a3":["z2103","z3","探险者短杖","探险者短杖","z/z2103_"],
    "a4":["z2104","z4","狂信者的荣誉之刃","狂信者的荣誉之刃","z/z2104_"],
    "a5":["z2105","z2","反叛者的刺杀弓","反叛者的刺杀弓","z/z2105_"],
    "a6":["z2106","z4","幽梦匕首","幽梦匕首","z/z2106_"],
    "a7":["z2107","z3","光辉法杖","光辉法杖","z/z2107_"],
    "a8":["z2108","z1","荆棘盾剑","荆棘盾剑","z/z2108_"],
    "ao8":["z2108","z1","荆棘剑盾","荆棘剑盾","z/z2108_"],
    "a9":["z2109","z1","陨铁重剑","陨铁重剑","z/z2109_"],
    "a10":["z2110","z2110","饮血魔剑","饮血魔剑","z/z2110_"],
    "ao10":["z2110","z2110","饮血长枪","饮血长枪","z/z2110_"],
    "w1":["z2201","z5","探险者手环","探险者手环","z/z2201_"],
    "wo1":["z2201","z5","探险者手套","探险者手套","z/z2201_"],
    "w2":["z2202","z8","命师的传承手环","命师的传承手环","z/z2202_"],
    "w3":["z2203","z5","秃鹫手环","秃鹫手环","z/z2203_"],
    "wo3":["z2203","z5","秃鹫手套","秃鹫手套","z/z2203_"],
    "w4":["z2204","z2204","海星戒指","海星戒指","z/z2204_"],
    "c1":["z2301","z9","探险者铁甲","探险者铁甲","z/z2301_"],
    "c2":["z2302","z10","探险者皮甲","探险者皮甲","z/z2302_"],
    "c3":["z2303","z10","探险者布甲","探险者布甲","z/z2303_"],
    "c4":["z2304","z11","旅法师的灵光袍","旅法师的灵光袍","z/z2304_"],
    "c5":["z2305","z9","战线支撑者的荆棘重甲","战线支撑者的荆棘重甲","z/z2305_"],
    "c6":["z2306","z2306","复苏战衣","复苏战衣","z/z2306_"],
    "co6":["z2306","z2306","复苏木甲","复苏木甲","z/z2306_"],
    "c7":["z2307","z2307","挑战斗篷","挑战斗篷","z/z2307_"],
    "h1":["z2401","z7","探险者耳环","探险者耳环","z/z2401_"],
    "ho1":["z2401","z7","探险者头巾","探险者头巾","z/z2401_"],
    "h2":["z2402","z7","占星师的耳饰","占星师的耳饰","z/z2402_"],
    "ho2":["z2402","z7","占星师的发饰","占星师的发饰","z/z2402_"],
    "h3":["z2403","z7","萌爪耳钉","萌爪耳钉","z/z2403_"],
    "ho3":["z2403","z7","天使缎带","天使缎带","z/z2403_"]
}
,classicTheme = {
    "url":"https://sticker.inari.site/guguicons/old/",
    "old":"",
    "ext":".gif",
    "background":"",
    "kanbanbg":"https://sticker.inari.site/api/null.gif",
    "backsize":"background-size:80% 80%;",
    "wqbacksize":"background-size:80% 80%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "equip-zh":["探险者之剑","探险者短弓","探险者短杖","狂信者的荣誉之刃","反叛者的刺杀弓","幽梦匕首","光辉法杖","荆棘盾剑","荆棘剑盾","陨铁重剑","饮血魔剑","饮血长枪","探险者手环","探险者手套","命师的传承手环","秃鹫手环",
                "秃鹫手套","探险者铁甲","探险者皮甲","探险者布甲","旅法师的灵光袍","战线支撑者的荆棘重甲","复苏战衣","复苏木甲","挑战斗篷","探险者耳环","探险者头巾","占星师的耳饰","占星师的发饰","萌爪耳钉","天使缎带","海星戒指"],
    "equip-zht":["探險者之劍","探險者短弓","探險者短杖","狂信者的榮譽之刃","反叛者的刺殺弓","幽夢匕首","光輝法杖","荊棘盾劍","荊棘劍盾","隕鐵重劍","飲血魔劍","飲血長槍","探險者手環","探險者手套","命師的傳承手環","禿鹫手環",
                 "禿鹫手套","探險者鐵甲","探險者皮甲","探險者布甲","旅法師的靈光袍","戰線支撐者的荊棘重甲","複蘇戰衣","複蘇木甲","挑戰鬥篷","探險者耳環","探險者頭巾","占星師的耳飾","占星師的發飾","萌爪耳釘","天使緞帶","海星戒指"],
    "equip-ja":["探検家の剣","探検家の弓","探検家の杖","狂信者の栄光刃","反逆者の暗殺弓","ダークドリーム匕首","輝く杖","いばら盾剣","いばら剣盾","流星鉄のエペの剣","血に飢えた魔剣","血に飢えた槍","探検家の腕輪","探検家の手袋",
                 "命の師匠の継承腕輪","ハゲタカ腕輪","ハゲタカ手袋","探検家の鎧","探検家の革","探検家の衣","旅法師のローブ","フロントサポーターのトゲアーマー","蘇るスーツ","蘇るウッドアーマー","挑戦者のマント",
                 "探検家のイヤリング","探検家のマフラー","占星術師のイヤリング","占星術師の髪飾り","萌え猫爪のイヤリング","天使のリボン","海星指輪"],
    "equip-en":["Explorer's Sword","Explorer's Bow","Explorer's Staff","Honor Blade of crazy believer","Rebel's assassination Bow","Faint Dream Dagger","Shining Staff","Thorny shield Sword","Thorny sword Shield","Meteoric iron Epee Sword",
                 "Bloodthirsty demon Sword","Bloodthirsty Lance","Explorer's Bracelet","Explorer's Glove","命's Bracelet from her Shifu","Vulture Bracelet","Vulture Glove","Explorer's Armor","Explorer's Leather","Explorer's Cloth","Magician's aura Robe",
                 "Thorny Armor of the front supporter","Recovery suit","Revived wood armour","Challenger's Cloak","Explorer's Earrings","Explorer's Scarf","Astrologer's Earrings","Astrologer's hair ornament","Neko Claw Earrings","Angel's Ribbon","Starfish Ring"],
    "dessert":["apple","grape","cherry"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertlevel-zht":["稀有","史詩","傳奇"],
    "dessertlevel-ja":["レア","大作","伝説"],
    "dessertlevel-en":["Rare   ","Epic   ","Legend "],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
    "dessertname-zht":["蘋果護身符","葡萄護身符","櫻桃護身符"],
    "dessertname-ja":["林檎お守り","葡萄お守り","桜ん坊お守り"],
    "dessertname-en":["apple amulet","grape amulet","cherry amulet"],
    "魔灯之灵（野怪":"https://sticker.inari.site/null.gif",
    "六眼飞鱼（野怪":"https://sticker.inari.site/null.gif",
    "铁皮木人（野怪":"https://sticker.inari.site/null.gif",
    "迅捷魔蛛（野怪":"https://sticker.inari.site/null.gif",
    "食铁兽（野怪"  :"https://sticker.inari.site/null.gif",
    "晶刺豪猪（野怪":"https://sticker.inari.site/null.gif",
    "舞":["3000","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "默":["3001","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "琳":["3002","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "艾":["3003","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "梦":["3004","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "薇":["3005","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "伊":["3006","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "冥":["3007","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "命":["3008","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "希":["3009","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif","https://sticker.inari.site/null.gif"],
    "voice":["on.mp3","off.mp3"],
    "舞voice":["/vo/",".mp3"],
    "默voice":["/vo/",".mp3"],
    "琳voice":["/vo/",".mp3"],
    "艾voice":["/vo/",".mp3"],
    "梦voice":["/vo/",".mp3"],
    "薇voice":["/vo/",".mp3"],
    "伊voice":["/vo/",".mp3"],
    "冥voice":["/vo/",".mp3"],
    "命voice":["/vo/",".mp3"],
    "希voice":["/vo/",".mp3"],
    "a1":["z2101","z1","探险者之剑","探险者之剑","sword_"],
    "a2":["z2102","z2","探险者短弓","探险者短弓","bow_"],
    "a3":["z2103","z3","探险者短杖","探险者短杖","staff_"],
    "a4":["z2104","z4","狂信者的荣誉之刃","狂信者的荣誉之刃","knife_"],
    "a5":["z2105","z2","反叛者的刺杀弓","反叛者的刺杀弓","bow_"],
    "a6":["z2106","z4","幽梦匕首","幽梦匕首","knife_"],
    "a7":["z2107","z3","光辉法杖","光辉法杖","staff_"],
    "a8":["z2108","z1","荆棘盾剑","荆棘盾剑","sword_"],
    "ao8":["z2108","z1","荆棘剑盾","荆棘剑盾","sword_"],
    "a9":["z2109","z1","陨铁重剑","陨铁重剑","sword_"],
    "a10":["z2110","z2110","饮血魔剑","饮血魔剑","sword_"],
    "ao10":["z2110","z2110","饮血长枪","饮血长枪","spear_"],
    "w1":["z2201","z5","探险者手环","探险者手环","bracelet_"],
    "wo1":["z2201","z5","探险者手套","探险者手套","gloves_"],
    "w2":["z2202","z8","命师的传承手环","命师的传承手环","bracelet_"],
    "w3":["z2203","z5","秃鹫手环","秃鹫手环","bracelet_"],
    "wo3":["z2203","z5","秃鹫手套","秃鹫手套","gloves_"],
    "w4":["z2204","z2204","海星戒指","海星戒指","bracelet_"],
    "c1":["z2301","z9","探险者铁甲","探险者铁甲","armour_"],
    "c2":["z2302","z10","探险者皮甲","探险者皮甲","clothes_"],
    "c3":["z2303","z10","探险者布甲","探险者布甲","clothes_"],
    "c4":["z2304","z11","旅法师的灵光袍","旅法师的灵光袍","gown_"],
    "c5":["z2305","z9","战线支撑者的荆棘重甲","战线支撑者的荆棘重甲","armour_"],
    "c6":["z2306","z2306","复苏战衣","复苏战衣","gown_"],
    "co6":["z2306","z2306","复苏木甲","复苏木甲","gown_"],
    "c7":["z2307","z2307","挑战斗篷","挑战斗篷","clothes_"],
    "h1":["z2401","z7","探险者耳环","探险者耳环","earring_"],
    "ho1":["z2401","z7","探险者头巾","探险者头巾","swirl_"],
    "h2":["z2402","z7","占星师的耳饰","占星师的耳饰","earring_"],
    "ho2":["z2402","z7","占星师的发饰","占星师的发饰","swirl_"],
    "h3":["z2403","z7","萌爪耳钉","萌爪耳钉","neko_"],
    "ho3":["z2403","z7","天使缎带","天使缎带","swirl_"]
}
,testTheme = {
    "url":"https://p.inari.site/guguicons/test/eq/",
    "old":"0",
    "ext":".gif",
    "background":"normal",
    "kanbanbg":"https://sticker.inari.site/api/bg.jpg",
    "backsize":"background-size:100% 100%;",
    "wqbacksize":"background-size:100% 100%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "equip-zh":["旅人剑","猎人弓","香木法杖","妖刀血鸦","深渊之弓","黑曜石天黑剑","棒棒糖手杖","盖亚之斧","盖亚之斧","勇气星核剑","混沌之刃","毁灭之伤冥神枪","旅者手镯","旅者拳套","睿智手镯","朋克手镯","深红爪","重金属护甲","皮革工作服","旅者长袍",
                "魔导师的长袍","霸王树之棘针铠","翠绿灵衣","翠绿灵衣","黑玛瑙之祈装衣","旅者耳环","旅者头巾","海神耳饰","桜花の月夜簪","精灵王护石","细冰姬的蝴蝶结","永恒绿戒"],
    "equip-zht":["旅人劍","獵人弓","檀香之杖","妖刀血鴉","深淵之弓","天黑劍奧比修斯","棒棒糖手杖","蓋亞之斧","蓋亞之斧","星核劍艾爾茲修奈德","渾沌之劍","冥神槍毀滅苦痛","旅者手镯","旅者拳套","睿智手镯","龐克棘刺手環","深紅之爪","重金屬盔甲","皮革工作服",
                 "旅行長袍","魔導師的長袍","霸王樹之棘針鎧","翠綠靈衣","翠綠靈衣","黑瑪瑙祈裝衣","旅者耳環","旅者頭巾","海神耳飾","櫻花月夜簪","精靈王護石","細冰姬的蝴蝶結","常青之綠戒"],
    "equip-ja":["旅立ちの剣","狩人の弓","香木の杖","妖刀血鴉","アビスボウ","天黒剣オブシウス","ロリポップステッキ","ガイアアクス","ガイアアクス","星核剣エルツシュナイド","カオスブレード","冥神槍ドゥームペイン","旅立ちのミサンガ","旅立ちのパンチ",
                "ソフォスブレスレット","パンクニードルバングル","クリムゾンクロー","ヘビーメタルアーマー","革のサロペット","旅立ちのローブ","魔導師のローブ","覇王樹の棘針鎧","翠緑の霊衣","翠緑の霊衣","黒瑪瑙の祈装衣","旅立ちの耳環","旅立ちの頭巾",
                "海神の耳飾り","桜花の月夜簪","精霊王の護石","細氷姫の結び紐","常盤の緑環"],
    "equip-en":["Iron Blade","Hunter's Bow","Fragrant Wood Wand","Blood Raven Demon Blade","Abyss Bow","Heavenly Black Obsidian Sword","Lolipop Stick","Gaia Axe","Gaia Axe","Star Core Sword - Erst Schneide","Chaos Blade","Nether God Spear, Doom Pain",
                "Journey Bracelet","Journey Punches","Sophos Bracelet","Punk Bangle","Crimson Claw","Heavy Metal Armor","Leather Overalls","Journey Robe","Magician's Robe","Thorn of the Great Tree Armor","Viridian Spiritual Dress","Viridian Spiritual Dress",
                "Black Agate Prayer Dress","Journey Earrings","Journey Hood","Ocean God's Earrings","Moonlight Blossom Hairpin","Fairy King's Guardian Stone","Ice Princess Ribbon","Evergreen Ring"],
    "dessert":["pie","donuts","cake"],
    "dessertlevel":["家常的","美味的","诱人的"],
    "dessertlevel-zht":["家常的","美味的","誘人的"],
    "dessertlevel-ja":["自家製の","美味しい","超美味い"],
    "dessertlevel-en":["homemade  ","tasty     ","delicious "],
    "dessertname":["苹果派","甜甜圈","樱桃蛋糕"],
    "dessertname-zht":["蘋果派","甜甜圈","櫻桃蛋糕"],
    "dessertname-ja":["アップルパイ","ドーナツ","チェリーケーキ"],
    "dessertname-en":["apple pie","grape donuts","cherry cake"],
    "魔灯之灵（野怪":"https://p.inari.site/guguicons/test/mob/deng.png",
    "六眼飞鱼（野怪":"https://p.inari.site/guguicons/test/mob/fish.png",
    "铁皮木人（野怪":"https://p.inari.site/guguicons/test/mob/mu.png",
    "迅捷魔蛛（野怪":"https://p.inari.site/guguicons/test/mob/zhu.png",
    "食铁兽（野怪"  :"https://p.inari.site/guguicons/test/mob/shou.png",
    "晶刺豪猪（野怪":"https://p.inari.site/guguicons/test/mob/nzhu.png",
    "舞":["3000","https://p.inari.site/guguicons/test/cg/wuu/1.png","https://p.inari.site/guguicons/test/cg/wuu/2.png","https://p.inari.site/guguicons/test/cg/wuu/3.png","https://p.inari.site/guguicons/test/cg/wuu/4.png",
         "https://p.inari.site/guguicons/test/cg/wuu/5.png","https://p.inari.site/guguicons/test/cg/wuu/3.png","https://p.inari.site/guguicons/test/cg/wuu/0.png","https://p.inari.site/guguicons/test/cg/wuu/0.png"],
    "默":["3001","https://p.inari.site/guguicons/test/cg/mo/1.png","https://p.inari.site/guguicons/test/cg/mo/2.png","https://p.inari.site/guguicons/test/cg/mo/3.png","https://p.inari.site/guguicons/test/cg/mo/4.png",
         "https://p.inari.site/guguicons/test/cg/mo/5.png","https://p.inari.site/guguicons/test/cg/mo/3.png","https://p.inari.site/guguicons/test/cg/mo/0.png","https://p.inari.site/guguicons/test/cg/mo/0.png"],
    "琳":["3002","https://p.inari.site/guguicons/test/cg/lin/1.png","https://p.inari.site/guguicons/test/cg/lin/2.png","https://p.inari.site/guguicons/test/cg/lin/3.png","https://p.inari.site/guguicons/test/cg/lin/4.png",
         "https://p.inari.site/guguicons/test/cg/lin/5.png","https://p.inari.site/guguicons/test/cg/lin/3.png","https://p.inari.site/guguicons/test/cg/lin/0.png","https://p.inari.site/guguicons/test/cg/lin/0.png"],
    "艾":["3003","https://p.inari.site/guguicons/test/cg/ai/1.png","https://p.inari.site/guguicons/test/cg/ai/2.png","https://p.inari.site/guguicons/test/cg/ai/3.png","https://p.inari.site/guguicons/test/cg/ai/4.png",
         "https://p.inari.site/guguicons/test/cg/ai/5.png","https://p.inari.site/guguicons/test/cg/ai/3.png","https://p.inari.site/guguicons/test/cg/ai/0.png","https://p.inari.site/guguicons/test/cg/ai/0.png"],
    "梦":["3004","https://p.inari.site/guguicons/test/cg/meng/1.png","https://p.inari.site/guguicons/test/cg/meng/2.png","https://p.inari.site/guguicons/test/cg/meng/3.png","https://p.inari.site/guguicons/test/cg/meng/4.png",
         "https://p.inari.site/guguicons/test/cg/meng/5.png","https://p.inari.site/guguicons/test/cg/meng/3.png","https://p.inari.site/guguicons/test/cg/meng/0.png","https://p.inari.site/guguicons/test/cg/meng/0.png"],
    "薇":["3005","https://p.inari.site/guguicons/test/cg/wei/1.png","https://p.inari.site/guguicons/test/cg/wei/2.png","https://p.inari.site/guguicons/test/cg/wei/3.png","https://p.inari.site/guguicons/test/cg/wei/4.png",
         "https://p.inari.site/guguicons/test/cg/wei/5.png","https://p.inari.site/guguicons/test/cg/wei/3.png","https://p.inari.site/guguicons/test/cg/wei/0.png","https://p.inari.site/guguicons/test/cg/wei/0.png"],
    "伊":["3006","https://p.inari.site/guguicons/test/cg/yi/1.png","https://p.inari.site/guguicons/test/cg/yi/2.png","https://p.inari.site/guguicons/test/cg/yi/3.png","https://p.inari.site/guguicons/test/cg/yi/4.png",
         "https://p.inari.site/guguicons/test/cg/yi/5.png","https://p.inari.site/guguicons/test/cg/yi/3.png","https://p.inari.site/guguicons/test/cg/yi/0.png","https://p.inari.site/guguicons/test/cg/yi/0.png"],
    "冥":["3007","https://p.inari.site/guguicons/test/cg/ming/1.png","https://p.inari.site/guguicons/test/cg/ming/2.png","https://p.inari.site/guguicons/test/cg/ming/3.png","https://p.inari.site/guguicons/test/cg/ming/4.png",
         "https://p.inari.site/guguicons/test/cg/ming/5.png","https://p.inari.site/guguicons/test/cg/ming/3.png","https://p.inari.site/guguicons/test/cg/ming/0.png","https://p.inari.site/guguicons/test/cg/ming/0.png"],
    "命":["3008","https://p.inari.site/guguicons/test/cg/life/1.png","https://p.inari.site/guguicons/test/cg/life/2.png","https://p.inari.site/guguicons/test/cg/life/3.png","https://p.inari.site/guguicons/test/cg/life/4.png",
         "https://p.inari.site/guguicons/test/cg/life/5.png","https://p.inari.site/guguicons/test/cg/life/3.png","https://p.inari.site/guguicons/test/cg/life/0.png","https://p.inari.site/guguicons/test/cg/life/0.png"],
    "希":["3009","https://p.inari.site/guguicons/test/cg/xii/1.png","https://p.inari.site/guguicons/test/cg/xii/2.png","https://p.inari.site/guguicons/test/cg/xii/3.png","https://p.inari.site/guguicons/test/cg/xii/4.png",
         "https://p.inari.site/guguicons/test/cg/xii/5.png","https://p.inari.site/guguicons/test/cg/xii/3.png","https://p.inari.site/guguicons/test/cg/xii/0.png","https://p.inari.site/guguicons/test/cg/xii/0.png"],
    "voice":["https://p.inari.site/guguicons/test/vo/on.mp3","https://p.inari.site/guguicons/test/vo/off.mp3"],
    "舞voice":["https://p.inari.site/guguicons/test/vo/wuu/",".mp3"],
    "默voice":["https://p.inari.site/guguicons/test/vo/mo/",".mp3"],
    "琳voice":["https://p.inari.site/guguicons/test/vo/lin/",".mp3"],
    "艾voice":["https://p.inari.site/guguicons/test/vo/ai/",".mp3"],
    "梦voice":["https://p.inari.site/guguicons/test/vo/meng/",".mp3"],
    "薇voice":["https://p.inari.site/guguicons/test/vo/wei/",".mp3"],
    "伊voice":["https://p.inari.site/guguicons/test/vo/yi/",".mp3"],
    "冥voice":["https://p.inari.site/guguicons/test/vo/ming/",".mp3"],
    "命voice":["https://p.inari.site/guguicons/test/vo/life/",".mp3"],
    "希voice":["https://p.inari.site/guguicons/test/vo/xii/",".mp3"],
    "spine":true,
    "spinert":["https://sticker.inari.site/api/common/","https://"],
    "舞spine":{"name":"sticker.inari.site/api/unit/wuu/","type":"6","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8},
    "默spine":{"name":"sticker.inari.site/api/unit/mo/","type":"7","hasRarity6":true,"wi":-350,"hi":-42,"re":0.8},
    "琳spine":{"name":"sticker.inari.site/api/unit/lin/","type":"5","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8},
    "艾spine":{"name":"sticker.inari.site/api/unit/ai/","type":"8","hasRarity6":true,"wi":-320,"hi":-64,"re":0.8},
    "梦spine":{"name":"sticker.inari.site/api/unit/meng/","type":"4","hasRarity6":false,"wi":-320,"hi":-42,"re":0.8},
    "薇spine":{"name":"sticker.inari.site/api/unit/wei/","type":"1","hasRarity6":true,"wi":-360,"hi":-42,"re":0.8},
    "伊spine":{"name":"sticker.inari.site/api/unit/yi/","type":"8","hasRarity6":false,"wi":-380,"hi":-92,"re":0.8},
    "冥spine":{"name":"sticker.inari.site/api/unit/min/","type":"3","hasRarity6":true,"wi":-350,"hi":-48,"re":0.8},
    "命spine":{"name":"sticker.inari.site/api/unit/life/","type":"1","hasRarity6":false,"wi":-360,"hi":-36,"re":1.0},
    "希spine":{"name":"sticker.inari.site/api/unit/xii/","type":"10","hasRarity6":false,"wi":-370,"hi":-64,"re":0.8},
    "a1":["z2101","z1","探险者之剑","旅人剑","%E6%8E%A2%E9%99%A9%E8%80%85%E4%B9%8B%E5%89%91/"],
    "a2":["z2102","z2","探险者短弓","猎人弓","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E5%BC%93/"],
    "a3":["z2103","z3","探险者短杖","香木法杖","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E6%9D%96/"],
    "a4":["z2104","z4","狂信者的荣誉之刃","妖刀血鸦","%E7%8B%82%E4%BF%A1%E8%80%85%E7%9A%84%E8%8D%A3%E8%AA%89%E4%B9%8B%E5%88%83/"],
    "a5":["z2105","z2","反叛者的刺杀弓","深渊之弓","%E5%8F%8D%E5%8F%9B%E8%80%85%E7%9A%84%E5%88%BA%E6%9D%80%E5%BC%93/"],
    "a6":["z2106","z4","幽梦匕首","黑曜石天黑剑","%E5%B9%BD%E6%A2%A6%E5%8C%95%E9%A6%96/"],
    "a7":["z2107","z3","光辉法杖","棒棒糖手杖","%E5%85%89%E8%BE%89%E6%B3%95%E6%9D%96/"],
    "a8":["z2108","z1","荆棘盾剑","盖亚之斧","%E8%8D%86%E6%A3%98%E7%9B%BE%E5%89%91/"],
    "ao8":["z2108","z1","荆棘剑盾","盖亚之斧","%E8%8D%86%E6%A3%98%E7%9B%BE%E5%89%91/"],
    "a9":["z2109","z1","陨铁重剑","勇气星核剑","%E9%99%A8%E9%93%81%E9%87%8D%E5%89%91/"],
    "a10":["z2110","z2110","饮血魔剑","混沌之刃","%E9%A5%AE%E8%A1%80%E9%AD%94%E5%89%91/"],
    "ao10":["z2110","z2110","饮血长枪","毁灭之伤冥神枪","%E9%A5%AE%E8%A1%80%E9%95%BF%E6%9E%AA/"],
    "w1":["z2201","z5","探险者手环","旅者手镯","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E7%8E%AF/"],
    "wo1":["z2201","z5","探险者手套","旅者拳套","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E5%A5%97/"],
    "w2":["z2202","z8","命师的传承手环","睿智手镯","%E5%91%BD%E5%B8%88%E7%9A%84%E4%BC%A0%E6%89%BF%E6%89%8B%E7%8E%AF/"],
    "w3":["z2203","z5","秃鹫手环","朋克手镯","%E7%A7%83%E9%B9%AB%E6%89%8B%E7%8E%AF/"],
    "wo3":["z2203","z5","秃鹫手套","深红爪","%E7%A7%83%E9%B9%AB%E6%89%8B%E5%A5%97/"],
    "w4":["z2204","z2204","海星戒指","永恒绿戒","%E6%B5%B7%E6%98%9F%E6%88%92%E6%8C%87/"],
    "c1":["z2301","z9","探险者铁甲","重金属护甲","%E6%8E%A2%E9%99%A9%E8%80%85%E9%93%81%E7%94%B2/"],
    "c2":["z2302","z10","探险者皮甲","皮革工作服","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9A%AE%E7%94%B2/"],
    "c3":["z2303","z10","探险者布甲","旅者长袍","%E6%8E%A2%E9%99%A9%E8%80%85%E5%B8%83%E7%94%B2/"],
    "c4":["z2304","z11","旅法师的灵光袍","魔导师的长袍","%E6%97%85%E6%B3%95%E5%B8%88%E7%9A%84%E7%81%B5%E5%85%89%E8%A2%8D/"],
    "c5":["z2305","z9","战线支撑者的荆棘重甲","霸王树之棘针铠","%E6%88%98%E7%BA%BF%E6%94%AF%E6%92%91%E8%80%85%E7%9A%84%E8%8D%86%E6%A3%98%E9%87%8D%E7%94%B2/"],
    "c6":["z2306","z2306","复苏战衣","翠绿灵衣","%E5%A4%8D%E8%8B%8F%E6%88%98%E8%A1%A3/"],
    "co6":["z2306","z2306","复苏木甲","翠绿灵衣","%E5%A4%8D%E8%8B%8F%E6%88%98%E8%A1%A3/"],
    "c7":["z2307","z2307","挑战斗篷","黑玛瑙之祈装衣","%E6%8C%91%E6%88%98%E6%96%97%E7%AF%B7/"],
    "h1":["z2401","z7","探险者耳环","旅者耳环","%E6%8E%A2%E9%99%A9%E8%80%85%E8%80%B3%E7%8E%AF/"],
    "ho1":["z2401","z7","探险者头巾","旅者头巾","%E6%8E%A2%E9%99%A9%E8%80%85%E5%A4%B4%E5%B7%BE/"],
    "h2":["z2402","z7","占星师的耳饰","海神耳饰","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E8%80%B3%E9%A5%B0/"],
    "ho2":["z2402","z7","占星师的发饰","樱花的月夜簪","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E5%8F%91%E9%A5%B0/"],
    "h3":["z2403","z7","萌爪耳钉","精灵王护石","%E8%90%8C%E7%88%AA%E8%80%B3%E9%92%89/"],
    "ho3":["z2403","z7","天使缎带","细冰姬的蝴蝶结","%E5%A4%A9%E4%BD%BF%E7%BC%8E%E5%B8%A6/"]
}
,ygcheck = ["魔灯之灵（野怪","六眼飞鱼（野怪","铁皮木人（野怪","迅捷魔蛛（野怪","食铁兽（野怪","晶刺豪猪（野怪"]
,nullimg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
,api='https://api.inari.site/?s=App.User_User.';
let ww=window.innerWidth||document.body.clientWidth,wh=window.innerHeight||document.body.clientHeight,momoConf={},User=$('span.fyg_colpz06.fyg_f24')[0].innerText,momoUser = "momo_"+User,uuid,nowTheme
,custom,tempca,tpkanban,kanban,kanbanimg,ext,old,purl,dessert,dessertlevel,dessertname,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,w1,w2,w3,w4,c1,c2,c3,c4,c5,c6,c7,h1,h2,h3,spinert,nowEquip,spineJson,tch,yourcard,cardvo,iconsize,equipName,kbw,kbh,shapes
,canvas,gl,shader,batcher,skeletonRenderer,loadingSkeleton,currentSkeletonBuffer,animationState,forceNoLoop,currentTexture,soundonce=0,sucheck=0,facheck=0,battlecheck=0,collecheck=0,pagetype=24,speedFactor=1,tempvo=false,ccard=false,loading = false
,timeout = null,useOldNamesCheck='',useThemeNameCheck='',Multilingual='',tpkanbanHTML='',showCGCheck='',voiceOCheck='',kanbanCheck='',activeSkeleton="",pendingAnimation='',generalAdditionAnimations={},userTheme={},generalBattleSkeletonData={},lang="zh"
,animationQueue=[],currentClass='1',imgmove=[0,0.6],lastFrameTime=Date.now()/1000,bgColor=[0,0,0,0],additionAnimations=['DEAR','NO_WEAPON','POSING','RACE','RUN_JUMP','SMILE'],currentClassAnimData={type:0,data:{}},currentCharaAnimData={id:0,data:{}}
,mvp=new spine.webgl.Matrix4();


/**
 * Functions.
 */
/* Core */
function initConf(){
if (localStorage.ThemePackConf) {
    custom = JSON.parse(localStorage.ThemePackConf);
}
else{
    custom =defaultConf; localStorage.setItem('ThemePackConf',JSON.stringify(defaultConf));
};
if (localStorage.nowEquip) { nowEquip = localStorage.nowEquip;};
if (!custom.yourcard ) { custom.yourcard=defaultConf.yourcard; update();};
if (!custom.kanbansize){ custom.kanbansize=defaultConf.kanbansize;update();};
if (!custom.language ) { custom.language=defaultConf.language;update();};lang=Language[custom.language];
if (custom.showCG == true) { showCGCheck = 'checked'; };
if (custom.voiceO == true) { voiceOCheck = 'checked'; };
if (custom.useThemeName==true){ useThemeNameCheck='checked';};
if(custom.ThemePack=="classic"){ nowTheme=classicTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="test"||custom.ThemePack=="pcr"){ nowTheme=testTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="off"){ nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="user"){
    if (localStorage.userTheme||momoConf.userTheme){
        if(localStorage.userTheme&&!momoConf.userTheme){momoConf.userTheme=JSON.parse(localStorage.userTheme);update();userTheme=momoConf.userTheme;}
        else{userTheme=momoConf.userTheme;};
        if(userTheme.w4!=null){
            nowTheme=userTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));
            if(userTheme.舞==null&&custom.showCG==true){
                alert(lang.initUFG);custom.showCG=false;
            };
            if(userTheme.舞==null&&custom.showKanban==true){
                alert(lang.initUFG);custom.showKanban=false;;
            };
            if(userTheme.voice==null&&custom.voiceO==true){
                alert(lang.initUVO);custom.voiceO=false;
            };
        }
        else{
            alert(lang.initUOT);custom.ThemePack="off"; update();
            nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));
        };
    }
    else{ alert(lang.initUNU);custom.ThemePack="off"; update();nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme)); };
}
else{nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));};
yourcard=custom.yourcard;cardvo=nowTheme[yourcard+"voice"];iconsize=custom.iconSize;
if(nowTheme.spine==true){spineJson=nowTheme[yourcard+"spine"];}else{spineJson={"name":"hi","type":"1","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8};};
if (custom.showKanban == true&&nowTheme.spine==true){spinert=nowTheme.spinert;kanbanCheck='checked';}else if(custom.showKanban == true){kanbanimg=nowTheme[yourcard][2];kanbanCheck='checked';}else{kanbanimg=nullimg;};
if(nowTheme["dessertlevel-"+custom.language]){nowTheme.dessertlevel=nowTheme["dessertlevel-"+custom.language];sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));};
if(nowTheme["dessertname-"+custom.language]){nowTheme.dessertname=nowTheme["dessertname-"+custom.language];sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));};
if(custom.useThemeName==true){ Multilingual='checked';equipName=nowTheme["equip-"+custom.language];}
else if(nowTheme["equip-"+custom.language]){ Multilingual='checked';equipName=Language[custom.language].equip;};

nowTheme.a1[3]=equipName[0];nowTheme.a2[3]=equipName[1];nowTheme.a3[3]=equipName[2];nowTheme.a4[3]=equipName[3];nowTheme.a5[3]=equipName[4];nowTheme.a6[3]=equipName[5];
nowTheme.a7[3]=equipName[6];nowTheme.a8[3]=equipName[7];nowTheme.ao8[3]=equipName[8];nowTheme.a9[3]=equipName[9];nowTheme.a10[3]=equipName[10];nowTheme.ao10[3]=equipName[11];
nowTheme.w1[3]=equipName[12];nowTheme.wo1[3]=equipName[13];nowTheme.w2[3]=equipName[14];nowTheme.w3[3]=equipName[15];nowTheme.wo3[3]=equipName[16];nowTheme.w4[3]=equipName[31];
nowTheme.c1[3]=equipName[17];nowTheme.c2[3]=equipName[18];nowTheme.c3[3]=equipName[19];nowTheme.c4[3]=equipName[20];nowTheme.c5[3]=equipName[21];nowTheme.c6[3]=equipName[22];nowTheme.co6[3]=equipName[23];nowTheme.c7[3]=equipName[24];
nowTheme.h1[3]=equipName[25];nowTheme.ho1[3]=equipName[26];nowTheme.h2[3]=equipName[27];nowTheme.ho2[3]=equipName[28];nowTheme.h3[3]=equipName[29];nowTheme.ho3[3]=equipName[30];
sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));

ext=nowTheme.ext;purl=nowTheme.url;dessert=nowTheme.dessert;old=nowTheme.old;dessertlevel=nowTheme.dessertlevel;dessertname=nowTheme.dessertname;
a1=nowTheme.a1;a2=nowTheme.a2;a3=nowTheme.a3;a4=nowTheme.a4;a5=nowTheme.a5;a6=nowTheme.a6;a7=nowTheme.a7;a8=nowTheme.a8;a9=nowTheme.a9;a10=nowTheme.a10;
w1=nowTheme.w1;w2=nowTheme.w2;w3=nowTheme.w3;w4=nowTheme.w4;
c1=nowTheme.c1;c2=nowTheme.c2;c3=nowTheme.c3;c4=nowTheme.c4;c5=nowTheme.c5;c6=nowTheme.c6;c7=nowTheme.c7;
h1=nowTheme.h1;h2=nowTheme.h2;h3=nowTheme.h3;

if(custom.useOldNames==true){ useOldNamesCheck='checked'; a8=nowTheme.ao8;a10=nowTheme.ao10;w1=nowTheme.wo1;w3=nowTheme.wo3;c6=nowTheme.co6;h1=nowTheme.ho1;h2=nowTheme.ho2;h3=nowTheme.ho3; };
if(localStorage.nowEquip){nowEquip=localStorage.nowEquip;}else{nowEquip=spineJson.type;};
if (window.location.href.indexOf('pk.php') > -1||window.location.href.indexOf('equip.php') > -1) { pagetype=nowEquip; };
};
function insertHTML(){
    if (custom.showKanban==true&&nowTheme.spine==true) {
        if(localStorage.imgmove != null){ imgmove = JSON.parse(localStorage.imgmove);};
        if(imgmove[0]*ww>ww-3.6*Math.floor(custom.kanbansize )){kbw=ww-3.6*Math.floor(custom.kanbansize )}else{kbw=imgmove[0]*ww};
        if(imgmove[1]*wh>wh-3*Math.floor(custom.kanbansize )){kbh=wh-3*Math.floor(custom.kanbansize )}else{kbh=imgmove[1]*wh};
        tpkanbanHTML =$( `<div class="tool" style ="display:none;">
        <span> 动画:</span><select id="animationList"></select><input id="setAnimation" type="button" value="播放"></div>
        <div id = "divkanban" style = "position:fixed;left:${kbw}px;top:${kbh}px;z-index:88;cursor:pointer;width:${365*Math.floor(custom.kanbansize )/100}px; height=${305*Math.floor(custom.kanbansize )/100}px;" >
        <canvas id="tpkanban" width="360" height="300"></canvas></div>`).insertBefore('body');
    }
    else if (custom.showKanban==true){
        if(localStorage.imgmove != null){ imgmove = JSON.parse(localStorage.imgmove); };
        if(imgmove[0]*ww>ww-3.6*Math.floor(custom.kanbansize )){kbw=ww-3.6*Math.floor(custom.kanbansize )}else{kbw=imgmove[0]*ww};
        if(imgmove[1]*wh>wh-3*Math.floor(custom.kanbansize )){kbh=wh-3*Math.floor(custom.kanbansize )}else{kbh=imgmove[1]*wh};
        tpkanbanHTML =$( `<div id = "divkanban" style = "position:fixed;left:${kbw}px;top:${kbh}px;z-index:88;cursor:pointer;width:${365*Math.floor(custom.kanbansize )/100}px; height=${305*Math.floor(custom.kanbansize )/100}px;" >
        <img class="tpkanban" src = ${kanbanimg} width =${Math.floor(custom.kanbansize ) + "%"} height =${Math.floor(custom.kanbansize ) + "%"}></div>`).insertBefore('body');
    }
    else{
        tpkanbanHTML = $(`<div id ="divkanban" style ="display:none;"><img class="tpkanban" src = ${kanbanimg}></div>`).insertBefore('body');
    };
    kanban = document.getElementById("divkanban");
    if($('.themepack-ls').length==0){
    $(`<p></p><span><b>${lang.vuuid}:</b> <input type="text" class="themepack-uuid" style="width:65px" value="">
    <input type="button" class="themepack-cuuid" value="${lang.cuuid}">
    <input type="button" class="themepack-ls" value="${lang.menuTheme}">
    <input type="button" class="themepack-usr" value="${lang.menuUser}">
    <input type="button" class="icons-size" value="${lang.menuIcon}">
    <input type="button" class="kanban-size" value="${lang.menuKanban}">
    <input type="checkbox" class="iconpack-switch" ${useOldNamesCheck}><span class="thememenu">${lang.menuOldEQ}</span>
    <input type="checkbox" class="themepack-equip" ${useThemeNameCheck}><span class="thememenu">${lang.menuThemeEQ}</span>
    <input type="checkbox" class="themepack-showCG" ${showCGCheck}><span class="thememenu">${lang.menuSCG}</span>
    <input type="checkbox" class="themepack-voiceO" ${voiceOCheck}><span class="thememenu">${lang.menuSVO}</span>
    <input type="checkbox" class="themepack-showKB" ${kanbanCheck}><span class="thememenu">${lang.menuSKB}</span>
    <input type="button" class="themelang" value="文A">
    <input type="checkbox" class="themepack-switch" ${Multilingual} style="display:none"><audio id="themeSoundPlay" controls src="${nullimg}" type="audio/mp3" style="display:none"></audio>
    </span>`).insertBefore($('hr')[0])};
};
function addCSS(){
$('head').append(`<style>
    div[style='width:1200px;margin: 0 auto;'] { width: 80% !important;max-width:1200px;}
    .btn.fyg_mp3 { width: ${Math.floor(parseInt(iconsize))}px !important; height: ${Math.floor(parseInt(iconsize))}px !important;line-height: ${Math.floor(parseInt(iconsize)*3.1/5)-1}px;${nowTheme.backsize}}
    .btn.fyg_tr.fyg_mp3{ width: 263px !important; height: 40px !important;}
    .btn.fyg_tl.fyg_mp3{ width: 263px !important; height: 40px !important;}
    .btn.fyg_tc.fyg_mp3{ width: 536px !important; height: 40px !important;}
    .btn.fyg_colpzbg.fyg_mp3 { width: ${Math.floor(parseInt(iconsize))}px !important; height: ${Math.floor(parseInt(iconsize))}px !important; ${nowTheme.wqbacksize}}
    .img-rounded { width: 50px; height:50px;}
    .btn.fyg_colpzbg.fyg_tc { width: 60px !important; height: 100px !important;line-height:25px;}
    #smallcardimg {height:50px;width:50px;}
    [data-trigger=hover] {background-blend-mode: ${nowTheme.background} !important; }
    [data-toggle=tooltip]{background-blend-mode: ${nowTheme.background} !important; }
    .tool {position: fixed;top: 0;width: 100%;z-index: 1;cursor: default}
	.tool>span {white-space: nowrap}
</style>`);
if(nowTheme.spinert){$('head').append(`<style>#divkanban:hover{background:url(${nowTheme.kanbanbg});background-size:cover;}</style>`);};
if(navigator.userAgent.indexOf('Android') > -1||navigator.userAgent.indexOf('Phone') > -1){
    $('head').append(`<style>
    select,body,h4,h5,i,.fyg_f14,h3,button,input,span,.panel-body,.col-sm-8 {font-size:28px !important;}
    h2,.panel-heading,.fyg_f18,.col-sm-2.fyg_lh60{font-size:32px !important;}
    .col-sm-2.fyg_lh60[style='text-align: left;']{width:180px;white-space: pre-wrap;}
    .text-info.fyg_f24.fyg_lh60>span,.text-info.fyg_f24,.col-sm-2.fyg_lh60[style='text-align: left;']>span{font-size:48px !important;}
    .progress{height:24px !important;}
    div[class*='progress-bar']{font-size:26px !important;line-height:24px;}
    p{font-size:26px !important;}
    div[class='btn'],div[class='btn btn-primary'],.with-padding.bg-special.fyg_f14,.icon.icon-diamond{font-size:24px !important;}
    .btn.btn-block.dropdown-toggle.fyg_lh30{font-size:18px !important;}
    button[onclick*='b_forcbs(']{white-space: pre-wrap;}
    .img-rounded,#smallcardimg {height:100px;width:100px;}
    .btn.fyg_mp3{width:${Math.floor(parseInt(iconsize)*2)}px !important;height: ${Math.floor(parseInt(iconsize)*2)}px !important;line-height: ${Math.floor(parseInt(iconsize)*1.2)-1}px;}
    .btn.fyg_colpzbg.fyg_mp3{width:${Math.floor(parseInt(iconsize)*2)}px !important;height: ${Math.floor(parseInt(iconsize)*2)}px !important;}
    .fyg_tc>.btn.fyg_colpzbg.fyg_mp3.fyg_tc{width:120px !important;height: 160px !important;line-height:42px;}
    .btn.btn-primary.btn-group.dropup {height:160px !important;}
</style>`);};
};
function finalInit(){
    initConf(); insertHTML(); dragfunc(kanban); addCSS();
    $("#themeSoundPlay")[0].addEventListener('ended', function(){ battleVo();});
    let loadTime=new Date().getTime()-timeCheck;
    console.log("Load Finish! Takes "+loadTime+"ms");
    if(custom.showKanban==true&&nowTheme.spine==true){spineinit();};
};
function update(){
    localStorage.setItem('ThemePackConf', JSON.stringify(custom));
    beforeCloud("Gupdater")
};

/* Theme Core */
function oldEqName(){
    if(custom.useOldNames!=true){
        $("button[data-original-title*='荆棘剑盾']").attr("data-original-title",function(n,v){ n= v.replace(/荆棘剑盾/g, "荆棘盾剑");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a8[4]+old);return n;});
        $("button[data-original-title*='饮血长枪']").attr("data-original-title",function(n,v){ n= v.replace(/饮血长枪/g, "饮血魔剑");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z/g, purl+a10[4]+old);return n;});
        $("button[data-original-title*='探险者手套']").attr("data-original-title",function(n,v){ n= v.replace(/探险者手套/g, "探险者手环");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w1[4]+old);return n;});
        $("button[data-original-title*='秃鹫手套']").attr("data-original-title",function(n,v){ n= v.replace(/秃鹫手套/g, "秃鹫手环");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w3[4]+old);return n;});
        $("button[data-original-title*='复苏木甲']").attr("data-original-title",function(n,v){ n= v.replace(/复苏木甲/g, "复苏战衣");return n;});
        $("button[data-original-title*='探险者头巾']").attr("data-original-title",function(n,v){ n= v.replace(/探险者头巾/g, "探险者耳环");return n;})
            .attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h1[4]+old);return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2401/g, purl+h1[4]+old);return n;});
        $("button[data-original-title*='占星师的发饰']").attr("data-original-title",function(n,v){ n= v.replace(/占星师的发饰/g, "占星师的耳饰");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h2[4]+old);return n;});
        $("button[data-original-title*='天使缎带']").attr("data-original-title",function(n,v){ n= v.replace(/天使缎带/g, "萌爪耳钉");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h3[4]+old);return n;});
    };
    $("button[data-original-title*='"+a1[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a1[4]+old);return n;});
    $("button[data-original-title*='"+a2[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a2[4]+old);return n;});
    $("button[data-original-title*='"+a3[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a3[4]+old);return n;});
    $("button[data-original-title*='"+a4[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a4[4]+old);return n;});
    $("button[data-original-title*='"+a5[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a5[4]+old);return n;});
    $("button[data-original-title*='"+a6[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a6[4]+old);return n;});
    $("button[data-original-title*='"+a7[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a7[4]+old);return n;});
    $("button[data-original-title*='"+a8[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a8[4]+old);return n;});
    $("button[data-original-title*='"+a9[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a9[4]+old);return n;});
    $("button[data-original-title*='"+w1[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w1[4]+old);return n;});
    $("button[data-original-title*='"+w2[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z8/g, purl+w2[4]+old);return n;});
    $("button[data-original-title*='"+w3[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w3[4]+old);return n;});
    $("button[data-original-title*='"+c1[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c1[4]+old);return n;});
    $("button[data-original-title*='"+c2[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c2[4]+old);return n;});
    $("button[data-original-title*='"+c3[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c3[4]+old);return n;});
    $("button[data-original-title*='"+c4[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z11/g, purl+c4[4]+old);return n;});
    $("button[data-original-title*='"+c5[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c5[4]+old);return n;});
    $("button[data-original-title*='"+h1[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h1[4]+old);return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2401/g, purl+h1[4]+old);return n;});
    $("button[data-original-title*='"+h2[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h2[4]+old);return n;});
    $("button[data-original-title*='"+h3[2]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h3[4]+old);return n;});
    $("button[data-original-title*='"+a1[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a1[4]+old);return n;});
    $("button[data-original-title*='"+a2[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a2[4]+old);return n;});
    $("button[data-original-title*='"+a3[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a3[4]+old);return n;});
    $("button[data-original-title*='"+a4[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a4[4]+old);return n;});
    $("button[data-original-title*='"+a5[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a5[4]+old);return n;});
    $("button[data-original-title*='"+a6[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a6[4]+old);return n;});
    $("button[data-original-title*='"+a7[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a7[4]+old);return n;});
    $("button[data-original-title*='"+a8[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a8[4]+old);return n;});
    $("button[data-original-title*='"+a9[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a9[4]+old);return n;});
    $("button[data-original-title*='"+w1[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w1[4]+old);return n;});
    $("button[data-original-title*='"+w2[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z8/g, purl+w2[4]+old);return n;});
    $("button[data-original-title*='"+w3[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w3[4]+old);return n;});
    $("button[data-original-title*='"+c1[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c1[4]+old);return n;});
    $("button[data-original-title*='"+c2[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c2[4]+old);return n;});
    $("button[data-original-title*='"+c3[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c3[4]+old);return n;});
    $("button[data-original-title*='"+c4[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z11/g, purl+c4[4]+old);return n;});
    $("button[data-original-title*='"+c5[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c5[4]+old);return n;});
    $("button[data-original-title*='"+h1[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h1[4]+old);return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2401/g, purl+h1[4]+old);return n;});
    $("button[data-original-title*='"+h2[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h2[4]+old);return n;});
    $("button[data-original-title*='"+h3[3]+"']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h3[4]+old);return n;});
};
function themeEqName(){
    $("button[data-original-title]").attr("data-original-title",function(n,v){
        n= v.replace(/探险者之剑/g, a1[3]);n= n.replace(/探险者短弓/g, a2[3]);n= n.replace(/探险者短杖/g, a3[3]);n= n.replace(/狂信者的荣誉之刃/g, a4[3]);n= n.replace(/反叛者的刺杀弓/g, a5[3]);n= n.replace(/幽梦匕首/g, a6[3]);
        n= n.replace(/光辉法杖/g, a7[3]);n= n.replace(/荆棘盾剑/g, a8[3]);n= n.replace(/荆棘剑盾/g, a8[3]);n= n.replace(/陨铁重剑/g, a9[3]);n= n.replace(/饮血魔剑/g, a10[3]);n= n.replace(/饮血长枪/g, a10[3]);
        n= n.replace(/探险者手环/g, w1[3]);n= n.replace(/探险者手套/g, w1[3]);n= n.replace(/命师的传承手环/g, w2[3]);n= n.replace(/秃鹫手环/g, w3[3]);n= n.replace(/秃鹫手套/g, w3[3]);n= n.replace(/海星戒指/g, w4[3]);
        n= n.replace(/探险者铁甲/g, c1[3]);n= n.replace(/探险者皮甲/g, c2[3]);n= n.replace(/探险者布甲/g, c3[3]);n= n.replace(/旅法师的灵光袍/g, c4[3]);n= n.replace(/战线支撑者的荆棘重甲/g, c5[3]);
        n= n.replace(/复苏战衣/g, c6[3]);n= n.replace(/复苏木甲/g, c6[3]);n= n.replace(/挑战斗篷/g, c7[3]);
        n= n.replace(/探险者耳环/g, h1[3]);n= n.replace(/探险者头巾/g, h1[3]);n= n.replace(/占星师的耳饰/g, h2[3]);n= n.replace(/占星师的发饰/g, h2[3]);n= n.replace(/萌爪耳钉/g, h3[3]);n= n.replace(/天使缎带/g, h3[3]);return n;
    });
    $(".with-padding").html(function(n,v){
        n= v.replace(/探险者之剑/g, a1[3]);n= n.replace(/探险者短弓/g, a2[3]);n= n.replace(/探险者短杖/g, a3[3]);n= n.replace(/狂信者的荣誉之刃/g, a4[3]);n= n.replace(/反叛者的刺杀弓/g, a5[3]);n= n.replace(/幽梦匕首/g, a6[3]);
        n= n.replace(/光辉法杖/g, a7[3]);n= n.replace(/荆棘盾剑/g, a8[3]);n= n.replace(/荆棘剑盾/g, a8[3]);n= n.replace(/陨铁重剑/g, a9[3]);n= n.replace(/饮血魔剑/g, a10[3]);n= n.replace(/饮血长枪/g, a10[3]);
        n= n.replace(/探险者手环/g, w1[3]);n= n.replace(/探险者手套/g, w1[3]);n= n.replace(/命师的传承手环/g, w2[3]);n= n.replace(/秃鹫手环/g, w3[3]);n= n.replace(/秃鹫手套/g, w3[3]);n= n.replace(/海星戒指/g, w4[3]);
        n= n.replace(/探险者铁甲/g, c1[3]);n= n.replace(/探险者皮甲/g, c2[3]);n= n.replace(/探险者布甲/g, c3[3]);n= n.replace(/旅法师的灵光袍/g, c4[3]);n= n.replace(/战线支撑者的荆棘重甲/g, c5[3]);
        n= n.replace(/复苏战衣/g, c6[3]);n= n.replace(/复苏木甲/g, c6[3]);n= n.replace(/挑战斗篷/g, c7[3]);
        n= n.replace(/探险者耳环/g, h1[3]);n= n.replace(/探险者头巾/g, h1[3]);n= n.replace(/占星师的耳饰/g, h2[3]);n= n.replace(/占星师的发饰/g, h2[3]);n= n.replace(/萌爪耳钉/g, h3[3]);n= n.replace(/天使缎带/g, h3[3]);return n;
    });
};
function themeIcon(){
    if(ext!=".gif"){ $("button[style*='ys/icon/z']").attr("style",function(n,v){ n= v.replace(/.gif/g, ext);return n;});};
    $("button[style*='z2101']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, purl+a1[4]);n=n.replace(/ys\/icon\/z2101/g, purl+a1[4]+old);return n;});
    $("button[style*='z2102']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, purl+a2[4]);n=n.replace(/ys\/icon\/z2102/g, purl+a2[4]+old);return n;});
    $("button[style*='z2103']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, purl+a3[4]);n=n.replace(/ys\/icon\/z2103/g, purl+a3[4]+old);return n;});
    $("button[style*='z2104']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, purl+a4[4]);n=n.replace(/ys\/icon\/z2104/g, purl+a4[4]+old);return n;});
    $("button[style*='z2105']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, purl+a5[4]);n=n.replace(/ys\/icon\/z2105/g, purl+a5[4]+old);return n;});
    $("button[style*='z2106']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, purl+a6[4]);n=n.replace(/ys\/icon\/z2106/g, purl+a6[4]+old);return n;});
    $("button[style*='z2107']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, purl+a7[4]);n=n.replace(/ys\/icon\/z2107/g, purl+a7[4]+old);return n;});
    $("button[style*='z2108']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, purl+a8[4]);n=n.replace(/ys\/icon\/z2108/g, purl+a8[4]+old);return n;});
    $("button[style*='z2109']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, purl+a9[4]);n=n.replace(/ys\/icon\/z2109/g, purl+a9[4]+old);return n;});
    $("button[style*='z2110']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g,purl+a10[4]);n=n.replace(/ys\/icon\/z2110/g,purl+a10[4]+old);return n;});
    $("button[style*='z2201']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);n=n.replace(/ys\/icon\/z2201/g, purl+w1[4]+old);return n;});
    $("button[style*='z2202']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, purl+w2[4]);n=n.replace(/ys\/icon\/z2202/g, purl+w2[4]+old);return n;});
    $("button[style*='z2203']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);n=n.replace(/ys\/icon\/z2203/g, purl+w3[4]+old);return n;});
    $("button[style*='z2204']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2204_/g, purl+w4[4]);n=n.replace(/ys\/icon\/z2204/g, purl+w4[4]+old);return n;});
    $("button[style*='z2301']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2301_/g, purl+c1[4]);n=n.replace(/ys\/icon\/z2301/g, purl+c1[4]+old);return n;});
    $("button[style*='z2302']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2302_/g, purl+c2[4]);n=n.replace(/ys\/icon\/z2302/g, purl+c2[4]+old);return n;});
    $("button[style*='z2303']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2303_/g, purl+c3[4]);n=n.replace(/ys\/icon\/z2303/g, purl+c3[4]+old);return n;});
    $("button[style*='z2304']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2304_/g, purl+c4[4]);n=n.replace(/ys\/icon\/z2304/g, purl+c4[4]+old);return n;});
    $("button[style*='z2305']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2305_/g, purl+c5[4]);n=n.replace(/ys\/icon\/z2305/g, purl+c5[4]+old);return n;});
    $("button[style*='z2306']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2306_/g, purl+c6[4]);n=n.replace(/ys\/icon\/z2306/g, purl+c6[4]+old);return n;});
    $("button[style*='z2307']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2307_/g, purl+c7[4]);n=n.replace(/ys\/icon\/z2307/g, purl+c7[4]+old);return n;});
    $("button[style*='z2401']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2401_/g, purl+h1[4]);n=n.replace(/ys\/icon\/z2401/g, purl+h1[4]+old);return n;});
    $("button[style*='z2402']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2402_/g, purl+h2[4]);n=n.replace(/ys\/icon\/z2402/g, purl+h2[4]+old);return n;});
    $("button[style*='z2403']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2403_/g, purl+h3[4]);n=n.replace(/ys\/icon\/z2403/g, purl+h3[4]+old);return n;});
    $(".with-padding").html(function(n,v){n= v.replace(/星铜苹果护身符/g, dessertname[0]); n= n.replace(/蓝银葡萄护身符/g, dessertname[1]); n= n.replace(/紫晶樱桃护身符/g, dessertname[2]); return n;});
    $("button[data-original-title*='樱桃']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z901/g, purl+dessert[2]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/紫晶樱桃护身符/g, dessertname[2]);return n;});
    $("button[data-original-title*='葡萄']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z902/g, purl+dessert[1]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/蓝银葡萄护身符/g, dessertname[1]);return n;});
    $("button[data-original-title*='苹果']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z903/g, purl+dessert[0]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/星铜苹果护身符/g, dessertname[0]);return n;});
    $("button[data-original-title*='稀有']").attr("data-original-title",function(n,v){ n= v.replace(/稀有/g, dessertlevel[0]);return n;});
    $("button[data-original-title*='史诗']").attr("data-original-title",function(n,v){ n= v.replace(/史诗/g, dessertlevel[1]);return n;});
    $("button[data-original-title*='传奇']").attr("data-original-title",function(n,v){ n= v.replace(/传奇/g, dessertlevel[2]);return n;});
    $(".fyg_tc>img[src*='z2101_']").attr("src",function(n,v){ loading = false;nowEquip=4;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2101_/g, purl+a1[4]);return n;});
    $(".fyg_tc>img[src*='z2102_']").attr("src",function(n,v){ loading = false;nowEquip=8;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2102_/g, purl+a2[4]);return n;});
    $(".fyg_tc>img[src*='z2103_']").attr("src",function(n,v){ loading = false;nowEquip=7;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2103_/g, purl+a3[4]);return n;});
    $(".fyg_tc>img[src*='z2104_']").attr("src",function(n,v){ loading = false;nowEquip=2;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2104_/g, purl+a4[4]);return n;});
    $(".fyg_tc>img[src*='z2105_']").attr("src",function(n,v){ loading = false;nowEquip=8;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2105_/g, purl+a5[4]);return n;});
    $(".fyg_tc>img[src*='z2106_']").attr("src",function(n,v){ loading = false;nowEquip=9;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2106_/g, purl+a6[4]);return n;});
    $(".fyg_tc>img[src*='z2107_']").attr("src",function(n,v){ loading = false;nowEquip=7;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2107_/g, purl+a7[4]);return n;});
    $(".fyg_tc>img[src*='z2108_']").attr("src",function(n,v){ loading = false;nowEquip=3;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2108_/g, purl+a8[4]);return n;});
    $(".fyg_tc>img[src*='z2109_']").attr("src",function(n,v){ loading = false;nowEquip=5;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2109_/g, purl+a9[4]);return n;});
    $(".fyg_tc>img[src*='z2202_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, purl+w2[4]);return n;});
    $(".fyg_tc>img[src*='z2204_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2204_/g, purl+w4[4]);return n;});
    $(".fyg_tc>img[src*='z2301_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2301_/g, purl+c1[4]);return n;});
    $(".fyg_tc>img[src*='z2302_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2302_/g, purl+c2[4]);return n;});
    $(".fyg_tc>img[src*='z2303_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2303_/g, purl+c3[4]);return n;});
    $(".fyg_tc>img[src*='z2304_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2304_/g, purl+c4[4]);return n;});
    $(".fyg_tc>img[src*='z2305_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2305_/g, purl+c5[4]);return n;});
    $(".fyg_tc>img[src*='z2306_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2306_/g, purl+c6[4]);return n;});
    $(".fyg_tc>img[src*='z2307_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2307_/g, purl+c7[4]);return n;});
    $(".fyg_tc>img[src*='z2401_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2401_/g, purl+h1[4]);return n;});
    $(".fyg_tc>img[src*='z2402_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2402_/g, purl+h2[4]);return n;});
    $(".fyg_tc>img[src*='z2403_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2403_/g, purl+h3[4]);return n;});
    if(custom.useOldNames==true){
        $(".fyg_tc>img[src*='z2110_']").attr("src",function(n,v){ loading = false;nowEquip=6;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2110_/g, purl+a10[4]);return n;});
        $(".fyg_tc>img[src*='z2201_']").attr("src",function(n,v){ loading = false;nowEquip=1;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);return n;});
        $(".fyg_tc>img[src*='z2203_']").attr("src",function(n,v){ loading = false;nowEquip=1;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);return n;});
        $("button[data-original-title*='荆棘盾剑']").attr("data-original-title",function(n,v){ n= v.replace(/荆棘盾剑/g, "荆棘剑盾");return n;});
        $("button[data-original-title*='饮血魔剑']").attr("data-original-title",function(n,v){ n= v.replace(/饮血魔剑/g, "饮血长枪");return n;});
        $("button[data-original-title*='探险者手环']").attr("data-original-title",function(n,v){ n= v.replace(/探险者手环/g, "探险者手套");return n;});
        $("button[data-original-title*='秃鹫手环']").attr("data-original-title",function(n,v){ n= v.replace(/秃鹫手环/g, "秃鹫手套");return n;});
        $("button[data-original-title*='复苏战衣']").attr("data-original-title",function(n,v){ n= v.replace(/复苏战衣/g, "复苏木甲");return n;});
        $("button[data-original-title*='探险者耳环']").attr("data-original-title",function(n,v){ n= v.replace(/探险者耳环/g, "探险者头巾");return n;});
        $("button[data-original-title*='占星师的耳饰']").attr("data-original-title",function(n,v){ n= v.replace(/占星师的耳饰/g, "占星师的发饰");return n;});
        $("button[data-original-title*='萌爪耳钉']").attr("data-original-title",function(n,v){ n= v.replace(/萌爪耳钉/g, "天使缎带");return n;});
        $(".with-padding").html(function(n,v){
            n= v.replace(/荆棘盾剑/g, "荆棘剑盾");n= n.replace(/饮血魔剑/g, "饮血长枪");n= n.replace(/探险者手环/g, "探险者手套");n= n.replace(/秃鹫手环/g, "秃鹫手套");
            n= n.replace(/复苏战衣/g, "复苏木甲");n= n.replace(/探险者耳环/g, "探险者头巾");n= n.replace(/占星师的耳饰/g, "占星师的发饰");n= n.replace(/萌爪耳钉/g, "天使缎带");return n;});
    }else{
        $(".fyg_tc>img[src*='z2110_']").attr("src",function(n,v){ nowEquip=10;pagetype=nowEquip;n= v.replace(/ys\/icon\/z\/z2110_/g,purl+a10[4]);return n;});
        $(".fyg_tc>img[src*='z2201_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);return n;});
        $(".fyg_tc>img[src*='z2203_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);return n;});
    };
    if(custom.useThemeName==true){ themeEqName(); } else if(nowTheme["equip-"+custom.language]){ themeEqName(); };localStorage.setItem('nowEquip', nowEquip);
};
function themeFgimg(){
    let imgpanel,cardname;
    if($(".text-info.fyg_f24.fyg_lh60").length==1){
        if($("#bigcardimg").length==0){ $(`<p></p><img id="bigcardimg" src="https://sticker.inari.site/null.gif">`).insertBefore("#backpacks"); };
        imgpanel = document.getElementsByClassName('text-info fyg_f24 fyg_lh60')[0];cardname=imgpanel.children[0].innerText;tempvo=false;
        if(cardname.length==1){
            yourcard=cardname;
            if(custom.yourcard!=yourcard){ custom.yourcard=yourcard;update(); };
            cardvo=nowTheme[yourcard+"voice"];
            kanbanimg=nowTheme[yourcard][2];$("#bigcardimg").attr('src',nowTheme[yourcard][3]);spineJson=nowTheme[yourcard+"spine"];
            if(custom.showKanban==true&&nowTheme.spine!=true){$(".tpkanban").attr('src', kanbanimg);};
            if(nowTheme[yourcard][2]!="https://sticker.inari.site/null.gif"&&imgpanel.children.length==2){
                $(`<p></p><img id="middlecardimg" src="${nowTheme[yourcard][2]}" style="cursor: pointer;"><p></p>`).insertAfter(imgpanel.children[1]);
            };pagetype=nowEquip;
        }
        else if(cardname.length==0){
            yourcard="舞";custom.yourcard=yourcard;cardvo=nowTheme[yourcard+"voice"];spineJson=nowTheme[yourcard+"spine"];
            kanbanimg=nowTheme[yourcard][2];$("#bigcardimg").attr('src',"https://sticker.inari.site/null.gif");
            if(custom.showKanban==true&&nowTheme.spine!=true){$(".tpkanban").attr('src', kanbanimg);};pagetype=nowEquip;
        };
    };
    if($(".text-info.fyg_f24").length==2){
        cardname = document.getElementsByClassName('text-info fyg_f24')[1].innerText;tempca=cardname;$("#bigcardimg").attr('src',nowTheme[cardname][3]);tempvo=nowTheme[cardname+"voice"];
        if(custom.voiceO==true&&ccard!=true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);$("#themeSoundPlay")[0].play();};
        loading=false;spineload(nowTheme[cardname+"spine"].name, nowTheme[cardname+"spine"].type);
    };
    if($(".col-sm-2.fyg_lh60").length>0){
        for(let i=0;i<$(".col-sm-2.fyg_lh60").length;i++){
            imgpanel = document.getElementsByClassName('col-sm-2 fyg_lh60')[i];cardname=imgpanel.children[0].innerText;
            if(cardname.length==1){ imgpanel.style.textAlign="left";$(`<img id="smallcardimg" src="${nowTheme[cardname][1]}" style="vertical-align:top !important;"><span>&nbsp;&nbsp;</span>`).insertBefore(imgpanel.children[0]);};
        };
    };
    if($(".col-md-7.fyg_tr").length>0){
        for(let i=0;i<$(".col-md-7.fyg_tr").length;i++){
            imgpanel = document.getElementsByClassName('col-md-7 fyg_tr')[i];cardname=imgpanel.children[0].innerText;
            if(cardname[cardname.length-3]!="."){ cardname=cardname[cardname.length-2]; imgpanel.style.backgroundImage=`url("${nowTheme[cardname][4]}")`;imgpanel.style.backgroundSize="cover";};
        };
    };
    if($(".col-md-7.fyg_tl").length>0){
        for(let i=0;i<$(".col-md-7.fyg_tl").length;i++){
            imgpanel = document.getElementsByClassName('col-md-7 fyg_tl')[i];cardname=imgpanel.children[0].innerText;let isyg=false;
            for (let j = 0; j < ygcheck.length; j++) { if (cardname.indexOf(ygcheck[j]) > -1) { let ygtcheck=ygcheck[j];imgpanel.style.backgroundImage=`url("${nowTheme[ygtcheck]}")`;imgpanel.style.backgroundSize="cover";isyg = true; };};
            if(cardname[cardname.length-2]!="."&&isyg==false){ cardname=cardname[cardname.length-9];imgpanel.style.backgroundImage=`url("${nowTheme[cardname][5]}")`;imgpanel.style.backgroundSize="cover"; };
        };
    };
    if(nowTheme.spine!=true){spineJson={"name":"hi","type":"0","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8};};
    if(window.location.href.indexOf('equip.php') > -1){ spineload(spineJson.name, pagetype); if($("#eqli2.active").length!=1){$("#bigcardimg").attr('src',"https://sticker.inari.site/null.gif");};};
};
function equipKBVO(){
    let cardname;
    if($(".text-info.fyg_f24.fyg_lh60").length==1){
        let imgpanel = document.getElementsByClassName('text-info fyg_f24 fyg_lh60')[0];cardname=imgpanel.children[0].innerText;tempvo=false;
        if(cardname.length==1){
            yourcard=cardname;
            if(custom.yourcard!=yourcard){custom.yourcard=yourcard;update();};
            cardvo=nowTheme[yourcard+"voice"];
            spineJson=nowTheme[yourcard+"spine"];pagetype=nowEquip;
        }
        else if(cardname.length==0){
            yourcard="舞";custom.yourcard=yourcard;cardvo=nowTheme[yourcard+"voice"];spineJson=nowTheme[yourcard+"spine"];pagetype=nowEquip;
        };
    };
    if($(".text-info.fyg_f24").length==2){
        cardname = document.getElementsByClassName('text-info fyg_f24')[1].innerText;tempca=cardname;tempvo=nowTheme[cardname+"voice"];
        if(custom.voiceO==true&&ccard!=true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);$("#themeSoundPlay")[0].play();};
        if(nowTheme.spine==true){loading=false;spineload(nowTheme[cardname+"spine"].name, nowTheme[cardname+"spine"].type);};
    };
    if(nowTheme.spine!=true){spineJson={"name":"hi","type":"0","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8};};
    if(window.location.href.indexOf('equip.php') > -1){ spineload(spineJson.name, pagetype);};
};
function battleVo(){
    if(soundonce%2==0&&battlecheck<1&&$(".alert.with-icon.fyg_tc").length>0){
        let battleCG;
        if($(".alert.with-icon.fyg_tc").length!=1){
            if($(".alert.alert-danger.with-icon.fyg_tc").length>sucheck){
                let spjoy=$("option[value*=joyResult]")[0].value.split(',');playAnimation([spjoy[0]]);battleCG=nowTheme[yourcard][6];
                $("#themeSoundPlay").attr('src',cardvo[0]+'win'+cardvo[1]);
            };
            if($(".alert.alert-info.with-icon.fyg_tc").length>facheck){
                $("#themeSoundPlay").attr('src',cardvo[0]+'lose'+cardvo[1]);battleCG=nowTheme[yourcard][7];playAnimation(['damage','die','landing']);
            };
        }
        else{
            if($(".alert.alert-danger.with-icon.fyg_tc").length>0){
                let spjoy=$("option[value*=joyResult]")[0].value.split(',');playAnimation([spjoy[0]]);battleCG=nowTheme[yourcard][6];
                $("#themeSoundPlay").attr('src',cardvo[0]+'win'+cardvo[1]);
            };
            if($(".alert.alert-info.with-icon.fyg_tc").length>0){
                $("#themeSoundPlay").attr('src',cardvo[0]+'lose'+cardvo[1]);battleCG=nowTheme[yourcard][7];playAnimation(['damage','die','landing']);
            };
        };
        if(custom.voiceO==true){$("#themeSoundPlay")[0].play();};if(custom.showKanban==true){battleCg(battleCG);};++battlecheck;
    };
    if($("button[class*='fyg_colpz05bg'][style*='b4.gif']").length>0&&collecheck<1){
        let expcard=$("button[class*='fyg_colpz05bg'][style*='b4.gif']+.fyg_f18")[0].innerText,expvo=nowTheme[expcard[5]+"voice"];++collecheck;
        $("#themeSoundPlay").attr('src',expvo[0]+'levelup'+expvo[1]);if(custom.voiceO==true){$("#themeSoundPlay")[0].play();};
    };
};
function battleCg(battleCG){
    if(nowTheme.spine!=true){$(".tpkanban").attr('src',battleCG); setTimeout(()=>{$(".tpkanban").attr('src', kanbanimg);},3000);};
};

/* Kanban Drag & Resize */
function dragfunc(obj){
    ww = window.innerWidth || document.body.clientWidth; wh = window.innerHeight || document.body.clientHeight;
    let l,t,i,s;
    obj.onmousedown = function (event) {
        obj.setCapture && obj.setCapture(); event = event || window.event;
        l = obj.style.left;t = obj.style.top; let ol = event.clientX - obj.offsetLeft, ot = event.clientY - obj.offsetTop;let dragrun=true;
        document.onmousemove = function (event) { event = event || window.event; obj.style.left = event.clientX - ol + "px"; obj.style.top = event.clientY - ot + "px"; if(dragrun){playAnimation(['run']);dragrun=false;};};
        document.onmouseup = function () {
            document.onmousemove = null; document.onmouseup = null;
            obj.releaseCapture && obj.releaseCapture(); i = obj.style.left; s = obj.style.top;
            if (l == i && t == s) {
                if(custom.voiceO==true&&tempvo!=false){$("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);$("#themeSoundPlay")[0].play();}
                else if(custom.voiceO==true){$("#themeSoundPlay").attr('src',cardvo[0]+Math.ceil(Math.random()*4-1)+cardvo[1]);$("#themeSoundPlay")[0].play();}; playAnimation(['000000_dear_smile','idle']);
            }
            else {
                if (parseInt(i) < 0) { obj.style.left = '0px'; i = 0;}
                else if (parseInt(i) > ww-3.6*Math.floor(custom.kanbansize)) { i = 0.8; obj.style.left = ww-3.6*Math.floor(custom.kanbansize) + 'px';}
                else if (parseInt(i) < ww-3.6*Math.floor(custom.kanbansize)) { i = parseInt(i) / ww;};
                if (parseInt(s) < 0) { obj.style.top ='0px'; s = 0;}
                else if (parseInt(s) > wh-3*Math.floor(custom.kanbansize)) { s = 0.68; obj.style.top = wh-3*Math.floor(custom.kanbansize) + 'px';}
                else if (parseInt(s) < wh-3*Math.floor(custom.kanbansize)) { s = parseInt(s) / wh;};
                localStorage.setItem('imgmove', JSON.stringify([i, s]));playAnimation(['idle']);
            };
        }; return false;
    };
    obj.addEventListener('touchmove', function (event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            let touch = event.targetTouches[0];
            if (touch.clientX >= 0) {
                if (touch.clientX < ww - 3.6*Math.floor(custom.kanbansize )) { obj.style.left = touch.clientX + 'px'; l = touch.clientX / ww }
                else { obj.style.left = ww-3.6*Math.floor(custom.kanbansize ) + 'px'; l = 0.8 }
            } else if (touch.clientX < 0) { obj.style.left = '0px'; l = 0 };
            if (touch.clientY >= 0) {
                if (touch.clientY < wh-3*Math.floor(custom.kanbansize )) { obj.style.top = touch.clientY + 'px'; t = touch.clientY / wh }
                else { obj.style.top = wh-3*Math.floor(custom.kanbansize ) + 'px'; t = 0.68 }
            } else if (touch.clientY < 0) { obj.style.top = '0px'; t = 0 };
            localStorage.setItem('imgmove', JSON.stringify([l, t]));
        }
    },{ passive: false }); return false;
};
window.onresize = function(){
    let temp = $('#divkanban'); ww = window.innerWidth || document.body.clientWidth; wh = window.innerHeight || document.body.clientHeight;
    if(localStorage.imgmove != null){ imgmove = JSON.parse(localStorage.imgmove); };
    if(imgmove[0]*ww>ww-3.6*Math.floor(custom.kanbansize )){kbw=ww-3.6*Math.floor(custom.kanbansize )}else{kbw=imgmove[0]*ww};
    if(imgmove[1]*wh>wh-3*Math.floor(custom.kanbansize )){kbh=wh-3*Math.floor(custom.kanbansize )}else{kbh=imgmove[1]*wh};
    temp[0].style.left = kbw + 'px'; temp[0].style.top = kbh + 'px';
};

/* Spine */
window.skeleton = {};
function _(e, t, n) {
    let r = null;
    if ("text" === e){return document.createTextNode(t);};
    r = document.createElement(e);
    for (let l in t){
        if ("style" === l){for (let a in t.style) r.style[a] = t.style[a];}
        else if ("className" === l){r.className = t[l];}
        else if ("event" === l){for (let a in t[l]) r.addEventListener(a, t[l][a]);}
        else {r.setAttribute(l, t[l]);};
    };
    if (n) for (let s = 0; s < n.length; s++)null != n[s] && r.appendChild(n[s]);
    return r;
};
function getClass(i){
    return (i < 10 ? '0' : '') + i;
};
function loadData(url, cb, loadType, progress) {
    let xhr = new XMLHttpRequest; xhr.open('GET', url, true);
    if (loadType) xhr.responseType = loadType; if (progress) xhr.onprogress = progress;
    xhr.onload = function () { if (xhr.status == 200){cb(true, xhr.response);}else{ cb(false);};};
    xhr.onerror = function () {cb(false); }; xhr.send();
};
function sliceCyspAnimation(buf) {
    let view = new DataView(buf), count = view.getInt32(12, true); return { count: count, data: buf.slice((count + 1) * 32)};
};
function spineinit() {
    canvas = document.getElementById("tpkanban"); let config = { alpha: true ,backgroundColor: "#000000"};
    gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
    if (!gl) { alert('WebGL is unavailable.');return; };
    shader = spine.webgl.Shader.newTwoColoredTextured(gl); batcher = new spine.webgl.PolygonBatcher(gl);
    mvp.ortho2d(0, 0, 512 - 1, 512 - 1); skeletonRenderer = new spine.webgl.SkeletonRenderer(gl); shapes = new spine.webgl.ShapeRenderer(gl);
    if(nowTheme.spine==true){spineJson=nowTheme[yourcard+"spine"];}else{spineJson={"name":"hi","type":"1","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8};};
    spineload(spineJson.name, pagetype);
};
function spineload(name, type) {
    if (custom.showKanban != true||nowTheme.spine!=true||loading) return; loading = true;
    if (activeSkeleton == name && currentClass == type) return; currentClass = type;
    let baseUnitId = name | "wuu"; loadingSkeleton = { id: name , info: spineJson, baseId: '000000' };
    if (loadingSkeleton.info.hasSpecialBase){loadingSkeleton.baseId = baseUnitId; currentClass = baseUnitId;}; let baseId = loadingSkeleton.baseId;
    if (!generalBattleSkeletonData[baseId]){
        console.log( '加载共用骨架 (1/6)');
        loadData(spinert[0] + baseId + '_CHARA_BASE.cysp', function (success, data) {
            if (!success || data === null) return;loading = true; generalBattleSkeletonData[baseId] = data; loadAdditionAnimation();
        }, 'arraybuffer');}
    else {loadAdditionAnimation();};
};
function loadAdditionAnimation() {
    let doneCount = 0, abort = false,baseId = loadingSkeleton.baseId;
    generalAdditionAnimations[baseId] = generalAdditionAnimations[baseId] || {};
    additionAnimations.forEach(function (i) {
        if (generalAdditionAnimations[baseId][i]) return doneCount++;
        loadData(spinert[0] + baseId + '_' + i + '.cysp', function (success, data) {
            if (!success || data == null){ console.log( '加载共用骨架失败');loading = false;abort = true;return abort;};if (abort) return;
            generalAdditionAnimations[baseId][i] = sliceCyspAnimation(data);
            if (++doneCount == additionAnimations.length) return loadClassAnimation();console.log('加载额外动画 (2/6) [' + doneCount + '/6]') ;
        }, 'arraybuffer');
    });
    if (doneCount == additionAnimations.length) return loadClassAnimation();console.log('加载额外动画 (2/6) [' + doneCount + '/6]');
};
function loadClassAnimation() {
    if (currentClassAnimData.type == currentClass){ loadCharaSkillAnimation(); }
    else{
        console.log('加载职介动画 (3/6)');
        loadData( spinert[0] + getClass(currentClass) + '_COMMON_BATTLE.cysp', function (success, data) {
            if (!success || data === null) {console.log('加载职介动画失败');loading = false;return loading;};
            currentClassAnimData = { type: currentClass, data: sliceCyspAnimation(data) };loadCharaSkillAnimation();
        }, 'arraybuffer');
    };
};
function loadCharaSkillAnimation() {
    let baseUnitId = loadingSkeleton.id;
    if (currentCharaAnimData.id == baseUnitId){ loadTexture();}
    else{
        console.log('加载技能动画 (4/6)');loadData(spinert[1] + baseUnitId + 'BATTLE.cysp', function (success, data) {
            if (!success || data === null) { console.log('加载技能动画失败');loading = false;return loading;};
            currentCharaAnimData = { id: baseUnitId, data: sliceCyspAnimation(data)};loadTexture();
        }, 'arraybuffer');
    }
};
function loadTexture() {
    console.log('加载材质位置 (5/6)');
    loadData(spinert[1] + loadingSkeleton.id + 'texture.atlas', function (success, atlasText) {
        if (!success) {console.log('加载材质位置失败');loading = false;return loading;}else{console.log('加载材质图片 (6/6)');};
        loadData(spinert[1] + loadingSkeleton.id + 'texture.png', function (success, blob) {
            if (!success) {console.log('加载材质图片失败');loading = false;return loading; };
            let img = new Image();
            img.onload = function () {
                let created = !!window.skeleton.skeleton;
                if (created) { window.skeleton.state.clearTracks(); window.skeleton.state.clearListeners(); gl.deleteTexture(currentTexture.texture);};
                let imgTexture = new spine.webgl.GLTexture(gl, img); URL.revokeObjectURL(img.src);
                let atlas = new spine.TextureAtlas(atlasText, function (path) { return imgTexture; });
                currentTexture = imgTexture; let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
                let baseId = loadingSkeleton.baseId,additionAnimations = Object.values(generalAdditionAnimations[baseId]),animationCount = 0,classAnimCount = currentClassAnimData.data.count;
                animationCount += classAnimCount; let unitAnimCount = currentCharaAnimData.data.count; animationCount += unitAnimCount;
                additionAnimations.forEach(function (i) { animationCount += i.count; });
                let newBuffSize = generalBattleSkeletonData[baseId].byteLength - 64 + 1 + currentClassAnimData.data.data.byteLength + currentCharaAnimData.data.data.byteLength;
                additionAnimations.forEach(function (i) { newBuffSize += i.data.byteLength;});
                let newBuff = new Uint8Array(newBuffSize), offset = 0;
                newBuff.set(new Uint8Array(generalBattleSkeletonData[baseId].slice(64)), 0);
                offset += generalBattleSkeletonData[baseId].byteLength - 64;
                newBuff[offset] = animationCount; offset++;
                newBuff.set(new Uint8Array(currentClassAnimData.data.data), offset);
                offset += currentClassAnimData.data.data.byteLength;
                newBuff.set(new Uint8Array(currentCharaAnimData.data.data), offset);
                offset += currentCharaAnimData.data.data.byteLength;
                additionAnimations.forEach(function (i) { newBuff.set(new Uint8Array(i.data), offset);offset += i.data.byteLength;})
                let skeletonBinary = new spine.SkeletonBinary(atlasLoader),skeletonData = skeletonBinary.readSkeletonData(newBuff.buffer),skeleton = new spine.Skeleton(skeletonData);
                skeleton.setSkinByName('default'); let bounds = calculateBounds(skeleton);
                let animationStateData = new spine.AnimationStateData(skeleton.data);
                animationState = new spine.AnimationState(animationStateData);
                animationState.setAnimation(0, getClass(currentClass) + '_idle', true);
                animationState.addListener({
                    complete: function tick(track) {
                        if (animationQueue.length) {
                            let nextAnim = animationQueue.shift(); if (nextAnim == 'stop') return; if (nextAnim == 'hold') return setTimeout(tick, 1e3);
                            if (nextAnim.substr(0, 1) != '1') nextAnim = getClass(currentClass) + '_' + nextAnim; console.log(nextAnim);
                            animationState.setAnimation(0, nextAnim, !animationQueue.length);
                        }
                    },
                });
                window.skeleton = { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: true };
                loading = false;(window.updateUI || setupUI)();
                if (!created) { canvas.style.width = '99%'; requestAnimationFrame(render); setTimeout(function () { canvas.style.width = ''; }, 0); };
                activeSkeleton = loadingSkeleton.id; currentSkeletonBuffer = newBuff.buffer;
            }
            img.src = URL.createObjectURL(blob); }, 'blob', function (e) { let perc = e.loaded / e.total * 40 + 60; });
    })
};
function playAnimation(animation){
  if(custom.showKanban==true&&nowTheme.spine==true){
    animationState = skeleton.state;forceNoLoop = false;animationQueue = animation;
    if (animationQueue[0] == 'multi_standBy') { animationQueue.push('multi_idle_standBy');}
    else if (['multi_idle_standBy', 'multi_idle_noWeapon', 'idle', 'walk', 'run', 'run_gamestart'].indexOf(animationQueue[0]) == -1) { animationQueue.push('idle'); };
    console.log(animationQueue); let nextAnim = animationQueue.shift();
    if (!/^\d{6}/.test(nextAnim)) nextAnim = getClass(currentClassAnimData.type) + '_' + nextAnim;
    console.log(nextAnim); animationState.setAnimation(0, nextAnim, !animationQueue.length && !forceNoLoop);
  };
};
function calculateBounds(skeleton) {
    skeleton.setToSetupPose();skeleton.updateWorldTransform();
    let offset = new spine.Vector2(),size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);offset.y = 0; return { offset: offset, size: size };
};
function setupUI() {
    let setupAnimationUI = function () {
        let animationList = $("#animationList");animationList.empty();
        let skeleton = window.skeleton.skeleton,state = window.skeleton.state,activeAnimation = state.tracks[0].animation.name;
        [
            ['闲置', 'idle'],
            ['准备', 'standBy'],
            ['走', 'walk'],
            ['跑', 'run'],
            ['跑（入场）', 'run_gamestart'],
            ['落地', 'landing'],
            ['攻击', 'attack'],
            ['攻击（扫荡）', 'attack_skipQuest'],
            ['庆祝-短', 'joy_short,hold,joy_short_return'],
            ['庆祝-长', 'joy_long,hold,joy_long_return'],
            ['受伤', 'damage'],
            ['死亡', 'die,stop'],
            ['合作-准备', 'multi_standBy'],
            ['合作-闲置', 'multi_idle_standBy'],
            ['合作-闲置（无武器）', 'multi_idle_noWeapon']
        ].forEach(function (i) { animationList[0].appendChild(_('option', { value: i[1] }, [_('text', i[0])]));});
        animationList[0].appendChild(_('option', { disabled: '' }, [_('text', '---')]));
        skeleton.data.animations.forEach(function (i) {
            i = i.name;if (!/^\d{6}_/.test(i)) return; let val = i;if (!/skill/.test(i))val = i + ',stop';
            animationList[0].appendChild(_('option', { value: val }, [ _('text', i.replace(/\d{6}_skill(.+)/, '技能$1').replace(/\d{6}_joyResult/, '庆祝-角色特有')) ]));
        })
    }
    window.updateUI = function () { setupAnimationUI();};setupAnimationUI();
};
function render() {
    let now = Date.now() / 1000,delta = now - lastFrameTime; lastFrameTime = now; delta *= speedFactor;
    resize(); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    let state = window.skeleton.state,skeleton = window.skeleton.skeleton,bounds = window.skeleton.bounds,premultipliedAlpha = window.skeleton.premultipliedAlpha;
    state.update(delta); state.apply(skeleton); skeleton.updateWorldTransform();
    shader.bind(); shader.setUniformi(spine.webgl.Shader.SAMPLER, 0); shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
    batcher.begin(shader); skeletonRenderer.premultipliedAlpha = premultipliedAlpha; skeletonRenderer.draw(batcher, skeleton); batcher.end(); shader.unbind(); requestAnimationFrame(render);
};
function resize() {
    let useBig = screen.width * devicePixelRatio > 1280,w = canvas.clientWidth * devicePixelRatio,h = canvas.clientHeight * devicePixelRatio,bounds = window.skeleton.bounds;
    if (canvas.width != w || canvas.height != h){ canvas.width = w;canvas.height = h;};
    /* magic */
    let centerX = bounds.offset.x + bounds.size.x / 2,centerY = bounds.offset.y + bounds.size.y / 2,scaleX = bounds.size.x / canvas.width,scaleY = bounds.size.y / canvas.height,scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;let width = 256 * scale,height = 256 * scale;
    mvp.ortho2d(spineJson.wi,spineJson.hi, width, height); gl.viewport(0, 0, 512*spineJson.re, 512*spineJson.re);
};

/* Cloud Core */
function login(username,act,way) {
    $.ajax({ url: api+'Login&username=' + username + '&password=momoTown', type: 'POST', dataType: 'json' })
        .done(data => {
        if (data.ret == 200) {
            let temp = data.data;
            if (temp.is_login == true) {
                console.log('login');
                temp=JSON.stringify([temp.user_id, temp.token]);
                localStorage.setItem('Cloud_'+User, temp);
                localStorage.setItem('momo_Cloud', temp);
                if(act=="lgn"){
                    download('Guhelper');
                }
                else if(act=="ctl"){ download(way); }
                else if(act=="ltc"){ upload(way); };
            }
            else if (temp.is_login == false) { alert('Oops!');return;}
        }
        else if(data.ret == 400) { beforeCloud('Gupdater'); register(username); }
        else{ alert('Oops!' + data.ret + data.msg);return; }
    })
        .fail(data => { console.log(data);return; });
};
function register(username) {
    $.ajax({ url: api+'Register&username=' + username + '&password=momoTown', type: 'POST', dataType: 'json' })
        .done(data => { if (data.ret == 200) { login(username,"ltc",'Gupdate');
                                             } else { alert('Oops！' + data.ret + data.msg) }; })
        .fail(data => { console.log(data) });
};
function upload(way) {
    let text=beforeCloud(way),user_id,token,test=false;
    if(localStorage.momo_Cloud){
        let cupd=JSON.parse(localStorage.momo_Cloud);
        user_id=cupd[0];token=cupd[1];
    }
    else{ login(momoUser,"ltc",way);return;};
    if(way=="test"){way="Cardupdate";test=true; };
    let formData={
        "user_id":user_id,
        "token":token,
        "texts":text
    }
    $.ajax({ url:api+way,data: formData, type: 'POST', dataType: 'json' })
        .done(data => {
        if (data.ret == 200) {
            if(test)way="test";
            console.log(way+" uploading...");
            if(data.data==null){ alert(way+' Date Length Too Long!'); return; }
            else if(data.data.ret!=200){ console.log(data);alert(data.data.ret+' Error! '+data.data.msg); return; }
            else{console.log(way+' successed!');};
            if(test){ download("test"); };
        }
        else { alert(data.msg + data.ret);return; }
    })
        .fail(data => { console.log(data);return; });
};
function download(way) {
    let user_id,token,test=false;
    if(localStorage.momo_Cloud){
        let cupd=JSON.parse(localStorage.momo_Cloud);
        user_id=cupd[0];token=cupd[1];
    }
    else{ login(momoUser,"ctl",way);return;};
    if(way=="test"){way="Cardbind";test=true;};
    let formData={
        "user_id":user_id,
        "token":token,
    }
    $.ajax({ url:api+way,data: formData, type: 'POST', dataType: 'json' })
        .done(data => {
        if(data!=null){
            if (data.ret == 200) {
                let tdt=data.data; tdt=tdt[way];
                if(way!="Guhelper"||test){ if(test)way="test"; console.log(way+" Downloading..."); tdt=tdt.replace(/ /g, "+");console.log("Decrypting "+way+" Data..."); tdt=dec(tdt); console.log(way+" Data Decrypted!"); }
                else{ console.log(way+" Downloading..."); };
                console.log("Unzipping "+way+" Data...");tdt=unzip(tdt); console.log(way+" Data Unzipped!");
                afterCloud(way,tdt);
            }
            else { alert(data.msg + data.ret);return; };
        }
        else{alert('Date Error!');return;}
    })
        .fail(data => { console.log(data);return;});
};
function beforeCloud(way){
    let encs;
    if(way!="Gupdater"){
        console.log("Start Data Processing...");
        console.log("Getting "+way+" Raw Data...");
    };
    if(way=="Gupdater"){
        momoConf.ThemePackConf={};
        momoConf.BeachConf={};
        momoConf.guDAQConf={};
        momoConf.PKConf={};

        if(localStorage.ThemePackConf){momoConf.ThemePackConf=JSON.parse(localStorage.ThemePackConf);};
        if(localStorage.userTheme){ momoConf.userTheme=localStorage.userTheme;};
        if(localStorage.maxap) { momoConf.PKConf.maxap =localStorage.maxap; };
        if(localStorage.showSM){ momoConf.PKConf.showSM=localStorage.showSM;};
        if(localStorage.maxrank){ momoConf.PKConf.maxrank=localStorage.maxrank; };
        if(localStorage.g_gemid){ momoConf.PKConf.g_gemid=localStorage.g_gemid; };
        if(localStorage.mainHost){ momoConf.PKConf.mainHost=localStorage.mainHost; };
        if(localStorage.g_ismake){ momoConf.PKConf.g_ismake=localStorage.g_ismake; };
        if(localStorage.flashtime) { momoConf.PKConf.flashtime =localStorage.flashtime; };
        if(localStorage.showcharlv){ momoConf.PKConf.showcharlv=localStorage.showcharlv;};
        if(localStorage.g_ismanualmake){ momoConf.PKConf.g_ismanualmake = localStorage.g_ismanualmake;};

        if(localStorage.getItem('autoBeach_'+User)) { momoConf.BeachConf=JSON.parse(localStorage.getItem('autoBeach_'+User));};

        if(localStorage.over) { momoConf.guDAQConf.over =localStorage.over; };
        if(localStorage.title){ momoConf.guDAQConf.title=localStorage.title;};
        if(localStorage.halo_max) { momoConf.guDAQConf.halo_max =localStorage.halo_max; };
        if(localStorage.cardName) { momoConf.guDAQConf.cardName =localStorage.cardName; };
        if(localStorage.keepcheck){ momoConf.guDAQConf.keepcheck=localStorage.keepcheck;};
        if(localStorage.attribute){ momoConf.guDAQConf.attribute=localStorage.attribute;};
        if(localStorage.beachcheck) { momoConf.guDAQConf.beachcheck=localStorage.beachcheck; };
        if(localStorage.dataReward) { momoConf.guDAQConf.dataReward=localStorage.dataReward; };
        if(localStorage.getItem(User+'_beach_BG') ) { momoConf.guDAQConf.beach_BG = localStorage.getItem(User+'_beach_BG') ; };
        if(localStorage.getItem(User+'_forgeAuto')) { momoConf.guDAQConf.forgeAuto =localStorage.getItem(User+'_forgeAuto'); };
        if(localStorage.getItem(User+'_indexRally')){ momoConf.guDAQConf.indexRally=localStorage.getItem(User+'_indexRally');};
        if(localStorage.getItem(User+'_equipment_BG')) { momoConf.guDAQConf.equipment_BG =localStorage.getItem(User+'_equipment_BG'); };
        if(localStorage.getItem(User+'_keepPkRecord')) { momoConf.guDAQConf.keepPkRecord =localStorage.getItem(User+'_keepPkRecord'); };
        if(localStorage.getItem(User+'_stoneOperation')) { momoConf.guDAQConf.stoneOperation =localStorage.getItem(User+'_stoneOperation'); };
        if(localStorage.getItem(User+'_autoTaskEnabled')){ momoConf.guDAQConf.autoTaskEnabled=localStorage.getItem(User+'_autoTaskEnabled');};
        if(localStorage.getItem(User+'_equipment_Expand')) { momoConf.guDAQConf.equipment_Expand =localStorage.getItem(User+'_equipment_Expand'); };
        if(localStorage.getItem(User+'_beach_forceExpand')){ momoConf.guDAQConf.beach_forceExpand=localStorage.getItem(User+'_beach_forceExpand');};
        if(localStorage.getItem(User+'_equipment_StoreExpand')) { momoConf.guDAQConf.equipment_StoreExpand= localStorage.getItem(User+'_equipment_StoreExpand'); };
        if(localStorage.getItem(User+'_stone_ProgressEquipTip')){ momoConf.guDAQConf.stone_ProgressEquipTip=localStorage.getItem(User+'_stone_ProgressEquipTip');};
        if(localStorage.getItem(User+'_stone_ProgressCardTip')) { momoConf.guDAQConf.stone_ProgressCardTip= localStorage.getItem(User+'_stone_ProgressCardTip'); };
        if(localStorage.getItem(User+'_stone_ProgressHaloTip')) { momoConf.guDAQConf.stone_ProgressHaloTip= localStorage.getItem(User+'_stone_ProgressHaloTip'); };
        if(localStorage.getItem(User+'_ignoreWishpoolExpiration') ) { momoConf.guDAQConf.ignoreWishpoolExpiration = localStorage.getItem(User+'_ignoreWishpoolExpiration') ; };
        if(localStorage.getItem(User+'_beach_ignoreStoreMysEquip')) { momoConf.guDAQConf.beach_ignoreStoreMysEquip =localStorage.getItem(User+'_beach_ignoreStoreMysEquip'); };
        if(localStorage.getItem(User+'_autoTaskCheckStoneProgress')){ momoConf.guDAQConf.autoTaskCheckStoneProgress=localStorage.getItem(User+'_autoTaskCheckStoneProgress');};
        if(localStorage.getItem(User)){
            let daqt=JSON.parse(localStorage.getItem(User));
            if(daqt.config) { momoConf.guDAQConf.config =daqt.config; };
            if(daqt.calculatorTemplatePVE) { momoConf.guDAQConf.calculatorTemplatePVE =daqt.calculatorTemplatePVE; };
        };
        if(JSON.stringify(momoConf)!=localStorage.getItem('momoConf_'+User)){
            localStorage.setItem('momoConf_'+User, JSON.stringify(momoConf));
            if(localStorage.momo_Cloud){ upload('Gupdate'); }; return;
        }; return;
    }
    else if(way=="Gupdate"){
        encs = JSON.stringify(momoConf);
    }
    else if(way=="Cardupdate"){
        let cardTemp={},daqt={};
        if(localStorage.getItem(User)){ daqt=JSON.parse(localStorage.getItem(User)); };
        if(daqt.dataIndex&&daqt.dataIndex!={}){ cardTemp.dataIndex=daqt.dataIndex; };
        if(daqt.dataBind&&daqt.dataBind!={}){ cardTemp.dataBind=daqt.dataBind; };
        encs = JSON.stringify(cardTemp);
    }
    else if(way=="Hufupdate"){
        encs = localStorage.getItem(User+'_amulet_groups');
    }
    else if(way=="Pkupdate"){
        encs = localStorage.getItem("log_"+User);
    }
    else{
        encs = localStorage.userTheme;
    };
    let before=encs.length;
    console.log(way+" Raw Data Acquired!");
    console.log("Zipping "+way+" Data....")
    encs=zip(encs);
    console.log(way+" Data Zipped! Compression rate: "+(encs.length*100/before).toFixed(2)+"%");
    if(way!="Gupdate"){
        console.log("["+uuid+"] as Key, Encrypting "+way+" Data...");
        encs=enc(encs);
        console.log(way+" Data Encrypted! Compression rate: "+(encs.length*100/before).toFixed(2)+"%");
    }
    console.log("Data Processing completed!");
    return encs;
};
function afterCloud(way,texts){
    if(way=="Guhelper"){
        console.log("Start Restoring Config Data...");
        momoConf=JSON.parse(texts);
        if(momoConf.ThemePackConf&&momoConf.ThemePackConf!={}){
            localStorage.setItem('ThemePackConf',JSON.stringify(momoConf.ThemePackConf));
            console.log("ThemePack Manager Configs Restored!");
        };
        if(momoConf.userTheme){
            localStorage.setItem('userTheme',momoConf.userTheme);
            console.log("UserTheme JSON Data Restored!");
        };

        if(momoConf.BeachConf&&momoConf.BeachConf!={}){
            localStorage.setItem('autoBeach_'+User,JSON.stringify(momoConf.BeachConf));
            console.log("Auto Beach Configs Restored!");
        };

        if(momoConf.PKConf&&momoConf.PKConf!={}){
            let PKConf=momoConf.PKConf;
            if(PKConf.maxap) { localStorage.setItem('maxap', PKConf.maxap); };
            if(PKConf.showSM){ localStorage.setItem('showSM',PKConf.showSM);};
            if(PKConf.maxrank) { localStorage.setItem('maxrank' , PKConf.maxrank); };
            if(PKConf.g_gemid) { localStorage.setItem('g_gemid' , PKConf.g_gemid); };
            if(PKConf.mainHost){ localStorage.setItem('mainHost' ,PKConf.mainHost);};
            if(PKConf.g_ismake){ localStorage.setItem('g_ismake' ,PKConf.g_ismake);};
            if(PKConf.flashtime){ localStorage.setItem('flashtime' ,PKConf.flashtime); };
            if(PKConf.showcharlv){localStorage.setItem('showcharlv',PKConf.showcharlv);};
            if(PKConf.g_ismanualmake) { localStorage.setItem('g_ismanualmake',PKConf.g_ismanualmake); };
            console.log("Auto Claw Configs Restored!");
        };

        if(momoConf.guDAQConf&&momoConf.guDAQConf!={}){
            let DAQConf=momoConf.guDAQConf,daqt=JSON.parse(localStorage.getItem(User));
            if(DAQConf.config) { daqt.config =DAQConf.config; };
            if(DAQConf.calculatorTemplatePVE) { daqt.calculatorTemplatePVE =DAQConf.calculatorTemplatePVE; };
            localStorage.setItem(User, JSON.stringify(daqt));
            if(DAQConf.over) { localStorage.setItem('over', DAQConf.over); };
            if(DAQConf.title){ localStorage.setItem('title',DAQConf.title);};
            if(DAQConf.halo_max) { localStorage.setItem('halo_max',DAQConf.halo_max); };
            if(DAQConf.cardName) { localStorage.setItem('cardName',DAQConf.cardName); };
            if(DAQConf.attribute) { localStorage.setItem('attribute', DAQConf.attribute); };
            if(DAQConf.keepcheck) { localStorage.setItem('keepcheck', DAQConf.keepcheck); };
            if(DAQConf.beachcheck){ localStorage.setItem('beachcheck',DAQConf.beachcheck);};
            if(DAQConf.dataReward){ localStorage.setItem('dataReward',DAQConf.dataReward);};
            if(DAQConf.beach_BG) { localStorage.setItem(User+'_beach_BG', DAQConf.beach_BG); };
            if(DAQConf.forgeAuto){ localStorage.setItem(User+'_forgeAuto',DAQConf.forgeAuto);};
            if(DAQConf.indexRally ) { localStorage.setItem(User+'_indexRally' , DAQConf.indexRally ); };
            if(DAQConf.equipment_BG){ localStorage.setItem(User+'_equipment_BG',DAQConf.equipment_BG);};
            if(DAQConf.keepPkRecord){ localStorage.setItem(User+'_keepPkRecord',DAQConf.keepPkRecord);};
            if(DAQConf.stoneOperation) { localStorage.setItem(User+'_stoneOperation' ,DAQConf.stoneOperation); };
            if(DAQConf.autoTaskEnabled){ localStorage.setItem(User+'_autoTaskEnabled',DAQConf.autoTaskEnabled);};
            if(DAQConf.beach_forceExpand) { localStorage.setItem(User+'_beach_forceExpand',DAQConf.beach_forceExpand); };
            if(DAQConf.equipment_StoreExpand) { localStorage.setItem(User+'_equipment_StoreExpand', DAQConf.equipment_StoreExpand); };
            if(DAQConf.stone_ProgressEquipTip){ localStorage.setItem(User+'_stone_ProgressEquipTip',DAQConf.stone_ProgressEquipTip);};
            if(DAQConf.stone_ProgressCardTip) { localStorage.setItem(User+'_stone_ProgressCardTip', DAQConf.stone_ProgressCardTip); };
            if(DAQConf.stone_ProgressHaloTip) { localStorage.setItem(User+'_stone_ProgressHaloTip', DAQConf.stone_ProgressHaloTip); };
            if(DAQConf.ignoreWishpoolExpiration ) { localStorage.setItem(User+'_ignoreWishpoolExpiration' , DAQConf.ignoreWishpoolExpiration) ; };
            if(DAQConf.beach_ignoreStoreMysEquip) { localStorage.setItem(User+'_beach_ignoreStoreMysEquip', DAQConf.beach_ignoreStoreMysEquip); };
            if(DAQConf.autoTaskCheckStoneProgress){ localStorage.setItem(User+'_autoTaskCheckStoneProgress',DAQConf.autoTaskCheckStoneProgress);};
            console.log("GuguTown DAQ Configs Restored!");
        };
        console.log("All Config Data Restored!");
        finalInit();
    }
    else if(way=="Cardbind"){
        let cardTemp=JSON.parse(texts),daqt={};
        if(localStorage.getItem(User)){ daqt=JSON.parse(localStorage.getItem(User)); };
        if(cardTemp.dataIndex&&cardTemp.dataIndex!={}){ daqt.dataIndex=cardTemp.dataIndex; console.log("Feats Data Restored!"); };
        if(cardTemp.dataBind&&cardTemp.dataBind!={}){ daqt.dataBind=cardTemp.dataBind; console.log("Cardbind Data Restored!"); };
        localStorage.setItem(User,JSON.stringify(cardTemp));
    }
    else if(way=="Hufugroup"){
        if(texts&&texts!={}){ localStorage.setItem(User+'_amulet_groups',texts); console.log("Amulet_Groups Data Restored!"); };
    }
    else if(way=="Pkdate"){
        if(texts&&texts!={}){ localStorage.setItem('log_'+User,texts); console.log("Battle History Data Restored!"); };
    }
    else{
        let encs=texts;
        if(encs==localStorage.userTheme){
            console.log("Test Passed!");
        }
        else{
            console.log("Test Completed,but the Current-Data is different from the Raw-Data!");
            console.log(encs);
            console.log(localStorage.userTheme);
        };
    };
};

/* Zip&Unzip&Enc&Dec&Others */
function zip(str) {
    str=LZMA.compress(str,2);
    str=byte2str(str);
    return str;
};
function unzip(str) {
    str=str2byte(str);
    str=LZMA.decompress(str);
    return str;
};
function enc(message){
    let encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(uuid), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encrypt;
};
function dec(encrypt){
    let decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(uuid), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
    //转成数字类型
    return decrypt;
};
function byte2str(byte) {
    let hex_str = "",
        i,
        len,
        tmp_hex;

    len = byte.length;

    for (i = 0; i < len; ++i) {
        if (byte[i] < 0) {
            byte[i] = byte[i] + 256;
        }
        tmp_hex = byte[i].toString(16);

        /// Add leading zero.
        if (tmp_hex.length === 1) {
            tmp_hex = "0" + tmp_hex;
        }

        hex_str += tmp_hex;
    }

    return hex_str.trim();
};
function str2byte(str) {
    let count = 0, hex_arr, hex_data = [], hex_len, i;
    if (str.trim() === "") { return []; };
    if (/[^0-9a-fA-F\s]/.test(str)) { return false; };
    hex_arr = mySplit(str,2);
    hex_len = hex_arr.length;
    for (i = 0; i < hex_len; ++i) {
        if (hex_arr[i].trim() === "") { continue; };
        hex_data[count++] = parseInt(hex_arr[i], 16);
    }
    return hex_data;
};
function mySplit(str,leng){
    let arr = [];
    let index = 0;
    while(index<str.length){
        arr.push(str.slice(index,index +=leng));
    }
    return arr;
};
function uuidfunc(){
    uuid=new Date().getTime().toString(36);
    let tst=/^[a-z0-9]*$/g,temp=prompt(lang.puuid, uuid);
    if(temp){ if(tst.test(temp)&&temp.length==8){ uuid=temp; }; };
    upload('Cardupdate');
    upload('Hufupdate');
};
function testfunc(){
    upload("test")
};


/**
 * Events.
 */
$("a[href='fyg_index.php']").attr("href","fyg_index.php#");
$(document).on('blur', "#btnAutoTask", function(){
    playAnimation(['joy_long', 'hold','joy_long_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('change', ".themepack-uuid", function(e){
    let temp=e.target.value,tst=/^[a-z0-9]*$/g;
    if(tst.test(temp)&&temp.length==8){
        uuid=temp;
        download('Cardbind');
        download('Hufugroup');
        e.target.value="Done!"
    }
    else{e.target.value="Error!"; };
})
.on('click',"button", function(){
    ccard=false;
})
.on('click',"[onclick*='xxcard(']", function(){
    ccard=false;
})
.on('click',"#bigcardimg", function(){
    if(!tempvo)tempvo=cardvo;
    if(custom.voiceO==true){$("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"#equip_one_key_link" , function(){
    ccard=false; playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"#binding_popup_link" , function(){
    ccard=false; playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'change'+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='gx_sxds']", function(){
    playAnimation(['000000_eat_normal']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'power'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='gx_gt(']" , function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='giftop']", function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='xyck(']", function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='gox(']" , function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
    collecheck=0;battlecheck=1;
})
.on('click',"button[onclick*='xyre(']", function(){
    playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='puton(']",function(){
    playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='halosave(']", function(){
    playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='b_forge(']", function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='b_forca(']", function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='b_forcbs(']", function(){
    playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='gx_cxjd(']", function(){
    playAnimation(['standBy']); ccard=true;
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'reset'+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[class*='g_colpz0'][onclick*='puto(']", function(){
    playAnimation(['000000_eat_normal']);
})
.on('click',"button[style*='float: right;']", function(e){
    if(e.target.innerText=="装备")playAnimation(['000000_eat_normal']);
})
.on('click',"button[onclick*='updstat(']", function(){
    ccard=true;playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'change'+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='eqlip(1),eqbp(1)']", function(){
    loading = false;ccard=true;playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='eqlip(2),eqbp(2)']", function(){
    loading = false;ccard=true;
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+Math.ceil(Math.random()*4-1)+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='eqlip(3),eqbp(3)']", function(){
    loading = false;ccard=true;playAnimation(['standBy']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"a[onclick*='eqlip(4),eqbp(4)']", function(){
    loading = false;ccard=true;playAnimation(['joy_short','joy_short_return']);
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='expcard(']", function(){
    let spjoy=$("option[value*=joyResult]")[0].value.split(',');spjoy=spjoy[0];playAnimation([spjoy]);ccard=true;
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'exp'+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='cmaxup(']" , function(){
    let spjoy=$("option[value*=joyResult]")[0].value.split(',');spjoy=spjoy[0];playAnimation([spjoy]);ccard=true;
    if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'levelup'+tempvo[1]);$("#themeSoundPlay")[0].play(); };
})
.on('click',"button[onclick*='jgjg(']", function(){
    battlecheck=0; if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'battle'+cardvo[1]);$("#themeSoundPlay")[0].play(); };
    sucheck=$(".alert.alert-danger.with-icon.fyg_tc").length;facheck=$(".alert.alert-info.with-icon.fyg_tc").length;playAnimation(['attack','idle']);
})
.on('click',"button[onclick*='upcard(']", function(){
    ccard=true; yourcard=tempca; custom.yourcard=yourcard;update();
    cardvo=nowTheme[yourcard+"voice"]; kanbanimg=nowTheme[yourcard][2];
    if(nowTheme.spine==true){ spineJson=nowTheme[yourcard+"spine"]; }else{ spineJson={"name":"hi","type":"1","hasRarity6":true,"wi":-330,"hi":-42,"re":0.8}; };
    $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*4-1)+tempvo[1]);
    loading = false; spineload(spineJson.name, pagetype); playAnimation(['standBy']);
    if(custom.showKanban==true&&nowTheme.spine!=true){ $(".tpkanban").attr('src', kanbanimg); };
    if(custom.voiceO==true){ $("#themeSoundPlay")[0].play(); };
})
.on('click',"#middlecardimg", function(){
    if($('#eqli2.active').length==1&&tempvo!=cardvo){ xxcard(nowTheme[yourcard][0]);}
    else{ if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+Math.ceil(Math.random()*4-1)+cardvo[1]);$("#themeSoundPlay")[0].play();};};
})
.on('click',"#setAnimation", function(){
    animationState = skeleton.state;forceNoLoop = false;animationQueue = $("#animationList")[0].value.split(',');
    if (animationQueue[0] == 'multi_standBy') { animationQueue.push('multi_idle_standBy');}
    else if (['multi_idle_standBy', 'multi_idle_noWeapon', 'idle', 'walk', 'run', 'run_gamestart'].indexOf(animationQueue[0]) == -1) { animationQueue.push('idle'); };
    console.log(animationQueue); let nextAnim = animationQueue.shift();
    if (!/^\d{6}/.test(nextAnim)) nextAnim = getClass(currentClassAnimData.type) + '_' + nextAnim;
    console.log(nextAnim); animationState.setAnimation(0, nextAnim, !animationQueue.length && !forceNoLoop);
})
.on('click',".themelang", function(){
    let ThemeLang = prompt('输入 zh 使用【简体中文】；\n輸入 zht 使用【繁體中文】；\nja を入力 表示言語【日本語】；\nInput en To show in 【English】.', "zh");
    if (ThemeLang) {
        if(ThemeLang=="zh"){ custom.language="zh"; update();location.reload();}
        else if(ThemeLang=="zht"){ custom.language="zht"; update();location.reload();}
        else if(ThemeLang=="ja"){ custom.language="ja"; update();location.reload();}
        else if(ThemeLang=="en"){ custom.language="en"; update();location.reload();}
        else{ custom.language="zh"; update();location.reload();};
    };
})
.on('click',".themepack-ls", function(){
    if (confirm(lang.themeSW)) {
        let ThemePack = prompt(lang.themeSA, "1");
        if (ThemePack) {
            if(ThemePack=="0"){ console.log('off');custom.ThemePack="off"; update();location.reload();}
            else if(ThemePack=="1"){ console.log('test');custom.ThemePack="test"; update();location.reload(); }
            else if(ThemePack=="2"){
                if (localStorage.userTheme||momoConf.userTheme){
                    if(localStorage.userTheme&&!momoConf.userTheme){momoConf.userTheme=JSON.parse(localStorage.userTheme);userTheme=momoConf.userTheme;}
                    else{userTheme=momoConf.userTheme;};
                    if(userTheme.w4!=null){
                        console.log('user');custom.ThemePack="user";update();location.reload();nowTheme=userTheme;
                        sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));
                        if(userTheme.舞==null){ alert(lang.initUFG) };
                        if(userTheme.voice==null){ alert(lang.initUVO) };
                    }
                    else{ alert(lang.initUOT) };
                }
                else{ alert(lang.initUNU) };
            }
            else{ console.log('classic');custom.ThemePack="classic"; localStorage.setItem('upconf',false);;location.reload();};
        };
    }
    else{
        if(confirm(lang.themeDF)){
            console.log('classic');custom.ThemePack="classic"; update();location.reload();
        };
    };
})
.on('click',".icons-size", function(){
    let IconSize = prompt(lang.iconUA, "50px");
    if (IconSize) { custom.iconSize = IconSize; update();location.reload();};
})
.on('click',".kanban-size", function(){
    let KanbanSize = prompt(lang.kanbanUA, "100");
    if (KanbanSize) { custom.kanbansize = KanbanSize; update();location.reload();};
})
.on('click',".themepack-usr", function(){
    let userTheme = prompt(lang.menuUA+'\nhttps://kf.miaola.work/read.php?tid=809121&sf=141&page=21',`${localStorage.userTheme}`);
    if (userTheme){ momoConf.userTheme=JSON.parse(userTheme); localStorage.setItem('userTheme',userTheme); update(); };
})
.on('click',".iconpack-switch", function(e){
    custom.useOldNames = e.target.checked;
    update(); location.reload();
})
.on('click',".themepack-equip", function(e){
    custom.useThemeName = e.target.checked;
    update(); location.reload();
})
.on('click',".themepack-showCG", function(e){
    custom.showCG = e.target.checked;
    update(); location.reload();
})
.on('click',".themepack-showKB", function(e){
    custom.showKanban = e.target.checked;
    update(); location.reload();
})
.on('click',".themepack-voiceO", function(e){
    custom.voiceO = e.target.checked;
    update();
    custom.voiceO?$("#themeSoundPlay").attr('src',nowTheme.voice[0]):$("#themeSoundPlay").attr('src',nowTheme.voice[1]);
    $("#themeSoundPlay")[0].play();
})
.on('click',".themepack-cuuid", function(){
    uuidfunc();
})
.on('click',".detaillogitem", function() {
    themeIcon(); oldEqName();
    if (custom.showCG == true) { themeFgimg(); };
})
.ajaxSuccess(function(){
    if(window.location.href.indexOf('fyg_index.php') != -1||window.location.href.indexOf('fyg_index.php#') == -1){
        themeIcon();++soundonce;
        if(custom.showCG == true){ themeFgimg();}else if(custom.showKanban==true||custom.voiceO==true){ equipKBVO() };
    };
});



/**
 * init.
 */
if(!localStorage.getItem('Cloud_'+User)){
    login(momoUser,"lgn");
}
else{
    localStorage.setItem('momo_Cloud', localStorage.getItem('Cloud_'+User));
};
if(window.location.href.indexOf('fyg_index.php') > -1&&window.location.href.indexOf('#') == -1){
    console.log("first");
    nowTheme=originTheme;
    custom={ "useOldNames":false, "language":"zh" };
    download('Guhelper');
}
else{ finalInit(); };
