//because when thrown out of a window, it is better to land gracefully
module.exports.Featherfall = function() {
	process.on("SIGINT", function() {
