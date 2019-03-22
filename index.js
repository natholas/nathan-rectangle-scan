"use strict";
exports.__esModule = true;
var RectCheck = /** @class */ (function () {
    function RectCheck(ops) {
        if (ops === void 0) { ops = {}; }
        var _this = this;
        this.ops = { maxB: 230, minB: 25, minEdge: 200, minCov: 50, scaleFactor: 0.5, searchWidth: 35 };
        this.sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        this.sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        this.blur = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        this.getEdges = function (ctx, box, kernel) {
            var data = ctx.getImageData(box[0], box[1], box[2], box[3]).data;
            var pixels = [], max = _this.ops.maxB, min = _this.ops.minB;
            for (var i = 0; i < data.length; i += 4) {
                var v = (data[i] + data[i + 1] + data[i + 2]) / 3;
                pixels.push(v);
                if (v < max)
                    max = v;
                if (v > min)
                    min = v;
            }
            return _this.blurImage(pixels, box[2]).map(function (p, i) {
                var v = Math.abs(Math.floor(_this.convolute(pixels, i, box[2], kernel)));
                if (isNaN(v) || v === Infinity || v === -Infinity)
                    return 0;
                return v;
            });
        };
        this.checkCoverage = function (data, width, length, combinationFunc) {
            var coverage = [];
            for (var i = 0; i < data.length; i++) {
                var x = combinationFunc(i, width);
                var v = data[i] > _this.ops.minCov ? 1 : 0;
                coverage[x] = coverage[x] ? coverage[x] + v : v;
            }
            return 100 / length * coverage.reduce(function (t, v) { return t + v; });
        };
        this.blurImage = function (pixels, width) { return pixels.map(function (p, i) { return Math.floor(_this.convolute(pixels, i, width, _this.blur) / 9); }); };
        this.convolute = function (pixels, index, width, pattern) {
            return pixels[(index - 1) - width] * pattern[0] // top left
                + pixels[index - width] * pattern[1] // top
                + pixels[index - width] * pattern[2] // top right
                + pixels[index - 1] * pattern[3] // left
                + pixels[index] * pattern[4] // center
                + pixels[index + 1] * pattern[5] // right
                + pixels[(index - 1) + width] * pattern[6] // bottom left
                + pixels[(index) + width] * pattern[7] // bottom
                + pixels[(index + 1) + width] * pattern[8]; // bottom right
        };
        for (var i in ops)
            this.ops[i] = ops[i];
    }
    RectCheck.prototype.check = function (image, x, y, w, h) {
        var _this = this;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = image.clientWidth, height = image.clientHeight;
        canvas.width = width * this.ops.scaleFactor;
        canvas.height = height * this.ops.scaleFactor;
        var sh = this.ops.searchWidth;
        var frame = {
            top: [x + sh / 2, y - sh / 2, w - sh, sh],
            bottom: [x + sh / 2, y + h - sh / 2, w - sh, sh],
            left: [x - sh / 2, y + sh / 2, sh, h - sh],
            right: [x + w - sh / 2, y + sh / 2, sh, h - sh]
        };
        for (var i in frame)
            frame[i] = frame[i].map(function (f) { return Math.round(f * _this.ops.scaleFactor); });
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return this.checkCoverage(this.getEdges(ctx, frame.top, this.sobelY), frame.top[2], frame.top[2], function (i, w) { return i % w; }) > this.ops.minEdge &&
            this.checkCoverage(this.getEdges(ctx, frame.bottom, this.sobelY), frame.bottom[2], frame.bottom[2], function (i, w) { return i % w; }) > this.ops.minEdge &&
            this.checkCoverage(this.getEdges(ctx, frame.left, this.sobelX), frame.left[2], frame.left[3], function (i, w) { return Math.floor(i / w); }) > this.ops.minEdge &&
            this.checkCoverage(this.getEdges(ctx, frame.right, this.sobelX), frame.right[2], frame.left[3], function (i, w) { return Math.floor(i / w); }) > this.ops.minEdge;
    };
    return RectCheck;
}());
exports.RectCheck = RectCheck;
window.RectCheck = RectCheck;