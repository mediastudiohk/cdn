const can = canvas;
const mctx = can.getContext("2d");
const W=960;
const H=540;

const can2 = document.createElement("canvas");
can2.width = W; can2.height = H;
const ctx = can2.getContext("2d");

function resizeCan(){G.needResize=true;}
window.onresize = resizeCan;

can.addEventListener("mousemove", function () { Mouse.MouseMove(event, false) }, !1);
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1);
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); if (!sys.MScolling) event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;

var tab=[], vx=130, vy=50, sc={x1:0,y1:0,x2:0,y2:0}, lvl, lvl_i, money=0, time=0, prizes=[], obj_end={}, o_check_win={};
const G = {
  isReady:false, state:"main", state2:"idle", sound:true, bg_y:0 , attempt:0, needResize:true
  ,newGame(i){
    money=0;
    prizes=[];
    G.newLevel(i);
    if(G.sound){ stopSound(sound.music1); playMusic(sound.music1);}
  }
  ,nextLevel(){
    if(++lvl_i<Levels.length) G.newLevel(lvl_i);
    else G.set_game_end();
  }
  ,newLevel(i){
    lvl=Levels[i];
    lvl_i=i;
    G.newTab();
    var na = shuffle([...lvl.items]), len=(lvl.h*lvl.w)/2;
    for (var i = 0; i < len; i++) {
      //////// 1
      do {
        x = irandom(lvl.w-1);
        y = irandom(lvl.h-1);
        //alert("i1: "+i+"\nx:"+x+"\ny:"+y);
      } while (tab[y][x].n!=-1);
      tab[y][x].n=na[i]; draw_in_card(tab[y][x].c, img.card_face, na[i]);
      //////// 2
      do {
        x = irandom(lvl.w-1);
        y = irandom(lvl.h-1);
      } while (tab[y][x].n!=-1);
      tab[y][x].n=na[i]; draw_in_card(tab[y][x].c, img.card_face, na[i]);
    }
    ////////////
    G.state='game';
    G.state2='idle';
    G.attempt=0;
    sc.x1=sc.y1=sc.x2=sc.y2=-1;
    time=0;
    Test_Progress.clear();
    Prize_Box.clear();
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.isReady=true;
    //G.newGame(0);
  }
  ,newTab(){
    var x, y; tab=[]
    for(y = 0; y < lvl.h; y++){
      tab[y]=[];
      for(x = 0; x < lvl.w; x++){
        tab[y][x]= new new_card(x,y);
      }
    }
  }
  ,loop(){
    G.resizeCan();
    G.drawBG();
    if(G.state == 'game') G.drawGame();
    else if(G.state == 'main') G.drawMain();
    else if(G.state == 'end') G.drawEnd();
    //else if(G.state == 'main') G.drawMain();

    // top right buttons
    if(DrawBtn(W-50, H-45, 40, 40, img.btn_fs) && Mouse.Down('Left')) sys.swithFullscreen();
    if(DrawBtn(W-100, H-45, 40, 40, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left')){
      G.sound=!G.sound;
      if(G.sound){ stopSound(sound.music1); playMusic(sound.music1);}
      else stopSound(sound.music1);
    }

    mctx.fillStyle = 'Black';
    mctx.fillRect(0,0,cw,ch);
    mctx.drawImage(can2,cx,cy);
  }
  ,drawMain(){
    ctx.drawImage(img.title, (W-500)/2, 50);
    if(DrawBtn(W/2, 350, 300, 100,img.btn_play) && Mouse.Down('Left')) G.newGame(0);
  }
  ,drawGame(){
    ctx.textBaseline = "top"; ctx.font = "bold 30px font1"; ctx.fillStyle = "#000";
    ctx.textAlign = "left"; ctx.fillText("Money: "+money,160,10);
    ctx.textAlign = "right"; ctx.fillText("The total number of tries: "+G.attempt,W-25,10);
    ctx.textAlign = "center"; ctx.fillText("Level: "+(lvl_i+1),W/2,10);
    var x, y, i, j, len, d;
    if(G.state2=='idle'){
      for(y = 0; y < lvl.h; y++) for(x = 0; x < lvl.w; x++) if(tab[y][x].clicked() && tab[y][x].state=='idle') G.select_card(x,y);
    }
    else if(G.state2=='check'){
      if(++G.time>=40){
        var {x1,y1,x2,y2} = sc;
        if(tab[y1][x1].n==tab[y2][x2].n){
          G.state2='idle';
          Test_Progress.add_item(tab[y1][x1].n);
          tab[y1][x1].set_score(); tab[y2][x2].set_score();
          G.PlaySound(sound.score);
          G.check_win();
        }
        else {
          G.state2='wait';
          G.time=30;
          tab[y1][x1].hide(); tab[y2][x2].hide();
          G.PlaySound(sound.flip_back);
        }
        sc.x1=sc.y1=sc.x2=sc.y2=-1;
      }
    }
    else if(G.state2=='wait') if(--G.time<=0) G.state2='idle';
    Test_Progress.draw();

    for(y = 0; y < lvl.h; y++) for(x = 0; x < lvl.w; x++) tab[y][x].draw();
    Prize_Box.draw();
    if(G.state2!='win'){ time+=30/1000;  G.draw_time_and_stars();}
  }
  ,draw_time_and_stars(){
    var y=150;
    ctx.textAlign = "center"; ctx.fillStyle = "#000";
    ctx.fillText(G.get_time(Math.floor(time)),800,y+60);
    var i, len=0;
    if(time<=60) len=3;
    else if(time<=90) len=2;
    else if(time<=120) len=1;
    for(i = 0; i < len; i++) ctx.drawImage(img.star1,740+40*i,y+90)
    for(; i < 3; i++) ctx.drawImage(img.star2,740+40*i,y+90)
    ctx.drawImage(img.rules,680,y+140)
  }
  ,draw_time_and_stars_end(){
    var y=0, x=680, o=o_check_win;
    if(G.state2=='win' && DrawBtn(x, 350, 300, 100,img.next) && Mouse.Down('Left')){
      if(o.win) G.nextLevel();
      else G.set_game_end();
    }
    //ctx.textAlign = "center"; ctx.fillText("Money: $"+score,W/2,10);
    ctx.textAlign = "center";  ctx.fillStyle = "#000"; ctx.textBaseline = "top"; ctx.font = "bold 30px font1";
    ctx.fillText(G.get_time(Math.floor(time)),x,y+60);
    ctx.fillText("Level Reward: $"+o.level_reward,x,y+150);
    ctx.fillText("Time Interest: $"+o.time_interest,x,y+150+40);
    ctx.fillStyle = "red"; ctx.fillText("Item Cost: $"+o.item_cost,x,y+150+40*2);
    ctx.fillStyle = "#000"; ctx.fillText("Total money: $"+money,x,y+150+40*3);
    if(!o.win){ ctx.fillStyle = "red"; ctx.fillText("There isn't enough money to buy",x,y+150+40*4);}


    var i, len=o.stars;
    for(i = 0; i < len; i++) ctx.drawImage(img.star1,x-60+40*i,y+90)
    for(; i < 3; i++) ctx.drawImage(img.star2,x-60+40*i,y+90)
  }
  ,drawEnd(){
    ctx.fillStyle = "#fff";
    //ctx.fillRect(0,0,W,H);
    ctx.drawImage(img.win_bg,0,0,W,H);
    var o=obj_end, p=o.prizes, w2=W/2;
    ctx.drawImage(img.kid1,100,100+o.kid.y)
    ctx.drawImage(img.kid2,650,100+o.kid.y)
    if(o.kid.y!=0){
      o.kid.y=o.kid.y*0.95;
      if(o.kid.y<=0.5) o.kid.y=0;
    }
    var aa=[{x:-130, y:0}, {x:0, y:-100}, {x:130, y:0}, {x:0, y:100}];
    for (var i = 0, len=p.length; i < len; i++) {
      ctx.drawImage(p[i].m, w2+aa[i].x-75, p[i].y+aa[i].y+150,150,150);
      if(p[i].y!=0){
        p[i].y=p[i].y*0.95;
        if(p[i].y<=0.5) p[i].y=0;
      }
    }
    if(obj_end.time>0) obj_end.time--;
    else {
      if(DrawBtn(w2, 420, 300, 100,img.btn_play_again) && Mouse.Down('Left')) G.newGame(0);
      ctx.textAlign = "center";  ctx.fillStyle = "#000"; ctx.textBaseline = "top"; ctx.font = "bold 30px font1";
      ctx.fillText("Total money: $"+money,w2, 20);
    }
  }
  ,set_game_end(){
    G.state='end';
    obj_end.kid={y:1000}
    obj_end.prizes=[];
    for (var i = 0, len=prizes.length; i < len; i++) {
      obj_end.prizes.push({y:1300+500*i, m:prizes[i]})
    }
    obj_end.time=50;
    G.PlaySound(sound.win);
  }
  ,get_time(t){
    var s = t%60,m = Math.floor(t/60);
    if(s < 10)s = '0'+s; if(m < 10)m = '0'+m;
    return m+":"+s;
  }
  ,check_win(){
    var x, y, win=true, cnt=0;
    for(y = 0; y < lvl.h; y++) for(x = 0; x < lvl.w; x++) if(tab[y][x].state!='score') win=false;
    if(win){
      var o = {level_reward:0, time_interest:0, item_cost:lvl.item_cost, win:false};
      G.state2='win';
      Prize_Box.active=true;
      var i, len=0;
      if(time<=60) len=3;
      else if(time<=90) len=2;
      else if(time<=120) len=1;
      o.stars=len;
      switch (len) {
        case 3: o.level_reward=1000; o.time_interest=800; break;
        case 2: o.level_reward=1000; o.time_interest=500; break;
        case 1: o.level_reward=1000; o.time_interest=0; break;
      }
      money+=o.level_reward+o.time_interest;
      if(money>=o.item_cost){
        o.win=true;
        money-=o.item_cost;
        prizes.push(Prize_Box.prize_img);
      }
      G.PlaySound(sound.win);
      o_check_win=o;
    }

  }
  ,select_card(x,y){
    tab[y][x].active();
    if(sc.x1==-1){
      G.PlaySound(sound.flip1);
      sc.x1=x; sc.y1=y;
    }
    else {
      G.PlaySound(sound.flip2);
      sc.x2=x; sc.y2=y;
      G.state2='check';
      G.time=0;
      G.attempt++;
    }
  }
  ,drawBG(){
    ctx.drawImage(img.bg1, 0, 0, W, H);
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
      stopSound(s);
      playSound(s);
    }
  }
};

