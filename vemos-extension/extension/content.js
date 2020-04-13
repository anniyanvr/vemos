/* global require */

const EXTENSION_ID = "vemos-container";
const IFRAME_ID = "vemos-frame";

class ContentScript {
  get browser() {
    return window.browser || window.chrome;
  }

  injectVemos() {
    if (document.body && document.contentType !== "application/pdf") {
      this.injectExtensionFrame();
      this.injectEmberApp();
      let iframe = document.getElementById(IFRAME_ID);
      require("vemos-plugin/app")["default"].create({
        rootElement: iframe.contentDocument.body,
      });

      let script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "vemos-netflix-reference";
      script.innerHTML = `
        console.log('Vemos - Adding Netflix API Listener');
        window.addEventListener("message", (event) => {
          if (event.data.vemosSeekTime) {
            console.log("VEMOS Neflix API seek", event.data.vemosSeekTime);
            let videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
            let player = videoPlayer.getVideoPlayerBySessionId(
              videoPlayer.getAllPlayerSessionIds()[0]
            );
            player.seek(Math.round(Number(event.data.vemosSeekTime)) * 1000);
          }
        });
      `;
      document.head.appendChild(script);
    }
  }

  injectExtensionFrame() {
    let vemosExtension = document.createElement("div");
    vemosExtension.id = EXTENSION_ID;
    let iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.frameBorder = 0;
    vemosExtension.appendChild(iframe);
    document.body.insertAdjacentElement("afterEnd", vemosExtension);
    iframe.contentDocument;
  }

  injectEmberApp() {
    const iframe = window.document.getElementById(IFRAME_ID);
    this.injectFrameTemplate(iframe);
  }

  injectFrameTemplate(iframe) {
    iframe.contentDocument.open();
    iframe.contentDocument.write(`
      <html id="vemos-html">
        <head>
          <title>Vemos</title>
          <link rel="stylesheet" type="text/css" href="${this.browser.runtime.getURL(
            "assets/app.css"
          )}" />
        </head>
        <body id="vemos-body"></body>
      </html>
    `);
    iframe.contentDocument.close();
    iframe.contentWindow.VEMOS_NETFLIX_PLAYER = window.VEMOS_NETFLIX_PLAYER;
  }
}

if (window.VEMOS_PEER_ID) {
  let contentScript = new ContentScript();
  contentScript.injectVemos();
}

let browser = window.browser || window.chrome;

console.log("Adding Vemos message listener");
browser.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.startVemos) {
    console.log("Message received. Starting Vemos!");
    let contentScript = new ContentScript();
    contentScript.injectVemos();
    sendResponse(true);
  }
});
