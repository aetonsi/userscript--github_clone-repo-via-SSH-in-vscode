// ==UserScript==
// @name         github_clone-repo-via-SSH-in-vscode
// @namespace    https://aetonsi.net/
// @version      0.0.1-2025-02-17
// @description  uses vscode: protocol + SSH URI to clone any repo to local disk
// @author       aetonsi
// @match        https://github.com/*
// @connect      img.shields.io
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @run-in       normal-tabs
// @run-in       incognito-tabs
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        window.onurlchange
// @run-at       document-start
// @tag          utilities

// ==/UserScript==


(function() {
    'use strict';
    const b64VsCodeLogoSvgDataUri = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiB2ZXJzaW9uPSIxLjEiPgogICAgPGcgZmlsbD0iIzAwN2FjYyI+CiAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIzMCw2NSAzMjAsMjgwIDI0MCwzMjAgMCw4MCIvPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMzAsMjU1IDMyMCw0MCAyNDAsMCAwLDI0MCIvPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMjQwLDAgMzIwLDQwIDMyMCwyODAgMjQwLDMyMCIvPgogICAgPC9nPgo8L3N2Zz4K'
    const imgSrc = `https://img.shields.io/static/v1?style=plastic&logo=${b64VsCodeLogoSvgDataUri}&label=Clone&message=via%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc&cacheSeconds=31536000`;



    let __i = null;
    let __abort = null;
    let __btn = null;
    const fn = ()=>{
        if(__i && !__btn) { // cancel previous
            clearInterval(__i);
            if(__abort) __abort();
        }
        if(__btn) __btn.remove();

        __i = setInterval(()=>{
            const sshURLInput = document.querySelector('#clone-with-ssh');
            if(!sshURLInput || !sshURLInput.offsetParent || (__btn && !__btn.offsetParent)) { // no ssh url visible, or no btn visible. recreate
                if(__btn) {
                    __btn.remove();
                    __btn = null;
                }
                return;
            }
            if(__btn) return;

            const link=sshURLInput.value;
            const linkURLEncoded = encodeURIComponent(link);
            const cloneUL = sshURLInput.parentElement.parentElement.nextSibling;
            const newCloneViaSSHInVscodeBtn = __btn = cloneUL.firstElementChild.cloneNode(1);
            newCloneViaSSHInVscodeBtn.setAttribute('tabindex', '-1');
            newCloneViaSSHInVscodeBtn.addEventListener('click', ()=>{location.href = `vscode://vscode.git/clone?url=${linkURLEncoded}`}); // https://stackoverflow.com/a/54317408/9156059
            newCloneViaSSHInVscodeBtn.firstElementChild.innerHTML = '';
            newCloneViaSSHInVscodeBtn.firstElementChild.nextSibling.innerHTML = '<marquee>...</marquee>';
            cloneUL.prepend(newCloneViaSSHInVscodeBtn);

            const r = GM_xmlhttpRequest({
                method: "GET",
                url: imgSrc,
                headers: {
                    "Accept": "*",
                    "Host": new URL(location).hostname,
                },
                responseType: 'blob',
                redirect: 'follow',
                timeout: 5000,
                anonymous: true, // doesnt send cookies + also enforces fetch() mode
                onerror: err => { throw (new Error(err.message, { cause: err })) },
                ontimeout: err => { throw (new RangeError(`TIMEOUT! 5000ms!`, { cause: err }))},
                onload: (response) => {
                    const blobURL = URL.createObjectURL(response.response, {type: response.response.type});
                    newCloneViaSSHInVscodeBtn.firstElementChild.parentElement.removeChild(newCloneViaSSHInVscodeBtn.firstElementChild);
                    newCloneViaSSHInVscodeBtn.firstElementChild.innerHTML = `<img style="height:20px;width:max-content;" src="${blobURL}">`;
                }
            });
            __abort = r.abort;
        }, 100);
    };

    if (window.onurlchange === null) {
        // feature is supported
        window.removeEventListener('urlchange', fn);
        window.addEventListener('urlchange', fn);
    }



})();
