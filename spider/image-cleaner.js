const sharp = require("sharp")
sharp('test.png')
  .rotate()
  .resize(200)
  .toBuffer();