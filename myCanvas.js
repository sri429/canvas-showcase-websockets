/*jslint browser= true*/
/*global YUI */
'use strict';
YUI.add('mycanvas', function (Y) {
    Y.MyCanvasShowcase = function () {
        var canvasObj ,
        clickFlag,
        socketIo,
        context;
        this.paintMyMoves = function (evnt) {
            var packetObj;
            //evnt.halt(true);
            if (this.clickFlag) {
                this.context.lineTo(evnt.clientX, evnt.clientY);
                packetObj = '{"mouseMovements" : { "posX" : ' + evnt.clientX  + ', "posY": ' + evnt.clientY + '}}';
                this.socketIo.send(packetObj);
                this.context.stroke();
            }
        },
        this.penOff = function (evnt) {
            if (this.clickFlag) {
                this.paintMyMoves(evnt);
                this.clickFlag = false;
            }
        },
        this.penOn = function (evnt) {
            var packetObj;
            packetObj = '{"mouseBegin" : { "posX" : ' + evnt.clientX  + ', "posY": ' + evnt.clientY + '}}';
            this.socketIo.send(packetObj);
            this.context.beginPath();
            this.context.moveTo(evnt.clientX, evnt.clientY);
            this.clickFlag = true;
        },
        this.init = function () {

            this.canvasObj = Y.one('#myCanvas');
            var that = this;
            this.clickFlag = false;
            this.socketIo = io.connect();
            var iAmSocket = this.socketIo;
            this.context = this.canvasObj.getDOMNode().getContext('2d');
            this.canvasObj.on('mousemove', function (e) { this.paintMyMoves(e); }, this);
            this.canvasObj.on('mousedown', function (e) { this.penOn(e); }, this);
            this.canvasObj.on('mouseup', function (e) { this.penOff(e); }, this);
            that.socketIo.on("connect", function () {
                var myList = Y.one("#iAmList");

                myList.append('<li>' + 'Connected' + '</li>');

                that.socketIo.on("message", function (msg) {
                    var message;
                    try {
                        message = JSON.parse(msg) ;
                    } catch (e) {
                        message = msg;
                    }
                    if(message.mouseMovements){
                        that.context.lineTo(message.mouseMovements.posX, message.mouseMovements.posY);
                        that.context.stroke();
                    } else if(message.mouseBegin){
                        that.context.beginPath();
                        that.context.moveTo(evnt.clientX, evnt.clientY);
                    } else {
                        myList.append('<li>' + message + '</li>');
                    }
                });

                that.socketIo.on("disconnect", function () {
                    myList.append('<li>' + 'Disconnected' + '</li>');
                });

            });
        };
        this.init();
    };
}, '0.0.1', {
    requires: ['node', 'event']
});

 YUI().use('node', 'mycanvas', function (Y) {
     new Y.MyCanvasShowcase();
}); 
