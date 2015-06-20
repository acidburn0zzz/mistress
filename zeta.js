//it me alice yr fav gay tran
//I guess it's as good a time as any to make my "include this fucking everywhere" util file
"use strict";

const _ = require("underscore");

const Zeta = function() {
	_.mixin({
		//given an array of reals, normalize its values to within unity
		norm: arr => {
			const min = _.min(arr);
			const max = _.max(arr);
			return _.map(arr, val => (val-min)/(max-min));
		},

		//simple mean
		core: arr => _.reduce(arr, (m,n) => m+n, 0)/arr.length
	});
};

module.exports = Zeta;
