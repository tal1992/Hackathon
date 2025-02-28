var express = require('express');
var http = require('http');
var cors = require('cors')

var app = express();
app.use(cors());
var server = http.createServer(app);

//connect to mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://talvinder:7838@Mongo@titans-6igk3.mongodb.net/test?retryWrites=true&w=majority',
{useNewUrlParser: true}).catch(error => console.error(error));

const DoveProducts = mongoose.model('products',
{
    productName: String,
    productUrl: String,
    imgurl: String,
    artile: {
      image: String,
      text: String,
      url: String
    },
    suitableFor: {
        minage : Number,
        maxage: Number,
        gender: String,
        hairColor: String,
        hairLength: String
    }
}
);

app.get('/', function(req, res) {
    //res.send(req);
    var url = require('url');
    var keys = Object.keys(req.query);
    var jsonparams = keys[0];

    var userObj = JSON.parse(jsonparams);

    var hairColor = (userObj.hairColor).toLowerCase();
    var hairLength= (userObj.hairLength).toLowerCase();
    var gender = (userObj.gender).toLowerCase();
    var skinColor = (userObj.skinType).toLowerCase();
    var hairType = (userObj.hairType).toLowerCase();
    var userage = parseInt(userObj.age);
    var finalResults = {};

// for hair products
    DoveProducts.find(
      {
        'suitableFor.minage': { $lte: userage },
        'suitableFor.maxage': { $gte: userage },
        'suitableFor.gender': gender.toLowerCase(),
        'suitableFor.hairColor': hairColor.toLowerCase(),
        'suitableFor.hairLength': hairLength.toLowerCase(),
        'suitableFor.hairType':  { $in: [ hairType.toLowerCase(), "all" ] }
      },

      function (err, hairproducts) {
        if (err) return console.error(err);
        finalResults['products_hair'] = hairproducts;
      }).limit(2);


// for skin DoveProducts
DoveProducts.find(
  {
    'suitableFor.minage': { $lte: userage },
    'suitableFor.maxage': { $gte: userage },
    'suitableFor.gender': gender.toLowerCase(),
    'suitableFor.skinColor': skinColor.toLowerCase()
  },

  function (err, skinproducts) {
    if (err) return console.error(err);
    finalResults['products_skin'] = skinproducts;
    console.log('skin products length:'+ skinproducts.length);

    // fallback call here
    if(skinproducts.length < 1){
      if(userage > 5){
      DoveProducts.find(
        {
          'suitableFor.default': "yes"
        },

        function (err, skinproducts) {
          if (err) return console.error(err);
          finalResults['products_skin'] = skinproducts;
          console.log('fall back length:'+ skinproducts.length);
        }).limit(3);
      } else {
        // baby fallback
        DoveProducts.find(
          {
            'suitableFor.minage': { $lte: userage },
            'suitableFor.maxage': { $gte: userage }
          },

          function (err, skinproducts) {
            if (err) return console.error(err);
            finalResults['products_skin'] = skinproducts;
            console.log('baby fall back length:'+ skinproducts.length);
          }).limit(3);
      }
    }

  }).limit(2);


// for baby

if(userage < 5){

if(userage == 0){
  userage = 1;
}


DoveProducts.find(
  {
    'suitableFor.minage': { $lte: userage },
    'suitableFor.maxage': { $gte: userage },
  },

  function (err, skinproducts) {
    if (err) return console.error(err);
    finalResults['products_skin'] = skinproducts;
  }).limit(3);

}

// for articles

if(userage > 5){
      DoveProducts.find(
        {
          'suitableFor.minage': { $lte: userage },
          'suitableFor.maxage': { $gte: userage },
          'suitableFor.gender': gender.toLowerCase()
        },

        function (err, articlesList) {
          if (err) return console.error(err);
          finalResults['articles'] = articlesList;

          // fallback for articlesList
          DoveProducts.find(
            {
              'suitableFor.gender': gender.toLowerCase()
            },

            function (err, articlesList) {
              if (err) return console.error(err);
              finalResults['articles'] = articlesList;
            }).limit(3);
          // fallback for articles ends

        res.setHeader('Content-Type', 'application/json');
        setTimeout(function() { res.end(JSON.stringify(finalResults)) }, 1000);
        }).limit(3);

} else {
  DoveProducts.find(
    {
      'suitableFor.minage': { $lte: userage },
      'suitableFor.maxage': { $gte: userage },
    },

    function (err, articlesList) {
      if (err) return console.error(err);
      finalResults['articles'] = articlesList;

    res.setHeader('Content-Type', 'application/json');
    setTimeout(function(){ res.end(JSON.stringify(finalResults)) }, 1000);

    }).limit(3);
}



});

server.listen(5000, 'localhost');
server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