const Test_Progress = {
  x:0, percent:0, total:0, len:0, items:[]
  ,clear(){
    var t=this;
    t.x=-140;
    t.percent='0%';
    t.total=0;
    t.len=lvl.items.length;
    t.items=[];
  }
  ,add_item(i){
    var t=this, total=t.total+1, len=t.len;
    var percent=total/len;
    t.items.push({y:1-percent, percent:Math.round(percent*100)+'%', i:i});
    t.total+=1;
    t.percent=Math.round(percent*100)+'%';
  }
  ,draw(){
    var t=this,i, len, x, y, ts=400, xx=t.x, it=t.items;
    ctx.drawImage(img.left_bg,xx,0);
    ctx.fillStyle='white'; ctx.fillRect(xx+10,88,50,ts+4);
    ctx.fillStyle='#054da2'; ctx.fillRect(xx+12,90+ts,46,-ts*(t.total/t.len));
    ctx.textAlign = "left"; ctx.fillStyle='white'; ctx.font = "26px font1";
    for(i = 0, len=it.length; i < len; i++){
      x = xx+20; y=90+it[i].y*ts;
      ctx.drawImage(img.items[it[i].i],x,y,30,30)
      ctx.fillText(it[i].percent,x+45,y);
    }
    ctx.fillText(t.percent,xx+10,95+ts);

    if(xx<0) t.x+=5;
  }
};

