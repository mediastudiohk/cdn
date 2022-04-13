const can = canvas;
const mctx = can.getContext("2d");
const W=960;
const H=540;

const can2 = document.createElement("canvas");
can2.width = W; can2.height = H;
const ctx = can2.getContext("2d");
/// values
var sy = 0;
var cx = 0, cy = 0, cw=W, ch=H;

function resizeCan(){
  G.needResize=true;
}
window.onresize = resizeCan;

can.addEventListener("mousemove", function () { Mouse.MouseMove(event, false) }, !1);
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1)
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); if (!sys.MScolling) event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;

const G = {
  isReady:false, state:"main", sound:true, time:0, bg_y:0, needResize:true, popup:false, popup_type:'', popup_money:0
  ,newGame(){
    Q.start();
    G.popup=false;
    G.state="game";
    if(G.sound){stopSound(music1); playMusic(music1);}
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.bg1 = ctx.createPattern(img.bg1, 'repeat');
    G.isReady=true;
    G.resizeCan();
    //G.newGame();
  }
  ,loop(){
    G.resizeCan(); G.drawBG();
    if(G.state == 'game') G.drawGame();
    else if(G.state == 'month_end') G.drawMonthEnd();
    else if(G.state == 'month_start') G.drawMonthStart();
    else if(G.state == 'end') G.drawEnd();
    else if(G.state == 'main') G.drawMain();
    // top right buttons
    if(DrawBtn2(W-50, H-45, 40, 40, img.btn_fs) && Mouse.Down('Left')) sys.swithFullscreen();
    if(DrawBtn2(W-100, H-45, 40, 40, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left')){
      G.sound=!G.sound;
      if(G.sound) playMusic(music1);
      else stopSound(music1);
    }
    mctx.fillStyle = 'Black';
    mctx.fillRect(0,0,cw,ch);
    mctx.drawImage(can2,cx,cy);
  }
  ,drawBG(){
    ctx.drawImage(img.bg2, 0, 0, W, H);
    ctx.translate(0, G.bg_y);
    ctx.fillStyle = G.bg1;
    ctx.fillRect(0,-G.bg_y,W,H);
    G.bg_y=(G.bg_y+.75)%64;
    ctx.resetTransform();
    //ctx.drawImage(img.sky, 0, 0, W, H);
  }
  ,drawMain(){
    var mld = Mouse.Down('Left'), w2=W/2;
    ctx.drawImage(img.title,(W-500)/2, 40);
    if(DrawBtn(w2,320,330,100,img.btn_play) && mld) G.newGame();
  }
  ,drawGame(){
    var mld = Mouse.Down('Left'), w2=W/2;
    G.draw.top_bar();
    ctx.fillStyle = '#1e174e'; ctx.fillText('Action Left: '+Q.action_left,40,85);
    ctx.textAlign = "center"; ctx.fillText(Months[Q.round_i],w2,85);

    if(G.popup){
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText('Enter the amount of money',W/2,150);
      if(G.popup_type=='a5') ctx.fillText('You want to save',W/2,190);
      else ctx.fillText('You want to invest',W/2,190);
      ctx.fillStyle = '#fff'; ctx.fillRect((W-200)/2,250,200,100);
      ctx.fillStyle = '#1e174e'; ctx.fillText(G.popup_money+'$',W/2,300);
      if(DrawBtn(W/2+160,250,100,100,img.btn_add2) && mld) {G.popup_money+=10;}
      if(DrawBtn(W/2+160+105,250,100,100,img.btn_add3) && mld) {G.popup_money+=100;}
      if(DrawBtn(W/2+160+210,250,100,100,img.btn_addall) && mld) {G.popup_money=Q.money;}

      if(DrawBtn(W/2-160,250,100,100,img.btn_sub2) && mld) {G.popup_money-=10;}
      if(DrawBtn(W/2-160-105,250,100,100,img.btn_sub3) && mld) {G.popup_money-=100;}
      if(DrawBtn(W/2-160-210,250,100,100,img.btn_suball) && mld) {G.popup_money=0;}

      if(G.popup_money<0) G.popup_money=0;
      if(G.popup_money>Q.money) G.popup_money=Q.money;

      if(DrawBtn(W/2,380,330,100,img.confirm) && mld){
        if(G.popup_type=='a5') Q.save_money();
        else Q.invest_money();
        G.PlaySound(snd_confirm);
      }
    }
    else {
      for (var i = 0, c=Q.cards; i < 4; i++) {
        G.draw[c[i].type](40+i*223, 150, c[i]);
      }
      if(Q.action_left==0 && DrawBtn(W-180,75,250,60,img.end_round) && mld){ Q.end_month(); G.PlaySound(snd_confirm);}
      for (var i = 0, c=Q.cards; i < 4; i++) {
        if(Mouse.Square(40+i*223, 150, 210, 300) && mld){
          Q.active_card(i);
        }
      }
    }
  }
  ,drawMonthEnd(){
    var mld = Mouse.Down('Left'), w2=W/2, y=85;
    G.draw.top_bar();
    ctx.fillStyle = '#1e174e';
    if(Month.save.active){
      var o=Month.save;
      ctx.fillText('Your save '+o.money+'$, increased to '+o.money_back+'$('+o.percent+'%)',40,y);
      y+=50;
    }
    if(Month.invest.active){
      var o=Month.invest, w=o.percent>=0?'increased':'decreased';
      ctx.fillText('Your invest '+o.money+'$, '+w+' to '+o.money_back+'$('+o.percent+'%)',40,y);
      y+=50;
    }

    ctx.fillText('Your money at the start of the month: '+Q.start_money+'$',40,300);
    ctx.fillText('Your money at the end of the month: '+Q.money+'$',40,300+50);
    if(DrawBtn(W/2,430,330,100,img.confirm) && mld){
      Q.next_month();G.PlaySound(snd_confirm);
    }
  }
  ,drawMonthStart(){
    var mld = Mouse.Down('Left'), w2=W/2, y=85;
    G.draw.top_bar();
    ctx.fillStyle = '#1e174e'; ctx.textAlign = "center";
    ctx.fillText('New month',w2,100);
    ctx.fillText('You were given 200$ of pocket money',w2,200);
    ctx.fillText('Your happiness decreased by -5%',w2,250);
    ctx.fillText('Your relationships decreased by -5%',w2,300);
    if(DrawBtn(W/2,430,330,100,img.confirm) && mld){
      G.state = 'game';G.PlaySound(snd_confirm);
    }
  }
  ,drawEnd(){
    var mld = Mouse.Down('Left'), w2=W/2, y=80;
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = "bold 40px font1"; ctx.fillStyle = "#1e174e";
    ctx.fillText('After 1 year, you have managed to do the following:',w2,y); y+=65;
    ctx.fillText('Save up '+Q.money+'$',w2,y); y+=65;
    ctx.fillText('Be '+Q.happiness+'% happy',w2,y); y+=65;
    ctx.fillText('And keep '+Q.relationships+'%',w2,y); y+=50;
    ctx.fillText('of your relationship with friends and family',w2,y); y+=65;
    if(DrawBtn(w2,380,330,100,img.btn_play_again) && mld) G.newGame();
  }
  ,draw:{
    a1(x,y,c){
      var arr =['snacks','clothes','toys'];
      var tx1=arr[c.i];
      this.card(
        {   x:x, y:y, m:img.symbol.a1[c.i]
          , title:['Shopping and buying',tx1,'']
          , tb1:{c:'red',txt:'Money -250$'}
          , tb2:{c:'#054da2',txt:'Relationships +40%'}
          , tb3:{c:'#054da2',txt:'Happiness +40%'}
          , active:c.active
        });
    },
    a2(x,y,c){
      var arr =['Movie','Amusement Park'];
      var tx1=arr[c.i];
      this.card(
        {   x:x, y:y, m:img.symbol.a2[c.i]
          , title:[tx1,'with friends','']
          , tb1:{c:'red',txt:'Money -150$'}
          , tb2:{c:'#054da2',txt:'Relationships +15%'}
          , tb3:{c:'#054da2',txt:'Happiness +15%'}
          , active:c.active
        });
    },
    a3(x,y,c){
      this.card(
        {   x:x, y:y, m:img.symbol.a3
          , title:['','Eating with family','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Relationships +15%'}
          , tb3:{c:'#054da2',txt:'Happiness +5%'}
          , active:c.active
        });
    },
    a4(x,y,c){
      var arr =['Cycling','Running','Skating','Hiking'];
      var tx1=arr[c.i];
      this.card(
        {   x:x, y:y, m:img.symbol.a4[c.i]
          , title:[tx1,'with friends','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Relationships +10%'}
          , tb3:{c:'#054da2',txt:'Happiness +10%'}
          , active:c.active
        });
    },
    a5(x,y,c){
      this.card(
        {   x:x, y:y, m:img.symbol.a5
          , title:['','Saving','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Money +10%'}
          , tb3:{c:'#054da2',txt:''}
          , active:c.active
        });
    },
    a6(x,y,c){
      this.card(
        {   x:x, y:y, m:img.symbol.a6
          , title:['Reading & Research','about Investing','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Investing Return +5%'}
          , tb3:{c:'#054da2',txt:''}
          , active:c.active
        });
    },
    a7(x,y,c){
      var pp = Q.repeat.a6*5, min=-5+pp, max=10+pp;
      this.card(
        {   x:x, y:y, m:img.symbol.a7
          , title:['','Investing','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Money '+min+'% to '+max+'%'}
          , tb3:{c:'#054da2',txt:''}
          , active:c.active
        });
    },
    a8(x,y,c){
      var arr =['Doing housework','Running errands'];
      var tx1=arr[c.i];
      this.card(
        {   x:x, y:y, m:img.symbol.a8[c.i]
          , title:[tx1,'for family for money','']
          , tb1:{c:'red',txt:''}
          , tb2:{c:'#054da2',txt:'Money +200$ to +400$'}
          , tb3:{c:'#054da2',txt:''}
          , active:c.active
        });
    },
    card(o){
      var x=o.x, y=o.y, ty=y+20;
      ctx.drawImage(img.card, x, y);
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "22px font1"; ctx.fillStyle = "#1e174e";
      ctx.fillText(o.title[0], x+105, ty)
      ctx.fillText(o.title[1], x+105, ty+25)
      ctx.fillText(o.title[2], x+105, ty+50)
      ctx.drawImage(o.m, x+52, y+90);
      ty=y+220;
      this.text(o.tb1.c,o.tb1.txt, x+105, ty);
      this.text(o.tb2.c,o.tb2.txt, x+105, ty+30);
      this.text(o.tb3.c,o.tb3.txt, x+105, ty+60);
      if(o.active) ctx.drawImage(img.card_active, x, y);
    },
    text(color,text,x,y){
      ctx.fillStyle = color; ctx.fillText(text, x, y);
    },
    top_bar(){
      ctx.fillStyle = '#00ab5a';
      ctx.globalAlpha=0.5; ctx.fillRect(0,0,W,60); ctx.globalAlpha=1;
      ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.font = "bold 40px font1"; ctx.fillStyle = "#fff";
      ctx.drawImage(img.icon_money,40,5);
      ctx.drawImage(Q.happiness>=60?img.icon_happiness1:img.icon_happiness2,340,5);
      ctx.drawImage(img.icon_relationships,640,5);
      ctx.fillText(': '+Q.money+'$',40+60,10);
      ctx.fillText(': '+Q.happiness+'%',340+60,10);
      ctx.fillText(': '+Q.relationships+'%',640+60,10);
    },
  }
  ,setGameOver(){
    G.state='end';
    G.saveScore();
  }
  ,resizeCan(){
    if(G.needResize){
      var w = window.innerWidth;
      var h = window.innerHeight;
      if(w/h>W/H){
        var wh = (w/h) / (W/H);
        can.height = H;
        can.width = Math.floor(W*wh);
      }
      else {
        var wh = (h/w) / (H/W);
        can.width = W;
        can.height = Math.floor(H*wh);
      }
      cx=Math.floor((can.width-W)/2); //alert(cx);
      cy=Math.floor((can.height-H)/2);
      cw=can.width; ch=can.height;
      G.needResize = false;
    }
  }
  ,PlaySound(s){
    if(G.sound){
      stopSound(s)
      playSound(s)
    }
  }
};

function _percent(p){
  return p>=irandom(100)+1;
}

const Month = {
  save:{money:0, money_back:0, percent:0, active:false}, invest:{money:0, money_back:0, percent:0, active:false}
  ,reset(){
    Month.save={money:0, money_back:0, percent:0, active:false};
    Month.invest={money:0, money_back:0, percent:0, active:false};
  }
};
const Default_State = {money:1000, happiness:70, relationships:70};
const Q = {
  repeat:{a1:0,a2:0,a3:0,a4:0,a5:0,a6:0,a7:0,a8:0}, money:0, happiness:0, relationships:0, action_left:0, cards:[]
  ,start(){
    Q.repeat={a1:0,a2:0,a3:0,a4:0,a5:0,a6:0,a7:0,a8:0};
    Q.money=Q.start_money=Default_State.money;
    Q.happiness=Q.start_happiness=Default_State.happiness;
    Q.relationships=Q.start_relationships=Default_State.relationships;
    Q.round_i=0;
    Q.action_left=2;
    Q.new_cards_set();
    Month.reset();
  }
  ,active_card(i){
    var c=Q.cards[i];
    if(!c.active && Q.action_left>0 && Q.cost[c.type]<=Q.money){
      Q.action_after_active[c.type]();
      Q.action_left--;
      c.active=true;
      if(Q.happiness>100) Q.happiness=100;
      if(Q.relationships>100) Q.relationships=100;
      G.PlaySound(snd_true);
    }
    else {
      G.PlaySound(snd_false);
    }
  }
  ,save_money(){
    var m=G.popup_money;
    Month.save={money:m, money_back:Math.floor(m*1.1), percent:10, active:true};
    Q.money-=m;
    G.popup=false;
  }
  ,invest_money(){
    var m=G.popup_money, percent=(irandom(15)-5+Q.repeat.a6*5);
    Month.invest={money:m, money_back:Math.floor(m*(1+percent/100)), percent:percent, active:true};
    Q.money-=m;
    G.popup=false;
  }
  ,action_after_active:{
    a1(){Q.money-=250; Q.relationships+=40; Q.repeat.a1++;},
    a2(){Q.money-=150; Q.happiness+=15; Q.relationships+=15; Q.repeat.a2++;},
    a3(){Q.happiness+=5; Q.relationships+=15; Q.repeat.a3++;},
    a4(){Q.happiness+=10; Q.relationships+=10; Q.repeat.a4++;},
    a5(){
      // input # monet to save.... money+=10% next month
      Q.repeat.a5++;
      G.popup=true;
      G.popup_type='a5';
      G.popup_money=0;
    },
    a6(){Q.repeat.a6++;},
    a7(){
      // input # monet to invest.... money = money(-95% to 110%) * (1 + (0.05*Q.repeat.a6)) next month
      Q.repeat.a7++;
      G.popup=true;
      G.popup_type='a7';
      G.popup_money=0;
    },
    a8(){Q.money+=200+irandom(200); Q.repeat.a8++;},
  }
  ,cost:{
    a1:250,
    a2:150,
    a3:0,
    a4:0,
    a5:0,
    a6:0,
    a7:0,
    a8:0,
  }
  ,end_month(){
    G.state = 'month_end';
    if(Month.save.active) Q.money+=Month.save.money_back;
    if(Month.invest.active) Q.money+=Month.invest.money_back;
  }
  ,next_month(){
    if(Q.round_i<12-1){
      Q.round_i++;
      Q.money+=200;
      Q.happiness-=5; if(Q.happiness<0) Q.happiness=0;
      Q.relationships-=5; if(Q.relationships<0) Q.relationships=0;
      Q.start_money=Q.money;
      Q.start_happiness=Q.happiness;
      Q.start_relationships=Q.relationships;
      Q.action_left=2;
      Month.reset();
      Q.new_cards_set();
      G.state = 'month_start';
    }
    else {
      G.state = 'end';
    }
  }
  ,new_cards_set(){
    var cards=[];
    // action 1
    if(_percent(20+1*Q.repeat.a6)) cards.push('a7');
    else cards.push('a5');
    // action 2
    if(_percent(80-20*Q.repeat.a6)) cards.push('a6');
    else cards.push(choose([cards[0]=='a7'?'a5':'a7','a8']));
    // action 3 an 4
    var ar1=['a1','a2','a3','a4'],i;
    i=irandom(3); cards.push(ar1.splice(i,1)[0]);
    i=irandom(2); cards.push(ar1.splice(i,1)[0]);
    // final step
    for (var i = 0; i < 4; i++) cards[i] = Q.build_card(cards[i]);
    Q.cards=cards;
  }
  ,build_card(c){
    switch (c) {
      case 'a1': return {type:c, active:false, i:irandom(2)};
      case 'a2': return {type:c, active:false, i:irandom(1)};
      case 'a3': return {type:c, active:false};
      case 'a4': return {type:c, active:false, i:irandom(3)};
      case 'a5': return {type:c, active:false};
      case 'a6': return {type:c, active:false};
      case 'a7': return {type:c, active:false};
      case 'a8': return {type:c, active:false, i:irandom(1)};
    }
  }
}

const Months=[
  "January",
  "Feburary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

var Sound_arr=[];
var snd_true = loadSound(PATH+"snd_true.wav");
var snd_false = loadSound(PATH+"snd_false.wav");
var snd_confirm = loadSound(PATH+"snd_confirm.wav");
var music1 = loadSound(PATH+"music1.mp3");

var Img_arr=[];
var img = {
  title:newImage('title.png'),
  btn_play:newImage('btn_play.png'),
  btn_play_again:newImage('btn_play_again.png'),
  btn_addall:newImage('btn_addall.png'),
  btn_add2:newImage('btn_add2.png'),
  btn_add3:newImage('btn_add3.png'),
  btn_suball:newImage('btn_suball.png'),
  btn_sub2:newImage('btn_sub2.png'),
  btn_sub3:newImage('btn_sub3.png'),
  confirm:newImage('confirm.png'),

  end_round:newImage('end_round.png'),
  card:newImage('card.png'),
  card_active:newImage('card_active.png'),
  bg1:newImage('bg1.png'), bg2:newImage('bg2.png'),
  btn_fs:newImage('btn_fs.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  symbol:{
    a1:[newImage('symbol_a1_0.png'),newImage('symbol_a1_1.png'),newImage('symbol_a1_2.png')],
    a2:[newImage('symbol_a2_0.png'),newImage('symbol_a2_1.png')],
    a3:newImage('symbol_a3.png'),
    a4:[newImage('symbol_a4_0.png'),newImage('symbol_a4_1.png'),newImage('symbol_a4_2.png'),newImage('symbol_a4_3.png')],
    a5:newImage('symbol_a5.png'),
    a6:newImage('symbol_a6.png'),
    a7:newImage('symbol_a7.png'),
    a8:[newImage('symbol_a8_0.png'),newImage('symbol_a8_1.png')],
  },

  icon_happiness1:newImage('icon_happiness1.png'),
  icon_happiness2:newImage('icon_happiness2.png'),
  icon_money:newImage('icon_money.png'),
  icon_relationships:newImage('icon_relationships.png'),

};

function timer_loop(){
  var a = setInterval(function () {
    clearInterval(a);
    if(G.isReady) G.loop();
    else G.check_if_all_loaded();
    /* Mouse */Mouse.Update();
    timer_loop();
  }, 30);
}
timer_loop();
