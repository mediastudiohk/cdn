const can = canvas;
const mctx = can.getContext("2d");
const W=960;
const H=540;
var cw=W,ch=H,cx=0,cy=0;
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

var tab=[], light=[], vx=230, vy=10, sc={x1:-1,y1:-1,x2:-1,y2:-1}, money=0, time=0;
var tab_w=9, sz=55, tsz=tab_w*sz, fall_time=6, maxScore=0, power_percent=50;
const G = {
  isReady:false, state:"main", state2:"idle", sound:true, bg_y:0 , needResize:true
  ,newGame(){
    money=0;
    var t=[],l=[],x,y,len;
    for(y = 0; y < tab_w; y++){
      t[y]=[]; l[y]=[];
      for(x = 0; x < tab_w; x++){
        t[y][x] = new Item_class(irandom(3));
        l[y][x]=0
      }
    }

    tab=t; light=l;
    for (var i = 0; i < 100; i++) {
      if(!G.test_first_tab(t)) break;
    }

    if(G.sound){ stopSound(sound.music1); playMusic(sound.music1);}
    G.state="game"; G.state2="game"; time=60;
    if(G.CheckCrush()){
      G.state2='crush'; G.time=10;
    }
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.bg2 = ctx.createPattern(img.bg2, 'repeat');
    G.isReady=true;
    //G.newGame();
  }
  ,loop(){
    G.resizeCan();
    ctx.drawImage(img.bg1, 0, 0, W, H);
    if(G.state == 'game'){ G.drawBG(); G.drawGame();}
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

    if(snd_crush){ snd_crush=false; G.PlaySound(sound.crush);}
    if(snd_power){ snd_power=false; G.PlaySound(sound.power);}

    mctx.fillStyle = 'Black';
    mctx.fillRect(0,0,cw,ch);
    mctx.drawImage(can2,cx,cy);
  }
  ,drawBG(){
    ctx.translate(0, G.bg_y);
    ctx.fillStyle =G.bg2;
    ctx.fillRect(vx,vy-G.bg_y,tsz,tsz);
    G.bg_y=(G.bg_y+.75)%64;
    ctx.resetTransform();
  }
  ,drawMain(){
    ctx.drawImage(img.title, (W-500)/2, 50);
    if(DrawBtn(W/2, 350, 300, 100,img.btn_play) && Mouse.Down('Left')) G.newGame(0);
  }
  ,drawGame(){
    G.drawTimer();
    ctx.textBaseline = "top"; ctx.font = "bold 30px font1"; ctx.fillStyle = "#000";
    ctx.textAlign = "left"; ctx.fillText("Money: $"+money,10,10);// ctx.fillText(G.get_time(time),10,60);
    var t=tab,l=light,x,y,len,a, c=ctx;
    var {mx,my,inside}=G.get_mouse();
    if(G.state2=='game'){
      if(inside && Mouse.Down('Left')) G.select_item(mx,my);
    }
    else if(G.state2=='switch'){
      if(--G.time<=0){
        G.switch_item(sc.x1,sc.y1,sc.x2,sc.y2);
        G.state2='game';
        if(G.isPower(sc.x1,sc.y1)){t[sc.y1][sc.x1].crush(sc.x1,sc.y1);}
        else {
          var r1=G.check_crush_point(sc.x1,sc.y1);
          if(r1.crush){ G.active_crush_point(r1,sc.x1,sc.y1);}
        }
        if(G.isPower(sc.x2,sc.y2)){t[sc.y2][sc.x2].crush(sc.x2,sc.y2);}
        else {
          var r1=G.check_crush_point(sc.x2,sc.y2);
          if(r1.crush){ G.active_crush_point(r1,sc.x2,sc.y2);}
        }
        sc.x1=sc.y1=sc.x2=sc.y2=-1;
      }
    }
    else if(G.state2=='fusion'){
      if(--G.time<=0){
        o_power.fusion(sc.x1,sc.y1,sc.x2,sc.y2);
        sc.x1=sc.y1=sc.x2=sc.y2=-1;
      }
    }
    else if(G.state2=='crush'){
      if(--G.time<=0){ G.start_fall();}
    }
    else if(G.state2=='fall'){
      if(--G.time<=0){
        for(y = tab_w-1; y >= 0; y--){
          for(x = 0; x < tab_w; x++){
            a=t[y][x];
            if(a.state=='switch'){
              //if(!t[y+1][x].visible) G.switch_item(x,y,x,y+1);
            }
          }
        }
        G.start_fall();
      }
    }
    ctx.fillStyle = "#fff";
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) if(l[y][x]){
      c.globalAlpha=l[y][x]/20;
      c.fillRect(vx+x*sz, vy+y*sz, sz ,sz);
      l[y][x]--;
    }
    c.globalAlpha=1;
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) c.drawImage(img.box, vx+x*sz, vy+y*sz, sz ,sz)
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        a=t[y][x];
        a.draw(x,y);
      }
    }

    time-=(30+money/300)/1000;
    if(time<=0){
      G.set_game_end();
    }

  }
  ,drawEnd(){
    ctx.textBaseline = "top"; ctx.textAlign = "center"; ctx.font = "bold 40px font1"; ctx.fillStyle = "#000";
    ctx.fillText("The total money collected is $"+money,W/2,70);
    ctx.fillText("Your highest money collected is $"+maxScore,W/2,150);

    if(DrawBtn(W/2, 350, 300, 100,img.btn_play_again) && Mouse.Down('Left')) G.newGame(0);
  }
  ,drawTimer(){
    var w=sz*tab_w;
    ctx.fillStyle='white';
    ctx.fillRect(vx,H-30,w,20);
    ctx.fillStyle='#1e174e';
    ctx.fillRect(vx,H-30,w*(time/60),20);
  }
  ,get_mouse(){
    return {mx:Math.floor((Mouse.X-vx)/sz), my:Math.floor((Mouse.Y-vy)/sz), inside:Mouse.Square(vx,vy,tsz,tsz)};
  }
  ,select_item(x,y){
    if(sc.x1==-1){
      sc.x1=x; sc.y1=y;
    }
    else {
      sc.x2=x; sc.y2=y;
      var {x1,y1,x2,y2}=sc;
      // active power
      if(x1==x2&&y1==y2&&G.isPower(x1,y1)){tab[y1][x1].crush(x1,y1);sc.x1=sc.y1=sc.x2=sc.y2=-1;return;}
      // if not close to other
      if(Math.abs(x1-x2)+Math.abs(y1-y2)!=1){sc.x1=sc.y1=sc.x2=sc.y2=-1; return;}
      // fusion
      if(tab[y1][x1].n==7||tab[y2][x2].n==7||(G.isPower(x1,y1)&&G.isPower(x2,y2))){
        G.state2='fusion'; G.time=10;
        tab[y1][x1].move_to(x2-x1,y2-y1);
        return;
      }


      if(G.isPower(x1,y1)||G.isPower(x2,y2)||G.test_crush(x1,y1,x2,y2)){
        tab[y1][x1].move_to(x2-x1,y2-y1);
        tab[y2][x2].move_to(x1-x2,y1-y2);
        G.state2='switch'; G.time=10;
      }
      else sc.x1=sc.y1=sc.x2=sc.y2=-1;
    }
  }
  ,switch_item(x1,y1,x2,y2){
    var t=tab[y1][x1];
    tab[y1][x1]=tab[y2][x2]
    tab[y2][x2]=t;
    tab[y1][x1].reset();
    tab[y2][x2].reset();
  }
  ,test_crush(x1,y1,x2,y2){
    G.switch_item(x1,y1,x2,y2);
    var r=G.check_crush_point(sc.x1,sc.y1).crush || G.check_crush_point(sc.x2,sc.y2).crush;
    G.switch_item(x1,y1,x2,y2);
    return r;
  }
  ,active_crush_point(o,x,y){
    if(o.cw){
      for(i=0,d=o.w,len=d.length; i < len; i++){
        tab[d[i].y][d[i].x].crush(d[i].x,d[i].y);
      }
    }
    if(o.ch){
      for(i=0,d=o.h,len=d.length; i < len; i++){
        tab[d[i].y][d[i].x].crush(d[i].x,d[i].y);
      }
    }
    if(G.power_chance()){
      if(o.p4) tab[y][x].change_to_power(4);
      else if(o.p3) tab[y][x].change_to_power(3);
      else if(o.p2) tab[y][x].change_to_power(2);
      else if(o.p1) tab[y][x].change_to_power(1);
    }
    G.state2='crush'; G.time=10;
  }
  ,check_crush_point(x1,y1){
    var T=tab, x, y, r={w:[{x:x1, y:y1}], h:[{x:x1, y:y1}], x:x1, y:y1};
    var n = T[y1][x1].n;
    for(x=x1+1; x < tab_w; x++){
      if(T[y1][x].n == n) r.w.push({x:x, y:y1}); else break;
    }
    for(x=x1-1; x >= 0; x--){
      if(T[y1][x].n == n) r.w.unshift({x:x, y:y1}); else break;
    }

    for(y=y1+1; y < tab_w; y++){
      if(T[y][x1].n == n) r.h.push({x:x1, y:y}); else break;
    }
    for(y=y1-1; y >= 0; y--){
      if(T[y][x1].n == n) r.h.unshift({x:x1, y:y}); else break;
    }

    r.p1    = r.h.length >= 4;
    r.p2    = r.w.length >= 4;
    r.p3    = r.w.length >= 3 && r.h.length >= 3;
    r.p4    = r.w.length >= 5 || r.h.length >= 5;
    r.cw    = r.w.length >= 3;
    r.ch    = r.h.length >= 3;
    r.crush = r.cw || r.ch;
    return r;
  }
  ,remove_all_crushed(){
    var t=tab,x,y;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(!t[y][x].visible) t[y][x].n=-1;
      }
    }
  }
  ,start_fall(){
    var t=tab,x,y,len,a, test=[], isFall=false;
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) t[y][x].reset();
    for(y = 0; y < tab_w; y++){
      test[y]=[];
      for(x = 0; x < tab_w; x++){
        if(t[y][x].state=='crush'){
          test[y][x]=false;
          isFall=true;
        }
        else test[y][x]=true;
      }
    }
    for(y = tab_w-1; y > 0; y--){
      for(x = 0; x < tab_w; x++){
        if(!test[y][x] && test[y-1][x]){
          G.switch_item(x,y,x,y-1);
          t[y][x].fall();
          test[y][x]=true;
          test[y-1][x]=false;

        }
      }
    }

    for(x = 0; x < tab_w; x++){
      if(!test[0][x]){
      //if(t[0][x].state=='crush' || t[1][x].state=='crush'){
        t[0][x].re_roll();
        //if(t[1][x].state=='switch'){ t[1][x].re_roll(); alert(x+'  1');}
        //else {t[0][x].re_roll(); alert(x+'  0');}
        //test[0][x]=true;
        //isFall=true;
      }
    }
    if(isFall){
      G.state2='fall'; G.time=fall_time;
    }
    else{
      G.state2='game';
      if(G.CheckCrush()){
        G.state2='crush'; G.time=10;
      }
    }

  }
  ,isItem(x,y){ return n=tab[y][x].n, n>=0&&n<=3;}
  ,isPower(x,y){ return tab[y][x].n>3;}
  ,isInside(x,y){ return x>=0&&x<tab_w&&y>=0&&y<tab_w;}
  ,CheckCrush(){
    var i,j,k,x,y,n,a1=1,a2=1,cnt,r=false;
    var T = tab;
    for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) T[y][x].test_crush = false;
    for(y=0; y < tab_w; y++){
      for(x=0; x < tab_w; x++){
        if(!T[y][x].test_crush && G.isItem(x,y)){
          for(j=x+1,cnt=1; j < tab_w; j++) if(G.isItem(j,y) && T[y][x].n == T[y][j].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=x; j < x+cnt; j++){T[y][j].test_crush = true;}}
          for(j=y+1,cnt=1; j < tab_w; j++) if(G.isItem(x,j) && T[y][x].n == T[j][x].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=y; j < y+cnt; j++){T[j][x].test_crush = true;}}
        }
      }
    }
    if(r){
      var a1=['p4','p3','p2','p1'];
      for(i=0; i < 4; i++){
        for(y=0; y < tab_w; y++){
          for(x=0; x < tab_w; x++){
            if(T[y][x].test_crush){
              var r1 = G.check_crush_point(x,y);
              if(r1[a1[i]]){
                G.active_crush_point(r1,x,y);
              }
            }
          }
        }
      }
      for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) if(T[y][x].test_crush){ T[y][x].crush(x,y);}
      //G.time1 = 7; G.State = State.Crush;
    }
    return r;
  }
  ,test_first_tab(T){
    var i,j,k,x,y,n,a1=1,a2=1,cnt,r=false;
    for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) T[y][x].test_sort = false;
    for(y=0; y < tab_w; y++){
      for(x=0; x < tab_w; x++){
        if(!T[y][x].test_sort && G.isItem(x,y)){
          for(j=x+1,cnt=1; j < tab_w; j++) if(G.isItem(j,y) && T[y][x].n == T[y][j].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=x; j < x+cnt; j++){T[y][j].test_sort = true; T[y][j].n=irandom(3);}}
          for(j=y+1,cnt=1; j < tab_w; j++) if(G.isItem(x,j) && T[y][x].n == T[j][x].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=y; j < y+cnt; j++){T[j][x].test_sort = true; T[y][j].n=irandom(3);}}
        }
      }
    }
    if(r){
      for(y=tab_w-1; y > 0; y--){
        for(x=0; x < tab_w; x++){
          if(T[y][x].test_sort) G.switch_item(x,y,x,y-1);
        }
      }
      for(x=0; x < tab_w; x++) T[0][x].n=irandom(3);
    }
    return r;
  }

  ,get_time(t){
    t=Math.floor(t);
    var s = t%60,m = Math.floor(t/60);
    if(s < 10)s = '0'+s; if(m < 10)m = '0'+m;
    return m+":"+s;
  }
  ,set_game_end(){
    G.state='end'; G.saveScore();
    G.PlaySound(sound.win);
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
  ,loadScore(){
    var s = localStorage.getItem("match3_score");
    if(s!=undefined){
      maxScore = parseInt(s);
    }
  }
  ,saveScore(){
    if(money>maxScore){
      maxScore=money;
      localStorage.setItem("match3_score", money);
    }
  }
  ,power_chance(){
    return irandom(100)<power_percent;
  }
};
G.loadScore();

