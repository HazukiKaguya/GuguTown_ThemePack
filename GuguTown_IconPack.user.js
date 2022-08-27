// ==UserScript==
// @name        Gugu Town IconPack
// @namespace   https://github.com/HazukiKaguya/GuguTown_IconPack
// @homepage    https://github.com/HazukiKaguya
// @version     0.3.0
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
let useOldNamesCheck ='',custom = defaultConf,userIcons={},timeout = null,nowIcons;
if (localStorage.IconPackConf) { custom = JSON.parse(localStorage.IconPackConf) }
else {localStorage.setItem('IconPackConf', JSON.stringify(defaultConf)); }
if (custom.useOldNames == true) { useOldNamesCheck = 'checked' }
const classicIcons={
    "url":"https://sticker.inari.site/guguicons/old/",
    "ext":".gif",
    "dessert":["apple","grape","cherry"],
    "i0":["反叛者的刺杀弓 z2105_.gif","bow_"],
    "i1":["狂信者的荣誉之刃 z2104_.gif","knife_"],
    "i2":["陨铁重剑 z2109_.gif","sword_"],
    "i3":["幽梦匕首 z2106_.gif","knife_"],
    "i4":["荆棘盾剑 z2108_.gif","sword_"],
    "i5":["饮血魔剑 z2110_.gif","sword_"],
    "o5":["饮血长枪","spear_"],
    "i6":["光辉法杖 z2107_.gif","staff_"],
    "i7":["探险者短弓 z2102_.gif","bow_"],
    "i8":["探险者短杖 z2103_.gif","staff_"],
    "i9":["探险者之剑 z2101_.gif)","sword_"],
    "i10":["命师的传承手环 z2202_.gif","bracelet_"],
    "i11":["秃鹫手环 z2203_.gif","bracelet_"],
    "o11":["秃鹫手套","gloves_"],
    "i12":["探险者手环 z2201_.gif","bracelet_"],
    "o12":["探险者手套","gloves_"],
    "i13":["旅法师的灵光袍 z2304_.gif","gown_"],
    "i14":["挑战斗篷 z2307_.gif","clothes_"],
    "i15":["战线支撑者的荆棘重甲 z2305_.gif","armour_"],
    "i16":["复苏战衣 z2306_.gif","gown_"],
    "i17":["探险者铁甲 z2301_.gif","armour_"],
    "i18":["探险者皮甲 z2302_.gif","clothes_"],
    "i19":["探险者布甲 z2303_.gif","clothes_"],
    "i20":["萌爪耳钉 z2403_.gif","neko_"],
    "o20":["天使缎带","swirl_"],
    "i21":["占星师的耳饰 z2402_.gif","earring_"],
    "o21":["占星师的发饰","swirl_"],
    "i22":["探险者耳环 z2401_.gif","earring_"],
    "o22":["探险者头巾","swirl_"]}