const Prize_Box = {
  x:0, y:0, w:0, i:0, active:false, show:false
  ,clear(){
    var t=this;
    t.x=720;
    t.y=130;
    t.w=100;
    t.i=0;
    t.active=false;
    t.show=false;
    var r=lvl.reward;
    t.prize_img=img[r[irandom(r.length-1)]];
  }
  ,add_item(i){
    var t=this, total=t.total+1, len=t.len;
    var percent=total/len;
    t.items.push({y:1-percent, percent:Math.round(percent*100)+'%', i:i});
    t.total+=1;
    t.percent=Math.round(percent*100)+'%';
  }
  ,draw(){
    var t=this, w=t.w, w2=w/2, o=o_check_win;
    if(!t.active){
      ctx.drawImage(img.money_target,700,80);
      ctx.textAlign = "center";  ctx.fillStyle = "#000"; ctx.fillText('$'+lvl.item_cost,850,140);

      if(time<=120)ctx.drawImage(img['prize_box'+(lvl_i+1)],t.x-w2,t.y-w2,w,w);
    }
    else {
      if(!t.show){
        ctx.globalAlpha = t.i/40;
        ctx.drawImage(img.win_bg,0,0,W,H);
        ctx.globalAlpha = 1;
        if(o.win){
          var nw1=(W-400)/2;
          var dis = point_distance(t.x,t.y,nw1,H/2), dir = point_direction(t.x,t.y,nw1,H/2);
          if(dis>10){
            t.x += 10 * Math.cos(Math.PI / 180 * dir);
            t.y += 10 * Math.sin(Math.PI / 180 * dir);
          }
          else {t.x=nw1;t.y=H/2;}
          if(t.w<512) t.w+=10;
          if(time<=120)ctx.drawImage(img['prize_box'+(lvl_i+1)],t.x-w2,t.y-w2,w,w);
        }
        if(t.i<40) t.i+=1;
        else{ t.show=true; t.i=0;}
      }
      else {
        ctx.drawImage(img.win_bg,0,0,W,H);
        if(o.win){
          ctx.globalAlpha = t.i/10;
          ctx.drawImage(t.prize_img,t.x-150,t.y-150,300,300);
          ctx.globalAlpha = 1-t.i/10;
          ctx.drawImage(img['prize_box'+(lvl_i+1)],t.x-w2,t.y-w2,w,w);
        }
        if(t.i<10) t.i+=1;
        else G.draw_time_and_stars_end();
        ctx.globalAlpha = 1;
      }
    }
  }
};

