module.exports = function(input) {
  var net = {"layers":[{"mtpd":{},"dptd":{},"msec":{},"dsec":{},"mrt":{},"drt":{}},{"0":{"bias":-3.6984439021091666,"weights":{"mtpd":-6.173024933059706,"dptd":10.997739857335477,"msec":2.7645625300070646,"dsec":2.815832326064508,"mrt":18.0465877829903,"drt":1.155631417743205}},"1":{"bias":2.8315295205493665,"weights":{"mtpd":5.2303592356466035,"dptd":-8.2729870958148,"msec":-2.3778963665239683,"dsec":-2.1532312095623416,"mrt":-14.328315122259214,"drt":-1.0412519208946147}},"2":{"bias":2.715125313888669,"weights":{"mtpd":4.855944732546972,"dptd":-7.991354496280592,"msec":-2.1930872312980267,"dsec":-2.1223653263694544,"mrt":-13.689745670932748,"drt":-0.9648212850166319}}},{"bot":{"bias":-2.2122390536076995,"weights":{"0":-15.7186161148084,"1":11.480607717164341,"2":10.947352405515204}},"human":{"bias":2.1200842597557106,"weights":{"0":15.801011054157996,"1":-11.430970519356372,"2":-10.892672803240483}}}],"outputLookup":true,"inputLookup":true};

  for (var i = 1; i < net.layers.length; i++) {
    var layer = net.layers[i];
    var output = {};
    
    for (var id in layer) {
      var node = layer[id];
      var sum = node.bias;
      
      for (var iid in node.weights) {
        sum += node.weights[iid] * input[iid];
      }
      output[id] = (1 / (1 + Math.exp(-sum)));
    }
    input = output;
  }
  return output;
}
