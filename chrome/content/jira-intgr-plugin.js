Components.utils.import("resource:///modules/gloda/mimemsg.js");

var JIP = {	
	onLoad : function(event) {
		this.initialized = true;		
		var req = new XMLHttpRequest();
		try {			
			JIP.getProjects(req);						
		} catch (err) {
			alert("Could not retrieve list of projects: " + err)
		}
		req = null;
	},

	getProjects : function(r) {
		var data = "";
		var req = r;
		req.open('GET', JIPConfig.serverIp + '/rest/api/2/project',false);
		req.setRequestHeader("Authorization", "Basic " + btoa(JIPConfig.userName + ":" + JIPConfig.userPassword ));

		req.send(null);
		if (req.status == 200) {
			data = req.responseText;
		}

		var list = JSON.parse(data);
		var projects = document.getElementById("jip.export.changerequest.add.project");

		for(var i = 0, size = list.length; i < size ; i++){
			var item = list[i];		 
			var newEle = document.createElement("menuitem");
			var label = document.createAttribute("label");
			var id = document.createAttribute("value");
			label.nodeValue = item.name;
			id.nodeValue = item.key;  	     
			newEle.setAttributeNode(id);
			newEle.setAttributeNode(label);			
			projects.getElementsByTagName("menupopup")[0].appendChild(newEle);		   
		}		
	},

	getTitle : function () {		
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator("");
		var it = true;
		var mainWindow = "";
		while (enumerator.hasMoreElements() && it) {
			var win = enumerator.getNext();
			var currentId = win.document.getElementById("expandedsubjectBox");
			if (currentId = !null) {
				
				it = false;
				mainWindow = win.document;

			}
		}

		var val = mainWindow.getAnonymousNodes(mainWindow.getElementById('expandedsubjectBox'))[0].getAttribute("aria-label").substring(9);

		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"].
		  getService(Components.interfaces.nsIWindowMediator).
		  getMostRecentWindow("mail:3pane");		

		val = win.gFolderDisplay.selectedMessage.mime2DecodedSubject;

		MsgHdrToMimeMessage(win.gFolderDisplay.selectedMessage, null, function (aMsgHdr, aMimeMessage) {	    
	       var editor = document.getElementById("t1");
	       editor.contentDocument.designMode = 'on';
		   editor.contentDocument.execCommand("inserthtml", false, aMimeMessage.coerceBodyToPlaintext());
		   editor.contentDocument = aMimeMessage.coerceBodyToPlaintext();
	      }, true);
	    
	    
		document.getElementById("jip.export.changerequest.add.title").value = val;
	},

	sendChangeRequest : function() {		
		var title = document
				.getElementById("jip.export.changerequest.add.title").value;		
		var priority = document
				.getElementById("jip.export.changerequest.add.priority").value;		
		var project = document
				.getElementById("jip.export.changerequest.add.project").value;		
		var editor = document.getElementById("t1");

		var payload = {};
		payload.fields = {};
		payload.fields.project = {};
		payload.fields.project.key = project;
		payload.fields.summary = title;
		if (editor) payload.description = (new XMLSerializer()).serializeToString(editor.contentDocument);		
		payload.fields.issuetype = {};
		payload.fields.issuetype.name = "Task";		
		
		var regex = /(<([^>]+)>)/ig		
		payload.fields.description = payload.description.replace(regex, "");
		
		var req = new XMLHttpRequest();				
		req.open('POST', JIPConfig.serverIp + '/rest/api/2/issue',false);		
		req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");	
		req.setRequestHeader("Authorization", "Basic " + btoa(JIPConfig.userName + ":" + JIPConfig.userPassword ));
		req.setRequestHeader("X-Atlassian-Token", "nocheck");
		req.setRequestHeader("Origin", JIPConfig.serverIp);


		req.onreadystatechange = function() {
		    if (req.readyState == 4) {
		        alert("JIRA Issue created.");
		    } else {
		    	alert("Could not create JIRA Issue.");
		    }
		}	

		req.send(JSON.stringify(payload));		
	}
};

function readBody(xhr) {
    var data;
    if (!xhr.responseType || xhr.responseType === "text") {
        data = xhr.responseText;
    } else if (xhr.responseType === "document") {
        data = xhr.responseXML;
    } else {
        data = xhr.response;
    }
    return data;
}

var JIPConfig = {
	prefs : null,
	userName : "",
	userPassword : "",
	serverIp : "",		

	startup : function() {
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService).getBranch("jip.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefs.addObserver("", this, false);
		this.userName = this.prefs.getCharPref("userName");
		this.userPassword = this.prefs.getCharPref("userPassword");
		this.serverIp = this.prefs.getCharPref("serverIp");					
	},
	shutdown : function() {
		this.prefs.removeObserver("", this);
	},
	observe : function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		switch (data) {
		case "userName":
			this.userName = this.prefs.getCharPref("userName");
			break;
		case "userPassword":
			this.userName = this.prefs.getCharPref("userPassword");
			break;
		case "serverIp":
			this.userName = this.prefs.getCharPref("serverIp");
			break;		
		}
	},
	watchStock : function(newSymbol) {
		this.prefs.setCharPref("userName", newSymbol);
	}
}


// Not working, FIXME :-(
/*window.addEventListener("load", JIPConfig.startup, true);
window.addEventListener("unload", JIPConfig.shutdown, true);
window.addEventListener("load", JIP.onLoad, true);*/

// Workaround
function initJIB() {
	JIPConfig.startup();
	JIP.onLoad();
	JIP.getTitle();
}

setTimeout(initJIB, 100);