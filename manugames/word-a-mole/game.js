const can = document.getElementById("canvas");
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
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1);
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); if (!sys.MScolling) event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;

const G = {
  isReady:false, state:"main", sound:true, cate:1, score:0, maxScore:0, lvl:0, time:0, totol_find:0, needResize:true
  ,newGame(i){
    G.score = 0; sy=400;
    G.loadLevel(i);
	if(G.sound) playMusic(music1);
  }
  ,loadLevel(i){
    G.lvl=i;
    G.state='game';
    var lvl=G.getLevel(i), n=lvl.hole_cnt, a = G.randomHogArray(n);
    Level = lvl;
    hog_arr = [];
    for (var i = 0; i < n; i++) {
      hog_arr.push(new Hog_class(a[i].x, a[i].y));
      hog_arr[i].time+=10*i;
    }
    hog_arr.sort((a, b) => {return a.y - b.y;});
    //// {hole_cnt:2, find:3},
    G.time = 0; G.totol_find = 0;
  }
  ,getLevel(i){
    if(i>=Levels.length) return Default_Level;
    return Levels[i];
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.isReady=true;
    G.resizeCan();
    //G.newGame(0);
  }
  ,loop(){
    G.resizeCan();
    if(G.state == 'main') G.drawMain();
    else if(G.state == 'game') G.drawGame();
    else if(G.state == 'end') G.drawEnd();
    // top right buttons
    if(DrawBtn2(W-50, H-45, 40, 40, img.btn_fs) && Mouse.Down('Left')) sys.swithFullscreen();
    if(DrawBtn2(W-100, H-45, 40, 40, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left')){
      G.sound=!G.sound;
      if(G.sound) playMusic(music1);
      else stopSound(music1);
    }

    mctx.fillStyle = '#00a758'; // canvas background color
    mctx.fillRect(0,0,cw,ch);
    mctx.drawImage(can2,cx,cy);
  }
  ,drawBG(){
    ctx.drawImage(img.sky, 0, 0, W, H);
    ctx.drawImage(img.bg, 0, sy);
     ctx.textBaseline = "top"; ctx.font = "normal 40px font1"; ctx.fillStyle = "#1e174e";
     ctx.textAlign = "left"; ctx.fillText("Score: "+G.score, 20, 10); ctx.fillText("Find: "+G.totol_find+"/"+Level.find, 20, 50);
     ctx.textAlign = "center"; ctx.fillText("Level: "+(G.lvl+1), W/2-50, 10);
     ctx.textAlign = "right" ;ctx.fillText("Hit the names of "+Word.list[G.cate], W-20, 10);
  }
  ,drawMain(){
    var mld = Mouse.Down('Left'), w2=W/2;
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = "normal 40px font1"; ctx.fillStyle = "#fff";
    ctx.drawImage(img.main_bg, 0, 0, W, H);
    ctx.fillText('Max Score: '+G.maxScore,800,280);
    ctx.drawImage(img.lets_play, w2-132, 50);
    if(DrawBtn(w2,150,200,200,img.play) && mld) G.newGame(0);

    if(DrawSwitch(w2-210,400,200,75,img.btn1, G.cate==0) && mld) G.cate=0;
    if(DrawSwitch(w2,400,200,75,img.btn2, G.cate==1) && mld) G.cate=1;
    if(DrawSwitch(w2+210,400,200,75,img.btn3, G.cate==2) && mld) G.cate=2;
  }
  ,drawGame(){
    G.drawBG();
    var ha = hog_arr, i, j=-1, len = ha.length, cate=G.cate, mld = Mouse.Down('Left');
    for(i = 0; i < len; i++){
      ha[i].update();
      ha[i].draw();
    }
    for(i = 0; i < len; i++){
      if(ha[i].draw_hog() && mld) j=i;
    }
    if(j!=-1){
      i=j;
      ha[i].clicked = true;
      if(cate== ha[i].hog.w_i){
        G.score+=10;
        G.time-=90;
        if(G.time<0) G.time=0;
        G.totol_find++;
        ha[i].currect = true;
        ha[i].hideHog();
        G.PlaySound(snd_true);
      }
      else {
        G.score-=5;
        if(G.score<0) G.score=0;
        G.time+=45;
        if(G.time>2000) G.time=2000;
        ha[i].currect = false;
        G.PlaySound(snd_false);
      }
    }
    //ctx.drawImage(img.main_bg, 0, 0, W, H);
    var t = G.time,tt=2000;
    ctx.globalAlpha = 0.3; ctx.fillRect(30,525,800,10);
    ctx.globalAlpha =   1; ctx.fillRect(30,525,800-(800)*(t/tt),10);

    if(G.totol_find>=Level.find){
      if(sy==0) G.PlaySound(snd_win);
      if(sy<400) sy+=20;
      else {
        G.loadLevel(++G.lvl);
      }
    }
    else {
      if(sy>0) sy-=20;
      if(t<tt) G.time+=1.6+(G.lvl*0.15); // timer tick speed
      else {
        G.setGameOver();
      }
    }
  }
  ,drawEnd(){
    var mld = Mouse.Down('Left'), w2=W/2;
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = "normal 70px font1"; ctx.fillStyle = "#fff";
    ctx.drawImage(img.main_bg, 0, 0, W, H);
    ctx.drawImage(img.times_up, w2-125, 50);
    ctx.fillText('Your Score: '+G.score,w2,180);
    ctx.fillText('Max Score: '+G.maxScore,w2,280);

    if(DrawBtn(w2,400,200,75,img.btn_back, G.cate==1) && mld) G.state='main';
  }
  ,setGameOver(){
    G.state='end';
    G.saveScore();
  }
  ,randomHogArray(n){
    var y = 190, w = W-250, h = H-110-y, a = [],i,j, tc = 0;
    for(i = 0; i < n; i++){
      var nx = irandom(w);
      var ny = y+irandom(h);
      a.push({x:nx, y:ny});
    }
    for(i = 0; i < n; i++){
      for(j = 0; j < n; j++){
        if(i==j) continue;
        if(ImageMeetImage(a[i].x, a[i].y, 220, 140, a[j].x, a[j].y, 220, 140)) break;
        //if(point_distance(a[i].x, a[i].y, a[j].x, a[j].y) <=200 || ) break;
      }
      if(j < n){
        var nx = irandom(w);
        var ny = y+irandom(h);
        a[i].x = nx;
        a[i].y = ny;
        //alert(JSON.stringify(a));
        i--;
        if(++tc == 100) return G.randomHogArray(n);
      }
    }
    return a;
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
  ,loadScore(){
    var s = localStorage.getItem("word1_score");
    if(s!=undefined){
      G.maxScore = parseInt(s);
    }
  }
  ,saveScore(){
    if(G.score>G.maxScore){
      G.maxScore=G.score;
      localStorage.setItem("word1_score", G.score);
    }
  }
  ,PlaySound(s){
    if(G.sound){
      stopSound(s)
      playSound(s)
    }
  }
};
G.loadScore();
const Word = {
  list:['Fruit','Colors','Drinks']
  ,Fruit:['Apple','Watermelon','Pear','Cherry','Strawberry','Starfruit','Grape','Mango','Blueberry','Pomegranate','Durian','Plum','Banana','Raspberry','Mandarin','Jackfruit','Papaya','Kiwi','Pineapple','Lemon','Apricot','Grapefruit','Melon','Coconut','Avocado','Peach']
  ,Colors:['Black','Silver','Gray','White','Scarlet','Maroon','Red','Purple','Pink','Green','Brown','Olive','Yellow','Navy','Blue','Teal','Aqua','Cyan']
  ,Drinks:['Water','Milk','Coke','Coffee','Apple Juice','Orange Juice','Grape Juice','Chocolate Milk','Soy Milk','Tea','Lemon Tea','Milk Tea','Hot Chocolate','Milkshake','Energy Drink','Wine','Beer','Lemonade','Fruit Punch']
};

// , , , , , , , ,

var hog_arr=[];
class Hog_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.state='idle';
    h.clicked=false;
    h.currect=false;
    h.time=50+irandom(20);
    ///
    h.h_i=irandom(4);
    h.hog = {
      t:0,
      w_i:0,
      w:0,
      i:0,
      m_i:irandom(1),
    }
    /// canvas
    h.can=document.createElement("canvas");
    h.can.width=135; h.can.height=177;
    h.ctx=h.can.getContext("2d");
    h.ctx.textAlign = "center"; h.ctx.textBaseline = "middle"; h.ctx.font = "normal 30px font1"; h.ctx.fillStyle = "#000";
  }
  update(){
    var h = this;
    if(h.state=='idle'){
      if(--h.time<=0){
        h.showHog();
      }
    }
    else if(h.state=='show'){
      if(--h.time<=0){
        //h.time=30+irandom(10);
        h.hideHog();
      }
    }
    else if(h.state=='hide'){
      if(--h.time<=0){
        h.time=30+irandom(30);
        h.state='idle';
      }
    }
  }
  showHog(){
    var h = this, hh=h.hog;
    hh.w_i = (hh.w_i+irandom(2353253278081))%3; // get random catagory index
    var wl = Word.list[hh.w_i];
    hh.i = irandom(Word[wl].length-1);
    hh.w =  Word[wl][hh.i];
    hh.t=0;
    hh.m_i=irandom(2);
    h.state = 'show';
    h.clicked=false;
    h.time=90+irandom(30);
  }
  hideHog(){
    var h = this, hh=h.hog;
    //hh.t=0;
    h.state = 'hide';
    h.time=30;
  }
  draw(){
    var h = this, x=h.x, y=h.y;
    ctx.drawImage(img.hole[h.h_i],x,y+sy);
  }
  draw_hog(){
    var h = this, hh=h.hog, x=h.x+55, y=h.y-90, state=h.state, hover=false;
    h.ctx.clearRect(0, 0, 135, 177);
    var y1 = (hh.t)/20*177;
    if(state=='show'){
      h.ctx.drawImage(img.hog[h.hog.m_i],0,177-y1);
      h.ctx.drawImage(img.text_box,2,177-y1+90);
      h.ctx.fillText(hh.w,66,177-y1+115,124);
      if(hh.t<20) hh.t++;
      if(h.clicked) h.ctx.drawImage(img[h.currect?'s_true':'s_false'],0,177-y1);
      else if(Mouse.Square(x, y+177-y1+sy, 133, 177-(177-y1))) hover=true;
    }
    else {
      if(state=='hide'){
        h.ctx.drawImage(img.hog[h.hog.m_i],0,177-y1);
        h.ctx.drawImage(img.text_box,2,177-y1+90);
        h.ctx.fillText(hh.w,66,177-y1+115,124);
        if(hh.t>=0) hh.t--;
        if(h.clicked) h.ctx.drawImage(img[h.currect?'s_true':'s_false'],0,177-y1);
        else if(Mouse.Square(x, y+177-y1+sy, 133, 177-(177-y1))) hover=true;
      }
    }
    //h.ctx.fillText(state,60,20);
    h.ctx.drawImage(img.hole_top,0,127);
    ctx.drawImage(h.can,x,y+sy);
    return hover;
  }
}

