/**
 * a mole entity
 * note : we don't use EntityObject, since we wont' use regular collision, etc..
 */

game.MoleEntity = me.AnimationSheet.extend(
{	
	init:function (x, y) {
		// call the constructor
		this.parent(x, y , me.loader.getImage("mole"), 178, 140);
		
		// idle animation
		this.addAnimation ("idle",  [0]);
		// laugh animation
		this.addAnimation ("laugh",  [1,2,3,2,3,1]);
		// touch animation
		this.addAnimation ("touch",  [4,5,6,4,5,6]);
		
		// set default one
		this.setCurrentAnimation("idle");
		
		// means fully hidden in the hole
		this.isVisible = false;
		this.isOut = false;
		this.timer = 0;
		
		this.initialPos = this.pos.y;
		
		// tween to display/hide the moles
		this.displayTween = null;
		this.hideTween = null;
		
		// register on mouse event
		me.input.registerPointerEvent('mousedown', this, this.onMouseDown.bind(this));
		me.input.registerPointerEvent('mousemove', this, this.onMouseMove.bind(this));

	},
	
	
	/**
	 * callback for mouse click
	 */
	onMouseDown : function() {
		if (this.isOut == true) {
			this.isOut = false;
			// set touch animation
			this.setCurrentAnimation("touch", this.hide.bind(this));
			// make it flicker
			this.flicker(20);
			// play ow FX
			me.audio.play("ow");

			// stop propagating the event
			return false;
			
		};
	},

	onMouseMove : function() {

		//console.log(me.input.mouse.pos)
	},
	
	
	/**
	 * display the mole
	 * goes out of the hole
	 */
	display : function() {
		var finalpos = this.initialPos - 140;
		this.displayTween = new me.Tween(this.pos).to({y: finalpos }, 200);
		this.displayTween.easing(me.Tween.Easing.Quadratic.EaseOut);
		this.displayTween.onComplete(this.onDisplayed.bind(this));
		this.displayTween.start();
		// the mole is visible
		this.isVisible = true;
	},
	
	/**
	 * callback when fully visible
	 */
	onDisplayed : function() {
		this.isOut = true;
		this.timer = me.timer.getTime();
	},
	
	/**
	 * hide the mole
	 * goes into the hole
	 */	
	hide : function() {
		var finalpos = this.initialPos;
		this.displayTween = new me.Tween(this.pos).to({y: finalpos }, 200);
		this.displayTween.easing(me.Tween.Easing.Quadratic.EaseIn);
		this.displayTween.onComplete(this.onHidden.bind(this));
		this.displayTween.start()
	},

	/**
	 * callback when fully visible
	 */
	onHidden : function() {
		this.isVisible = false;
		// set default one
		this.setCurrentAnimation("idle");
	},

	
	/**
	 * update the mole
	 */
	update : function ()
	{	
		if (this.isVisible) {
			// call the parent function to manage animation
			this.parent();
		
			// hide the mode after 1/2 sec
			if (this.isOut===true) {
				if ((me.timer.getTime() - this.timer) > 500){
					this.isOut = false;
					// set default one
					this.setCurrentAnimation("laugh");
					this.hide();
					// play laugh FX
					//me.audio.play("laugh");
				}
			}
		}
		return this.isVisible;
	}
});

/**
 * a mole manager (to manage movement, etc..)
 */
game.MoleManager = me.ObjectEntity.extend(
{	
	moles : [],
	
	timer : 0,
		
	init: function ()
	{
		var settings = {};
		settings.width = 10;
		settings.height = 10;
		// call the parent constructor
		this.parent(0, 0, settings);
		
		// add the first row of moles
		for ( var i = 0; i < 3; i ++) {
			this.moles[i] = new game.MoleEntity((112 + (i * 310)), 127+40)
			me.game.add (this.moles[i], 15);
		}
		
		// add the 2nd row of moles
		for ( var i = 3; i < 6; i ++) {
			this.moles[i] = new game.MoleEntity((112 + ((i-3) * 310)), 383+40)
			me.game.add (this.moles[i], 35);
		}
		
		// add the 3rd row of moles
		for ( var i = 6; i < 9; i ++) {
			this.moles[i] = new game.MoleEntity((112 + ((i-6) * 310)), 639+40)
			me.game.add (this.moles[i], 55);
		}
		
			
		this.timer = me.timer.getTime();
		
	},

	/*
	 * update function
	 */
	update : function ()
	{
		// every 1/2 seconds display moles randomly
		if ((me.timer.getTime() - this.timer) > 500) {

			for (var i = 0; i < 9; i+=3) {
				var hole = Number.prototype.random(0,2) + i ;
				if (!this.moles[hole].isOut && !this.moles[hole].isVisible) {
					this.moles[hole].display();
				}
			
			}
			this.timer = me.timer.getTime();
		}

		this.socket();

 		return false;
	},

	socket : function () 
	{	

		socket.emit('mousemove',{
				'x': me.input.mouse.pos.x,
				'y': me.input.mouse.pos.y,
				'id': id 
		});

		socket.on('moving', function (data) 
		{
			if(! (data.id in clients)){
				// a new user has come online. create a cursor for them
				//cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
				window[id] = new game.otherMouse( 200, 500, { image: "pointer", spritewidth: 22, spriteheight: 22 }); 
				//me.entityPool.add("otherMouse1", otherMouse); 
			    me.game.add(window[id], 999);  
			    me.game.sort();    

			    mouseCount++;
			}
			
			// me.input.mouse.pos.x = data.x;
			// me.input.mouse.pos.y = data.y;

			// Saving the current client state
			clients[data.id] = data;
			clients[data.id].updated = $.now();
		});
	},
});

game.otherMouse = me.AnimationSheet.extend({

	init: function(x, y, distance, altitude) {

		this.parent(x, y, me.loader.getImage("pointer"));
		this.id = id;
		this.addAnimation("particle", [0]);
        this.setCurrentAnimation("particle");
	},

	update : function() {

		var self = this;
		
		socket.on('moving', function (data) 
		{	
			// If not client's own data
			// if (data.id == self.id)
			// {
				self.pos.x = data.x
				self.pos.y = data.y
			// }
		});

        self.parent(); 
        return true;
	},
});
