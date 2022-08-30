// ==UserScript==
// @name        Gugu Town IconPack
// @namespace   https://github.com/HazukiKaguya/GuguTown_IconPack
// @homepage    https://github.com/HazukiKaguya
// @version     2.0.6
// @description GuguTown Theme Park Manager.
// @icon        https://sticker.inari.site/favicon.ico
// @author      Hazuki Kaguya
// @copyright   2022- Hazukikaguya
// @match       https://www.guguzhen.com/*
// @exclude     https://www.guguzhen.com/fyg_gift.php
// @exclude     https://www.guguzhen.com/fyg_shop.php
// @exclude     https://www.guguzhen.com/fyg_wish.php
// @exclude     https://www.guguzhen.com/fyg_index.php
// @run-at      document-end
// @license     MIT License
// @updateURL   https://github.com/HazukiKaguya/GuguTown_IconPack/raw/main/GuguTown_IconPack.user.js
// ==/UserScript==
'use strict';
/**
 * default settings
 */
const defaultConf={"useOldNames":false,"ThemePack":"classic","iconSize":"50px","useThemeName":false,"showCG":false,"yourcard":"无","voiceO":false},ygcheck=["魔灯之灵（野怪","六眼飞鱼（野怪","铁皮木人（野怪","迅捷魔蛛（野怪","食铁兽（野怪","晶刺豪猪（野怪"];
let useOldNamesCheck ='',useThemeNameCheck ='',showCGCheck='',voiceOCheck='',custom = defaultConf,userTheme={},yourcard="无",timeout = null,showbig=false,nowTheme,cardvo,tempvo=false,tempca,ccard=false,ext,old,purl,dessert,dessertlevel,dessertname,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,w1,w2,w3,c1,c2,c3,c4,c5,c6,c7,h1,h2,h3,soundonce=0,sucheck=0,facheck=0,battlecheck=0,collecheck=0;
if (localStorage.ThemePackConf) { custom = JSON.parse(localStorage.ThemePackConf) }
else {localStorage.setItem('ThemePackConf', JSON.stringify(defaultConf)); }
if (custom.useOldNames == true) { useOldNamesCheck = 'checked'; }
if (custom.useThemeName == true) { useThemeNameCheck = 'checked'; }
if (custom.showCG == true) { showCGCheck = 'checked'; }
if (custom.voiceO == true) { voiceOCheck = 'checked'; }
const originTheme={
    "url":"ys/icon/",
    "old":"1",
    "ext":".gif",
    "background":"",
    "backsize":"background-size:80% 80%;",
    "wqbacksize":"background-size:100% 100%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["z903","z902","z901"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
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
},classicTheme={
    "url":"https://sticker.inari.site/guguicons/old/",
    "old":"",
    "ext":".gif",
    "background":"",
    "backsize":"background-size:80% 80%;",
    "wqbacksize":"background-size:80% 80%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["apple","grape","cherry"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
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
},testTheme={
    "url":"https://p.inari.site/guguicons/test/eq/",
    "old":"0",
    "ext":".gif",
    "background":"normal",
    "backsize":"background-size:100% 100%;",
    "wqbacksize":"background-size:100% 100%;",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["pie","donuts","cake"],
    "dessertlevel":["家常的","美味的","诱人的"],
    "dessertname":["苹果派","甜甜圈","樱桃蛋糕"],
    "魔灯之灵（野怪":"https://p.inari.site/guguicons/test/mob/deng.png",
    "六眼飞鱼（野怪":"https://p.inari.site/guguicons/test/mob/fish.png",
    "铁皮木人（野怪":"https://p.inari.site/guguicons/test/mob/mu.png",
    "迅捷魔蛛（野怪":"https://p.inari.site/guguicons/test/mob/zhu.png",
    "食铁兽（野怪"  :"https://p.inari.site/guguicons/test/mob/shou.png",
    "晶刺豪猪（野怪":"https://p.inari.site/guguicons/test/mob/nzhu.png",
    "舞":["3000","https://p.inari.site/guguicons/test/cg/wuu/1.png","https://p.inari.site/guguicons/test/cg/wuu/2.png","https://p.inari.site/guguicons/test/cg/wuu/3.png","https://p.inari.site/guguicons/test/cg/wuu/4.png","https://p.inari.site/guguicons/test/cg/wuu/5.png","https://p.inari.site/guguicons/test/cg/wuu/6.png","https://p.inari.site/guguicons/test/cg/wuu/7.png"],
    "默":["3001","https://p.inari.site/guguicons/test/cg/mo/1.png","https://p.inari.site/guguicons/test/cg/mo/2.png","https://p.inari.site/guguicons/test/cg/mo/3.png","https://p.inari.site/guguicons/test/cg/mo/4.png","https://p.inari.site/guguicons/test/cg/mo/5.png","https://p.inari.site/guguicons/test/cg/mo/6.png","https://p.inari.site/guguicons/test/cg/mo/7.png"],
    "琳":["3002","https://p.inari.site/guguicons/test/cg/lin/1.png","https://p.inari.site/guguicons/test/cg/lin/2.png","https://p.inari.site/guguicons/test/cg/lin/3.png","https://p.inari.site/guguicons/test/cg/lin/4.png","https://p.inari.site/guguicons/test/cg/lin/5.png","https://p.inari.site/guguicons/test/cg/lin/6.png","https://p.inari.site/guguicons/test/cg/lin/7.png"],
    "艾":["3003","https://p.inari.site/guguicons/test/cg/ai/1.png","https://p.inari.site/guguicons/test/cg/ai/2.png","https://p.inari.site/guguicons/test/cg/ai/3.png","https://p.inari.site/guguicons/test/cg/ai/4.png","https://p.inari.site/guguicons/test/cg/ai/5.png","https://p.inari.site/guguicons/test/cg/ai/6.png","https://p.inari.site/guguicons/test/cg/ai/7.png"],
    "梦":["3004","https://p.inari.site/guguicons/test/cg/meng/1.png","https://p.inari.site/guguicons/test/cg/meng/2.png","https://p.inari.site/guguicons/test/cg/meng/3.png","https://p.inari.site/guguicons/test/cg/meng/4.png","https://p.inari.site/guguicons/test/cg/meng/5.png","https://p.inari.site/guguicons/test/cg/meng/6.png","https://p.inari.site/guguicons/test/cg/meng/7.png"],
    "薇":["3005","https://p.inari.site/guguicons/test/cg/wei/1.png","https://p.inari.site/guguicons/test/cg/wei/2.png","https://p.inari.site/guguicons/test/cg/wei/3.png","https://p.inari.site/guguicons/test/cg/wei/4.png","https://p.inari.site/guguicons/test/cg/wei/5.png","https://p.inari.site/guguicons/test/cg/wei/6.png","https://p.inari.site/guguicons/test/cg/wei/7.png"],
    "伊":["3006","https://p.inari.site/guguicons/test/cg/yi/1.png","https://p.inari.site/guguicons/test/cg/yi/2.png","https://p.inari.site/guguicons/test/cg/yi/3.png","https://p.inari.site/guguicons/test/cg/yi/4.png","https://p.inari.site/guguicons/test/cg/yi/5.png","https://p.inari.site/guguicons/test/cg/yi/6.png","https://p.inari.site/guguicons/test/cg/yi/7.png"],
    "冥":["3007","https://p.inari.site/guguicons/test/cg/ming/1.png","https://p.inari.site/guguicons/test/cg/ming/2.png","https://p.inari.site/guguicons/test/cg/ming/3.png","https://p.inari.site/guguicons/test/cg/ming/4.png","https://p.inari.site/guguicons/test/cg/ming/5.png","https://p.inari.site/guguicons/test/cg/ming/6.png","https://p.inari.site/guguicons/test/cg/ming/7.png"],
    "命":["3008","https://p.inari.site/guguicons/test/cg/life/1.png","https://p.inari.site/guguicons/test/cg/life/2.png","https://p.inari.site/guguicons/test/cg/life/3.png","https://p.inari.site/guguicons/test/cg/life/4.png","https://p.inari.site/guguicons/test/cg/life/5.png","https://p.inari.site/guguicons/test/cg/life/6.png","https://p.inari.site/guguicons/test/cg/life/7.png"],
    "希":["3009","https://p.inari.site/guguicons/test/cg/xii/1.png","https://p.inari.site/guguicons/test/cg/xii/2.png","https://p.inari.site/guguicons/test/cg/xii/3.png","https://p.inari.site/guguicons/test/cg/xii/4.png","https://p.inari.site/guguicons/test/cg/xii/5.png","https://p.inari.site/guguicons/test/cg/xii/6.png","https://p.inari.site/guguicons/test/cg/xii/7.png"],
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
    "ho2":["z2402","z7","占星师的发饰","桜花の月夜簪","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E5%8F%91%E9%A5%B0/"],
    "h3":["z2403","z7","萌爪耳钉","精灵王护石","%E8%90%8C%E7%88%AA%E8%80%B3%E9%92%89/"],
    "ho3":["z2403","z7","天使缎带","细冰姬的蝴蝶结","%E5%A4%A9%E4%BD%BF%E7%BC%8E%E5%B8%A6/"]},iconsize=custom.iconSize;