class new_card {
  constructor(x,y) {
    var m = document.createElement("canvas"), c = m.getContext("2d"), d=this;
    m.width=m.height=100;
    c.textAlign = "center"; c.textBaseline = "middle"; c.font = "60px font1"; c.fillStyle = "#000";
    d.c=c;
    d.m=m;
    d.x=x*110+vx;
    d.y=y*110+vy;
    d.n=-1;
    d.txt='';
    d.state='idle'
    d.i=0;
  }
  clear(){
    var d=this;
    d.n=0;
    d.state='idle'
    d.i=0;
  }
  clicked(){
    var d=this;
    return Mouse.Square(d.x,d.y,100,100) && Mouse.Down('Left');
  }
  active(){
    var d=this;
    d.state='active'
    d.i=0;
  }
  set_score(){
    var d=this;
    d.state='score';
    draw_in_card(d.c,img.card_completed,d.n);
    //score+=Items_Prize[d.n];
  }
  hide(){
    var d=this;
    d.state='hide'
    d.i=40;
  }
  draw(){
    var d=this, s=d.state, i=d.i;
    if(s=='idle'){
      ctx.drawImage(img.card_hover, d.x, d.y, 100, 100);
      //ctx.drawImage(d.m, d.x, d.y, 100, 100);
    }
    else if(s=='active'){
      var m1=10, m2=m1*2, x,y,w,img1,img2;
      if(i<m1){ y=-i; w=100*(1-i/m1); x=(100-w)/2; img1=img.card_hover; img2=d.m;}
      else { y=-(m2-i); w=100*(1-i/m1); x=(100-w)/2; img1=d.m; img2=img.card_hover;}
      ctx.globalAlpha=(m1+y)/m2+0.1;
      ctx.drawImage(img2, d.x+x, d.y+y/2, w, 100);
      ctx.globalAlpha=1;
      ctx.drawImage(img1, d.x+x, d.y+y*2, w, 100);
      if(i<m2) d.i++;
    }
    else if(s=='hide'){
      var m1=20, m2=m1*2, x,y,w,img1,img2;
      if(i<m1){ y=-i; w=100*(1-i/m1); x=(100-w)/2; img1=img.card_hover; img2=d.m;}
      else { y=-(m2-i); w=100*(1-i/m1); x=(100-w)/2; img1=d.m; img2=img.card_hover;}
      ctx.globalAlpha=(m1+y)/m2+0.1;
      ctx.drawImage(img2, d.x+x, d.y+y/2, w, 100);
      ctx.globalAlpha=1;
      ctx.drawImage(img1, d.x+x, d.y+y*2, w, 100);
      if(i>0) d.i--;
      else d.state='idle';
    }
    else if(s=='score'){
      ctx.drawImage(d.m, d.x, d.y, 100, 100);
    }
    //ctx.drawImage(d.m, d.x, d.y);
  }
}

