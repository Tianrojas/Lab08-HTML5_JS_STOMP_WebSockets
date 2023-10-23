var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Suscribirse al tópico "/topic/newpoint"
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                // Procesar el evento recibido
                var pointData = JSON.parse(eventbody.body);
                var x = pointData.x;
                var y = pointData.y;
                // Mostrar las coordenadas en un mensaje de alerta
                //alert('Nueva coordenada recibida - X: ' + x + ', Y: ' + y);
                // Dibujar un punto en el <canvas> con las coordenadas recibidas
                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fill();
            });
        });

    };
    
    

    return {

        init: function () {
            var canvas = document.getElementById("canvas");

            // Configurar el evento clic en el canvas
            canvas.addEventListener("click", function (evt) {
                var mousePos = getMousePosition(evt);
                app.publishPoint(mousePos.x, mousePos.y);
            });

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt); //no es necesaria si solo deseas publicar las coordenadas en tiempo real.

            //publicar el evento
            // Enviar el objeto Point como JSON al servidor en el tópico "/topic/newpoint"
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();