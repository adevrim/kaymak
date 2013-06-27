(function($) {

// Variables

var memory = [];
var drag_distance = 0;

var isMouseOver = [];
var isDragging = [];
var DragEventTimeStamp = [];
var AutoOn = [];

var duration = [];
var action_type = [];
var auto = [];
var drag = [];
var click = [];

var kaymak = [];
var int = [];
var i = 0;

// Thumber

$.fn.kThumbnail = function( opt ) { 

	opt = $.extend({
	
		icon: 'number', // number,point,html,thumbnail
		content: '',
		kaymak_id:''
				
	}, opt );

	$kThumbnail = $(this);
	$kaymakId = opt.kaymak_id;
	var i = 0;

	$($kaymakId).find("li").each(function(){
		
		if(opt.icon == "number"){ $icon = i+1 ;}
		
		if(opt.icon == "point"){ $icon = "&bull;" ;}
		
		if(opt.icon == "html"){ $icon = opt.content ;}
		
		if(opt.icon == "thumbnail"){ $icon = '<img src="'+$(this).attr("data-thumbnail") + '">' ;}
		
		$kThumbnail.append('<div class="kaymak-thumb-block" data-block-number="'+i+'">'+ $icon +'</div>');		
		
		i++;
	});


	$kThumbnail.find(".kaymak-thumb-block").hammer().bind('release',function(ev) {	 
		
	$($kaymakId).kGo($(this).attr("data-block-number"),true);
		
	});
	
	
}

// Navigate helper

$.fn.kNavigate = function(direction) {
	
	var opt = memory[$(this).data('k_id')];

	var kID = opt.kid;

	$ViewportCount = $(this).parent().width() / $(this).children("li").eq(0).width();
	$BlockCount = $(this).children("li").length;
	$DragLimit = $BlockCount - $ViewportCount-1;
	$LastLimit = $DragLimit+1;
	
	if(direction=="prev"){
	
		if( opt.current_block == 0 ){
		
		opt.current_block = $LastLimit;
			
		}else{	
		
		opt.current_block--;
		
		}

	}
	
	if(direction=="pageprev"){
	
	$prevPageBlock = opt.current_block - $ViewportCount ;
	
		if( opt.current_block == 0 ){

			opt.current_block = $LastLimit;
			
		}else if( $prevPageBlock < 0 ){
	
			opt.current_block = 0 ;
		
		}else{
						
			opt.current_block = $prevPageBlock;
						
		}

	}	
		
	if(direction=="next"){
	
		if( opt.current_block > $DragLimit ){
	
			opt.current_block = 0;
		
		}else{
						
		opt.current_block++;
						
		}
	
	}
	
	if(direction=="pagenext"){
	
	$nextPageBlock = opt.current_block + $ViewportCount ;
	
		if( opt.current_block == $LastLimit ){

			opt.current_block = 0;
			
		}else if( $nextPageBlock > $LastLimit ){
	
			opt.current_block = $LastLimit;
		
		}else{
						
			opt.current_block = $nextPageBlock;
						
		}

	}
	
	
	if(duration[kID] != 0){
	clearInterval(int[kID]); // reset interval
	}
	
	memory[$(this).data('k_id')] = opt;

	$(this).kGo(opt.current_block,true);
	
	if(duration[kID] != 0){
	setTimeout(function() {	
	
		int[kID] = setInterval(function() { if (AutoOn[kID] == true) { 
		
		if(auto[kID]=="page"){ kaymak[kID].kNavigate("pagenext"); }
		if(auto[kID]=="block"){ kaymak[kID].kNavigate("next"); }
		
		}; }, duration[kID]);	
	
	}); // start interval again
	
	}
}

// Offset helper

$.fn.kOffset = function(offset,snap) {
	var opt = memory[$(this).data('k_id')];
	
	$DragLimitedSelfWidth = $(this).width() - 50; 
	$DragLimitedChildWidth = $(this).children("li").eq(0).width()-50;

	if (snap) {
	
		if(opt.height_auto == "enable"){
	
			$marginTB = parseInt($(this).children("li").eq(opt.current_block).find(".height-auto").find("img").css("marginTop"),10) + parseInt($(this).children("li").eq(opt.current_block).find(".height-auto").find("img").css("marginBottom"),10);

			$bh=$(this).children("li").eq(opt.current_block).find(".height-auto").height();
		
			if(opt.content == "image"){
				$(this).parent(".kaymak-container").stop().animate({height:$bh+$marginTB},400);
			}else{
				$(this).parent(".kaymak-container").stop().animate({height:$bh},400);
			}

	
		};

		$(this).stop().animate({
			left: offset
		},400);
		
	} else {
	
		if(0<offset && offset>$DragLimitedChildWidth){
			changed_offset=$DragLimitedChildWidth;
		}else if(0>offset && offset<-$DragLimitedSelfWidth){
			changed_offset=-$DragLimitedSelfWidth;
		}else{
			changed_offset=offset
		}
	
		$(this).css('left',changed_offset+'px');
	}
	
}

// GoTo helper

$.fn.kGo = function(block,snap) {

	var opt = memory[$(this).data('k_id')];
	
	opt.current_block = block;
	if (opt.current_block < 0) {
		opt.current_block = 0;
	}
	if (opt.current_block >= opt.block_count) {
		opt.current_block = opt.block_count-1;
	}

	newoffset =  -(opt.current_block * opt.width);
	opt.offset=newoffset;

	if (opt.current_block_element) {
		$(opt.current_block_element).html(opt.current_block+1);
	}

	

	$(this).kOffset(opt.offset,snap);

}
// 
// 
// 
// 
// 
// Kaymak core
// 
// 
// 
// 
// 
$.fn.kaymak = function( opt ) {

// opt & Variables

	$childWidth = $(this).children("li").eq(0).width();
	
	$selfWidth = $childWidth * $(this).children("li").length;
	
	$(this).css({width: $selfWidth});

	opt = $.extend({
	
		action: 'none', // auto,none
		auto:'block', // block,page
		drag:'block', // block,page
		click:'none', // full,none
		duration: 0, // min:1000
		content:'empty', // image,empty
		responsive:'no', // enable,no
		height_auto:'no', // enable,no,fixed
		caption:'enable', // auto
		
				
		offset: 0,
		total_block: $(this).children("li").length,
		turn_threshold: 0.1,
		current_block: 0,
		width:	$childWidth	
	
	}, opt );

// Responsive image block generator

if(opt.content == "image"){

	$(this).children("li").each(function(){
			
		if($(this).attr("data-caption")=="enable"){
		
		$blockCaption = '<div class="kaymak-image-caption"><center><span>'+ $(this).html() +'</span></center></div>';
			
		}else{
			
		$blockCaption = " ";
			
		}
		
		$blockImage = $(this).attr("data-image");
		$blockWidth = $(this).attr("data-width");
		$blockHeight = $(this).attr("data-height");
	
		$(this).html('<div class="responsive height-auto kaymak-image" onmousedown="event.preventDefault ? event.preventDefault() : event.returnValue = false"><center><img src="'+ $blockImage +'" width="'+ $blockWidth +'" height="'+ $blockHeight +'">' + $blockCaption + '</center></div>');
		
	});

};
// Let the party begun !	

	
	this.each(function(){
		
		var kID = i;
		i++;

		opt.kid = kID;
		
		action_type[kID] = opt.action;
		duration[kID] = opt.duration;
		
		auto[kID] = opt.auto;
		drag[kID] = opt.drag;
		click[kID] = opt.click;

		kaymak[kID] = $(this);
		
		isMouseOver[kID] = false;
		isDragging[kID] = false;
		AutoOn[kID] = true;
	

	if(opt.caption == "auto"){
	
		$(".kaymak-image-caption").hide();
	
		kaymak[kID].bind('mouseover',function(){
			
			$(this).find(".kaymak-image-caption").slideDown();
			
		});
		
		kaymak[kID].bind('mouseleave',function(){
			
			$(this).find(".kaymak-image-caption").slideUp();
			
		});
	
	};


// is Responsive

if(opt.responsive == "enable"){

	function responsiveEnable(){
		
		$pw=kaymak[kID].parents(".kaymak-container").width();
	
		opt.width = $pw;
		
			if(opt.content == "image"){
			
				kaymak[kID].find(".responsive").each(function(){

					$marginLR = parseInt($(this).find("img").css("marginLeft"),10) + parseInt($(this).find("img").css("marginRight"),10);
					$marginTB = parseInt($(this).find("img").css("marginTop"),10) + parseInt($(this).find("img").css("marginBottom"),10);
				
					if($(this).parent().attr("data-width") > $pw){
						
						$(this).find("img").width($pw - $marginLR);
						
						var $bhr= $(this).parent().attr("data-height")  * ($pw / $(this).parent().attr("data-width"))
						
						$(this).find("img").height($bhr - $marginTB);
						
					}else{
						
						$(this).find("img").width($(this).parent().attr("data-width") - $marginLR);
						$(this).find("img").height($(this).parent().attr("data-height") - $marginTB);
					}
					
				});

			};	
			
		kaymak[kID].css({ width: ($pw * opt.total_block) });
		
		kaymak[kID].children("li").css({ width: $pw });
	
	}
		
	responsiveEnable();						
	$(window).bind("resize",function() { responsiveEnable(); kaymak[kID].kGo(0,true); });

};

// Auto Height Fixed

if(opt.height_auto == "fixed"){

	function heightAutoFixed(){
	
		var $biggestHeight = 0 ;
	
		kaymak[kID].find("li").each(function(){
			
			$bh = $(this).height();
			
			if ( $bh > $biggestHeight ){ $biggestHeight = $bh }
			
		}).each(function(){
		
			$(this).stop().css({marginTop: ($biggestHeight-$(this).height())/2 });
		
		});

		kaymak[kID].parents(".kaymak-container").css({height : $biggestHeight})	
	
	}

	heightAutoFixed();
	$(window).bind("resize",function() { heightAutoFixed(); });

};	

// Auto Height

if(opt.height_auto == "enable"){

		kaymak[kID].find("li").each(function(){
			
			$bh=$(this).height();

			$marginTB = parseInt($(this).find("img").css("marginTop"),10) + parseInt($(this).find("img").css("marginBottom"),10);
			
				if(opt.content == "image"){
					$(this).css({height:$bh+$marginTB});
				}else{
					
					$(this).css({height:$bh});
					
				}
		
		});

};		
// Click option

	if(click[kID]=="full"){
		kaymak[kID].css("cursor","pointer");
	}
	
// If Kaymak is on Auto Mode !	
	
	if(action_type[kID]=="auto"){
	
		int[kID] = setInterval(function() { if (AutoOn[kID] == true) { 
		
		if(auto[kID]=="page"){ kaymak[kID].kNavigate("pagenext"); }
		if(auto[kID]=="block"){ kaymak[kID].kNavigate("next"); }
		
		}; }, duration[kID]);	
		
// Auto Function Mouse Events

	kaymak[kID].bind('mouseover',function(ev) {
	
		isMouseOver[kID] = true;
	
		AutoOn[kID] = false;

		clearInterval(int[kID]);

	}).bind('mouseleave',function(ev) {

		isMouseOver[kID] = false;
		
		if(isDragging[kID] == true){
			
			AutoOn[kID] = false;
			
		}else{
			
			AutoOn[kID] = true;

			setTimeout(function() {
				int[kID] = setInterval(function() { if (AutoOn[kID] == true) { 
				
				if(auto[kID]=="page"){ kaymak[kID].kNavigate("pagenext"); }
				if(auto[kID]=="block"){ kaymak[kID].kNavigate("next"); }
				
				}; }, duration[kID]);	
			});
			
		}



	});
	
	} // Auto Mode - End !

// Hammer time !
		
		kaymak[kID].hammer({
			drag_vertical: false,
			swipe_time: 20
		});

// Block opt
			
		opt.block_count = $(this).children('li').length;
			
		if (opt.total_blocks_element) {
			$(opt.total_blocks_element).html(opt.block_count);
		}
		
		
		if (opt.current_block_element) {
			$(opt.current_block_element).html(opt.current_block+1);
		}
			
// Drag start event		
						
		kaymak[kID].bind('dragstart',function(ev) {
			
			if (ev.gesture.direction=='left' || ev.gesture.direction=='right') {
				drag_distance = 0;
			}


// Drag

			isDragging[kID] = true;
			
// Auto Function	
		
			if(action_type[kID]=="auto"){

				AutoOn[kID] = false;
				clearInterval(int[kID]);
				
			}
			
		});	
		
// Drag event click
			
	kaymak[kID].children("li").bind('release',function(ev) {	

	
		if(DragEventTimeStamp[kID] < (event.timeStamp-500) || DragEventTimeStamp[kID]==undefined ){
			
			
			if(click[kID]=="full"){
				
				$target=$(this).attr("data-target");
				if($target==undefined){$target="_self"};
		    	$url = $(this).attr("data-link");
				window.open($url, $target);	

			}
			
		}
	
	});
	
// Drag  event		

		kaymak[kID].bind('drag',function(ev) {
			if (ev.gesture.direction=='left' || ev.gesture.direction=='right') {
				drag_distance = ev.gesture.deltaX;	
				var opt = memory[$(this).data('k_id')];
				$(this).kOffset(opt.offset+drag_distance);

			}

		});		

// Drag end event

		kaymak[kID].bind('dragend',function(ev) {

// Drag false

				isDragging[kID] = false;
				DragEventTimeStamp[kID] = event.timeStamp;
				
// Auto Function

			if(action_type[kID]=="auto"){
	
	
				if(isMouseOver[kID] == false){
			
					AutoOn[kID] = true;
							
					setTimeout(function() {
						int[kID] = setInterval(function() { if (AutoOn[kID] == true) { 
						
						if(auto[kID]=="page"){ kaymak[kID].kNavigate("pagenext"); }
						if(auto[kID]=="block"){ kaymak[kID].kNavigate("next"); }
						
						}; }, duration[kID]);	
					});

				}else{
			
					AutoOn[kID] = false;
			
				}		
		
			}		

// Check only drag left & drag right event
		
			if (ev.gesture.direction=='left' || ev.gesture.direction=='right') {		

				var opt = memory[$(this).data('k_id')];	

// Treshold fixer for last and first block
				
				if (ev.gesture.direction=='left') {
					if( opt.current_block==opt.block_count-1){turn_threshold_edited=0.6;}else{turn_threshold_edited=opt.turn_threshold;}
				}			
					
					
				if (ev.gesture.direction=='right') {	
					if( opt.current_block==0){turn_threshold_edited=0.6;}else{turn_threshold_edited=opt.turn_threshold;}
				}

// Viewable block count & put drag limit			

				$ViewportCount = $(this).parent().width() / $(this).children("li").eq(0).width();
				$BlockCount = $(this).children("li").length;
				$DragLimit = $BlockCount - $ViewportCount-1;
				$LastLimit = $DragLimit+1;
				
// is draggable ?					
					
				if (Math.abs(drag_distance / opt.width) > turn_threshold_edited) {
				
				
// Drag left aka Go to next block	
				
					if (ev.gesture.direction=='left') {
							
						if(drag[kID]=="block"){
						
							if( opt.current_block > $DragLimit ){
						
								opt.current_block = 0;
							
							}else{
											
							opt.current_block++;
											
							}
						
						}
						
						if(drag[kID]=="page"){
						
						$nextPageBlock = opt.current_block + $ViewportCount ;
						
							if( opt.current_block == $LastLimit ){
					
								opt.current_block = 0;
								
							}else if( $nextPageBlock > $LastLimit ){
						
								opt.current_block = $LastLimit;
							
							}else{
											
								opt.current_block = $nextPageBlock;
											
							}
					
						}
							
					}
					
// Drag right aka Go to previous block
					
					if (ev.gesture.direction=='right') {
								
						if(drag[kID]=="block"){
						
							if( opt.current_block == 0 ){
							
							opt.current_block = $LastLimit;
								
							}else{	
							
							opt.current_block--;
							
							}
					
						}
						
						if(drag[kID]=="page"){
						
						$prevPageBlock = opt.current_block - $ViewportCount ;
						
							if( opt.current_block == 0 ){
					
								opt.current_block = $LastLimit;
								
							}else if( $prevPageBlock < 0 ){
						
								opt.current_block = 0 ;
							
							}else{
											
								opt.current_block = $prevPageBlock;
											
							}
					
						}				
							
					}
					
				
				} // is draggable ? - End			
				
// Call GoTo helper

			memory[$(this).data('k_id')] = opt;
			$(this).kGo(opt.current_block,true);		
									
	
			} // Check only drag left & drag right event - End	

		}); // drag end - End

	}); // party over

		$(this).data('k_id',memory.length);
		memory[$(this).data('k_id')] = opt;

	
} // kaymak - End

})(jQuery);