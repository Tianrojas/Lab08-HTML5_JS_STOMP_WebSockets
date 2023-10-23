package edu.eci.arsw.collabpaint.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    ConcurrentHashMap<String, Queue<Point>> drawingPoints;

    public STOMPMessagesHandler() {
        drawingPoints = new ConcurrentHashMap<>();
    }

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point point, @DestinationVariable String numdibujo) throws Exception {
        //System.out.println("Nuevo punto recibido en el servidor de dibujo "+numdibujo+": " + point);
        // Propaga el punto a todos los clientes suscritos al tópico específico para que lo visualicen en sus respectivos canvas.
        //msgt.convertAndSend("/topic/newpoint" + numdibujo, pt);

        //Operación atómica que busca la cola de puntos asociada a numdibujo.
        Queue<Point> pointsQueue = drawingPoints.computeIfAbsent(numdibujo, k -> new ConcurrentLinkedQueue<>());
        pointsQueue.add(point);

        msgt.convertAndSend("/topic/newpoint." + numdibujo, point);
        if (pointsQueue.size() >= 4) {
            Polygon polygon = new Polygon();
            List<Point> pointsList = new ArrayList<>(pointsQueue);
            polygon.setPoints(pointsList);

            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);

            pointsQueue.clear();
        }
    }

    @MessageMapping("/newpolygon.{numdibujo}")
    public void handlePolygonEvent(Polygon polygon, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo polígono recibido en el servidor: " + polygon);
        msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
    }

}
