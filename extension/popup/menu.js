const ipInput = document.getElementById("loginIp")
const userInput = document.getElementById("loginUser")
const passInput = document.getElementById("loginPass")
const apiInput = document.getElementById("loginApi")
const copyButton = document.getElementById("copy")

async function isLogged () {
    const gettingUserData = await browser.storage.local.get()
    console.log(gettingUserData.userData)
    let isLogged = gettingUserData.userData ? true : false
    console.log('isLogged', isLogged)

    // Controla si esta logueado o no
    if (!isLogged) { // No esta logueado
        document.getElementById('login-content').style.display = 'block'
        document.getElementById('session-content').style.display = 'none'
    } else { // Si esta logueado
        document.getElementById('login-content').style.display = 'none'
        document.getElementById('session-content').style.display = 'block'
        document.getElementById('session-ip').innerHTML = gettingUserData.userData.ip
        document.getElementById('session-user').innerHTML = gettingUserData.userData.login
        // comprobar si el icono esta verde y dejarlo
        if (!gettingUserData.path === PARAMS.icon_green) {
            browser.runtime.sendMessage({ path: PARAMS.icon_yellow })
        }
        // deshabilitar el boton
        copyButton.disabled = false
        console.log('button', gettingUserData.copyButtonState)
        if (!gettingUserData.copyButtonState) {
            copyButton.disabled = true
            console.log("Deshabilita")
        }
    }
}

function addOnChangeInput () {
    console.log("Cambio")
    ipInput.addEventListener("change", storeInputValue)
    userInput.addEventListener("change", storeInputValue)
    passInput.addEventListener("change", storeInputValue)
    apiInput.addEventListener("change", storeInputValue)
}

function storeInputValue (e) {
    console.log(e.target.id)
    console.log(e.target.value)
    browser.storage.local.set({ [e.target.id]: e.target.value })
}

async function updateInputValues () {
    const gettingSiteData = await browser.storage.local.get()
    ipInput.value = (gettingSiteData.loginIp) ? gettingSiteData.loginIp : ''
    userInput.value = (gettingSiteData.loginUser) ? gettingSiteData.loginUser : ''
    passInput.value = (gettingSiteData.loginPass) ? gettingSiteData.loginPass : ''
    apiInput.value = (gettingSiteData.loginApi) ? gettingSiteData.loginApi : ''
}

function listenForClicks () {
    document.addEventListener('click', (e) => {

        async function login (tabs) {
            let ip = ipInput.value
            let user = userInput.value
            let pass = passInput.value
            let api = apiInput.value

            console.log(user)

            // obj user para guardar en store
            let userData = {
                ip: ip,
                apikey: api,
                login: user,
                password: pass
            }
            // Get Token
            let token = ''
            let objPost = {
                apikey: api,
                login: user,
                password: pass
            }

            await $.ajax({
                url: ip +
                    '/api/index.php/authorize',
                method: 'POST',
                dataType: 'json',
                data: JSON.stringify(objPost),
                success: function (data) {
                    token = data.token
                    browser.storage.local.set({ login: true })
                    browser.storage.local.set({ userData })
                    document.getElementById('login-content').style.display = 'none'
                    document.getElementById('session-content').style.display = 'block'
                    document.getElementById('session-ip').innerHTML = userData.ip
                    document.getElementById('session-user').innerHTML = userData.login
                    browser.runtime.sendMessage({ path: PARAMS.icon_yellow })
                },
                fail: function (e) {
                    alert(e)
                },
            })
            console.log(`token: ${token}`)
        }

        function logout () {
            console.log('LOGOUT')
            browser.storage.local.clear()
            document.getElementById('login-content').style.display = 'block'
            document.getElementById('session-content').style.display = 'none'
            browser.runtime.sendMessage({ path: PARAMS.icon_light })
        }

        async function copy (url) {
            const gettingSiteData = await browser.storage.local.get()
            if (!gettingSiteData.siteData) {
                return
            }
            browser.tabs.sendMessage(url, { accion: 'complete', username: gettingSiteData.siteData.username, password: gettingSiteData.siteData.password })
        }

        function reportError (error) {
            console.error(`Error: ${JSON.stringify(error)}`)
        }

        if (e.target.tagName !== 'BUTTON' || !e.target.closest('#menu-content')) {
            // Ignore when click is not on a button within <div id='menu-content'>.
            return
        }
        if (e.target.id === 'login') {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(login)
                .catch(reportError)
        }
        if (e.target.id === 'logout') {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(logout)
                .catch(reportError)
        }
        if (e.target.id === 'copy') {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(tabs => { copy(tabs[0].id) })
                .catch(reportError)
        }
    })
}

listenForClicks()
isLogged()
addOnChangeInput()
updateInputValues()
