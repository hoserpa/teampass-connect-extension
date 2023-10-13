async function comprobateSite (url) {
    console.log(`Protocol: ${url.split(':')[0]}`)
    console.log(`URL: ${url.split('/')[2]}`)

    const url_site = url.split('/')[2]

    const gettingUserData = await browser.storage.local.get()
    console.log(gettingUserData.userData)
    let isLogged = gettingUserData.userData ? true : false

    if (!isLogged) {
        return
    }

    // Get Token
    let token = ''

    let ip = gettingUserData.userData.ip

    let objPost = {
        apikey: gettingUserData.userData.apikey,
        login: gettingUserData.userData.login,
        password: gettingUserData.userData.password
    }

    await $.ajax({
        url: ip +
            '/api/index.php/authorize',
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(objPost),
        success: function (data) {
            token = data.token
        },

        fail: function (e) {
            alert(e)
        },
    })

    console.log(`token: ${token}`)

    // Get item
    await $.ajax({
        url: ip +
            '/api/index.php/item/get?url=' + url_site,
        method: 'GET',
        dataType: 'json',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (data) {
            console.log(data)
            if (Array.isArray(data) && !data.length) {
                changeIcon(PARAMS.icon_yellow)
                browser.storage.local.remove("siteData")
                browser.storage.local.set({ copyButtonState: false })
                return
            }

            const siteData = {
                username: data[0].login,
                password: data[0].pwd
            }
            console.log(siteData)
            browser.storage.local.set({ siteData })

            changeIcon(PARAMS.icon_green)
            browser.storage.local.set({ copyButtonState: true })
        },

        fail: function (e) {
            console.error(e)
        },
    })
}

function changeIcon (path) {
    browser.storage.local.set({ icon: path })
    browser.browserAction.setIcon({ path: { 32: path } })
}

browser.runtime.onMessage.addListener(function (message) {
    if (message.path) {
        changeIcon(message.path)
    }
})

// Verifica si se ha cambiado de pestaña
browser.tabs.onActivated.addListener(function (activeInfo) {
    let tabId = activeInfo.tabId

    browser.tabs.get(tabId, function (tab) {
        let url = tab.url

        changeIcon(PARAMS.icon_yellow)
        comprobateSite(url)
    })
})

// Verifica si se ha cargado completamente una nueva página
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && changeInfo.url) {
        let url = tab.url

        changeIcon(PARAMS.icon_yellow)
        comprobateSite(url)
    }
})
