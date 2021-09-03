// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import {gameManager} from "./gameManager";

@ccclass
export class otherPlayer extends cc.Component {

    @property
    velocity_max: number = 450;
 
    @property
    velocity_min: number = 350;

    @property(cc.Label)
    label_name: cc.Label = null;

    @property([cc.Color])
    colors: cc.Color[]=[];

    @property(cc.AudioSource)
    audioEat: cc.AudioSource = null;

    gameManager: gameManager;

    anim:  cc.Animation;
    rigidbody: cc.RigidBody;
    id:number;
    isInstatiate: boolean=false;

    player:{score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}={
        score: 0,
        isGotEgg: false,
        name: "Name" ,
        position: cc.v2(0,0),
        color: 0,
        net_latency: 200
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.audioEat = this.getComponent(cc.AudioSource);
        let canvas = cc.find("Canvas")
        this.gameManager = canvas.getComponent("gameManager");
        this.rigidbody = this.getComponent(cc.RigidBody);

        this.node.color = this.colors[this.player.color];
        this.label_name.string = this.player.name+": "+this.player.score;
        this.anim =  this.getComponent(cc.Animation);
    }
    onCollisionEnter(other , self ) {
        if(other.tag==1){
            this.player.isGotEgg=true;
            this.gameManager.sendMessage(this.player, this.id);
            this.audioEat.play();
        }
    }
    start () {
        
    }
    update(dt) { 
        this.label_name.string = this.player.name+": "+this.player.score;

        //get direction
        let taget_Pos = this.player.position;
        let current_pos = this.node.getPosition();
        let direction = taget_Pos;
        direction = direction.sub(current_pos);

        //caculate velocity
        let s = direction.x + direction.y;
        let v = Math.abs(s/(this.player.net_latency/1000));
        if(v>this.velocity_max) v=this.velocity_max;
        if(v<this.velocity_min) v=this.velocity_min;
        //animation
        if(Math.abs(direction.x)<20){
            if(direction.y>0){
                direction = cc.v2(0,1);
                this.anim.play('playerMoveUp');
            }
            else {
                direction = cc.v2(0,-1);
                this.anim.play('playerMoveDown');
            }
        }else{
            if(direction.x>0){
                direction = cc.v2(1,0);
                this.anim.play('playerMoveRight');
            }
            else{
                direction = cc.v2(-1,0);
                this.anim.play('playerMoveLeft');
            }
        }

        this.rigidbody.linearVelocity = direction.mul(v);
    }
    endGame(){
        this.velocity_max=0;
        this.velocity_min=0;
    }
    updatePlayer(player: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number,net_latency: number}){
        this.player = player;
    }
}
