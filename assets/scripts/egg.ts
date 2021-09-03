// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = []; 

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let ran = Math.floor(Math.random()*this.sprites.length-1);
        this.getComponent(cc.Sprite).spriteFrame = this.sprites[ran];
        let physicsManager = cc.director.getPhysicsManager(); // get the physics manager
        physicsManager.enabled = true; 
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    }

    start () {

    }

    // update (dt) {}
}