,pcrIcons={
    "url":"https://sticker.inari.site/guguicons/pcr/",
    "ext":".gif",
    "dessert":["pie","donuts","cake"],
    "i0":["反叛者的刺杀弓","%E5%8F%8D%E5%8F%9B%E8%80%85%E7%9A%84%E5%88%BA%E6%9D%80%E5%BC%93"],
    "i1":["狂信者的荣誉之刃","%E7%8B%82%E4%BF%A1%E8%80%85%E7%9A%84%E8%8D%A3%E8%AA%89%E4%B9%8B%E5%88%83"],
    "i2":["陨铁重剑","%E9%99%A8%E9%93%81%E9%87%8D%E5%89%91"],
    "i3":["幽梦匕首","%E5%B9%BD%E6%A2%A6%E5%8C%95%E9%A6%96"],
    "i4":["荆棘盾剑","%E8%8D%86%E6%A3%98%E7%9B%BE%E5%89%91"],
    "i5":["饮血魔剑","%E9%A5%AE%E8%A1%80%E9%AD%94%E5%89%91"],
    "o5":["饮血长枪","%E9%A5%AE%E8%A1%80%E9%95%BF%E6%9E%AA"],
    "i6":["光辉法杖","%E5%85%89%E8%BE%89%E6%B3%95%E6%9D%96"],
    "i7":["探险者短弓","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E5%BC%93"],
    "i8":["探险者短杖","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9F%AD%E6%9D%96"],
    "i9":["探险者之剑","%E6%8E%A2%E9%99%A9%E8%80%85%E4%B9%8B%E5%89%91"],
    "i10":["命师的传承手环","%E5%91%BD%E5%B8%88%E7%9A%84%E4%BC%A0%E6%89%BF%E6%89%8B%E7%8E%AF"],
    "i11":["秃鹫手环","%E7%A7%83%E9%B9%AB%E6%89%8B%E7%8E%AF"],
    "o11":["秃鹫手套","%E7%A7%83%E9%B9%AB%E6%89%8B%E5%A5%97"],
    "i12":["探险者手环","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E7%8E%AF"],
    "o12":["探险者手套","%E6%8E%A2%E9%99%A9%E8%80%85%E6%89%8B%E5%A5%97"],
    "i13":["旅法师的灵光袍","%E6%97%85%E6%B3%95%E5%B8%88%E7%9A%84%E7%81%B5%E5%85%89%E8%A2%8D"],
    "i14":["挑战斗篷","%E6%8C%91%E6%88%98%E6%96%97%E7%AF%B7"],
    "i15":["战线支撑者的荆棘重甲","%E6%88%98%E7%BA%BF%E6%94%AF%E6%92%91%E8%80%85%E7%9A%84%E8%8D%86%E6%A3%98%E9%87%8D%E7%94%B2"],
    "i16":["复苏战衣","%E5%A4%8D%E8%8B%8F%E6%88%98%E8%A1%A3"],
    "i17":["探险者铁甲","%E6%8E%A2%E9%99%A9%E8%80%85%E9%93%81%E7%94%B2"],
    "i18":["探险者皮甲","%E6%8E%A2%E9%99%A9%E8%80%85%E7%9A%AE%E7%94%B2"],
    "i19":["探险者布甲","%E6%8E%A2%E9%99%A9%E8%80%85%E5%B8%83%E7%94%B2"],
    "i20":["萌爪耳钉","%E8%90%8C%E7%88%AA%E8%80%B3%E9%92%89"],
    "o20":["天使缎带","%E5%A4%A9%E4%BD%BF%E7%BC%8E%E5%B8%A6"],
    "i21":["占星师的耳饰","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E8%80%B3%E9%A5%B0"],
    "o21":["占星师的发饰","%E5%8D%A0%E6%98%9F%E5%B8%88%E7%9A%84%E5%8F%91%E9%A5%B0"],
    "i22":["探险者耳环","%E6%8E%A2%E9%99%A9%E8%80%85%E8%80%B3%E7%8E%AF"],
    "o22":["探险者头巾","%E6%8E%A2%E9%99%A9%E8%80%85%E5%A4%B4%E5%B7%BE"]},iconsize=custom.iconSize;
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
function repfunc(){
    if(custom.iconPack=="classic"){ nowIcons=classicIcons;} else if(custom.iconPack=="pcr"){ nowIcons=pcrIcons;} else if(custom.iconPack=="off"){ return;}
    else if(custom.iconPack=="user"){ if(userIcons.i19){nowIcons=userIcons;}else{ console.log("自定义主题包数据异常，没有主题包启用!"); return;}}
    let ext=nowIcons.ext,url=nowIcons.url,dessert=nowIcons.dessert,i0=nowIcons.i0,i1=nowIcons.i1,i2=nowIcons.i2,i3=nowIcons.i3,i4=nowIcons.i4,i5=nowIcons.i5,i6=nowIcons.i6,i7=nowIcons.i7,i8=nowIcons.i8,i9=nowIcons.i9,i10=nowIcons.i10,
        i11=nowIcons.i11,i12=nowIcons.i12,i13=nowIcons.i13,i14=nowIcons.i14,i15=nowIcons.i15,i16=nowIcons.i16,i17=nowIcons.i17,i18=nowIcons.i18,i19=nowIcons.i19,i20=nowIcons.i20,i21=nowIcons.i21,i22=nowIcons.i22;
    if(custom.useOldNames==true){
        i5=nowIcons.o5;i11=nowIcons.o11;i12=nowIcons.o12;i20=nowIcons.o20;i21=nowIcons.o21;i22=nowIcons.o22;
        $("button[data-original-title*='荆棘盾剑']").attr("data-original-title",function(n,v){ n= v.replace(/荆棘盾剑/g, "荆棘剑盾");return n;});
        $("button[data-original-title*='饮血魔剑']").attr("data-original-title",function(n,v){ n= v.replace(/饮血魔剑/g, "饮血长枪");return n;});
        $("button[data-original-title*='探险者手环']").attr("data-original-title",function(n,v){ n= v.replace(/探险者手环/g, "探险者手套");return n;});
        $("button[data-original-title*='秃鹫手环']").attr("data-original-title",function(n,v){ n= v.replace(/秃鹫手环/g, "秃鹫手套");return n;});
        $("button[data-original-title*='复苏战衣']").attr("data-original-title",function(n,v){ n= v.replace(/复苏战衣/g, "复苏木甲");return n;});
        $("button[data-original-title*='探险者耳环']").attr("data-original-title",function(n,v){ n= v.replace(/探险者耳环/g, "探险者头巾");return n;});
        $("button[data-original-title*='占星师的耳饰']").attr("data-original-title",function(n,v){ n= v.replace(/占星师的耳饰/g, "占星师的发饰");return n;});
        $("button[data-original-title*='萌爪耳钉']").attr("data-original-title",function(n,v){ n= v.replace(/萌爪耳钉/g, "天使缎带");return n;});
    }
    $(".with-padding").html(function(n,v){
        n= v.replace(/荆棘盾剑/g, "荆棘剑盾");
        n= n.replace(/饮血魔剑/g, "饮血长枪");
        n= n.replace(/探险者手环/g, "探险者手套");
        n= n.replace(/秃鹫手环/g, "秃鹫手套");
        n= n.replace(/复苏战衣/g, "复苏木甲");
        n= n.replace(/探险者耳环/g, "探险者头巾");
        n= n.replace(/占星师的耳饰/g, "占星师的发饰");
        n= n.replace(/萌爪耳钉/g, "天使缎带");
        return n;});
    if(ext!=".gif"){ $("button[style*='ys/icon/z/z2']").attr("style",function(n,v){ n= v.replace(/.gif/g, ext);return n;});}
    if(custom.iconPack=="pcr"){
        $("button[data-original-title*='稀有苹果护身符']").attr("data-original-title",function(n,v){ n= v.replace(/稀有苹果护身符/g, "家常的苹果派");return n;});
        $("button[data-original-title*='史诗苹果护身符']").attr("data-original-title",function(n,v){ n= v.replace(/史诗苹果护身符/g, "美味的苹果派");return n;});
        $("button[data-original-title*='传奇苹果护身符']").attr("data-original-title",function(n,v){ n= v.replace(/传奇苹果护身符/g, "诱人的苹果派");return n;});
        $("button[data-original-title*='稀有葡萄护身符']").attr("data-original-title",function(n,v){ n= v.replace(/稀有葡萄护身符/g, "家常的甜甜圈");return n;});
        $("button[data-original-title*='史诗葡萄护身符']").attr("data-original-title",function(n,v){ n= v.replace(/史诗葡萄护身符/g, "美味的甜甜圈");return n;});
        $("button[data-original-title*='传奇葡萄护身符']").attr("data-original-title",function(n,v){ n= v.replace(/传奇葡萄护身符/g, "诱人的甜甜圈");return n;});
        $("button[data-original-title*='稀有樱桃护身符']").attr("data-original-title",function(n,v){ n= v.replace(/稀有樱桃护身符/g, "家常的樱桃蛋糕");return n;});
        $("button[data-original-title*='史诗樱桃护身符']").attr("data-original-title",function(n,v){ n= v.replace(/史诗樱桃护身符/g, "美味的樱桃蛋糕");return n;});
        $("button[data-original-title*='传奇樱桃护身符']").attr("data-original-title",function(n,v){ n= v.replace(/传奇樱桃护身符/g, "诱人的樱桃蛋糕");return n;});
        $(".with-padding").html(function(n,v){n= v.replace(/苹果护身符/g, "苹果派"); n= n.replace(/葡萄护身符/g, "甜甜圈"); n= n.replace(/樱桃护身符/g, "樱桃蛋糕"); return n;});
    }
    $("button[style*='z2105_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, url+i0[1]);return n;});
    $("button[style*='z2104_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, url+i1[1]);return n;});
    $("button[style*='z2109_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, url+i2[1]);return n;});
    $("button[style*='z2106_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, url+i3[1]);return n;});
    $("button[style*='z2108_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, url+i4[1]);return n;});
    $("button[style*='z2110_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g, url+i5[1]);return n;});
    $("button[style*='z2107_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, url+i6[1]);return n;});
    $("button[style*='z2102_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, url+i7[1]);return n;});
    $("button[style*='z2103_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, url+i8[1]);return n;});
    $("button[style*='z2101_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, url+i9[1]);return n;});
    $("button[style*='z2202_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, url+i10[1]);return n;});
    $("button[style*='z2203_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, url+i11[1]);return n;});
    $("button[style*='z2201_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, url+i12[1]);return n;});
    $("button[style*='z2304_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2304_/g, url+i13[1]);return n;});
    $("button[style*='z2307_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2307_/g, url+i14[1]);return n;});
    $("button[style*='z2305_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2305_/g, url+i15[1]);return n;});
    $("button[style*='z2306_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2306_/g, url+i16[1]);return n;});
    $("button[style*='z2301_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2301_/g, url+i17[1]);return n;});
    $("button[style*='z2302_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2302_/g, url+i18[1]);return n;});
    $("button[style*='z2303_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2303_/g, url+i19[1]);return n;});
    $("button[style*='z2403_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2403_/g, url+i20[1]);return n;});
    $("button[style*='z2402_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2402_/g, url+i21[1]);return n;});
    $("button[style*='z2401_']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z\/z2401_/g, url+i22[1]);return n;});
    $("button[style*='z903.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z903/g, url+dessert[0]);return n;});
    $("button[style*='z902.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z902/g, url+dessert[1]);return n;});
    $("button[style*='z901.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z901/g, url+dessert[2]);return n;});
    $("button[style*='z2105.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2105/g, url+i0[1]);return n;});
    $("button[style*='z2104.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2104/g, url+i1[1]);return n;});
    $("button[style*='z2109.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2109/g, url+i2[1]);return n;});
    $("button[style*='z2106.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2106/g, url+i3[1]);return n;});
    $("button[style*='z2108.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2108/g, url+i4[1]);return n;});
    $("button[style*='z2107.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2107/g, url+i6[1]);return n;});
    $("button[style*='z2202.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2202/g, url+i10[1]);return n;});
    $("button[style*='z2203.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2203/g, url+i11[1]);return n;});
    $("button[style*='z2201.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2201/g, url+i12[1]);return n;});
    $("button[style*='z2304.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2304/g, url+i13[1]);return n;});
    $("button[style*='z2305.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2305/g, url+i15[1]);return n;});
    $("button[style*='z2301.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2301/g, url+i17[1]);return n;});
    $("button[style*='z2302.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2302/g, url+i18[1]);return n;});
    $("button[style*='z2303.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2303/g, url+i19[1]);return n;});
    $("button[style*='z2403.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2403/g, url+i20[1]);return n;});
    $("button[style*='z2402.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2402/g, url+i21[1]);return n;});
    $("button[style*='z2401.gif']").attr("style",function(n,v){ n= v.replace(/ys\/icon\/z2401/g, url+i22[1]);return n;});

    $(".fyg_tc>img[src*='z2105_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2105_/g, url+i0[1]);return n;});
    $(".fyg_tc>img[src*='z2104_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2104_/g, url+i1[1]);return n;});
    $(".fyg_tc>img[src*='z2109_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2109_/g, url+i2[1]);return n;});
    $(".fyg_tc>img[src*='z2106_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2106_/g, url+i3[1]);return n;});
    $(".fyg_tc>img[src*='z2108_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2108_/g, url+i4[1]);return n;});
    $(".fyg_tc>img[src*='z2110_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2110_/g, url+i5[1]);return n;});
    $(".fyg_tc>img[src*='z2107_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2107_/g, url+i6[1]);return n;});
    $(".fyg_tc>img[src*='z2102_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2102_/g, url+i7[1]);return n;});
    $(".fyg_tc>img[src*='z2103_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2103_/g, url+i8[1]);return n;});
    $(".fyg_tc>img[src*='z2101_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2101_/g, url+i9[1]);return n;});
    $(".fyg_tc>img[src*='z2202_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2202_/g, url+i10[1]);return n;});
    $(".fyg_tc>img[src*='z2203_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2203_/g, url+i11[1]);return n;});
    $(".fyg_tc>img[src*='z2201_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2201_/g, url+i12[1]);return n;});
    $(".fyg_tc>img[src*='z2304_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2304_/g, url+i13[1]);return n;});
    $(".fyg_tc>img[src*='z2307_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2307_/g, url+i14[1]);return n;});
    $(".fyg_tc>img[src*='z2305_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2305_/g, url+i15[1]);return n;});
    $(".fyg_tc>img[src*='z2306_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2306_/g, url+i16[1]);return n;});
    $(".fyg_tc>img[src*='z2301_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2301_/g, url+i17[1]);return n;});
    $(".fyg_tc>img[src*='z2302_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2302_/g, url+i18[1]);return n;});
    $(".fyg_tc>img[src*='z2303_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2303_/g, url+i19[1]);return n;});
    $(".fyg_tc>img[src*='z2403_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2403_/g, url+i20[1]);return n;});
    $(".fyg_tc>img[src*='z2402_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2402_/g, url+i21[1]);return n;});
    $(".fyg_tc>img[src*='z2401_']").attr("src",function(n,v){ n= v.replace(/ys\/icon\/z\/z2401_/g, url+i22[1]);return n;});
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