var o_power={
  power_1(x,y){
    var t=tab,i;
    for(i = 0; i < tab_w; i++){
      t[y][i].crush(i,y);
    }
    G.state2='crush'; G.time=10;
  }
  ,power_2(x,y){
    var t=tab,i;
    for(i = 0; i < tab_w; i++){
      t[i][x].crush(x,i);
    }
    G.state2='crush'; G.time=10;
  }
  ,power_3(x,y){
    var t=tab,x1,y1;
    for(y1 = -1; y1 <= 1; y1++){
      for(x1 = -1; x1 <= 1; x1++){
        if(G.isInside(x+x1,y+y1)) t[y+y1][x+x1].crush(x+x1,y+x1);
      }
    }
    G.state2='crush'; G.time=10;
  }
  ,power_4(x,y,n){
    var t=tab;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(t[y][x].n==n) t[y][x].crush(x,y);
      }
    }
    G.state2='crush'; G.time=10;
  }
  ,fusion(x1,y1,x2,y2){
    G.state2='game';
    var t1=tab[y1][x1], t2=tab[y2][x2], n1=t1.n, n2=t2.n;
    t1.crush(x1,y1,true); t2.crush(x2,y2,true);
    t1.visible=false;
    if(n1<n2){n1=t2.n; n2=t1.n;}
    if((n1==6&&n2==4)||(n1==6&&n2==5)) o_power.power_3_1(x2,y2);
    else if(n1==6&&n2==6) o_power.power_3_3(x2,y2);
    else if((n1==5||n1==4)&&(n2==5||n2==4)) o_power.power_1_1(x2,y2);
    else if(n1==7&&n2<=3) o_power.power_4(x2,y2,n2);
    else if(n1==7&&n2==7) o_power.power_4_4(x2,y2,n2);
    else if(n1==7&&n2>3) o_power.power_4_n(x2,y2,n2);

  }
  ,power_1_1(x,y){
    var t=tab,i;
    for(i = 0; i < tab_w; i++){
      t[y][i].crush(i,y); t[i][x].crush(x,i);
    }
    G.state2='crush'; G.time=10;
  }
  ,power_3_1(x,y){
    var t=tab,i,j;
    for(i = 0; i < tab_w; i++){
      for(j = -1; j <= 1; j++) if(G.isInside(i,y+j)) t[y+j][i].crush(i,y+j);
      for(j = -1; j <= 1; j++) if(G.isInside(x+j,i)) t[i][x+j].crush(x+j,i);
    }
    G.state2='crush'; G.time=10;
  }
  ,power_3_3(x,y){
    var t=tab,x1,y1;
    for(y1 = -2; y1 <= 2; y1++){
      for(x1 = -2; x1 <= 2; x1++){
        if(G.isInside(x+x1,y+y1)) t[y+y1][x+x1].crush(x+x1,y+x1);
      }
    }
    G.state2='crush'; G.time=10;
  }
  ,power_4_n(x,y,n){
    var t=tab,i,j,cnt=0,nn;
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) if(G.isItem(x,y)) cnt++;
    if(cnt>6)cnt=6;
    for(i = 0; i < cnt; i++){
      do {
        x=irandom(tab_w-1);
        y=irandom(tab_w-1);
      } while (!G.isItem(x,y));
      nn=n-3;
      if(nn==1||nn==2) nn=irandom(1)+1;
      t[y][x].change_to_power(nn,{active:true,x:x,y:y});
    }

    G.state2='crush'; G.time=20;
  }
  ,power_4_4(x,y){
    var t=tab;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        t[y][x].crush(x,y);
      }
    }
    G.state2='crush'; G.time=10;
  }
};

