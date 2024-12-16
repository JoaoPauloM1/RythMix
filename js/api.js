const api = {
    async carregarMusicas() {
        try {
            const response = await fetch('https://joaopaulom1.github.io/RythMix/database/db.json')
            return await response.json()       
        } catch {
            alert("Erro ao carregar músicas.") 
        }
    }
}

export default api;