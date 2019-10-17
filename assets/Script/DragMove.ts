const {ccclass, property} = cc._decorator;

@ccclass
export default class DragMove extends cc.Component {
    private _curTouchID: number = -1;
    private _initPos: cc.Vec2;

    private _moveCallback: Function = null;

    start () {
        // init logic
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.onTouchStart(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.onTouchMove(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.onTouchEnd(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            this.onTouchCancel(event);
        });
        this._initPos = cc.v2(this.node.x, this.node.y);
    }

    setMoveCallback(callback: Function) {
        this._moveCallback = callback;
    }

    onTouchStart(event: cc.Event.EventTouch) {
        if(this._curTouchID > 0){
            return;
        }
        this._initPos = cc.v2(this.node.x, this.node.y);
        this._curTouchID = event.touch.getID();
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if(this._curTouchID != event.touch.getID()) {
            return;
        }

        let dis = event.getLocation().sub(event.getStartLocation());

        this.node.x = this._initPos.x + dis.x;
        this.node.y = this._initPos.y + dis.y;

        if(this._moveCallback) {
            this._moveCallback()
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        if(this._curTouchID != event.touch.getID()) {
            return;
        }
        // this.node.x = this._initPos.x;
        // this.node.y = this._initPos.y;
        this._curTouchID = -1;
    }

    onTouchCancel(event: cc.Event.EventTouch) {
        if(this._curTouchID != event.touch.getID()) {
            return;
        }
        // this.node.x = this._initPos.x;
        // this.node.y = this._initPos.y;
        this._curTouchID = -1;
    }
}