function draw_in_card(c,m,n){
  var c=c, m2 = img.items[n];
  c.clearRect(0,0,100,100);
  c.drawImage(m,0,0,100,100);
  c.drawImage(m2,2,2);
  //c.fillText(txt,75,80);
}
function shuffle(a) { for (var c, d, b = a.length; 0 !== b;)d = Math.floor(Math.random() * b), b -= 1, c = a[b], a[b] = a[d], a[d] = c; return a }

const Levels = [
  {w:3,h:4, items:[0,1,2,3,4,5], item_cost:900, reward:['level1_1','level1_2','level1_3','level1_4']},
  {w:3,h:4, items:[0,1,2,3,4,5], item_cost:1200, reward:['level2_1','level2_2','level2_3','level2_4']},
  {w:4,h:4, items:[0,1,2,3,4,5,6,7], item_cost:1800, reward:['level3_1','level3_2','level3_3','level3_4']},
  {w:5,h:4, items:[0,1,2,3,4,5,6,7,8,9], item_cost:2800, reward:['level4_1','level4_2','level4_3','level4_4']},
];

var Sound_arr=[];
var sound={
  flip1:loadSound(PATH+"flip.wav"), flip2:loadSound(PATH+"flip.wav"),
  flip_back:loadSound(PATH+"flip_back.ogg"),
  score:loadSound(PATH+"score.mp3"),
  win:loadSound(PATH+"win.wav"),
  music1:loadSound(PATH+"music1.mp3"),
};
var Img_arr=[];
var img = {
  bg1:newImage('bg1.png'),
  left_bg:newImage('left_bg.png'),
  rules:newImage('rules.png'),
  kid1:newImage('kid1.png'), kid2:newImage('kid2.png'),
  prize_box1:newImage('prize_box1.png'),
  prize_box2:newImage('prize_box2.png'),
  prize_box3:newImage('prize_box3.png'),
  prize_box4:newImage('prize_box4.png'),
  money_target:newImage('money_target.png'),
  card_hover:newImage('card_hover.png'),
  card_face:newImage('card_face.png'),
  card_completed:newImage('card_completed.png'),
  btn_fs:newImage('btn_fs.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  btn_play_again:newImage('btn_play_again.png'),
  btn_play:newImage('btn_play.png'),
  title:newImage('title.png'),
  next:newImage('next.png'),
  star1:newImage('star1.png'), star2:newImage('star2.png'),
  items:[],
  level1_1:newImage('level1_1.png'), level1_2:newImage('level1_2.png'), level1_3:newImage('level1_3.png'), level1_4:newImage('level1_4.png'),
  level2_1:newImage('level2_1.png'), level2_2:newImage('level2_2.png'), level2_3:newImage('level2_3.png'), level2_4:newImage('level2_4.png'),
  level3_1:newImage('level3_1.png'), level3_2:newImage('level3_2.png'), level3_3:newImage('level3_3.png'), level3_4:newImage('level3_4.png'),
  level4_1:newImage('level4_1.png'), level4_2:newImage('level4_2.png'), level4_3:newImage('level4_3.png'), level4_4:newImage('level4_4.png'),
  win_bg:newImage('win_bg.png'),
};
for (var i = 1; i <= 10; i++) img.items.push(newImage('iteam_'+i+'.png'));

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
