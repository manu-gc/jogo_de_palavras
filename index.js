// variáveis que comunicam com a tela
const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')
const dicaDisplay = document.getElementById('dica-display')

const successSound = document.getElementById('sound-success')
const errorSound = document.getElementById('sound-error')

const URL_API = 'https://api-palavras-8ptt.onrender.com'

document
    .getElementById('nickname-input')
    .addEventListener('keypress', iniciarJogo)

document
    .getElementById('letter-input')
    .addEventListener('keypress', tentarLetra)

resetBtn.addEventListener('click', reiniciarJogo)

async function iniciarJogo(event) {

    if (event.key === "Enter") {

        const nickname =
            document
                .getElementById('nickname-input')
                .value
                .trim()

        if (!nickname) {

            alert('Preencha o nickname')
            return
        }

        const response = await fetch(`${URL_API}/iniciar`, {

            method: 'POST',

            credentials: 'include',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nickname: nickname
            })
        })

        const data = await response.json()

        if (data.erro) {

            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText =
            data.mensagem

        buscarPalavra()
    }
}

async function buscarPalavra() {

    const response = await fetch(`${URL_API}/status`, {

        credentials: 'include',

        method: 'GET'
    })

    const data = await response.json()

    wordDisplay.innerHTML = ''

    dicaDisplay.innerHTML =
        `💡 Dica: <strong>${data.dica}</strong>`

    for (let i = 0; i < data.qtde_caracteres; i++) {

        const span = document.createElement('span')

        span.className = 'letter-slot'
        span.id = `slot-${i}`

        wordDisplay.appendChild(span)
    }
}

async function tentarLetra(event) {

    if (event.key === "Enter") {

        const input =
            document.getElementById('letter-input')

        const caractere =
            input.value
                .toLowerCase()
                .trim()

        input.value = ''
        input.focus()

        if (!caractere) {

            alert('Digite um caractere!')
            return
        }

        const response = await fetch(`${URL_API}/tentativa`, {

            method: 'POST',

            credentials: 'include',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                caractere: caractere
            })
        })

        const data = await response.json()

        // acertou letra
        if (data.posicoes.length > 0) {

            successSound.currentTime = 0
            successSound.play()

            data.posicoes.forEach(pos => {

                document
                    .getElementById(`slot-${pos}`)
                    .innerText = caractere.toUpperCase()
            })

        }

        // errou letra
        else {

            errorSound.currentTime = 0
            errorSound.play()

            input.classList.add('error-shake')

            setTimeout(() => {

                input.classList.remove('error-shake')

            }, 300)
        }

        // atualiza erros
        errorCount.innerText =
            data.erros_atuais

        // barra de progresso
        const porcentagem =
            (data.erros_atuais / 4) * 100

        document
            .getElementById('error-progress-fill')
            .style.width = `${porcentagem}%`

        // mensagem
        gameMessage.innerText =
            data.mensagem

        const status =
            data.status_jogo.toLowerCase()

        // terminou o jogo
        if (status !== 'jogando') {

            resetBtn.classList.remove('hidden')

        
            if (
                status === 'vitoria' ||
                status === 'vitória'
            ){

                document.body.classList.remove('lose-state')

                document.body.classList.add('win-state')

                gameMessage.innerHTML =
                    `🎉 ${data.mensagem}`

                gameMessage.style.color =
                    '#2d6a4f'
            }

            // derrota
            else if (status === 'derrota') {

                document.body.classList.remove('win-state')

                document.body.classList.add('lose-state')

                gameMessage.innerHTML =
                    ` ${data.mensagem}
                    <br><br>
                    A palavra era:
                    <strong>${data.palavra}</strong>`

                gameMessage.style.color =
                    '#6d6875'
            }
        }
    }
}

function reiniciarJogo() {

    location.reload()
}