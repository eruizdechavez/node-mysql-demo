/*jshint bitwise:true curly:true forin:true immed:true newcap:true regexp:true nonew:true undef:true node:true devel:true*/

var Q = require('q'),
	mysql = require('mysql'),
	http = require('http');

// Define our initial class.
var MySqlDemo = function() {
	this.initialize();
};

// Initialize: Starts all the fun.
MySqlDemo.prototype.initialize = function() {
	console.log('initialize');
	Q.all([this.startDb(), this.startServer()]).spread(this.ready, this.fail);
};

// Start DB: Initialize DB Connection.
MySqlDemo.prototype.startDb = function() {
	console.log('startDb');
	var deferred = Q.defer(),
		connection;

	connection = mysql.createConnection({
		host: 'localhost',
		user: 'user',
		password: 'password',
		database: 'database'
	});

	connection.connect(function(err) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(connection);
		}
	});

	return deferred.promise;
};

// Start Server: Initialize HTTP server; this is not actually required but
// since this demo is really small I didn't need to use express or connect.
MySqlDemo.prototype.startServer = function() {
	console.log('startServer');
	var deferred = Q.defer(),
		server;

	server = http.createServer().listen(3001).on('error', function(err) {
		console.log('err', err);
		deferred.reject(err);
	}).on('listening', function() {
		console.log('listening');
		deferred.resolve(server);
	});

	return deferred.promise;
};

// In case of emergency... RUN IN CIRCLES!
MySqlDemo.prototype.fail = function(err) {
	console.log('fail', err);
};

// Ready: Once bot asyncronous dependencies are ready (MySQL and HTTP)
// do somethig useful with them.
MySqlDemo.prototype.ready = function(db, server) {
	console.log('ready');
	var query = 'SELECT post_title FROM wp_posts WHERE post_status = "publish" ORDER BY id DESC LIMIT 5;';
	server.on('request', function(req, res) {
		db.query(query, function(err, rows, fields) {
			if (err) {
				res.send('oops!');
				return;
			}

			res.end(JSON.stringify(rows));
		});
	});
};

var demo = new MySqlDemo();