const Default_Level = {hole_cnt:6, find:30}; var Level;
const Levels = [
  {hole_cnt:3, find:3},
  {hole_cnt:4, find:5},
  {hole_cnt:5, find:10},
  {hole_cnt:6, find:15},
  {hole_cnt:6, find:20},
  {hole_cnt:6, find:25},
];

var Sound_arr=[];
var snd_true = loadSound("snd_true.wav");
var snd_false = loadSound("snd_false.wav");
var snd_win = loadSound("snd_win.wav");
var music1 = loadSound("music1.mp3");

var Img_arr=[];
var img = {
  sky:newImage('sky.png'),
  bg:newImage('bg.png'),
  btn1:newImage('btn1.png'),
  btn2:newImage('btn2.png'),
  btn3:newImage('btn3.png'),
  btn_back:newImage('btn_back.png'),
  lets_play:newImage('lets_play.png'),
  play:newImage('play.png'),
  main_bg:newImage('main_bg.png'),
  times_up:newImage('times_up.png'),
  hole_top:newImage('hole_top.png'),
  text_box:newImage('text_box_2-01.png'),
  s_true:newImage('s_true.png'),
  s_false:newImage('s_false.png'),

  btn_fs:newImage('btn_fs.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),

  hog:[newImage('hog1'), newImage('hog2.png'), newImage('hog3.png')],
  hole:[newImage('hole1.png'), newImage('hole2.png'), newImage('hole3.png'), newImage('hole4.png'), newImage('hole5.png')],
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
