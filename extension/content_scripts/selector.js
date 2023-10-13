browser.runtime.onMessage.addListener(mensaje => {
    if (mensaje.accion === "complete") {
        console.log(mensaje)

        // Obtener todos los inputs
        const inputs = document.querySelectorAll('input')

        // Variable para almacenar el id del input de texto anterior
        let prevInputTextId = ''

        // Recorre los inputs
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i]

            // Si el input es un campo de contraseña y hay un input de texto previo
            if (input.type === 'password' && prevInputTextId !== '') {
                console.log('Campo Password encontrado')
                input.value = mensaje.password
                document.getElementById(prevInputTextId).value = mensaje.username

                return true;
            } else if (input.type === 'text') {
                prevInputTextId = input.id
            }
        }
    }
})