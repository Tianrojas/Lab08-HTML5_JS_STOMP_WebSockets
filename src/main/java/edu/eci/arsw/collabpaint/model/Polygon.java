package edu.eci.arsw.collabpaint.model;

import java.util.List;

public class Polygon {

    private List<Point> points;

    public Polygon() {
    }

    public Polygon(List<Point> points) {
        this.points = points;
    }

    public List<Point> getPoints() {
        return points;
    }

    public void setPoints(List<Point> points) {
        this.points = points;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Polygon{");

        for (Point pt : points) {
            builder.append(pt);
            builder.append(", ");
        }
        if (!points.isEmpty()) {
            builder.setLength(builder.length() - 2);
        }
        builder.append('}');
        return builder.toString();
    }

}
