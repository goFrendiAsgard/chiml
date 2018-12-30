class Shape {
    constructor() {}
    area() {
        throw new Error("Not implemented")
    }
}

class Square extends Shape {
    constructor(sideLength) {
        super();
        this.sideLength = sideLength;
    }
    area() {
        return this.sideLength * this.sideLength
    };
    getSideLength() {
        return this.sideLength
    };
}

class ColoredSquare extends Square {
    constructor(sideLength, color) {
        super(sideLength);
        this.color = color;
    }
    getColor() {
        return this.color
    }
}

const coloredSquare = new ColoredSquare(2, "red");
coloredSquare.BaseClass = Shape;

module.exports = coloredSquare;
