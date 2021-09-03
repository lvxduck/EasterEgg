// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


const {ccclass, property} = cc._decorator;
import {gameManager} from './gameManager'; 

@ccclass
export class serverSimulator extends cc.Component {

    @property
    interval_time: number = 400;

    @property
    player_amount: number = 10;

    @property
    map_tile_size: number = 10;

    @property([cc.String])
    fake_name: string[]=[];
 
    gameManager: gameManager;
    map_size:number = 0;  
    isNewEgg: boolean = false;
    map_end_posx: number = 0;
    isEndGame: Boolean = true;
    isStartGame: Boolean = false;

    players: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}[]=[{
        score: 0,
        isGotEgg: false,
        name: "Duc" ,
        position: cc.v2(0,0),
        color: 0,
        net_latency: 0
    }];
    eggPos: cc.Vec2 = null;
    myAI: number;

    // LIFE-CYCLE CALLBACKS:

    public onLoad () {
        this.map_size=(this.map_tile_size*2-2)*64-21;
        this.isNewEgg=false;
        this.map_end_posx=this.map_size/2;
        this.isEndGame = false;
        let canvas = cc.find("Canvas")
        this.gameManager = canvas.getComponent("gameManager");
        //init players
        for(let i=0;i<this.player_amount;i++){
            this.players[i]= {
                score: 0,
                isGotEgg: false,
                name: "h",
                position: cc.v2(0,0),
                color: Math.floor(Math.random()*5),
                net_latency: this.interval_time
            };
            this.players[i].name = this.fake_name[Math.round(Math.random()*(this.fake_name.length-1))]+Math.round(Math.random()*100).toString() ;
            this.players[i].position = cc.v2(Math.round(Math.random()*this.map_size-this.map_size/2),Math.round(Math.random()*this.map_size-this.map_size/2));
        }
        //khoi tao vi tri cua trung
        this.eggPos = cc.v2(0,0);
        this.randomEggPos();

        //----
        setTimeout(()=>{
                this.simpleAi()
        },this.interval_time);

    }

    //contacts
    gotMessage(player: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}, id: number, isNewEgg: boolean, isStartGame:boolean, isEndGame:boolean){
        this.isEndGame = isEndGame;
        this.isStartGame=isStartGame;
        this.players[id] = player;
        if(player.isGotEgg){
            if(this.isNewEgg==isNewEgg){
                this.players[id].score+=1;
                this.isNewEgg=!this.isNewEgg;
                this.randomEggPos();
                this.sendMessage(this.players);
            }
            this.players[id].isGotEgg=false;
        
        }
    }
    sendMessage(players: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number,net_latency: number}[]){
        this.gameManager.gotMessage(players,this.isNewEgg,this.eggPos);
    }

    //egg method
    randomEggPos(){
        this.eggPos=cc.v2(Math.round(Math.random()*this.map_size-this.map_size/2),Math.round(Math.random()*this.map_size-this.map_size/2));
    }
    getEggDistance(id: number){
        return  Math.abs(this.eggPos.y-this.players[id].position.y)+ Math.abs(this.eggPos.x-this.players[id].position.x);
    }

    // AI
    simpleAi(){
        this.interval_time = Math.random()*400+100;
        //Choose closetPlayer which get the egg
        if(!this.isEndGame){
            let minPlayerId = 0;
            let minDistance = 100000;
            this.players.forEach((element,id) => {
                if(id!=0){
                    if(this.getEggDistance(id)<minDistance){
                        minDistance=this.getEggDistance(id);
                        minPlayerId=id;
                    }
                }
            });
            this.players[minPlayerId].net_latency = this.interval_time;
            let x = 350*this.interval_time;
            let direction = this.eggPos;
            direction = direction.sub(this.players[minPlayerId].position);
            if(Math.abs(direction.x)<10){
                if(direction.y>0){
                    // up
                    if(direction.y>x)
                        this.players[minPlayerId].position.y+=x;
                    else this.players[minPlayerId].position.y+=direction.y;
                }
                else {
                    // down
                    if(direction.y<-x)
                        this.players[minPlayerId].position.y-=x;
                    else this.players[minPlayerId].position.y+=direction.y;
                }
            }else{
                if(direction.x>0){
                    // right
                    if(direction.x>x)
                        this.players[minPlayerId].position.x+=x;
                    else this.players[minPlayerId].position.x+=direction.x;
                }
                else{
                    // left
                    if(direction.x<-x)
                        this.players[minPlayerId].position.x-=x;
                    else this.players[minPlayerId].position.x+=direction.x;
                }
            }


            // random direction for another Player
            for(let i=1;i<this.player_amount;i++){
                if(i!=minPlayerId){
                    let rand = cc.v2(0,0);
                    if(Math.random()>0.5) {
                        if(Math.random()<0.5)
                            rand = cc.v2(x,0);
                        else rand = cc.v2(-x,0);
                    }else {
                        if(Math.random()<0.5)
                            rand = cc.v2(0,-x);
                        else rand = cc.v2(0,x);
                    }
                    this.players[i].position=cc.v2(this.players[i].position.add(rand));
                    this.players[i].net_latency = this.interval_time;
                    if(this.players[i].position.x<-this.map_end_posx) this.players[i].position.x=-this.map_end_posx;
                    if(this.players[i].position.y<-this.map_end_posx) this.players[i].position.y=-this.map_end_posx;
                    if(this.players[i].position.x>this.map_end_posx) this.players[i].position.x=this.map_end_posx;
                    if(this.players[i].position.y>this.map_end_posx) this.players[i].position.y=this.map_end_posx;
                }
            }
        this.sendMessage(this.players);
        }
        setTimeout(()=>{
                this.simpleAi()
        },this.interval_time);
    } 
    update(){
        if(this.isEndGame){
            clearInterval(this.myAI);
        }
    }
}
