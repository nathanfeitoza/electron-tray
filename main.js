const {app, Tray, Menu, BrowserWindow, dialog} = require('electron');
const path = require('path');
var http = require('http'),
curl = new (require( 'curl-request' ))();
matar_servidor = require('./matar_server.js');

const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;
let win = null;


var servidor = {
	con: null,
	set Server(s){
		this.con = s;
	},
	get Server(){
		return this.con;
	}
}
function MSG(msg,buttons,callback) {
	let tipo_botoes = typeof buttons;
	buttons = tipo_botoes == "undefined" || tipo_botoes == "function" ? ['Ok'] : buttons
	const Mensagem = {
	type: 'info',
	title: 'Information',
	message: msg,
	buttons: buttons
  }
	dialog.showMessageBox(Mensagem, (index) => {

		if(typeof callback == "function"){
			callback(index);
		} else if(typeof buttons == "function") {
			buttons(index);
		}
    //event.sender.send('information-dialog-selection', index)
  })
}

function MsgServidor(tipo, callback) {
	var msg = '';//,botoes = ['Ok'];
	switch(tipo) {
		case 1: 
			msg = 'Desligar Servidor?';
			break;
		case 2:
			msg = "Reiniciar Servidor?"
			//botoes = ['Sim','Não']
	}
	  MSG(msg,['Sim','Não'],function(index){
	  	if(typeof callback == "function") {
	  		callback(index);
	  	}
	  })
}

function IniciarServidor() {
	var server = http.createServer(function(req,res) {
	  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
	  res.end('Olá mundo!');
	});
	server.listen(1212);
	
	servidor.con = server;

	matar_servidor(servidor.con);
}

function MatarServidor(servidor_des,com_mesagem){

	if(com_mesagem){
		MsgServidor(1, function(ret){
			if(ret == 0) {
				servidor_des.destroy();
				MSG('Servidor Desligado!');
			}
		});
	} else {
		servidor_des.destroy();
	}
}

function ReiniciarServidor(){
	MsgServidor(2, function(ret){
		if(ret == 0) {
			if(servidor.con != null) {
				MatarServidor(servidor.con)
			}
			IniciarServidor();
		}
	});
	
}
IniciarServidor();


function EnviarCurl() {
	console.log('OKAY');
	//MSG('OKAY')
		curl
	.setHeaders([
	    'Content-Type: multipart/form-data'
	])
	.setMultipartBody([{
	  name: 'text',
	  contents: 'my text my text'
	}/*, {
	  name: 'file',
	  file: './yourimage.png',
	  type: 'image/png'
	}*/])
	.post('https://www.google.com')
	.then(({statusCode, body, headers}) => {
	    MSG( JSON.stringify([statusCode, body, headers]) )
	})
	.catch((e) => {
	    MSG( JSON.stringify([e]) );
	});
}

// Para matar o servidor depois de algum tempo
/*var t = setInterval(function(){

  const options = {
	type: 'info',
	title: 'Information',
	message: "Servidor desligado",
	buttons: ['Ok']
  }

	server.destroy();
	dialog.showMessageBox(options, (index) => {
	    //event.sender.send('information-dialog-selection', index)
	  })
	clearInterval(t);
},6000);*/

app.on('ready', function(){
  win = new BrowserWindow({show: false});
  appIcon = new Tray(iconPath);
  /*setInterval(function(){
	  	  dialog.showMessageBox(options, (index) => {
	    //event.sender.send('information-dialog-selection', index)
	  })
  }, 5000)*/
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Desligar Servidor',
      //type: 'radio',
      icon: iconPath,
      click: function(){
      	MatarServidor(servidor.con,true);
      }
    },
    /*{
      label: 'Item2',
      submenu: [
        { label: 'submenu1' },
        { label: 'submenu2' }
      ]
    },*/
    {
      label: 'Reiniciar Servidor',
      click: function(){
      	ReiniciarServidor();
      }
      //type: 'radio',
      //checked: true
    },
    {
    	label: 'Testar Curl',
    	click: function(){
    		EnviarCurl();
    	}
    },
    /*{
      label: 'Toggle DevTools',
      accelerator: 'Alt+Command+I',
      click: function() {
        win.show();
        win.toggleDevTools();
      }
    },*/
    { label: 'Sair',
      accelerator: 'Command+Q',
      click: function(){
      	MSG('Você quer mesmo sair?', ['Sim','Não'], function(ret){
      		if(ret == 0) {
      			MatarServidor(servidor.con);
      			app.quit();
      		}
      	})
      },
    }
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
    var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Desligar Servidor',
      //type: 'radio',
      icon: iconPath,
      click: function(){
      	MatarServidor(servidor.con,true);
      }
    }]);


    // Para modificar o menu com a aplicação em execução
    /*var t = setInterval(function(){
	    var contextMenu = Menu.buildFromTemplate([
	    {
	      label: 'Desligar Servidor',
	      //type: 'radio',
	      icon: iconPath,
	      click: function(){
	      	MatarServidor(servidor.con,true);
	      }
	    }]);

	    //appIcon.setToolTip('This is my application.');
	  	appIcon.setContextMenu(contextMenu);

    	clearInterval(t);
    }, 10000)*/
});
