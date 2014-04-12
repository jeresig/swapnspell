var w = window.innerWidth;
var h = window.innerHeight;
var w2 = w/2;
var h2 = h/2;

var canvas = document.getElementById('canvas');
canvas.width = w;
canvas.height = h;

var ctx = canvas.getContext('2d');

document.addEventListener('touchstart', function(e) {
    var x = e.touches[0].pageX;
    var y = e.touches[0].pageY;

    tiles.forEach(function(tile) {
        if (tile.hit(x, y)) {
            tile.dragStart(x - tile.x, y - tile.y);
        }
    });
}, false);

document.addEventListener('touchmove', function(e) {
    var x = e.touches[0].pageX;
    var y = e.touches[0].pageY;

    tiles.forEach(function(tile) {
        if (tile.dragged) {
            tile.x = x - tile.offsetX;
            tile.y = y - tile.offsetY;
        }
    });
}, false);

document.addEventListener('touchend', function(e) {
    tiles.forEach(function(tile) {
        tile.dragged = false;
    });
}, false);

//ctx.globalAlpha = 0.05;
ctx.lineWidth = 2;

var ImageSlicer = function(imageName, t, r, b, l) {
    this.imageName = imageName;
    this.top = t;
    this.right = r;
    this.bottom = b;
    this.left = l;
    this.img = new Image();
    this.img.src = imageName;
    this.width = this.img.width;
    this.height = this.img.height;
    this.x = 0;
    this.y = 0;
    console.log(this.width, this.height)
};

ImageSlicer.prototype = {
    draw: function(x, y, width, height) {
        this.x = x;
        this.y = y;

        ctx.imageSmoothingEnabled = false;

        // Draw corners

        // Top Left
        ctx.drawImage(this.img,
            0, 0, this.left, this.top,
            this.x, this.y, this.left, this.top);
        // Top Right
        ctx.drawImage(this.img,
            this.width - this.right, 0, this.right, this.top,
            this.x + width - this.right, this.y, this.right, this.top);

        // Bottom Left
        ctx.drawImage(this.img,
            0, this.height - this.bottom, this.left, this.bottom,
            this.x, this.y + height - this.bottom, this.left, this.bottom);
        // Bottom Right
        ctx.drawImage(this.img,
            this.width - this.right, this.height - this.bottom, this.right, this.bottom,
            this.x + width - this.right, this.y + height - this.bottom, this.right, this.bottom);

        // Draw Sides

        // Left
        ctx.drawImage(this.img,
            0, this.top, this.left, this.height - this.top - this.bottom,
            this.x, this.y + this.top, this.left, height - this.top - this.bottom);
        // Right
        ctx.drawImage(this.img,
            this.width - this.right, this.top, this.right, this.height - this.top - this.bottom,
            this.x + width - this.right, this.y + this.top, this.right, height - this.top - this.bottom);
        // Top
        ctx.drawImage(this.img,
            this.left, 0, this.width - this.left - this.right, this.top,
            this.x + this.left, this.y, width - this.left - this.right, this.top);
        // Bottom
        ctx.drawImage(this.img,
            this.left, this.height - this.bottom, this.width - this.left - this.right, this.bottom,
            this.x + this.left, this.y + height - this.bottom, width - this.left - this.right, this.bottom);

        // Draw Content Area
        ctx.drawImage(this.img,
            this.left, this.top, this.width - this.left - this.right, this.height - this.top - this.bottom,
            this.x + this.left, this.y + this.top, width - this.left - this.right, height - this.top - this.bottom);
    }
};

var Tile = function(letter) {
    this.x = 0;
    this.y = 0;
    this.letter = letter;
    this.dragged = false;
    this.setFont();
    this.width = ctx.measureText("w").width + 4;
};

Tile.prototype = {
    height: 30,

    dragStart: function(offsetX, offsetY) {
        this.dragged = true;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    },

    setFont: function() {
        ctx.font = this.height + "px KenVector-Future";
    },

    draw: function() {
        if (this.dragged) {
            //ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            //ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
        //ctx.fillStyle = '#000000';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        this.image.draw(this.x, this.y, this.width, this.height + 4);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.setFont();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.letter, this.x + Math.floor(this.width / 2) + 4, this.y + Math.floor(this.height / 2));
    },

    hit: function(x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    }
};

var HGrid = function(x, y, padding, items) {
    this.x = x;
    this.y = y;
    this.padding = padding || 0;
    this.items = items || [];
};

HGrid.prototype = {
    draw: function() {
        var x = this.x;
        var y = this.y;
        this.items.forEach(function(item, i) {
            if (i > 0) {
                x += this.padding;
            }
            if (!item.dragged) {
                item.x = x;
                item.y = y;
            }
            item.draw();
            x += item.width;
        }.bind(this));
        this.width = x;
        //this.height = 
    }
};

var images = {};

var tiles = [
    new Tile("q"),
    new Tile("w"),
    new Tile("e"),
    new Tile("r"),
    new Tile("t"),
    new Tile("y"),
    new Tile("u"),
    new Tile("i"),
    new Tile("o"),
    new Tile("p")
];

var tileGrid = new HGrid(5, 20, 5, tiles);

var imagesToLoad = [
    "images/green_button07.png"
];

var loadingCount = 0;
var loadedCount = 0;
var loadCounter = function() {
    loadingCount += 1;
    return function() {
        loadedCount += 1;
        if (loadedCount === loadingCount) {
            ready();
        }
    };
};

imagesToLoad.forEach(function(imageName) {
    var img = images[imageName] = new Image();
    img.src = imageName;
    img.onload = loadCounter();
});

var ready = function() {
    Tile.prototype.image =
        new ImageSlicer("images/green_button07.png", 4, 5, 8, 5);

    setInterval(function() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);

        tileGrid.draw();
    }, 16);
};
