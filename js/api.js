// Note: Variable and functions names are in Portuguese as the project was initially developed this way.

const api = {
    async carregarMusicas() {
        try {
            const response = await fetch('https://joaopaulom1.github.io/RythMix/database/db.json')
            return await response.json()       
        } catch {
            alert("Error loading music.") 
        }
    }
}

export default api;