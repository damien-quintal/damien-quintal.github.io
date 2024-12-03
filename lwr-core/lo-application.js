(function(that) {
    "use strict";

    class LightningOut extends HTMLElement {
        iframeRef;
        lastWidth;
        ready = false;

        preload(endpoint, parentDomElement) {
            const iframe = that.document.createElement("iframe");
            const shadow = parentDomElement.attachShadow({ mode: "closed" });
            iframe.id = "lightning_af";
            iframe.name = "lightning_af";
            iframe.scrolling = "no" // USE style="overflow:hidden;"
            iframe.sandxox = "allow-downloads allow-forms allow-scripts";
            iframe.frameborder = 0;
            iframe.style = "position:relative;border:0;padding:5px;overflow:none;visibility:none;background-color:#FFFCB5;"
            iframe.width = iframe.style.width;
            iframe.height = iframe.style.height;
            iframe.onerror = (err) => alert("Error Loading iframe for " + iframe.src);
            iframe.onload = (event) => {
                this.iframeRef = event.target;
                adjustIframeSize();
                this.iframeRef.style.display = 'block'; // Show iframe when ready
            };
    
            // (1) Ensure that event.origin is set for all postMessage events.
            // (3) For events from the iframe to the host document. We will need to do the reverse.
            //     The target origin will need to be the URL of the host document and we will need to 
            //     check if it matches the URL of the host document before reading the message.
            //     This flow is trickier as we do not necessarily know the URL of the host document 
            //     from the iframe. However, from the iframe back to the host document is slightly less of
            //     a concern and we could set the targetOrigin to '*' for now and fix this up later.
            // function compareOrigin(eventOrigin) {
            //     eventOrigin === window.location.href; // TODO
            // }
    
            window.addEventListener("message", (event) => {
                switch(event.data.type) {
                    case 'lo.iframeSize':
                        break;
                    case 'lo.dispatchEvent':
                        debugger;
                        const customEvent = new CustomEvent(event.data.name, { detail: event.data.detail });
                        parentDomElement.dispatchEventComponent(customEvent);
                        break;
                    case "lo.ready":
                        debugger;
                        parentDomElement.ready = true;
                        break;
                }
            });
    
            shadow.appendChild(iframe);
            iframe.src = endpoint;
        }
    
        adjustIframeSize() {
            const handleResize = () => {
              const { clientWidth } = this;
              if (this.lastWidth !== clientWidth) {
                this.lastWidth = clientWidth;
                // pushing the size of the iframe element into the embeded app
                // in case it needs to adjust its size. this covers the case in which
                // the host page forces the embeded element to be smaller in size
                this.iframeRef.contentWindow.postMessage({
                  type: 'lo.wrapper-size',
                  width: clientWidth,
                }, '*');
              }
            };
            // Initial resizing logic or adjustments post-load
            window.addEventListener("lo.resize", handleResize);
            handleResize();
        }

        addEventListener(eventName) {
            super.addEventListener(...arguments);
            debugger;
            this.iframeRef.contentWindow.postMessage({
                name: eventName,
                type: 'lo.addEventListener',
            }, '*');
        }

        dispatchEvent(event) {
            super.dispatchEvent(...arguments);
            debugger;
            this.iframeRef.contentWindow.postMessage({
                name: event.type,
                detail: event.detail,
                type: 'lo.dispatchEvent',
            }, '*');
        }

        dispatchEventComponent() {
            debugger;
            super.dispatchEvent(...arguments);
        }

        adoptedCallback() {
            this.remove();
        }
        connectedCallback() {
            this.preload("https://trialorgfarmforu3.my.localhost.sfdcdev.site.com:7443/lp/lo", this)
        }
    }
    customElements.define("lo-lwr-application", LightningOut);
})(this);
