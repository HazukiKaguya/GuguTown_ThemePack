// ==UserScript==
// @name        Gugu Town IconPack
// @namespace   https://github.com/HazukiKaguya/GuguTown_IconPack
// @homepage    https://github.com/HazukiKaguya
// @version     0.4.0
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
const defaultConf={"useOldNames":false,"iconPack":"classic","iconSize":"50px"};
let useOldNamesCheck ='',custom = defaultConf,userIcons={},timeout = null,nowIcons,ext,purl,dessert,dessertlevel,dessertname,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,w1,w2,w3,c1,c2,c3,c4,c5,c6,c7,h1,h2,h3;
if (localStorage.IconPackConf) { custom = JSON.parse(localStorage.IconPackConf) }
else {localStorage.setItem('IconPackConf', JSON.stringify(defaultConf)); }
if (custom.useOldNames == true) { useOldNamesCheck = 'checked' }
const originIcons={
    "url":"ys/icon/z/",
    "ext":".gif",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["apple","grape","cherry"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
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
    "c3":["z2303","z10","探险者布甲",,"探险者布甲","clothes_"],
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
},classicIcons={
    "url":"https://sticker.inari.site/guguicons/old/",
    "ext":".gif",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["apple","grape","cherry"],
    "dessertlevel":["稀有","史诗","传奇"],
    "dessertname":["苹果护身符","葡萄护身符","樱桃护身符"],
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
    "c3":["z2303","z10","探险者布甲",,"探险者布甲","clothes_"],
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
},pcrIcons={
    "url":"https://sticker.inari.site/guguicons/pcr/",
    "ext":".gif",
    "level":["普通","幸运","稀有","史诗","传奇"],
    "dessert":["pie","donuts","cake"],
    "dessertlevel":["家常的","美味的","诱人的"],
    "dessertname":["苹果派","甜甜圈","樱桃蛋糕"],
    "a1":["z2101","z1","探险者之剑","探险者之剑","%E6%8E%A2%E9%99%A9%E8%80%85%E4%B9%8B%E5%89%91"],
    "a2":["z2102","z2","探险者短弓","探险者短弓","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E5%BC%93"],
    "a3":["z2103","z3","探险者短杖","探险者短杖","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E6%9D%96"],
    "a4":["z2104","z4","狂信者的荣誉之刃","狂信者的荣誉之刃","%E7%8B%82%E4%BF%A1%E8%80%85%E7%9A%84%E8%8D%A3%E8%AA%89%E4%B9%8B%E5%88%83"],
    "a5":["z2105","z2","反叛者的刺杀弓","反叛者的刺杀弓","%E5%8F%8D%E5%8F%9B%E8%80%85%E7%9A%84%E5%88%BA%E6%9D%80%E5%BC%93"],
    "a6":["z2106","z4","幽梦匕首","幽梦匕首","%E5%B9%BD%E6%A2%A6%E5%8C%95%E9%A6%96"],
    "a7":["z2107","z3","光辉法杖","棒棒糖法杖","%E5%85%89%E8%BE%89%E6%B3%95%E6%9D%96"],
    "a8":["z2108","z1","荆棘盾剑","荆棘盾剑","%E8%8D%86%E6%A3%98%E7%9B%BE%E5%89%91"],
    "ao8":["z2108","z1","荆棘剑盾","荆棘剑盾","%E8%8D%86%E6%A3%98%E7%9B%BE%E5%89%91"],
    "a9":["z2109","z1","陨铁重剑","陨铁重剑","%E9%99%A8%E9%93%81%E9%87%8D%E5%89%91"],
    "a10":["z2110","z2110","饮血魔剑","饮血魔剑","%E9%A5%AE%E8%A1%80%E9%AD%94%E5%89%91"],
    "ao10":["z2110","z2110","饮血长枪","饮血长枪","%E9%A5%AE%E8%A1%80%E9%95%BF%E6%9E%AA"],
    "w1":["z2201","z5","探险者手环","探险者手环","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E7%8E%AF"],
    "wo1":["z2201","z5","探险者手套","探险者手套","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E5%A5%97"],
    "w2":["z2202","z8","命师的传承手环","命师的传承手环","%E5%91%BD%E5%B8%88%E7%9A%84%E4%BC%A0%E6%89%BF%E6%89%8B%E7%8E%AF"],
    "w3":["z2203","z5","秃鹫手环","秃鹫手环","%E7%A7%83%E9%B9%AB%E6%89%8B%E7%8E%AF"],
    "wo3":["z2203","z5","秃鹫手套","秃鹫手套","%E7%A7%83%E9%B9%AB%E6%89%8B%E5%A5%97"],
    "c1":["z2301","z9","探险者铁甲","探险者铁甲","%E6%8E%A2%E9%99%A9%E8%80%85%E9%93%81%E7%94%B2"],
    "c2":["z2302","z10","探险者皮甲","探险者皮甲","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9A%AE%E7%94%B2"],
    "c3":["z2303","z10","探险者布甲",,"探险者布甲","%E6%8E%A2%E9%99%A9%E8%80%85%E5%B8%83%E7%94%B2"],
    "c4":["z2304","z11","旅法师的灵光袍","旅法师的灵光袍","%E6%97%85%E6%B3%95%E5%B8%88%E7%9A%84%E7%81%B5%E5%85%89%E8%A2%8D"],
    "c5":["z2305","z9","战线支撑者的荆棘重甲","战线支撑者的荆棘重甲","%E6%88%98%E7%BA%BF%E6%94%AF%E6%92%91%E8%80%85%E7%9A%84%E8%8D%86%E6%A3%98%E9%87%8D%E7%94%B2"],
    "c6":["z2306","z2306","复苏战衣","复苏战衣","%E5%A4%8D%E8%8B%8F%E6%88%98%E8%A1%A3"],
    "co6":["z2306","z2306","复苏木甲","复苏木甲","%E5%A4%8D%E8%8B%8F%E6%88%98%E8%A1%A3"],
    "c7":["z2307","z2307","挑战斗篷","挑战斗篷","%E6%8C%91%E6%88%98%E6%96%97%E7%AF%B7"],
    "h1":["z2401","z7","探险者耳环","探险者耳环","%E6%8E%A2%E9%99%A9%E8%80%85%E8%80%B3%E7%8E%AF"],
    "ho1":["z2401","z7","探险者头巾","探险者头巾","%E6%8E%A2%E9%99%A9%E8%80%85%E5%A4%B4%E5%B7%BE"],
    "h2":["z2402","z7","占星师的耳饰","占星师的耳饰","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E8%80%B3%E9%A5%B0"],
    "ho2":["z2402","z7","占星师的发饰","占星师的发饰","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E5%8F%91%E9%A5%B0"],
    "h3":["z2403","z7","萌爪耳钉","萌爪耳钉","%E8%90%8C%E7%88%AA%E8%80%B3%E9%92%89"],
    "ho3":["z2403","z7","天使缎带","天使缎带","%E5%A4%A9%E4%BD%BF%E7%BC%8E%E5%B8%A6"]},iconsize=custom.iconSize;
if (localStorage.userIcons){ userIcons = JSON.parse(localStorage.userIcons)}


/**
 * main functions
 */
let panel = document.getElementsByClassName('panel panel-primary')[1];
let iconconfpanel = document.createElement('span');
                iconconfpanel.innerHTML =
                    `&nbsp;<input type="button" class="iconpack-icons" value="选择主题包">&nbsp;<input type="button" class="iconpack-usr" value="输入自定义主题">&nbsp;<input type="button" class="iconpack-size" value="设置图标大小">&nbsp;&nbsp;<input type="checkbox" class="iconpack-switch" value="useOldNames" ${useOldNamesCheck}>切换回旧的装备名称`;
panel.insertBefore(iconconfpanel, panel.children[0]);
$(".iconpack-icons").click(function(){
    if (confirm("按【确定】选择主题包，按【取消】恢复默认主题包。")) {
        let IconPack = prompt('输入1使用【公主链接R主题包】；输入2使用【自定义主题包】；\n输入0不启用主题更改；输入其他使用【旧版风格主题包】。', "1");
        if (IconPack) {
            if(IconPack=="1"){ console.log('pcr');custom.iconPack="pcr"; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}
            else if(IconPack=="2"){ console.log('user');custom.iconPack="user"; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}
            else if(IconPack=="0"){ console.log('off');custom.iconPack="off"; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}
            else{ console.log('classic');custom.iconPack="classic"; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}
        }
    }else{ if(confirm("按【确定】恢复默认主题包，按【取消】则不操作。")){ console.log('classic');custom.iconPack="classic"; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}}
});
$(".iconpack-size").click(function(){
    let IconSize = prompt('请输入图标大小,格式应为32-128间的数字+px\n示例：50px', "50px");
    if (IconSize) { custom.iconSize = IconSize; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();}
});
$(".iconpack-usr").click(function(){
    let userIcon = prompt('请输入自定义主题包的json数据,\n请访问默认显示的url，以查看完整的json格式。', "https://kf.miaola.work/read.php?tid=809121&sf=141&page=21");
    if (userIcon) { console.log(userIcon); userIcons=JSON.parse(userIcon); localStorage.setItem('userIcons', userIcon);}
});
$(".iconpack-switch").click(function(e){ custom.useOldNames = e.target.checked; localStorage.setItem('IconPackConf', JSON.stringify(custom));location.reload();});
if(custom.iconPack=="classic"){ nowIcons=classicIcons;sessionStorage.setItem('ThemePack', JSON.stringify(nowIcons));}
else if(custom.iconPack=="pcr"){ nowIcons=pcrIcons;sessionStorage.setItem('ThemePack', JSON.stringify(nowIcons));}
else if(custom.iconPack=="off"){ return;}
else if(custom.iconPack=="user"){
    if(userIcons.i19){nowIcons=userIcons;sessionStorage.setItem('ThemePack', JSON.stringify(nowIcons));}
    else{ console.log("自定义主题包数据异常，没有主题包启用!");custom.iconPack="off"; localStorage.setItem('IconPackConf', JSON.stringify(custom)); return;}
}
if(custom.iconPack!="off"){
    ext=nowIcons.ext;purl=nowIcons.url;dessert=nowIcons.dessert;dessertlevel=nowIcons.dessertlevel;dessertname=nowIcons.dessertname;
    a1=nowIcons.a1;a2=nowIcons.a2;a3=nowIcons.a3;a4=nowIcons.a4;a5=nowIcons.a5;a6=nowIcons.a6;a7=nowIcons.a7;a8=nowIcons.a8;a9=nowIcons.a9;a10=nowIcons.a10;w1=nowIcons.w1;w2=nowIcons.w2;w3=nowIcons.w3;
    c1=nowIcons.c1;c2=nowIcons.c2;c3=nowIcons.c3;c4=nowIcons.c4;c5=nowIcons.c5;c6=nowIcons.c6;c7=nowIcons.c7;h1=nowIcons.h1;h2=nowIcons.h2;h3=nowIcons.h3;
    if(custom.useOldNames==true){ a8=nowIcons.ao8;a10=nowIcons.ao10;w1=nowIcons.wo1;w3=nowIcons.wo3;c6=nowIcons.co6;h1=nowIcons.ho1;h2=nowIcons.ho2;h3=nowIcons.ho3; }
}
function repfunc(){
    if(custom.useOldNames==true){
        $("button[data-original-title='荆棘盾剑']").attr("data-original-title",function(n,v){ n= v.replace(/盾剑/g, "剑盾");return n;});
        $("button[data-original-title='饮血魔剑']").attr("data-original-title",function(n,v){ n= v.replace(/魔剑/g, "长枪");return n;});
        $("button[data-original-title='探险者手环']").attr("data-original-title",function(n,v){ n= v.replace(/环/g, "套");return n;});
        $("button[data-original-title='秃鹫手环']").attr("data-original-title",function(n,v){ n= v.replace(/环/g, "套");return n;});
        $("button[data-original-title='复苏战衣']").attr("data-original-title",function(n,v){ n= v.replace(/战衣/g, "木甲");return n;});
        $("button[data-original-title='探险者耳环']").attr("data-original-title",function(n,v){ n= v.replace(/耳环/g, "头巾");return n;});
        $("button[data-original-title='占星师的发饰']").attr("data-original-title",function(n,v){ n= v.replace(/耳/g, "发");return n;});
        $("button[data-original-title='萌爪耳钉']").attr("data-original-title",function(n,v){ n= v.replace(/萌爪耳钉/g, "天使缎带");return n;});
        $(".with-padding").html(function(n,v){n= v.replace(/荆棘盾剑/g, "荆棘剑盾");n= n.replace(/饮血魔剑/g, "饮血长枪");n= n.replace(/探险者手环/g, "探险者手套");n= n.replace(/秃鹫手环/g, "秃鹫手套");
            n= n.replace(/复苏战衣/g, "复苏木甲");n= n.replace(/探险者耳环/g, "探险者头巾");n= n.replace(/占星师的耳饰/g, "占星师的发饰");n= n.replace(/萌爪耳钉/g, "天使缎带");return n;});
    }
    if(custom.iconPack!="off"){
        if(ext!=".gif"){ $("button[style*='ys/icon/z']").attr("style",function(n,v){ n= v.replace(/.gif/g, ext);return n;});}
        $("button[style*='z2101']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, purl+a1[4]);n=n.replace(/ys\/icon\/z2101/g, purl+a1[4]);return n;});
        $("button[style*='z2102']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, purl+a2[4]);n=n.replace(/ys\/icon\/z2102/g, purl+a2[4]);return n;});
        $("button[style*='z2103']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, purl+a3[4]);n=n.replace(/ys\/icon\/z2103/g, purl+a3[4]);return n;});
        $("button[style*='z2104']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, purl+a4[4]);n=n.replace(/ys\/icon\/z2104/g, purl+a4[4]);return n;});
        $("button[style*='z2105']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, purl+a5[4]);n=n.replace(/ys\/icon\/z2105/g, purl+a5[4]);return n;});
        $("button[style*='z2106']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, purl+a6[4]);n=n.replace(/ys\/icon\/z2106/g, purl+a6[4]);return n;});
        $("button[style*='z2107']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, purl+a7[4]);n=n.replace(/ys\/icon\/z2107/g, purl+a7[4]);return n;});
        $("button[style*='z2108']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, purl+a8[4]);n=n.replace(/ys\/icon\/z2108/g, purl+a8[4]);return n;});
        $("button[style*='z2109']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, purl+a9[4]);n=n.replace(/ys\/icon\/z2109/g, purl+a9[4]);return n;});
        $("button[style*='z2110']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g, purl+a10[4]);n=n.replace(/ys\/icon\/z2110/g, purl+a10[4]);return n;});
        $("button[style*='z2201']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, purl+w1[4]);n=n.replace(/ys\/icon\/z2201/g, purl+w1[4]);return n;});
        $("button[style*='z2202']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, purl+w2[4]);n=n.replace(/ys\/icon\/z2202/g, purl+w2[4]);return n;});
        $("button[style*='z2203']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, purl+w3[4]);n=n.replace(/ys\/icon\/z2203/g, purl+w3[4]);return n;});
        $("button[style*='z2301']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2301_/g, purl+c1[4]);n=n.replace(/ys\/icon\/z2301/g, purl+c1[4]);return n;});
        $("button[style*='z2302']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2302_/g, purl+c2[4]);n=n.replace(/ys\/icon\/z2302/g, purl+c2[4]);return n;});
        $("button[style*='z2303']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2303_/g, purl+c3[4]);n=n.replace(/ys\/icon\/z2303/g, purl+c3[4]);return n;});
        $("button[style*='z2304']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2304_/g, purl+c4[4]);n=n.replace(/ys\/icon\/z2304/g, purl+c4[4]);return n;});
        $("button[style*='z2305']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2305_/g, purl+c5[4]);n=n.replace(/ys\/icon\/z2305/g, purl+c5[4]);return n;});
        $("button[style*='z2306']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2306_/g, purl+c6[4]);n=n.replace(/ys\/icon\/z2306/g, purl+c6[4]);return n;});
        $("button[style*='z2307']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2307_/g, purl+c7[4]);n=n.replace(/ys\/icon\/z2307/g, purl+c7[4]);return n;});
        $("button[style*='z2401']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2401_/g, purl+h1[4]);n=n.replace(/ys\/icon\/z2201/g, purl+h1[4]);return n;});
        $("button[style*='z2402']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2402_/g, purl+h2[4]);n=n.replace(/ys\/icon\/z2402/g, purl+h2[4]);return n;});
        $("button[style*='z2403']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2403_/g, purl+h3[4]);n=n.replace(/ys\/icon\/z2403/g, purl+h3[4]);return n;});
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
    }
}
function flogrepfunc(){
    if(custom.useOldNames!=true){
        $("button[data-original-title='荆棘剑盾']").attr("data-original-title",function(n,v){ n= v.replace(/荆棘剑盾/g, "荆棘盾剑");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a8[4]);return n;});
        $("button[data-original-title='饮血长枪']").attr("data-original-title",function(n,v){ n= v.replace(/饮血长枪/g, "饮血魔剑");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z/g, purl+a10[4]);return n;});
        $("button[data-original-title='探险者手套']").attr("data-original-title",function(n,v){ n= v.replace(/探险者手套/g, "探险者手环");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w1[4]);return n;});
        $("button[data-original-title='秃鹫手套']").attr("data-original-title",function(n,v){ n= v.replace(/秃鹫手套/g, "秃鹫手环");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w3[4]);return n;});
        $("button[data-original-title='复苏木甲']").attr("data-original-title",function(n,v){ n= v.replace(/复苏木甲/g, "复苏战衣");return n;});
        $("button[data-original-title='探险者头巾']").attr("data-original-title",function(n,v){ n= v.replace(/探险者头巾/g, "探险者耳环");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h1[4]);return n;});
        $("button[data-original-title='占星师的发饰']").attr("data-original-title",function(n,v){ n= v.replace(/占星师的发饰/g, "占星师的耳饰");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h2[4]);return n;});
        $("button[data-original-title='天使缎带']").attr("data-original-title",function(n,v){ n= v.replace(/天使缎带/g, "萌爪耳钉");return n;}).attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h3[4]);return n;});
    }
    $("button[data-original-title='探险者之剑']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a1[4]);return n;});
    $("button[data-original-title='探险者短弓']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a2[4]);return n;});
    $("button[data-original-title='探险者短杖']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a3[4]);return n;});
    $("button[data-original-title='狂信者的荣誉之刃']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a4[4]);return n;});
    $("button[data-original-title='反叛者的刺杀弓']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2/g, purl+a5[4]);return n;});
    $("button[data-original-title='幽梦匕首']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z4/g, purl+a6[4]);return n;});
    $("button[data-original-title='光辉法杖']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z3/g, purl+a7[4]);return n;});
    $("button[data-original-title='荆棘剑盾']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a8[4]);return n;});
    $("button[data-original-title='陨铁重剑']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z1/g, purl+a9[4]);return n;});
    $("button[data-original-title='饮血长枪']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z/g, purl+a10[4]);return n;});
    $("button[data-original-title='探险者手套']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w1[4]);return n;});
    $("button[data-original-title='命师的传承手环']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z8/g, purl+w2[4]);return n;});
    $("button[data-original-title='秃鹫手套']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z5/g, purl+w3[4]);return n;});
    $("button[data-original-title='探险者铁甲']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c1[4]);return n;});
    $("button[data-original-title='探险者皮甲']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c2[4]);return n;});
    $("button[data-original-title='探险者布甲']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z10/g, purl+c3[4]);return n;});
    $("button[data-original-title='旅法师的灵光袍']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z11/g, purl+c4[4]);return n;});
    $("button[data-original-title='战线支撑者的荆棘重甲']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z9/g, purl+c5[4]);return n;});
    $("button[data-original-title='探险者头巾']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h1[4]);return n;});
    $("button[data-original-title='占星师的发饰']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h2[4]);return n;});
    $("button[data-original-title='天使缎带']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z7/g, purl+h3[4]);return n;});
}


/**
 * add CSS
 */
$('head').append(`<style>
    .btn.fyg_mp3 { width: ${iconsize} !important; height: ${iconsize} !important; background-size:100% 100%;line-height: ${Math.floor(parseInt(iconsize)*3.1/5)-1}px; }
    .btn.fyg_colpzbg.fyg_mp3 { width: ${iconsize} !important; height: ${iconsize} !important; background-size:100% 100%;}
    .img-rounded { width: 50px; height:50px;}
    .btn.fyg_colpzbg.fyg_tc { width: 60px !important; height: 100px !important;line-height:25px;}
</style>`);
if(custom.iconPack=="pcr"){ $('head').append(`<style>
[data-trigger=hover] {background-blend-mode: normal !important; }
[data-toggle=tooltip] {background-blend-mode: normal !important; }
</style>`);}


/**
 * init
 */
$(document).ajaxSuccess(function(){ repfunc();});
$(document).on('click', ".detaillogitem", function () {
    repfunc();flogrepfunc();
});