/**
 * main functions
 */
if(custom.ThemePack=="classic"){ nowTheme=classicTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="test"||custom.ThemePack=="pcr"){ nowTheme=testTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="off"){ nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
else if(custom.ThemePack=="user"){
    if (localStorage.userTheme){userTheme = JSON.parse(localStorage.userTheme);
        if(userTheme.h3!=null){nowTheme=userTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));if(userTheme.舞==null&&custom.showCG==true){alert('此自定义主题包立绘功能不可用！请更新主题包或关闭立绘功能！');custom.showCG=false;};
                               if(userTheme.voice==null&&custom.voiceO==true){alert('此自定义主题包语音功能不可用！请更新主题包或关闭语音功能！')};custom.voiceO=false;}
        else{ alert("自定义主题包json数据彻底过期，请及时更新！主题包未启用！");custom.ThemePack="off"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}}
    else{ alert("自定义主题包json数据不存在，主题包未启用！");custom.ThemePack="off"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));nowTheme=originTheme;sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));}
}
let panel = document.getElementsByClassName('panel panel-primary')[1];
let iconconfpanel = document.createElement('span');
iconconfpanel.innerHTML =
    `&nbsp;<input type="button" class="themepack-ls" value="选择主题包">&nbsp;<input type="button" class="themepack-usr" value="写入自定义主题">&nbsp;<input type="button" class="icons-size" value="设置图标大小">&nbsp;
                    <input type="checkbox" class="iconpack-switch" ${useOldNamesCheck}>使用旧的装备名称&nbsp;
                    <input type="checkbox" class="themepack-switch" ${useThemeNameCheck}>使用主题装备名称&nbsp;
                    <input type="checkbox" class="themepack-showCG" ${showCGCheck}>启用角色立绘&nbsp;
                    <input type="checkbox" class="themepack-voiceO" ${voiceOCheck}>启用角色语音&nbsp;
                    <audio id="themeSoundPlay" controls src="themeSoundPlay.mp3" type="audio/mp3" style="display:none"></audio>`;
