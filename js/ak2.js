/* global $, TimelineMax, TweenMax */

$(function () {

		var 	$app = $('#app'),
			$mainList = $('.mainList'),
			$player = $('#player'),
			$playList = $('#playList'),
			$playerChild = $('.player-child'),
			$playListChild = $('.playlist-child'),
			$about = $('#about'),
			$back = $('.back'),
			$hanger = $('.hanger'),
			$listWrapper = $('#listWrapper'),
			$btnExtend = $('.btn-extend'),
			$btnSkip = $('.btn-skip'),

			$loading = $('#loading'),
			$loadingCircle = $('.loading-circle'),
			$loadingLine = $('.loading-line'),
			$loadingBoundary = $('.loading-boundary'),


			//timeline
			tl_show_player = new TimelineMax(),
			tl_hide_player = new TimelineMax(),
			tl_show_loader = new TimelineMax({onComplete: hideLoader}),
			tl_hide_loader = new TimelineMax({onComplete: showAbout}),

			//mql
			mql = window.matchMedia("screen and (max-width: 1024px)"),

			_cue = [],
			is_signal = false,
			is_show = false,
			is_extend = false,
			is_first_scroll = true,
			i = 0,

			$firstRecord = null,
			_jqm = {};


		connectEvent();
		makeMainList();
		startLoading();


		function connectEvent() {
			$(window).on('resize', onResize);
			$mainList.on('click', '.list-item', onShowPlayer);
			$back.on('click', onGoBack);
			$playListChild.on('click', '.record', onPlayAnotherVideo);
			$btnSkip.on('click', onSkipLoading);

			if (mql.matches) {
			    $hanger.on('click', onExtend);
			    $(window).on('resize', onResizeM);
			    $about.bind('touchmove', function(e){e.preventDefault()});
			    $mainList.on('click', '.list-item', onScrollLeft);
			}
		}

		function makeMainList() {
			$.getJSON('data/main-data2.json', function (data) {

				$.each(data, function(key, value) {
					$mainList.append(
					'<li class="list-item" data-json="' + value.dname + '">'
						+ '<div class="info-container">'
							+ '<div class="celeb-job">' + value.job +'</div>'
							+ '<div class="celeb-name">' + value.name + '</div>'
						+ '</div>'
					+ '</li>'
					);
				});

				_jqm.$listItem = $('.list-item');
				_jqm.$infoContainer = $('.info-container');
				_jqm.$celebJob = $('.celeb-job');
				_jqm.$celebName = $('.celeb-name');
			});
		}

		function startLoading() {
			tl_show_loader
				.to($loadingCircle, 1, { rotation: 360, repeat: 8 }, 0)
				.staggerFrom($loadingLine, 0.5, { scaleX: 0, transformOrigin:["left"] }, 0.5, 0);
		}

		function hideLoader() {
			tl_hide_loader
				.to([$loadingBoundary, $loadingCircle, $btnSkip], 0.5, { opacity: 0 })
				.set($loading, {opacity: 0, display: 'none'});
			tl_hide_loader = new TimelineMax(); // hide reset. - 빈 객체로 만들기.
		}

		function showAbout() {
			TweenMax.staggerFrom($('.ani-effect'), 1, { y: 5, opacity: 0 });
		}


	/*
	mql.addListener(function(e) {
	    if(e.matches) {
	        console.log('모바일 화면 입니다.');
	    } else {
	        console.log('데스크탑 화면 입니다.');
	    }
	});
	*/


		/* Event Handler */
		function onResize(e) {

			var sw = window.innerWidth;
			var sh = window.innerHeight;

			$app.width = sw;
			$app.height = sh;

			if (sh <= 800) {
				$playList.css('height', 200);
				$player.css('height', '100%').css('height', '-=' + 200);
			} else {
				var _playerW = $player.css('width');
				var arr = _playerW.split('px');
				var ph = parseInt((arr[0] / 16) * 9);

				$player.css('height', ph);
				$playList.css('height', 'calc(100% - ' + ph + ')');
				$playList.css('height', '100%').css('height', '-=' + ph );
			}

		} // onResize

		function onResizeM(e) {

			var sw = window.innerWidth;
			var sh = window.innerHeight;

			var _playerW = $player.css('width');
			var arr = _playerW.split('px');
			var ph = parseInt((arr[0] / 16) * 9);
			var LIST_HEIGHT = 48;
			var plh = ph + LIST_HEIGHT + 13;

			$app.width = sw;
			$app.height = sh;

			if (sh <= 800) {
				$playList.css('height', 200);
				$player.css('height', '100%').css('height', '-=' + 262); // 200 = pl-height, 62 = mainlist-height
			} else {
				$player.css('height', ph);
				// $playList.css('height', 'calc(100% - ' + ph + ')');
				$playList.css('height', '100%').css('height', '-=' + plh );
			}

			/*
			var _playerW = $player.css('width'),
				arr = _playerW.split('px'),
				ph = parseInt((arr[0] / 16) * 9),
				LIST_HEIGHT = 48,
				plh = ph + LIST_HEIGHT + 13;

			$player.css('height', ph);
			$playList.css('height', '100%').css('height', '-=' + plh );
			*/
		}

		function onShowPlayer(e) {
			e.preventDefault();

			var _siblings;
			_siblings = $(this).siblings();

			$(this).addClass('selected');
			_siblings.removeClass('selected');

			doPlayReset();

			if (is_show === false) {
				showAnimation();
			}

			if (is_signal) {

				var $data = $(this).data('json');

				$.getJSON('data/' + $data +'.json', function (data) {

			   		$.each(data, function(key, value) {
			   			_cue.push(value.url);
			   			$playListChild.append(
								'<li class="record" data-index="' + i +'">'
									+ '<div class="num record-item">' + value.num + '</div>'
									+ '<div class="author record-item">' + value.author + '</div>'
									+ '<div class="title record-item">' + value.title + '</div>'
									+ '<div class="runtime record-item">' + value.runtime + '</div>'
								+ '</li>'
			   			);

			   			if (i === 0) { $firstRecord = $('.record[data-index=0]'); }

							i++;
			   		});

		   			// init
				   	$playerChild.attr('src', _cue[0]);
				   	$firstRecord.addClass('onair');

		  		});
			}
		} // onShowPlayer


		function onGoBack(e) {
			e.preventDefault();

			if (mql.matches) {
			    tl_hide_player
					.set($listWrapper, {opacity: 0, display: 'none'})
					.to([$player, $playList], 0.5, {opacity: 0, display: 'none'})
					.to($listWrapper, 0.2, {opacity: 1, display: 'block'})
					.to($about, 0.3, {opacity: 1, display: 'block'});

			} else {
				tl_hide_player
					.to([$player, $playList], 0.5, {opacity: 0, display: 'none'})
					.to($about, 0.5, {opacity: 1, display: 'block'});
			}

			makeClass();
			$hanger.css('display', 'block');

			$mainList.children().removeClass('selected');

			is_show = false;
			is_first_scroll = true;
			$playerChild.attr('src', '');

		} // onGoBack

		function onPlayAnotherVideo(e) {
			e.preventDefault();

			var _vindex, _siblings;

			_vindex = $(this).data('index');
			_siblings = $(this).siblings();

			history.pushState({data: push}, '', '/' + _vindex);

			$playerChild.attr('src', _cue[_vindex]);
			$(this).addClass('onair');
			_siblings.removeClass('onair');

		} // onPlayAnotherVideo

		function onSkipLoading(e) {
			e.preventDefault();
			hideLoader();
		} // onSkipLoading




		function onExtend(e) {
			e.preventDefault();

			if (is_extend === false) {
				$btnExtend.css('transform', 'rotateZ(180deg)');
				$listWrapper.animate({
					height: '80vh'
				}, 300);

				is_extend = true;
			}

			else {
				$btnExtend.css('transform', 'rotateZ(0deg)');
				$listWrapper.animate({
					height: 24
				}, 300);

				is_extend = false;
			}
		} // onExtend

		function onScrollLeft() {

			if ( is_first_scroll ) {

		    	var timer, count = 0;

		    	timer = setInterval(function () {
		    		$('.onplay').scrollLeft( $('.selected').position().left );
		    		count++;

		    		if ( count === 1 ) {
		    			clearInterval(timer);
		    			is_first_scroll = false;
		    		}
		    	}, 1500);
			}
		} // onScrollLeft


		/* Method function */
		function doPlayReset() {

			$playListChild.html('');
			$playerChild.attr('src', '');
			_cue = [];
			is_signal = true;
			i = 0;

		} // doPlayReset

		function showAnimation() {

				if (mql.matches) {

				    onResizeM();

				    tl_show_player
						.set($listWrapper, {opacity: 0, display: 'none'})
						.to($about, 0.5, {opacity: 0, display: 'none'})
						// .to($bg, 0.5, {backgroundColor: '#f2f2f2'})
						.to([$player, $playList, $listWrapper], 0.5, {opacity: 1, display: 'block'});

				} else {

					onResize();

					tl_show_player
						.to($about, 0.5, {opacity: 0, display: 'none'})
						// .to($bg, 0.5, {backgroundColor: '#f2f2f2'})
						.to([$player, $playList], 0.5, {opacity: 1, display: 'block'});

				}

				makeClass();
				$hanger.css('display', 'none');
				is_show = true;

		} // showAnimation

		function makeClass() {

			$mainList.toggleClass('onplay');
			$listWrapper.toggleClass('onplay-wrapper');
			_jqm.$celebJob.toggleClass('celeb-job-2');
			_jqm.$listItem.toggleClass('list-item-2');
			_jqm.$infoContainer.toggleClass('info-container-2');
			_jqm.$celebName.toggleClass('celeb-name-2');

		} // makeClass

});
