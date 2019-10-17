import DragMove from "./DragMove";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CaptureTool extends cc.Component {

    @property(cc.Node)
    nodeLeftDown: cc.Node = null;
    @property(cc.Node)
    nodeRightUp: cc.Node = null;
    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property(cc.Sprite)
    resultSp: cc.Sprite = null;
    @property(cc.Node)
    cameraNode: cc.Node = null;

    start () {
        // init logic
        this.drawRect();

        let moveCallback = () => {
            this.drawRect();
        };
        let dragMove = this.nodeLeftDown.getComponent(DragMove);
        if(dragMove) {
            dragMove.setMoveCallback(moveCallback);
        }
        dragMove = this.nodeRightUp.getComponent(DragMove);
        if(dragMove) {
            dragMove.setMoveCallback(moveCallback);
        }
    }

    drawRect() {
        let r = this.getCurRect();
        this.graphics.clear();
        this.graphics.rect(r.x, r.y, r.width, r.height);
        this.graphics.fill();
    }

    getCurRect(): cc.Rect {
        let pos1 = this.nodeLeftDown.position;
        let pos2 = this.nodeRightUp.position;

        let xMin = pos1.x < pos2.x ? pos1.x : pos2.x;
        let xMax = pos1.x < pos2.x ? pos2.x : pos1.x;
        let yMin = pos1.y < pos2.y ? pos1.y : pos2.y;
        let yMax = pos1.y < pos2.y ? pos2.y : pos1.y;

        return cc.rect(xMin, yMin, xMax - xMin, yMax - yMin);
    }

    onCaptureClick() {
        let r = this.getCurRect();
        //改为左下锚点并取整
        let size = cc.winSize;
        r.x += size.width / 2;
        r.y += size.height / 2;
        r.x = Math.floor(r.x);
        r.y = Math.floor(r.y);
        r.width = Math.floor(r.width);
        r.height = Math.floor(r.height);

        this.node.active = false;
        let gl = cc.game["_renderContext"];
        let node = this.cameraNode;
        let texture = new cc.RenderTexture();
        texture.initWithSize(size.width, size.height, gl.STENCIL_INDEX8);
        let camera = node.addComponent(cc.Camera);
        camera.targetTexture = texture;
        (camera as any).render();
        node.removeComponent(cc.Camera);
        let data = texture.readPixels();
        //sub data
        let texData = this.subData(data, texture.width, texture.height, r);

        texData = this.filpYImage(texData, r.width, r.height);

        let t = new cc.Texture2D();
        t.initWithData(texData as any, cc.Texture2D.PixelFormat.RGBA8888, r.width, r.height);
        this.resultSp.spriteFrame = new cc.SpriteFrame(t);
        this.resultSp.node.active = true;
        this.node.active = true;

    }

    filpYImage(data: Uint8Array, width: number, height: number): Uint8ClampedArray {
        // create the data array
        let picData = new Uint8ClampedArray(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }

    subData(data: Uint8Array, width: number, height: number, subRect: cc.Rect): Uint8ClampedArray {
        console.assert(data.length == width * height * 4);
        console.assert(subRect.x + subRect.width <= width && subRect.y + subRect.height <= height);

        let subData = new Uint8ClampedArray(subRect.width * subRect.height * 4);
        for(let y = 0; y < subRect.height; y++) {
            for(let x = 0; x < subRect.width; x++) {
                let offset = (y + subRect.y) * width + (x + subRect.x);
                for(let c = 0; c < 4; c++){
                    subData[(y * subRect.width + x) * 4 + c] =  data[offset * 4 + c];
                }
            }
        }
        return subData;
    }
}