panel.insertBefore(iconconfpanel, panel.children[0]);
$(".themepack-ls").click(function(){
    if (confirm("按【确定】选择主题包，按【取消】恢复默认主题包。")) {
        let ThemePack = prompt('输入1使用【测试用主题包】；输入2使用【自定义主题包】；\n输入0不启用主题更改；输入其他使用【旧版风格主题包】；\n【测试用主题包】中的主题装备名称版权归Cygames所有。', "1");
        if (ThemePack) {
            if(ThemePack=="1"){ console.log('test');custom.ThemePack="test"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();}
            else if(ThemePack=="2"){ if (localStorage.userTheme){userTheme = JSON.parse(localStorage.userTheme);if(userTheme.h3!=null){
                    console.log('user');custom.ThemePack="user";localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();nowTheme=userTheme;
                    sessionStorage.setItem('ThemePack', JSON.stringify(nowTheme));if(userTheme.舞==null){alert('此自定义主题包立绘功能不可用！')};if(userTheme.voice==null){alert('此自定义主题包语音功能不可用！')};}
                 else{ alert("自定义主题包json数据彻底过期，请及时更新！主题未变更！")}}else{ alert("自定义主题包json数据不存在，主题未变更！")}}
            else if(ThemePack=="0"){ console.log('off');custom.ThemePack="off"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();}
            else{ console.log('classic');custom.ThemePack="classic"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();}
        }
    }else{ if(confirm("按【确定】恢复默认主题包，按【取消】则不操作。")){ console.log('classic');custom.ThemePack="classic"; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();}}});
