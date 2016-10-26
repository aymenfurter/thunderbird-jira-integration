var JIP = {
  onLoad: function() {    
    this.initialized = true;
  },  
  openChangeRequest: function() {
    window.open("chrome://jira-intgr-plugin/content/sendChangeRequest.xul", "", "chrome");
  }
};

window.document.addEventListener("load", function(e) { JIP.onLoad(e); }, false); 