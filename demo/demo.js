const imageOverlay = document.querySelector('.image-overlay')
const testInput = document.querySelector('#test-input')
const image = document.querySelector("#test-image")
const checker = new RectCheck()

function vChange (e) {
  document.querySelector('#' + e.target.id + 'Val').innerHTML = e.target.value
  if (e.target.id === 'edgeEl') {
    checker.ops.edgeThreshhold = parseInt(e.target.value)
  } else if (e.target.id === 'contrastEl') {
    checker.ops.minContrast = parseInt(e.target.value)
  } else if (e.target.id === 'searchWidthEl') {
    checker.ops.searchWidth = parseInt(e.target.value)
  } else {
    imageOverlay.style[e.target.classList[0]] = e.target.value + 'px';
  }
  scanImage()
}

imageOverlay.style.top = topEl.value + 'px';
imageOverlay.style.left = leftEl.value + 'px';
imageOverlay.style.width = widthEl.value + 'px';
imageOverlay.style.height = heightEl.value + 'px';

document.querySelector('#topEl').addEventListener('input', vChange)
document.querySelector('#leftEl').addEventListener('input', vChange)
document.querySelector('#widthEl').addEventListener('input', vChange)
document.querySelector('#heightEl').addEventListener('input', vChange)
document.querySelector('#edgeEl').addEventListener('input', vChange)
document.querySelector('#contrastEl').addEventListener('input', vChange)
document.querySelector('#searchWidthEl').addEventListener('input', vChange)

const scanImage = () => {
  const bounds = imageOverlay.getBoundingClientRect()
  if (checker.check(image, bounds.left, bounds.top, bounds.width, bounds.height)) {
    imageOverlay.classList.add('found')
  } else {
    imageOverlay.classList.remove('found')
  }
}

image.onload = scanImage
image.src = '/assets/test-image.jpg'

testInput.onchange = (e) => {
  getFile(e.target.files[0]);
}

function getFile(file) {
  var reader = new FileReader();
  reader.onload = (data) => {
    image.src = data.target.result
  }
  reader.readAsDataURL(file);
}