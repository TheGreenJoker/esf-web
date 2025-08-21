// Fonction fetch avec timeout de 10 secondes
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
    });
    
    clearTimeout(id);
    return response;
}

// Formatage du niveau de sécurité
function formatSecurity(security) {
    const securityValue = parseFloat(security);
    
    if (securityValue >= 0.5) {
        return {
            badgeClass: 'bg-green-800 text-green-200',
            label: 'High Sec',
            meterColor: '#48bb78'
        };
    } else if (securityValue >= 0.0) {
        return {
            badgeClass: 'bg-yellow-800 text-yellow-200',
            label: 'Low Sec',
            meterColor: '#f6ad55'
        };
    } else {
        return {
            badgeClass: 'bg-red-800 text-red-200',
            label: 'Null Sec',
            meterColor: '#f56565'
        };
    }
}

// Fonction pour mettre à jour les barres d'activité
function updateActivityBar(score, elementId) {
    const container = document.getElementById(elementId);
    const segments = container.querySelectorAll('.activity-segment');
    const valueSpan = container.querySelector('.activity-value');
    
    // Réinitialiser tous les segments
    segments.forEach(seg => {
        seg.className = 'activity-segment inactive-segment';
    });
    
    // Mettre à jour les segments actifs avec la couleur appropriée
    for (let i = 0; i < score; i++) {
        if (segments[i]) {
            if (score <= 1) segments[i].classList.add('active-segment-1');
            else if (score <= 2) segments[i].classList.add('active-segment-2');
            else segments[i].classList.add(`active-segment-${i + 1}`);
        }
    }
    
    // Mettre à jour le texte du score
    valueSpan.textContent = `${score}/5`;
}

// Dans la fonction displaySystemData
function displaySystemData(data) {
    // Header
    document.getElementById('system-name-header').textContent = data.system_name;
    document.getElementById('system-id').textContent = data.system_id;
    document.getElementById('region').textContent = data.region;
    
    // Sécurité
    const security = formatSecurity(data.security);
    document.getElementById('security').textContent = data.security.toFixed(1);
    document.getElementById('security').className = `ml-1 font-medium px-2 py-1 rounded-full ${security.badgeClass}`;
    document.getElementById('security-value').textContent = data.security.toFixed(1);
    document.getElementById('security-label').textContent = security.label;
    document.getElementById('security-meter').style.stroke = security.meterColor;
    
    // Pourcentage de sécurité
    const securityPercentage = Math.min(Math.max(data.security, 0), 1) * 100;
    const dashOffset = 100 - securityPercentage;
    document.getElementById('security-meter').style.strokeDashoffset = dashOffset;
    
    // Stations
    const stationsInfo = document.getElementById('stations-info');
    if (data.stations && data.stations.length > 0) {
        stationsInfo.innerHTML = data.stations.map(station => `
            <div class="resource-item px-4 py-2 rounded bg-gray-800">
                <div class="font-medium">${station.owner}</div>
                <div class="text-sm text-gray-400">${station.type}</div>
            </div>
        `).join('');
    } else {
        stationsInfo.innerHTML = '<div class="text-center py-4 text-yellow-500">No station (login to see structure like fortizar)</div>';
    }
    
    // Zone
    document.getElementById('zone-type').textContent = data.zone_type || 'N/A';
    document.getElementById('constellation').textContent = data.constellation || 'N/A';
    document.getElementById('region2').textContent = data.region || 'N/A';
    
    // Asteroid Belts
    const beltsContainer = document.getElementById('asteroid-belts');
    if (data.resources && data.resources[0].length > 0) {
        beltsContainer.innerHTML = data.resources[0].map(belt => `
            <div class="resource-item px-4 py-2 rounded bg-gray-800">
                <span class="font-medium">${belt}</span>
            </div>
        `).join('');
    } else {
        beltsContainer.innerHTML = '<div class="text-center py-4 text-yellow-500">No belt in this system</div>';
    }
    
    // Minerals
    const mineralsContainer = document.getElementById('minerals-list');
    if (data.resources && data.resources[1] && data.resources[1][0]) {
        mineralsContainer.innerHTML = data.resources[1][0].map(mineral => `
            <span class="px-3 py-1 bg-gray-700 rounded-full text-sm">${mineral}</span>
        `).join('');
    } else {
        mineralsContainer.innerHTML = '<div class="text-sm text-yellow-500">No minerals</div>';
    }
    
    // Kills
    if (data.kills) {
        document.getElementById('npc-kills').textContent = data.kills.npc_kills || '0';
        document.getElementById('ship-kills').textContent = data.kills.ship_kills || '0';
    }
    
    // Top Kills
    const topKillsContainer = document.getElementById('top-kills');
    if (data.top_kills && data.top_kills.length > 0) {
        topKillsContainer.innerHTML = data.top_kills.map(kill => `
            <div class="kill-item px-4 py-2 rounded bg-gray-800">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium">Victim: <a href="${kill.url}" class="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">${kill.victim}</a></div>
                        <div class="text-sm text-gray-400">Main Attacker: ${kill.main_attacker}</div>
                    </div>
                    <div class="text-sm text-gray-500">${kill.time}</div>
                </div>
            </div>
        `).join('');
    } else {
        topKillsContainer.innerHTML = '<div class="text-center py-4 text-yellow-500">Aucun kill récent</div>';
    }

    // Activity Scores
    if (data.recomendations && data.recomendations.length === 4) {
        const [miningScore, explorationScore, pvpScore, pveScore] = data.recomendations;

        updateActivityBar(miningScore, 'mining-activity');
        updateActivityBar(explorationScore, 'exploration-activity');
        updateActivityBar(pvpScore, 'pvp-activity');
        updateActivityBar(pveScore, 'pve-activity');
    }

    // Afficher le contenu
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

// Gestion des erreurs
function displayError(message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-state').style.display = 'block';
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const systemName = urlParams.get('system_name');
    
    if (!systemName) {
        return displayError('No system specified in the url');
    }
    
    try {
        const response = await fetchWithTimeout(`https://esf-syk8.onrender.com/system/${systemName}`, { timeout: 40000 });
        
        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const data = await response.json();
        displaySystemData(data);
        
    } catch (error) {
        let errorMessage = "Erreur lors du chargement des données";
        
        if (error.name === "AbortError") {
            errorMessage = "Time Out";
        } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "Server Down, Come Back Later (sorry)";
        } else {
            errorMessage = error.message;
        }
        
        displayError(errorMessage);
    }
});