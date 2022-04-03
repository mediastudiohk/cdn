const can = canvas;
const ctx = can.getContext("2d");

ctx.textBaseline = "top";
///////// tab
const tab = document.createElement("canvas");
tab.width=720; tab.height=730;
const tctx = tab.getContext("2d");
// flexible values
var W=1000;
var H=800;
var SZ = 48;
var X = 236;
var Y = 56;
var tab_x = tab_y = 10;
var tab_w = 720;
var tab_h = 730;
var btn_x = btn_y = btn_w = 50;
var fs = 30;
var inbox_w = 800;

can.addEventListener("mousemove", function () { Mouse.MouseMove(event, false) }, !1);
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1);
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); if (!sys.MScolling) event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;
/* Keyboard */can.onkeyup = function (e) { Keyboard.SetKeyUp(e.keyCode); e.preventDefault(); };
/* Keyboard */can.onkeydown = function (e) {  Keyboard.SetKeyDown(e.keyCode); e.preventDefault(); };

function resizeCan(){
  G.needResize=true;
}
window.onresize = resizeCan;

const G = {
  isReady:false, state:"main", stateMSG:"",bg_y:0,pu_obj:{},maxScore:0, needResize:true, sound:true
  ,newGame(i){
    G.LoadLevel(levels[i]);
    G.score=0;
    G.lvl=i;
    G.life=5;
    G.state='start';
    G.state_end='idle';
    if(G.sound) playMusic(music1);
  }
  ,LoadLevel(l){
    var b=[], c=[], m=[],x,y,v;
    var pu_arr = G.Create_powerup_array();
    G.pu_obj={};
    for(y=0;y<15;y++){
      b.push([]); c.push([]);
      for(x=0;x<15;x++){
        v=l[y][x];
        if(v==1){
          b[y].push(1);
          c[y].push(0);
        }
        else {
          b[y].push(0);
          if(v==0) c[y].push(1);
          else if(v==2){
            c[y].push(2);
            G.pu_obj['pu_'+y+'_'+x] = pu_arr.splice(irandom(pu_arr.length-1),1);
          }
          else c[y].push(0);

          if(v==3) G.player=new Human(x,y);
        }
      }
    }
    // necessary to not break the game
    b.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    c.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    //x:6-8  y:6
    m.push(new Monster(img.m1,40));
    m.push(new Monster(img.m2,80));
    m.push(new Monster(img.m3,120));
    m.push(new Monster(img.m4,160));
    G.b=b; G.c=c; G.m=m;
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.isReady=true;
    G.texture1 = ctx.createPattern(img.bg1, 'repeat');
    //G.newGame(2);
    //G.SetYouWin();
  }
  ,loop(){
    G.resizeCan();
    ctx.drawImage(img.bg0,0,0,W,H);
    if(G.state=="main")G.DrawMain();
    else if(G.state=="start")G.DrawGame();
    else if(G.state=="end")G.DrawEnd();
  }
  ,DrawMain(){
    var y = H*0.7;
    ctx.drawImage(img.mst_token,W/2-100,30,200,200);
    if(DrawBtn(W/2,y,412,112,img.btn_play) && Mouse.Down('Left')){
      G.newGame(0);
    }
  }
  ,DrawGame(){
    G.DrawBG();
    var x,y,b=G.b,c=G.c,m=G.m;
    G.Draw1();
    for(y=0;y<4;y++){
      m[y].update();
      m[y].draw();
    }
    G.player.update();
    G.player.draw();
    G.Draw2();
    G.player.draw_key();
  }
  ,DrawEnd(){
    G.DrawBG();
    var x,y,b=G.b,c=G.c,m=G.m;
    G.Draw1();
    for(y=0;y<4;y++){
      m[y].draw();
    }
    G.player.draw();
    G.Draw2();
    if(++G.time>=30){
      var w = tab_w, h = w*0.61, by = H*0.2+h*0.7;
      x = (W-w)/2;
      y = H*0.2;
      if(G.stateMSG=="You Lose"){
        if(G.life>0){
          for(y=0;y<4;y++) m[y].reset();
          G.player.reset();
          G.state="start";
        }
        else {
          ctx.drawImage(img.inbox_lose, x, y, w, h);
          if(G.time==30) G.saveScore();
          if(DrawBtn(W/2,by,220,64,img.btn_replay) && Mouse.Down('Left')){
            G.newGame(0);
          }
        }
      }
      else if(G.stateMSG=="You Win"){
        if(G.lvl<2){
          G.lvl++;
          G.state='start';
          G.LoadLevel(levels[G.lvl]);
        }
        else {
          ctx.drawImage(img.inbox_win, x, y, w, h);
          if(G.time==30) G.saveScore();
          if(DrawBtn(W/2,by,220,64,img.btn_replay) && Mouse.Down('Left')){
            G.newGame(0);
          }
        }
      }
      ctx.fillStyle='black'; ctx.font = "bold 20px arial";
      by = H*0.2+h*0.66;
      ctx.fillText("You saved: $"+G.score, W/2,by,220);
    }
  }
  ,DrawBG(){
    /*
    ctx.drawImage(img.table,X,Y);
    ctx.translate(X,Y+G.bg_y);
    ctx.fillStyle = G.texture1; ctx.fillRect(0,-G.bg_y,720,720);
    G.bg_y=(G.bg_y+.75)%98;
    ctx.resetTransform();
    */

    //
    tctx.drawImage(img.table,0,10);
    tctx.translate(0,G.bg_y);
    tctx.fillStyle = G.texture1; tctx.fillRect(0,-G.bg_y,720,730);
    G.bg_y=(G.bg_y+.75)%98;
    tctx.resetTransform();
  }
  ,Draw1(){
    var x,y,b=G.b,c=G.c;
    for(y=0;y<15;y++){
      for(x=0;x<15;x++){
        if(x==7&&y==5){ tctx.drawImage(img['door'], 7*SZ, 10+5*SZ); continue;}
        if(b[y][x]==1){
          tctx.drawImage(img['block2'], x*SZ, 10+y*SZ+38);
        }
        switch (c[y][x]) {
          case 1: tctx.drawImage(img["M"], x*SZ, 10+y*SZ); break;
          case 2: tctx.drawImage( img[G.pu_obj['pu_'+y+'_'+x]] , x*SZ, 10+y*SZ);  break;
        }
      }
    }
  }
  ,Draw2(){
    var x,y,b=G.b;
    for(y=0;y<15;y++){
      for(x=0;x<15;x++){
        if(x==7&&y==5){continue;}
        if(b[y][x]==1){
          tctx.drawImage(img['block'], x*SZ, 10+y*SZ-10);
        }
      }
    }
    ctx.fillStyle="white"; ctx.font = "bold "+fs+"px arial"; ctx.textBaseline = "middle"; ctx.textAlign = 'left';
    ctx.fillText("Score: $"+G.score, W*0.01, tab_y/2);
    ctx.textAlign='center';
    ctx.fillText("Level: "+(G.lvl+1), W/2, tab_y/2);
    ctx.fillText("HS: $"+G.maxScore, W*0.30, tab_y/2);

    for(x=0;x<G.life;x++) ctx.drawImage(img.b_idle, tab_x+tab_w-tab_y*0.8*(x+1), 0,tab_y,tab_y);
    ctx.drawImage(tab, tab_x, tab_y, tab_w, tab_h);
    ///// sound on/off and fullScreen buttons
    var w = tab_w/15, w2=w/2
    if(DrawBtn(tab_x+tab_w-w2, tab_y, w, w, img.btn_fs) && Mouse.Down('Left')) sys.swithFullscreen();
    if(DrawBtn(tab_x+tab_w-w-w2, tab_y, w, w, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left')){
      G.sound=!G.sound;
      if(G.sound) playMusic(music1);
      else stopSound(music1);
    }
  }
  ,checkCol(x,y){
    if(x>14) x=14; if(y>14) y=14;
    if(x<0) x=0; if(y<0) y=0;
    return G.b[Math.floor(y)][Math.floor(x)]==1
      ||G.b[Math.ceil(y)][Math.ceil(x)]==1
      ||G.b[Math.floor(y)][Math.ceil(x)]==1
      ||G.b[Math.ceil(y)][Math.floor(x)]==1;
  }
  ,SetYouLose(){
    G.state="end";
    G.stateMSG="You Lose";
    G.time=0;
    G.life--;
    G.player.set_dead();
    G.PlaySound(sound_dead);
  }
  ,SetYouWin(){
    G.state="end";
    G.stateMSG="You Win";
    G.time=0;
    G.PlaySound(sound_win);
  }
  ,Create_powerup_array(){
    var a=[]
    for (var i = 0; i < 10; i++) a.push('powerup'+(i%5))
    return a;
  }
  ,loadScore(){
    var s = localStorage.getItem("pac_score");
    if(s!=undefined){
      G.maxScore = parseInt(s);
    }
  }
  ,saveScore(){
    if(G.score>G.maxScore){
      G.maxScore=G.score;
      localStorage.setItem("pac_score", G.score);
    }
  }
  ,PlaySound(s){
    if(G.sound){
      stopSound(s)
      playSound(s)
    }
  }
  ,resizeCan(){
    if(G.needResize){
      var w = window.innerWidth;
      var h = window.innerHeight;
      can.width = W = w;
      can.height = H = h;
      G.needResize = false;
      if(w>h){
        var p = h/w;
        tab_h = h*0.9;
        tab_w = tab_h*(720/730);
        btn_w = h*0.15;
        fs = h*0.03;
      }
      else {
        var p = w/h;
        tab_w = w*0.9;
        tab_h = tab_w*(730/720);
        btn_w = w*0.15;
        fs = w*0.03;
      }

      tab_x = (w-tab_w)/2;
      tab_y = h*0.05;
      btn_x = w/2;
      btn_y =  h*0.8;
    }
  }
};
G.loadScore();

var Sound_arr=[];
var sound_eat = [loadSound(PATH+"eat.wav"), loadSound(PATH+"eat.wav"), loadSound(PATH+"eat.wav")], eat_i=0;
var sound_dead = loadSound(PATH+"dead.wav");
var monster_eat = loadSound(PATH+"monster_eat.wav");
var sound_powerup = loadSound(PATH+"powerup.wav");
var sound_win = loadSound(PATH+"win.mp3");
var mySound = loadSound(PATH+"eat.wav")
var music1 = loadSound(PATH+"music1.mp3")

var Img_arr=[];
var img = {
  block:newImage('block.png'),
  block2:newImage('block2.png'),
  M:newImage('M.png'),
  table:newImage('table.png'),
  bg0:newImage('bg0.png'), bg1:newImage('bg1.png'),
  mst_token:newImage('mst_token.png'),
  btn_play:newImage('btn_play.png'),
  btn_replay:newImage('btn_replay.png'),
  inbox_lose:newImage('inbox_lose.png'),
  inbox_win:newImage('inbox_win.png'),
  door:newImage('door.png'),

  powerup0:newImage('powerup0.png'),
  powerup1:newImage('powerup1.png'),
  powerup2:newImage('powerup2.png'),
  powerup3:newImage('powerup3.png'),
  powerup4:newImage('powerup4.png'),
  powerup5:newImage('powerup5.png'),
  powerup6:newImage('powerup6.png'),
  powerup7:newImage('powerup7.png'),
  powerup8:newImage('powerup8.png'),
  powerup9:newImage('powerup9.png'),

  b_idle:newImage('b_idle.png'),

  m1:newImage('m1.png'), m2:newImage('m2.png'), m3:newImage('m3.png'), m4:newImage('m4.png'),

  btn_down:newImage('btn_down.png'),
  btn_left:newImage('btn_left.png'),
  btn_right:newImage('btn_right.png'),
  btn_up:newImage('btn_up.png'),

  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  btn_fs:newImage('btn_fs.png'),

};

var arr_way = ['Up','Right','Down','Left'];;
class Human {
  constructor(x,y) {
    this.x=this.reset_x=x*SZ;
    this.y=this.reset_y=y*SZ;
    this.move={way:"Down",time:0};
    this.key_click="Down";
    this.i=0
    this.dead=false;
  }
  reset(){
    this.x=this.reset_x;
    this.y=this.reset_y;
    this.move={way:"Down",time:0};
    this.key_click="Down";
    this.i=0
    this.dead=false;
  }
  set_dead(){
    this.dead=true;
    this.move.time=0;
    this.i=0;
  }
  draw_key(){
    if(!sys.IsMobile) return;
    var w = btn_w, x = btn_x, s = w*1.1;
    DrawBtn(x,btn_y-s, w, w, img.btn_up)
    DrawBtn(x,btn_y, w, w, img.btn_down)
    DrawBtn(x-s,btn_y, w, w, img.btn_left)
    DrawBtn(x+s,btn_y, w, w, img.btn_right)
  }
  get_key(){
    if(!sys.IsMobile) return;
    var p=this, ck=p.key_click, mpl = Mouse.Press('Left'), w = btn_w, x = btn_x, s = w*1.1;
    if(CheckBtn(x,btn_y-s, w, w)&&mpl) ck=p.key_click="Up";
    if(CheckBtn(x,btn_y, w, w)&&mpl) ck=p.key_click="Down";
    if(CheckBtn(x-s,btn_y, w, w)&&mpl) ck=p.key_click="Left";
    if(CheckBtn(x+s,btn_y, w, w)&&mpl) ck=p.key_click="Right";
  }
  update(){
    var p=this, ck=p.key_click;
    p.get_key();

    if(Keyboard.Up.Press()) ck=p.key_click="Up";
    if(Keyboard.Down.Press()) ck=p.key_click="Down";
    if(Keyboard.Left.Press()) ck=p.key_click="Left";
    if(Keyboard.Right.Press()) ck=p.key_click="Right";

    if(ck=='Up' && !G.checkCol((p.x)/SZ,(p.y-3)/SZ)) p.move.way="Up"
    if(ck=='Down' && !G.checkCol((p.x)/SZ,(p.y+3)/SZ)) p.move.way="Down"
    if(ck=='Left' && !G.checkCol((p.x-3)/SZ,(p.y)/SZ)) p.move.way="Left"
    if(ck=='Right' && !G.checkCol((p.x+3)/SZ,(p.y)/SZ)) p.move.way="Right"

    var ox=p.x,oy=p.y; // reset the x,y
    // update x and y
    switch (p.move.way) {
      case "Up": p.y-=4; break;
      case "Down": p.y+=4; break;
      case "Right": p.x+=4; break;
      case "Left": p.x-=4; break;
    }
    // if pac hit a wall
    if(G.checkCol(p.x/SZ,p.y/SZ)){
      p.x=ox; p.y=oy;  // reset the x,y
    }
    // get the closer tile to pac
    var cb=G.c[Math.round(p.y/SZ)][Math.round(p.x/SZ)];

    // if the tile is coin or powerup
    if(cb==1||cb==2){
      G.c[Math.round(p.y/SZ)][Math.round(p.x/SZ)]=0;
      G.score+=10;
      var i,x,y,cnt=0,c=G.c;
      if(cb==2){ // powerup
        G.PlaySound(sound_powerup);
        G.score+=40;
        for(var i = 0; i < 4; i++){
          G.m[i].ghost_time = 250;
        }
      }
      else {
        G.PlaySound(sound_eat[eat_i]); eat_i=(eat_i+1)%3;
      }
      // check if all coins is eated.
      for(y=0;y<15;y++){
        for(x=0;x<15;x++){
          if(c[y][x]==1||c[y][x]==2) cnt++;
        }
      }
      if(cnt==0){
        G.SetYouWin();
      }
    }
    // if x,y outside the border
    if(p.x<0) p.x+=720; else if(p.x>720) p.x-=720;
    if(p.y<0) p.y+=720; else if(p.y>720) p.y-=720;
  }
  draw(){
    var p=this
    var m = img.b_idle;
    tctx.drawImage(m, p.x, 10+p.y);
  }
}
class Monster {
  constructor(img,free) {
    //x:6-8  y:6
    this.x=this.reset_x=6*SZ+irandom(SZ)*2;
    this.y=this.reset_y=6*SZ;
    this.move={way:"Down",time:0};
    this.img=img;
    this.ghost_time=0;
    this.free=this.reset_free=free;
    this.state='move';
  }
  reset(){
    this.x=this.reset_x;
    this.y=this.reset_y;
    this.free=this.reset_free;
    this.move={way:"Down",time:0};
    this.ghost_time=0;
    this.state='move';
  }
  get_best_move(m1,m2){
    var p=this, h = G.player;
    if(irandom(1)==1 && point_distance(p.x,p.y,h.x,h.y)<200){
      var fp = p.follow_pac();
      if(m1==fp) return m1;
      if(m2==fp) return m2;
    }
    return irandom(1)==1?m1:m2;
  }
  follow_pac(){
    var p=this, h = G.player;
    var i = Math.floor((point_direction(p.x,p.y,h.x,h.y)+360+135)%360/90);
    return arr_way[i];
  }
  update(){
    var p=this,newWay="";
    if(p.state=='move'){
      // get random new way(may not used in this loop)
      switch (p.move.way) {
        case "Up": newWay=p.get_best_move('Left','Right'); break;
        case "Down": newWay=p.get_best_move('Left','Right'); break;
        case "Left": newWay=p.get_best_move('Up','Down'); break;
        case "Right": newWay=p.get_best_move('Up','Down'); break;
      }
      // check if the new way is possible to make. if true, update the new way.
      switch (newWay) {
        case "Up":if(!G.checkCol((p.x)/SZ,(p.y-2)/SZ)) p.move.way="Up"; break;
        case "Down":if(!G.checkCol((p.x)/SZ,(p.y+2)/SZ)) p.move.way="Down"; break;
        case "Left":if(!G.checkCol((p.x-2)/SZ,(p.y)/SZ)) p.move.way="Left"; break;
        case "Right":if(!G.checkCol((p.x+2)/SZ,(p.y)/SZ)) p.move.way="Right"; break;
      }

      var ox=p.x,oy=p.y; // save the x,y for backup purpose
      // update x and y
      switch (p.move.way) {
        case "Up": p.y-=2; break;
        case "Down": p.y+=2; break;
        case "Right": p.x+=2; break;
        case "Left": p.x-=2; break;
      }
      // if monster hit a wall
      if(G.checkCol(p.x/SZ,p.y/SZ)){
        p.x=ox; p.y=oy; // reset the x,y
        // make the monster get back from where he come from
        switch (p.move.way) {
          case "Up": p.move.way="Down"; break;
          case "Down": p.move.way="Up"; break;
          case "Right": p.move.way="Left"; break;
          case "Left": p.move.way="Right"; break;
        }
      }
      var h = G.player;
      if(point_distance(p.x,p.y,h.x,h.y)<=SZ){
        if(p.ghost_time==0){
          G.SetYouLose();  // if not in ghost state, pac lose life
          G.score-=200; if(G.score<0) G.score=0;
        }
        else { // else, monster is eated
          p.x=7*SZ;
          p.y=6*SZ;
          p.ghost_time=0;
          this.free=60;
          G.score-=20; if(G.score<0) G.score=0;
          G.PlaySound(monster_eat);
        }
      }
      // if x,y outside the border
      if(p.x<0) p.x+=720; else if(p.x>=720) p.x-=720;
      if(p.y<0) p.y+=720; else if(p.y>=720) p.y-=720;
      /// if locked in the center
      if(p.free>1) p.free--;
      else if(p.free==1 && Math.abs(p.x-7*SZ)<=2){
        p.state='free';
        p.x=7*SZ;
        p.y=6*SZ;
        p.free=0;
      }
    }
    else {
      p.y-=2;
      if(p.y==4*SZ) p.state='move';
    }
  }
  draw(){
    var p=this, img=p.img;
    if(p.ghost_time==0 || (p.ghost_time<50 && p.ghost_time%2==1)){
      tctx.drawImage(img, p.x, 10+p.y);
    }
    else {
      tctx.globalAlpha=0.5;
      tctx.drawImage(img, p.x, 10+p.y);
      tctx.globalAlpha=1;
    }
    if(p.ghost_time>0) p.ghost_time--;

  }
}

var levels=[
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,1,0,1,0,0,0,0,0,0,0,1,0,1,1],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [0,0,0,0,0,1,4,4,4,1,0,0,0,0,0],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,3,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,0,1,0,1,1,0,0,0,1],
    [1,0,1,1,1,1,0,0,0,1,1,1,1,0,1],
    [1,2,0,0,0,0,0,1,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,2,1,0,1,1,1,1,1,0,1,2,1,1],
    [0,0,0,0,0,1,4,4,4,1,0,0,0,0,0],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,3,0,0,0,0,0,0,1],
    [0,0,1,1,0,1,0,1,0,1,0,1,1,0,0],
    [1,0,1,0,0,1,0,0,0,1,0,0,1,0,1],
    [1,0,0,0,1,1,0,1,0,1,1,0,0,0,1],
    [1,0,1,1,1,0,0,0,0,0,1,1,1,0,1],
    [1,2,0,0,0,0,1,1,1,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,2,0,0,0,0,0,2,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,1,1,0,1,1,0,0,0,0,1],
    [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],
    [1,0,0,1,0,1,1,1,1,1,0,1,0,0,1],
    [1,1,0,0,0,1,4,4,4,1,0,0,0,1,1],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,3,0,0,0,0,0,0,1],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,1,1,0,0,0,1,1,0,1,0,1],
    [1,0,0,2,0,0,0,1,0,0,0,2,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,2,0,1,1,0,1,1,0,2,0,0,1],
    [1,0,1,1,0,0,1,0,1,0,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,1,4,4,4,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,2,1,0,1,1,0,1,0,1,1,0,1,2,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,0,1,0,2,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,1,0,1,1,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,1,4,4,4,1,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,2,1,0,1,2,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
    [1,2,0,0,0,0,0,3,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,1,0,1,1,0,1,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,1,0,1,1,2,1,1,0,1,0,1,1],
    [1,0,0,1,0,1,1,1,1,1,0,1,0,0,1],
    [1,0,1,1,0,1,4,4,4,1,0,1,1,0,1],
    [1,0,0,1,0,1,1,1,1,1,0,1,0,0,1],
    [1,1,0,1,0,1,1,3,1,1,0,1,0,1,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,1,0,1,1,0,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
    [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
    [1,1,2,1,1,1,4,4,4,1,1,1,2,1,1],
    [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
    [1,0,1,1,0,0,0,3,0,0,0,1,1,0,1],
    [0,0,1,1,0,1,1,1,1,1,0,1,1,0,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,0,1,1,0,1,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,2,1,1,0,1,0,1,0,1,1,2,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
    [1,0,2,1,0,0,0,0,0,0,0,1,2,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,0,0,0,1,1,0,1,0,1],
    [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
    [1,0,1,0,1,1,4,4,4,1,1,0,1,0,1],
    [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
    [1,0,1,0,1,1,2,1,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,1,0,0,1,0,0,0,1],
    [1,0,1,0,1,1,0,3,0,1,1,0,1,0,1],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,2,0,0,0,0,0,1,0,0,0,0,0,2,1],
    [1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
  ],
];

function timer_loop(){
  var a = setInterval(function () {
    clearInterval(a);
    if(G.isReady) G.loop();
    else G.check_if_all_loaded();
    /* Mouse */Mouse.Update();
    /* Keyboard */Keyboard.funcKeyPress();
    timer_loop();
  }, 30);
}
timer_loop();
