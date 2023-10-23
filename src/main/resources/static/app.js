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

    var drawPolygon = function (polygonData) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        if (polygonData.length > 0) {
            ctx.moveTo(polygonData[0].x, polygonData[0].y);
        }

        for (var i = 1; i < polygonData.length; i++) {
            ctx.lineTo(polygonData[i].x, polygonData[i].y);
        }

        if (polygonData.length > 0) {
            ctx.lineTo(polygonData[0].x, polygonData[0].y);
        }

        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fill();
    }



    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    /* // connectAndSubscribe con un tópico estatico
    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Suscribirse al tópico "/topic/newpoint"
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            // Se encarga de manejar los mensajes entrantes en el tópico "/topic/newpoint" y se ejecuta cuando se recibe un mensaje en ese tópico
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
    };*/

    /*// connectAndSubscribe para que se conecte al tópico con un nombre dinámico basado en el identificador ingresado por el usuario
    var connectAndSubscribe = function () {
        var drawingId = document.getElementById("drawingId").value; // Obtener el identificador ingresado
        var topicName = "/topic/newpoint." + drawingId; // Construir el nombre del tópico dinámico

        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            //Me subscribo para recibir puntos, no es necesario para enviarlos
            stompClient.subscribe(topicName, function (eventbody) {
                var pointData = JSON.parse(eventbody.body);
                var x = pointData.x;
                var y = pointData.y;

                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fill();
            });

        });
    };*/

    var connectAndSubscribe = function () {
        var drawingId = document.getElementById("drawingId").value;
        var topicName = "/topic/newpoint." + drawingId;
        var polygonTopicName = "/topic/newpolygon." + drawingId;

        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);

            stompClient.subscribe(topicName, function (eventbody) {
                var pointData = JSON.parse(eventbody.body);
                addPointToCanvas(pointData);
            });

            // Suscribirse al tópico de polígonos y procesar los datos para dibujar el polígono
            stompClient.subscribe(polygonTopicName, function (eventbody) {
                var polygonData = JSON.parse(eventbody.body);
                drawPolygon(polygonData.points);
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

        /*// publishPoint que envia coordenadas un tópico estatico.
        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt); //no es necesaria si solo deseas publicar las coordenadas en tiempo real.

            //publicar el evento
            // Enviar el objeto Point como JSON al servidor en el tópico "/topic/newpoint"
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },*/

        /*// publishPoint que envia coordenadas al tópico asociado al identificador ingresado por el usuario.
        publishPoint: function (px, py) {
            var drawingId = document.getElementById("drawingId").value; // Obtener el identificador ingresado
            var topicName = "/topic/newpoint." + drawingId; // Construir el nombre del tópico dinámico

            var pt = new Point(px, py);
            stompClient.send(topicName, {}, JSON.stringify(pt)); // Enviar el punto al tópico específico
        },*/

        // publishPoint para enviar puntos al servidor en lugar de tópico de dibujo
        publishPoint: function (px, py) {
            var drawingId = document.getElementById("drawingId").value;
            var topicName = "/app/newpoint." + drawingId;
            var pt = new Point(px, py);
            stompClient.send(topicName, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connectAndSubscribe: connectAndSubscribe
    };

})();