$(".icons-size").click(function(){
    let IconSize = prompt('请输入图标大小,格式应为32-128间的数字+px\n示例：50px', "50px");
    if (IconSize) { custom.iconSize = IconSize; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();}
});
$(".themepack-usr").click(function(){
    let userTheme = prompt('请输入自定义主题包的json数据,访问\nhttps://kf.miaola.work/read.php?tid=809121&sf=141&page=21\n以查看完整的json格式。',`${localStorage.userTheme}`);
    if (userTheme) { console.log(userTheme); localStorage.setItem('userTheme', userTheme);}
});
$(".iconpack-switch").click(function(e){ custom.useOldNames = e.target.checked; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();});
$(".themepack-switch").click(function(e){ custom.useThemeName = e.target.checked; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();});
$(".themepack-showCG").click(function(e){ custom.showCG = e.target.checked; localStorage.setItem('ThemePackConf', JSON.stringify(custom));location.reload();});
$(".themepack-voiceO").click(function(e){
    custom.voiceO = e.target.checked; localStorage.setItem('ThemePackConf', JSON.stringify(custom));
    if(custom.voiceO==true){$("#themeSoundPlay").attr('src',nowTheme.voice[0]);}else{$("#themeSoundPlay").attr('src',nowTheme.voice[1]);}
    $("#themeSoundPlay")[0].play();
});

