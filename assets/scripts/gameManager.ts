// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import {serverSimulator} from "./serveSimulator";
import {otherPlayer} from "./otherPlayer";
import {player} from "./player";

export const deepCopy = <T>(target: T): T => {
    if (target === null) {
      return target;
    }
    if (target instanceof Date) {
      return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
      const cp = [] as any[];
      (target as any[]).forEach((v) => { cp.push(v); });
      return cp.map((n: any) => deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
      const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
      Object.keys(cp).forEach(k => {
        cp[k] = deepCopy<any>(cp[k]);
      });
      return cp as T;
    }
    return target;
  };

@ccclass
export class gameManager extends cc.Component {

    @property
    background_size: number = 0;

    @property(cc.Prefab)
    tilebackPref: cc.Prefab = null;

    @property([cc.SpriteFrame])
    backSprite: cc.SpriteFrame[]=[];

    @property(cc.Prefab)
    tileWallPref: cc.Prefab = null;  

    @property([cc.SpriteFrame])
    WallSprite: cc.SpriteFrame[]=[];

    @property(cc.Node)
    backParent: cc.Node = null;

    @property(cc.Node)
    otherPlayerParent: cc.Node = null;

    @property(cc.Prefab)
    otherPlayerPref: cc.Prefab = null;

    @property(cc.Prefab)
    eggPref: cc.Prefab = null;

    @property([cc.Label])
    label_scores: cc.Label[]=[];

    @property([cc.Label])
    label_top5: cc.Label[]=[];

    @property(cc.Label)
    label_timer: cc.Label = null;

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    pnlEndgame: cc.Node = null;

    @property(cc.Node)
    pnlStartGame: cc.Node = null;

    otherPlayer: otherPlayer[] = [];
    serverSimulator: serverSimulator;
    playerts:player;
    isStartGame: boolean = false;
    isEndGame: boolean = false;
    isNewEgg: boolean = false;
    time: number = 90;
    myTimer: number;
    egg: cc.Node = null;
    numberOfEgg: number = 0;
    // LIFE-CYCLE CALLBACKS:
  
    onLoad () {
        this.serverSimulator = this.getComponent('serveSimulator');
        this.isNewEgg = false;
        this.background_size=this.serverSimulator.map_tile_size;
        this.pnlStartGame.active = true;
        this.pnlEndgame.active = false;
        this.playerts = this.player.getComponent("player");
 
        //init background
        for(let i = -this.background_size; i<=this.background_size;i++)
            for(let j =-this.background_size;j<=this.background_size;j++){
                    let x=Math.round(Math.random()*(this.backSprite.length-1));
                    var tile = cc.instantiate(this.tilebackPref);
                    tile.setPosition(cc.v2(i*64,j*64));
                    tile.getComponent(cc.Sprite).spriteFrame=this.backSprite[x];
                    this.backParent.addChild(tile);
            }
        for(let i=-this.background_size-1;i<=this.background_size+1;i++){
            let x=Math.round(Math.random()*(this.WallSprite.length-1));
            var tile = cc.instantiate(this.tileWallPref);
            tile.setPosition(cc.v2(i*64,(this.background_size+1)*64));
            tile.getComponent(cc.Sprite).spriteFrame=this.WallSprite[x];
            this.backParent.addChild(tile);
        }
        for(let i=-this.background_size;i<=this.background_size;i++){
            let x=Math.round(Math.random()*(this.WallSprite.length-1));
            var tile = cc.instantiate(this.tileWallPref);
            tile.setPosition(cc.v2((this.background_size+1)*64,-i*64));
            tile.getComponent(cc.Sprite).spriteFrame=this.WallSprite[x];
            this.backParent.addChild(tile);
        }
        for(let i=-this.background_size;i<=this.background_size;i++){
            let x=Math.round(Math.random()*(this.WallSprite.length-1));
            var tile = cc.instantiate(this.tileWallPref);
            tile.setPosition(cc.v2(-(this.background_size+1)*64,-i*64));
            tile.getComponent(cc.Sprite).spriteFrame=this.WallSprite[x];
            this.backParent.addChild(tile);
        }
        for(let i=-this.background_size-1;i<=this.background_size+1;i++){
            let x=Math.round(Math.random()*(this.WallSprite.length-1));
            var tile = cc.instantiate(this.tileWallPref);
            tile.setPosition(cc.v2(i*64,-(this.background_size+1)*64));
            tile.getComponent(cc.Sprite).spriteFrame=this.WallSprite[x];
            this.backParent.addChild(tile);
        }

        let minute = Math.floor(this.time/60);
        let second = this.time%60;
        this.label_timer.string = "Time: "+ minute+"p "+second+"s ";
    }

    timer(){
        this.time-=1;
        if(this.time<0){
            this.endGame();
            clearInterval(this.myTimer);
        }else{
            let minute = Math.floor(this.time/60);
            let second = this.time%60;
            this.label_timer.string = "Time: "+ minute+"p "+second+"s ";
        }
    }

    spawNewEgg(pos){
        this.numberOfEgg++;
        if(this.egg)
           this.egg.destroy();
        this.egg = cc.instantiate(this.eggPref);
        this.egg.setPosition(pos);
        this.otherPlayerParent.addChild(this.egg);
        this.upDateTopPlayerUI();
    }

    endGame(){
        this.getComponent(cc.AudioSource).play();
        this.isEndGame = true;
        this.playerts.endGame();
        this.otherPlayer.forEach(element => {
            element.endGame();
        });
        this.sendMessage(this.playerts.player,0);
        this.pnlEndgame.active = true;
        let players = deepCopy(this.serverSimulator.players);
        players.sort(function(a, b){return b.score - a.score});
        for(let i=0;i<3;i++){
            let string = players[i].name+"                                     ";
            let strScore = players[i].score+"      ";
            let x=i+1;
            this.label_scores[i].string = "#" + x + "  " + string.slice(0,13) +  strScore.slice(0,3);
        }
    }

    //contacts
    gotMessage(players: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number,net_latency: number}[], isNewEgg:boolean, eggPos:cc.Vec2) {
        for(let i=1;i<this.otherPlayer.length;i++){
            this.otherPlayer[i].updatePlayer(players[i]);
        }
        if(this.isNewEgg!=isNewEgg){
            this.spawNewEgg(eggPos);
            this.isNewEgg=isNewEgg;
        }
    }
    sendMessage(player: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}, id: number){
        this.serverSimulator.gotMessage(player, id, this.isNewEgg,this.isStartGame,this.isEndGame);
    }
    updateMainPlayer(player: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}){
        this.serverSimulator.gotMessage(player, 0, this.isNewEgg,this.isStartGame,this.isEndGame);
    }
    
    //UI
    upDateTopPlayerUI(){
        let players = deepCopy(this.serverSimulator.players);
        players.sort(function(a,b){return b.score-a.score});
        for(let i=0;i<5;i++){
            let string = players[i].name+"                                               ";
            let strScore = players[i].score+"      ";
            let x=i+1;
            this.label_top5[i].string = "#" + x + "  " + string.slice(0,22) +  strScore.slice(0,3);
        }
    }
    btnRestart(){
        cc.director.loadScene('PlayScene');
    }
    btnStart(){
        this.playerts.isStartGame = true;
        this.sendMessage(this.playerts.player,0);
        this.isStartGame = true;
        this.pnlStartGame.active = false;
        // get players from serverSimulator
        this.serverSimulator.players.forEach((element,index) => {
            if(index!=0){
                let player = cc.instantiate(this.otherPlayerPref);
                player.setPosition(element.position);
                this.otherPlayer[index] = player.getComponent("otherPlayer");
                this.otherPlayer[index].id = index;
                this.otherPlayer[index].updatePlayer(element);
                this.otherPlayerParent.addChild(player);
            }
        });
        //get eggPos and spawn it
        this.spawNewEgg(this.serverSimulator.eggPos);
        //Start a timer
        this.myTimer = setInterval(()=> {
            this.timer();
        }, 1000)
    }

}
