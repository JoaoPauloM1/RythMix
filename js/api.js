const api = {
    async carregarMusicas() {
        try {
            const response = await fetch('http://localhost:3000/musicas')
            return await response.json()       
        } catch {
            alert("Erro ao carregar músicas.") 
        }
    }
}

export default api;