if (custom.yourcard != "无") { yourcard = custom.yourcard;cardvo=nowTheme[yourcard+"voice"]; }
ext=nowTheme.ext;purl=nowTheme.url;dessert=nowTheme.dessert;dessertlevel=nowTheme.dessertlevel;dessertname=nowTheme.dessertname;old=nowTheme.old;
a1=nowTheme.a1;a2=nowTheme.a2;a3=nowTheme.a3;a4=nowTheme.a4;a5=nowTheme.a5;a6=nowTheme.a6;a7=nowTheme.a7;a8=nowTheme.a8;a9=nowTheme.a9;a10=nowTheme.a10;w1=nowTheme.w1;w2=nowTheme.w2;w3=nowTheme.w3;
c1=nowTheme.c1;c2=nowTheme.c2;c3=nowTheme.c3;c4=nowTheme.c4;c5=nowTheme.c5;c6=nowTheme.c6;c7=nowTheme.c7;h1=nowTheme.h1;h2=nowTheme.h2;h3=nowTheme.h3;
if(custom.useOldNames==true){ a8=nowTheme.ao8;a10=nowTheme.ao10;w1=nowTheme.wo1;w3=nowTheme.wo3;c6=nowTheme.co6;h1=nowTheme.ho1;h2=nowTheme.ho2;h3=nowTheme.ho3; }
function repfunc(){
    if(ext!=".gif"){ $("button[style*='ys/icon/z']").attr("style",function(n,v){ n= v.replace(/.gif/g, ext);return n;});}
    $("button[style*='z2101']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, purl+a1[4]);n=n.replace(/ys\/icon\/z2101/g, purl+a1[4]+old);return n;});
    $("button[style*='z2102']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, purl+a2[4]);n=n.replace(/ys\/icon\/z2102/g, purl+a2[4]+old);return n;});
    $("button[style*='z2103']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, purl+a3[4]);n=n.replace(/ys\/icon\/z2103/g, purl+a3[4]+old);return n;});
    $("button[style*='z2104']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, purl+a4[4]);n=n.replace(/ys\/icon\/z2104/g, purl+a4[4]+old);return n;});
    $("button[style*='z2105']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, purl+a5[4]);n=n.replace(/ys\/icon\/z2105/g, purl+a5[4]+old);return n;});
    $("button[style*='z2106']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, purl+a6[4]);n=n.replace(/ys\/icon\/z2106/g, purl+a6[4]+old);return n;});
    $("button[style*='z2107']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, purl+a7[4]);n=n.replace(/ys\/icon\/z2107/g, purl+a7[4]+old);return n;});
    $("button[style*='z2108']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, purl+a8[4]);n=n.replace(/ys\/icon\/z2108/g, purl+a8[4]+old);return n;});
    $("button[style*='z2109']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, purl+a9[4]);n=n.replace(/ys\/icon\/z2109/g, purl+a9[4]+old);return n;});
    $("button[style*='z2110']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g, purl+a10[4]);n=n.replace(/ys\/icon\/z2110/g, purl+a10[4]+old);return n;});
    $("button[style*='z2201']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);n=n.replace(/ys\/icon\/z2201/g, purl+w1[4]+old);return n;});
    $("button[style*='z2202']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, purl+w2[4]);n=n.replace(/ys\/icon\/z2202/g, purl+w2[4]+old);return n;});
    $("button[style*='z2203']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);n=n.replace(/ys\/icon\/z2203/g, purl+w3[4]+old);return n;});
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
    $(".with-padding").html(function(n,v){n= v.replace(/苹果护身符/g, dessertname[0]); n= n.replace(/葡萄护身符/g, dessertname[1]); n= n.replace(/樱桃护身符/g, dessertname[2]); return n;});
    $("button[data-original-title*='樱桃']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z901/g, purl+dessert[2]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/樱桃护身符/g, dessertname[2]);return n;});
    $("button[data-original-title*='葡萄']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z902/g, purl+dessert[1]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/葡萄护身符/g, dessertname[1]);return n;});
    $("button[data-original-title*='苹果']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z903/g, purl+dessert[0]);return n;}).attr("data-original-title",function(n,v){ n= v.replace(/苹果护身符/g, dessertname[0]);return n;});
    $("button[data-original-title*='稀有']").attr("data-original-title",function(n,v){ n= v.replace(/稀有/g, dessertlevel[0]);return n;});
    $("button[data-original-title*='史诗']").attr("data-original-title",function(n,v){ n= v.replace(/史诗/g, dessertlevel[1]);return n;});
    $("button[data-original-title*='传奇']").attr("data-original-title",function(n,v){ n= v.replace(/传奇/g, dessertlevel[2]);return n;});
    $(".fyg_tc>img[src*='z2101_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, purl+a1[4]);return n;});
    $(".fyg_tc>img[src*='z2102_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, purl+a2[4]);return n;});
    $(".fyg_tc>img[src*='z2103_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, purl+a3[4]);return n;});
    $(".fyg_tc>img[src*='z2104_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, purl+a4[4]);return n;});
    $(".fyg_tc>img[src*='z2105_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, purl+a5[4]);return n;});
    $(".fyg_tc>img[src*='z2106_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, purl+a6[4]);return n;});
    $(".fyg_tc>img[src*='z2107_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, purl+a7[4]);return n;});
    $(".fyg_tc>img[src*='z2108_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, purl+a8[4]);return n;});
    $(".fyg_tc>img[src*='z2109_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, purl+a9[4]);return n;});
    $(".fyg_tc>img[src*='z2110_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g, purl+a10[4]);return n;});
    $(".fyg_tc>img[src*='z2201_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);return n;});
    $(".fyg_tc>img[src*='z2202_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, purl+w2[4]);return n;});
    $(".fyg_tc>img[src*='z2203_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);return n;});
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
    };if(custom.useThemeName==true){ themenamefunc(); }
}
function flogrepfunc(){
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
    }
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
}
function themenamefunc(){
    $("button[data-original-title]").attr("data-original-title",function(n,v){
        n= v.replace(/探险者之剑/g, a1[3]);n= n.replace(/探险者短弓/g, a2[3]);n= n.replace(/探险者短杖/g, a3[3]);n= n.replace(/狂信者的荣誉之刃/g, a4[3]);n= n.replace(/反叛者的刺杀弓/g, a5[3]);n= n.replace(/幽梦匕首/g, a6[3]);
        n= n.replace(/光辉法杖/g, a7[3]);n= n.replace(/荆棘盾剑/g, a8[3]);n= n.replace(/荆棘剑盾/g, a8[3]);n= n.replace(/陨铁重剑/g, a9[3]);n= n.replace(/饮血魔剑/g, a10[3]);n= n.replace(/饮血长枪/g, a10[3]);
        n= n.replace(/探险者手环/g, w1[3]);n= n.replace(/探险者手套/g, w1[3]);n= n.replace(/命师的传承手环/g, w2[3]);n= n.replace(/秃鹫手环/g, w3[3]);n= n.replace(/秃鹫手套/g, w3[3]);
        n= n.replace(/探险者铁甲/g, c1[3]);n= n.replace(/探险者皮甲/g, c2[3]);n= n.replace(/探险者布甲/g, c3[3]);n= n.replace(/旅法师的灵光袍/g, c4[3]);n= n.replace(/战线支撑者的荆棘重甲/g, c5[3]);
        n= n.replace(/复苏战衣/g, c6[3]);n= n.replace(/复苏木甲/g, c6[3]);n= n.replace(/挑战斗篷/g, c7[3]);
        n= n.replace(/探险者耳环/g, h1[3]);n= n.replace(/探险者头巾/g, h1[3]);n= n.replace(/占星师的耳饰/g, h2[3]);n= n.replace(/占星师的发饰/g, h2[3]);n= n.replace(/萌爪耳钉/g, h3[3]);n= n.replace(/天使缎带/g, h3[3]);return n;
    });
    $(".with-padding").html(function(n,v){
        n= v.replace(/探险者之剑/g, a1[3]);n= n.replace(/探险者短弓/g, a2[3]);n= n.replace(/探险者短杖/g, a3[3]);n= n.replace(/狂信者的荣誉之刃/g, a4[3]);n= n.replace(/反叛者的刺杀弓/g, a5[3]);n= n.replace(/幽梦匕首/g, a6[3]);
        n= n.replace(/光辉法杖/g, a7[3]);n= n.replace(/荆棘盾剑/g, a8[3]);n= n.replace(/荆棘剑盾/g, a8[3]);n= n.replace(/陨铁重剑/g, a9[3]);n= n.replace(/饮血魔剑/g, a10[3]);n= n.replace(/饮血长枪/g, a10[3]);
        n= n.replace(/探险者手环/g, w1[3]);n= n.replace(/探险者手套/g, w1[3]);n= n.replace(/命师的传承手环/g, w2[3]);n= n.replace(/秃鹫手环/g, w3[3]);n= n.replace(/秃鹫手套/g, w3[3]);
        n= n.replace(/探险者铁甲/g, c1[3]);n= n.replace(/探险者皮甲/g, c2[3]);n= n.replace(/探险者布甲/g, c3[3]);n= n.replace(/旅法师的灵光袍/g, c4[3]);n= n.replace(/战线支撑者的荆棘重甲/g, c5[3]);
        n= n.replace(/复苏战衣/g, c6[3]);n= n.replace(/复苏木甲/g, c6[3]);n= n.replace(/挑战斗篷/g, c7[3]);
        n= n.replace(/探险者耳环/g, h1[3]);n= n.replace(/探险者头巾/g, h1[3]);n= n.replace(/占星师的耳饰/g, h2[3]);n= n.replace(/占星师的发饰/g, h2[3]);n= n.replace(/萌爪耳钉/g, h3[3]);n= n.replace(/天使缎带/g, h3[3]);return n;
    });
};
function tempvofunc(){
    tempvo=false;
    if($(".text-info.fyg_f24").length==2){
        let cardname = document.getElementsByClassName('text-info fyg_f24')[1].innerText;tempca=cardname;$("#bigcardimg").attr('src',nowTheme[cardname][3]);tempvo=nowTheme[cardname+"voice"];
        if(ccard!=true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*3)+tempvo[1]);$("#themeSoundPlay")[0].play();}
    }
}
function cardimgfunc(){
    let imgpanel,cardname,cardnamec;tempvo=false;
    if($(".text-info.fyg_f24.fyg_lh60").length==1){
        imgpanel = document.getElementsByClassName('text-info fyg_f24 fyg_lh60')[0];cardname=imgpanel.children[0].innerText;
        if(cardname.length==1&&imgpanel.children.length==2){
            if(cardname!=""){
                yourcard=cardname;custom.yourcard=yourcard;localStorage.setItem('ThemePackConf', JSON.stringify(custom));
                if(nowTheme[cardname][2]!="https://sticker.inari.site/null.gif"){
                    $(`<p></p><img id="middlecardimg" src="${nowTheme[cardname][2]}" onclick="xxcard(${nowTheme[cardname][0]})" style="cursor: pointer;"><p></p>`).insertAfter(imgpanel.children[1]);
                }
            }
            else{ yourcard="无";custom.yourcard=yourcard;localStorage.setItem('ThemePackConf', JSON.stringify(custom));}
        }
        if(cardname==""){
            if($("#bigcardimg").length==0){ $(`<p></p><img id="bigcardimg" src="https://sticker.inari.site/null.gif">`).insertBefore("#backpacks"); }
            if($("#eqli2.active").length==1){ $("#bigcardimg").attr('src',"https://sticker.inari.site/null.gif"); }
        }
        else{
            if($("#bigcardimg").length==0){ $(`<p></p><img id="bigcardimg" src="${nowTheme[cardname][3]}">`).insertBefore("#backpacks"); }
            else {$("#bigcardimg").attr('src',nowTheme[cardname][3]);}
        }
    }
    if($(".text-info.fyg_f24").length==2){
        cardname = document.getElementsByClassName('text-info fyg_f24')[1].innerText;tempca=cardname;$("#bigcardimg").attr('src',nowTheme[cardname][3]);tempvo=nowTheme[cardname+"voice"];
        if(custom.voiceO==true&&ccard!=true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*3)+tempvo[1]);$("#themeSoundPlay")[0].play();}
    }
    if($(".col-sm-2.fyg_lh60").length>0){
        for(let i=0;i<$(".col-sm-2.fyg_lh60").length;i++){
            imgpanel = document.getElementsByClassName('col-sm-2 fyg_lh60')[i];cardname=imgpanel.children[0].innerText;
            if(cardname.length==1){
                imgpanel.style.textAlign="left";
                $(`<img id="smallcardimg" src="${nowTheme[cardname][1]}" style="vertical-align:top !important;"><span>&nbsp;&nbsp;</span>`).insertBefore(imgpanel.children[0]);
            }
        }
    }
    if($(".col-md-7.fyg_tr").length>0){
        for(let i=0;i<$(".col-md-7.fyg_tr").length;i++){
            imgpanel = document.getElementsByClassName('col-md-7 fyg_tr')[i];cardname=imgpanel.children[0].innerText;
            if(cardname[cardname.length-3]!="."){
                cardname=cardname[cardname.length-2];
                imgpanel.style.backgroundImage=`url("${nowTheme[cardname][4]}")`;imgpanel.style.backgroundSize="cover";
            }
        }
    }
    if($(".col-md-7.fyg_tl").length>0){
        for(let i=0;i<$(".col-md-7.fyg_tl").length;i++){
            imgpanel = document.getElementsByClassName('col-md-7 fyg_tl')[i];cardname=imgpanel.children[0].innerText;
            let isyg=false;
            for (let j = 0; j < ygcheck.length; j++) { if (cardname.indexOf(ygcheck[j]) > -1) { imgpanel.style.backgroundImage=`url("${nowTheme[ygcheck[j]]}")`;imgpanel.style.backgroundSize="cover";isyg = true; } }
            if(cardname[cardname.length-2]!="."&&isyg==false){
                cardname=cardname[cardname.length-9];
                imgpanel.style.backgroundImage=`url("${nowTheme[cardname][5]}")`;imgpanel.style.backgroundSize="cover";
            }
        }
    }
    if($("#eqli2.active").length!=1&&showbig!=true){ $("#bigcardimg").attr('src',"https://sticker.inari.site/null.gif");};showbig=false;
}
$(document).on('click', "button", function() { ccard=false;}).on('click', "[onclick*='xxcard(']", function() { ccard=false;}).on('click', "#middlecardimg", function() { showbig=true;})
.on('click', "button[onclick*='upcard(']" , function() {yourcard=tempca;custom.yourcard=yourcard;localStorage.setItem('ThemePackConf', JSON.stringify(custom));cardvo=nowTheme[yourcard+"voice"];})
.on('click', "#btnAutoTask", function () { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'power'+cardvo[1]);$("#themeSoundPlay")[0].play();};battlecheck=-20;collecheck=-10;})
.on('click', "#equip_one_key_link" , function() {ccard=false; if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*3)+tempvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "#binding_popup_link" , function() {ccard=false; if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'change'+tempvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "a[onclick*='gx_sxds']",function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'power'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='gox(']",function(){ if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play();};collecheck=0;})
.on('click', "button[onclick*='jgjg(']",function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'battle'+cardvo[1]);$("#themeSoundPlay")[0].play();};battlecheck=0;})
.on('click', "button[onclick*='puton(']" ,function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='halosave(']",function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'change'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='b_forge(']", function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='b_forca(']", function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='b_forcbs(']",function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'colle'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='gx_cxjd(']", function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',cardvo[0]+'reset'+cardvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='expcard(']", function() { ccard=true;if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'exp'+tempvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "button[onclick*='cmaxup(']" , function() { if(custom.voiceO==true){ $("#themeSoundPlay").attr('src',tempvo[0]+'levelup'+tempvo[1]);$("#themeSoundPlay")[0].play();}})
.on('click', "#bigcardimg",function(){ if(custom.voiceO==true){ if(!tempvo)tempvo=cardvo;$("#themeSoundPlay").attr('src',tempvo[0]+Math.ceil(Math.random()*3)+tempvo[1]);$("#themeSoundPlay")[0].play();}});
$("#themeSoundPlay")[0].addEventListener('ended', function(){
    if(soundonce%2==0&&custom.voiceO==true&&battlecheck<1&&$(".alert.with-icon.fyg_tc").length>0){
        if($(".alert.with-icon.fyg_tc").length==1&&$(".alert.with-icon.fyg_tc").length!=sucheck+facheck){
            if($(".alert.alert-danger.with-icon.fyg_tc").length>0){ ++sucheck;$("#themeSoundPlay").attr('src',cardvo[0]+'win'+cardvo[1]);}
            else{ ++facheck;$("#themeSoundPlay").attr('src',cardvo[0]+'lose'+cardvo[1]);}
            ++battlecheck;$("#themeSoundPlay")[0].play();}
        else if($(".alert.with-icon.fyg_tc").length>1&&$(".alert.with-icon.fyg_tc").length!=sucheck+facheck) {
            if($(".alert.alert-danger.with-icon.fyg_tc").length!=sucheck){ ++sucheck;$("#themeSoundPlay").attr('src',cardvo[0]+'win'+cardvo[1]);}
            else{ ++facheck;$("#themeSoundPlay").attr('src',cardvo[0]+'lose'+cardvo[1]);}
            ++battlecheck;$("#themeSoundPlay")[0].play();}
    }
    if($("button[class*='fyg_colpz05bg'][style*='b4.gif']").length>0&&collecheck<1){
        let expcard=$("button[class*='fyg_colpz05bg'][style*='b4.gif']+.fyg_f18")[0].innerText,expvo=nowTheme[expcard[5]+"voice"];++collecheck;
        $("#themeSoundPlay").attr('src',expvo[0]+'levelup'+expvo[1]);$("#themeSoundPlay")[0].play(); }
});

/**
 * add CSS
 */
$('head').append(`<style>
    .btn.fyg_mp3 { width: ${iconsize} !important; height: ${iconsize} !important;line-height: ${Math.floor(parseInt(iconsize)*3.1/5)-1}px;${nowTheme.backsize}}
    .btn.fyg_colpzbg.fyg_mp3 { width: ${iconsize} !important; height: ${iconsize} !important; ${nowTheme.wqbacksize}}
    .img-rounded { width: 50px; height:50px;}
    .btn.fyg_colpzbg.fyg_tc { width: 60px !important; height: 100px !important;line-height:25px;}
    #smallcardimg {height:50px;width:50px;}
    [data-trigger=hover] {background-blend-mode: ${nowTheme.background} !important; }
    [data-toggle=tooltip]{background-blend-mode: ${nowTheme.background} !important; }
</style>`);


/**
 * init
 */
$(document).on('click', ".detaillogitem", function () { repfunc();flogrepfunc();if (custom.showCG == true) { cardimgfunc();}})
.ajaxSuccess(function(){ repfunc();++soundonce;if(custom.showCG == true){ cardimgfunc();}else if(custom.showCG == false&&custom.voiceO==true){tempvofunc();}});
