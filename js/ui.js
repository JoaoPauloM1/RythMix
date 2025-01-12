// Note: Variable and functions names are in Portuguese as the project was initially developed this way.

import api from "./api.js"

const ui = {
    musicaAtual: null,
    indiceAtual: 0,
    volumeAnterior: 0.15,
    volumeMutado: false,

    async renderizarMusicas() {
        const divMusicas = document.getElementById("container-musicas")

        try {
            const { musicas } = await api.carregarMusicas();
            divMusicas.innerHTML = ""
            musicas.forEach(musica => {
                divMusicas.innerHTML += `
                    <span data-id="${musica.id}">
                        <img src="img/capa-${musica.id}.png" class="capa-musica">
                        <span class="nome-musica">${musica.nome}</span>
                        <span class="autor-musica">${musica.autor}</span>
                        <span class="duracao-musica">${this.formatarDuracao(musica.duracao)}</span>
                    </span>
                `
            })
            this.musicas = musicas
            this.tocarMusica()
        } catch (error) {
            console.error("Error loading music:", error)
            alert("Error loading music.")
        }
    },

    formatarDuracao(duracao) {
        const minutos = Math.floor(duracao / 60);
        const segundos = Math.floor(duracao % 60);
        return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    },

    tocarMusica() {
        const nomesMusicas = document.querySelectorAll(".nome-musica")
        const capa = document.getElementById("capa")

        if (!capa) {
            console.error("Element with ID 'capa' not found in the DOM.")
            return
        }

        nomesMusicas.forEach((nomeMusica, index) => {
            nomeMusica.addEventListener("click", () => {
                const spanElement = nomeMusica.closest("span[data-id]")
                if (spanElement && spanElement.hasAttribute("data-id")) {
                    const id = spanElement.getAttribute("data-id")
                    this.tocarPorIndice(index, id, capa)
                } else {
                    console.error("Data-id not found or invalid parent element")
                }
            })
        })
    },

    tocarPorIndice(indice, id, capa) {
        if (this.musicaAtual) {
            this.musicaAtual.pause()
            this.musicaAtual.currentTime = 0
        }

        this.indiceAtual = indice
        capa.src = `img/capa-${id}.png`
        this.musicaAtual = new Audio(`musicas/musica-${id}.mp3`)

        const tempoTotalElemento = document.getElementById("tempo-total")
        if (tempoTotalElemento) {
            this.musicaAtual.addEventListener("loadedmetadata", () => {
                tempoTotalElemento.textContent = this.formatarDuracao(this.musicaAtual.duration)
            })
        }

        if (this.volumeMutado) {
            this.musicaAtual.volume = 0
        } else {
            this.musicaAtual.volume = this.volumeAnterior
        }

        this.musicaAtual.play()

        const nomeReproducao = document.querySelector(".nome-reproducao")
        if (nomeReproducao) {
            nomeReproducao.textContent = this.musicas[indice].nome
        }

        const botaoPause = document.getElementById("pause")
        if (botaoPause) botaoPause.src = "img/pause.png"

        const tempoAtualElemento = document.getElementById("tempo-atual")
        if (tempoAtualElemento) {
            this.musicaAtual.addEventListener("timeupdate", () => {
                tempoAtualElemento.textContent = this.formatarDuracao(this.musicaAtual.currentTime)

                const tempoRestante = this.musicaAtual.duration - this.musicaAtual.currentTime
                if (tempoRestante <= 0) return

                const tempoRestanteElemento = document.getElementById("tempo-restante")
                if (tempoRestanteElemento) {
                    tempoRestanteElemento.textContent = `-${this.formatarDuracao(tempoRestante)}`
                }
            })
        }
    },

    tocarProximaMusica() {
        const proximoIndice = (this.indiceAtual + 1) % this.musicas.length
        const musica = this.musicas[proximoIndice]
        this.tocarPorIndice(proximoIndice, musica.id, document.getElementById("capa"))
    },

    tocarMusicaAnterior() {
        const indiceAnterior =
            (this.indiceAtual - 1 + this.musicas.length) % this.musicas.length
        const musica = this.musicas[indiceAnterior]
        this.tocarPorIndice(indiceAnterior, musica.id, document.getElementById("capa"))
    }
}

document.addEventListener("DOMContentLoaded", () => {
    ui.renderizarMusicas()

    const botaoProxima = document.getElementById("next")
    if (botaoProxima) {
        botaoProxima.addEventListener("click", () => {
            ui.tocarProximaMusica()
        })
    }

    const botaoAnterior = document.getElementById("previous")
    if (botaoAnterior) {
        botaoAnterior.addEventListener("click", () => {
            ui.tocarMusicaAnterior()
        })
    }

    const botaoPause = document.getElementById("pause")
    if (botaoPause) {
        botaoPause.addEventListener("click", () => {
            if (ui.musicaAtual) {
                if (ui.musicaAtual.paused) {
                    ui.musicaAtual.play()
                    botaoPause.src = "img/pause.png"
                } else {
                    ui.musicaAtual.pause()
                    botaoPause.src = "img/play.png"
                }
            }
        })
    }

    const botaoMutar = document.getElementById("botao-mutar")
    if (botaoMutar) {
        botaoMutar.addEventListener("click", () => {
            if (ui.musicaAtual) {
                if (ui.musicaAtual.volume > 0) {
                    ui.volumeAnterior = ui.musicaAtual.volume
                    ui.musicaAtual.volume = 0
                    ui.volumeMutado = true
                    botaoMutar.src = "img/mutado.png"
                } else {
                    const volumePadrao = 0.15
                    ui.musicaAtual.volume = volumePadrao
                    ui.volumeAnterior = volumePadrao
                    ui.volumeMutado = false
                    botaoMutar.src = "img/volume.png"
                    console.log(`Volume restored to default: ${Math.round(volumePadrao * 100)}%`)
                }
            }
        })
    }

    // Botão Aumentar Volume
    const botaoAumentar = document.getElementById("botao-aumentar")
    if (botaoAumentar) {
        botaoAumentar.addEventListener("click", () => {
            if (ui.musicaAtual) {
                const novoVolume = Math.min(ui.musicaAtual.volume + 0.05, 1);
                ui.musicaAtual.volume = novoVolume
                if (novoVolume > 0) {
                    ui.volumeMutado = false
                    botaoMutar.src = "img/volume.png"
                }
                ui.volumeAnterior = novoVolume
                console.log(`Volume increased to: ${Math.round(novoVolume * 100)}%`)
            }
        })
    }

    // Botão Diminuir Volume
    const botaoDiminuir = document.getElementById("botao-diminuir")
    if (botaoDiminuir) {
        botaoDiminuir.addEventListener("click", () => {
            if (ui.musicaAtual) {
                const novoVolume = Math.max(ui.musicaAtual.volume - 0.05, 0);
                ui.musicaAtual.volume = novoVolume
                if (novoVolume === 0) {
                    ui.volumeMutado = true
                    botaoMutar.src = "img/mutado.png"
                } else {
                    ui.volumeMutado = false
                    botaoMutar.src = "img/volume.png"
                }
                ui.volumeAnterior = novoVolume
                console.log(`Volume decreased to: ${Math.round(novoVolume * 100)}%`)
            }
        })
    }
})
