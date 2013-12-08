var fs = require('fs'),
    gm = require('gm'),
    imagesDirectory = __dirname + '/../testimages/',
    imageFile = __dirname + '/../sprite.png',
    cssFile = __dirname + '/../sprite.css',
    imageInfoArray = [],
    cssInfoArray = [],
    padding = 2;

function readFiles(cb) {

  fs.readdir(imagesDirectory, function(err, files) {
    if (err) console.log('could not read files');
    else cb(files);
  });
}

function getIdentifyCallback(files, i, cb) {
  return function(err, data) {
    var file = files[i];
    if (err) {
      console.log('could not get image info');
      imageInfoArray.push(null);
    } else {
      imageInfoArray.push({
        selector: '.' + file.substr(0, file.length - 4),
        path: data.path,
        width: data.size.width,
        height: data.size.height
      });
    }

    if (imageInfoArray.length === files.length) {
      cb();
    }
  }
}

function determineImageSizes(files, cb) {
  var i, length = files.length;

  for (i = 0; i < length; i++) {
    gm(imagesDirectory + files[i])
      .identify(getIdentifyCallback(files, i, cb));
  }
}

function pushCss(selector, width, height, y) {
  cssInfoArray.push(selector + '{width:' + width + 'px;height:' + height + 'px;background-position:0 -' + y + 'px;}');
}

exports.generate = function() {
  readFiles(function(files) {
    determineImageSizes(files, function() {
      var i, g = gm(), y = 0;

      for (i = 0; i < imageInfoArray.length; i++) {

        var coordinates = '+0+' + y,
            info = imageInfoArray[i];
        console.log(info);
        g.in('-page', coordinates).in(info.path);

        pushCss(info.selector, info.width, info.height, y);

        y = y + info.height + padding;
      }
      g.mosaic().write(imageFile, function(err) {
        if (!err) console.log('done');
      });

      fs.writeFile(cssFile, cssInfoArray.join(''), function(err) {
        if (err) console.log('could not write css file');
      });
    });
  });
};