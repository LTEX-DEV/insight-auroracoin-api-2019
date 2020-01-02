'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.btcRate = 0;
  this.usdRate = 0;
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if ((self.btcRate === 0 || self.usdRate === 0) || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.timestamp = currentTime;
    request('https://aurora-price-tickers.herokuapp.com/rates', function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        self.btcRate = parseFloat(JSON.parse(body)[0].rate);
        self.usdRate = parseFloat(JSON.parse(body)[1].rate);
      }
      res.jsonp({
        status: 200,
        data: { 
          btcRate: self.btcRate,
          usdRate: self.usdRate 
        }
      });
    });
  } else {
    res.jsonp({
      status: 200,
      data: { 
        btcRate: self.btcRate,
        usdRate: self.usdRate 
      }
    });
  }

};

module.exports = CurrencyController;
