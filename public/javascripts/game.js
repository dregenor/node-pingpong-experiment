(function($, undefined) {
	var socket = io.connect('/ws/');

	var Game = {};

	Game.locked = false;

	var requests = [
		  void 0
		, $.getJSON('/api/whoami.json') // whoami
	];

	var routes = {
		'play' : /^\/play\/([\w\d]+)$/
	};

	Game.keys = {
		LEFT		: 37,
		RIGHT		: 39
	};

	Game.speed = {
		carret: 50
	};

	$
		.when.apply($, requests)
		.done(function(undefined, whoami) {
			socket.on('connect', function() {
				$(function() {
					var
						$opponentsTable = $('#opponents tbody');

					var
						$player1 = $('#player1'),
						$player2 = $('#player2')

					Game.whoami = whoami[0];

					Game.actions = {
						play: function(e, id) {
							if(e.type == 'hashchange') {
								socket.emit('invite', {
									me		: Game.whoami.id,
									opponent: id[1]
								});

								location.hash = '#!';
							} else {
								location.hash = '#!';
							}
						}
					};

					$(window)
						.on('hashchange game:hashchange ', function(e) {
							var hash = location.hash.replace('#!', '');

							$.each(routes, function(action, reg) {
								if(reg.test(hash) && Game.actions[action]) {
									Game.actions[action].call(Game, e, hash.match(reg));
									return false;
								}
							})
						})

					if(location.hash) {
						$(window).trigger('game:hashchange');
					}

					socket
						.on('player_join', function(e) {
							$opponentsTable
								.prepend('<tr data-id="' + e.id + '"><td><i class="icon-user"></i><span>&nbsp;</span><span>' + e.login + '</span><span>&nbsp;</span><span class="badge badge-inverse">' + (e.score || 0) + '</span></td><td><a href="#!/play/' + e.id + '">Play</a></td></tr>')
						})
						.on('player_leave', function(e) {
							$opponentsTable
								.find('[data-id="' + e.id + '"]')
								.remove();
						})
						.on('invitation', function(e) {
							var data = {
								to		: e.id,
								answer	: confirm('Player ' + e.login + ' invites you! Accept?')
							};

							socket.emit('invitation_reply', data);
						})
						.on('goto_room', function(room) {
							// location.href = '#!/room/' + room + '/';

							// start game
							$(document.body)
								.on('keydown', function(e) {
									switch(e.keyCode) {
										case Game.keys.LEFT:
											socket.emit('mv', {
												direction: 'left'
											});

											return false;
											break;

										case Game.keys.RIGHT:
											socket.emit('mv', {
												direction: 'right'
											});

											return false;
											break;

										default:
											break;
									}
								});
						})
						.on('move', function(e) {
							var positions = {
								me			: parseInt($player1.css('margin-left').replace('px', '')),
								opponent	: parseInt($player2.css('margin-left').replace('px', ''))
							};

							if(e.me) {
								if(e.direction == 'left') {
									if(positions.me >= 10) {
										$player1
											.stop()
											.animate({
												marginLeft	: '-=10px'
											}, Game.speed.carret);
									}
								} else if(e.direction == 'right') {
									if(positions.me <= 280) {
										$player1
											.stop()
											.animate({
												marginLeft	: '+=10px'
											}, Game.speed.carret);
									}
								}						
							} else {
								if(e.direction == 'left') {
									if(positions.opponent >= 10) {
										$player2
											.stop()
											.animate({
												marginLeft	: '-=10px'
											}, Game.speed.carret);
									}
								} else if(e.direction == 'right') {
									if(positions.opponent <= 280) {
										$player2
											.stop()
											.animate({
												marginLeft	: '+=10px'
											}, Game.speed.carret);
									}
								}	
							}
						});
				});
			});

		})

})(jQuery);