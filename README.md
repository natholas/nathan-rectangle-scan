#nathan-rectangle-scan

Scans an image to see if there is a rectangle in a predefined place.

## Setup

`npm i nathan-rectangle-scan`

```javascript
const checker = new RectCheck();
const image = new Image();
image.onload = () => alert(checker.check(image, x, y, width, height)) ? 'Found a rectangle!' : 'Didn't find it'
image.src = '..someimage.jpg';
```

## Demo
Run `gulp demo`
or visit the [Live demo](https://rect.nathanfelix.com)

## Options
When instantiating the RectCheck class you can pass an object with options.
`const checker = new RectCheck(options)`

| name            | default  | description |
| --------------- |:--------:| -----------:|
| edgeThreshhold  | 200      | how much of the search area has to be covered in edge for it to be considered valid       |
| minContrast     | 50       | The amount of contrast needed to be considered an edge                                    |
| scale           | 0.5      | The amount to scale the image by before running the edge detection (lower is faster)      |
| searchWidth     | 35       | The width (on side sides, height on top and bottom) to search for edges around input area |

## Building

Building index.js
`gulp build`

Building the **/dist** version
`gulp build-dist`