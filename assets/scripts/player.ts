// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import {gameManager} from "./gameManager";

@ccclass
export class player extends cc.Component {

    @property
    velocity_max: number = 0;

    @property(cc.Node)
    canvas: cc.Node=null;

    @property(cc.Label)
    label_name: cc.Label = null;

    @property(cc.EditBox)
    editBox_namePlayer: cc.EditBox = null;

    @property([cc.Color])
    colors: cc.Color[]=[];

    @property(cc.AudioSource)
    audioEat: cc.AudioSource = null;

    direction: cc.Vec2 = null;
    anim:  cc.Animation = null;

    player:{score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}={
        score: 0,
        isGotEgg: false,
        name: "Name" ,
        position: cc.v2(0,0),
        color: 0,
        net_latency: 200
    }

    gameManager: gameManager;
    rigidbody: cc.RigidBody;
    xSpeed: number = 0;
    ySpeed:number = 0;
    accLeft: boolean = false;
    accRight:boolean = false;
    accUp:boolean = false;
    accDown:boolean = false;
    isStartGame: boolean = false;
    interval_time: number = 300;
    
    onKeyDown (event){
        switch(event.keyCode){
            case cc.macro.KEY.a:
                if(!this.direction.equals(cc.v2(-1,0))){
                    this.direction = cc.v2(-1,0);
                    this.anim.play('playerMoveLeft');
                }
                break;
            case cc.macro.KEY.d:
                if(!this.direction.equals(cc.v2(1,0))){
                    this.direction = cc.v2(1,0);
                    this.anim.play('playerMoveRight');
                }
                break;
            case cc.macro.KEY.w:
                if(!this.direction.equals(cc.v2(0,1))){
                    this.direction = cc.v2(0,1);
                    this.anim.play('playerMoveUp');
                }
                break;
            case cc.macro.KEY.s:
                if(!this.direction.equals(cc.v2(0,-1))){
                    this.direction = cc.v2(0,-1);
                    this.anim.play('playerMoveDown');
                }
                break;
        }
    }
    
    // LIFE-CYCLE CALLBACKS:
    onCollisionEnter(other , self) {
        if(other.tag==1){
            this.player.isGotEgg=true;
            this.gameManager.sendMessage(this.player, 0);
            this.audioEat.play();
        }
    }
    onLoad() {
        this.direction = cc.v2(0,0);
        this.gameManager = this.canvas.getComponent("gameManager");
        this.audioEat = this.getComponent(cc.AudioSource);
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true; 
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        //init player value
        this.player.position = cc.v2(Math.random()*1000-500,Math.random()*1000-500);
        this.node.setPosition(this.player.position);
        this.player.color = Math.floor(Math.random()*5);
        this.node.color = this.colors[this.player.color];
        this.gameManager.updateMainPlayer(this.player);

        this.anim =  this.getComponent(cc.Animation);
        this.rigidbody = this.getComponent(cc.RigidBody);
        this.anim.play();
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.accLeft = false;
        this.accRight=false;
        this.accUp=false;
        this.accDown=false;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
    }

    update(dt){
        this.label_name.string = this.player.name+": "+this.player.score;
        if(this.isStartGame)
            this.rigidbody.linearVelocity = this.direction.mul(this.velocity_max);
    }
    endGame(){
        this.velocity_max=0;
    }
    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
    }
    onEditingEnded(){
        this.player.name = this.editBox_namePlayer.string;
    }
    // updatePlayer(player: {score:number, isGotEgg:boolean, name: string, position: cc.Vec2, color: number, net_latency: number}){
    //     this.player = player;
    // }
}