class Item_class {
  constructor(n) {
    var t=this;
    t.n=n;
    t.visible=true;
    t.time=0;
    t.state='idle';
  }
  move_to(x,y){
    var t=this;
    t.time=0;
    t.x=x; t.y=y;
    t.state='switch';
  }
  change_to_power(n,o){
    var t=this;
    t.old_n=t.n;
    t.n=3+n;
    t.time=0;
    t.state='power_apper';
    if(o!=undefined){ t.crush_power=o;}
    else t.crush_power={active:false};
    t.test_crush=false;
  }
  fall(){
    var t=this;
    t.time=0;
    t.state='fall';
  }
  re_roll(){
    var t=this;
    t.time=0;
    t.n=irandom(3);
    t.state='re_roll';
    t.visible=true;
  }
  crush(x,y,skip){
    var t=this;
    if(t.state!='crush'){
      time+=0.2; if(time>60) time=60;
      if(t.n<=3) snd_crush=true;
      else snd_power=true;
      t.time=0;
      money+=10;
      t.state='crush';
      t.test_crush=false;
      if(x!=undefined&&y!=undefined&&G.isInside(x,y)) light[y][x]=20;
      if(!skip){
        switch (t.n) {
          case 4:o_power.power_1(x,y);break;
          case 5:o_power.power_2(x,y);break;
          case 6:o_power.power_3(x,y);break;
          case 7:o_power.power_4(x,y,irandom(3));break;
        }
      }
    }
  }
  reset(){
    var t=this;
    if(t.state!='crush'){
      t.visible=true;
      t.state='idle';
    }
  }
  draw(x,y){
    if(this.visible){
      var t=this, c=ctx, m=img.b[this.n];

      switch (t.state) {
        case 'idle':
        if(sc.x1==x&&sc.y1==y) c.drawImage(img.sc, vx+x*sz, vy+y*sz, sz ,sz);
        c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
        break;

        case 'switch':
        var p=t.time/10;
        x=(x+t.x*p); y=(y+t.y*p);
        c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
        if(t.time<10) t.time++;
        break;

        case 'fall':
        var p=t.time/fall_time;
        y=(y-1+p);
        c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
        if(t.time<fall_time) t.time++;
        break;

        case 'crush':
        var p=t.time/10, ss=10*p, ss2=ss*2;
        c.globalAlpha=1-p;
        c.drawImage(m, vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);
        c.globalAlpha=1;
        if(t.time<10) t.time++;
        else t.visible=false;
        break;

        case 'power_apper':
        var p=t.time/10, ss=10*p, ss2=ss*2;
        c.globalAlpha=1-p;
        c.drawImage(img.b[this.old_n], vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);

        ss=10-10*p, ss2=ss*2;
        c.globalAlpha=p;
        c.drawImage(m, vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);
        c.globalAlpha=1;
        if(t.time<10) t.time++;
        else if(t.crush_power.active){
          t.crush(t.crush_power.x, t.crush_power.y);
        }
        break;

        case 're_roll':
        var p=t.time/fall_time;
        c.globalAlpha=p;
        y=(1*p)-1;
        c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
        c.globalAlpha=1;
        if(t.time<fall_time) t.time++;
        break;
      }
    }
  }
}


var Sound_arr=[], snd_crush=false, snd_power=false;
var sound={
  power:loadSound(PATH+"power.wav"),
  crush:loadSound(PATH+"crush.ogg"),
  win:loadSound(PATH+"win.wav"),
  music1:loadSound(PATH+"music1.mp3"),
};
var Img_arr=[];
var img = {
  bg1:newImage('bg1.png'),
  bg2:newImage('bg2.png'),
  box:newImage('box.png'),
  b:[newImage('b1.png'),newImage('b2.png'),newImage('b3.png'),newImage('b4.png'),newImage('powerup_1.png'),newImage('powerup_2.png'),newImage('powerup_3.png'),newImage('powerup_4.png')],
  sc:newImage('sc.png'),


  btn_fs:newImage('btn_fs.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  btn_play_again:newImage('btn_play_again.png'),
  btn_play:newImage('btn_play.png'),
  title:newImage('title.png'),
};
//for (var i = 1; i <= 10; i++) img.items.push(newImage('iteam_'+i+'.png'));

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
